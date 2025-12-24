// File: src/modules/auth/hook/forgotPasswordForm.ts (hoặc tương tự)

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { ForgotPasswordType } from '../types/forgotPassword'; 
import { ForgotPassSchema } from '../types/forgotPassword'; 
import { useForgotPassword } from './useForgotPassword'; 
import { AxiosError } from 'axios';

// Định nghĩa các thông báo lỗi ngay tại đây (hoặc đảm bảo bạn import chúng)
const FORGOT_ERROR_MESSAGES = {
    emailNotFound: 'The email address is not registered in our system.', 
    unknownError: 'Failed to process request. Please check the email and try again.',
};

interface UseForgotPasswordFormProps {
    onSuccess: (email: string) => void;
    onError: (errorMessage: string) => void; 
}

export const useForgotPasswordForm = ({
    onSuccess,
    onError,
}: UseForgotPasswordFormProps)  => {
    // ... (Phần Form và useForgotPassword giữ nguyên)

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        clearErrors,
    } = useForm<ForgotPasswordType>({
        resolver: yupResolver(ForgotPassSchema),
        mode: 'onBlur',
        reValidateMode: 'onBlur',
    });

    const { mutate, isPending: loading } = useForgotPassword(); 

    const emailValue = watch('email');
    const canSubmit: boolean = !!emailValue && !errors.email && !loading;
    
    const onSubmit = (data: ForgotPasswordType) => {
        if (!canSubmit) return;

        mutate(data, {
            onSuccess: () => {
                onSuccess(data.email);
            },
            onError: (error) => {
                const axiosError = error as AxiosError;
                // Cập nhật kiểu dữ liệu để xử lý cả string và string[] cho message
                const errorData = axiosError?.response?.data as { message?: string | string[] }; 
                let errorMessage: string;
                
                if (axiosError?.response?.status === 404) {
                    errorMessage = FORGOT_ERROR_MESSAGES.emailNotFound;
                
                } else if (axiosError?.response?.status === 400) {
                    // Xử lý Lỗi 400 - Lấy thông báo chi tiết từ Backend
                    if (Array.isArray(errorData.message)) {
                        // Nếu Backend trả về mảng lỗi (phổ biến với validation)
                        errorMessage = errorData.message.join('; '); 
                    } else if (typeof errorData.message === 'string') {
                        // Nếu Backend trả về chuỗi lỗi
                        errorMessage = errorData.message;
                    } else {
                        // Mặc định nếu không tìm thấy message cụ thể
                        errorMessage = FORGOT_ERROR_MESSAGES.unknownError;
                    }
                    
                } else {
                    errorMessage = errorData?.message?.toString() || FORGOT_ERROR_MESSAGES.unknownError;
                }
                
                // Gửi chuỗi lỗi đã xử lý ra ngoài
                onError(errorMessage); 
            },
        });
    };

    return {
        register,
        handleSubmit,
        errors,
        clearErrors,
        loading,
        canSubmit,
        onSubmit,
    };
};