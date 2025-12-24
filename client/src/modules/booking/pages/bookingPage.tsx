import { NewBookingButton } from '../components/newBookingButton';
import type { CreateBookingFormType } from '../types/booking';

// Mock data for demonstration
const MOCK_ROOMS = [
  { id: '1', name: 'Conference Room A' },
  { id: '2', name: 'Conference Room B' },
  { id: '3', name: 'Meeting Room 1' },
  { id: '4', name: 'Meeting Room 2' },
  { id: '5', name: 'Training Room' },
];

// Mock function to check room availability
const checkRoomAvailability = async (
  roomId: string,
  _date: string,
  startTime: string,
  endTime: string,
): Promise<boolean> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock logic: Room 1 is unavailable from 14:00-16:00 on any date
  if (roomId === '1' && startTime === '14:00' && endTime === '16:00') {
    return false;
  }

  // All other combinations are available
  return true;
};

export const BookingPage = () => {
  const handleBookingCreated = (data: CreateBookingFormType) => {
    console.log('New booking created:', data);
    // Here you would typically call an API to save the booking
    // Example: await createBooking(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
          <p className="text-gray-600">Create and manage room bookings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Bookings</h2>
            <NewBookingButton
              onBookingCreated={handleBookingCreated}
              checkRoomAvailability={checkRoomAvailability}
              rooms={MOCK_ROOMS}
            />
          </div>

          {/* Booking list would go here */}
          <div className="text-center py-12 text-gray-500">
            <p>No bookings yet. Click "New Booking" to create one.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
