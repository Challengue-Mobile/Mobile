import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Zone } from './types';

interface ZonesOverlayProps {
  zones: Zone[];
  selectedZone: string | null;
  isEditMode: boolean;
  onZonePress: (zoneId: string) => void;
  onZoneLongPress?: (zoneId: string) => void;
}

const ZonesOverlay: React.FC<ZonesOverlayProps> = ({
  zones,
  selectedZone,
  isEditMode,
  onZonePress,
  onZoneLongPress,
}) => {
  const { theme } = useTheme();

  return (
    <>
      {zones.map((zone) => {
        const top = parseFloat(zone.position.top);
        const left = parseFloat(zone.position.left);
        const width = parseFloat(zone.position.width);
        const height = parseFloat(zone.position.height);

        return (
          <TouchableOpacity
            key={zone.id}
            onPress={() => onZonePress(zone.id)}
            onLongPress={() => onZoneLongPress?.(zone.id)}
            style={[
              styles.zone,
              {
                top: `${top}%`,
                left: `${left}%`,
                width: `${width}%`,
                height: `${height}%`,
                backgroundColor: `${zone.color}80`,
                borderColor: zone.color,
              },
              isEditMode && styles.editableZone,
              selectedZone === zone.id && styles.selectedZone,
            ]}
          >
            <Text style={styles.zoneLabel}>
              {zone.id}: {zone.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  zone: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editableZone: {
    borderStyle: 'dashed',
  },
  selectedZone: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  zoneLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default ZonesOverlay;