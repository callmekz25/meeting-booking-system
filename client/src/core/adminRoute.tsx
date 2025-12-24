import Loading from '@/components/ui/loading';
import { useGetMe } from '@/modules/user/hooks/user.hook';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoutes = () => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const { data, isLoading, isError } = useGetMe();

  if (isLoading)
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loading />
      </div>
    );
  if (!data || isError) return <Navigate to="/login" replace />;

  if (data && data.data.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  if (data && data.data.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};
export default AdminRoutes;
