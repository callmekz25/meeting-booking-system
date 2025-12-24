import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingModal } from './bookingModal';
import type { CreateBookingFormType } from '../types/booking';

interface NewBookingButtonProps {
  onBookingCreated?: (data: CreateBookingFormType) => void;
  checkRoomAvailability?: (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
  ) => Promise<boolean>;
  rooms?: Array<{ id: string; name: string }>;
  className?: string;
}

export const NewBookingButton = ({
  onBookingCreated,
  checkRoomAvailability,
  rooms,
  className,
}: NewBookingButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = (data: CreateBookingFormType) => {
    console.log('Booking created successfully:', data);
    onBookingCreated?.(data);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 ${className}`}
        size="lg"
      >
        <Plus className="w-5 h-5" />
        New Booking
      </Button>

      <BookingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        checkRoomAvailability={checkRoomAvailability}
        rooms={rooms}
      />
    </>
  );
};
