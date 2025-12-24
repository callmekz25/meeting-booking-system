import Loading from '@/components/ui/loading';
import { useGetMe } from '@/modules/user/hooks/user.hook';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = () => {
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
  return <Outlet />;
};
export default ProtectedRoutes;
