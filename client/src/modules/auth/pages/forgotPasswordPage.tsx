import { useState } from 'react';
import { useAutoClearError } from '@/hooks/useAutoClearError';
import { LoginBranding } from '../components/LoginBranding';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { useForgotPasswordForm } from '../hook/forgotPasswordForm';

// Thông báo mặc định
const SUCCESS_MESSAGE = 'Password reset link sent successfully.';

export const ForgotPasswordPage = () => {
    // 1. Quản lý trạng thái thông báo
    const [status, setStatus] = useState<{ message: string | null; isSuccess: boolean }>({
        message: null,
        isSuccess: false,
    });

    // 2. Sử dụng hook form để quản lý logic FE và gọi API
    const {
        register,
        handleSubmit,
        errors,
        clearErrors,
        loading,
        canSubmit,
        onSubmit,
    } = useForgotPasswordForm({
        onSuccess: (email) => {
            // Xử lý thành công: Hiển thị thông báo thành công
            setStatus({
                message: `${SUCCESS_MESSAGE} Please check your mailbox: ${email}.`,
                isSuccess: true,
            });
        },
        onError: (errorMessage) => {
            // Xử lý thất bại: Hiển thị thông báo lỗi từ Server (đã được xử lý trong hook)
            setStatus({
                message: errorMessage,
                isSuccess: false,
            });
        },
    });

    // 3. Logic hiển thị lỗi và tự động xóa lỗi
    const serverError =
        status.message && !status.isSuccess ? status.message : null;

    useAutoClearError(serverError, () =>
        setStatus({ message: null, isSuccess: false })
    );

    // Hàm clear status thủ công (dùng cho nút X trong form)
    const onClearStatus = () => setStatus({ message: null, isSuccess: false });

    return (
        <div className="min-h-screen w-full flex font-inter">
            <LoginBranding />
            <ForgotPasswordForm
                register={register}
                handleSubmit={handleSubmit}
                errors={errors}
                clearErrors={clearErrors}
                loading={loading}
                canSubmit={canSubmit}
                serverError={serverError}
                isSuccess={status.isSuccess}
                onSubmit={onSubmit}
                onClearStatus={onClearStatus} // Truyền hàm clear status
            />
        </div>
    );
};

export default ForgotPasswordPage;