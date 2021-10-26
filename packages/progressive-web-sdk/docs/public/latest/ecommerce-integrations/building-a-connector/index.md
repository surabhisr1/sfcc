<div class="c-callout c--important">
  <p>
    <strong>Important:</strong> Projects generated <em>after</em> 2019 do not use the Integration Manager because it has been replaced with our <a href="../../integrations/commerce-integrations/">Commerce Integrations</a> technology.
  </p>

  <p>
     For anyone working on projects that were generated <em>before</em> 2019, we've left the Integration Manager documentation here in case you still need to refer to it.
  </p>
</div>

The Integration Manager provides an interface that allows you to plug in a
connector to integrate with your ecommerce platform. If the platform that you
use is not supported, you will need to build a custom connector.

Building a connector for your ecommerce
platform requires that all commands exposed
by the Integration Manager be implemented.

## Setup

In your generated project you will find a "stub" connector that implements all
of the commands used with the Integration Manager. Most of these commands are
empty and merely print a record of their call to the console, but some dispatch
minimal example data into the store, so that your project has minimal
functionality while the connector is being implemented.

To get started, make a copy of the stub connector and name it after the platform
you are integrating using the following shell command:

```sh
cp -R \
    web/app/integration-manager/_stub-connector \
    web/app/integration-manager/_custom-connector
```

Next switch the app to use the connector by modifying `web/app/main.jsx` to
import the new custom connector. You can remove all lines relating to other
connectors. Add the following:

```javascript
import {Connector} from './integration-manager/_custom-connector'
import IntegrationManager from 'mobify-integration-manager/dist'

IntegrationManager.initialize(
    Connector(/* Any configuration your new connector requires */),
    { /* connector extension */ }
)
```

**Note**: The `initialize()` method can take a second parameter which is the
connector extension. Typically you would not need this unless you need to add
custom commands. You should only use overrides if you are starting with an
existing connector

Now you can run `npm start` and the project will be using the new custom
connector.

Inside the stub connector, there are a number of `commands.js` files, each of
which implements Integration Manager commands for a particular portion of the
app, such as product details or the shopping cart. Each command is implemented
with the relevant parameters already passed in from the front end; these are
documented in greater detail in the corresponding `commands.js` files in Integration
Manager source and related documentation. To view this documentation, run the
following command in the `web/` directory of the project:

```sh
open node_modules/progressive-web-sdk/src/integration-manager/docs/index.html
```

If additional information is needed from the Redux state, just replace
`(dispatch)` in the thunk definition with `(dispatch, getState)` and
call the `getState` parameter function to get the current state.

The implementation of each function can fetch or update the data using
whatever method and libraries it needs (browser fetch API, jQuery,
etc.). The connector may then dispatch one, or more, result actions
(provided by the Integration Manager API) and pass the data to the
result action. It must return a `Promise`, which will resolve on
success and reject on failure. If using the `fetch` API, either
directly or through one of the SDK helper functions, the fetch call
will return a `Promise` suitable for this. If no asynchronous work is
done in your implementation, just return `Promise.resolve()` or
`Promise.reject()`. The `Promise` resolution should generally only be
used to signal success or failure to the caller, and not pass data out
of the command to the front end. There are a few cases where the
connector passes a redirect URL to the UI as a resolution value, which
are clearly marked in both the stub connector and Integration Manager
source.

Instead, we transmit data to the front end by
dispatching results actions. These results are just normal
Redux actions, but they are type-checked during development. If the
data passed to a result does not match the structure and type expected
by the Integration Manager, a warning will be printed in the
console. This ensures that the data merged back into the Redux store
is consistent and matches the selectors that depend on it. In most
cases the data dispatched in the result gets merged into the Redux
store unchanged.

Results are contained within the Integration Manager source, in
`results.js` files. In general, the results needed for the commands in
each section of the app are included in the corresponding directory,
so we have product-related results in `products/results.js` and
cart-related results in `cart/results.js`, etc.

The stub connector contains several examples of the results that are
necessary for the app to function. Not all actions need to dispatch a
result, but generally there will be some information that needs to be
updated in the store. The page initializatixon actions, however, do
need to dispatch a result into the store, so that the page is marked
as loaded for the UI to display.

## Communicating with the backend

There are three main ways to communicate with your ecommerce backend:
* using APIs
* using HTML and form endpoints
* running scripts

### Using APIs

Whenever possible, use APIs. As APIs do not change frequently, they are less prone to breakage when compared to form endpoints. Using an API is much simpler than fetching and parsing HTML. Work with the customer to get the documentation for their APIs (or if you control the backend, create them yourself).

If there are no APIs available for getting/persisting the data you need, you will need to leverage form endpoints.

### Using HTML and form endpoints

APIs won't always be available for each feature you build. The next route you should take for communicating with your ecommerce backend is to get data by parsing HTML and persist data by posting to form endpoints.

#### Getting data by fetching and parsing HTML

In the absence of formal APIs for retrieving data, we can send a GET request to fetch HTML. We can parse that HTML to get the data we need for the PWA.

The stub connector contains the utility `fetchPageData` to handle fetching HTML. If you have based your custom connector off of the stub connector, the following example demonstrates how you can use this utility.

```js
// in web/app/connectors/_custom-connector/cart/commands
import {fetchPageData} from '../../app/index'

export const getCart = () => (dispatch) => {
    dispatch(fetchPageData(cartURL))
        .then(([$, $response]) => {
            // parse your cart data here
            // $ is jQuery
            // $response is a jQuery wrapped
            // copy of the DOM of the requested page
        })
}
```

See the [How to Use Web Scraping](../../guides/web-scraping/) guide for more details about parsing techniques.

#### Persisting data by posting to form endpoints

Treat form endpoints as an API to persist data. A traditional REST (REpresentational State Transfer) endpoint is a contract that outlines what data the server expects and what response you should expect. Form endpoints function in the same way. Reviewing the existing HTML/JavaScript that already uses this form endpoint will help you to discover how the form endpoint is used and what responses it returns.

The Progressive Web SDK comes with a `makeFormEncodedRequest` utility to simplify submitting forms.

```js
import {makeFormEncodedRequest} from 'progressive-web-sdk/dist/utils/fetch-utils'

export const submitPayment = (paymentData) => (dispatch) => {
    return makeFormEncodedRequest(paymentData)
        .then((response) => {
            if (response.status === 200) {
                // handle a successful form submission
            } else {
                // handle a form submission error
            }
        })
}
```

See the [Working with Forms](../../guides/forms/) guide for more details about using and submitting forms.

### Running scripts

Sometimes, business logic isn't accessible via APIs, HTML or form endpoints. A common scenario where this comes up is if the page runs JavaScript to asynchronously load extra content or modify the page before presenting it to the user.

We use the [facade pattern](https://en.wikipedia.org/wiki/Facade_pattern) to handle these cases. Wikipedia nicely summarizes when we use this pattern by stating that "... [it's] used when an easier or simpler interface to an underlying object is desired." In this case, the underlying object is the HTML page which contains some data which isn't accessible in the HTML initially returned from the server. There are two strategies for using this pattern to run scripts, hide their side effects, and interact with them.

#### Run JavaScript in the main document, hide the side effects
If you need to get data that can only be accessed by running a script, follow these steps:

* Determine if the script requires that certain elements are present in the DOM. If so, render the required elements.
* Hide any unwanted added elements
* Load the script

From there, you can interact with whatever elements were rendered by that script, treating those elements like an API.

To run those scripts, we have a utility called [`loadScripts`](../../guides/working-with-external-resources/). This utility also executes scripts in the same order as the source document.

**Note:** `loadScript` does not take care of ensuring that other scripts or DOM dependencies are present in the page. You'll have to take care of that yourself by parsing that HTML, storing it in the Redux store and rendering it with the [DangerousHTML component](../../components/#!/DangerousHTML).

It may be too challenging to determine dependencies and bring them into the document. Or, the script may rely on page lifecycle events such as `DOMContentLoaded` and onload (which will not fire in a PWA due to it being a Single Page App). In those cases, the script should be run inside an `iFrame`.

#### Run the JavaScript in an iFrame, hide the iFrame
When running into difficulty loading inline/external JS, another way to implement the facade pattern is to run parts or all of a page in an `iFrame`. You can communicate with the `iFrame` and treat it like an API. The advantage of an `iFrame` is that you get to run an entirely new browser context, without worrying how it might interact with the parent context.

The [Frame Bridge](../../reference/frame-bridge/) guide describes how to do this.

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>