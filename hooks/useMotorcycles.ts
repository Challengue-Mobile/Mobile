import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Motorcycle } from '@/types';

export function useMotorcycles() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load motorcycles from AsyncStorage on hook initialization
  useEffect(() => {
    loadMotorcycles();
  }, []);

  const loadMotorcycles = async () => {
    try {
      setLoading(true);
      const storedMotorcycles = await AsyncStorage.getItem('motorcycles');
      
      if (storedMotorcycles) {
        setMotorcycles(JSON.parse(storedMotorcycles));
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load motorcycles');
      console.error('Error loading motorcycles:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveMotorcycle = async (motorcycle: Motorcycle) => {
    try {
      setLoading(true);
      
      const updatedMotorcycles = [...motorcycles];
      const index = updatedMotorcycles.findIndex(m => m.id === motorcycle.id);
      
      if (index >= 0) {
        // Update existing motorcycle
        updatedMotorcycles[index] = motorcycle;
      } else {
        // Add new motorcycle
        updatedMotorcycles.push(motorcycle);
      }
      
      await AsyncStorage.setItem('motorcycles', JSON.stringify(updatedMotorcycles));
      setMotorcycles(updatedMotorcycles);
      setError(null);
    } catch (err) {
      setError('Failed to save motorcycle');
      console.error('Error saving motorcycle:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMotorcycle = async (id: string) => {
    try {
      setLoading(true);
      
      const updatedMotorcycles = motorcycles.filter(m => m.id !== id);
      
      await AsyncStorage.setItem('motorcycles', JSON.stringify(updatedMotorcycles));
      setMotorcycles(updatedMotorcycles);
      setError(null);
    } catch (err) {
      setError('Failed to delete motorcycle');
      console.error('Error deleting motorcycle:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    motorcycles,
    loading,
    error,
    loadMotorcycles,
    saveMotorcycle,
    deleteMotorcycle,
  };
}