import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { render, shallow } from 'enzyme';
import sinon from 'sinon-sandbox';
import DirectionProvider, { DIRECTIONS } from 'react-with-direction/dist/DirectionProvider';

import ThemedStyleSheet from '../src/ThemedStyleSheet';
import { withStyles, withStylesPropTypes } from '../src/withStyles';

describe('withStyles()', () => {
  const defaultTheme = {
    color: {
      red: '#990000',
    },
  };

  let testInterface;
  let testInterfaceResolveLTRStub;
  let testInterfaceResolveRTLStub;

  beforeEach(() => {
    testInterface = {
      create() {},
      createLTR() {},
      createRTL() {},
      resolve() {},
      resolveLTR() {},
      resolveRTL() {},
      flush: sinon.spy(),
    };
    sinon.stub(testInterface, 'create').callsFake(styleHash => styleHash);
    sinon.stub(testInterface, 'createLTR').callsFake(styleHash => styleHash);
    sinon.stub(testInterface, 'createRTL').callsFake(styleHash => styleHash);
    const fakeResolveMethod = styles => ({
      style: styles.reduce((result, style) => Object.assign(result, style)),
    });
    sinon.stub(testInterface, 'resolve').callsFake(fakeResolveMethod);
    testInterfaceResolveLTRStub = sinon.stub(testInterface, 'resolveLTR')
      .callsFake(fakeResolveMethod);
    testInterfaceResolveRTLStub = sinon.stub(testInterface, 'resolveRTL')
      .callsFake(fakeResolveMethod);

    ThemedStyleSheet.registerTheme(defaultTheme);
    ThemedStyleSheet.registerInterface(testInterface);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('without a styleFn', () => {
    it('returns the HOC function', () => {
      expect(typeof withStyles()).to.equal('function');
    });

    it('does not create styles', () => {
      withStyles();
      expect(testInterface.create.callCount).to.equal(0);
      expect(testInterface.createLTR.callCount).to.equal(0);
      expect(testInterface.createRTL.callCount).to.equal(0);
    });
  });

  it('returns the HOC function', () => {
    expect(typeof withStyles(() => ({}))).to.equal('function');
  });

  describe('HOC', () => {
    describe('StyleSheet creation', () => {
      it('creates the styles in a non-directional context', () => {
        function MyComponent() {
          return null;
        }

        const WrappedComponent = withStyles(() => ({}))(MyComponent);
        shallow(<WrappedComponent />);
        expect(testInterface.createLTR.callCount).to.equal(1);
      });

      it('creates the styles in an LTR context', () => {
        function MyComponent() {
          return null;
        }

        const WrappedComponent = withStyles(() => ({}))(MyComponent);
        render((
          <DirectionProvider direction={DIRECTIONS.LTR}>
            <WrappedComponent />
          </DirectionProvider>
        ));
        expect(testInterface.createLTR.callCount).to.equal(1);
      });

      it('creates the styles in an RTL context', () => {
        function MyComponent() {
          return null;
        }

        const WrappedComponent = withStyles(() => ({}))(MyComponent);
        render((
          <DirectionProvider direction={DIRECTIONS.RTL}>
            <WrappedComponent />
          </DirectionProvider>
        ));
        expect(testInterface.createRTL.callCount).to.equal(1);
      });
    });

    describe('StyleSheet clobbering', () => {
      it('recreates the styles for all components when a new theme is registered', () => {
        function MyComponent() {
          return null;
        }
        const WrappedComponent = withStyles(() => ({}))(MyComponent);
        const OtherWrappedComponent = withStyles(() => ({}))(MyComponent);

        expect(testInterface.createLTR.callCount).to.equal(0);
        shallow(<WrappedComponent />);
        expect(testInterface.createLTR.callCount).to.equal(1);
        shallow(<OtherWrappedComponent />);
        expect(testInterface.createLTR.callCount).to.equal(2);

        const otherTheme = { unit: 8 };
        ThemedStyleSheet.registerTheme(otherTheme);
        ThemedStyleSheet.registerTheme(otherTheme);
        shallow(<WrappedComponent />);
        expect(testInterface.createLTR.callCount).to.equal(3);
        shallow(<OtherWrappedComponent />);
        expect(testInterface.createLTR.callCount).to.equal(4);
      });

      it('does not recreate styles when the same theme is registered', () => {
        function MyComponent() {
          return null;
        }
        const WrappedComponent = withStyles(() => ({}))(MyComponent);

        expect(testInterface.createLTR.callCount).to.equal(0);
        shallow(<WrappedComponent />);
        expect(testInterface.createLTR.callCount).to.equal(1);

        ThemedStyleSheet.registerTheme(defaultTheme);
        shallow(<WrappedComponent />);
        expect(testInterface.createLTR.callCount).to.equal(1);
      });

      it('recreates all RTL styles when a new theme is registered', () => {
        function MyComponent() {
          return null;
        }
        const WrappedComponent = withStyles(() => ({}))(MyComponent);

        expect(testInterface.createRTL.callCount).to.equal(0);
        render((
          <DirectionProvider direction={DIRECTIONS.RTL}>
            <WrappedComponent />
          </DirectionProvider>
        ));
        expect(testInterface.createRTL.callCount).to.equal(1);

        expect(testInterface.createLTR.callCount).to.equal(0);
        render(<WrappedComponent />);
        expect(testInterface.createLTR.callCount).to.equal(1);

        const otherTheme = { unit: 8 };
        ThemedStyleSheet.registerTheme(otherTheme);
        render((
          <DirectionProvider direction={DIRECTIONS.RTL}>
            <WrappedComponent />
          </DirectionProvider>
        ));
        expect(testInterface.createRTL.callCount).to.equal(2);
        expect(testInterface.createLTR.callCount).to.equal(1);
        render(<WrappedComponent />);
        expect(testInterface.createLTR.callCount).to.equal(2);
      });

      it('does not recreate RTL styles when the same theme is registered', () => {
        function MyComponent() {
          return null;
        }
        const WrappedComponent = withStyles(() => ({}))(MyComponent);

        expect(testInterface.createRTL.callCount).to.equal(0);
        render((
          <DirectionProvider direction={DIRECTIONS.RTL}>
            <WrappedComponent />
          </DirectionProvider>
        ));
        expect(testInterface.createRTL.callCount).to.equal(1);

        ThemedStyleSheet.registerTheme(defaultTheme);
        render((
          <DirectionProvider direction={DIRECTIONS.RTL}>
            <WrappedComponent />
          </DirectionProvider>
        ));
        expect(testInterface.createRTL.callCount).to.equal(1);
      });
    });

    it('has a wrapped displayName', () => {
      function MyComponent() {
        return null;
      }

      const result = withStyles(() => ({}))(MyComponent);
      expect(result.displayName).to.equal('withStyles(MyComponent)');
    });

    it('passes the theme to the wrapped component', () => {
      function MyComponent({ theme }) {
        expect(theme).to.eql(defaultTheme);
        return null;
      }

      const Wrapped = withStyles(() => ({}))(MyComponent);
      shallow(<Wrapped />).dive();
    });

    it('allows the theme prop name to be customized', () => {
      function MyComponent({ foo }) {
        expect(foo).to.eql(defaultTheme);
        return null;
      }

      const Wrapped = withStyles(() => ({}), { themePropName: 'foo' })(MyComponent);
      shallow(<Wrapped />).dive();
    });

    it('passes processed styles to wrapped component', () => {
      function MyComponent({ styles }) {
        expect(styles).to.eql({ foo: { color: '#990000' } });
        return null;
      }

      const Wrapped = withStyles(({ color }) => ({
        foo: {
          color: color.red,
        },
      }))(MyComponent);
      shallow(<Wrapped />).dive();
    });

    it('passes an empty styles object without a styleFn', () => {
      function MyComponent({ styles }) {
        expect(styles).to.eql({});
        return null;
      }

      const Wrapped = withStyles()(MyComponent);
      shallow(<Wrapped />).dive();
    });

    it('allows the styles prop name to be customized', () => {
      function MyComponent({ bar }) {
        expect(bar).to.eql({ foo: { color: '#ff0000' } });
        return null;
      }

      const Wrapped = withStyles(() => ({
        foo: {
          color: '#ff0000',
        },
      }), { stylesPropName: 'bar' })(MyComponent);
      shallow(<Wrapped />).dive();
    });

    it('does not flush styles before rendering', () => {
      function MyComponent() {
        return null;
      }

      const Wrapped = withStyles(() => ({}))(MyComponent);
      shallow(<Wrapped />);
      expect(testInterface.flush.callCount).to.equal(0);
    });

    it('with the flushBefore option set, flushes styles before rendering', () => {
      function MyComponent() {
        return null;
      }

      const Wrapped = withStyles(() => ({}), { flushBefore: true })(MyComponent);
      shallow(<Wrapped />);
      expect(testInterface.flush.callCount).to.equal(1);
    });

    it('hoists statics', () => {
      function MyComponent() {
        return null;
      }
      MyComponent.foo = 'bar';

      const Wrapped = withStyles(() => ({}), { flushBefore: true })(MyComponent);
      expect(Wrapped.foo).to.equal('bar');
    });

    it('works with css prop', () => {
      function MyComponent({ css, styles }) {
        return <div {...css(styles.foo)} />;
      }
      MyComponent.propTypes = {
        ...withStylesPropTypes,
      };

      const Wrapped = withStyles(({ color }) => ({
        foo: {
          color: color.red,
        },
      }))(MyComponent);
      const wrapper = shallow(<Wrapped />).dive();

      expect(wrapper.prop('style')).to.eql({ color: '#990000' });
    });

    it('copies over non-withStyles propTypes and defaultProps', () => {
      // TODO: fix eslint-plugin-react bug
      // eslint-disable-next-line react/prop-types
      function MyComponent({ css, styles, theme }) {
        return (
          <div {...css(styles.foo)}>
            {theme.color.default}
          </div>
        );
      }
      MyComponent.propTypes = {
        ...withStylesPropTypes,
        foo: PropTypes.number,
      };
      MyComponent.defaultProps = {
        foo: 3,
      };

      const Wrapped = withStyles(({ color }) => ({
        foo: {
          color: color.red,
        },
      }))(MyComponent);

      // copied
      const expectedPropTypes = { ...MyComponent.propTypes };
      delete expectedPropTypes.styles;
      delete expectedPropTypes.theme;
      delete expectedPropTypes.css;
      expect(Wrapped.propTypes).to.eql(expectedPropTypes);
      expect(MyComponent.propTypes).to.include.keys('styles', 'theme');

      expect(Wrapped.defaultProps).to.eql(MyComponent.defaultProps);

      // cloned
      expect(Wrapped.propTypes).not.to.equal(MyComponent.propTypes);
      expect(Wrapped.defaultProps).not.to.equal(MyComponent.defaultProps);
    });

    it('extends React.Component', () => {
      function MyComponent() {
        return null;
      }

      const Wrapped = withStyles(() => ({}))(MyComponent);
      expect(Object.getPrototypeOf(Wrapped)).to.equal(React.Component);
      expect(Object.getPrototypeOf(Wrapped.prototype)).to.equal(React.Component.prototype);
      expect(Object.getPrototypeOf(Wrapped)).not.to.equal(React.PureComponent);
      expect(Object.getPrototypeOf(Wrapped.prototype)).not.to.equal(React.PureComponent.prototype);
    });

    it('with the pureComponent option set, extends React.PureComponent', () => {
      function MyComponent() {
        return null;
      }

      const Wrapped = withStyles(() => ({}), { pureComponent: true })(MyComponent);
      expect(Object.getPrototypeOf(Wrapped)).not.to.equal(React.Component);
      expect(Object.getPrototypeOf(Wrapped.prototype)).not.to.equal(React.Component.prototype);
      expect(Object.getPrototypeOf(Wrapped)).to.equal(React.PureComponent);
      expect(Object.getPrototypeOf(Wrapped.prototype)).to.equal(React.PureComponent.prototype);
    });
  });

  describe('css', () => {
    it('css calls resolveLTR method in non-directional context', () => {
      function MyComponent({ css }) {
        return <div {...css({ color: 'red' })} />;
      }
      MyComponent.propTypes = {
        ...withStylesPropTypes,
      };

      const WrappedComponent = withStyles(() => ({}))(MyComponent);

      render(<WrappedComponent />);
      expect(testInterfaceResolveLTRStub.callCount).to.equal(1);
    });

    it('css calls resolveLTR method in LTR context', () => {
      function MyComponent({ css }) {
        return <div {...css({ color: 'red' })} />;
      }
      MyComponent.propTypes = {
        ...withStylesPropTypes,
      };

      const WrappedComponent = withStyles(() => ({}))(MyComponent);

      render((
        <DirectionProvider direction={DIRECTIONS.LTR}>
          <WrappedComponent />
        </DirectionProvider>
      ));
      expect(testInterfaceResolveLTRStub.callCount).to.equal(1);
    });

    it('css calls resolveRTL method in RTL context', () => {
      function MyComponent({ css }) {
        return <div {...css({ color: 'red' })} />;
      }
      MyComponent.propTypes = {
        ...withStylesPropTypes,
      };

      const WrappedComponent = withStyles(() => ({}))(MyComponent);

      render((
        <DirectionProvider direction={DIRECTIONS.RTL}>
          <WrappedComponent />
        </DirectionProvider>
      ));
      expect(testInterfaceResolveRTLStub.callCount).to.equal(1);
    });
  });

  describe('extendStyles', () => {
    it('extends styles in a non-directional context', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
          },
        }),
        {
          extendableStyles: {
            container: {
              background: () => true,
            },
          },
        },
      )(MyComponent);
      const ExtendedComponent = WrappedComponent.extendStyles(() => ({
        container: {
          background: 'green',
        },
      }));

      render(
        <ExtendedComponent />,
      );

      expect(testInterface.createLTR.callCount).to.equal(1);
      expect(testInterface.createLTR.getCall(0).args[0]).to.eql({
        container: {
          background: 'green',
          color: 'blue',
        },
      });
    });

    it('extends styles in an LTR context', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
          },
        }),
        {
          extendableStyles: {
            container: {
              background: () => true,
            },
          },
        },
      )(MyComponent);
      const ExtendedComponent = WrappedComponent.extendStyles(() => ({
        container: {
          background: 'green',
        },
      }));

      render(
        <DirectionProvider direction={DIRECTIONS.LTR}>
          <ExtendedComponent />
        </DirectionProvider>,
      );

      expect(testInterface.createLTR.callCount).to.equal(1);
      expect(testInterface.createLTR.getCall(0).args[0]).to.eql({
        container: {
          background: 'green',
          color: 'blue',
        },
      });
    });

    it('extends styles in an RTL context', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
          },
        }),
        {
          extendableStyles: {
            container: {
              background: () => true,
            },
          },
        },
      )(MyComponent);
      const ExtendedComponent = WrappedComponent.extendStyles(() => ({
        container: {
          background: 'green',
        },
      }));
      render(
        <DirectionProvider direction={DIRECTIONS.RTL}>
          <ExtendedComponent />
        </DirectionProvider>,
      );

      expect(testInterface.createRTL.callCount).to.equal(1);
      expect(testInterface.createRTL.getCall(0).args[0]).to.eql({
        container: {
          background: 'green',
          color: 'blue',
        },
      });
    });

    it('allows nested extends styles', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
            fontSize: 20,
          },
        }),
        {
          extendableStyles: {
            container: {
              background: () => true,
              color: () => true,
              fontSize: () => true,
            },
          },
        },
      )(MyComponent);
      const ExtendedComponent = WrappedComponent.extendStyles(() => ({
        container: {
          background: 'green',
          fontSize: 12,
        },
      }));
      const NestedExtendedComponent = ExtendedComponent.extendStyles(() => ({
        container: {
          background: 'pink',
        },
      }));

      render(
        <NestedExtendedComponent />,
      );

      expect(testInterface.createLTR.callCount).to.equal(1);
      expect(testInterface.createLTR.getCall(0).args[0]).to.eql({
        container: {
          background: 'pink',
          color: 'blue',
          fontSize: 12,
        },
      });
    });

    it('receives the registered theme in the extend style function', (done) => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(() => ({}))(MyComponent);
      const ExtendedComponent = WrappedComponent.extendStyles((theme) => {
        expect(theme).to.equal(defaultTheme);
        done();
        return {};
      });
      shallow(
        <ExtendedComponent />,
      );
    });

    it('validates that the extending styles are defined in the extendableStyles option', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
          },
        }),
        {
          extendableStyles: {
            container: {
              background: () => true,
            },
          },
        },
      )(MyComponent);
      const ExtendedComponent = WrappedComponent.extendStyles(() => ({
        container: {
          // color is invalid
          color: 'green',
        },
      }));

      expect(() => render(
        <ExtendedComponent />,
      )).to.throw();
    });

    it('validates that the extended classNames are defined in the extendableStyles option', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
          },
        }),
        {
          extendableStyles: {
            container: {
              background: () => true,
            },
          },
        },
      )(MyComponent);
      const ExtendedComponent = WrappedComponent.extendStyles(() => ({
        innerContainer: { // not an extendable className
          color: 'green',
        },
      }));

      expect(() => render(
        <ExtendedComponent />,
      )).to.throw();
    });


    it('validates the extending style against the defined predicate (fail)', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
          },
        }),
        {
          extendableStyles: {
            container: {
              background: v => (v === 'red'), // predicate
            },
          },
        },
      )(MyComponent);
      const ExtendedComponent = WrappedComponent.extendStyles(() => ({
        container: {
          background: 'green', // fails
        },
      }));

      expect(() => render(
        <ExtendedComponent />,
      )).to.throw();
    });

    it('validates the extending style against the defined predicate (pass)', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
          },
        }),
        {
          extendableStyles: {
            container: {
              background: v => (v === 'red'), // predicate
            },
          },
        },
      )(MyComponent);
      const ExtendedComponent = WrappedComponent.extendStyles(() => ({
        container: {
          background: 'red', // passes
        },
      }));

      expect(() => render(
        <ExtendedComponent />,
      )).to.not.throw();
    });

    it('validates the extending style against the defined predicate with a theme (fail)', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
          },
        }),
        {
          extendableStyles: {
            container: {
              background: (v, t) => (v === t.color.red), // color = '#990000'
            },
          },
        },
      )(MyComponent);
      const ExtendedComponent = WrappedComponent.extendStyles(() => ({
        container: {
          background: 'green', // fails
        },
      }));

      expect(() => render(
        <ExtendedComponent />,
      )).to.throw();
    });

    it('validates the extending style against the defined predicate with a theme (pass)', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
          },
        }),
        {
          extendableStyles: {
            container: {
              background: (v, t) => (v === t.color.red), // color = '#990000'
            },
          },
        },
      )(MyComponent);
      const ExtendedComponent = WrappedComponent.extendStyles(theme => ({
        container: {
          background: theme.color.red, // pass
        },
      }));

      expect(() => render(
        <ExtendedComponent />,
      )).to.not.throw();
    });

    it('validates all extending styles against the defined predicates', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
          },
        }),
        {
          extendableStyles: {
            container: {
              background: (v, t) => (v === t.color.red),
              color: v => (v === 'green'),
              fontSize: v => (v === 12),
            },
          },
        },
      )(MyComponent);
      const FailingColorComponent = WrappedComponent.extendStyles(() => ({
        container: {
          background: 'purple', // fails
          color: 'green',
          fontSize: 12,
        },
      }));
      const FailingBackgroundComponent = WrappedComponent.extendStyles(theme => ({
        container: {
          background: theme.color.red,
          color: 15, // fails
          fontSize: 12,
        },
      }));
      const FailingFontSizeComponent = WrappedComponent.extendStyles(theme => ({
        container: {
          background: theme.color.red,
          color: 'green',
          fontSize: '12', // fails
        },
      }));
      const ExtendedComponent = WrappedComponent.extendStyles(theme => ({
        container: {
          background: theme.color.red,
          color: 'green',
          fontSize: 12,
        },
      }));

      expect(() => render(
        <FailingColorComponent />,
      )).to.throw();

      expect(() => render(
        <FailingBackgroundComponent />,
      )).to.throw();

      expect(() => render(
        <FailingFontSizeComponent />,
      )).to.throw();

      expect(() => render(
        <ExtendedComponent />,
      )).to.not.throw();
    });

    it('validates all extending styles across all classNames against the defined predicates', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(
        () => ({
          container: {
            background: 'red',
            color: 'blue',
          },
          innerContainer: {
            fontSize: 12,
          },
        }),
        {
          extendableStyles: {
            container: {
              background: (v, t) => (v === t.color.red),
              color: v => (v === 'green'),
            },
            innerContainer: {
              fontSize: v => (v === 12),
            },
          },
        },
      )(MyComponent);
      const FailingColorComponent = WrappedComponent.extendStyles(() => ({
        container: {
          background: 'purple', // fails
          color: 'green',
        },
        innerContainer: {
          fontSize: 12,
        },
      }));
      const FailingBackgroundComponent = WrappedComponent.extendStyles(theme => ({
        container: {
          background: theme.color.red,
          color: 15, // fails
        },
        innerContainer: {
          fontSize: 12,
        },
      }));
      const FailingFontSizeComponent = WrappedComponent.extendStyles(theme => ({
        container: {
          background: theme.color.red,
          color: 'green',
          fontSize: '12',
        },
        innerContainer: {
          fontSize: '12', // fails
        },
      }));
      const ExtendedComponent = WrappedComponent.extendStyles(theme => ({
        container: {
          background: theme.color.red,
          color: 'green',
        },
        innerContainer: {
          fontSize: 12,
        },
      }));

      expect(() => render(
        <FailingColorComponent />,
      )).to.throw();

      expect(() => render(
        <FailingBackgroundComponent />,
      )).to.throw();

      expect(() => render(
        <FailingFontSizeComponent />,
      )).to.throw();

      expect(() => render(
        <ExtendedComponent />,
      )).to.not.throw();
    });
  });
});

describe('fallbacks', () => {
  const defaultTheme = {
    color: {
      red: '#990000',
    },
  };

  let testInterface;
  let resolveStub;
  let createStub;

  beforeEach(() => {
    resolveStub = sinon.stub();
    createStub = sinon.stub().returns({});

    testInterface = {
      create: createStub,
      resolve: resolveStub,
      flush: sinon.spy(),
    };

    ThemedStyleSheet.registerTheme(defaultTheme);
    ThemedStyleSheet.registerInterface(testInterface);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('StyleSheet creation', () => {
    it('creates the styles in a non-directional context', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(() => ({}))(MyComponent);
      shallow(<WrappedComponent />);
      expect(testInterface.create.callCount).to.equal(1);
    });

    it('creates the styles in an LTR context', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(() => ({}))(MyComponent);
      render((
        <DirectionProvider direction={DIRECTIONS.LTR}>
          <WrappedComponent />
        </DirectionProvider>
      ));
      expect(testInterface.create.callCount).to.equal(1);
    });

    it('creates the styles in an RTL context', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(() => ({}))(MyComponent);
      render((
        <DirectionProvider direction={DIRECTIONS.RTL}>
          <WrappedComponent />
        </DirectionProvider>
      ));
      expect(testInterface.create.callCount).to.equal(1);
    });
  });

  describe('css', () => {
    it('css calls resolveLTR method in non-directional context', () => {
      function MyComponent({ css }) {
        return <div {...css({ color: 'red' })} />;
      }
      MyComponent.propTypes = {
        ...withStylesPropTypes,
      };

      const WrappedComponent = withStyles(() => ({}))(MyComponent);

      render(<WrappedComponent />);
      expect(resolveStub.callCount).to.equal(1);
    });

    it('css calls resolveLTR method in LTR context', () => {
      function MyComponent({ css }) {
        return <div {...css({ color: 'red' })} />;
      }
      MyComponent.propTypes = {
        ...withStylesPropTypes,
      };

      const WrappedComponent = withStyles(() => ({}))(MyComponent);

      render((
        <DirectionProvider direction={DIRECTIONS.LTR}>
          <WrappedComponent />
        </DirectionProvider>
      ));
      expect(resolveStub.callCount).to.equal(1);
    });

    it('css calls resolveRTL method in RTL context', () => {
      function MyComponent({ css }) {
        return <div {...css({ color: 'red' })} />;
      }
      MyComponent.propTypes = {
        ...withStylesPropTypes,
      };

      const WrappedComponent = withStyles(() => ({}))(MyComponent);

      render((
        <DirectionProvider direction={DIRECTIONS.RTL}>
          <WrappedComponent />
        </DirectionProvider>
      ));
      expect(resolveStub.callCount).to.equal(1);
    });
  });
});
