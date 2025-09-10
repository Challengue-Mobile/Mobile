import { useState } from 'react';

export const useZoneDrag = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const startDrag = () => setIsDragging(true);
  const endDrag = () => setIsDragging(false);

  return { isDragging, dragPosition, startDrag, endDrag };
};
