import { useState } from 'react';
import { Zone } from '@/types';

export const useZones = () => {
  const [zones, setZones] = useState<Zone[]>([]);

  const addZone = (zone: Zone) => {
    setZones(prev => [...prev, zone]);
  };

  const removeZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
  };

  return { zones, addZone, removeZone };
};
