import { useRef, useState, useCallback } from "react";
import { PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";

// Define the Zone interface to match the one in mapping.tsx
interface Zone {
  id: string;
  name: string;
  color: string;
  position: { top: string; left: string; width: string; height: string };
  isMoving?: boolean;
  isResizing?: boolean;
}

interface ZoneDragOptions {
  gridSize?: number;
  snapToGrid?: boolean;
  minTop?: number;
  minLeft?: number;
  maxTop?: number;
  maxLeft?: number;
  onMoveStart?: (zone: Zone) => void;
  onMove?: (position: { top: string; left: string }) => void;
}

export function useZoneDrag(
  zone: Zone,
  onMoveEnd: (updatedZone: Zone) => void,
  options: ZoneDragOptions = {}
) {
  // Destructure options with defaults
  const {
    gridSize = 10,
    snapToGrid = true,
    minTop = 0,
    minLeft = 0,
    maxTop = 90,
    maxLeft = 90,
    onMoveStart,
    onMove,
  } = options;

  // Create refs to track the current position
  const initialPositionRef = useRef({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Parse the string positions to numbers for calculations
  const parsePosition = useCallback((position: { top: string; left: string }) => {
    return {
      top: parseFloat(position.top),
      left: parseFloat(position.left),
    };
  }, []);

  // Helper to ensure positions stay within boundaries
  const constrainPosition = useCallback(
    (top: number, left: number) => {
      const width = parseFloat(zone.position.width);
      const height = parseFloat(zone.position.height);
      
      return {
        top: Math.max(minTop, Math.min(maxTop - height, top)),
        left: Math.max(minLeft, Math.min(maxLeft - width, left)),
      };
    },
    [zone.position.width, zone.position.height, minTop, minLeft, maxTop, maxLeft]
  );

  // Apply grid snapping if enabled
  const snapToGridIfNeeded = useCallback(
    (value: number) => {
      if (!snapToGrid) return value;
      return Math.round(value / gridSize) * gridSize;
    },
    [snapToGrid, gridSize]
  );

  // Create the pan responder for handling drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger for deliberate movements
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        const { top, left } = parsePosition(zone.position);
        initialPositionRef.current = { top, left };
        setIsDragging(true);
        
        if (onMoveStart) {
          onMoveStart(zone);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate the new position based on the gesture
        const { top: initialTop, left: initialLeft } = initialPositionRef.current;
        const newTop = initialTop + gestureState.dy / 5; // Adjust divisor to control sensitivity
        const newLeft = initialLeft + gestureState.dx / 5;
        
        // Apply constraints and grid snapping
        const { top, left } = constrainPosition(
          snapToGridIfNeeded(newTop),
          snapToGridIfNeeded(newLeft)
        );
        
        // Call the onMove callback with the new position
        if (onMove) {
          onMove({
            top: `${top}%`,
            left: `${left}%`
          });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Calculate the final position
        const { top: initialTop, left: initialLeft } = initialPositionRef.current;
        const newTop = initialTop + gestureState.dy / 5;
        const newLeft = initialLeft + gestureState.dx / 5;
        
        // Apply constraints and grid snapping
        const { top, left } = constrainPosition(
          snapToGridIfNeeded(newTop),
          snapToGridIfNeeded(newLeft)
        );
        
        // Create the updated zone object
        const updatedZone = {
          ...zone,
          position: {
            ...zone.position,
            top: `${top}%`,
            left: `${left}%`,
          },
          isMoving: false,
        };
        
        // Call the onMoveEnd callback with the updated zone
        onMoveEnd(updatedZone);
        setIsDragging(false);
      },
    })
  ).current;

  return {
    panHandlers: panResponder.panHandlers,
    isDragging,
  };
}