import type { Room } from '@/modules/room/types/room';
import type { InventoryType } from './inventory';
import * as yup from 'yup';
export const roomEquipmentSchema = yup.object({
  roomID: yup.number().required('Room is required').min(1, 'Please select a room'),
  quantity: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || Number.isNaN(value) ? undefined : value,
    )
    .required('Quantity is required')
    .min(0, 'Quantity must be at least 0')
    .max(100, 'Quantity must be at most 100'),
});

export type RoomEquipmentFormType = yup.InferType<typeof roomEquipmentSchema>;

export type RoomEquipmentType = {
  roomEquipmentID: number;
  roomID: number;
  inventoryID: number;
  quantity: number;
  isAvailable: boolean;
};
