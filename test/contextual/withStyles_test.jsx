/* eslint-disable no-unused-vars */

import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon-sandbox';
import DirectionProvider, { DIRECTIONS } from 'react-with-direction/dist/DirectionProvider';

import { withStyles, withStylesPropTypes } from '../../src/contextual/withStyles';
import StylesInterfaceContext from '../../src/contextual/StylesInterfaceContext';
import StylesThemeContext from '../../src/contextual/StylesThemeContext';

describe('withStyles', () => {
  let testTheme;
  let testInterface;

  function fakeCreateMethod(styleHash) {
    return styleHash;
  }

  function fakeResolveMethod(styles) {
    return ({
      style: styles.reduce((accum, style) => ({ ...accum, ...style }), {}),
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

  beforeEach(() => {
    testTheme = { color: { primary: 'tomato' } };
    testInterface = {
      create: sinon.stub().callsFake(fakeCreateMethod),
      createLTR: sinon.stub().callsFake(fakeCreateMethod),
      createRTL: sinon.stub().callsFake(fakeCreateMethod),
      resolve: sinon.stub().callsFake(fakeResolveMethod),
      resolveLTR: sinon.stub().callsFake(fakeResolveMethod),
      resolveRTL: sinon.stub().callsFake(fakeResolveMethod),
      flush: sinon.spy(),
    };
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
      expect(testInterface.create.callCount).to.equal(0);
      expect(testInterface.createLTR.callCount).to.equal(0);
      expect(testInterface.createRTL.callCount).to.equal(0);
      expect(testInterface.resolve.callCount).to.equal(0);
      expect(testInterface.resolveLTR.callCount).to.equal(0);
      expect(testInterface.resolveRTL.callCount).to.equal(0);
      expect(testInterface.flush.callCount).to.equal(0);
      withStyles();
      expect(testInterface.create.callCount).to.equal(0);
      expect(testInterface.createLTR.callCount).to.equal(0);
      expect(testInterface.createRTL.callCount).to.equal(0);
      expect(testInterface.resolve.callCount).to.equal(0);
      expect(testInterface.resolveLTR.callCount).to.equal(0);
      expect(testInterface.resolveRTL.callCount).to.equal(0);
      expect(testInterface.flush.callCount).to.equal(0);
    });
  });

  describe('withStyles(styleFn)(Component)', () => {
    let providers;

    beforeEach(() => {
      providers = [
        <StylesInterfaceContext.Provider value={testInterface} />,
        <StylesThemeContext.Provider value={testTheme} />,
      ];
    });

    it('sets the displayName', () => {
      const MockComponent = () => null;
      const StyledComponent = withStyles()(MockComponent);
      expect(StyledComponent.displayName).to.equal('withStyles(MockComponent)');
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
      // eslint-disable-next-line react/forbid-foreign-prop-types
      expect(StyledComponent.propTypes).to.eql({ foo: PropTypes.string });
      expect(StyledComponent.defaultProps).to.eql({ foo: 'bar' });
    });

    describe('rendering without options (standard behavior)', () => {
      it('passes the theme to the stylesFn', () => {
        const stylesFn = sinon.spy();
        const MockComponent = () => null;
        const StyledComponent = withStyles(stylesFn)(MockComponent);
        mountWithProviders(<StyledComponent />, providers);
        expect(stylesFn.calledWith(testTheme)).to.equal(true);
      });

      it('passes the theme to the wrapped component through the `theme` prop', () => {
        const MockComponent = () => null;
        const StyledComponent = withStyles()(MockComponent);
        const wrapper = mountWithProviders(<StyledComponent />, providers);
        expect(wrapper.find(MockComponent).props().theme).to.equal(testTheme);
      });

      it('passes the styles to the wrapped component through the `styles` prop', () => {
        const testStyles = { foo: { color: 'bar' } };
        const MockComponent = () => null;
        const StyledComponent = withStyles(() => testStyles)(MockComponent);
        const wrapper = mountWithProviders(<StyledComponent />, providers);
        expect(wrapper.find(MockComponent).props().styles).to.equal(testStyles);
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
        expect(testInterface.flush.callCount).to.equal(0);
        mountWithProviders(<StyledComponent />, providers);
        expect(testInterface.flush.callCount).to.equal(0);
      });
    });

    describe('rendering with options (custom behavior)', () => {
      it('passes the theme to the wrapped component through the specified prop', () => {
        const MockComponent = ({ customTheme }) => {
          expect(customTheme).to.equal(testTheme);
          return null;
        };
        const StyledComponent = withStyles(null, { themePropName: 'customTheme' })(MockComponent);
        mountWithProviders(<StyledComponent />, providers);
      });

      it('passes the styles to the wrapped component through the specified prop', () => {
        const testStyles = { foo: { color: 'bar' } };
        const MockComponent = ({ customStyles }) => {
          expect(customStyles).to.equal(testStyles);
          return null;
        };
        const StyledComponent = withStyles(
          () => testStyles,
          { stylesPropName: 'customStyles' },
        )(MockComponent);
        mountWithProviders(<StyledComponent />, providers);
      });

      it('passes the css function to the wrapped component through the specified prop', () => {
        const MockComponent = ({ customCss }) => {
          expect(typeof customCss).to.equal('function');
          return null;
        };
        const StyledComponent = withStyles(null, { cssPropName: 'customCss' })(MockComponent);
        mountWithProviders(<StyledComponent />, providers);
      });

      it('calls the flush function before rendering when specified', () => {
        const MockComponent = () => null;
        const StyledComponent = withStyles(null, { flushBefore: true })(MockComponent);
        expect(testInterface.flush.callCount).to.equal(0);
        mountWithProviders(<StyledComponent />, providers);
        expect(testInterface.flush.callCount).to.equal(1);
      });
    });

    describe('in a non-directional context', () => {
      it('creates the styles for LTR', () => {
        const MockComponent = () => null;
        const WrappedComponent = withStyles()(MockComponent);
        expect(testInterface.create.callCount).to.equal(0);
        expect(testInterface.createLTR.callCount).to.equal(0);
        expect(testInterface.createRTL.callCount).to.equal(0);
        mountWithProviders(<WrappedComponent />, providers);
        expect(testInterface.create.callCount).to.equal(0);
        expect(testInterface.createLTR.callCount).to.equal(1);
        expect(testInterface.createRTL.callCount).to.equal(0);
      });

      it('resolves the styles for LTR', () => {
        const MockComponent = ({ css }) => <div {...css({})} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles()(MockComponent);
        expect(testInterface.resolve.callCount).to.equal(0);
        expect(testInterface.resolveLTR.callCount).to.equal(0);
        expect(testInterface.resolveRTL.callCount).to.equal(0);
        mountWithProviders(<StyledComponent />, providers);
        expect(testInterface.resolve.callCount).to.equal(0);
        expect(testInterface.resolveLTR.callCount).to.equal(1);
        expect(testInterface.resolveRTL.callCount).to.equal(0);
      });
    });

    describe('in an LTR directional context', () => {
      let ltrProviders;

      beforeEach(() => {
        ltrProviders = [
          <DirectionProvider direction={DIRECTIONS.LTR} />,
          <StylesInterfaceContext.Provider value={testInterface} />,
          <StylesThemeContext.Provider value={testTheme} />,
        ];
      });

      it('creates the styles for LTR', () => {
        const MockComponent = () => null;
        const WrappedComponent = withStyles()(MockComponent);
        expect(testInterface.create.callCount).to.equal(0);
        expect(testInterface.createLTR.callCount).to.equal(0);
        expect(testInterface.createRTL.callCount).to.equal(0);
        mountWithProviders(<WrappedComponent />, ltrProviders);
        expect(testInterface.create.callCount).to.equal(0);
        expect(testInterface.createLTR.callCount).to.equal(1);
        expect(testInterface.createRTL.callCount).to.equal(0);
      });

      it('resolves the styles for LTR', () => {
        const MockComponent = ({ css }) => <div {...css({})} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles()(MockComponent);
        expect(testInterface.resolve.callCount).to.equal(0);
        expect(testInterface.resolveLTR.callCount).to.equal(0);
        expect(testInterface.resolveRTL.callCount).to.equal(0);
        mountWithProviders(<StyledComponent />, ltrProviders);
        expect(testInterface.resolve.callCount).to.equal(0);
        expect(testInterface.resolveLTR.callCount).to.equal(1);
        expect(testInterface.resolveRTL.callCount).to.equal(0);
      });
    });

    describe('in an RTL directional context', () => {
      let rtlProviders;

      beforeEach(() => {
        rtlProviders = [
          <DirectionProvider direction={DIRECTIONS.RTL} />,
          <StylesInterfaceContext.Provider value={testInterface} />,
          <StylesThemeContext.Provider value={testTheme} />,
        ];
      });

      it('creates the styles for RTL', () => {
        const MockComponent = () => null;
        const WrappedComponent = withStyles()(MockComponent);
        expect(testInterface.create.callCount).to.equal(0);
        expect(testInterface.createLTR.callCount).to.equal(0);
        expect(testInterface.createRTL.callCount).to.equal(0);
        mountWithProviders(<WrappedComponent />, rtlProviders);
        expect(testInterface.create.callCount).to.equal(0);
        expect(testInterface.createLTR.callCount).to.equal(0);
        expect(testInterface.createRTL.callCount).to.equal(1);
      });

      it('resolves the styles for RTL', () => {
        const MockComponent = ({ css }) => <div {...css({})} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles()(MockComponent);
        expect(testInterface.resolve.callCount).to.equal(0);
        expect(testInterface.resolveLTR.callCount).to.equal(0);
        expect(testInterface.resolveRTL.callCount).to.equal(0);
        mountWithProviders(<StyledComponent />, rtlProviders);
        expect(testInterface.resolve.callCount).to.equal(0);
        expect(testInterface.resolveLTR.callCount).to.equal(0);
        expect(testInterface.resolveRTL.callCount).to.equal(1);
      });

      it('resolves the styles for RTL, even if using a pure component', () => {
        const MockComponent = ({ css }) => <div {...css({})} />;
        MockComponent.propTypes = { ...withStylesPropTypes };
        const StyledComponent = withStyles(null, { pureComponent: true })(MockComponent);
        expect(testInterface.resolve.callCount).to.equal(0);
        expect(testInterface.resolveLTR.callCount).to.equal(0);
        expect(testInterface.resolveRTL.callCount).to.equal(0);
        mountWithProviders(<StyledComponent />, rtlProviders);
        expect(testInterface.resolve.callCount).to.equal(0);
        expect(testInterface.resolveLTR.callCount).to.equal(0);
        expect(testInterface.resolveRTL.callCount).to.equal(1);
      });
    });

    describe('re-rendering', () => {
      let firstTheme;
      let secondTheme;
      let firstInterface;
      let secondInterface;

      const TestProvider = ({
        children, theme, stylesInterface, direction, siblingToPrepend,
      }) => (
        <DirectionProvider direction={direction}>
          <StylesInterfaceContext.Provider value={stylesInterface}>
            <StylesThemeContext.Provider value={theme}>
              {siblingToPrepend}
              {children}
            </StylesThemeContext.Provider>
          </StylesInterfaceContext.Provider>
        </DirectionProvider>
      );

      TestProvider.propTypes = {
        children: PropTypes.node.isRequired,
        // eslint-disable-next-line react/forbid-prop-types
        theme: PropTypes.object.isRequired,
        // eslint-disable-next-line react/forbid-prop-types
        stylesInterface: PropTypes.object.isRequired,
        direction: PropTypes.oneOf(['ltr', 'rtl']),
        siblingToPrepend: PropTypes.node,
      };

      TestProvider.defaultProps = {
        direction: 'ltr',
        siblingToPrepend: null,
      };

      beforeEach(() => {
        firstTheme = { color: { primary: '#000' } };
        secondTheme = { color: { primary: '#fff' } };
        firstInterface = {
          create: sinon.stub().callsFake(fakeCreateMethod),
          createLTR: sinon.stub().callsFake(fakeCreateMethod),
          createRTL: sinon.stub().callsFake(fakeCreateMethod),
          resolve: sinon.stub().callsFake(fakeResolveMethod),
          resolveLTR: sinon.stub().callsFake(fakeResolveMethod),
          resolveRTL: sinon.stub().callsFake(fakeResolveMethod),
        };
        secondInterface = {
          create: sinon.stub().callsFake(fakeCreateMethod),
          createLTR: sinon.stub().callsFake(fakeCreateMethod),
          createRTL: sinon.stub().callsFake(fakeCreateMethod),
          resolve: sinon.stub().callsFake(fakeResolveMethod),
          resolveLTR: sinon.stub().callsFake(fakeResolveMethod),
          resolveRTL: sinon.stub().callsFake(fakeResolveMethod),
        };
      });

      describe('re-rendering without options (standard behavior)', () => {
        it('does not re-create styles that have already been created on re-render', () => {
          const MockComponent = ({ css }) => <div {...css({})} />;
          MockComponent.propTypes = { ...withStylesPropTypes };
          const StyledComponent = withStyles()(MockComponent);
          expect(firstInterface.createLTR.callCount).to.equal(0);
          const wrapper = mount(
            <TestProvider theme={firstTheme} stylesInterface={firstInterface} direction="ltr">
              <StyledComponent />
            </TestProvider>,
          );
          expect(firstInterface.createLTR.callCount).to.equal(1);
          wrapper.setProps({ theme: firstTheme });
          expect(firstInterface.createLTR.callCount).to.equal(1);
          wrapper.setProps({ stylesInterface: firstInterface });
          expect(firstInterface.createLTR.callCount).to.equal(1);
          wrapper.setProps({ direction: 'ltr' });
          expect(firstInterface.createLTR.callCount).to.equal(1);
          wrapper.setProps({ siblingToPrepend: 'hello' });
          expect(firstInterface.createLTR.callCount).to.equal(1);
        });

        it('re-creates styles when direction, theme, or interface change', () => {
          const MockComponent = ({ css }) => <div {...css({})} />;
          MockComponent.propTypes = { ...withStylesPropTypes };
          const StyledComponent = withStyles()(MockComponent);
          expect(firstInterface.createLTR.callCount).to.equal(0);
          expect(firstInterface.createRTL.callCount).to.equal(0);
          const wrapper = mount(
            <TestProvider theme={firstTheme} stylesInterface={firstInterface} direction="ltr">
              <StyledComponent />
            </TestProvider>,
          );
          expect(firstInterface.createLTR.callCount).to.equal(1);
          expect(firstInterface.createRTL.callCount).to.equal(0);
          wrapper.setProps({ theme: secondTheme });
          expect(firstInterface.createLTR.callCount).to.equal(2);
          expect(firstInterface.createRTL.callCount).to.equal(0);
          expect(secondInterface.createLTR.callCount).to.equal(0);
          expect(secondInterface.createRTL.callCount).to.equal(0);
          wrapper.setProps({ stylesInterface: secondInterface });
          expect(firstInterface.createLTR.callCount).to.equal(2);
          expect(firstInterface.createRTL.callCount).to.equal(0);
          expect(secondInterface.createLTR.callCount).to.equal(1);
          expect(secondInterface.createRTL.callCount).to.equal(0);
          wrapper.setProps({ theme: firstTheme });
          expect(secondInterface.createLTR.callCount).to.equal(2);
          expect(secondInterface.createRTL.callCount).to.equal(0);
          wrapper.setProps({ direction: 'rtl' });
          expect(secondInterface.createLTR.callCount).to.equal(2);
          expect(secondInterface.createRTL.callCount).to.equal(1);
        });

        it('re-resolves styles on re-render', () => {
          const MockComponent = ({ css }) => <div {...css({})} />;
          MockComponent.propTypes = { ...withStylesPropTypes };
          const StyledComponent = withStyles()(MockComponent);
          expect(firstInterface.resolveLTR.callCount).to.equal(0);
          const wrapper = mount(
            <TestProvider theme={firstTheme} stylesInterface={firstInterface} direction="ltr">
              <StyledComponent />
            </TestProvider>,
          );
          expect(firstInterface.resolveLTR.callCount).to.equal(1);
          wrapper.setProps({ theme: firstTheme });
          expect(firstInterface.resolveLTR.callCount).to.equal(2);
          wrapper.setProps({ stylesInterface: firstInterface });
          expect(firstInterface.resolveLTR.callCount).to.equal(3);
          wrapper.setProps({ direction: 'ltr' });
          expect(firstInterface.resolveLTR.callCount).to.equal(4);
          wrapper.setProps({ direction: 'rtl' });
          expect(firstInterface.resolveLTR.callCount).to.equal(4);
          expect(firstInterface.resolveRTL.callCount).to.equal(1);
          wrapper.setProps({ siblingToPrepend: 'hello' });
          expect(firstInterface.resolveRTL.callCount).to.equal(2);
        });
      });

      describe('re-rendering with pureComponent option (custom behavior)', () => {
        let pureComponentOptions;

        beforeEach(() => {
          pureComponentOptions = { pureComponent: true };
        });

        it('does not re-create styles that have already been created on re-render', () => {
          const MockComponent = ({ css }) => <div {...css({})} />;
          MockComponent.propTypes = { ...withStylesPropTypes };
          const StyledComponent = withStyles(null, pureComponentOptions)(MockComponent);
          expect(firstInterface.createLTR.callCount).to.equal(0);
          const wrapper = mount(
            <TestProvider theme={firstTheme} stylesInterface={firstInterface} direction="ltr">
              <StyledComponent />
            </TestProvider>,
          );
          expect(firstInterface.createLTR.callCount).to.equal(1);
          wrapper.setProps({ theme: firstTheme });
          expect(firstInterface.createLTR.callCount).to.equal(1);
          wrapper.setProps({ stylesInterface: firstInterface });
          expect(firstInterface.createLTR.callCount).to.equal(1);
          wrapper.setProps({ direction: 'ltr' });
          expect(firstInterface.createLTR.callCount).to.equal(1);
          wrapper.setProps({ siblingToPrepend: 'hello' });
          expect(firstInterface.createLTR.callCount).to.equal(1);
        });

        it('re-creates styles when direction, theme, or interface change', () => {
          const MockComponent = ({ css }) => <div {...css({})} />;
          MockComponent.propTypes = { ...withStylesPropTypes };
          const StyledComponent = withStyles(null, pureComponentOptions)(MockComponent);
          expect(firstInterface.createLTR.callCount).to.equal(0);
          expect(firstInterface.createRTL.callCount).to.equal(0);
          const wrapper = mount(
            <TestProvider theme={firstTheme} stylesInterface={firstInterface} direction="ltr">
              <StyledComponent />
            </TestProvider>,
          );
          expect(firstInterface.createLTR.callCount).to.equal(1);
          expect(firstInterface.createRTL.callCount).to.equal(0);
          wrapper.setProps({ theme: secondTheme });
          expect(firstInterface.createLTR.callCount).to.equal(2);
          expect(firstInterface.createRTL.callCount).to.equal(0);
          expect(secondInterface.createLTR.callCount).to.equal(0);
          expect(secondInterface.createRTL.callCount).to.equal(0);
          wrapper.setProps({ stylesInterface: secondInterface });
          expect(firstInterface.createLTR.callCount).to.equal(2);
          expect(firstInterface.createRTL.callCount).to.equal(0);
          expect(secondInterface.createLTR.callCount).to.equal(1);
          expect(secondInterface.createRTL.callCount).to.equal(0);
          wrapper.setProps({ theme: firstTheme });
          expect(secondInterface.createLTR.callCount).to.equal(2);
          expect(secondInterface.createRTL.callCount).to.equal(0);
          wrapper.setProps({ direction: 'rtl' });
          expect(secondInterface.createLTR.callCount).to.equal(2);
          expect(secondInterface.createRTL.callCount).to.equal(1);
        });

        it('does not re-resolve styles on re-render', () => {
          const MockComponent = ({ css }) => <div {...css({})} />;
          MockComponent.propTypes = { ...withStylesPropTypes };
          const StyledComponent = withStyles(null, pureComponentOptions)(MockComponent);
          expect(firstInterface.resolveLTR.callCount).to.equal(0);
          const wrapper = mount(
            <TestProvider theme={firstTheme} stylesInterface={firstInterface} direction="ltr">
              <StyledComponent />
            </TestProvider>,
          );
          expect(firstInterface.resolveLTR.callCount).to.equal(1);
          wrapper.setProps({ theme: firstTheme });
          expect(firstInterface.resolveLTR.callCount).to.equal(1);
          wrapper.setProps({ stylesInterface: firstInterface });
          expect(firstInterface.resolveLTR.callCount).to.equal(1);
          wrapper.setProps({ direction: 'ltr' });
          expect(firstInterface.resolveLTR.callCount).to.equal(1);
          expect(firstInterface.resolveRTL.callCount).to.equal(0);
          wrapper.setProps({ direction: 'rtl' });
          expect(firstInterface.resolveLTR.callCount).to.equal(1);
          expect(firstInterface.resolveRTL.callCount).to.equal(1);
          wrapper.setProps({ siblingToPrepend: 'hello' });
          expect(firstInterface.resolveRTL.callCount).to.equal(1);
        });
      });
    });
  });

  describe('Nested context', () => {
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

      outerMostTheme = { color: { primary: '#000' } };
      innerMostTheme = { color: { primary: '#fff' } };

      outerMostInterface = {
        create: sinon.stub().callsFake(fakeCreateMethod),
        resolve: sinon.stub().callsFake(fakeResolveMethod),
      };
      innerMostInterface = {
        create: sinon.stub().callsFake(fakeCreateMethod),
        resolve: sinon.stub().callsFake(fakeResolveMethod),
      };

      nestedProviders = [
        <StylesInterfaceContext.Provider value={outerMostInterface} />,
        <StylesInterfaceContext.Provider value={innerMostInterface} />,
        <StylesThemeContext.Provider value={outerMostTheme} />,
        <StylesThemeContext.Provider value={innerMostTheme} />,
      ];
    });

    it('uses the innermost theme', () => {
      const MockComponent = ({ styles, css }) => <div {...css(styles.primary)} />;
      MockComponent.propTypes = { ...withStylesPropTypes };
      const StyledComponent = withStyles(stylesFn)(MockComponent);
      const wrapper = mountWithProviders(<StyledComponent />, nestedProviders);
      expect(stylesFn.calledWith(innerMostTheme)).to.equal(true);
      expect(wrapper.find(MockComponent).props().theme).to.equal(innerMostTheme);
    });

    it('uses the innermost interface', () => {
      const MockComponent = ({ styles, css }) => <div {...css(styles.primary)} />;
      MockComponent.propTypes = { ...withStylesPropTypes };
      const StyledComponent = withStyles(stylesFn)(MockComponent);
      expect(outerMostInterface.create.callCount).to.equal(0);
      expect(outerMostInterface.resolve.callCount).to.equal(0);
      expect(innerMostInterface.create.callCount).to.equal(0);
      expect(innerMostInterface.resolve.callCount).to.equal(0);
      mountWithProviders(<StyledComponent />, nestedProviders);
      expect(outerMostInterface.create.callCount).to.equal(0);
      expect(outerMostInterface.resolve.callCount).to.equal(0);
      expect(innerMostInterface.create.callCount).to.equal(1);
      expect(innerMostInterface.resolve.callCount).to.equal(1);
    });
  });
});
