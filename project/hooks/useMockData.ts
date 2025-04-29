import { Motorcycle, Beacon } from '@/types';

export function useMockData() {
  // Mock motorcycle data
  const motorcycles: Motorcycle[] = [
    {
      id: 'moto-001',
      model: 'Honda CG 160',
      licensePlate: 'ABC1234',
      year: 2021,
      color: 'Vermelha',
      status: 'in-yard',
      beaconId: 'beacon-001',
    },
    {
      id: 'moto-002',
      model: 'Yamaha Factor 150',
      licensePlate: 'DEF5678',
      year: 2022,
      color: 'Azul',
      status: 'in-yard',
      beaconId: 'beacon-002',
    },
    {
      id: 'moto-003',
      model: 'Honda Biz 125',
      licensePlate: 'GHI9012',
      year: 2023,
      color: 'Preta',
      status: 'out',
      beaconId: null,
    },
    {
      id: 'moto-004',
      model: 'Suzuki Yes 125',
      licensePlate: 'JKL3456',
      year: 2020,
      color: 'Prata',
      status: 'maintenance',
      beaconId: null,
    },
    {
      id: 'moto-005',
      model: 'Kawasaki Z900',
      licensePlate: 'MNO7890',
      year: 2022,
      color: 'Verde',
      status: 'in-yard',
      beaconId: 'beacon-003',
    },
  ];

  // Mock beacon data
  const beacons: Beacon[] = [
    {
      id: 'beacon-001',
      status: 'active',
      batteryLevel: 85,
      signalStrength: 92,
      motoId: 'moto-001',
    },
    {
      id: 'beacon-002',
      status: 'active',
      batteryLevel: 75,
      signalStrength: 88,
      motoId: 'moto-002',
    },
    {
      id: 'beacon-003',
      status: 'active',
      batteryLevel: 90,
      signalStrength: 95,
      motoId: 'moto-005',
    },
    {
      id: 'beacon-004',
      status: 'inactive',
      batteryLevel: 15,
      signalStrength: 30,
      motoId: null,
    },
    {
      id: 'beacon-005',
      status: 'active',
      batteryLevel: 65,
      signalStrength: 78,
      motoId: null,
    },
  ];

  return {
    motorcycles,
    beacons,
  };
}