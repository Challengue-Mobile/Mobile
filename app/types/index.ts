export interface Beacon {
  id: string;
  name: string;
  uuid: string;
  major: number;
  minor: number;
  rssi?: number;
  distance?: number;
  x?: number;
  y?: number;
}

export interface Motorcycle {
  id: string;
  model: string;
  plate: string;
  beaconId?: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastSeen?: Date;
  x?: number;
  y?: number;
}

export interface Zone {
  id: string;
  name: string;
  type: 'parking' | 'restricted' | 'maintenance';
  coordinates: { x: number; y: number }[];
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
