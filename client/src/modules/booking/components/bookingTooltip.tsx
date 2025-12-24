import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { BookingType } from '@/modules/booking/types/booking';
const formatTime12h = (value: string) => {
  const date = new Date(value);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  });
};

type Props = {
  userId: string;
  booking: BookingType;
  children: React.ReactNode;
};

const BookingTooltip = ({ booking, children, userId }: Props) => {
  if (!booking) {
    return;
  }
  const isOrganizer = booking.requester.userID === userId;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs text-xs space-y-1 z-50">
        <p className="font-semibold">{booking.title}</p>
        {booking.requester && <p>Organizer: {isOrganizer ? 'You' : booking.requester.fullName}</p>}
        <p>
          DateTime: {booking.dateBook && booking.dateBook?.slice(0, 10)} •{' '}
          {booking.startTime && formatTime12h(booking.startTime)} –{' '}
          {booking.endTime && formatTime12h(booking.endTime)}
        </p>
        <p>
          Room: {booking.room?.name} - {booking.room?.code}
        </p>
        {booking.description && <p className=" line-clamp-3">Description: {booking.description}</p>}
        {booking.attendees && (
          <p className=" line-clamp-3">Attendees: {booking.attendees.length - 1}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

export default BookingTooltip;
