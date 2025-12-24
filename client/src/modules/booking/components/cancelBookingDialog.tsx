import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CancelBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bookingTitle: string;
  isCancelling : boolean;
}

export const CancelBookingDialog = ({
  open,
  onClose,
  onConfirm,
  bookingTitle,
  isCancelling,
}: CancelBookingDialogProps) => {
  // const [loading, setLoading] = useState(false);
  const loading = isCancelling;
  const handleConfirm = async () => {
    // setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error canceling booking:', error);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Cancel Booking
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to cancel this meeting?
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-2">"{bookingTitle}"</p>
          <p className="text-xs text-gray-500 mt-4">
            This action cannot be undone. All attendees will be notified.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="min-w-[100px]"
          >
            No, Keep It
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Canceling...</span>
              </div>
            ) : (
              'Yes, Cancel It'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
