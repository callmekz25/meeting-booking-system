
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useResetPassword } from './resetPassword'; // Giả sử hook useResetPassword nằm trong file này
import { type ResetPasswordFormType, ResetPasswordSchema } from '../types/resetPassword';
import { AxiosError } from 'axios';

interface UseResetPasswordFormProps {
    token: string;
    onSuccess: () => void;
    onError: (error: AxiosError | null) => void;
}

export const useResetPasswordForm = ({ token, onSuccess, onError }: UseResetPasswordFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        clearErrors,
        reset, // Có thể dùng để reset form sau khi lỗi
    } = useForm<ResetPasswordFormType>({
        resolver: yupResolver(ResetPasswordSchema),
        mode: 'onBlur',
    });

    // Lấy hook từ file hook/resetPassword.ts (hoặc auth.hook.ts)
    const { mutate, isPending: loading } = useResetPassword();

    // Check trạng thái submit
    const password = watch('password');
    const confirmPassword = watch('confirmPassword');
    const canSubmit: boolean = !!password && !!confirmPassword && !errors.password && !errors.confirmPassword && !loading;

    const onSubmit = (data: ResetPasswordFormType) => {
        if (!canSubmit) return;

        mutate({ token, newPassword: data.password , confirmPassword :data.confirmPassword}, {
            onSuccess: () => {
                onSuccess();
            },
            onError: (error) => {
                onError(error as AxiosError);
                // Xóa mật khẩu sau khi lỗi
                reset({ password: '', confirmPassword: '' }); 
            },
        });
    };

    return {
        register,
        handleSubmit,
        errors,
        loading,
        canSubmit,
        onSubmit,
        clearErrors,
    };
};