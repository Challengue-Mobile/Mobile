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
  
  export interface Point {
    x: number;
    y: number;
  }
  
  export interface MarkerPosition {
    id: string;
    type: 'beacon' | 'motorcycle';
    position: Point;
    zoneId: string | null;
  }
  
  export interface HistoryEntry {
    id: string;
    entityId: string;
    entityType: 'beacon';
    action: 'add' | 'edit' | 'delete';
    timestamp: number;
  }
  export type DrawingMode = 'circle' | 'polygon' | null;