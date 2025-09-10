import { useState } from 'react';

export const useMapGestures = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const onPanGesture = (event: any) => {
    // Lógica de pan
  };

  const onPinchGesture = (event: any) => {
    // Lógica de pinch
  };

  return { scale, position, onPanGesture, onPinchGesture };
};
