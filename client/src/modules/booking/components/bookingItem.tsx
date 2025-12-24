import React from 'react';
import type { BookingFormType, BookingType } from '../types/booking';
import { cn } from '@/lib/utils';

type Props = {
  booking: BookingType & { column?: number; totalColumns?: number };
  hour: number;
  activeView: 'day' | 'week' | 'month';
  onClick: (booking: BookingFormType) => void;
};

const BookingItem = ({ booking, hour, onClick, activeView }: Props) => {
  const getBookingStyle = (booking: BookingType, hour: number) => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        isStart: false,
        height: '0',
        topOffset: '0',
      };
    }

    const startHour = start.getHours();
    const startMin = start.getMinutes();
    const endHour = end.getHours();
    const endMin = end.getMinutes();

    const isStart = hour === startHour;

    if (!isStart) {
      return {
        isStart: false,
        height: '0',
        topOffset: '0',
      };
    }

    const totalMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);

    if (totalMinutes <= 0) {
      return {
        isStart: false,
        height: '0',
        topOffset: '0',
      };
    }

    return {
      isStart: true,
      height: `${(totalMinutes / 60) * 100}%`,
      topOffset: `${(startMin / 60) * 100}%`,
    };
  };

  const style = getBookingStyle(booking, hour);
  if (!style.isStart) return null;
  return (
    <div
      key={booking.bookingID}
      onClick={(e) => {
        e.stopPropagation();
        const data: BookingFormType = {
          bookingID: booking.bookingID!,
          roomID: booking.room.roomID,
          dateBook: booking.dateBook?.slice(0, 10),
          startTime: booking.startTime?.slice(11, 16),
          endTime: booking.endTime?.slice(11, 16),
          status: booking.status,
          title: booking.title,
          requesterId: booking.requester.userID,
          description: booking.description,
          attendees: booking.attendees,
        };

        onClick(data);
      }}
      className={cn(
        'absolute left-1 right-1 rounded-md px-2 py-1 text-xs font-medium text-primary-foreground cursor-pointer transition-all z-10 overflow-hidden w-[80%]',
        booking.status === 0 ? 'bg-booking-blue/90' : 'bg-red-400',
      )}
      style={{
        top: style.topOffset,
        height: `calc(${style.height} - 4px)`,
        width: `calc(${80 / booking.totalColumns}% - 4px)`,
        left: `calc(${(80 / booking.totalColumns) * booking.column}%)`,
        minHeight: '24px',
      }}
    >
      <p className="line-clamp-3 font-semibold">{booking.title}</p>
    </div>
  );
};

export default BookingItem;
