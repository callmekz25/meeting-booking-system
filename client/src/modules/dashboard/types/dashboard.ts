export type DashboardType = {
  totalRooms: number;
  availableRooms: number;
  unavailableRooms: number;
  totalInventory: number;
  availableInventory: number;
  outOfServiceInventory: number;
  maintenanceInventory: number;
  topUsageRooms: RoomUsage[];
  underUsageRooms: RoomUsage[];
  equipmentUsage: EquipmentUsage[];
  roomsUsage: RoomUsage[];
};

export type RoomUsage = {
  roomID: number;
  name: string;
  usage: number;
};

export type EquipmentUsage = {
  inventoryID: number;
  typeID: number;
  typeName: string;
  usage: number;
  serialNumber: string;
};
