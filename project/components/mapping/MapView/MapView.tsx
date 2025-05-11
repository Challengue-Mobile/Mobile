import React, { forwardRef } from 'react';
import { View, Image, StyleSheet, GestureResponderEvent } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MapViewProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
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