Progressive Web Apps often need to support the needs of different languages, currencies, or other unique formats that are unique to various regions, cultures and customs. In computing, the practice of supporting these various locales is called [internationalization and localization](https://en.wikipedia.org/wiki/Internationalization_and_localization#Naming). These terms are abbreviated to i18n and l10n, respectively. For the rest of this document, we will use the term i18n.

## i18n Dependencies

By default, your PWA comes installed with a library called [react-intl](https://github.com/yahoo/react-intl), which has a robust array of i18n features, from formatting text and numbers, to displaying localized date and times, and more. A brief overview of available features is listed below, but refer to the library's [official documentation](https://github.com/yahoo/react-intl/wiki) for a complete list of feature details.

* Date and time formatting APIs
* Number and pluralization formatting APIs
* String formatting APIs
* [And more!](https://github.com/yahoo/react-intl/wiki)

All of the instructions provided in this guide assume you are using the react-intl library.

### Don't want react-intl as a dependency?

Maybe your application doesn't need any i18n features, or maybe you want to use a different library. In either case, refer to the [How to Remove react-intl](#how-to-remove-react-intl) section below for more details on removing the unwanted library.

## Using react-intl Functions and Components

Using react-intl [components](https://github.com/yahoo/react-intl/wiki/Components) is as simple as importing them from the library and using them in your React components. Just be aware that the [`IntlProvider`](https://github.com/yahoo/react-intl/wiki/Components#intlprovider) component already wraps the application. This means the react-intl components are ready to use with no further setup.

```js
import {
    FormattedMessage,
    FormattedNumber
} from 'react-intl'

// Formatted messages require IDs. See the Translations section below
// for details
const translationKey = 'component.example.translations.id'

const MyComponent = ({text, currency}) => (
    <div>
        <span>{text}</span>
        <FormattedMessage id={translationKey} />
        <FormattedNumber value="10" style="currency" currency={currency} />
    </div>
)
```

However, using react-intl's [functions](https://github.com/yahoo/react-intl/wiki/API) should be done in combination with [`injectIntl`](https://github.com/yahoo/react-intl/wiki/API#injectintl). See the example below.

```js
import {injectIntl} from 'react-intl'

const MyComponent = ({
    intl, // this prop comes from `injectIntl`
    text,
    currency
}) => (
    <div>
        <span>{text}</span>
        <span>{intl.formatMessage({id: '...'})}</span>
        <span>{intl.formatNumber(10, {style: 'currency', currency: currency})}</span>
    </div>
)

// The component wrapped by `injectIntl` will receive the `intl` prop, from
// which react-intl's numerous APIs can be used
const WrappedMyComponent = injectIntl(MyComponent)
```

## Translations

Translations files are used to store dictionaries of messages. Each message is a key and value pair of identifiers and a message localized according to its respective language. These messages can then be referred to when using the [`<FormattedMessage>`](https://github.com/yahoo/react-intl/wiki/Components#formattedmessage) component or the [`formatMessage()`](https://github.com/yahoo/react-intl/wiki/API#formatmessage) function to dynamically output the message in the active locale. See the below [Switching Locales](#switching-locales) section for details on dynamically switching locales.

In your PWA, all translations of a single locale are imported into their own top level translation file in `web/app/config/translations/*.js` where the * is the locale key. For example...

```js
/**
 * web/app/config/translations/en.js
 */

import {homeMessages} from '../../containers/home/translations/en'

export default {
    ...homeMessages
}
```

The actual translations themselves are stored close together with whatever component they relate to. For example, the home page translations exist in `web/app/containers/home/translations/*.js`.

```js
/**
 * web/app/containers/home/translations/en.js
 */

export const homeMessages = {
    'home.example.message': 'This is an English translated message!',
}
```

Using the above translation would then be as simple as referencing its translation id in the `FormattedMessage` component or `formatMessage()` function.

```js
const HomeComponent = (props, context) => {
    const messageString = context.intl.formatMessage(context, {id: 'home.example.message'})
    const messageComponent = <FormattedMessage id="home.example.message">
}

HomeComponent.contextTypes = {
    intl: PropTypes.object
}
```

### Organizing Translation Files

There are two important concepts to understand how translation files are stored: they are stored close to the code where they are used, and all translation files are ultimately imported into a single master translation file.

This architecture is similar to how the PWA's routes (sometimes called containers or templates) are structured. One route is stored along side all its other related code (styles, tests, actions, partials, etc.) and ultimately pulled into a single master file (the `router.jsx` file).

The main advantage of this architecture is that it keeps all related code close together.

```js
/web/app
└── /config
│   └── /translations
│           en.js // All English translations are imported here
│           jp.js // All Japanese translations are imported here
│
└── /containers
    └── /checkout
    │   └── /translations
    │           en.js
    │           jp.js
    │
    └── /home
    │   └── /translations
    │           en.js
    │           jp.js
    │
    └── /product-details
    │   └── /translations
    │           en.js
    │           jp.js
    │
    └── /product-list
    │   └── /translations
    │           en.js
    │           jp.js
```

Using the example files from above, the following JavaScript example demonstrates what the master `/web/app/config/translations/en.js` file looks like:

```js
import {checkoutMessages} from '../../containers/checkout/translations/en'
import {homeMessages} from '../../containers/home/translations/en'
import {productDetailsMessages} from '../../containers/product-details/translations/en'
import {productListMessages} from '../../containers/product-list/translations/en'

export default {
    ...checkoutMessages,
    ...homeMessages,
    ...productDetailsMessages,
    ...productListMessages,
}
```

When the project is compiled into a bundle, Webpack is configured to code split the localizations into their own files to be downloaded by the user as needed. So that means that a project with English and Japanese, as in the above examples, Webpack will create both `en.js` and `jp.js`, which the user will automatically download and use.

### Translation Key Name Conventions

During the course of your internationalized build you will need to add a number of keys to your translation dictionary. In typical ecommerce builds this dictionary can end up getting quite large, so we’ve come up with a few conventions that should help you avoid these pitfalls.

Key names should include:

* The descriptor of a component
* One or more sub-elements within that component
* The specific place in the component where the translation is

Specifically we suggest using this format

```js
{container/component}.{subElement}.{specificPlace}
```

A specific example for the text of an expand button in a product description of a product details page might look like...

```js
productDetails.productDescription.seeMore
```

In the case where a key is used in multiple areas of the site, and not just in a specific container, use `common` as the component instead. An example of this would be...

```js
common.divider.or
```

To help reduce the size of your bundle and improve performance of your build, you can minimize the number of keys with shared translation values by providing just one common key value pair like in the example below.

```js
{
    // Duplicate example 1
    // /web/app/containers/checkout-shipping/translations/en.js
    'checkoutShipping.addressForm.firstName.label': 'First Name',

    // Duplicate example 2
    // /web/app/containers/checkout-payment/translations/en.js
    'checkoutPayment.addressForm.firstName.label': 'First Name',

    // Duplicate example 3
    // /web/app/containers/registration/translations/en.js
    'registration.firstName.label': 'First Name',

    // All the above could have just been summarized into a single key, located
    // somewhere common
    'common.forms.firstName.label': 'First Name',
}
```

### Translations in Redux Thunk Actions

Unfortunately, react-intl doesn't provide a way to access translations or formatting functions within a thunk action. We only get access to those thunks within a component or container.

Instead, we must take a few steps to work around this limitation with a technique that involves injecting react-intl's `intl` object into the thunk actions as an argument.

By passing the full `intl` object, we get access to not only the translations, but also all of the formatting functions we might need.

```js
import {injectIntl} from 'react-intl'
import {connect} from 'react-redux'

const MyContainer = ({myThunkAction, intl}) => {
    const click = () => {
        // Here we pass the full `intl` object into our thunk action!
        myThunkAction(intl)
    }
    return (
        <Button onClick={click}>
            Thunk!
        </Button>
    )
}

// ...

const mapStateToProps = // ...
const mapDispatchToProps = {
    myThunkAction
}

export default connect(mapStateToProps, mapDispatchToProps)(
    // injectIntl gives our component the `intl` object as prop
    injectIntl(MyContainer)
)
```

By using the technique as outlined above, your thunk action gains full access to react-intl's full suite of functions. You can then do things like...

```js
// Access a translation directly off of the messages object:
intl.messages[‘form.firstName.invalid’]

// Use the formatMessage function on the `intl` object
intl.formatMessage({id: 'form.firstName.invalid'})

// And more! See react-intl documentation for details.
```

## Locales

Locales are used by react-intl to support its pluralization and time formatting features.

By default, your PWA comes pre-baked with two languages: English and Japanese. It's possible to add (or remove) locales. To do so, you import the necessary locale data and register it with the [`addLocaleData`](https://github.com/yahoo/react-intl/wiki/API#addlocaledata) function.

```js
/**
 * web/app/components/intl/index.js
 */

import en from 'react-intl/locale-data/en'
// import ja from 'react-intl/locale-data/ja' // Comment out or delete an unwanted locale
import fr from 'react-intl/locale-data/fr' // Import new locales as needed

// ...

class ProxyIntlProvider extends React.Component {
    componentWillMount() {
        if (typeof addLocaleData !== UNDEFINED) {
            addLocaleData([
                ...en,
                // ...ja, // Comment out or delete the registering of an unwanted locale
                ...fr // add your new locale to the array passed to `addLocaleData`
            ])
        }
    }

    // ...
}
```

For further reading, see react-intl's [Loading Locale Data](https://github.com/yahoo/react-intl/wiki#loading-locale-data) documentation.

### Switching Locales

Switching locales is as easy as running the following...

```js
import {changeLocale} from '../containers/app/actions'

// ...

const locale = 'en' // or which ever locale you want
dispatch(changeLocale(locale))
```

This will update the Redux store so the locale is set to `en` (or your desired locale), as well as start downloading the appropriate locale file. For example, setting the locale to `fr` will start downloading `fr.js`.

When the user changes their locale, send a [UI interaction analytics event](../../analytics/built-in-events#change-language).

## Currencies

In the context of PWAs and i18n, currencies refers to format(s) used to display prices. Different currency formats are often needed when services are offered in locales who use varying currency types, which is of course not mutually exclusive to the language spoken.

For example, in English speaking North America, the dollar ($) currency is used. But in the English speaking UK, the Pound sterling (£) is used instead.

### Formatting Currencies

Currencies stored in the Redux store should be formatted as follows:

```js
type currency = {
    code: string,
    label: string,
    symbol: string
}
```

**`code`** is the ISO code used for that currency, such as "USD" or "GBP". This value is often used when formatting numbers with react-intl functions like `formatNumber()`.

**`label`** is the term the developer can used to easily identify the currency. Such as "dollar", "pound sterling", etc.

**`symbol`** is the currency symbol that is placed alongside a price. Such as "$" or "£".

### Initializing Currencies

When the PWA initializes, it should set both the list of available currencies and the current active currencies. This can be done by the following:

```js
import {receiveAvailableCurrencies, receiveSelectedCurrency} from 'mobify-integration-manager/dist/integration-manager/results'

// ...

// These currencies would likely be fetched from the backend
const availableCurrencies = [
    {
        code: 'USD',
        label: 'dollar',
        symbol: '$'
    },
    {
        code: 'GBP',
        label: 'pound sterling',
        symbol: '£'
    }
]

// The active currency might be determined by some other means
const selectedCurrency = availableCurrencies[0]

dispatch(receiveAvailableCurrencies(availableCurrencies))
dispatch(receiveSelectedCurrency(selectedCurrency))

// This ensures that the currency is correctly tracked in your analytics
dispatch(setCurrencyCode(selectedCurrency.code))
```

### Switching Currencies

When switching between currencies, it's as simple as fetching the list of available currencies with `getAvailableCurrencies`, passing the desired currency into the `receiveSelectedCurrency` action.

```js
import {getAvailableCurrencies} from 'progressive-web-sdk/dist/store/app/selectors'
import {receiveSelectedCurrency} from 'mobify-integration-manager/dist/integration-manager/results'

// ...

// Get the currencies from the current state, which usually happens in a Redux thunk
const availableCurrencies = getAvailableCurrencies(getState()).toJS()

// The other currency is selected somehow, probably through a user interaction
const newCurrency = availableCurrencies.find(currency => currency.code === 'GBP')

dispatch(receiveSelectedCurrency(newCurrency))
```

When the user changes their currency, send a [UI interaction analytics event](../../analytics/built-in-events#dispatching-currency-events).

## How to Remove react-intl

If you are working on a project that does not need a i18n support, or you would rather use a library other than react-intl, you'll need to do the following:

* Remove react-intl from your project
* Verify react-intl has been removed

### Remove react-intl

* Go to `web/app/components/intl/index.jsx`
* Delete this block of code:
    ```js
    import {
        IntlProvider as ReactIntlProvider,
        FormattedMessage as ReactFormattedMessage,
        FormattedNumber as ReactFormattedNumber,
        addLocaleData,
        injectIntl
    } from 'react-intl'
    import en from 'react-intl/locale-data/en'
    import ja from 'react-intl/locale-data/ja'
    ```
* Save the file

### Verify react-intl Has Been Removed

* Run `npm run analyze-build`
* Open `build/report.html`
* Check to make sure that `react-intl` (red border box in image below) is not in the `node_modules` section, the large yellow box (`vendor.js`)

You should not see this in your report:

<img src="analyze-build-check.png" alt="Analyze build check" />

Despite `react-intl` being gone, instances of i18n/l10n components and functions (i.e. FormattedText, `context.intl.formatNumber`, etc.) should be gradually removed from your application. Until they are removed, they will operate at a very basic level, thereby allowing your application to work as normal.

### Next Steps

At this point, you can install an i18n library of your own, build one from scratch, or ignore i18n altogether. The choice is yours!

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>