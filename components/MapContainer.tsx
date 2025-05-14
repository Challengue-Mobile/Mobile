// Arquivo: components/MapContainer.tsx
// Componente de contêiner para o mapa

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MapContainerProps {
  children?: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({ 
  children, 
  style,
  onPress 
}) => {
  const { theme } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: theme.colors.gray[800] },
        style
      ]}
      onTouchEnd={onPress}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative'
  }
});