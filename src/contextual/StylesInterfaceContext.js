import { createContext } from 'react';

function unimplementedRequiredFunction() {
  throw new Error(
    'No styles interface provided. Use `react-with-styles/lib/StylesInterfaceContext` to set the interface at the top of your application',
  );
}

const StylesInterfaceContext = createContext({
  create: unimplementedRequiredFunction,
  resolve: unimplementedRequiredFunction,
});

export default StylesInterfaceContext;
