import React, { forwardRef } from 'react';
import { View, Image, StyleSheet, GestureResponderEvent } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MapViewProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  backgroundImage?: any;
  backgroundColor?: string;
  style?: any;
}

const MapView = forwardRef<View, MapViewProps>(({
  children,
  onPress,
  backgroundImage,
  backgroundColor,
  style
}, ref) => {
  const { theme } = useTheme();
  
  return (
    <View
      ref={ref}
      style={[
        styles.container, 
        backgroundColor ? { backgroundColor } : { backgroundColor: '#000000' },
        style
      ]}
      onTouchEnd={onPress}
    >
      {/* Renderiza a imagem de fundo apenas se ela existir */}
      {backgroundImage && (
        <Image
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});

export default MapView;