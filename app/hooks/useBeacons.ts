import { useState, useEffect } from 'react';
import { Beacon } from '@/types';

export const useBeacons = () => {
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [loading, setLoading] = useState(false);

  const addBeacon = (beacon: Beacon) => {
    setBeacons(prev => [...prev, beacon]);
  };

  const removeBeacon = (id: string) => {
    setBeacons(prev => prev.filter(b => b.id !== id));
  };

  return { beacons, loading, addBeacon, removeBeacon };
};
