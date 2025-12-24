import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MessageSquare, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { bookingFormSchema, type BookingFormType } from '@/modules/booking/types/booking';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetMe, useGetUsersByEmail } from '@/modules/user/hooks/user.hook';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { User } from '@/modules/user/types/user';
import ConfirmModal from './confirmModal';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteBooking } from '../hooks/booking.hook';
import { toast } from 'sonner';
import { useGetRooms } from '@/modules/room/hooks/room.hook';
import BookingDetailModal from './bookingDetailModal';
import SearchSelectMulti from './searchSelectMulti';

interface BookingModalProps {
  open: boolean;
  onOpenChange: () => void;
  booking?: BookingFormType | null;
  onSave: (booking: BookingFormType) => void;
  isSubmitting?: boolean;
  startRange: string;
  endRange: string;
}

export function BookingModal({
  open,
  onOpenChange,
  booking,
  onSave,
  isSubmitting,
  startRange,
  endRange,
}: BookingModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,

    formState: { errors },
  } = useForm({
    resolver: yupResolver(bookingFormSchema),
  });
  const queryClient = useQueryClient();
  const { mutate, isPending } = useDeleteBooking();
  React.useEffect(() => {
    if (booking) {
      reset({
        title: booking?.title || '',
        startTime: booking?.startTime || '',
        endTime: booking?.endTime || '',
        attendees: booking?.attendees || [],
        dateBook: booking?.dateBook,
        bookingID: booking?.bookingID,
        description: booking?.description,
        roomID: booking?.roomID,
        status: booking?.status,
      });
    }
  }, [booking, reset, open]);
  const dateBook = watch('dateBook');
  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const start = dateBook && startTime && `${dateBook}T${startTime}:00`;
  const end = dateBook && endTime && `${dateBook}T${endTime}:00`;

  const [attendeeInput, setAttendeeInput] = useState('');

  // const emailDebounce = useDebounce(attendeeInput);
  const { data: me, isLoading: ildu } = useGetMe();

  const { data: roomsResponse, isLoading: ildr } = useGetRooms(start!, end!);
  // const { data: usersResponse, isLoading } = useGetUsersByEmail(emailDebounce, start!, end!);
  const attendees = watch('attendees') ?? [];

  // const handleAddAttendee = (user: User) => {
  //   if (attendees.find((u) => u.userID === user.userID)) return;

  //   setValue('attendees', [...attendees, user]);
  //   setAttendeeInput('');
  // };
  // const handleRemoveAttendee = (userID: string) => {
  //   setValue(
  //     'attendees',
  //     attendees.filter((u) => u.userID !== userID),
  //   );
  // };
  const onSubmit = (data: BookingFormType) => {
    if (attendeeInput.trim()) {
      toast.error('Please select an attendee before submit');
      return;
    }
    onSave(data);
    setAttendeeInput('');
  };

  React.useEffect(() => {
    if (open) {
      queryClient.invalidateQueries({
        queryKey: ['rooms'],
      });
    }
  }, [open]);

  const handleDelete = () => {
    if (!booking?.bookingID) return;
    mutate(booking.bookingID, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['bookings'],
        });
        onOpenChange();
        setAttendeeInput('');
      },
    });
  };
  const isRequester = me?.data.userID === booking?.requesterId;
  const attendeesFilter = attendees?.filter((a) => a.userID !== me?.data.userID);
  const roomId = watch('roomID');
  const rooms = roomsResponse?.data ?? [];
  const room = rooms.find((r) => r.roomID === roomId);

  const groupedEquipments = room?.roomEquipments
    ?.filter((e) => e.assignQuantity > 0)
    .reduce<Record<string, number>>((acc, cur) => {
      acc[cur.typeName] = (acc[cur.typeName] || 0) + cur.assignQuantity;
      return acc;
    }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] lg:w-fit max-h-[90vh] p-0 gap-0 bg-card overflow-hidden">
        {isRequester ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-xl">
                {booking?.bookingID
                  ? `Edit Booking ${booking.status === 0 ? '(Approved)' : '(Rejected)'}`
                  : 'Create New Booking'}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(90vh-150px)] overflow-y-auto">
              <div className="px-6 pb-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Booking Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Product Review Meeting"
                      {...register('title')}
                    />{' '}
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                  </div>
                  {/* Attendees */}
                  <div className="space-y-1">
                    <div>
                      <Label htmlFor="title">Attendees</Label>
                    </div>

                    {/* <div className="space-y-2">
                      <div className="relative">
                        <Input
                          placeholder="Add attendee email"
                          value={attendeeInput}
                          onFocus={() => setFocusSearch(true)}
                          onChange={(e) => setAttendeeInput(e.target.value)}
                        />
                        {emailDebounce && usersResponse && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-elevated z-999">
                            {usersResponse && usersResponse.data.length > 0 ? (
                              usersResponse.data.map((user) => (
                                <button
                                  type="button"
                                  key={user.userID}
                                  onClick={() => handleAddAttendee(user)}
                                  className="w-full px-3 bg-gray-50 flex items-center justify-between  py-2 text-left hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                                >
                                  <div className="">
                                    <p className="text-sm font-medium text-black">
                                      {user.fullName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                  <div>
                                    {user.isAvailable ? (
                                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                        Available
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                                        Busy
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="w-full px-3 bg-gray-50 flex items-center justify-center  py-4 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg opacity-70">
                                Not found any user match
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {attendeesFilter.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {attendeesFilter.filter(Boolean).map((user) => (
                            <Badge
                              key={user.userID}
                              variant="secondary"
                              className="flex items-center gap-1 pr-1"
                            >
                              {user.email}
                              <button
                                onClick={() => handleRemoveAttendee(user.userID)}
                                className="ml-1 hover:bg-muted rounded p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div> */}
                    <SearchSelectMulti
                      users={attendeesFilter}
                      start={start}
                      end={end}
                      onChange={(value) => setValue('attendees', value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" {...register('dateBook')} className="" />
                      {errors.dateBook && (
                        <p className="text-xs text-red-500">{errors.dateBook.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input id="startTime" type="time" className="" {...register('startTime')} />
                      <div className="relative"></div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input id="endTime" type="time" {...register('endTime')} className="" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Meeting Room</Label>
                    <Controller
                      control={control}
                      name="roomID"
                      render={({ field }) => (
                        <>
                          <Select
                            value={field?.value?.toString() || ''}
                            onValueChange={(val) => field.onChange(Number(val))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue className="w-full" placeholder="Select a room">
                                {field.value
                                  ? rooms && (
                                      <div className="flex items-center gap-4">
                                        {rooms.find((r) => r.roomID === field.value)?.name}
                                      </div>
                                    )
                                  : 'Select a room'}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-card  w-full ">
                              {roomsResponse &&
                                roomsResponse.data.map((room) => (
                                  <SelectItem
                                    key={room.roomID}
                                    value={room.roomID?.toString()}
                                    className="w-full"
                                    disabled={!room.isAvailable}
                                  >
                                    <div className="flex items-center w-full gap-5">
                                      <div className="flex items-center gap-2">
                                        <span>{room.name}</span>
                                        <span className="text-xs ">({room.capacity} people)</span>
                                      </div>
                                      <span
                                        className={cn(
                                          'ml-auto px-2 py-1 text-xs rounded-full',
                                          room.isAvailable
                                            ? room.isInUse
                                              ? 'bg-red-100 text-red-700'
                                              : 'bg-green-100 text-green-700'
                                            : 'bg-gray-200 text-gray-600',
                                        )}
                                      >
                                        {room.isAvailable
                                          ? room.isInUse
                                            ? 'In Use'
                                            : 'Available'
                                          : 'Unvailable'}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          {errors.roomID && (
                            <p className="text-xs text-red-500">Room is required</p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className="space-y-2 text-sm flex items-start gap-2 flex-wrap">
                    <span className="text-muted-foreground">Equipments:</span>
                    <div className="font-normal text-foreground flex items-center flex-wrap">
                      {groupedEquipments && Object.keys(groupedEquipments).length > 0 ? (
                        Object.entries(groupedEquipments)
                          .map(([name, qty]) => `${name} x${qty}`)
                          .join(', ')
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes..."
                    className="max-h-[250px]"
                    {...register('description')}
                    rows={3}
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="p-6 pt-4 border-t border-border flex justify-end gap-3 bg-card">
              {booking?.bookingID && (
                <ConfirmModal
                  onSubmit={handleDelete}
                  isSubmitting={isSubmitting}
                  isPending={isPending}
                />
              )}
              <Button isLoading={isSubmitting} disabled={isPending || isSubmitting} type="submit">
                {booking?.bookingID ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        ) : (
          <BookingDetailModal
            booking={booking}
            rooms={roomsResponse?.data ?? []}
            onClose={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
