Here are some answers to the questions that people frequently ask about the Mobify Platform.

<div class="content-accordion u-margin-top">
<h3 class="u-text-medium">How do I make my PWA work on other browsers?</h3>
<div>

The Mobify platform supports the browsers listed in the [Mobify Platform Compatibility Matrix](/platform/compatibility/). Support for additional browsers must be added manually.

Your first step is to determine if the browser that you want to support is supported by the Mobify tag. The Mobify tag determines whether or not to load your Progressive Web App based on the browser's user agent. The default version of the Mobify tag loads the PWA on Chrome, Safari, and the Android native browser. The v8 Mobify tag also includes support for the Blackberry and Firefox browsers. Which of these browsers are actually supported is further configured in a project's `loader.js` file.

If the browser that you want to support **is not** supported by the Mobify tag, you will need a custom tag. Please reach out to [Mobify support](https://support.mobify.com) to create a custom tag for your project.

If the browser that you want to support **is** supported by the Mobify tag, the next step is to enable support for that browser within `loader.js`. To give individual projects more control over which browsers they support, the Mobify tag loads `loader.js` on a wider set of browsers than those that are included in the Browser Compatability Matrix. In `loader.js`, we check if the browser is one of the smaller subset of browsers that we want to support. You may have to remove a code that disables the PWA on your target browser.

For example, Samsung Internet is not enabled by default. To enable Samsung Internet, open `loader.js` and find the function `isSupportedPWABrowser`. This function contains the check `!isSamsungBrowser(ua)`. Remove that check to enable this browser.

Once enabled, test your PWA in the browser. If possible, connect your browser to a debugger so you can inspect any errors that occur.

Typically when a browser isn't working correctly on a PWA, it's caused by some feature that is missing in that browser. We can usually fix these issues by loading the appropriate polyfills. You can configure which polyfills are loaded for your project inside `web/app/utils/polyfills.js`.

This file contains a list of all polyfills that can be loaded for your site. Each polyfill must have a `test` and a `load` function. The `test` function should return `true` if the polyfill needs to be loaded for the browser being used. The `load` function should contain code that applies that polyfill. An example polyfill for the `global.fetch` function is shown below:

```js
{
    test: () => !global.fetch,
    load: (callback) => {
        loadScript({
            id: 'progressive-web-fetch-polyfill',
            src: getAssetUrl('fetch-polyfill.js'),
            onload: callback,
            onerror: callback
        })
    }
}
```

Add whatever polyfills are needed for your project to `web/app/utils/polyfills.js`. Before the app starts, any needed polyfills specified in this file will be loaded. A polyfill will only be loaded if it is needed. Depending on the browser you're supporting, you may have to apply a few different polyfills.

</div>
<h3 class="u-text-medium">How do I change how the service worker caches requests?</h3>
<div>

The service worker is a component provided by the Progressive Web SDK in PWA
projects. It is a thin wrapper around the Google
[sw-toolbox](https://googlechromelabs.github.io/sw-toolbox) package. The good
news is that it can be customized. You will find the main service worker file in
your project under `web/worker/main.js`.

You will need to make two changes to this file:

1. Create a variable to hold the result of the `worker()` call within the `if
   (pwaMode)` block. This is a small change as shown in the diff below.

   ```diff
   if (pwaMode) {
   -   worker({
   +   const sw = worker({
           slug: PROJECT_SLUG,
           isDebug: DEBUG
       })
   ```

2. Now update the service worker's cache behaviour for the request(s) you want 
   to adjust.

   ```js
   sw.toolbox.router.any(
       /register\.aspx/, // Note that this is a regex, not a string!
       sw.toolbox.default.networkFirst
   ```

   The full `sw-toolbox` API is available on the `sw.toolbox` object. Refer to
   the full [API
   documentation](https://googlechromelabs.github.io/sw-toolbox/api.html) for
   more information.

</div>
<h3 class="u-text-medium">How do I add Bazaarvoice reviews to my PWA?</h3>
<div>

To add reviews to your PWA, use the [BazaarvoiceReview](../components/#!/BazaarvoiceReview) component. This component's documentation also contains examples for how to add other Bazaarvoice features such as Questions and Answers, by creating custom Bazaarvoice components.

</div>
<h3 class="u-text-medium">How does caching work in a PWA?</h3>
<div>

<p class="u-margin-bottom">
    Caching happens at several different levels within the PWA:
</p>

**Caching app data in the Redux store**: When we navigate to a page in the PWA, data is requested from the backend. This data is then merged into the Redux store, which in turn is used to render the page. This data remains in the Redux store even after the user leaves the page. When the user returns to the same page, we already have the data we need and can immediately render the page. To ensure that we minimize the amount of stale data, we still request updated data from the backend, even if we already have data for that page. This caching applies only to the data that we get from the backend and display in the PWA. It does not apply to any scripts, images or other assets. Because this cache is stored in memory, it is emptied when the page is refreshed.

**Caching requests in the Service Worker**: The service worker in a Mobify PWA uses four caches, each with their own expiration policy:

1. The bundle cache, which does not expire unless a new bundle is pushed
1. The image cache, which has a maximum capacity (currently 40 images), but no timed expiry
1. The default cache, which expires entries after 24 hours
1. The Messaging cache, which caches assets required for push notification delivery, downloaded from the Messaging CDN

Assets that are necessary for offline mode must be stored in the bundle cache, so that they will not expire or be evicted before the offline mode is triggered. This is mostly a concern for users who have used the add-to-homescreen feature.

**Caching resources in the Mobify CDN**: A bundle is a set of files that powers the PWA. Bundles are served from the Mobify CDN (cdn.mobify.com). All bundle assets are served with [`etag`](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching#validating_cached_responses_with_etags) and `cache-control` headers that allow them to be efficiently stored in a browser's cache. File persistence in the cache will vary in duration based on file type. For example, JavaScript files in the cache have a short `Cache-Control` of 5 minutes, while all other assets have a far future `Cache-Control` of one year.

</div>
<h3 class="u-text-medium">How do I extend SDK components to add new functionality?</h3>
<div>

We recommend extending SDK components using composition to add new functionality. The [React documentation](https://reactjs.org/docs/composition-vs-inheritance.html) contains some helpful examples of using composition to extend components.

One common example of SDK component extension is extending the Sheet component to add a custom header. This is often done so that you can use the same header for all sheets across the site without having to add it each time. To do this, you can create a custom component that renders the SDK's Sheet component. The custom component then defines the custom header and passes it to the Sheet component.

That custom component might look something like the following example.

```jsx
import {HeaderBar, HeaderBarActions, HeaderBarTitle} from 'progressive-web-sdk/dist/components/header-bar'

const CustomHeader = ({title, onDimiss}) => (
    <HeaderBar>
        <HeaderBarTitle>
            <h1>
                {title}
            </h1>
        </HeaderBarTitle>

        <HeaderBarActions>
            <Button onClick={onDismiss}>Close</Button>
        </HeaderBarActions>
    </HeaderBar>
)

const SheetWithHeader = ({
    headerTitle,
    children,
    // This allows us to accept any props the Sheet accepts
    // without having to specify each one
    ...additionalProps
}) => {
    return (
        <Sheet
            headerContent={<CustomHeader title={headerTitle} onDismiss={onDismiss} />}
            {...additionalProps}
        >
            {children}
        </Sheet>
    )
}
```

Because the SheetWithHeader component accepts all of the same props as the original Sheet component, you can use the custom component just like the original.
```jsx
<SheetWithHeader
    open={...}
    onDismiss={...}
    headerTitle="Custom Header Title"
>
    <p>
        Any arbitrary content you add here will be rendered inside the Sheet component.
    </p>
</SheetWithHeader>
```

The other way to extend SDK components is to render a custom component within an SDK component. This custom component can add new functionality. Most SDK components accept the special `children` prop. The `children` of a component are the elements that are nested inside of it. Most components that accept the `children` prop will render the elements you provide within the component.

```jsx
<Accordion>
    <AccordionItem>
        // any elements you provide here are the AccordionItem's children
    </AccordionItem>
</Accordion>
```

Some components have additional props that accept and render arbitrary content. In the component's documentation, these props will have a type of `node` or `One of type: string, node`.

For example, the `title` prop of the TabsPanel component can accept any arbitary content. This means that you can create a custom component to use as the `title`. The following example adds an icon to the TabsPanel `title`.

```jsx
const CustomTabTitle = ({text, icon}) => {
    return (
        <div>
            <Icon name={icon} />
            {text}
        </div>
    )
}

<Tabs>
    <TabsPanel title={<CustomTabTitle title="Favorites" icon="star" />}>
        ...
    </TabsPanel>

    <TabsPanel title={<CustomTabTitle title="Liked" icon="heart" />}>
        ...
    </TabsPanel>
</Tabs>
```

</div>
</div>