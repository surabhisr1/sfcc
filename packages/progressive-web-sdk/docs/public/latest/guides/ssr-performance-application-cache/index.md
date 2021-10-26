<div class="c-callout">
  <p>
    <strong>Note:</strong> The Server-Side Rendering Performance series is designed to dive into the most important topics you'll encounter while building, testing and deploying a server-side rendered Progressive Web App (PWA). To learn how these PWAs differ from Mobify’s tag-loaded PWAs, read our <a href="../../architecture/#two-types-of-pwas">overview</a>.
  </p>
</div>

## Application Cache

**The App Server uses the App Cache to store and fetch the result of slow operations. 🐌**

In server-side rendered (SSR) PWAs, it's often expensive to render a page. The App Cache can be used to store rendered pages to quickly respond to subsequent requests. This code stores and fetches all SSR pages from the App Cache:

```javascript
// packages/pwa/app/ssr.js
const { SSRServer } = require("progressive-web-sdk/dist/ssr/ssr-server")

shouldRespondToRequestFromCache = request => true
shouldCacheResponse = (request, response) => response.statusCode === 200

class AppCacheSSRServer extends SSRServer {
    requestHook(request, response, next, { deployId: namespace }) {
        if (!shouldRespondToRequestFromCache(request)) {
            return next()
        }

        this.getResponseFromCache({ request, response, namespace }).then(
            entry => {
                if (entry.found) {
                    return this.sendCachedResponse(entry)
                }

                this.cacheResponseWhenDone({
                    request,
                    response,
                    shouldCacheResponse,
                    namespace
                })

                next()
            }
        )
    }
}
```

[`SSRServer`](https://docs.mobify.com/progressive-web/latest/utility-functions/reference/SSRServer.html) provides three methods, `SSRServer.getResponseFromCache()`, `SSRServer.sendCachedResponse()` and `SSRServer.cacheResponseWhenDone()` to interact with the App Cache.

The example overrides `SSRServer.requestHook` to check if a response for `request` exists within the App Cache using `SSRServer.getResponseFromCache()`. If it does, it is returned using `SSRServer.sendCachedResponse()`. If not, `SSRServer.cacheResponseWhenDone()` stores the response in the cache for use with the next request.

> **The example uses the App Cache to respond to *all* requests.** You will need to update `shouldRespondToRequestFromCache()` such that it does not store or fetch pages that should not be cached. _Generally, pages that contain personal information or frequenctly-changing information should not be cached._

`SSRServer.getResponseFromCache()` looks for a cached response by checking:

- The lowercased request path and querystring
- The device type (mobile, tablet, or desktop)
- The request class

You can change this behaviour using the `key` argument. Additionally, you can partition the cache with the `namespace` argument.

`SSRServer.getResponseFromCache()` returns a `Promise` which resolves to an `entry`. `entry.found` checks that a matching response was found in the cache and `SSRServer.sendCachedResponse()` sends it back to the client.

If no matching response was found, `SSRServer.cacheResponseWhenDone()` stores the outgoing response for next time. Responses are stored in the cache for as long as the `s-maxage` and `max-age` properties of the `Cache-Control` header indicate. You can override this behaviour with the `expiry` argument.

## Testing the App Cache

`SSRServer.getResponseFromCache()` adds a HTTP response header `x-mobify-from-cache` with values `true` or `false` to show whether a response came from the App Cache.

> A common gotcha using the App Cache is that requests may be responded to from the CDN. You can ensure that requests are sent back to the App Server by adding the HTTP request header `X-Mobify-Cachebreaker: 1` to your requests. _This header only breaks the CDN cache, not the App Cache._

### Force using a specific device type

During testing, it might be desired to view App Cache response by a specific device type. To force using a device type, simply append a query parameter `mobify_devicetype` to the URL, the value can be `mobile`, `tablet` or `desktop`, for example, `www.example.com/test?mobify_devicetype=mobile` will return the mobile version of the cache.

## Clearing the App Cache

It may be necessary to clear pages stored in the App Cache before they expire.

Early expiry can be implmented using the `namespace` argument to `SSRServer.getResponseFromCache()`. Changing the `namespace` effectively invalidates the entire cache, as lookups will occur against a new partition.

To clear the App Cache on each deploy you can use `process.env.DEPLOY_ID` in `namespace`.

More robust implementations may query APIs to check whether the data used to render a page has changed. This information can then be used to set `key` or `namespace`.

## Implementation Considerations

When using the App Cache, consider:

- **What pages should be cached?** App Cache responses are shared, so don't use it to store personalized information. Also, App Cache may not be approriate for frequently-changing pages.
- **Should error page be cached?** By default, `SSRServer.cacheResponseWhenDone()` stores all responses, including HTTP errors. If you don't want to store errors, pass the `shouldCacheResponse` argument to change this behaviour.
- **How long should pages be cached?** High cache times mean that more requests will be responded to from the cache. However, they also increase the chance of serving stale content.

> Contact [support.mobify.com](https://support.mobify.com/support/tickets/new) for help optimizing your App Cache implementation.

## Next steps

Continue through our Server-Side Rendering Performance series, with an article about [testing and debugging your local SSR backend](../ssr-performance-testing). Or, explore [best practices to optimize your PWA’s client-side performance](../client-side-performance/).

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>