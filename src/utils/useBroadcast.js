import { useEffect, useState } from 'react';

export default function useBroadcast(broadcast, defaultValue) {
  if (!useState || !useEffect) {
    throw new ReferenceError('useBroadcast() requires React 16.8 or later');
  }

  const [value, setValue] = useState(broadcast ? broadcast.getState() : defaultValue);

  useEffect(() => {
    if (broadcast) {
      const unsubscribe = broadcast.subscribe(setValue);
      return unsubscribe;
    }
    return undefined;
  }, [broadcast]);

  return value;
}
