import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bluetooth, MapPin } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Beacon, Motorcycle } from '@/types';

interface BeaconMarkersProps {
  beacons: Beacon[];
  markerPositions: { id: string; position: { x: number; y: number } }[];
  selectedBeacon: string | null;
  onBeaconPress: (beaconId: string) => void;
  motorcycles: Motorcycle[];
}

const BeaconMarkers: React.FC<BeaconMarkersProps> = ({
  beacons,
  markerPositions,
  selectedBeacon,
  onBeaconPress,
  motorcycles,
}) => {
  const { theme } = useTheme();

  return (
    <>
      {beacons.map((beacon) => {
        const markerPosition = markerPositions.find((p) => p.id === beacon.id);
        const isSelected = selectedBeacon === beacon.id;
        const moto = beacon.motoId ? motorcycles.find((m) => m.id === beacon.motoId) : null;

        if (!markerPosition) return null;

        return (
          <TouchableOpacity
            key={beacon.id}
            style={[
              styles.marker,
              {
                backgroundColor: theme.colors.white,
                top: `${markerPosition.position.y}%`,
                left: `${markerPosition.position.x}%`,
              },
              isSelected && styles.selectedMarker,
            ]}
            onPress={() => onBeaconPress(beacon.id)}
          >
            {isSelected ? (
              <Bluetooth size={24} color={theme.colors.white} />
            ) : (
              <MapPin 
                size={24} 
                color={beacon.status === 'active' ? theme.colors.primary[500] : theme.colors.gray[400]} 
              />
            )}
            
            {isSelected && moto && (
              <View style={[styles.tooltip, { backgroundColor: theme.colors.white }]}>
                <Text style={[styles.tooltipText, { color: theme.colors.gray[900] }]}>
                  {moto.model}
                </Text>
                <Text style={[styles.tooltipText, { color: theme.colors.gray[700] }]}>
                  {moto.licensePlate}
                </Text>
              </View>
            )}
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
  selectedMarker: {
    backgroundColor: '#3b82f6',
    transform: [{ translateX: -20 }, { translateY: -20 }, { scale: 1.2 }],
  },
  tooltip: {
    position: 'absolute',
    top: -50,
    left: -30,
    padding: 8,
    borderRadius: 8,
    minWidth: 100,
    elevation: 5,
  },
  tooltipText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default BeaconMarkers;