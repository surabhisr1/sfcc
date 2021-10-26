There are a lot of big changes with React 16 that require you to upgrade certain packages as well as your code in
order to support React 16 properly. This guide is meant for projects using version 0.24.1 and later of Mobify's `progressive-web-sdk`.

## Part 1: Upgrade your project to support React 15.6 

On the
[React blog post](https://reactjs.org/blog/2017/09/26/react-v16.0.html#upgrading)
it mentions that if your app runs 15.6 without warnings then it should work on
16. So with that in mind, we'll focus on upgrading to React 15.6 first. We will
focus on upgrading to React 16 in a future step.

You can find a detailed list of all the changes with React 15.6 on
[Reacts blog](https://reactjs.org/blog/2017/06/13/react-v15.6.0.html).

### Work with codemod on your project

The React team has built a very helpful tool,
[codemod](https://github.com/reactjs/react-codemod), that will help you
automatically transform your deprecated code with a command line. Use this tool
so you don’t have to change hundreds or thousands of lines of code by hand.

The list of codemod scripts that are available can be found in it’s
[github repository](https://github.com/reactjs/react-codemod#included-scripts).

To set up codemod within your project, follow these steps:

1. Go to the `/web` directory on your project
2. `npm install global add jscodeshift`, this will add jscodeshift
3. `git clone https://github.com/reactjs/react-codemod.git`, this will add
react-codemod
4. `cd react-codemod && npm install cd ..`
5. `jscodeshift -t <codemod-script> <path>` to transform your deprecated code.
For example, if you want to fix `prop-types` errors in jsx files in the components
directory, you can run something like:
`jscodeshift -t react-codemod/transforms/React-PropTypes-to-prop-types.js app/components/**/*`

When you are done with react-codemod on your project, you can delete it. It
should not be committed.

### Changes to the Progressive Web App to support React 15.6

#1. Upgrade packages to support React 15.6.0

```bash
npm install react@15.6.0 && npm install react-dom@15.6.0

```

#2. Remove `react-addons-shallow-compare` from your project

```bash
npm uninstall react-addons-shallow-compare
```

#3. Convert shallow components into pure components

Remove shallowCompare and rewrite components to use
[PureComponent](https://reactjs.org/docs/react-api.html#reactpurecomponent).

Here is an example to use `jscodeshift` to use `PureComponent` on your local
components.

```bash
jscodeshift -t react-codemod/transforms/pure-render-mixin.js app/components/**/*
```

Or, if you would rather do this manually, here is an example of switching from
`shallowCompare`.

```jsx
// Component that use shallowCompare
class SampleComponent extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }
    ...
}
```

```jsx
// Replace `React.Component` with `React.PureComponent`:
class Button extends React.PureComponent {
    ...
}
```

#4. Update `.eslintrc.yml` to support pure components

Update your `.eslintrc.yml` file to ignore `PureComponents`. Add the following
rules to your `.eslintrc.yml` file:

```yml
rules:
  react/prefer-stateless-function:
  - error
  - ignorePureComponents: true
```

#5. Replace `prop-types` imports

In older versions of React, you could access `PropTypes` from the react library.
As of React 16, `PropTypes` has been moved into its own `prop-types` package.

```bash
npm install prop-types --save
```

Next step is to remove all instances of `{PropTypes}` that import from react
and add:

```jsx
import PropTypes from 'prop-types'
```

#6. Remove reference to PropTypes from React objects

If any `PropTypes` were used directly from a React object, you will need to fix
the reference by removing the React object.

```bash
jscodeshift -t react-codemod/transforms/React-PropTypes-to-prop-types.js <path>
```

If you want to do this manually, search for "React.PropTypes" and remove the
`React.` part.

```jsx
React.PropTypes.string // this will break!

PropTypes.string // this is correct!
```

#7. Update Enzyme to ^3.3.0

You must upgrade Enzyme to 3.x or higher to support React ^15.6.0. The
transition from Enzyme 2.x to 3.x includes a number of breaking changes to
tests. Review Enzyme’s 2.x to 3.x
[migration guide](https://github.com/airbnb/enzyme/blob/master/docs/guides/migration-from-2-to-3.md)
to see what might impact your tests.

Some common fixes that you might find in upgrading Enzyme include the following:

**New Dependencies**

Install `react-test-renderer`, `react-transition-group`, and
`enzyme-adapter-react-15`.

```bash
npm install react-test-renderer@15.6.2 --save && npm install react-transition-group@1.0.0 --save && npm install enzyme-adapter-react-15@1.0.5 --save
```

**Dependency Updates**

Update `enzyme`, and `progressive-web-sdk`.

```bash
npm install enzyme@3.3.0 --save
```

Update your progressive-web-sdk to the most recent version. You can find the
most recent version available
[here](https://www.npmjs.com/package/progressive-web-sdk).

**Obsolete Dependencies**

Delete `react-addons-transition-group` and `react-addons-test-utils`.

```bash
npm uninstall react-addons-transition-group && npm uninstall react-addons-test-utils
```

**Fix Jest Setup**

Next step is to fix the Jest setup file to work with `enzyme-adapter-react-15`.
Open `web/tests/jest-setup.js` and update the file to include the following:

```js
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'

Enzyme.configure({adapter: new Adapter()})
```

#8. Fix any broken tests

Lastly, you will need to fix some of your tests to work with Enzyme ^3.3.0. You
will need to follow the migration guide to help you with fixing your test
errors.

That’s it for upgrading to React 15.6. More information on Enzyme working with
React 15, you can read
[here](http://airbnb.io/enzyme/docs/installation/react-15.html#working-with-react-15).

## Part 2: Upgrade your project to support React 16.2 

### Update your Node environment to 8

You need to be on Node 8 to support React 16. We recommend that you update Node
versions using nvm. If you don’t have nvm, follow the steps
[here](https://github.com/creationix/nvm#installation) to download nvm to your
machine.

```bash
nvm exec v8.10.0 node --version
```

This guide was written using v8.10.0. As such, you should use the same version,
otherwise there is no guarantee that these instructions will work for your
project.

### Changes to the Progressive Web App to support React 16

#1. Update Dependencies

**New Dependencies**

Install `raf` and `enzyme-adapter-react-16`.

```bash
npm install raf@3.4.0 --save && npm install enzyme-adapter-react-16@1.1.1 --save
```

**Dependency Updates**

Update `react-test-renderer`, `react`, `react-dom`, `react-redux`, and
`redux-form`.

```bash
npm install react-test-renderer@16.2.0 --save && npm install react@16.2.0 --save && npm install react-dom@16.2.0 --save && npm install react-redux@5.0.6 --save && npm install redux-form@7.2.1 --save
```

Also update the node engine in the package.json file to the following:

```js
"engines": {
  "node": "8.9.x || 9.x"
}
```

**Obsolete Dependencies**

Delete `enzyme-adapter-react-15`.

```bash
npm uninstall enzyme-adapter-react-15
```

#2. Fix `setup-jest.js` file

The `setup-jest.js` file will break after the dependency updates. To get your
tests to work with React 16 and Enzyme 3.x you will need to:

- change `enzyme-adapter-react-15` to `enzyme-adapter-react-16`, and
- import the raf (a `requestAnimationFrame` polyfill) package

We recommend that your jest setup file includes the following:

```jsx
import 'raf/polyfill' // fix requestAnimationFrame issue with polyfill
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import $ from '../app/static/js/jquery.min.js'

Enzyme.configure({adapter: new Adapter()})

// Parser tests need to be supplied a selector library
global.$ = $

// Prevents a console.error when using asset-utils/getAssetUrl in tests
global.document.head.innerHTML = '<head><script src="https://localhost:8443/loader.js"></script></head>'
```

#3. Fix Breakages from React 16

If your tests break with an error that looks like...

```bash
Expected mock function not to be called but it was called with:
["error", [Function onError]], ["error", [Function onError]], ["error", [Function onError]]
```

This happens when mocking the window.addEventListener or
`window.removeEventListener` methods with
[Jest mock functions](https://facebook.github.io/jest/docs/en/mock-functions.html)
.

These tests expect the event listener methods to be called a certain number of
times, but these assumptions are no longer reasonable because React 16’s
internal scripts actually call the event listeners for reasons not related to
your PWA’s unit tests.

Instead of testing that the functions are being called, test that the event
listeners are being called with specific parameters.

Replace all tests that mock `window.addEventListener` or
`window.removeEventListener`, such as the following:

```js
test('adds scroll listener when mounted', () => {
    const addEventListener = window.addEventListener
    window.addEventListener = jest.fn()

    const wrapper = mount(<component />)
    const handler = wrapper.instance().handleScroll

    expect(window.addEventListener).toHaveBeenCalled()

    window.addEventListener = addEventListener
})
```

... with the following change

```js
test('adds scroll listener when mounted', () => {
    const addEventListener = window.addEventListener

    // Remove this code...
    // window.addEventListener = jest.fn()
    // ...and replace it with this code...
    window.addEventListener = jest.fn(addEventListener)
    // ...because we must test that these methods are being called with specific parameter.


    const wrapper = mount(<component />)
    const handler = wrapper.instance().handleScroll

    // Remove this code...
    // expect(window.addEventListener).toHaveBeenCalled()
    // ...and replace it with this code...
    expect(window.addEventListener).toHaveBeenCalledWith('scroll', handler)
    // ...because we must test that these methods are being called with specific parameter.

    window.addEventListener = addEventListener
})
```

#4. Fix Breakages caused by Redux-Form changes

If you are testing mock redux-form
actions,
you might have to update how they are formatted.

Previously, such a mocked form action might look like:

```jsx
import {SubmissionError} from 'redux-form'

const createStopSubmitAction = (form, payload) => {
    return {
        type: 'redux-form/STOP_SUBMIT',
        meta: {
            form
        },
        payload
    }
}
```

... with the following change

```jsx
// add actionTypes to import from redux-form
import {actionTypes, SubmissionError} from 'redux-form'

const createStopSubmitAction = (form, payload) => {
    return {
        // Remove this code...
        // type: 'redux-form/STOP_SUBMIT',
        // ...and replace it with this code, because we now access STOP_SUBMIT via actionTypes.
        type: actionTypes.STOP_SUBMIT,
        meta: {
            form
        },
        payload
    }
}
```

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>