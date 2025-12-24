import React from 'react';
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
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Plus, Trash2 } from 'lucide-react';
import { useGetAllRooms } from '@/modules/room/hooks/room.hook';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userFormSchema, type UserFormType } from '../types/user';
import { useCreateUser, useGetRoles, useUpdateUser } from '../hooks/user.hook';

type Props = {
  open: boolean;
  onOpenChange: () => void;
  initData: UserFormType | null;
};

export function UserModal({ open, onOpenChange, initData }: Props) {
  const queryClient = useQueryClient();
  const { data: rolesResponse, isLoading: ildr } = useGetRoles();
  const { mutate: createUser, isPending: ipc } = useCreateUser();
  const { mutate: updateUser, isPending: ipu } = useUpdateUser();

  const {
    register,
    reset,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userFormSchema),
  });
  React.useEffect(() => {
    if (initData) {
      reset({
        email: initData.email || '',
        fullName: initData.fullName || '',
        phoneNumber: initData.phoneNumber || '',
        roleID: initData.roleID || '',
        userID: initData.userID || '',
      });
    }
  }, [initData, reset, open]);

  const onSubmit = (data: UserFormType) => {
    if (data?.userID) {
      updateUser(data, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['users-all'],
          });
          onOpenChange();
        },
      });
    } else {
      createUser(data, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['users-all'],
          });
          onOpenChange();
        },
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:w-150 max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>{initData?.userID ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {initData?.userID ? 'Update user information.' : 'Add new user to your system.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="serial">Full Name*</Label>
              <Input {...register('fullName')} />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email*</Label>
              <Input {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Phone Number*</Label>
              <Input {...register('phoneNumber')} />
              {errors.phoneNumber && (
                <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eq-status">Role</Label>
              <Controller
                control={control}
                name="roleID"
                render={({ field }) => {
                  return (
                    <Select value={field?.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        {rolesResponse &&
                          rolesResponse.data.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.roleID && <p className="text-xs text-red-500">{errors.roleID?.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" disabled={ipc || ipu} variant="outline" onClick={onOpenChange}>
              Cancel
            </Button>
            <Button isLoading={ipc || ipu} type="submit">
              {initData?.userID ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
