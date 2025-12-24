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
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { changePasswordSchema, type ChangePasswordFormType } from '../types/user';
import { useChangePassword } from '@/modules/auth/hook/auth.hook';

type Props = {
  open: boolean;
  onOpenChange: () => void;
};

export function ChangePasswordModal({ open, onOpenChange }: Props) {
  const { mutate, isPending } = useChangePassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormType) => {
    mutate(data, {
      onSuccess: () => {
        onOpenChange();
      },
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:w-150 max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Change your password</DialogTitle>
          <DialogDescription>Change password</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="serial">Current Password*</Label>
              <Input type="password" {...register('currentPassword')} />
              {errors.currentPassword && (
                <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">New Password*</Label>
              <Input type="password" {...register('newPassword')} />
              {errors.newPassword && (
                <p className="text-xs text-red-500">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Confirm Password*</Label>
              <Input type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" disabled={isPending} variant="outline" onClick={onOpenChange}>
              Cancel
            </Button>
            <Button isLoading={isPending} type="submit">
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
