import * as yup from 'yup';
import { roomEquipmentSchema, type RoomEquipmentType } from './roomEquipment';

export const inventorySchema = yup.object({
  inventoryID: yup.number().optional().nullable(),
  typeID: yup.number().required(),
  quantity: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || Number.isNaN(value) ? undefined : value,
    )
    .required('Quantity is required')
    .min(0, 'Quantity must be at least 0')
    .max(1000, 'Quantity must be at most 1000'),

  serialNumber: yup
    .string()
    .required('Serial number is required')
    .matches(/^[A-Za-z0-9-_]+$/, 'Serial number must not have special characters')
    .max(50, 'Serial number must be less then 50 characters'),
  roomEquipments: yup.array().of(roomEquipmentSchema).optional(),
  status: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' || Number.isNaN(value) ? 0 : value))
    .nullable()
    .optional(),
});

export type InventoryFormType = yup.InferType<typeof inventorySchema>;

export type EquipmentType = {
  typeID: number;
  typeName: string;
};
export type InventoryType = {
  inventoryID: number;
  quantity: number;
  typeID: number;
  typeName: string;
  serialNumber: string;
  status: number;
  roomEquipments: RoomEquipmentType[];
};
