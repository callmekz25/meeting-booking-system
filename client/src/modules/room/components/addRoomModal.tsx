import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, XIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { roomSchema, type RoomFormType } from '../types/room';
import { useCreateRoom, useUpdateRoom } from '../hooks/room.hook';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetInventoriesBySearch } from '@/modules/inventory/hooks/inventory.hook';

interface AddRoomModalProps {
  open: boolean;
  initRoom: RoomFormType | null;
  onOpenChange: () => void;
  page: number;
  name?: string;
}

function AddRoomModal({ open, onOpenChange, initRoom, page, name }: AddRoomModalProps) {
  const {
    register,
    control,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(roomSchema),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [focusSearch, setFocusSearch] = React.useState(false);
  const debounceSearch = useDebounce(searchQuery, 500);
  const queryClient = useQueryClient();

  const { mutate: createRoom, isPending: ipc } = useCreateRoom();
  const { mutate: updateRoom, isPending: ipu } = useUpdateRoom();
  const { data, isLoading, isError } = useGetInventoriesBySearch(debounceSearch);

  React.useEffect(() => {
    if (open) {
      setFocusSearch(false);
      setSearchQuery('');
    }
  }, [open]);

  React.useEffect(() => {
    if (initRoom) {
      reset({
        roomID: initRoom.roomID,
        capacity: initRoom.capacity,
        name: initRoom.name,
        code: initRoom.code,
        isAvailable: initRoom.isAvailable,
        assignEquipments: initRoom.assignEquipments ?? [],
      });
    }
  }, [initRoom, reset, open]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        listRef.current &&
        !listRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setFocusSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'assignEquipments',
  });
  console.log(fields);

  const onSubmit = (data: RoomFormType) => {
    console.log(data);
    if (data.roomID) {
      updateRoom(data, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['rooms-query'],
          });
          onOpenChange();
        },
      });
    } else {
      createRoom(data, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['rooms-query'],
          });
          onOpenChange();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:w-150 max-w-[90vw] ">
        <DialogHeader>
          <DialogTitle>{initRoom?.roomID ? 'Edit Room' : 'Add Room'}</DialogTitle>
          <DialogDescription>
            Create a new meeting room and assign default equipment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Room Name *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input id="capacity" max={50} type="number" min={1} {...register('capacity')} />
                {errors.capacity && (
                  <span className="text-xs text-red-500">{errors.capacity.message}</span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="floor">Code *</Label>
                <Input id="floor" placeholder="" {...register('code')} />
                {errors.code && <span className="text-xs text-red-500">{errors.code.message}</span>}
              </div>
            </div>
            {initRoom?.roomID && (
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  control={control}
                  name="isAvailable"
                  render={({ field }) => {
                    return (
                      <Select
                        value={field.value ? 'true' : 'false'}
                        onValueChange={(value) => field.onChange(value === 'true')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          <SelectItem value="true">Available</SelectItem>
                          <SelectItem value="false">Unvailable</SelectItem>
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label>Default Equipment</Label>
              <p className="text-xs text-muted-foreground">
                Search and add equipment with quantity.
              </p>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  onFocus={() => setFocusSearch(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />

                {(debounceSearch || focusSearch) && (
                  <div
                    ref={listRef}
                    className="absolute top-full left-0 w-full mt-1 z-50 max-h-60 overflow-y-auto rounded-md border border-border bg-card shadow-md"
                  >
                    {!isLoading && data && data?.data && data.data.length > 0 ? (
                      data.data.map((eq) => {
                        return (
                          <div
                            key={eq.inventoryID}
                            className="flex items-center gap-3 p-2 hover:bg-secondary cursor-pointer transition-colors"
                            onMouseDown={() => {
                              const index = fields.findIndex(
                                (f) => f.inventoryID === eq.inventoryID,
                              );
                              if (index !== -1) {
                                const currentQuantity =
                                  watch(`assignEquipments.${index}.quantity`) ?? 1;
                                setValue(`assignEquipments.${index}.quantity`, currentQuantity + 1);
                              } else {
                                append({
                                  inventoryID: eq.inventoryID,
                                  typeName: eq.typeName,
                                  serialNumber: eq.serialNumber,
                                  quantity: 1,
                                });
                              }
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{eq.typeName}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {eq.serialNumber}
                              </p>
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-3">
                        No equipment found.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {fields.length > 0 && (
                <ScrollArea className="max-h-[250px] rounded-md border border-border p-2">
                  <div className="space-y-2">
                    {fields.map((field, index) => {
                      return (
                        <div
                          key={`${field.inventoryID}-${index}`}
                          className="flex items-start gap-3 p-2 rounded-lg bg-secondary/50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate max-w-45 line-clamp-1">
                              {field.typeName}
                            </p>
                            <p className="text-xs text-muted-foreground max-w-45 capitalize line-clamp-1">
                              {field.serialNumber}
                            </p>
                          </div>
                          <div className="">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground">Quantity:</Label>
                              <Controller
                                control={control}
                                name={`assignEquipments.${index}.quantity`}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    min={1}
                                    className="w-20 h-7 text-center"
                                  />
                                )}
                              />

                              <Button
                                onClick={() => remove(index)}
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                            {errors.assignEquipments?.[index]?.quantity && (
                              <p className="text-xs text-red-500 ">
                                {errors.assignEquipments[index]?.quantity?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              {fields.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {fields.length} equipment item(s) added
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" disabled={ipc || ipu} variant="outline" onClick={onOpenChange}>
              Cancel
            </Button>
            <Button isLoading={ipc || ipu} type="submit">
              {initRoom?.roomID ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default AddRoomModal;
