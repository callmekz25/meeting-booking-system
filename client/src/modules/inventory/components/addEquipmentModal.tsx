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
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  inventorySchema,
  type EquipmentType,
  type InventoryFormType,
  type InventoryType,
} from '../types/inventory';
import { Plus, Trash2 } from 'lucide-react';
import { useGetAllRooms } from '@/modules/room/hooks/room.hook';
import { cn } from '@/lib/utils';
import { useGetEquipmentType } from '@/modules/equipmentType/hooks/equipmentType.hook';
import { useCreateInventory, useUpdateInventory } from '../hooks/inventory.hook';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type AddEquipmentModalProps = {
  open: boolean;
  onOpenChange: () => void;
  initData: InventoryFormType | null;
};

export function AddEquipmentModal({ open, onOpenChange, initData }: AddEquipmentModalProps) {
  const { data: roomsResponse, isLoading: ildr } = useGetAllRooms();
  const { data: eqtResponse, isLoading: ildeqt } = useGetEquipmentType();
  const queryClient = useQueryClient();
  const { mutate: createInventory, isPending: ipc } = useCreateInventory();
  const { mutate: updateInventory, isPending: ipu } = useUpdateInventory();

  const {
    register,
    reset,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(inventorySchema),
  });
  React.useEffect(() => {
    if (initData) {
      reset({
        inventoryID: initData.inventoryID,
        quantity: initData.quantity,
        roomEquipments: initData.roomEquipments ?? [],
        serialNumber: initData.serialNumber,
        status: initData.status,
        typeID: initData.typeID,
      });
    }
  }, [initData, reset, open]);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'roomEquipments',
  });
  const handleAddRoomAssignment = () => {
    append({ roomID: 0, quantity: 1 });
  };

  const onSubmit = (data: InventoryFormType) => {
    const totalQuantity = data.quantity;
    const assignQuantity =
      data.roomEquipments && data.roomEquipments.length > 0
        ? data.roomEquipments.reduce((total, item) => total + item.quantity, 0)
        : 0;
    const isOutStock = totalQuantity < assignQuantity;

    if (isOutStock) {
      isOutStock && toast('Total assigned quantity exceeds inventory quantity');
    } else {
      if (data.inventoryID) {
        updateInventory(
          { id: data.inventoryID, payload: data },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ['inventories'],
              });
              onOpenChange();
            },
          },
        );
      } else {
        createInventory(data, {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ['inventories'],
            });
            queryClient.invalidateQueries({
              queryKey: ['inventory-statics'],
            });

            onOpenChange();
          },
        });
      }
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:w-150 max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            {initData?.inventoryID ? 'Edit Equipment' : 'Add New Equipment'}
          </DialogTitle>
          <DialogDescription>
            {initData?.inventoryID
              ? 'Update equipment to your inventory.'
              : 'Add new equipment to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="eq-status">Equipment Type</Label>
              <Controller
                control={control}
                name="typeID"
                render={({ field }) => {
                  return (
                    <Select
                      value={field?.value?.toString() || ''}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment type" />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        {eqtResponse &&
                          eqtResponse.data.map((eqt) => (
                            <SelectItem key={eqt.typeID} value={eqt.typeID?.toString()}>
                              {eqt.typeName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.typeID && (
                <p className="text-xs text-red-500">{errors.roomEquipments?.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serial">Serial Number *</Label>
              <Input {...register('serialNumber')} />
              {errors.serialNumber && (
                <p className="text-xs text-red-500">{errors.serialNumber.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serial">Quantity</Label>
              <Input
                min={0}
                max={1000}
                {...register('quantity', { valueAsNumber: true })}
                type="number"
              />
              {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
            </div>
            {initData?.inventoryID && (
              <div className="grid gap-2">
                <Label htmlFor="eq-status">Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        <SelectItem value="0">Available</SelectItem>
                        <SelectItem value="1">Maintenance</SelectItem>
                        <SelectItem value="2">OutOfService</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-xs text-red-500">Status is required</p>}
              </div>
            )}

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Room Assignments</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRoomAssignment}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Room
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No rooms assigned. Click "Add Room" to assign this equipment to rooms.
                </p>
              ) : (
                <div className="space-y-3 max-h-50 overflow-y-auto">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start p-3 border rounded-lg">
                      <div className="w-full">
                        <Controller
                          control={control}
                          name={`roomEquipments.${index}.roomID`}
                          render={({ field }) => (
                            <Select
                              value={field.value?.toString()}
                              onValueChange={(v) => field.onChange(Number(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select room" />
                              </SelectTrigger>
                              <SelectContent>
                                {roomsResponse?.data.map((room) => (
                                  <SelectItem
                                    key={room.roomID}
                                    value={room.roomID.toString()}
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
                          )}
                        />
                        {errors.roomEquipments?.[index]?.roomID && (
                          <p className="text-xs text-red-500 mt-2">
                            {errors.roomEquipments[index]?.roomID?.message}
                          </p>
                        )}
                      </div>
                      <div className="">
                        <div className="flex items-center flex-1">
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            className="w-24"
                            {...register(`roomEquipments.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {errors.roomEquipments?.[index]?.quantity && (
                          <p className="text-xs text-red-500 mt-2">
                            {errors.roomEquipments[index]?.quantity?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" disabled={ipc || ipu} variant="outline" onClick={onOpenChange}>
              Cancel
            </Button>
            <Button isLoading={ipc || ipu} type="submit">
              {initData?.inventoryID ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
