<<<<<<< HEAD
// src/components/mapping/MapView/MapView.tsx

import React, { forwardRef } from 'react';
import { View, Image, StyleSheet, GestureResponderEvent } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';  
=======
import React, { forwardRef } from 'react';
import { View, Image, StyleSheet, GestureResponderEvent } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
>>>>>>> parent of 86c1a8a (alterçaãi)

interface MapViewProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
<<<<<<< HEAD
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
        backgroundColor ? { backgroundColor } : null,
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
=======
  backgroundImage: any;
  style?: any;
}

const MapView = forwardRef<View, MapViewProps>(({ 
  children, 
  onPress, 
  backgroundImage,
  style 
}, ref) => {
  return (
    <View 
      ref={ref}
      style={[styles.container, style]}
      onTouchEnd={onPress}
    >
      <Image 
        source={backgroundImage} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      />
>>>>>>> parent of 86c1a8a (alterçaãi)
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