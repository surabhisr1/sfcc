/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/**
 * @module progressive-web-sdk/dist/utils/ssr-cache-utils
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const util = require('util')

const rimraf = require('rimraf')

// Promisified fs functions
const writeFileAsync = util.promisify(fs.writeFile)
const readFileAsync = util.promisify(fs.readFile)
const unlinkAsync = util.promisify(fs.unlink)

const nodeRequire = eval('require')

const ENOENT = 'ENOENT'

// If we're configured to use S3, we require() the AWS sdk on-demand.
let AWS

// mS in one year
const ONE_YEAR = 365 * 24 * 3600 * 1000

/**
 * A cache implementation.
 *
 * See the get, put and delete methods for more details.
 */
export class PersistentCache {
    /**
     * Initialize this cache module.
     *
     * Project code should never need to call this. The SSR Server
     * provides an instance of this class.
     *
     * @param useLocalCache {Boolean} - true to use a local disk cache,
     * false to use a remote (S3) cache. A deployed SSR Server will use
     * the remote S3 cache. The local development server will use the
     * local disk cache.
     * @param [bucket] {String} - for a remote cache, the name of the S3
     * bucket to use.
     * @param [prefix] {String} - for a remote cache, a prefix for the
     * cache, within the S3 bucket.
     * @param [s3Endpoint] {String} - for a remote cache, the S3 endpoint
     * to use (allows for testing).
     * @param [accessKeyId] {String} - for testing, override AWS access key id
     * @param [secretAccessKey] {String} - for testing, override AWS
     * secret key
     * @param [sendMetric] {Function} - required function which will be
     * called with performance metrics generated by the PersistentCache
     * sendMetric takes a function with signature:
     *     (name: String, value: Number, unit: String,
     *         dimensions: Object) => undefined
     */
    constructor({
        useLocalCache,
        bucket,
        prefix,
        s3Endpoint,
        accessKeyId,
        secretAccessKey,
        sendMetric
    }) {
        this._local = useLocalCache

        if (typeof sendMetric !== 'function') {
            throw new Error('sendMetric function must be defined')
        }
        this._sendMetric = sendMetric

        // In order to prevent a very unlikely possibility that the
        // cache delete operation is resolved after the cache put operation.
        // We store the cache delete promise and call it in cacheResponseWhenDone
        // to make sure we never accidentially put cache and then delete the cache
        this._cacheDeletePromise = Promise.resolve()

        if (useLocalCache) {
            this._internalCachePath = null
            this._functional = true
            // On the first creation of a local cache, we cleanup
            // any stale cache directories
            if (!PersistentCache.cleanupDone) {
                PersistentCache.cleanupDone = true
                PersistentCache._cleanupOnEntry()
            }
        } else {
            // We require the bucket parameter. If it's not present then
            // this cache will be non-functional: gets will always return
            // not-found, puts and deletes will do nothing.
            this._functional = !!bucket
            if (this._functional) {
                /* istanbul ignore else */
                if (!AWS) {
                    // Dynamically load the AWS SDK. Because this is a dynamic
                    // require, webpack will not include the AWS SDK in a built
                    // SSR Server file, which reduces the file size. The SDK
                    // is provided in a Lambda environment.
                    AWS = nodeRequire('aws-sdk')
                }
                const s3Params = {
                    // We support extra debug logging from S3 access via the
                    // CACHE_LOGGING environment variable.
                    logger: process.env.CACHE_LOGGING
                        ? /* istanbul ignore next */ console
                        : undefined,
                    region: process.env.AWS_REGION,
                    endpoint: s3Endpoint,
                    credentials: accessKeyId
                        ? new AWS.Credentials(accessKeyId, secretAccessKey)
                        : /* istanbul ignore next */
                          undefined
                }
                this._s3 = new AWS.S3(s3Params)
                this._bucket = bucket
                this._prefix = prefix || ''
            }
        }
    }

    /**
     * Scan the temporary directory for persistent cache directories.
     * For each one we find, check if the owner process is running. If
     * not, remove the directory.
     * This is only used for local caching.
     * @returns {Promise}
     * @private
     */
    static _cleanupOnEntry() {
        return new Promise((resolve, reject) => {
            const myPID = process.pid
            const nameRE = /^ssr-cache-(\d+)-.*$/
            const tmp = os.tmpdir()
            // Scan the temporary directory
            fs.readdir(tmp, (err, entries) => {
                /* istanbul ignore next */
                if (err) {
                    console.warning(`Could not check for stale cache directories: ${err}`)
                    reject(err)
                }
                entries
                    // Test each entry with the regex
                    .map((entry) => nameRE.exec(entry))
                    // Filter out any non-matches
                    .filter((entry) => !!entry)
                    // Check each match
                    .forEach((entry) => {
                        const pid = Number.parseInt(entry[1])
                        if (pid !== myPID) {
                            // See if the process is running. If not,
                            // we'll clean up this directory
                            try {
                                process.kill(pid, 0)
                            } catch (err) {
                                /* istanbul ignore else */
                                if (err.code === 'ESRCH') {
                                    // The process does not exist; clean up
                                    rimraf.sync(path.join(tmp, entry[0]))
                                } else {
                                    /* istanbul ignore next */
                                    reject(err)
                                }
                            }
                        }
                    })

                resolve()
            })
        })
    }

    /**
     * Cleanup handler for local cache directory
     * @private
     */
    _localCacheCleanup() {
        if (this._internalCachePath) {
            rimraf.sync(this._internalCachePath)
            this._internalCachePath = null
        }
    }

    /**
     * Given a process pid, return an absolute base cache path for it, in a form
     * suitable for passing to fs.mkdtemp
     * Exposed for testing.
     * @param pid {Number}
     * @returns {String}
     * @private
     */
    static _cachePathForPID(pid) {
        // The name format used here must match the RE used in
        // the _cleanupOnEntry method above.
        return `${os.tmpdir()}${path.sep}ssr-cache-${pid}-`
    }

    /**
     * Return the local cache path. If there is no local cache directory,
     * create and and return the path.
     *
     * This method will also arrange for the cache directory to be
     * cleaned up on process exit.
     *
     * @returns {String} the cache path, ending in '/'
     * @private
     */
    get _cachePath() {
        if (!this._internalCachePath) {
            const cacheDir = fs.mkdtempSync(PersistentCache._cachePathForPID(process.pid))
            this._internalCachePath = `${cacheDir}${path.sep}`
        }

        return this._internalCachePath
    }

    /**
     * Provided for testing purposes. Calling close() will
     * clean up any locally cached data.
     * @private
     */
    close() {
        this._localCacheCleanup()
    }

    /**
     * Given a key and a namespace, convert them to safe forms. We do
     * this because there are restrictions on the characters that can make up
     * namespaces and keys, and those restrictions are different between local
     * and remote cache implementations. Converting the strings to safe forms
     * means that any characters can be used in keys, without the caller
     * having to care about restrictions.
     *
     * The key is composed by a path and a hashed object name, because we need
     * to hash the query strings to prevent unexpected characters in file path.
     * The namespace is made safe for use as a directory name. If the
     * namespace is falsy (the default), it's returned as an empty
     * string. If it is non-falsy, it's returned with a trailing slash
     * so that it can be used as a directory name.
     *
     * @param key {String} the cache key
     * @param namespace {String|Array<String>} the cache namespace
     * @returns {Object} with safeKey and safeNamespace properties
     * @returns {Object} result the processed values
     * @returns {string} result.safeKey the key (which is a hash of the input)
     * @returns {string} result.safeNamespace the namespace as a path string,
     * ending in a slash
     * @returns {string} result.separator the path separator value ('/' for
     * posix, '\' for Windows)
     * @returns {string} result.s3Key the full S3 Key value (including the
     * namespace and any S3 prefix)
     * @returns {string} result.s3DataKey the full S3 key for the data part
     * of the cache entry
     * @returns {string} result.s3MetadataKey the full S3 key for the metadata
     * part of the cache entry
     * @private
     */
    _sanitize(key, namespace) {
        let safeNamespace

        // Use the correct separator to join elements into a path
        const separator = this._local ? path.sep : '/'

        const keyElements = key.split('/')
        // safeKey is the last part of generated cache key
        // it is the hashed value
        const safeKey = keyElements.pop()

        // For each element of the namespace, convert slashes, whitespace,
        // asterisks to underscore, then join the namespace elements.
        const workingNamespace = []

        // Include any prefix as the leading path element. This is only
        // relevant for S3.
        if (this._prefix) {
            workingNamespace.push(this._prefix)
        }

        if (typeof namespace === 'string') {
            workingNamespace.push(namespace)
        } else if (namespace != null) {
            workingNamespace.push(...namespace)
        }

        workingNamespace.push(...keyElements)

        const cleanupRE = /[\s/*\\]/gi
        // Build safeNamespace as a path, ending in a path separator, so that
        // it will work as both a local and S3 directory path. Any falsy
        // elements in the namespace Array are ignored..
        safeNamespace =
            workingNamespace
                // Remove empty or undefined elements
                .filter((element) => !!element)
                // Clean up element characters
                .map((element) => element.replace(cleanupRE, '_').trim())
                // Join together as a directory path, ending with a slash
                .join(separator) + separator

        const s3Key = safeNamespace === '/' ? safeKey : safeNamespace + safeKey

        return {
            safeKey,
            safeNamespace,
            // Provided for testing
            separator,
            // S3-specific
            s3Key,
            s3DataKey: `${s3Key}.data`,
            s3MetadataKey: `${s3Key}.metadata`
        }
    }

    /**
     * Return an object that represents an entry not found in the cache
     * @param key
     * @param namespace {String|Array<String>}
     * @returns {Object}
     * @private
     */
    _notFound(key, namespace) {
        return {
            key,
            namespace,
            found: false,
            metadata: undefined,
            data: undefined
        }
    }

    /**
     * Local cache getter
     *
     * @param key {String} the cache key
     * @param namespace {String|Array<String>} the cache namespace
     * @private
     */
    _localGetter(key, namespace) {
        const {safeKey, safeNamespace} = this._sanitize(key, namespace)
        const filePath = path.join(this._cachePath, safeNamespace, safeKey)

        return readFileAsync(filePath, this._fileOptions)
            .then((fileData) => {
                // Filedata is a Buffer at this point.
                const metaDataLength = fileData.readUInt16LE(0)
                const metadata = JSON.parse(fileData.slice(2, metaDataLength + 2).toString())
                const data = fileData.slice(metaDataLength + 2)
                return {
                    metadata,
                    data: data.length ? data : undefined
                }
            })
            .catch((err) => {
                /* istanbul ignore else */
                if (err.code === ENOENT) {
                    return null
                } else {
                    /* istanbul ignore next */
                    throw err
                }
            })
            .then((cacheData) => {
                if (!cacheData) {
                    return this._notFound(key, namespace)
                }

                const {data, metadata} = cacheData

                // Check for expiration.
                const expiration = metadata.expiration
                if (expiration < Date.now()) {
                    console.log(`
                    Application Cache ${metadata.key} expired, deleting cache object.
                    `)
                    this._cacheDeletePromise = this._localDeleter(key, namespace)
                    return this._notFound(key, namespace)
                }

                // If isJSON is set, deserialize the data (which is a Buffer),
                // otherwise return it as a Buffer.
                return {
                    key: metadata.key,
                    namespace: metadata.namespace,
                    found: true,
                    metadata: metadata.metadata,
                    data: data && metadata.isJSON ? JSON.parse(data.toString()) : data,
                    expiration
                }
            })
    }

    /**
     * Wrapper for s3.getObject that returns a Promise. If the operation
     * rejects, the rejection is caught and logged, and null is returned.
     *
     * @param params {Object} S3 getObject params
     * @returns Promise
     * @private
     */
    _s3SafeGet(params) {
        return this._s3
            .getObject(params)
            .promise()
            .catch((err) => {
                // We don't expect errors, so we'll log
                /* istanbul ignore next */
                if (err.code !== 'NoSuchKey') {
                    console.log(
                        `Unexpected error ${err} from s3.getObject for ${JSON.stringify(params)}`
                    )
                }
                return null
            })
    }

    /**
     * Remote cache getter
     *
     * @param key {String} the cache key
     * @param namespace {String} the cache namespace
     * @private
     */
    _remoteGetter(key, namespace) {
        const {s3DataKey, s3MetadataKey} = this._sanitize(key, namespace)

        const dataGetParams = {
            Bucket: this._bucket,
            Key: s3DataKey
        }
        const metadataGetParams = {
            Bucket: this._bucket,
            Key: s3MetadataKey
        }

        // Fetch both parts of the entry in parallel
        return Promise.all([this._s3SafeGet(dataGetParams), this._s3SafeGet(metadataGetParams)])
            .then(([dataResult, metadataResult]) => {
                // If either object was not read, we consider
                // that we did not find an entry.
                if (!dataResult || !metadataResult) {
                    return this._notFound(key, namespace)
                }

                const objectMetadata = JSON.parse(metadataResult.Body.toString())

                // S3 package does not implement automatic expiration,
                // so we store the expiration timestamp in the
                // objectMetadata and test it here.
                const expiration = objectMetadata.expiration
                if (expiration && expiration < Date.now()) {
                    console.log(`
                    Application Cache ${objectMetadata.key} expired, deleting cache object.
                    `)
                    this._cacheDeletePromise = this._remoteDeleter(key, namespace)
                    return this._notFound(key, namespace)
                }

                // If isJSON is set, deserialize the data (which is a Buffer),
                // otherwise return it as a Buffer.
                let data = dataResult.Body
                if (objectMetadata.bodyIsEmpty) {
                    data = undefined
                } else if (objectMetadata.isJSON) {
                    data = JSON.parse(data.toString())
                }

                return {
                    data,
                    expiration,
                    key: objectMetadata.key,
                    namespace: objectMetadata.namespace,
                    metadata: objectMetadata.metadata,
                    found: true
                }
            })
            .catch((err) => /* istanbul ignore next */ {
                console.log(`Unexpected error ${err} processing cache entry`)
                return this._notFound(key, namespace)
            })
    }

    /**
     * Internal implementation of get function.
     *
     * Function is separated into its own function so that
     * execution time can be measured for metric purposes
     *
     * @param [namespace] {String|Array<String>} the cache namespace
     * @param key {String} the cache key
     * @returns {Promise<*>} A Promise that will resolve to the
     * cache result, or null if there is no match in the cache.
     * @private
     */
    _internalGet({key, namespace}) {
        if (this._functional) {
            return this._local
                ? this._localGetter(key, namespace)
                : this._remoteGetter(key, namespace)
        } else {
            return Promise.resolve(this._notFound(key, namespace))
        }
    }

    /**
     * Get a JavaScript object from the cache.
     *
     * The returned Promise will resolve either to null if there is no
     * match in the cache, or to an object with the following
     * properties: 'found' is a boolean that is true if the item was found
     * in the cache, 'false' if not, 'data' is the data for the object
     * (or undefined if the object was not found), 'metadata' is the metadata
     * object passed to put() (or undefined if the object was not found),
     * 'expiration' is a JS date/timestamp representing the time at which the
     * item will expire from the cache, 'key' is the item's cache
     * key, and 'namespace' is the item's cache namespace.
     *
     * If the value passed to 'put' was a Buffer, then 'data' will
     * be a Buffer. If the value passed to 'put' was anything else,
     * it will have been deserialized from JSON, and will be whatever
     * type was originally passed in.
     *
     * If an object is in the cache under the given key, each call to this
     * method will return a separate copy of the object.
     *
     * If the object is NOT in the cache, this method will return an object
     * with 'found' set to false. This allows a then() handler to use object
     * deconstruction on the result.
     *
     * Within the cache, items under the same key but in different namespaces
     * are distinct. The default namespace is undefined.
     *
     * @param [namespace] {String|Array<String>} the cache namespace
     * @param key {String} the cache key
     * @returns {Promise<*>} A Promise that will resolve to the
     * cache result, or null if there is no match in the cache.
     */
    get({key, namespace}) {
        const _metricName = (entry) => {
            return entry.found
                ? 'ApplicationCacheRetrievalTimeHit'
                : 'ApplicationCacheRetrievalTimeMiss'
        }

        return this._calculateExecutionMetrics(
            this._internalGet.bind(this, {key, namespace}),
            _metricName
        ).then((entry) => {
            this._sendMetric('ApplicationCacheHitOccurred', entry.found ? 1 : 0, 'None')
            return entry
        })
    }

    /**
     * Local cache setter
     *
     * @param key {String} cache key
     * @param namespace {String} the cache namespace
     * @param data {Buffer} data to be cached
     * @param [metadata] {Object} metadata for the cache entry
     * @param expiration {Number} expiration time as a JS date/timestamp
     * @param isJSON {Boolean} true if data is serialized JSON
     * @private
     */
    _localSetter(key, namespace, data, metadata, expiration, isJSON) {
        const {safeKey, safeNamespace, separator} = this._sanitize(key, namespace)

        const metaDataAsBuffer = Buffer.from(
            JSON.stringify({expiration, isJSON, key, namespace, metadata})
        )
        const metaDataLength = Buffer.alloc(2)
        metaDataLength.writeUInt16LE(metaDataAsBuffer.length, 0)

        const toCache = [metaDataLength, metaDataAsBuffer]
        // Track the total length of the buffers; this halves the time needed
        // to perform Buffer.concat below.
        let totalLength = metaDataLength.length + metaDataAsBuffer.length
        if (data) {
            toCache.push(data)
            totalLength += data.length
        }

        const fileData = Buffer.concat(toCache, totalLength)

        // Verify that the full path exists, creating it if
        // it doesn't.
        const dirPath = safeNamespace.split(separator).reduce((currentPath, element) => {
            currentPath = path.join(currentPath, element)
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath)
            }
            return currentPath
        }, this._cachePath)
        const filePath = path.join(dirPath, safeKey)

        return writeFileAsync(filePath, fileData)
    }

    /**
     * Remote cache setter
     *
     * @param key {String} cache key
     * @param namespace {String} the cache namespace
     * @param data {Buffer} data to be cached
     * @param [metadata] {Object} any metadata to be stored with the
     * cache entry
     * @param expiration {Number} expiration time as a JS date/timestamp
     * @param isJSON {Boolean} true if data is serialized JSON
     * @private
     */
    _remoteSetter(key, namespace, data, metadata, expiration, isJSON) {
        const {s3DataKey, s3MetadataKey} = this._sanitize(key, namespace)
        const bodyIsEmpty = !data

        /*
         A brief explanation of metadata.
         The 'metadata' parameter to this function is an (optional)
         JSON-serializable object that the caller wants to be stored
         along with the data.
         The 'objectMetadata' constructed below is the metadata that the
         PersistentCache class needs to store along with the data. It
         contains the 'metadata'.
         Although S3 supports per-object metadata, it's quite severely
         limited. Because it's intended to support adding headers to S3
         objects served over HTTP, there are tight constraints on the
         characters allowed. Also, once metadata has been set for an
         object, it can't be updated (the object must be copied and the
         old object deleted). We therefore store the metadata in a
         separate S3 object alongside the data.
         */
        const objectMetadata = {
            isJSON,
            expiration,
            key,
            namespace,
            metadata,
            bodyIsEmpty
        }
        const expirationAsDate = new Date(expiration)
        const dataPutParams = {
            Bucket: this._bucket,
            Key: s3DataKey,
            // We cannot store an undefined body, we must pass
            // some value.
            Body: bodyIsEmpty ? '' : data,
            Expires: expirationAsDate
        }
        const metadataPutParams = {
            Bucket: this._bucket,
            Key: s3MetadataKey,
            // We stringify the metadata so that it's more human-
            // readable, to aid debugging.
            Body: JSON.stringify(objectMetadata, null, 2),
            Expires: expirationAsDate
        }

        // We do both PUT operations in parallel. If either fails,
        // the Promise.all will reject, which might leave one object
        // written but the other one missing. Both need to exist
        // for the cache entry to be found by the _remoteGetter.
        return Promise.all([
            this._s3.putObject(dataPutParams).promise(),
            this._s3.putObject(metadataPutParams).promise()
        ])
    }

    /**
     * Internal implementation of put function.
     *
     * Function is separated into its own function so that
     * execution time can be measured for metric purposes
     *
     * @param key {String} the cache key.
     * @param [namespace] {String|Array<String>} the cache namespace
     * @param data {Buffer|*} the data to be stored.
     * @param [metadata] {Object} a simple JS object with keys and values
     * for metadata. This object MUST be JSON-seralizable.
     * @param [expiration] {Number} the expiration date/time for the data,
     * as a JS date/timestamp (the result of Date.getTime). If the expiration
     * is less than PersistentCache.DELTA_THRESHOLD (midnight on January 1st, 1980)
     * it is interpreted as a delta number of mS to be added to the current time.
     * This allows for deltas up to ten years.
     * @returns {Promise<*>} resolves when data has been stored, or rejects
     * on an error
     * @private
     */
    _internalPut({key, namespace, data, metadata, expiration}) {
        if (!this._functional) {
            return Promise.resolve()
        }

        let workingData = data
        let isJSON = false

        // Serialize anything that isn't a Buffer
        if (data && !(data instanceof Buffer)) {
            workingData = Buffer.from(JSON.stringify(data))
            isJSON = true
        }

        // If there is no expiration, set it one year into the future
        let workingExpiration = expiration || ONE_YEAR
        // If the expiration value is less than DELTA_THRESHOLD,
        // consider it as a delta, otherwise consider it absolute.
        const expirationTimestamp =
            workingExpiration < PersistentCache.DELTA_THRESHOLD
                ? Date.now() + workingExpiration
                : workingExpiration

        return this._local
            ? this._localSetter(key, namespace, workingData, metadata, expirationTimestamp, isJSON)
            : this._remoteSetter(key, namespace, workingData, metadata, expirationTimestamp, isJSON)
    }

    /**
     * Store a JavaScript object in the cache.
     *
     * If the data to be stored is a Buffer, it's stored as-is. If
     * it's any other type, it's serialized to JSON and the JSON is
     * stored. If the data is not JSON-serializable, then this method
     * will throw an error.
     *
     * A primary use-case for this cache is storing HTTP responses,
     * which include a status code, headers and a body. The body is
     * typically most efficiently stored as a Buffer. Passing an object
     * to 'data' that has a Buffer value will result in the Buffer being
     * JSON-encoded, which is slow and takes up much more space than the
     * origin data. The recommended way to store a response is to include
     * the status and headers in the item's metadata, and to pass the body
     * as a Buffer.
     *
     * If an expiration date/timestamp is given, the data will expire
     * from the cache at that time. If no date/timestamp is given,
     * the default expiration is one year from the time that the data is
     * stored.
     *
     * Within the cache, items under the same key but in different namespaces
     * are distinct. The default namespace is undefined.
     *
     * If put() is called to store metdata but no data, you should pass
     * undefined for 'data'.
     *
     * @param key {String} the cache key.
     * @param [namespace] {String|Array<String>} the cache namespace
     * @param data {Buffer|*} the data to be stored.
     * @param [metadata] {Object} a simple JS object with keys and values
     * for metadata. This object MUST be JSON-seralizable.
     * @param [expiration] {Number} the expiration date/time for the data,
     * as a JS date/timestamp (the result of Date.getTime). If the expiration
     * is less than PersistentCache.DELTA_THRESHOLD (midnight on January 1st, 1980)
     * it is interpreted as a delta number of mS to be added to the current time.
     * This allows for deltas up to ten years.
     * @returns {Promise<*>} resolves when data has been stored, or rejects
     * on an error
     */
    put({key, namespace, data, metadata, expiration}) {
        return this._calculateExecutionMetrics(
            this._internalPut.bind(this, {key, namespace, data, metadata, expiration}),
            () => 'ApplicationCacheStorageTime'
        )
    }

    /**
     * Local cache deleter
     *
     * @private
     */
    _localDeleter(key, namespace) {
        const {safeKey, safeNamespace} = this._sanitize(key, namespace)
        const filePath = path.join(this._cachePath, safeNamespace, safeKey)

        return unlinkAsync(filePath).catch((err) => {
            /* istanbul ignore else */
            if (err.code === ENOENT) {
                return null
            }
            /* istanbul ignore next */
            throw err
        })
    }

    _remoteDeleter(key, namespace) {
        const {s3DataKey, s3MetadataKey} = this._sanitize(key, namespace)

        const dataDeleteParams = {
            Bucket: this._bucket,
            Key: s3DataKey
        }
        const metadataDeleteParams = {
            Bucket: this._bucket,
            Key: s3MetadataKey
        }

        // Delete both objects in parallel
        return Promise.all([
            this._s3.deleteObject(dataDeleteParams).promise(),
            this._s3.deleteObject(metadataDeleteParams).promise()
        ]).catch((err) => {
            // We do not expect to get errors, so we log. Note
            // that we cannot tell which of the promises rejected.
            /* istanbul ignore next */
            if (err.code !== 'NoSuchKey') {
                console.log(`Unexpected error ${err} from s3.deleteObject`)
            }
        })
    }

    /**
     * Remove a single entry from the cache.
     * @param key {String} the cache key
     * @param [namespace] {String|Array<String>} the cache namespace
     * @returns {Promise.<*>} resolves when delete is complete
     */
    delete({key, namespace}) {
        if (!this._functional) {
            return Promise.resolve()
        }

        return this._local
            ? this._localDeleter(key, namespace)
            : this._remoteDeleter(key, namespace)
    }

    _calculateExecutionMetrics(functionToTimeExecution, metricNameFunc) {
        const putTimeStart = new Date()

        return functionToTimeExecution().then((returnObject) => {
            this._sendMetric(
                metricNameFunc(returnObject),
                new Date() - putTimeStart,
                'Milliseconds'
            )
            return returnObject
        })
    }
}

// The timestamp value for 1980-01-01T00:00:00
PersistentCache.DELTA_THRESHOLD = 315561600000
