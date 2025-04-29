export interface Motorcycle {
  id: string;
  model: string;
  licensePlate: string;
  year: number;
  color: string;
  status: 'in-yard' | 'out' | 'maintenance';
  beaconId: string | null;
}

export interface Beacon {
  id: string;
  status: 'active' | 'inactive' | 'offline';
  batteryLevel: number;
  signalStrength: number;
  motoId: string | null;
}