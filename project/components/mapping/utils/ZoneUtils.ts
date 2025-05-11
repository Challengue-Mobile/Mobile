import { Zone } from '../types';
// Use a hardcoded color instead of relying on MapCalculations
// import { generateRandomColor } from './MapCalculations';
import { lightTheme } from '../../../constants/Themes';

/**
 * Cria uma nova zona com posição padrão
 */
export const createNewZone = (name: string, color?: string): Zone => {
  return {
    id: `zone-${Date.now()}`,
    name,
    color: color || lightTheme.colors.primary[300],
    position: {
      top: "30%",
      left: "30%",
      width: "20%",
      height: "20%"
    }
  };
};

/**
 * Atualiza uma zona existente
 */
export const updateZone = (zones: Zone[], zoneId: string, updates: Partial<Zone>): Zone[] => {
  return zones.map(zone => 
    zone.id === zoneId ? { ...zone, ...updates } : zone
  );
};

/**
 * Remove uma zona
 */
export const removeZone = (zones: Zone[], zoneId: string): Zone[] => {
  return zones.filter(zone => zone.id !== zoneId);
};

/**
 * Verifica se há sobreposição entre zonas
 */
export const checkZoneOverlap = (zones: Zone[], newZone: Zone): boolean => {
  // Implementação de verificação de colisão entre retângulos
  return zones.some(zone => {
    const a = zone.position;
    const b = newZone.position;
    
    const aLeft = parseFloat(a.left);
    const aRight = aLeft + parseFloat(a.width);
    const aTop = parseFloat(a.top);
    const aBottom = aTop + parseFloat(a.height);
    
    const bLeft = parseFloat(b.left);
    const bRight = bLeft + parseFloat(b.width);
    const bTop = parseFloat(b.top);
    const bBottom = bTop + parseFloat(b.height);
    
    return !(
      bLeft > aRight ||
      bRight < aLeft ||
      bTop > aBottom ||
      bBottom < aTop
    );
  });
};