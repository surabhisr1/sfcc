<div class="c-callout">
  <p>
    <strong>What's a UPWA?</strong> In version 1.6 (Nov. 2018) of the Progressive Web SDK and earlier, we referred to our server-side rendering technology as "Universal Progressive Web Apps" or "UPWAs." We’ve decided to stop using these names and use “server-side rendered PWAs” instead.
  </p>
</div>

# Fundamentals

A server-side rendered (SSR) PWA runs across many devices: phones, tablets and desktops.

The Mobify Platform supports building SSR PWAs using the same components and developer workflow used for tag-loaded PWAs: they're built using React to render HTML, and Redux to store application state.

Recall how PWAs work on the Mobify Platform:
* The PWA renders HTML using React components
* The HTML rendered depends on the **route** (the path of the URL for the page that's shown in the browser)
* Data is pulled from a backend server (sometimes a webserver that returns
HTML, sometimes an ecommerce backend that provides a REST API)

There are some fundamental concepts that are new to SSR PWAs. To explain these concepts, we'll use this scenario:
* WidgetCorp, Inc is developing a new SSR PWA for their existing
  website, `www.widgetcorp.com`
* They have an ecommerce backend, which is available at `api.widgetcorp.com`, from which the SSR PWA will take data to render the pages.  

## Server-side rendering

Server-side rendering (SSR) uses the PWA code to generate the HTML, which is returned by a server to a client.

Currently, WidgetCorp runs a webserver, and the hostname `www.widgetcorp.com` points to that webserver. When a device requests a URL from the webserver, the webserver fetches data from the backend server, uses it to render an HTML page for that URL and returns the page to the device.

When the SSR PWA is launched, `www.widgetcorp.com` will point instead to an **[SSR server](https://docs.mobify.com/progressive-web/latest/utility-functions/reference/SSRServer.html)** (code that runs on the Mobify Platform). When a device
requests a URL from the SSR Server, it will do the following:
1. Run the SSR PWA code, setting the route to match the URL
2. Allow the SSR PWA to render HTML, using React, with state kept in the
Redux store. The SSR PWA is able to fetch data from the backend server.
3. Once rendering is complete, return an HTML page to the device that contains:
    * The HTML that the SSR PWA rendered
    * A copy of the state from the Redux store
    * A `<script>` element that will load the SSR PWA on the browser

When the page is received by the device, it can immediately display the HTML while the SSR PWA loads, which allows a fast startup (faster than a tag-loaded PWA).

An important point to note is that the SSR PWA is run in two different places:
* **Server-side**, in the SSR Server
* **Client-side**, in the browser

This is part of the [*SSR PWA Lifecycle*](#SSRLifecycle), which is explained below.

## Proxying
The WidgetCorp website contains *assets* (scripts or other files) and handles POST requests that the SSR PWA will use when rendering. As an example, we'll consider the following:

* `www.widgetcorp.com/assets/logo.png` is the corporate logo image. The SSR PWA will need to use this image in rendered HTML.

* `www.widgetcorp.com/tracking.js` is a analytics script that provides tracking of browser usage. The SSR PWA-rendered pages should load this script.

* `www.widgetcorp.com/login` is a URL that the web server provides, which
  handles checking of credentials sent in a POST, and sets a login cookie in the response. The response also contains CORS headers to restrict
  access.
  
When the SSR PWA is launched, `www.widgetcorp.com` will no longer point at
the WidgetCorp webserver, and so these URLs will no longer work. To fix this, the SSR PWA can use the [*proxying* support](../proxying/) which is built into the Mobify Platform.

Here's how we can set that up:
1. Add a new hostname `server.widgetcorp.com` that will continue to point to the WidgetsCorp webserver even when `www.widgetcorp.com` changes to point to the SSR Server. We call `server.widgetcorp.com` the **target hostname** for proxying.
2. Configure proxying so that requests to `www.widgetcorp.com/mobify/proxy/base/` will be automatically forwarded to the `server.widgetcorp.com` server. We call `www.widgetcorp.com` the **application hostname** for proxying.
   
Once this is set up, a request for `www.widgetcorp.com/mobify/proxy/base/assets/logo.png`
will be routed to `server.widgetcorp.com/assets/logo.png`. The SSR PWA can then render Image components that use the `/mobify/proxy/base` path, and the images will be fetched from the WidgetCorp webserver.

Similarly, to load the script `www.widgetcorp.com/tracking.js`, the SSR PWA would use the path `www.widgetcorp.com/mobify/proxy/base/tracking.js`

Finally, the SSR PWA can use the `/login` URL via a POST to `www.widgetcorp.com/mobify/proxy/base/login`. The
request and response are processed so that headers such as `Host` and
`Access-Control-Allow-Origin` are modified, to allow use of the URL
despite the POST being made to `www.widgetcorp.com` instead of
`server.widgetcorp.com`.

Proxying has a number of advantages:
* It's fully transparent and rewrites the request and response so that POSTs,
  PUTs and GETs work via the proxy.
* The browser can make all requests to `www.widgetcorp.com` (the application
  hostname), avoiding CORS issues.
* It supports multiple proxy setups, so more than one target host can be
  proxied (each has a separate path under `/mobify/proxy`)
* Because the proxying paths are available on the application hostname,
  browsers can re-use existing connections to that hostname, resulting
  in improved performance.

Learn more in our [article on configuring proxies](../proxying/).

## Bundle assets

SSR PWAs using the Mobify Platform, like PWAs, are made up of files that
are deployed as part of a code bundle.
The SSR Server makes bundle files available under the path `/mobify/bundle/`.
Each bundle has a bundle **id** (a number unique within the project), and the full path used to refer to bundle files is `/mobify/bundle/<bundle-id>/` (when running the [local development SSR server](../../reference/upwa/ssr-server#localDevServer), the path will be `/mobify/bundle/development/`). These paths are relative to whatever hostname is being used to address the SSR server.

When a new bundle is deployed, browsers that load the new version of the SSR PWA will use the correct path for assets within that new bundle, while existing versions of the SSR PWA will use the correct paths for files in their bundles.

Because the bundle files are loaded via a path on the application hostname, browsers can re-use existing connections to that hostname, resulting in improved performance.

## The SSR PWA Lifecycle <a name="SSRLifecycle" href="#SSRLifecycle">#</a>
There is a key difference between SSR PWAs and tag-loaded PWAs. SSR PWAs run on the SSR server **and** then again in the browser. Tag-loaded PWAs only ever run and render in the browser.

When an SSR PWA is running on the SSR server, we say that it is running
**server-side**. When it's running in the browser, we say that it is running **client-side** (the browser is the client). 

An SSR PWA therefore has several **stages** of execution, and we use the
term _SSR PWA Lifecycle_ to refer to these.

The lifecycle can be summarized:
1. A device makes a request to the SSR server for a page
2. The SSR server runs the SSR PWA code **server-side** to generate the HTML
3. The HTML is returned to the device which displays it
4. The device then loads the SSR PWA code into the browser
5. The SSR PWA starts up and "hydrates" by rendering the same HTML that
   was sent from the server, so that React now owns that HTML
6. The SSR PWA completes hydration and runs client-side. The user can now
   navigate to other pages, which are rendered by the SSR PWA running
   client-side.   

The full lifecycle, including an explanation of how SSR PWA code can identify the lifecycle stages, plus what should and should not be rendered in each stage, is [explained in detail here](../../reference/upwa/lifecycle).
