import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Beacon } from '@/types';
import { Zone } from '@/components/mapping/types';

interface HeatmapOverlayProps {
  beacons: Beacon[];
  zones: Zone[];
  markerPositions: { id: string; position: { x: number; y: number } }[];
}

const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({
  beacons,
  zones,
  markerPositions,
}) => {
  const { theme } = useTheme();

  // Gerar pontos de calor com base na intensidade do sinal
  const heatPoints = beacons
    .filter(beacon => beacon.status === 'active')
    .map(beacon => {
      const position = markerPositions.find(p => p.id === beacon.id);
      if (!position) return null;
      
      const intensity = beacon.signalStrength / 100;
      const size = 30 + intensity * 70;
      
      let color;
      if (beacon.signalStrength > 75) {
        color = `${theme.colors.error[500]}80`;
      } else if (beacon.signalStrength > 50) {
        color = `${theme.colors.warning[500]}80`;
      } else {
        color = `${theme.colors.success[500]}80`;
      }
      
      return (
        <View
          key={beacon.id}
          style={[
            styles.heatPoint,
            {
              top: `${position.position.y}%`,
              left: `${position.position.x}%`,
              width: size,
              height: size,
              backgroundColor: color,
              transform: [{ translateX: -size/2 }, { translateY: -size/2 }],
            },
          ]}
        />
      );
    })
    .filter(Boolean);

  return <View style={styles.container}>{heatPoints}</View>;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heatPoint: {
    position: 'absolute',
    borderRadius: 100,
  },
});

export default HeatmapOverlay;