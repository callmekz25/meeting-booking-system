import { roomSchema, type RoomType } from '@/modules/room/types/room';
import { userSchema, type User } from '@/modules/user/types/user';
import * as yup from 'yup';

export const BookingStatus = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const bookingFormSchema = yup.object({
  bookingID: yup.number().optional(),
  title: yup.string().required('Title is required'),
  roomID: yup
    .number()
    .nullable()
    .test('room-required', 'Please select a room', (value) => value !== null),
  dateBook: yup.string().required('Date is required'),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required'),
  status: yup.number(),
  attendees: yup.array().of(userSchema),
  requesterId: yup.string().optional().nullable(),
  description: yup.string().nullable().optional(),
});
export type BookingType = {
  bookingID: number;
  room: RoomType;
  title: string;
  dateBook: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees: User[];
  requester: User;
  status: number;
};

export type CreateBookingPayload = {
  roomID: number;
  title: string;
  dateBook: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendeeIDs: string[];
};
export type UpdateBookingPayload = {
  bookingID: number;
  roomID: number;
  title: string;
  dateBook: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendeeIDs: string[];
};

export type BookingFormType = yup.InferType<typeof bookingFormSchema>;
