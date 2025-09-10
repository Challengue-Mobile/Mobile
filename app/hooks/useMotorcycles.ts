import { useState } from 'react';
import { Motorcycle } from '@/types';

export const useMotorcycles = () => {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(false);

  const addMotorcycle = (moto: Motorcycle) => {
    setMotorcycles(prev => [...prev, moto]);
  };

  const removeMotorcycle = (id: string) => {
    setMotorcycles(prev => prev.filter(m => m.id !== id));
  };

  return { motorcycles, loading, addMotorcycle, removeMotorcycle };
};
