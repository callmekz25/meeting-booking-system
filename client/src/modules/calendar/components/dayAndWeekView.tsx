import { cn } from '@/lib/utils';
import type { BookingFormType, BookingType } from '@/modules/booking/types/booking';
import { getWeekDates } from '@/utils/getWeekDates';
import React from 'react';
import { DAYS, HOURS } from '@/core/constants';
import BookingItem from '@/modules/booking/components/bookingItem';
import { toDateKey } from '@/utils/toDateKey';
import { BookingModal } from '@/modules/booking/components/bookingModal';
import { useBookingModalManager } from '@/modules/booking/hooks/useBookingModalManager';
import { useGetMe } from '@/modules/user/hooks/user.hook';
import BookingTooltip from '@/modules/booking/components/bookingTooltip';

type Props = {
  activeView: 'day' | 'week' | 'month';
  currentDate: Date;
  bookings: BookingType[];
  startRange: string;
  endRange: string;
};
type PositionedBooking = BookingType & { column: number; totalColumns: number };

const DayAndWeekView = ({ activeView, currentDate, bookings, startRange, endRange }: Props) => {
  const { data } = useGetMe();
  const weekDates = getWeekDates(currentDate);
  const displayDates = activeView === 'day' ? [currentDate] : weekDates;
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  React.useEffect(() => {
    if (!containerRef.current) return;

    const now = new Date();
    const currentHour = now.getHours();

    const hourElement = document.getElementById(`hour-${currentHour}`);
    if (hourElement && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  const getPositionedBookings = (bookings: BookingType[]): PositionedBooking[] => {
    const sorted = [...bookings].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
    const columns: PositionedBooking[][] = [];

    sorted.forEach((booking) => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const lastBookingInColumn = columns[i][columns[i].length - 1];
        if (new Date(lastBookingInColumn.endTime) <= new Date(booking.startTime)) {
          columns[i].push({ ...booking, column: i, totalColumns: 0 });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([{ ...booking, column: columns.length, totalColumns: 0 }]);
      }
    });

    return sorted.map((b) => {
      const colIndex = columns.findIndex((col) => col.some((c) => c.bookingID === b.bookingID));
      return { ...b, column: colIndex, totalColumns: columns.length };
    });
  };

  return (
    <div>
      <div
        className={cn(
          'grid border-b border-border bg-secondary/50',
          activeView === 'day' ? 'grid-cols-[100px_1fr]' : 'grid-cols-[100px_repeat(7,1fr)]',
        )}
      >
        <div
          className={cn(
            'p-3 text-xs font-medium shrink-0 text-muted-foreground flex items-center justify-center border-r border-border',
            'w-[100px]',
          )}
        >
          Time
        </div>
        {displayDates.map((date, index) => {
          const isToday = toDateKey(date) === toDateKey(new Date());
          return (
            <div
              key={index}
              className={cn(
                'p-3 text-center border-r border-border flex-1 last:border-r-0',
                isToday && 'bg-primary/5',
              )}
            >
              <p className="text-xs font-medium text-muted-foreground">{DAYS[date.getDay()]}</p>
              <p
                className={cn(
                  'text-lg font-semibold mt-0.5',
                  isToday ? 'text-primary' : 'text-foreground',
                )}
              >
                {date.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      <div className="relative" ref={containerRef}>
        {HOURS.map((hour) => (
          <div
            key={hour.value}
            id={`hour-${hour.value}`}
            className={cn(
              'grid border-b border-border last:border-b-0',
              activeView === 'day' ? 'grid-cols-[100px_1fr]' : 'grid-cols-[100px_repeat(7,1fr)]',
            )}
          >
            <div className="p-2 text-xs w-[100px] text-muted-foreground border-r border-border flex items-start justify-center pr-3">
              {hour.label}
            </div>
            {displayDates.map((date, index) => {
              const isToday = toDateKey(date) === toDateKey(new Date());
              const bookingsByDate = bookingsByDateMap.get(toDateKey(date)) ?? [];

              const positionedBookings = getPositionedBookings(bookingsByDate);
              return (
                <div
                  key={index}
                  onClick={() =>
                    openModal({
                      bookingID: undefined,
                      title: '',
                      roomID: null,
                      dateBook: toDateKey(date),
                      startTime: `${hour.value.toString().padStart(2, '0')}:00`,
                      endTime: `${((hour.value + 1) % 24).toString().padStart(2, '0')}:00`,
                      attendees: [],
                      requesterId: data?.data.userID,
                      description: '',
                    })
                  }
                  className={cn(
                    'relative h-16 border-r flex-1 border-border last:border-r-0 cursor-pointer transition-colors hover:bg-muted/50',
                    activeView === 'week' && isToday && 'bg-primary/5',
                  )}
                >
                  <div className="">
                    <div
                      className={cn(
                        'relative h-16 border-r border-border last:border-r-0 cursor-pointer transition-colors hover:bg-muted/50',
                      )}
                    >
                      {positionedBookings.map((booking) => {
                        return (
                          <BookingTooltip
                            key={booking.bookingID}
                            booking={booking}
                            userId={data?.data?.userID || ''}
                          >
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(booking);
                              }}
                            >
                              <BookingItem
                                activeView={activeView}
                                booking={booking as PositionedBooking}
                                hour={hour.value}
                                onClick={(booking) => openModal(booking)}
                              />
                            </div>
                          </BookingTooltip>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
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

export default DayAndWeekView;
