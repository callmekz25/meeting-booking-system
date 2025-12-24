import { useState } from 'react';
import type {
  BookingFormType,
  BookingType,
  CreateBookingPayload,
  UpdateBookingPayload,
} from '../types/booking';
import { useCreateBooking, useUpdateBooking } from './booking.hook';
import { useQueryClient } from '@tanstack/react-query';

type UseBookingModalManagerProps = {
  startRange: string;
  endRange: string;
};

export function useBookingModalManager({ startRange, endRange }: UseBookingModalManagerProps) {
  const [selectedBooking, setSelectedBooking] = useState<BookingFormType | BookingType | null>(
    null,
  );

  const queryClient = useQueryClient();
  const { mutate: createBooking, isPending: creating } = useCreateBooking();
  const { mutate: updateBooking, isPending: updating } = useUpdateBooking();

  const isSubmitting = creating || updating;

  const openModal = (booking: BookingFormType | BookingType | null) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const handleSave = (data: BookingFormType) => {
    const isUpdate = !!data.bookingID;
    const startDate = `${data.dateBook}T${data.startTime}:00`;
    const endDate = `${data.dateBook}T${data.endTime}:00`;
    if (isUpdate) {
      const payload: UpdateBookingPayload = {
        bookingID: data.bookingID!,
        title: data.title,
        attendeeIDs: data.attendees?.map((a) => a.userID) ?? [],
        dateBook: data.dateBook,
        startTime: startDate,
        endTime: endDate,
        roomID: data.roomID!,
        description: data.description || undefined,
      };

      updateBooking(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries(['bookings', startRange, endRange]);
          closeModal();
        },
      });

      return;
    }

    const payload: CreateBookingPayload = {
      title: data.title,
      attendeeIDs: data.attendees?.map((a) => a.userID) ?? [],
      dateBook: data.dateBook,
      startTime: startDate,
      endTime: endDate,
      roomID: data.roomID!,
      description: data.description || undefined,
    };

    createBooking(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookings', startRange, endRange]);
        closeModal();
      },
    });
  };

  return {
    selectedBooking,
    openModal,
    closeModal,
    handleSave,
    isSubmitting,
  };
}
