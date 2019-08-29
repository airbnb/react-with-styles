import { useContext, useRef } from 'react';

export default function detectHooks() {
  return useContext && useRef;
}
