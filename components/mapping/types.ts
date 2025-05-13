export type ZoneType = string;

export interface Position {
  top: string;
  left: string;
  width: string;
  height: string;
}

export interface Zone {
  id: ZoneType;
  name: string;
  color: string;
  position: Position;
  isMoving?: boolean;
  isResizing?: boolean;
}

export interface MarkerPosition {
  id: string;
  type: 'beacon' | 'motorcycle';
  position: { x: number; y: number };
  zoneId: ZoneType | null;
}

export type MapViewMode = 'normal' | 'zones' | 'heatmap' | 'timeline';
export type DrawShape = 'circle' | 'polygon' | null;

export interface MapConfig {
  backgroundImage: any;
  zones: Zone[];
  backgroundColor?: string; // Adicione esta linha
  gridVisible: boolean;
  gridSize: number;
}

export interface MapLayout {
  id: string;
  name: string;
  backgroundImage: any;
  zones: Zone[];
  gridVisible: boolean;
  gridSize: number;
  createdAt: string;
}

export interface Point {
  x: number;
  y: number;
}