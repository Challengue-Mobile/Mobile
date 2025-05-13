import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Bike } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Motorcycle } from '@/types';

interface MotorcycleMarkersProps {
  motorcycles: Motorcycle[];
  markerPositions: { id: string; position: { x: number; y: number } }[];
  onMotorcyclePress: (motoId: string) => void;
}

const MotorcycleMarkers: React.FC<MotorcycleMarkersProps> = ({
  motorcycles,
  markerPositions,
  onMotorcyclePress,
}) => {
  const { theme } = useTheme();

  return (
    <>
      {motorcycles
        .filter((moto) => moto.status === 'in-yard')
        .map((moto) => {
          const markerPosition = markerPositions.find((p) => p.id === moto.id);
          
          if (!markerPosition) return null;

          return (
            <TouchableOpacity
              key={moto.id}
              style={[
                styles.marker,
                {
                  backgroundColor: theme.colors.white,
                  top: `${markerPosition.position.y}%`,
                  left: `${markerPosition.position.x}%`,
                },
              ]}
              onPress={() => onMotorcyclePress(moto.id)}
            >
              <Bike size={24} color={theme.colors.secondary[500]} />
            </TouchableOpacity>
          );
        })}
    </>
  );
};

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default MotorcycleMarkers;