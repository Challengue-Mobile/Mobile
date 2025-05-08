import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Zone } from './useZoneDrag';

export interface ZoneConfig {
  gridVisible: boolean;
  gridSize: number;
}

export interface ZoneManagerResult {
  zones: Zone[];
  selectedZone: string | null;
  config: ZoneConfig;
  addZone: (zone: Omit<Zone, 'id'>) => void;
  updateZone: (zone: Zone) => void;
  deleteZone: (zoneId: string) => void;
  selectZone: (zoneId: string | null) => void;
  updateConfig: (config: Partial<ZoneConfig>) => void;
  saveZones: () => Promise<void>;
  loadZones: () => Promise<void>;
}

/**
 * Hook para gerenciar o estado completo das zonas e suas configurações
 * @param initialZones Zonas iniciais
 * @param initialConfig Configurações iniciais
 * @param persistKey Chave para persistência no AsyncStorage
 */
export const useZones = (
  initialZones: Zone[] = [],
  initialConfig: ZoneConfig = { gridVisible: true, gridSize: 10 },
  persistKey = 'yard_zones'
): ZoneManagerResult => {
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [config, setConfig] = useState<ZoneConfig>(initialConfig);

  // Adicionar uma nova zona
  const addZone = useCallback((zone: Omit<Zone, 'id'>) => {
    const newZone: Zone = {
      ...zone,
      id: `zone-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    
    setZones(currentZones => [...currentZones, newZone]);
    return newZone.id;
  }, []);

  // Atualizar uma zona existente
  const updateZone = useCallback((updatedZone: Zone) => {
    setZones(currentZones => 
      currentZones.map(zone => 
        zone.id === updatedZone.id ? updatedZone : zone
      )
    );
  }, []);

  // Excluir uma zona
  const deleteZone = useCallback((zoneId: string) => {
    setZones(currentZones => currentZones.filter(zone => zone.id !== zoneId));
    if (selectedZone === zoneId) {
      setSelectedZone(null);
    }
  }, [selectedZone]);

  // Selecionar uma zona
  const selectZone = useCallback((zoneId: string | null) => {
    setSelectedZone(zoneId);
  }, []);

  // Atualizar configurações
  const updateConfig = useCallback((newConfig: Partial<ZoneConfig>) => {
    setConfig(currentConfig => ({
      ...currentConfig,
      ...newConfig
    }));
  }, []);

  // Persistência: salvar zonas no AsyncStorage
  const saveZones = useCallback(async () => {
    try {
      const data = {
        zones,
        config
      };
      await AsyncStorage.setItem(persistKey, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar zonas:', error);
    }
  }, [zones, config, persistKey]);

  // Persistência: carregar zonas do AsyncStorage
  const loadZones = useCallback(async () => {
    try {
      const dataStr = await AsyncStorage.getItem(persistKey);
      if (dataStr) {
        const data = JSON.parse(dataStr);
        setZones(data.zones || []);
        setConfig(data.config || initialConfig);
      }
    } catch (error) {
      console.error('Erro ao carregar zonas:', error);
    }
  }, [persistKey, initialConfig]);

  // Carregar zonas ao inicializar
  useEffect(() => {
    loadZones();
  }, [loadZones]);

  return {
    zones,
    selectedZone,
    config,
    addZone,
    updateZone,
    deleteZone,
    selectZone,
    updateConfig,
    saveZones,
    loadZones
  };
};