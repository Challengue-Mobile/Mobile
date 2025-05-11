export interface Point {
    x: number;
    y: number;
  }
  
  export interface Zone {
    id: string;
    name: string;
    color: string;
    position: {
      top: string;
      left: string;
      width: string;
      height: string;
    };
    isMoving?: boolean;
    isResizing?: boolean;
  }
  
  export interface MarkerPosition {
    id: string;
    type: 'beacon' | 'motorcycle';
    position: Point;
    zoneId: string | null;
  }
  
  export type DrawingMode = 'circle' | 'polygon' | null;
  
  export interface MapBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }