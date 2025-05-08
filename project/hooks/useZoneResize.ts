import { useRef, useState, useCallback } from "react";
import { PanResponder, PanResponderGestureState } from "react-native";

// Define the Zone interface to match the one in mapping.tsx
interface Zone {
  id: string;
  name: string;
  color: string;
  position: { top: string; left: string; width: string; height: string };
  isMoving?: boolean;
  isResizing?: boolean;
}

// Define the ResizeHandle type (which corner or edge is being resized)
type ResizeHandle = 
  | "topLeft" 
  | "topRight" 
  | "bottomLeft" 
  | "bottomRight"
  | "top"
  | "right"
  | "bottom"
  | "left";

interface ZoneResizeOptions {
  gridSize?: number;
  snapToGrid?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number | null; // null means don't maintain aspect ratio
  onResizeStart?: (zone: Zone) => void;
  onResize?: (dimensions: { top: string; left: string; width: string; height: string }) => void;
}

export function useZoneResize(
  zone: Zone,
  handle: ResizeHandle,
  onResizeEnd: (updatedZone: Zone) => void,
  options: ZoneResizeOptions = {}
) {
  // Destructure options with defaults
  const {
    gridSize = 10,
    snapToGrid = true,
    minWidth = 10,
    minHeight = 10,
    maxWidth = 80,
    maxHeight = 80,
    aspectRatio = null,
    onResizeStart,
    onResize,
  } = options;

  // Create refs to track the initial dimensions
  const initialDimensionsRef = useRef({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [isResizing, setIsResizing] = useState(false);

  // Parse the string positions to numbers for calculations
  const parseDimensions = useCallback((position: { top: string; left: string; width: string; height: string }) => {
    return {
      top: parseFloat(position.top),
      left: parseFloat(position.left),
      width: parseFloat(position.width),
      height: parseFloat(position.height),
    };
  }, []);

  // Apply grid snapping if enabled
  const snapToGridIfNeeded = useCallback(
    (value: number) => {
      if (!snapToGrid) return value;
      return Math.round(value / gridSize) * gridSize;
    },
    [snapToGrid, gridSize]
  );

  // Helper to ensure dimensions stay within constraints
  const constrainDimensions = useCallback(
    (dimensions: { top: number; left: number; width: number; height: number }) => {
      let { top, left, width, height } = dimensions;
      
      // Constrain width and height
      width = Math.max(minWidth, Math.min(maxWidth, width));
      height = Math.max(minHeight, Math.min(maxHeight, height));
      
      // If maintaining aspect ratio is required
      if (aspectRatio !== null) {
        const currentRatio = width / height;
        
        if (currentRatio > aspectRatio) {
          // Too wide, adjust width
          width = height * aspectRatio;
        } else if (currentRatio < aspectRatio) {
          // Too tall, adjust height
          height = width / aspectRatio;
        }
      }
      
      // Make sure the zone stays within the container after resizing
      if (left + width > 100) {
        width = 100 - left;
      }
      
      if (top + height > 100) {
        height = 100 - top;
      }
      
      return { top, left, width, height };
    },
    [minWidth, minHeight, maxWidth, maxHeight, aspectRatio]
  );

  // Calculate new dimensions based on resize handle and gesture
  const calculateNewDimensions = useCallback(
    (gestureState: PanResponderGestureState) => {
      const { dx, dy } = gestureState;
      const { top, left, width, height } = initialDimensionsRef.current;
      
      // Scale factors to convert gesture movement to percentage
      const scaleX = 5; // Adjust this to control horizontal resize sensitivity
      const scaleY = 5; // Adjust this to control vertical resize sensitivity
      
      // New dimensions to calculate based on which handle is being dragged
      let newTop = top;
      let newLeft = left;
      let newWidth = width;
      let newHeight = height;
      
      switch (handle) {
        case "topLeft":
          newTop = top + dy / scaleY;
          newLeft = left + dx / scaleX;
          newWidth = width - dx / scaleX;
          newHeight = height - dy / scaleY;
          break;
          
        case "topRight":
          newTop = top + dy / scaleY;
          newWidth = width + dx / scaleX;
          newHeight = height - dy / scaleY;
          break;
          
        case "bottomLeft":
          newLeft = left + dx / scaleX;
          newWidth = width - dx / scaleX;
          newHeight = height + dy / scaleY;
          break;
          
        case "bottomRight":
          newWidth = width + dx / scaleX;
          newHeight = height + dy / scaleY;
          break;
          
        case "top":
          newTop = top + dy / scaleY;
          newHeight = height - dy / scaleY;
          break;
          
        case "right":
          newWidth = width + dx / scaleX;
          break;
          
        case "bottom":
          newHeight = height + dy / scaleY;
          break;
          
        case "left":
          newLeft = left + dx / scaleX;
          newWidth = width - dx / scaleX;
          break;
      }
      
      // Apply snapping and constraints
      return constrainDimensions({
        top: snapToGridIfNeeded(newTop),
        left: snapToGridIfNeeded(newLeft),
        width: snapToGridIfNeeded(newWidth),
        height: snapToGridIfNeeded(newHeight),
      });
    },
    [handle, snapToGridIfNeeded, constrainDimensions]
  );

  // Create the pan responder for handling resize gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger for deliberate movements
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        initialDimensionsRef.current = parseDimensions(zone.position);
        setIsResizing(true);
        
        if (onResizeStart) {
          onResizeStart(zone);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate new dimensions based on the gesture
        const { top, left, width, height } = calculateNewDimensions(gestureState);
        
        // Call the onResize callback with the new dimensions
        if (onResize) {
          onResize({
            top: `${top}%`,
            left: `${left}%`,
            width: `${width}%`,
            height: `${height}%`,
          });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Calculate the final dimensions
        const { top, left, width, height } = calculateNewDimensions(gestureState);
        
        // Create the updated zone object
        const updatedZone = {
          ...zone,
          position: {
            top: `${top}%`,
            left: `${left}%`,
            width: `${width}%`,
            height: `${height}%`,
          },
          isResizing: false,
        };
        
        // Call the onResizeEnd callback with the updated zone
        onResizeEnd(updatedZone);
        setIsResizing(false);
      },
    })
  ).current;

  return {
    panHandlers: panResponder.panHandlers,
    isResizing,
  };
}