import ifReact from 'enzyme-adapter-react-helper/build/ifReact';

export function describeIfReact(version, ...rest) {
  return ifReact(version, describe, describe.skip)(...rest);
}

export default {
  describeIfReact,
};
