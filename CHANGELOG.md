## v2.2.0
- [new] Exports `withStylesPropTypes` ([#110](https://github.com/airbnb/react-with-styles/pull/110))

## v2.1.0
- [new] Actually export `resolveNoRTL` from the interface if it exists ([#98](https://github.com/airbnb/react-with-styles/pull/98))

## v2.0.0
- [new] Export `ThemedStyleSheet.resolveNoRTL` as `cssNoRTL` if it exists. ([#95](https://github.com/airbnb/react-with-styles/pull/95))
- [breaking] Remove contextual theming. ([#93](https://github.com/airbnb/react-with-styles/pull/93))

## v1.4.0

- [Deps] update `deepmerge`
- [Fix] update for React 15.5 changes

## v1.3.0

- [New] Adds empty style object when no style function is provided.

## v1.2.0

- [New] Add `pureComponent` option (requires React 15.3.0+).

## v1.1.1

- [Fix] Avoid copying withStyles propTypes (e.g. for `styles` and `theme`) from the wrapped component.

## v1.1.0

- [New] copy propTypes and defaultProps from the wrapped component.
- [Deps] Bump deepmerge dependency from ^0.2.1 to ^1.0.0.

## v1.0.0

- Extract interfaces to their own repos.
- Initial full release.

## v0.2.1

- Add scripts for building and publishing this package.

## v0.2.0

- Add `ThemeProvider` as a named export from project main.

## v0.1.1

- Fix `main` in package.json.

## v0.1.0

- Initial soft release.
