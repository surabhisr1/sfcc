<div class="c-callout">
  <p>
    <strong>Note:</strong> The Server-Side Rendering Performance series is designed to dive into the most important topics you'll encounter while building, testing and deploying a server-side rendered Progressive Web App (PWA). To learn how these PWAs differ from Mobify’s tag-loaded PWAs, read our <a href="../../architecture/#two-types-of-pwas">overview</a>.
  </p>
</div>

## How Mobify’s CDN caching works

<div class="c-callout">
  <p>
    <strong>Note:</strong> For an introduction to Mobify's CDN Cache, read an <a href="../ssr-performance-caching-overview/#about-mobify’s-cdn-cache-and-application-cache">overview</a>.
  </p>
</div>

Mobify’s CDN caches responses to requests. The cached responses are indexed by the request URL (hostname, path and query string) plus whatever headers are configured to be forwarded to the origin. For the SSR server, only headers relating to device type (mobile, desktop or tablet) and request class are forwarded, so only those headers are used to look up cached responses. 

URL fragments are ignored when looking up cached responses. For example: responses to requests for the URLs `www.example.com`, `www.example.com/path`, and `www.example.com/path?a=1` will all be cached separately, since the URLs are different. However, a request for `www.example.com/path#123` will match `www.example.com/path`, since fragments are ignored.

Once the request comes in, Mobify’s CDN first checks the cache: is a matching response found? If it is, the CDN can respond right away. (Note that expired responses disappear from the cache.) 

A **cache hit** means that the CDN checked the cache for a matching response, and was able to find a matching response right away. This results in a very fast response.

A **cache miss** means that no matching response was found in the cache. In this case, the CDN needs to forward the request to the origin. (The Mobify Platform sets up several different origins: the SSR server, bundle files, and separate origins for any project-specific proxies that are configured.) This request flow is orders of magnitude slower than finding the resource in the CDN or Application cache.

The CDN cache is *temporary*, in that CDN-cached content may get evicted in favour of new, more frequently-accessed assets. There are several regional CDN caches to optimize the network response speed. In addition, the CDN Cache stores different versions of a page for mobile, tablet, and desktop. This allows us to serve different markup to these devices at the cost of having to render the page again for a different device type.

You can test if you’re getting a cache hit or miss in the HTTP response headers. Just look for the `x-cache header`, and you’ll either see “`x-cache: Miss from cloudfront`” or “`x-cache: Hit from cloudfront`”. To improve PWA performance, we need to **increase the percentage of CDN cache hits**.

## Maximizing performance by using Mobify’s CDN cache

To render your PWA’s most frequently-visited content quickly, you’ll want to leverage Mobify’s CDN Cache. In this section, we’ll guide you through how to customize cache control response headers, and how to use the CDN’s request processor to map many URLs to a small number of matching responses. Let’s go through each technique in detail.

### Setting optimal CDN cache lifetimes

The next step toward maximizing your PWA’s cache hit rate is setting **cache control response headers**. Cache control response headers determine the length of time that a page can be stored in the CDN cache. If you do not customize the cache control response headers, they will be set to 600 seconds by default.

The default cache control response headers should be customized depending on the type and status of the page. For example, a content page that rarely changes can be safely cached for a very long time. In contrast, a product listing page that’s frequently updated with new products might require a short cache lifetime, such as fifteen minutes. Whenever possible, choose long cache lifetimes in order to maximize the cache hit rate.

Set cache control response headers either through the `responseHook` class method (where you can set `s-maxage` to a time value in seconds), or by using a template by template approach (only available to projects which started on or after March 28, 2019). Explore our examples outlining the two approaches below, or you can continue reading about [HTTP caching](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching).

### Example: the responseHook class method

The following example can be applied within your project’s `ssr.js file`, which lives in the same directory as your PWA’s `main.jsx file`:

- Projects which started before March 28, 2019: `/web/app/ssr.js`
- Projects which started on or after March 28, 2019: `/packages/pwa/app/ssr.js`

```javascript
class ExtendedSSRServer extends SSRServer {
    // ...

    responseHook(request, response, options) {
        response.set(
            'cache-control',
            `max-age=${cacheTime}, s-maxage=${cacheTime}`
        )
    }
}
```

### Example: template by template

This method is only available to projects that started on or after March 28, 2019. It uses the `trackPageLoad` function that comes by default with a new project.

```javascript
// First, import the `trackPageLoad` function
import {trackPageLoad} from '../../page-actions'

// An `initialize` action is the promise required to by `trackPageLoad`
import {initialize} from './actions'

class MyTemplate extends React.Component {
    // ...

    componentDidUpdate() {
        const {trackPageLoad, initialize} = this.props


        // The trackPageLoad has three arguments:
        //
        // `promise`: usually an action that fetches the page data
        // `pageType`: a string that identifies the current page
        // `getResponseOptions`: a callback that takes the value
        // returned by the promise. It may return a response
        // options object to customize the response.
        trackPageLoad(initialize, this.pageType, (result) => {
            // `result` is the value eventually resolved from
            // the `initialize` promise.
            const {statusCode} = result

            // A `responseOpt` object is created, and it will be
            // used to customize the response sent to the user.
            const responseOpt = {statusCode}

            // In the case of a 200 status code, we can customize
            // the response headers as follows:
            if (statusCode === 200) {
                responseOpt.headers = {
                    'Cache-Control': 'max-age=0, s-maxage=3600'
                }
            }

            return responseOpt
        })
    }
}

const mapStateToProps = createPropsSelector({initialize})
export default connect(mapStateToProps)(MyTemplate)
```

You can test that your cache controls are present in the response headers by inspecting your network requests, using Chrome DevTools’ **Network** tab. Alternatively, you can use your command line interface with the following curl command, which will show all response headers. Simply replace ““ with the URL you’re interested in:

```bash
curl --dump-header - --silent --output /dev/null <enterYourSiteURLhere>
```

## Using the CDN’s request processor to improve cache hits

Mobify’s **request processor** handles requests as soon as they’re received by the Mobify Platform, before the CDN looks for cached responses. You can use it to improve cache hits by modifying parts of a request, such as the query parameters, to ensure that similar URLs map to the same response.

To learn more about using the request processor to improve your PWA’s performance, read our [request processor tutorial](../request-processor/).

## Next steps

Next, you can continue through our Server-Side Rendering Performance series, with an article about using Mobify's [Application Cache](../ssr-performance-application-cache) to boost performance. Or, explore [best practices to optimize your PWA’s client-side performance](../client-side-performance/).



<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>