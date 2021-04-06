# react-with-styles <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![Build Status][travis-svg]][travis-url]
[![dependency status][deps-svg]][deps-url]
[![dev dependency status][dev-deps-svg]][dev-deps-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

Use CSS-in-JavaScript for your React components without being tightly coupled to one implementation (e.g. [Aphrodite][aphrodite], [Radium][radium], or [React Native][react-native]). Easily access shared theme information (e.g. colors, fonts) when defining your styles.

## Interfaces

- [Aphrodite][interface-aphrodite]
- [JSS][interface-jss]
- [React Native][interface-react-native]
- [CSS][interface-css]

[interface-aphrodite]: https://github.com/airbnb/react-with-styles-interface-aphrodite
[interface-jss]: https://github.com/oliviertassinari/react-with-styles-interface-jss
[interface-react-native]: https://github.com/airbnb/react-with-styles-interface-react-native
[interface-css]: https://github.com/airbnb/react-with-styles-interface-css

## Other resources

- [eslint-plugin-react-with-styles][eslint-plugin-react-with-styles]: ESLint plugin for react-with-styles.

[eslint-plugin-react-with-styles]: https://github.com/airbnb/eslint-plugin-react-with-styles

## How to use

### Step 1. Define your theme

Create a module that exports an object with shared theme information like colors.

```js
export default {
  color: {
    primary: '#FF5A5F',
    secondary: '#00A699',
  },
};
```

### Step 2. Choose an interface

You will need to choose the `react-with-styles` interface that corresponds to the underlying CSS-in-JS framework that you use in your app. Take a look through the list of [existing interfaces](#interfaces), or write your own!

If you choose to write your own, the interface must implement the following functions:

Function | Description
--- | ---
`create` | Function that outputs the `styles` object injected through props.<br />(Optional, but required if `createLTR` is not provided).
`createLTR` | LTR version of `create`.<br />(Required, unless a `create` function is provided)
`createRTL` | RTL version of `create`.<br />(Required, unless a `create` function is provided)
`resolve` | This is the `css` function that is injected through props. It outputs the attributes used to style an HTML element.<br />(Optional, but required if no `resolveLTR` is provided)
`resolveLTR` | LTR version of `resolve`.<br />(Required, unless the `resolve` function is provided)
`resolveRTL` | RTL version of `resolve`.<br />(Required, unless the `resolve` function is provided)
`flush?` | Flush buffered styles before rendering. This can mean anything you need to happen before rendering.<br />(Optional)

### Step 3. Register the chosen theme and interface

#### Option 1: Using React Context (recommended)

☝️ _Requires React 16.6+_

As of version `4.0.0`, registering the theme and interface can be accomplished through [React context](https://reactjs.org/docs/context.html), and is the recommended way of registering the theme, interface, and direction.

For example, if your theme is exported by `MyTheme.js`, and you want to use Aphrodite through the `react-with-styles-interface-aphrodite` insterface, wrap your application with the `WithStylesContext.Provider` to provide `withStyles` with that interface and theme:

```jsx
import React from 'react';
import WithStylesContext from 'react-with-styles/lib/WithStylesContext';
import AphroditeInterface from 'react-with-styles-interface-aphrodite';
import MyTheme from './MyTheme';

export default function Bootstrap({ direction }) {
  return (
    <WithStylesContext.Provider
      value={{
        stylesInterface: AphroditeInterface,
        stylesTheme: MyTheme,
        direction,
      }}
    >
      <App />
    </WithStylesContext.Provider>
  );
}
```

To support your users in an RTL context, we recommend using `react-with-styles` along with [`react-with-direction`](https://github.com/airbnb/react-with-direction). You can provide the direction directly if you have a utility that determines it like in the example above, or you can use the provided utility, `WithStylesDirectionAdapter`, to grab the direction that's already been set on the `react-with-direction` context and amend `WithStylesContext` with it.

```jsx
import React from 'react';
import WithStylesContext from 'react-with-styles/lib/WithStylesContext';
import WithStylesDirectionAdapter from 'react-with-styles/lib/providers/WithStylesDirectionAdapter';
import AphroditeInterface from 'react-with-styles-interface-aphrodite';
import MyTheme from './MyTheme';

export default function Bootstrap() {
  return (
    <WithStylesContext.Provider
      value={{
        stylesInterface: AphroditeInterface,
        stylesTheme: MyTheme,
      }}
    >
      <WithStylesDirectionAdapter>
        <App />
      </WithStylesDirectionAdapter>
    </WithStylesContext.Provider>
  );
}
```

Or simply wrap the `Bootstrap` function above in `withDirection` yourself.

☝️ **Note on performance**: Changing the theme many times will cause components to recalculate their styles. Avoid recalculating styles by providing one theme at the highest possible level of your app.

#### Option 2: Using the ThemedStyleSheet (legacy)

The legacy singleton-based API (using `ThemedStyleSheet`) is still supported, so you can still use it to register the theme and interface. You do not have to do this if you use the `WithStylesContext.Provider`. Keep in mind that this API will be deprecated in the next major version of `react-with-styles`. You can set this up in your own `withStyles.js` file, like so:

```js
import ThemedStyleSheet from 'react-with-styles/lib/ThemedStyleSheet';
import AphroditeInterface from 'react-with-styles-interface-aphrodite';
import { withStyles } from 'react-with-styles';

import MyTheme from './MyTheme';

ThemedStyleSheet.registerTheme(MyTheme);
ThemedStyleSheet.registerInterface(AphroditeInterface);

export { withStyles, ThemedStyleSheet };
```

It is convenient to pass through `withStyles` from `react-with-styles` here so that everywhere you use them you can be assured that the theme and interface have been registered. You could likely also set this up as an initializer that is added to the top of your bundles and then use `react-with-styles` directly in your components.

✋ Because the `ThemedStyleSheet` implementation stores the theme and interface in variables outside of the React tree, we do not recommended it. This approach does not parallelize, especially if your build systems or apps require rendering with multiple themes.

### Step 4. Styling your components

In your components, use `withStyles()` to define styles. This HOC will inject the right props to consume them through the CSS-in-JS implementation you chose.

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, withStylesPropTypes } from './withStyles';

const propTypes = {
  ...withStylesPropTypes,
};

function MyComponent({ styles, css }) {
  return (
    <div>
      <a
        href="/somewhere"
        {...css(styles.firstLink)}
      >
        A link to somewhere
      </a>

      {' '}
      and
      {' '}

      <a
        href="/somewhere-else"
        {...css(styles.secondLink)}
      >
        a link to somewhere else
      </a>
    </div>
  );
}

MyComponent.propTypes = propTypes;

export default withStyles(({ color }) => ({
  firstLink: {
    color: color.primary,
  },

  secondLink: {
    color: color.secondary,
  },
}))(MyComponent);
```

You can also use [the `useStyles` hook or a decorator](#withstyles-stylesthunk--options--).

---

## Documentation

### `withStyles([ stylesThunk [, options ] ])`

This is a higher-order function that returns a higher-order component used to wrap React components to add styles using the theme. We use this to make themed styles easier to work with.

`stylesThunk` will receive the theme as an argument, and it should return an object containing the styles for the component.

The wrapped component will receive the following props:

1. `styles` - Object containing the processed styles for this component. It corresponds to evaluating `stylesInterface.create(stylesThunk(theme))` (or their directional counterparts).
2. `css` - Function to produce props to set the styles with on an element. It corresponds to `stylesInterface.resolve` (or their directional counterparts).
3. `theme` - This is the theme object that was registered. You can use it during render as needed, say for inline styles.

#### Example usage

You can use `withStyles()` as an HOC:

```jsx
import React from 'react';
import { withStyles } from './withStyles';

function MyComponent({ css, styles }) {
  return (
    <div {...css(styles.container)}>
      Try to be a rainbow in someone's cloud.
    </div>
  );
}

export default withStyles(({ color, unit }) => ({
  container: {
    color: color.primary,
    marginBottom: 2 * unit,
  },
}))(MyComponent);
```

As a decorator:

```jsx
import React from 'react';
import { withStyles } from './withStyles';

@withStyles(({ color, unit }) => ({
  container: {
    color: color.primary,
    marginBottom: 2 * unit,
  },
}))
export default function MyComponent({ styles, css }) {
  return (
    <div {...css(styles.container)}>
      Try to be a rainbow in someone's cloud.
    </div>
  );
}
```

You can also use the experimental hook:

```jsx
import React from 'react';
import useStyles from 'react-with-styles/lib/hooks/useStyles';

function stylesFn({ color, unit }) {
  return ({
    container: {
      color: color.primary,
      marginBottom: 2 * unit,
    },
  });
}

export default function MyComponent() {
  const { css, styles } = useStyles({ stylesFn });
  return (
    <div {...css(styles.container)}>
      Try to be a rainbow in someone's cloud.
    </div>
  );
}
```

#### Options

##### `pureComponent` (default: `false`)

By default `withStyles()` will create a functional component. If you want to apply the rendering optimizations offered by `React.memo`, you can set the `pureComponent` option to `true` to create a pure functional component instead.

If using the `withStyles` utility that is found in `lib/deprecated/withStyles`, it will instead use a `React.PureComponent` rather than a `React.Component`. Note that this has a React version requirement of 15.3.0+.

#### `stylesPropName` (default: `'styles'`)

By default, `withStyles()` will pass down the styles to the wrapped component in the `styles` prop, but the name of this prop can be customized by setting the `stylesPropName` option. This is useful if you already have a prop called `styles` and aren't able to change it.

```jsx
import React from 'react';
import { withStyles, withStylesPropTypes } from './withStyles';

function MyComponent({ withStylesStyles, css }) {
  return (
    <div {...css(withStylesStyles.container)}>
      Try to be a rainbow in someone's cloud.
    </div>
  );
}

MyComponent.propTypes = {
  ...withStylesPropTypes,
};

export default withStyles(({ color, unit }) => ({
  container: {
    color: color.primary,
    marginBottom: 2 * unit,
  },
}), { stylesPropName: 'withStylesStyles' })(MyComponent);
```

##### `cssPropName` (default `'css'`)

The css prop name can also be customized by setting the `cssPropName` option.

```jsx
import React from 'react';
import { withStyles, withStylesPropTypes } from './withStyles';

function MyComponent({ withStylesCss, styles }) {
  return (
    <div {...withStylesCss(styles.container)}>
      Try to be a rainbow in someone's cloud.
    </div>
  );
}

MyComponent.propTypes = {
  ...withStylesPropTypes,
};

export default withStyles(({ color, unit }) => ({
  container: {
    color: color.primary,
    marginBottom: 2 * unit,
  },
}), { cssPropName: 'withStylesCss' })(MyComponent);
```

##### `themePropName` (default `'theme'`)

The theme prop name can also be customized by setting the `themePropName` option.

```jsx
import React from 'react';
import { withStyles, withStylesPropTypes } from './withStyles';

function MyComponent({ css, styles, withStylesTheme }) {
  return (
    <div {...css(styles.container)}>
      <Background color={withStylesTheme.color.primary}>
        Try to be a rainbow in someone's cloud.
      </Background>
    </div>
  );
}

MyComponent.propTypes = {
  ...withStylesPropTypes,
};

export default withStyles(({ color, unit }) => ({
  container: {
    color: color.primary,
    marginBottom: 2 * unit,
  },
}), { themePropName: 'withStylesTheme' })(MyComponent);
```

##### `flushBefore` (default: `false`)

Some components depend on previous styles to be ready in the component tree when mounting (e.g. dimension calculations). Some interfaces add styles to the page asynchronously, which is an obstacle for this. So, we provide the option of flushing the buffered styles before the rendering cycle begins. It is up to the interface to define what this means.

### `css(...styles)`

This function takes styles that were processed by `withStyles()`, plain objects, or arrays of these things. It returns an object with attributes that must be spread into a JSX element. We recommend not inspecting the results and spreading them directly onto the element. In other words `className` and `style` props must not be used on the same elements as `css()`.

```jsx
import React from 'react';
import { withStyles, withStylesPropTypes } from './withStyles';

const propTypes = {
  ...withStylesPropTypes,
};

function MyComponent({ css, styles, bold, padding, }) {
  return (
    <div {...css(styles.container, { padding })}>
      Try to be a rainbow in{' '}
      <a
        href="/somewhere"
        {...css(styles.link, bold && styles.link_bold)}
      >
        someone's cloud
      </a>
    </div>
  );
}

MyComponent.propTypes = propTypes;

export default withStyles(({ color, unit }) => ({
  container: {
    color: color.primary,
    marginBottom: 2 * unit,
  },

  link: {
    color: color.secondary,
  },

  link_bold: {
    fontWeight: 700,
  },
}))(MyComponent);
```

### Accessing your wrapped component with a ref

React 16.3 introduced the ability to pass along refs with the [`React.forwardRef`][react-forward-ref]
helper, allowing you to write code like this.

```jsx
const MyComponent = React.forwardRef(
  function MyComponent({ css, styles }, forwardedRef) {
    return (
      <div {...css(styles.container)} ref={forwardedRef}>
        Hello, World
      </div>
    );
  }
);
```

Refs will not get passed through HOCs by default because `ref` is not a prop. If
you add a ref to an HOC, the ref will refer to the outermost container component,
which is usually not desired. `withStyles` is set up to pass along your ref to
the wrapped component.

```jsx
const MyComponentWithStyles = withStyles(({ color, unit }) => ({
  container: {
    color: color.primary,
    marginBottom: 2 * unit,
  },
}))(MyComponent);

// the ref will be passed down to MyComponent, which is then attached to the div
const ref = React.createRef()
<MyComponentWithStyles ref={ref} />
```

### `ThemedStyleSheet` (legacy)

Registers themes and interfaces.

**⚠️ Deprecation Warning**: `ThemedStyleSheet` is going to be deprecated in the next major version. Please migrate your applications to use `WithStylesContext` to provide the theme and interface to use along with `withStyles` or `useStyles`. In the meantime, you should be able to use both inside your app for a smooth migration. If this is not the case, please file an issue so we can help.

#### `ThemedStyleSheet.registerTheme(theme)` (legacy)

Registers the theme. `theme` is an object with properties that you want to be made available when styling your components.

```js
import ThemedStyleSheet from 'react-with-styles/lib/ThemedStyleSheet';

ThemedStyleSheet.registerTheme({
  color: {
    primary: '#FF5A5F',
    secondary: '#00A699',
  },
});
```

#### `ThemedStyleSheet.registerInterface(interface)` (legacy)

Instructs react-with-styles how to process your styles.

```js
import ThemedStyleSheet from 'react-with-styles/lib/ThemedStyleSheet';
import AphroditeInterface from 'react-with-styles-interface-aphrodite';

ThemedStyleSheet.registerInterface(AphroditeInterface);
```

---

## Other Examples

### With React Router's `Link`

[React Router][react-router]'s [`<Link/>`][react-router-link] and [`<IndexLink/>`][react-router-index-link] components accept `activeClassName='...'` and `activeStyle={{...}}` as props. As previously stated, `css(...styles)` must spread to JSX, so simply passing `styles.thing` or even `css(styles.thing)` directly will not work. In order to mimic `activeClassName`/`activeStyles` you can use React Router's [`withRouter()`][react-router-with-router] Higher Order Component to pass `router` as prop to your component and toggle styles based on [`router.isActive(pathOrLoc, indexOnly)`](react-router-is-active). This works because `<Link />` passes down the generated `className` from `css(..styles)` down through to the final leaf.

```jsx
import React from 'react';
import { withRouter, Link } from 'react-router';
import { css, withStyles } from '../withStyles';

function Nav({ router, styles }) {
  return (
    <div {...css(styles.container)}>
      <Link
        to="/"
        {...css(styles.link, router.isActive('/', true) && styles.link_bold)}
      >
        home
      </Link>
      <Link
        to="/somewhere"
        {...css(styles.link, router.isActive('/somewhere', true) && styles.link_bold)}
      >
        somewhere
      </Link>
    </div>
  );
}

export default withRouter(withStyles(({ color, unit }) => ({
  container: {
    color: color.primary,
    marginBottom: 2 * unit,
  },

  link: {
    color: color.primary,
  },

  link_bold: {
    fontWeight: 700,
  }
}))(Nav));
```

---

## In the wild

[Organizations and projects using `react-with-styles`](INTHEWILD.md).

[package-url]: https://npmjs.org/package/react-with-styles
[npm-version-svg]: http://versionbadg.es/airbnb/react-with-styles.svg
[travis-svg]: https://travis-ci.org/airbnb/react-with-styles.svg
[travis-url]: https://travis-ci.org/airbnb/react-with-styles
[deps-svg]: https://david-dm.org/airbnb/react-with-styles.svg
[deps-url]: https://david-dm.org/airbnb/react-with-styles
[dev-deps-svg]: https://david-dm.org/airbnb/react-with-styles/dev-status.svg
[dev-deps-url]: https://david-dm.org/airbnb/react-with-styles#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/react-with-styles.png?downloads=true&stars=true
[license-image]: http://img.shields.io/npm/l/react-with-styles.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/react-with-styles.svg
[downloads-url]: http://npm-stat.com/charts.html?package=react-with-styles

[aphrodite]: https://github.com/khan/aphrodite
[radium]: https://formidable.com/open-source/radium/
[react-forward-ref]: https://reactjs.org/docs/forwarding-refs.html
[react-native]: https://facebook.github.io/react-native/
[react-router]: https://github.com/reactjs/react-router
[react-router-link]: https://github.com/reactjs/react-router/blob/master/docs/API.md#link
[react-router-index-link]: https://github.com/reactjs/react-router/blob/master/docs/API.md#indexlink
[react-router-with-router]: https://github.com/reactjs/react-router/blob/master/docs/API.md#withroutercomponent-options
[react-router-is-active]: https://github.com/reactjs/react-router/blob/master/docs/API.md#isactivepathorloc-indexonly
