import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ZoomIn, ZoomOut, LocateFixed, Bike } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onTogglePlacement: () => void;
  isPlacementMode: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  onTogglePlacement,
  isPlacementMode,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.white }]}
        onPress={onZoomIn}
      >
        <ZoomIn size={20} color={theme.colors.gray[700]} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.white }]}
        onPress={onZoomOut}
      >
        <ZoomOut size={20} color={theme.colors.gray[700]} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.white }]}
        onPress={onResetView}
      >
        <LocateFixed size={20} color={theme.colors.gray[700]} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isPlacementMode 
              ? theme.colors.primary[500] 
              : theme.colors.white,
          },
        ]}
        onPress={onTogglePlacement}
      >
        <Bike size={20} color={isPlacementMode ? theme.colors.white : theme.colors.gray[700]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    elevation: 5,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});

export default MapControls;