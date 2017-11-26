import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { render, shallow } from 'enzyme';
import deepmerge from 'deepmerge';
import sinon from 'sinon-sandbox';
import DirectionProvider, { DIRECTIONS } from 'react-with-direction/dist/DirectionProvider';
import ifReact from 'enzyme-adapter-react-helper/build/ifReact';
import safeSFC from 'enzyme-adapter-react-helper/build/safeSFC';

import ThemedStyleSheet from '../src/ThemedStyleSheet';
import { css, cssNoRTL, withStyles, withStylesPropTypes } from '../src/withStyles';

describe('withStyles()', () => {
  const defaultTheme = {
    color: {
      red: '#990000',
    },
  };

  let testInterface;
  let testInterfaceResolveStub;

  beforeEach(() => {
    testInterface = {
      create() {},
      resolve() {},
      flush: sinon.spy(),
    };
    sinon.stub(testInterface, 'create').callsFake(styleHash => styleHash);
    testInterfaceResolveStub = sinon.stub(testInterface, 'resolve').callsFake(styles => ({
      style: styles.reduce((result, style) => Object.assign(result, style)),
    }));

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
    });
  });

  it('returns the HOC function', () => {
    expect(typeof withStyles(() => ({}))).to.equal('function');
  });

  describe('HOC', () => {
    it('creates the styles', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(() => ({}))(safeSFC(MyComponent));
      shallow(<WrappedComponent />);
      expect(testInterface.create.callCount).to.equal(1);
    });

    it('has a wrapped displayName', () => {
      function MyComponent() {
        return null;
      }

      const result = withStyles(() => ({}))(safeSFC(MyComponent));
      expect(result.displayName).to.equal('withStyles(MyComponent)');
    });

    it('passes the theme to the wrapped component', () => {
      function MyComponent({ theme }) {
        expect(theme).to.eql(defaultTheme);
        return null;
      }

      const Wrapped = withStyles(() => ({}))(safeSFC(MyComponent));
      shallow(<Wrapped />).dive();
    });

    it('allows the theme prop name to be customized', () => {
      function MyComponent({ foo }) {
        expect(foo).to.eql(defaultTheme);
        return null;
      }

      const Wrapped = withStyles(() => ({}), { themePropName: 'foo' })(safeSFC(MyComponent));
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
      }))(safeSFC(MyComponent));
      shallow(<Wrapped />).dive();
    });

    it('passes an empty styles object without a styleFn', () => {
      function MyComponent({ styles }) {
        expect(styles).to.eql({});
        return null;
      }

      const Wrapped = withStyles()(safeSFC(MyComponent));
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
      }), { stylesPropName: 'bar' })(safeSFC(MyComponent));
      shallow(<Wrapped />).dive();
    });

    it('does not flush styles before rendering', () => {
      function MyComponent() {
        return null;
      }

      const Wrapped = withStyles(() => ({}))(safeSFC(MyComponent));
      shallow(<Wrapped />);
      expect(testInterface.flush.callCount).to.equal(0);
    });

    it('with the flushBefore option set, flushes styles before rendering', () => {
      function MyComponent() {
        return null;
      }

      const Wrapped = withStyles(() => ({}), { flushBefore: true })(safeSFC(MyComponent));
      shallow(<Wrapped />);
      expect(testInterface.flush.callCount).to.equal(1);
    });

    it('hoists statics', () => {
      function MyComponent() {
        return null;
      }
      MyComponent.foo = 'bar';

      const Wrapped = withStyles(() => ({}), { flushBefore: true })(safeSFC(MyComponent));
      expect(Wrapped.foo).to.equal('bar');
    });

    it('works with css()', () => {
      function MyComponent({ styles }) {
        return <div {...css(styles.foo)} />;
      }
      MyComponent.propTypes = {
        ...withStylesPropTypes,
      };

      const Wrapped = withStyles(({ color }) => ({
        foo: {
          color: color.red,
        },
      }))(safeSFC(MyComponent));
      const wrapper = shallow(<Wrapped />).dive();

      expect(wrapper.prop('style')).to.eql({ color: '#990000' });
    });

    it('copies over non-withStyles propTypes and defaultProps', () => {
      // TODO: fix eslint-plugin-react bug
      // eslint-disable-next-line react/prop-types
      function MyComponent({ styles, theme }) {
        return <div {...css(styles.foo)}>{theme.color.default}</div>;
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
      }))(safeSFC(MyComponent));

      // copied
      const expectedPropTypes = deepmerge({}, MyComponent.propTypes);
      delete expectedPropTypes.styles;
      delete expectedPropTypes.theme;
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

      const Wrapped = withStyles(() => ({}))(safeSFC(MyComponent));
      const wrappedProto = Object.getPrototypeOf(Wrapped);
      const wrappedProtoProto = Object.getPrototypeOf(Wrapped.prototype);
      expect(wrappedProto).to.equal(React.Component);
      expect(wrappedProtoProto).to.equal(React.Component.prototype);
      if (React.PureComponent) {
        expect(wrappedProto).not.to.equal(React.PureComponent);
        expect(wrappedProtoProto).not.to.equal(React.PureComponent.prototype);
      }
    });

    ifReact('>= 15.3', it, it.skip)('with the pureComponent option set, extends React.PureComponent', () => {
      function MyComponent() {
        return null;
      }

      const Wrapped = withStyles(() => ({}), { pureComponent: true })(safeSFC(MyComponent));
      expect(Object.getPrototypeOf(Wrapped)).not.to.equal(React.Component);
      expect(Object.getPrototypeOf(Wrapped.prototype)).not.to.equal(React.Component.prototype);
      expect(Object.getPrototypeOf(Wrapped)).to.equal(React.PureComponent);
      expect(Object.getPrototypeOf(Wrapped.prototype)).to.equal(React.PureComponent.prototype);
    });
  });

  describe('css/cssNoRTL', () => {
    it('css calls resolve method', () => {
      const MyComponent = safeSFC(function MyComponent() {
        return <div {...css({ color: 'red' })} />;
      });

      shallow(<MyComponent />);
      expect(testInterfaceResolveStub.callCount).to.equal(1);
    });

    it('cssNoRTL calls resolve method if resolveNoRTL does not exist', () => {
      const MyComponent = safeSFC(function MyComponent() {
        return <div {...cssNoRTL({ color: 'red' })} />;
      });

      shallow(<MyComponent />);
      expect(testInterfaceResolveStub.callCount).to.equal(1);
    });
  });
});

describe('RTL support', () => {
  let testInterface;
  let resolveStub;
  let resolveNoRTLStub;
  let createStub;
  let createRTLStub;

  beforeEach(() => {
    resolveStub = sinon.stub();
    resolveNoRTLStub = sinon.stub();

    createStub = sinon.stub();
    createRTLStub = sinon.stub();

    testInterface = {
      create: createStub,
      createRTL: createRTLStub,
      resolve: resolveStub,
      resolveNoRTL: resolveNoRTLStub,
      flush: sinon.spy(),
    };

    ThemedStyleSheet.registerTheme({});
    ThemedStyleSheet.registerInterface(testInterface);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('css/cssNoRTL', () => {
    it('css calls resolve method', () => {
      const MyComponent = safeSFC(function MyComponent() {
        return <div {...css({ color: 'red' })} />;
      });

      shallow(<MyComponent />);
      expect(resolveStub.callCount).to.equal(1);
      expect(resolveNoRTLStub.callCount).to.equal(0);
    });

    it('cssNoRTL calls resolve method if resolveNoRTL does not exist', () => {
      const MyComponent = safeSFC(function MyComponent() {
        return <div {...cssNoRTL({ color: 'red' })} />;
      });

      shallow(<MyComponent />);
      expect(resolveStub.callCount).to.equal(0);
      expect(resolveNoRTLStub.callCount).to.equal(1);
    });
  });

  describe('contextual create', () => {
    it('calls ThemedStyleSheet.create without direction set', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(() => ({}))(safeSFC(MyComponent));
      render(<WrappedComponent />);
      expect(testInterface.create).to.have.property('callCount', 1);
    });

    it('calls ThemedStyleSheet.create with LTR direction', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(() => ({}))(safeSFC(MyComponent));
      render((
        <DirectionProvider direction={DIRECTIONS.LTR}>
          <WrappedComponent />
        </DirectionProvider>
      ));
      expect(testInterface.create).to.have.property('callCount', 1);
    });

    it('calls ThemedStyleSheet.createRTL with RTL direction', () => {
      function MyComponent() {
        return null;
      }

      const WrappedComponent = withStyles(() => ({}))(safeSFC(MyComponent));
      render((
        <DirectionProvider direction={DIRECTIONS.RTL}>
          <WrappedComponent />
        </DirectionProvider>
      ));
      expect(testInterface.createRTL).to.have.property('callCount', 1);
    });
  });
});
