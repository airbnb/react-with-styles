import { useEffect, useState, useRef } from 'react';

export default function useBroadcast(broadcast, defaultValue) {
  const [value, setValue] = useState(broadcast ? broadcast.getState() : defaultValue);
  const unsubscribeRef = useRef();

  useEffect(() => {
    if (broadcast && !unsubscribeRef.current) {
      unsubscribeRef.current = broadcast.subscribe(setValue);
    }
    return unsubscribeRef.current;
  }, [broadcast]);

  return value;
}
