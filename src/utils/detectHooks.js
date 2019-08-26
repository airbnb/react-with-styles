import React from 'react';

export default function detectHooks() {
  return React.useContext && React.useRef && React.useEffect && React.useState;
}
