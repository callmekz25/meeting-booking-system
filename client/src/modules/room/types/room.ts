import * as yup from 'yup';

const assignEquipmentSchema = yup.object({
  inventoryID: yup.number(),
  serialNumber: yup.string().optional().nullable(),
  typeName: yup.string().optional().nullable(),
  quantity: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || Number.isNaN(value) ? undefined : value,
    )
    .required('Quantity is required')
    .min(0, 'Quantity must be at least 0')
    .max(50, 'Quantity must be at most 50'),
});
export const roomSchema = yup.object({
  roomID: yup.number().optional().nullable(),
  name: yup.string().required('Room name is required'),
  capacity: yup
    .number()
    .required('Capacity is required')
    .transform((value, originalValue) =>
      originalValue === '' || Number.isNaN(value) ? undefined : value,
    )
    .min(0, 'Capacity must be at least 0')
    .max(50, 'Capicaty must be less than 50'),
  code: yup.string().required('Room code is required'),
  isAvailable: yup.boolean().required('Availability status is required'),
  assignEquipments: yup.array(assignEquipmentSchema).optional().nullable(),
});
export type RoomFormType = yup.InferType<typeof roomSchema>;

export type RoomType = {
  roomID: number;
  name: string;
  capacity: number;
  code: string;
  isAvailable: boolean;
  isInUse: boolean;
  roomEquipments?: {
    inventoryID: number;
    typeID: number;
    typeName: string;
    serialNumber: string;
    status: string;
    inventoryQuantity: number;
    assignQuantity: number;
  }[];
};

export type Room = yup.InferType<typeof roomSchema>;
