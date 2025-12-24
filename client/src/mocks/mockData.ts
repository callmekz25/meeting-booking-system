import type { Room } from '@/modules/room/types/room';

export type EquipmentType =
  | 'projector'
  | 'screen'
  | 'phone'
  | 'whiteboard'
  | 'tv'
  | 'microphone'
  | 'camera'
  | 'laptop'
  | 'speaker'
  | 'other';

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  serialNumber: string;
  status: 'available' | 'in-use' | 'maintenance';
  assignedRoomId?: string;
  lastMaintenance?: string;
}
export const equipment: Equipment[] = [
  {
    id: 'e1',
    name: 'Projector A1',
    type: 'projector',
    serialNumber: 'PRJ-001',
    status: 'available',
  },
  { id: 'e2', name: 'Projector B2', type: 'projector', serialNumber: 'PRJ-002', status: 'in-use' },
  {
    id: 'e3',
    name: 'Conference Phone',
    type: 'phone',
    serialNumber: 'PHN-001',
    status: 'available',
  },
  {
    id: 'e4',
    name: 'Smart TV 65"',
    type: 'tv',
    serialNumber: 'TV-001',
    status: 'available',
    assignedRoomId: 'r1',
  },
  {
    id: 'e5',
    name: 'Smart TV 55"',
    type: 'tv',
    serialNumber: 'TV-002',
    status: 'available',
    assignedRoomId: 'r2',
  },
  {
    id: 'e6',
    name: 'Whiteboard Digital',
    type: 'whiteboard',
    serialNumber: 'WB-001',
    status: 'available',
    assignedRoomId: 'r1',
  },
  {
    id: 'e7',
    name: 'Wireless Mic Set',
    type: 'microphone',
    serialNumber: 'MIC-001',
    status: 'available',
  },
  { id: 'e8', name: 'Webcam 4K', type: 'camera', serialNumber: 'CAM-001', status: 'maintenance' },
  {
    id: 'e9',
    name: 'Speaker System',
    type: 'speaker',
    serialNumber: 'SPK-001',
    status: 'available',
    assignedRoomId: 'r3',
  },
  { id: 'e10', name: 'Laptop Dock', type: 'laptop', serialNumber: 'LPT-001', status: 'available' },
  {
    id: 'e11',
    name: 'Whiteboard Classic',
    type: 'whiteboard',
    serialNumber: 'WB-002',
    status: 'available',
    assignedRoomId: 'r2',
  },
  {
    id: 'e12',
    name: 'Screen Portable',
    type: 'screen',
    serialNumber: 'SCR-001',
    status: 'available',
  },
];
export const rooms: Room[] = [
  {
    id: 'r1',
    name: 'Innovation Hub',
    capacity: 12,
    floor: '3rd Floor',
    status: 'available',
    defaultEquipment: equipment.filter((e) => e.assignedRoomId === 'r1'),
  },
  {
    id: 'r2',
    name: 'Collaboration Suite',
    capacity: 8,
    floor: '2nd Floor',
    status: 'available',
    defaultEquipment: equipment.filter((e) => e.assignedRoomId === 'r2'),
  },
  {
    id: 'r3',
    name: 'Executive Boardroom',
    capacity: 20,
    floor: '5th Floor',
    status: 'occupied',
    defaultEquipment: equipment.filter((e) => e.assignedRoomId === 'r3'),
  },
  {
    id: 'r4',
    name: 'Focus Room A',
    capacity: 4,
    floor: '1st Floor',
    status: 'available',
    defaultEquipment: [],
  },
  {
    id: 'r5',
    name: 'Training Center',
    capacity: 30,
    floor: '4th Floor',
    status: 'maintenance',
    defaultEquipment: [],
  },
  {
    id: 'r6',
    name: 'Creative Studio',
    capacity: 6,
    floor: '2nd Floor',
    status: 'available',
    defaultEquipment: [],
  },
];
