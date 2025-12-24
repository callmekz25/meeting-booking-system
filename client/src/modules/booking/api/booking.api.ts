import api, { type ApiResponse } from '@/lib/axios';
import type { BookingType, CreateBookingPayload, UpdateBookingPayload } from '../types/booking';

export const getBookings = async (start: string, end: string) => {
  const { data } = await api.get<ApiResponse<BookingType[]>>('/bookings', {
    params: {
      start,
      end,
    },
  });
  return data;
};

export const createBooking = async (payload: CreateBookingPayload) => {
  const { data } = await api.post('/bookings', payload);
  return data;
};
export const deleteBooking = async (id: number) => {
  const { data } = await api.delete(`/bookings/${id}`);
  return data;
};

export const updateBooking = async (payload: UpdateBookingPayload) => {
  const { data } = await api.put(`/bookings/${payload.bookingID}`, payload);
  return data;
};
