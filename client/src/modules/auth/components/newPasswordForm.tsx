// src/modules/auth/components/NewPasswordForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useResetPasswordForm } from '../hook/useResetPasswordForm'; // Import hook vừa tạo
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

interface NewPasswordFormProps {
    token: string;
}

export const NewPasswordForm = ({ token }: NewPasswordFormProps) => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<{ message: string | null; isSuccess: boolean }>({
        message: null,
        isSuccess: false,
    });

    const {
        register,
        handleSubmit,
        errors,
        loading,
        canSubmit,
        onSubmit: handleFormSubmit,
        clearErrors,
    } = useResetPasswordForm({
        token: token,
        onSuccess: () => {
            // Thành công: Chuyển hướng
            navigate('/login?resetSuccess=true');
        },
        onError: (error) => {
            const errorData = (error as AxiosError)?.response?.data as { message?: string };
            const errorMessage = errorData?.message || 'Failed to reset password. Please try again.';
            setStatus({ message: errorMessage, isSuccess: false });
        },
    });

    const renderAlert = () => {
        if (!status.message) return null;
        
        const isError = !status.isSuccess;
        const classes = isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
        const IconComponent = isError ? CloseIcon : CheckCircleOutlineIcon;
        const iconColor = isError ? 'text-red-500' : 'text-green-500';

        return (
            <div className={`mb-4 rounded-lg p-3 flex items-start gap-2 border ${classes}`}>
                <IconComponent className={`w-5 h-5 ${iconColor} mt-0.5`} />
                <p className={`text-sm ${isError ? 'text-red-800' : 'text-green-800'} flex-1`}>
                    {status.message}
                </p>
                <button type="button" onClick={() => setStatus({ message: null, isSuccess: false })} className="text-gray-500 hover:text-gray-700 transition-colors">
                    <CloseIcon style={{ fontSize: '1rem' }} />
                </button>
            </div>
        );
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
            {renderAlert()}
            
            {/* Input Mật khẩu mới */}
            <div>
                <label htmlFor="password">New Password</label>
                <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: '1.25rem' }} />
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter new password"
                        className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                        disabled={loading}
                        {...register("password", { onChange: () => { clearErrors('password'); setStatus({ message: null, isSuccess: false }); } })}
                    />
                </div>
                {errors.password && <span className="text-xs text-red-600 mt-1">{errors.password.message}</span>}
            </div>

            {/* Input Xác nhận mật khẩu */}
            <div>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: '1.25rem' }} />
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        disabled={loading}
                        {...register("confirmPassword", { onChange: () => { clearErrors('confirmPassword'); setStatus({ message: null, isSuccess: false }); } })}
                    />
                </div>
                {errors.confirmPassword && <span className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</span>}
            </div>

            <Button type="submit" disabled={!canSubmit} className="w-full">
                {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Resetting...</span>
                    </div>
                ) : 'Reset Password'}
            </Button>
        </form>
    );
};