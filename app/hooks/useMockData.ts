import { Beacon, Motorcycle } from '@/types';

export const useMockData = () => {
  const mockBeacons: Beacon[] = [
    { id: '1', name: 'Beacon 1', uuid: 'uuid1', major: 1, minor: 1 },
    { id: '2', name: 'Beacon 2', uuid: 'uuid2', major: 1, minor: 2 },
  ];

  const mockMotorcycles: Motorcycle[] = [
    { id: '1', model: 'Honda CB600', plate: 'ABC-1234', status: 'active' },
    { id: '2', model: 'Yamaha MT07', plate: 'XYZ-5678', status: 'inactive' },
  ];

  return { mockBeacons, mockMotorcycles };
};
