import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BookingType } from '@/modules/booking/types/booking';
import MonthView from '../components/monthView';
import DayAndWeekView from '../components/dayAndWeekView';
import { formatMonth } from '@/utils/formatMonth';
import { BookingModal } from '@/modules/booking/components/bookingModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetBookings } from '@/modules/booking/hooks/booking.hook';
import { useBookingModalManager } from '@/modules/booking/hooks/useBookingModalManager';
import { useGetMe } from '@/modules/user/hooks/user.hook';
import { TooltipProvider } from '@/components/ui/tooltip';

const CalendarPage = () => {
  const { data: userData } = useGetMe();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [bookings, setBookings] = React.useState<BookingType[]>([]);
  const [activeView, setActiveView] = React.useState<'day' | 'week' | 'month'>('week');

  const calendarRange = React.useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);

    return {
      startDate: start,
      endDate: end,
    };
  }, [currentDate]);

  const toLocalDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const startRange = toLocalDateString(calendarRange.startDate);
  const endRange = toLocalDateString(calendarRange.endDate);
  const { data, isLoading } = useGetBookings(startRange, endRange);
  const { selectedBooking, openModal, closeModal, handleSave, isSubmitting } =
    useBookingModalManager({
      startRange,
      endRange,
    });

  React.useEffect(() => {
    if (data?.data) {
      setBookings(data?.data);
    }
  }, [data]);

  const handlePrev = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      switch (activeView) {
        case 'day':
          newDate.setDate(prev.getDate() - 1);
          break;
        case 'week':
          newDate.setDate(prev.getDate() - 7);
          break;
        case 'month':
          const targetMonth = prev.getMonth() - 1;
          const targetYear = prev.getFullYear() + Math.floor(targetMonth / 12);
          const monthInYear = (targetMonth + 12) % 12;
          const lastDayOfTargetMonth = new Date(targetYear, monthInYear + 1, 0).getDate();
          newDate.setFullYear(
            targetYear,
            monthInYear,
            Math.min(prev.getDate(), lastDayOfTargetMonth),
          );
          break;
      }
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      switch (activeView) {
        case 'day':
          newDate.setDate(prev.getDate() + 1);
          break;
        case 'week':
          newDate.setDate(prev.getDate() + 7);
          break;
        case 'month':
          const targetMonth = prev.getMonth() + 1;
          const targetYear = prev.getFullYear() + Math.floor(targetMonth / 12);
          const monthInYear = targetMonth % 12;
          const lastDayOfTargetMonth = new Date(targetYear, monthInYear + 1, 0).getDate();
          newDate.setFullYear(
            targetYear,
            monthInYear,
            Math.min(prev.getDate(), lastDayOfTargetMonth),
          );
          break;
      }
      return newDate;
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button onClick={() => setCurrentDate(new Date())} variant="outline" size="sm">
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button onClick={handlePrev} variant="ghost" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={handleNext} variant="ghost" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold text-foreground">{formatMonth(currentDate)}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={activeView}
              onValueChange={(value: 'day' | 'week' | 'month') => setActiveView(value)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Options view" />
              </SelectTrigger>
              <SelectContent className=" capitalize">
                {(['day', 'week', 'month'] as const).map((v) => (
                  <SelectItem key={v} className="" value={v}>
                    <span className=" capitalize">{v}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                const hour = new Date().getHours();
                openModal({
                  bookingID: undefined,
                  title: '',
                  roomID: null,
                  dateBook: currentDate.toISOString().slice(0, 10),
                  startTime: `${hour.toString().padStart(2, '0')}:00`,
                  endTime: `${((hour + 1) % 24).toString().padStart(2, '0')}:00`,
                  attendees: [],
                  requesterId: userData?.data?.userID,
                  description: '',
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <div className={cn('min-w-[800px]')}>
              <>
                {activeView === 'month' ? (
                  <MonthView
                    bookings={bookings}
                    currentDate={currentDate}
                    startRange={startRange}
                    endRange={endRange}
                  />
                ) : (
                  <DayAndWeekView
                    startRange={startRange}
                    endRange={endRange}
                    bookings={bookings}
                    currentDate={currentDate}
                    activeView={activeView}
                  />
                )}
              </>
            </div>
          </div>
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
    </TooltipProvider>
  );
};

export default CalendarPage;
