import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Beacon } from '@/types';

export function useBeacons() {
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load beacons from AsyncStorage on hook initialization
  useEffect(() => {
    loadBeacons();
  }, []);

  const loadBeacons = async () => {
    try {
      setLoading(true);
      const storedBeacons = await AsyncStorage.getItem('beacons');
      
      if (storedBeacons) {
        setBeacons(JSON.parse(storedBeacons));
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load beacons');
      console.error('Error loading beacons:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveBeacon = async (beacon: Beacon) => {
    try {
      setLoading(true);
      
      const updatedBeacons = [...beacons];
      const index = updatedBeacons.findIndex(b => b.id === beacon.id);
      
      if (index >= 0) {
        // Update existing beacon
        updatedBeacons[index] = beacon;
      } else {
        // Add new beacon
        updatedBeacons.push(beacon);
      }
      
      await AsyncStorage.setItem('beacons', JSON.stringify(updatedBeacons));
      setBeacons(updatedBeacons);
      setError(null);
    } catch (err) {
      setError('Failed to save beacon');
      console.error('Error saving beacon:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBeacon = async (id: string) => {
    try {
      setLoading(true);
      
      const updatedBeacons = beacons.filter(b => b.id !== id);
      
      await AsyncStorage.setItem('beacons', JSON.stringify(updatedBeacons));
      setBeacons(updatedBeacons);
      setError(null);
    } catch (err) {
      setError('Failed to delete beacon');
      console.error('Error deleting beacon:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    beacons,
    loading,
    error,
    loadBeacons,
    saveBeacon,
    deleteBeacon,
  };
}