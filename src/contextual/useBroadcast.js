import { useState, useEffect } from 'react';

export default function useBroadcast(broadcast, defaultValue) {
  const [broadcastUnsubscribe, setBroadcastcastUnsubscribe] = useState();
  const [value, setValue] = useState(broadcast ? broadcast.getState() : defaultValue);

  useEffect(() => {
    if (broadcast) {
      setBroadcastcastUnsubscribe(broadcast.subscribe(setValue));
    }
    return () => {
      if (broadcastUnsubscribe) {
        broadcastUnsubscribe();
      }
    };
  }, [broadcastUnsubscribe, broadcast]);

  return value;
}
