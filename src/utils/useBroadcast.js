import { useEffect, useState } from 'react';

export default function useBroadcast(broadcast, defaultValue) {
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
