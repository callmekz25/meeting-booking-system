import { DAYS } from '@/core/constants';
import { cn } from '@/lib/utils';
import { BookingModal } from '@/modules/booking/components/bookingModal';
import { useBookingModalManager } from '@/modules/booking/hooks/useBookingModalManager';
import type { BookingFormType, BookingType } from '@/modules/booking/types/booking';
import { useGetMe } from '@/modules/user/hooks/user.hook';
import { formatTime } from '@/utils/formatTime';
import { getMonthDates } from '@/utils/getMonthDates';
import { toDateKey } from '@/utils/toDateKey';
import React from 'react';

type Props = {
  currentDate: Date;
  bookings: BookingType[];
  startRange: string;
  endRange: string;
};

const MonthView = ({ currentDate, bookings, startRange, endRange }: Props) => {
  const { data } = useGetMe();
  const dates = getMonthDates(currentDate);
  const { selectedBooking, openModal, closeModal, handleSave, isSubmitting } =
    useBookingModalManager({ startRange, endRange });
  const bookingsByDateMap = React.useMemo(() => {
    const map = new Map<string, BookingType[]>();
    bookings.forEach((b) => {
      const key = toDateKey(new Date(b.dateBook));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    return map;
  }, [bookings]);

  return (
    <div className="grid grid-cols-7  rounded-xl overflow-hidden">
      {DAYS.map((d) => (
        <div key={d} className="p-2 text-xs font-medium text-center bg-secondary border-r ">
          {d}
        </div>
      ))}

      {dates.map((date, index) => {
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const isToday = toDateKey(date) === toDateKey(new Date());
        const dateKey = toDateKey(date);
        const dayBookings = bookingsByDateMap.get(dateKey) ?? [];

        return (
          <div
            key={index}
            className={cn(
              'min-h-[200px] p-2 border-r border-b cursor-pointer hover:bg-muted/50',
              !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
              isToday && 'bg-primary/5',
            )}
            onClick={() => {
              const hour = new Date().getHours();
              openModal({
                bookingID: undefined,
                title: '',
                attendees: [],
                description: '',
                roomID: null,
                dateBook: dateKey,
                startTime: `${hour.toString().padStart(2, '0')}:00`,
                requesterId: data?.data.userID,
                endTime: `${((hour + 1) % 24).toString().padStart(2, '0')}:00`,
              });
            }}
          >
            <div className={cn('text-sm font-medium mb-1', isToday && 'text-primary')}>
              {date.getDate()}
            </div>

            <div className="space-y-1">
              {dayBookings.slice(0, 7).map((b) => (
                <div
                  key={b.bookingID}
                  className={cn(
                    'text-xs flex items-center gap-2 px-2 py-1 text-primary-foreground rounded truncate bg-booking-blue/90 cursor-pointer  transition-colors',
                    b.status === 0 ? 'bg-booking-blue/90' : 'bg-red-400',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    const data: BookingFormType = {
                      bookingID: b.bookingID!,
                      roomID: b.room.roomID,
                      dateBook: b.dateBook?.slice(0, 10),
                      startTime: b.startTime?.slice(11, 16),
                      endTime: b.endTime?.slice(11, 16),
                      status: b.status,
                      title: b.title,
                      description: b.description,
                      requesterId: b.requester.userID,
                      attendees: b.attendees,
                    };
                    openModal(data);
                  }}
                >
                  <span>{formatTime(b.startTime)}</span>
                  <span>{b.title}</span>
                </div>
              ))}

              {dayBookings.length > 7 && (
                <div className="text-xs text-muted-foreground">+{dayBookings.length - 7} more</div>
              )}
            </div>
          </div>
        );
      })}
      <BookingModal
        open={!!selectedBooking}
        onOpenChange={closeModal}
        booking={selectedBooking}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        startRange={startRange}
        endRange={endRange}
      />
    </div>
  );
};

export default MonthView;
