/* eslint-disable no-unused-vars */

import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import sinon from 'sinon-sandbox';

import { describeIfReact } from './ifReactHelpers';
import WithStylesContext, { DIRECTIONS } from '../src/WithStylesContext';
import ThemedStyleSheet from '../src/ThemedStyleSheet';
import {
  withStylesFunctional as withStyles,
  withStylesPropTypes,
} from '../src/withStylesFunctional';

describeIfReact('>=16.8', 'withStylesFunctional', () => {
  let testTheme;
  let testInterface;

  function fakeCreateMethod(styleHash) {
    return styleHash;
  }

  function fakeResolveMethod(styles) {
    return ({
      style: Object.assign({}, ...styles),
    });
  }

  function compose(firstElement, ...elements) {
    if (elements && elements.length) {
      return React.cloneElement(firstElement, {
        children: compose(...elements),
      });
    }
    return firstElement;
  }

  function mountWithProviders(element, providers) {
    return mount(compose(...providers, element));
  }

  function mockTheme(primaryColor = 'tomato') {
    return { color: { primary: primaryColor } };
  }

  function mockInterface() {
    return {
      create: sinon.stub().callsFake(fakeCreateMethod),
      createLTR: sinon.stub().callsFake(fakeCreateMethod),
      createRTL: sinon.stub().callsFake(fakeCreateMethod),
      resolve: sinon.stub().callsFake(fakeResolveMethod),
      resolveLTR: sinon.stub().callsFake(fakeResolveMethod),
      resolveRTL: sinon.stub().callsFake(fakeResolveMethod),
      flush: sinon.stub(),
    };
  }

  function mockNonDirectionalInterface() {
    return {
      create: sinon.stub().callsFake(fakeCreateMethod),
      resolve: sinon.stub().callsFake(fakeResolveMethod),
    };
  }

  beforeEach(() => {
    testTheme = mockTheme();
    testInterface = mockInterface();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('withStyles(styleFn)', () => {
    it('returns the HOC function with and without a styleFn', () => {
      expect(typeof withStyles()).to.equal('function');
      expect(typeof withStyles(null, {})).to.equal('function');
      expect(typeof withStyles(() => ({}))).to.equal('function');
      expect(typeof withStyles(() => ({ text: { color: 'red' } }))).to.equal('function');
    });

    it('does not call any interface functions', () => {
      ThemedStyleSheet.registerInterface(testInterface);
      expect(testInterface.create).to.have.property('callCount', 0);
      expect(testInterface.createLTR).to.have.property('callCount', 0);
      expect(testInterface.createRTL).to.have.property('callCount', 0);
      expect(testInterface.resolve).to.have.property('callCount', 0);
      expect(testInterface.resolveLTR).to.have.property('callCount', 0);
      expect(testInterface.resolveRTL).to.have.property('callCount', 0);
      expect(testInterface.flush).to.have.property('callCount', 0);
      withStyles();
      expect(testInterface.create).to.have.property('callCount', 0);
      expect(testInterface.createLTR).to.have.property('callCount', 0);
      expect(testInterface.createRTL).to.have.property('callCount', 0);
      expect(testInterface.resolve).to.have.property('callCount', 0);
      expect(testInterface.resolveLTR).to.have.property('callCount', 0);
      expect(testInterface.resolveRTL).to.have.property('callCount', 0);
      expect(testInterface.flush).to.have.property('callCount', 0);
    });
  });

  describe('withStyles(styleFn)(Component)', () => {
    let providers;

    beforeEach(() => {
      providers = [
        <WithStylesContext.Provider
          value={{
            stylesInterface: testInterface,
            stylesTheme: testTheme,
          }}
        />,
      ];
    });

    it('sets the displayName', () => {
      const MockComponent = () => null;
      const StyledComponent = withStyles()(MockComponent);
      expect(StyledComponent.displayName).to.equal('withStyles(MockComponent)');

      const PureStyledComponent = withStyles({ pureComponent: true })(MockComponent);
      expect(PureStyledComponent).to.have.property('displayName', 'withStyles(MockComponent)');
    });

    it('hoists the component\'s non-React statics', () => {
      const MockComponent = () => null;
      MockComponent.foo = 'bar';
      const StyledComponent = withStyles()(MockComponent);
      expect(StyledComponent.foo).to.equal('bar');
    });

    it('copies the component\'s propTypes and defaultProps, except the withStyles ones', () => {
      const MockComponent = () => null;
      MockComponent.propTypes = {
        ...withStylesPropTypes,
        foo: PropTypes.string,
      };
      MockComponent.defaultProps = {
        foo: 'bar',
      };
      const StyledComponent = withStyles()(MockComponent);
      expect(StyledComponent.propTypes).to.have.keys('foo');
      expect(StyledComponent.defaultProps).to.have.keys('foo');
    });

    describe('rendering without options (standard behavior)', () => {
      it('passes the theme to the stylesFn', () => {
        const stylesFn = sinon.stub().callsFake(() => ({}));
        const MockComponent = () => null;
        const StyledComponent = withStyles(stylesFn)(MockComponent);
        mountWithProviders(<StyledComponent />, providers);
        expect(stylesFn.calledWith(testTheme)).to.equal(true);
      });

      it('passes the theme to the wrapped component through the `theme` prop', () => {
        const MockComponent = () => null;
        const StyledComponent = withStyles()(MockComponent);
        const wrapper = mountWithProviders(<StyledComponent />, providers);
        expect(wrapper.find(MockComponent).props()).to.have.property('theme', testTheme);
      });

      it('passes the styles to the wrapped component through the `styles` prop', () => {
        const testStyles = { foo: { color: 'bar' } };
        const MockComponent = () => null;
        const StyledComponent = withStyles(() => testStyles)(MockComponent);
        const wrapper = mountWithProviders(<StyledComponent />, providers);
        expect(wrapper.find(MockComponent).props()).to.have.property('styles', testStyles);
      });

      it('passes an empty styles object if no stylesFn is provided', () => {
        const MockComponent = () => null;
        const StyledComponent = withStyles()(MockComponent);
        const wrapper = mountWithProviders(<StyledComponent />, providers);
        expect(wrapper.find(MockComponent).props().styles).to.eql({});
      });

      it('passes a function to the wrapped component through the `css` prop', () => {
        const MockComponent = () => null;
        const StyledComponent = withStyles()(MockComponent);
        const wrapper = mountWithProviders(<StyledComponent />, providers);
        expect(typeof wrapper.find(MockComponent).props().css).to.equal('function');
      });

      it('does not call the flush function before rendering', () => {
        const MockComponent = () => null;
        const StyledComponent = withStyles()(MockComponent);
        expect(testInterface.flush).to.have.property('callCount', 0);
        mountWithProviders(<StyledComponent />, providers);
        expect(testInterface.flush).to.have.property('callCount', 0);
      });
    });

    describe('rendering with options (custom behavior)', () => {
      it('passes the theme to the wrapped component through the specified prop', () => {
        const MockComponent = ({ customTheme }) => {
          expect(customTheme).to.equal(testTheme);
          return null;
        };
        const StyledComponent = withStyles(null, { themePropName: 'customTheme' })(MockComponent);
        const wrapper = mountWithProviders(<StyledComponent />, providers);
        expect(wrapper.find(MockComponent).props()).to.have.property('customTheme', testTheme);
      });

      it('passes the styles to the wrapped component through the specified prop', () => {
        const testStyles = { foo: { color: 'bar' } };
        const MockComponent = ({ customStyles }) => {
          expect(customStyles).to.equal(testStyles);
          return null;
        };
        const StyledComponent = withStyles(() => testStyles, { stylesPropName: 'customStyles' })(
          MockComponent,
        );
        const wrapper = mountWithProviders(<StyledComponent />, providers);
        expect(wrapper.find(MockComponent).props()).to.have.property('customStyles');
      });

      it('passes the css function to the wrapped component through the specified prop', () => {
        const MockComponent = ({ customCss }) => {
          expect(typeof customCss).to.equal('function');
          return null;
        };
        const StyledComponent = withStyles(null, { cssPropName: 'customCss' })(MockComponent);
        const wrapper = mountWithProviders(<StyledComponent />, providers);
        expect(wrapper.find(MockComponent).props()).to.have.property('customCss');
      });

      it('calls the flush function before rendering when specified', () => {
        const MockComponent = () => null;
        const StyledComponent = withStyles(null, { flushBefore: true })(MockComponent);
        expect(testInterface.flush).to.have.property('callCount', 0);
        mountWithProviders(<StyledComponent />, providers);
        expect(testInterface.flush).to.have.property('callCount', 1);
      });
    });

    describe('in a non-directional context', () => {
      it('creates the styles for LTR', () => {
        const MockComponent = () => null;
        const WrappedComponent = withStyles()(MockComponent);
        expect(testInterface.create).to.have.property('callCount', 0);
        expect(testInterface.createLTR).to.have.property('callCount', 0);
        expect(testInterface.createRTL).to.have.property('callCount', 0);
        mountWithProviders(<WrappedComponent />, providers);
        expect(testInterface.create).to.have.property('callCount', 0);
        expect(testInterface.createLTR).to.have.property('callCount', 1);
        expect(testInterface.createRTL).to.have.property('callCount', 0);
      });

      it('resolves the styles for LTR', () => {
        const MockComponent = ({ css }) => <div {...css({})} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles()(MockComponent);
        expect(testInterface.resolve).to.have.property('callCount', 0);
        expect(testInterface.resolveLTR).to.have.property('callCount', 0);
        expect(testInterface.resolveRTL).to.have.property('callCount', 0);
        mountWithProviders(<StyledComponent />, providers);
        expect(testInterface.resolve).to.have.property('callCount', 0);
        expect(testInterface.resolveLTR).to.have.property('callCount', 1);
        expect(testInterface.resolveRTL).to.have.property('callCount', 0);
      });
    });

    describe('in an LTR directional context', () => {
      let ltrProviders;

      beforeEach(() => {
        ltrProviders = [
          <WithStylesContext.Provider
            value={{
              stylesInterface: testInterface,
              stylesTheme: testTheme,
              direction: DIRECTIONS.LTR,
            }}
          />,
        ];
      });

      it('creates the styles for LTR', () => {
        const MockComponent = () => null;
        const WrappedComponent = withStyles()(MockComponent);
        expect(testInterface.create).to.have.property('callCount', 0);
        expect(testInterface.createLTR).to.have.property('callCount', 0);
        expect(testInterface.createRTL).to.have.property('callCount', 0);
        mountWithProviders(<WrappedComponent />, ltrProviders);
        expect(testInterface.create).to.have.property('callCount', 0);
        expect(testInterface.createLTR).to.have.property('callCount', 1);
        expect(testInterface.createRTL).to.have.property('callCount', 0);
      });

      it('resolves the styles for LTR', () => {
        const MockComponent = ({ css }) => <div {...css({})} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles()(MockComponent);
        expect(testInterface.resolve).to.have.property('callCount', 0);
        expect(testInterface.resolveLTR).to.have.property('callCount', 0);
        expect(testInterface.resolveRTL).to.have.property('callCount', 0);
        mountWithProviders(<StyledComponent />, ltrProviders);
        expect(testInterface.resolve).to.have.property('callCount', 0);
        expect(testInterface.resolveLTR).to.have.property('callCount', 1);
        expect(testInterface.resolveRTL).to.have.property('callCount', 0);
      });
    });

    describe('in an RTL directional context', () => {
      let rtlProviders;

      beforeEach(() => {
        rtlProviders = [
          <WithStylesContext.Provider
            value={{
              stylesInterface: testInterface,
              stylesTheme: testTheme,
              direction: DIRECTIONS.RTL,
            }}
          />,
        ];
      });

      it('creates the styles for RTL', () => {
        const MockComponent = () => null;
        const WrappedComponent = withStyles()(MockComponent);
        expect(testInterface.create).to.have.property('callCount', 0);
        expect(testInterface.createLTR).to.have.property('callCount', 0);
        expect(testInterface.createRTL).to.have.property('callCount', 0);
        mountWithProviders(<WrappedComponent />, rtlProviders);
        expect(testInterface.create).to.have.property('callCount', 0);
        expect(testInterface.createLTR).to.have.property('callCount', 0);
        expect(testInterface.createRTL).to.have.property('callCount', 1);
      });

      it('resolves the styles for RTL', () => {
        const MockComponent = ({ css }) => <div {...css({})} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles()(MockComponent);
        expect(testInterface.resolve).to.have.property('callCount', 0);
        expect(testInterface.resolveLTR).to.have.property('callCount', 0);
        expect(testInterface.resolveRTL).to.have.property('callCount', 0);
        mountWithProviders(<StyledComponent />, rtlProviders);
        expect(testInterface.resolve).to.have.property('callCount', 0);
        expect(testInterface.resolveLTR).to.have.property('callCount', 0);
        expect(testInterface.resolveRTL).to.have.property('callCount', 1);
      });

      it('resolves the styles for RTL, even if using a pure component', () => {
        const MockComponent = ({ css }) => <div {...css({})} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles(null, { pureComponent: true })(MockComponent);
        expect(testInterface.resolve).to.have.property('callCount', 0);
        expect(testInterface.resolveLTR).to.have.property('callCount', 0);
        expect(testInterface.resolveRTL).to.have.property('callCount', 0);
        mountWithProviders(<StyledComponent />, rtlProviders);
        expect(testInterface.resolve).to.have.property('callCount', 0);
        expect(testInterface.resolveLTR).to.have.property('callCount', 0);
        expect(testInterface.resolveRTL).to.have.property('callCount', 1);
      });
    });

    describe('re-rendering', () => {
      let firstTheme;
      let secondTheme;
      let firstInterface;
      let secondInterface;

      function makeTestHelper() {
        const MockComponent = ({ css, styles, primary }) => (
          <div {...css(primary && styles.primary)} />
        );
        MockComponent.propTypes = { ...withStylesPropTypes, primary: PropTypes.bool };
        MockComponent.defaultProps = { primary: false };
        const stylesFn = ({ color }) => ({ primary: { color: color.primary } });
        const StyledComponent = withStyles(stylesFn)(MockComponent);

        const TestHelper = ({
          stylesTheme, stylesInterface, direction, primary,
        }) => (
          <WithStylesContext.Provider value={{ stylesInterface, stylesTheme, direction }}>
            <StyledComponent primary={primary} />
          </WithStylesContext.Provider>
        );
        TestHelper.propTypes = {
          stylesTheme: PropTypes.object, // eslint-disable-line react/forbid-prop-types
          stylesInterface: PropTypes.object, // eslint-disable-line react/forbid-prop-types
          direction: PropTypes.oneOf(['ltr', 'rtl']),
          primary: PropTypes.bool,
        };
        TestHelper.defaultProps = {
          stylesTheme: firstTheme,
          stylesInterface: firstInterface,
          direction: 'ltr',
          primary: false,
        };

        return TestHelper;
      }

      beforeEach(() => {
        firstTheme = mockTheme('#000');
        secondTheme = mockTheme('#fff');
        firstInterface = mockInterface();
        secondInterface = mockInterface();
      });

      it('creates styles once if the direction, theme or interface haven\'t changed', () => {
        const TestHelper = makeTestHelper();
        expect(firstInterface.createLTR).to.have.property('callCount', 0);
        const wrapper = mount(<TestHelper />);
        expect(firstInterface.createLTR).to.have.property('callCount', 1);
        wrapper.setProps({ stylesTheme: firstTheme });
        expect(firstInterface.createLTR).to.have.property('callCount', 1);
        wrapper.setProps({ stylesInterface: firstInterface });
        expect(firstInterface.createLTR).to.have.property('callCount', 1);
        wrapper.setProps({ direction: 'ltr' });
        expect(firstInterface.createLTR).to.have.property('callCount', 1);
        wrapper.setProps({ primary: true });
        expect(firstInterface.createLTR).to.have.property('callCount', 1);
      });

      it('creates styles once per direction if the theme or interface haven\'t changed', () => {
        const TestHelper = makeTestHelper();
        expect(firstInterface.createLTR).to.have.property('callCount', 0);
        expect(firstInterface.resolveLTR).to.have.property('callCount', 0);
        const wrapper = mount(<TestHelper />);
        wrapper.setProps({ direction: 'rtl' });
        expect(firstInterface.createLTR).to.have.property('callCount', 1);
        expect(firstInterface.createRTL).to.have.property('callCount', 1);
        wrapper.setProps({ direction: 'ltr' });
        wrapper.setProps({ primary: true });
        wrapper.setProps({ direction: 'rtl' });
        wrapper.setProps({ primary: false });
        expect(firstInterface.createLTR).to.have.property('callCount', 1);
        expect(firstInterface.createRTL).to.have.property('callCount', 1);
      });

      it('re-creates styles when the theme or interface change', () => {
        const TestHelper = makeTestHelper();
        expect(firstInterface.createLTR).to.have.property('callCount', 0);
        const wrapper = mount(<TestHelper />);
        expect(firstInterface.createLTR).to.have.property('callCount', 1);
        wrapper.setProps({ stylesTheme: secondTheme });
        expect(firstInterface.createLTR).to.have.property('callCount', 2);
        expect(secondInterface.createLTR).to.have.property('callCount', 0);
        wrapper.setProps({ stylesInterface: secondInterface });
        expect(firstInterface.createLTR).to.have.property('callCount', 2);
        expect(secondInterface.createLTR).to.have.property('callCount', 1);
        wrapper.setProps({ stylesTheme: firstTheme });
        expect(secondInterface.createLTR).to.have.property('callCount', 2);
      });

      it('re-resolves styles when the theme, interface or props change', () => {
        const TestHelper = makeTestHelper();
        expect(firstInterface.resolveLTR).to.have.property('callCount', 0);
        const wrapper = mount(<TestHelper />);
        expect(firstInterface.resolveLTR).to.have.property('callCount', 1);
        wrapper.setProps({ stylesTheme: secondTheme });
        expect(firstInterface.resolveLTR).to.have.property('callCount', 2);
        expect(secondInterface.resolveLTR).to.have.property('callCount', 0);
        wrapper.setProps({ stylesInterface: secondInterface });
        expect(firstInterface.resolveLTR).to.have.property('callCount', 2);
        expect(secondInterface.resolveLTR).to.have.property('callCount', 1);
        wrapper.setProps({ stylesTheme: firstTheme });
        expect(secondInterface.resolveLTR).to.have.property('callCount', 2);
        wrapper.setProps({ primary: true });
        expect(secondInterface.resolveLTR).to.have.property('callCount', 3);
      });
    });

    describe('nested themes and interfaces', () => {
      let nestedProviders;
      let innerMostTheme;
      let outerMostTheme;
      let innerMostInterface;
      let outerMostInterface;
      let stylesFn;

      beforeEach(() => {
        const fakeStylesFn = ({ color }) => ({
          primary: { color: color.primary },
          custom: { color: 'blue' },
        });
        stylesFn = sinon.stub().callsFake(fakeStylesFn);

        outerMostTheme = mockTheme('#000');
        innerMostTheme = mockTheme('#fff');

        outerMostInterface = mockNonDirectionalInterface();
        innerMostInterface = mockNonDirectionalInterface();

        nestedProviders = [
          <WithStylesContext.Provider
            value={{ stylesInterface: outerMostInterface, stylesTheme: outerMostTheme }}
          />,
          <WithStylesContext.Provider
            value={{ stylesInterface: innerMostInterface, stylesTheme: innerMostTheme }}
          />,
        ];
      });

      it('uses the innermost theme', () => {
        const MockComponent = ({ styles, css }) => <div {...css(styles.primary)} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles(stylesFn)(MockComponent);
        const wrapper = mountWithProviders(<StyledComponent />, nestedProviders);
        expect(stylesFn.calledWith(innerMostTheme)).to.equal(true);
        expect(wrapper.find(MockComponent).props()).to.have.property('theme', innerMostTheme);
      });

      it('uses the innermost interface', () => {
        const MockComponent = ({ styles, css }) => <div {...css(styles.primary)} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles(stylesFn)(MockComponent);
        expect(outerMostInterface.create).to.have.property('callCount', 0);
        expect(outerMostInterface.resolve).to.have.property('callCount', 0);
        expect(innerMostInterface.create).to.have.property('callCount', 0);
        expect(innerMostInterface.resolve).to.have.property('callCount', 0);
        mountWithProviders(<StyledComponent />, nestedProviders);
        expect(outerMostInterface.create).to.have.property('callCount', 0);
        expect(outerMostInterface.resolve).to.have.property('callCount', 0);
        expect(innerMostInterface.create).to.have.property('callCount', 1);
        expect(innerMostInterface.resolve).to.have.property('callCount', 1);
      });
    });
  });

  describe('Without providers', () => {
    let stylesFn;

    beforeEach(() => {
      ThemedStyleSheet.registerInterface(testInterface);
      ThemedStyleSheet.registerTheme(testTheme);

      stylesFn = sinon.stub().callsFake(({ color }) => ({ primary: { color: color.primary } }));
    });

    afterEach(() => {
      ThemedStyleSheet.registerInterface(undefined);
      ThemedStyleSheet.registerTheme(undefined);
    });

    describe('in a non-directional context', () => {
      it('uses the theme registered with the singleton API', () => {
        const MockComponent = ({ styles, css }) => <div {...css(styles.primary)} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles(stylesFn)(MockComponent);
        const wrapper = shallow(<StyledComponent />);
        expect(stylesFn.calledWith(testTheme)).to.equal(true);
        expect(wrapper.find(MockComponent).props()).to.have.property('theme', testTheme);
      });

      it('uses the interface registered with the singleton API', () => {
        const MockComponent = ({ styles, css }) => <div {...css(styles.primary)} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles(stylesFn)(MockComponent);
        expect(testInterface.createLTR).to.have.property('callCount', 0);
        expect(testInterface.resolveLTR).to.have.property('callCount', 0);
        mount(<StyledComponent />);
        expect(testInterface.createLTR).to.have.property('callCount', 1);
        expect(testInterface.resolveLTR).to.have.property('callCount', 1);
      });
    });

    describe('in an LTR context', () => {
      it('uses the theme registered with the singleton API', () => {
        const MockComponent = ({ styles, css }) => <div {...css(styles.primary)} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles(stylesFn)(MockComponent);
        const wrapper = mountWithProviders(<StyledComponent />, [
          <WithStylesContext.Provider value={{ direction: DIRECTIONS.LTR }} />,
        ]);
        expect(stylesFn.calledWith(testTheme)).to.equal(true);
        expect(wrapper.find(MockComponent).props()).to.have.property('theme', testTheme);
      });

      it('uses the interface registered with the singleton API', () => {
        const MockComponent = ({ styles, css }) => <div {...css(styles.primary)} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles(stylesFn)(MockComponent);
        expect(testInterface.createLTR).to.have.property('callCount', 0);
        expect(testInterface.resolveLTR).to.have.property('callCount', 0);
        mountWithProviders(<StyledComponent />, [
          <WithStylesContext.Provider value={{ direction: DIRECTIONS.LTR }} />,
        ]);
        expect(testInterface.createLTR).to.have.property('callCount', 1);
        expect(testInterface.resolveLTR).to.have.property('callCount', 1);
      });
    });

    describe('in an RTL context', () => {
      it('uses the theme registered with the singleton API', () => {
        const MockComponent = ({ styles, css }) => <div {...css(styles.primary)} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles(stylesFn)(MockComponent);
        const wrapper = mountWithProviders(<StyledComponent />, [
          <WithStylesContext.Provider value={{ direction: DIRECTIONS.RTL }} />,
        ]);
        expect(stylesFn.calledWith(testTheme)).to.equal(true);
        expect(wrapper.find(MockComponent).props()).to.have.property('theme', testTheme);
      });

      it('uses the interface registered with the singleton API', () => {
        const MockComponent = ({ styles, css }) => <div {...css(styles.primary)} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles(stylesFn)(MockComponent);
        expect(testInterface.createRTL).to.have.property('callCount', 0);
        expect(testInterface.resolveRTL).to.have.property('callCount', 0);
        mountWithProviders(<StyledComponent />, [
          <WithStylesContext.Provider value={{ direction: DIRECTIONS.RTL }} />,
        ]);
        expect(testInterface.createRTL).to.have.property('callCount', 1);
        expect(testInterface.resolveRTL).to.have.property('callCount', 1);
      });
    });
  });
});
