import React from 'react';
import { expect } from 'chai';
import { render } from 'enzyme';
import sinon from 'sinon-sandbox';
import DirectionProvider, { DIRECTIONS } from 'react-with-direction/dist/DirectionProvider';

import ThemedStyleSheet from '../src/ThemedStyleSheet';
import withExtendStyles from '../src/withExtendStyles';
import { withStyles } from '../src/withStyles';

describe('withExtendStyles()', () => {
  const defaultTheme = {
    color: {
      red: '#990000',
      blue: '#334CFF',
    },
  };

  let testInterface;

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
    sinon.stub(testInterface, 'resolveLTR')
      .callsFake(fakeResolveMethod);
    sinon.stub(testInterface, 'resolveRTL')
      .callsFake(fakeResolveMethod);

    ThemedStyleSheet.registerTheme(defaultTheme);
    ThemedStyleSheet.registerInterface(testInterface);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('creates the styles in a non-directional context', () => {
    function MyComponent() {
      return null;
    }

    const WrappedComponent = withStyles(() => ({}))(MyComponent);
    const WrappedComponentWithExtendedStyles = withExtendStyles(() => ({}))(WrappedComponent);
    render(<WrappedComponentWithExtendedStyles />);

    expect(testInterface.createLTR.callCount).to.equal(1);
  });

  it('creates the styles in an LTR context', () => {
    function MyComponent() {
      return null;
    }

    const WrappedComponent = withStyles(() => ({}))(MyComponent);
    const WrappedComponentWithExtendedStyles = withExtendStyles(() => ({}))(WrappedComponent);
    render((
      <DirectionProvider direction={DIRECTIONS.LTR}>
        <WrappedComponentWithExtendedStyles />
      </DirectionProvider>
    ));
    expect(testInterface.createLTR.callCount).to.equal(1);
  });

  it('creates the styles in an RTL context', () => {
    function MyComponent() {
      return null;
    }

    const WrappedComponent = withStyles(() => ({}))(MyComponent);
    const WrappedComponentWithExtendedStyles = withExtendStyles(() => ({}))(WrappedComponent);
    render((
      <DirectionProvider direction={DIRECTIONS.RTL}>
        <WrappedComponentWithExtendedStyles />
      </DirectionProvider>
    ));
    expect(testInterface.createRTL.callCount).to.equal(1);
  });

  it('extends base styles', () => {
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
            background: true,
          },
        },
      },
    )(MyComponent);
    const WrappedComponentWithExtendedStyles = withExtendStyles(() => ({
      container: {
        background: 'green',
      },
    }))(WrappedComponent);
    render(
      <WrappedComponentWithExtendedStyles />,
    );

    expect(testInterface.createLTR.callCount).to.equal(1);
    expect(testInterface.createLTR.getCall(0).args[0]).to.eql({
      container: {
        background: 'green',
        color: 'blue',
      },
    });
  });

  it('extends base styles (multiple classes)', () => {
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
          background: 'white',
          border: '1px solid black',
        },
        content: {
          fontSize: '25px',
        },
      }),
      {
        extendableStyles: {
          container: {
            background: true,
          },
          innerContainer: {
            border: true,
          },
          content: {
            fontSize: true,
          },
        },
      },
    )(MyComponent);
    const WrappedComponentWithExtendedStyles = withExtendStyles(() => ({
      container: {
        background: 'green',
      },
      innerContainer: {
        border: '10px solid green',
      },
      content: {
        fontSize: '12px',
      },
    }))(WrappedComponent);
    render(
      <WrappedComponentWithExtendedStyles />,
    );

    expect(testInterface.createLTR.callCount).to.equal(1);
    expect(testInterface.createLTR.getCall(0).args[0]).to.eql({
      container: {
        background: 'green',
        color: 'blue',
      },
      innerContainer: {
        background: 'white',
        border: '10px solid green',
      },
      content: {
        fontSize: '12px',
      },
    });
  });

  it('extends base styles with multiple layers', () => {
    function MyComponent() {
      return null;
    }

    const WrappedComponent = withStyles(
      () => ({
        container: {
          background: 'red',
          color: 'blue',
          fontSize: '10px',
        },
      }),
      {
        extendableStyles: {
          container: {
            background: true,
            fontSize: true,
          },
        },
      },
    )(MyComponent);

    const WrappedComponentWithExtendedStyles = withExtendStyles(() => ({
      container: {
        background: 'green',
        fontSize: '12px',
      },
    }))(WrappedComponent);

    const WrappedComponentWithNestedExtendedStyles = withExtendStyles(() => ({
      container: {
        fontSize: '20px',
      },
    }))(WrappedComponentWithExtendedStyles);

    render(
      <WrappedComponentWithNestedExtendedStyles />,
    );

    expect(testInterface.createLTR.callCount).to.equal(1);
    expect(testInterface.createLTR.getCall(0).args[0]).to.eql({
      container: {
        background: 'green',
        color: 'blue',
        fontSize: '20px',
      },
    });
  });

  it('throws an error if an invalid extending style is provided', () => {
    function MyComponent() {
      return null;
    }

    const WrappedComponent = withStyles(
      () => ({
        container: {
          background: 'red',
          color: 'blue',
          fontSize: '10px',
        },
      }),
      {
        extendableStyles: {
          container: {
            background: true,
          },
        },
      },
    )(MyComponent);

    const WrappedComponentWithExtendedStyles = withExtendStyles(() => ({
      container: {
        // fontSize is invalid
        fontSize: '12px',
      },
    }))(WrappedComponent);

    expect(() => render(
      <WrappedComponentWithExtendedStyles />,
    )).to.throw();
  });

  it('throws an error if extendableStyles is not defined, and an extending style is provided', () => {
    function MyComponent() {
      return null;
    }

    const WrappedComponent = withStyles(
      () => ({
        container: {
          background: 'red',
          color: 'blue',
          fontSize: '10px',
        },
      }),
      {
        // no extendableStyles
      },
    )(MyComponent);

    const WrappedComponentWithExtendedStyles = withExtendStyles(() => ({
      container: {
        // fontSize is invalid
        fontSize: '12px',
      },
    }))(WrappedComponent);

    expect(() => render(
      <WrappedComponentWithExtendedStyles />,
    )).to.throw();
  });

  it('uses original base styles if no extending styles are provided', () => {
    function MyComponent() {
      return null;
    }

    const WrappedComponent = withStyles(() => ({
      container: {
        background: 'red',
        color: 'blue',
      },
    }))(MyComponent);
    const WrappedComponentWithExtendedStyles = withExtendStyles(() => ({}))(WrappedComponent);
    render(
      <WrappedComponentWithExtendedStyles />,
    );

    expect(testInterface.createLTR.callCount).to.equal(1);
    expect(testInterface.createLTR.getCall(0).args[0]).to.eql({
      container: {
        background: 'red',
        color: 'blue',
      },
    });
  });

  it('receives the registered theme in the extend style function', (done) => {
    function MyComponent() {
      return null;
    }

    const WrappedComponent = withStyles(() => ({}))(MyComponent);
    const WrappedComponentWithExtendedStyles = withExtendStyles((theme) => {
      expect(theme).to.equal(defaultTheme);
      done();
      return {};
    })(WrappedComponent);
    render(
      <WrappedComponentWithExtendedStyles />,
    );
  });

  it('allows the extend styles prop name to be customized', () => {
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
        extendStyleFnPropName: 'foobar',
        extendableStyles: {
          container: {
            background: true,
          },
        },
      },
    )(MyComponent);
    const WrappedComponentWithExtendedStyles = withExtendStyles(
      () => ({
        container: {
          background: 'pink',
        },
      }),
      { extendStyleFnPropName: 'foobar' },
    )(WrappedComponent);
    render(
      <WrappedComponentWithExtendedStyles />,
    );

    expect(testInterface.createLTR.callCount).to.equal(1);
    expect(testInterface.createLTR.getCall(0).args[0]).to.eql({
      container: {
        background: 'pink',
        color: 'blue',
      },
    });
  });

  it('passes the processed styles to the wrapped component', () => {
    function MyComponent({ styles }) {
      expect(styles).to.eql({ foo: { color: '#334CFF' } });
      return null;
    }

    const WrappedComponent = withStyles(
      ({ color }) => ({
        foo: {
          color: color.red,
        },
      }),
      {
        extendableStyles: {
          foo: {
            color: true,
          },
        },
      },
    )(MyComponent);
    const WrappedComponentWithExtendedStyles = withExtendStyles(({ color }) => ({
      foo: {
        color: color.blue,
      },
    }))(WrappedComponent);
    render(<WrappedComponentWithExtendedStyles />);
  });

  it('has a wrapped displayName', () => {
    function MyComponent() {
      return null;
    }

    const result = withExtendStyles(() => ({}))(MyComponent);
    expect(result.displayName).to.equal('withExtendStyles(MyComponent)');
  });

  it('hoists statics', () => {
    function MyComponent() {
      return null;
    }
    MyComponent.foo = 'bar';

    const WrappedComponent = withStyles(() => ({}))(MyComponent);
    const WrappedComponentWithExtendedStyles = withExtendStyles(() => ({}))(WrappedComponent);
    expect(WrappedComponentWithExtendedStyles.foo).to.equal('bar');
  });
});
