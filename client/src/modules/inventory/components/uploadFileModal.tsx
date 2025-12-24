import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useUploadImportFile } from '../hooks/inventory.hook';
import { toast } from 'sonner';
import { AlertCircle, Loader2Icon, UploadIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TableBody from '@mui/material/TableBody';
import { Label } from '@/components/ui/label';

type Props = {
  open: boolean;
  onOpenChange: () => void;
};

const UploadFileModal = ({ open, onOpenChange }: Props) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUploadImportFile();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = e.target.files?.[0];
    console.log(file);
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      input.value = '';
      toast.error('Invalid format');
      return;
    }
    mutate(file, {
      onSuccess: () => {
        input.value = '';
        queryClient.invalidateQueries({
          queryKey: ['inventory-statics'],
        });
        queryClient.invalidateQueries({
          queryKey: ['inventories'],
        });
        queryClient.invalidateQueries({
          queryKey: ['equipment-type'],
        });
        onOpenChange();
      },
      onError: () => {
        input.value = '';
      },
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:w-150 max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Upload File CSV</DialogTitle>
          <DialogDescription>Upload inventory file</DialogDescription>
        </DialogHeader>
        <div>
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              CSV format required
            </div>

            <div className="overflow-x-auto">
              <Table className="w-full border-collapse text-left">
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="px-2 py-1 font-semibold">TypeName</TableHead>
                    <TableHead className="px-2 py-1 font-semibold">SerialNumber</TableHead>
                    <TableHead className="px-2 py-1 font-semibold">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-muted-foreground">
                  <TableRow>
                    <TableCell className="px-2 py-3">Chair</TableCell>
                    <TableCell className="px-2 py-3">CH-001</TableCell>
                    <TableCell className="px-2 py-3">10</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-2 py-3">Desk</TableCell>
                    <TableCell className="px-2 py-3">DK-002</TableCell>
                    <TableCell className="px-2 py-3">5</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
              <li>
                File must be in <b>.csv</b> format
              </li>
              <li>Header names must match exactly</li>
            </ul>
          </div>
          <div className="flex items-center justify-end mt-4">
            <Label
              htmlFor="upload"
              className="py-2 flex items-center gap-2 px-4 bg-white border rounded-md cursor-pointer"
            >
              <UploadIcon className="size-4" />
              Select File
            </Label>

            <Input
              id="upload"
              type="file"
              disabled={isPending}
              className="hidden"
              onChange={(e) => handleFileChange(e)}
            />
          </div>
          <DialogFooter className="mt-10 gap-2">
            <Button type="button" disabled={isPending} variant="outline" onClick={onOpenChange}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Upload
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadFileModal;
