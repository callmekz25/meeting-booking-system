import MainLayout from '@/layouts/mainLayout';
import ForgotPasswordPage from '@/modules/auth/pages/forgotPasswordPage';
import { LoginPage } from '@/modules/auth/pages/loginPage';
import CalendarPage from '@/modules/calendar/pages/calendarPage';
import EquipmentPage from '@/modules/inventory/pages/inventoryPage';
import RoomPage from '@/modules/room/pages/roomPage';
import { ResetPasswordPage } from '@/modules/auth/pages/resetPasswordPage';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoutes from './protectedRoute';
import AdminRoutes from './adminRoute';
import DashboardPage from '@/modules/dashboard/pages/dashboardPage';
import UserPage from '@/modules/user/pages/userPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset',
    element: <ResetPasswordPage />,
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <CalendarPage />,
          },
        ],
      },
    ],
  },

  {
    element: <AdminRoutes />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/rooms',
            element: <RoomPage />,
          },
          {
            path: '/equipments',
            element: <EquipmentPage />,
          },
          {
            path: '/users',
            element: <UserPage />,
          },
        ],
      },
    ],
  },
]);
