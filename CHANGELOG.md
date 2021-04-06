## v4.2.0
- [new] update `withStyles` to forward ref to inner component (@indiesquidge, [#240](https://github.com/airbnb/react-with-styles/pull/240))

## v4.1.0
- [new][performance] Cache by the resulting `WithStyles` HOC (@noratarano, [#234](https://github.com/airbnb/react-with-styles/pull/234))

## v4.0.1
- [fix] Use a WeakMap cache instead of a Map cache to prevent high memory usage (with fallback to Map) (@noratarano, [#230](https:    //github.com/airbnb/react-with-styles/pull/230))

## v4.0.0
- [breaking] Add @babel/runtime as a peer dependency (because of our dependency on babel-preset-airbnb) (@noratarano, [#229](https://github.com/airbnb/react-with-styles/pull/229))
- [new] Introduce the `useStyles` hook, which is still experimental. Use if you do not require performance optimizations for themed styles per component. (@noratarano, [#225](https://github.com/airbnb/react-with-styles/pull/225), [#221](https://github.com/airbnb/react-with-styles/pull/221))
- [new] Refactor `withStyles` to use a context-based implementation, rather than singletons in the `ThemedStyleSheet`. Works in a backward compatible way with the `ThemedStyleSheet` implementation. Note that this may break existing usages of the HOC if a wrapping component  of a component using `withStyles` uses `contextTypes` and hoists `contextType` (usually accidentally). (@noratarano, [#225](https://github.com/airbnb/react-with-styles/pull/225/files), [#221](https://github.com/airbnb/react-with-styles/pull/221))
- [breaking] Drop support for node 6 (@noratarano, [#219](https://github.com/airbnb/react-with-styles/pull/219))

## v3.2.3
- [fix] Add .git to .npmignore

## v3.2.2
- [dev] Clear performance marks before setting (@mmarkelov, [#214](https://github.com/airbnb/react-with-styles/pull/214))
- [deps] Update `prop-types`, `hoist-non-react-statics`
- [deps] Replace `deepmerge` with `object.assign`

## v3.2.1
- [deps] Update `hoist-non-react-statics`, `prop-types`, `react-with-direction`
- [fix] Move work out of render and into state ([#156](https://github.com/airbnb/react-with-styles/pull/156))
- [fix] Use `this.context` instead of constructor arguments directly ([#154](https://github.com/airbnb/react-with-styles/pull/154))

## v3.2.0
- [new] Add `performance.mark()` and `performance.measure()` in development ([#141](https://github.com/airbnb/react-with-styles/pull/141))

## v3.1.1
- [fix] Remove unnecessary `ThemedStyleSheet` caching ([#130](https://github.com/airbnb/react-with-styles/pull/135))

## v3.1.0
- [new] Add back default create/resolve methods to ThemedStyleSheet ([#130](https://github.com/airbnb/react-with-styles/pull/130))

## v3.0.0
- [breaking] Send css method down as a prop; remove cssNoRTL and some ThemedStyleSheet methods ([#124](https://github.com/airbnb/react-with-styles/pull/124))

## v2.4.0
- [new] Recreate styles on render when the theme changes ([#128](https://github.com/airbnb/react-with-styles/pull/128))

## v2.3.1
- [fix] Remove unnecessary `makeFromThemes`/`styles` globals from the `ThemedStyleSheet` ([#122](https://github.com/airbnb/react-with-styles/pull/122))

## v2.3.0
- [new] Add contextual StyleSheet creation based on direction ([#117](https://github.com/airbnb/react-with-styles/pull/117))

## v2.2.1
- [fix] Defer `Stylesheet.create` to `componentWillMount` of `withStyles` ([#115](https://github.com/airbnb/react-with-styles/pull/115))

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
