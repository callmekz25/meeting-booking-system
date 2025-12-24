import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BookingFormType } from '../types/booking';
import type { RoomType } from '@/modules/room/types/room';
import { cn } from '@/lib/utils';

function BookingDetailModal({
  booking,
  rooms,
  onClose,
}: {
  booking?: BookingFormType | null;
  rooms: RoomType[];
  onClose: () => void;
}) {
  if (!booking) return null;
  const room = rooms.find((r) => r.roomID === booking.roomID);
  const organizer = booking.attendees?.find((a) => a.userID === booking.requesterId);
  const attendees = booking.attendees?.filter((a) => a.userID !== booking.requesterId);

  const groupedEquipments = room?.roomEquipments
    ?.filter((e) => e.assignQuantity > 0)
    .reduce<Record<string, number>>((acc, cur) => {
      acc[cur.typeName] = (acc[cur.typeName] || 0) + cur.assignQuantity;
      return acc;
    }, {});

  return (
    <>
      <DialogHeader className="p-6 pb-4">
        <DialogTitle className="text-xl">Meeting Detail</DialogTitle>
      </DialogHeader>

      <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
        <div className="bg-secondary/50 rounded-xl p-4 space-y-4">
          <h4 className="font-medium text-foreground">Booking Summary</h4>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-muted-foreground">Organizer:</span>
            <span className="font-normal text-foreground">
              {organizer?.fullName} - {organizer?.email}
            </span>

            <span className="text-muted-foreground">Title:</span>
            <span className="font-normal text-foreground">{booking.title}</span>

            <span className="text-muted-foreground">Description:</span>
            <span className="font-normal text-foreground">{booking?.description ?? 'No'}</span>

            <span className="text-muted-foreground">Room:</span>
            <span className="font-mednormalium text-foreground">
              {room?.name} - ({room?.capacity} people)
            </span>

            <span className="text-muted-foreground">Status:</span>
            <Badge
              className={cn(
                booking.status === 0 ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500',
                'shadow-none w-fit font-normal',
              )}
              variant={'default'}
            >
              {booking.status === 0 ? 'Approved' : 'Rejected'}
            </Badge>

            <span className="text-muted-foreground">Date & Time:</span>
            <span className="font-medium text-foreground">
              {booking.dateBook} • {booking.startTime} - {booking.endTime}
            </span>

            <span className="text-muted-foreground">Attendees:</span>
            <div className="font-medium text-foreground flex items-center gap-2 flex-wrap">
              {attendees?.slice(0, 3).map((at) => {
                return <span key={at.userID}>{at.email}</span>;
              })}
              {attendees && attendees.length > 3 && (
                <div className="">+{attendees.length - 3} Others</div>
              )}
            </div>

            <span className="text-muted-foreground">Equipments:</span>
            <span className="font-normal text-foreground">
              {groupedEquipments && Object.keys(groupedEquipments).length > 0 ? (
                Object.entries(groupedEquipments)
                  .map(([name, qty]) => `${name} x${qty}`)
                  .join(', ')
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4 border-t flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </>
  );
}

export default BookingDetailModal;
