# react-with-styles

This is a higher-order function that returns a higher-order component used to wrap React components to add styles using the theme provided from context. We use this to abstract away the context, to make themed styles easier to work with.

Example usage:

```jsx
function MyComponent({ styles }) {
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

Or, as a decorator:

```jsx
@withStyles(({ color, unit }) => ({
  container: {
    color: color.primary,
    marginBottom: 2 * unit,
  },
}))
export default function MyComponent({ styles }) {
  return (
    <div {...css(styles.container)}>
      Try to be a rainbow in someone's cloud.
    </div>
  );
}
```

By default this will pass down the styles to the wrapped component in the `styles` prop, but the name of this prop can be customized by setting the `stylesPropName` option.

```jsx
function MyComponent({ classNames }) {
  return (
    <div {...css(classNames.container)}>
      Try to be a rainbow in someone's cloud.
    </div>
  );
}

export default withStyles(({ color, unit }) => ({
  container: {
    color: color.primary,
    marginBottom: 2 * unit,
  },
}), { stylesPropName: 'classNames' })(MyComponent);
```

The theme is also passed down so components can use variables from the theme outside of Aphrodite styles (e.g. as props to other components). The theme prop name can also be customized by setting the `themePropName` option.

```jsx
function MyComponent({ classNames, themeThings }) {
  return (
    <div {...css(classNames.container)}>
      <Background color={themeThings.color.primary}>
        Try to be a rainbow in someone's cloud.
      </Background>
    </div>
  );
}

export default withStyles(({ color, unit }) => ({
  container: {
    color: color.primary,
    marginBottom: 2 * unit,
  },
}), { stylesPropName: 'classNames', themePropName: 'themeThings' })(MyComponent);
```
