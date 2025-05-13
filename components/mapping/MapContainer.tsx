import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MapContainerProps {
  isEditMode: boolean;
  children: React.ReactNode;
}

const MapContainer: React.FC<MapContainerProps> = ({ isEditMode, children }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.gray[50] }]}>
      <View style={styles.mapArea}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    margin: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});

export default MapContainer;