import { useMutation, useQuery } from '@tanstack/react-query';
import { createBooking, deleteBooking, getBookings, updateBooking } from '../api/booking.api';
import type { CreateBookingPayload, UpdateBookingPayload } from '../types/booking';

export const useGetBookings = (start: string, end: string) => {
  return useQuery({
    queryKey: ['bookings', start, end],
    queryFn: () => getBookings(start, end),
    enabled: !!start && !!end,
  });
};

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
  });
};
export const useDeleteBooking = () => {
  return useMutation({
    mutationFn: (id: number) => deleteBooking(id),
  });
};
export const useUpdateBooking = () => {
  return useMutation({
    mutationFn: (payload: UpdateBookingPayload) => updateBooking(payload),
  });
};
