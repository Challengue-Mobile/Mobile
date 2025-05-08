import { useRef, useState, useCallback } from "react";
import { Animated, PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";

type MapGesturesConfig = {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  maxTranslation?: number;
}

const DEFAULT_CONFIG: MapGesturesConfig = {
  initialScale: 1,
  minScale: 0.5,
  maxScale: 3,
  maxTranslation: 1000
};

export function useMapGestures(config: MapGesturesConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Animated values for gestures
  const scale = useRef(new Animated.Value(finalConfig.initialScale!)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Track current scale for bounds checking
  const [currentScale, setCurrentScale] = useState(finalConfig.initialScale!);
  
  // Keep scale value in sync with animated value
  scale.addListener(({ value }) => {
    setCurrentScale(value);
  });
  
  // Reset map position and scale
  const resetView = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: finalConfig.initialScale!,
        useNativeDriver: true,
        tension: 20,
        friction: 7
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 20,
        friction: 7
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 20,
        friction: 7
      })
    ]).start();
  }, [scale, translateX, translateY, finalConfig.initialScale]);
  
  // Handle zoom in/out
  const zoomIn = useCallback(() => {
    const nextScale = Math.min(currentScale + 0.2, finalConfig.maxScale!);
    Animated.spring(scale, {
      toValue: nextScale,
      useNativeDriver: true,
      tension: 35,
      friction: 7
    }).start();
  }, [scale, currentScale, finalConfig.maxScale]);
  
  const zoomOut = useCallback(() => {
    const nextScale = Math.max(currentScale - 0.2, finalConfig.minScale!);
    Animated.spring(scale, {
      toValue: nextScale,
      useNativeDriver: true,
      tension: 35,
      friction: 7
    }).start();
  }, [scale, currentScale, finalConfig.minScale]);
  
  // Configure pan responder for gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger for deliberate movements
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        translateX.extractOffset();
        translateY.extractOffset();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: translateX, dy: translateY }],
        { useNativeDriver: true }
      ),
      onPanResponderRelease: () => {
        translateX.flattenOffset();
        translateY.flattenOffset();
      }
    })
  ).current;
  
  // Transform style to apply to the map
  const transformStyle = {
    transform: [
      { scale },
      { translateX },
      { translateY }
    ]
  };
  
  return {
    panHandlers: panResponder.panHandlers,
    transformStyle,
    zoomIn,
    zoomOut,
    resetView
  };
}