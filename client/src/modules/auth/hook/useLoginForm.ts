import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginSchema } from '../types/login';
import type { LoginFormType } from '../types/login';
import { useLogin } from './auth.hook';
import { useNavigate } from 'react-router-dom';

interface UseLoginFormProps {
  onLoginSuccess?: () => void;
  onLoginFail?: (errorMessage: string) => void;
}

interface UseLoginFormReturn {
  register: ReturnType<typeof useForm<LoginFormType>>['register'];
  handleSubmit: ReturnType<typeof useForm<LoginFormType>>['handleSubmit'];
  errors: ReturnType<typeof useForm<LoginFormType>>['formState']['errors'];
  watch: ReturnType<typeof useForm<LoginFormType>>['watch'];
  setFocus: ReturnType<typeof useForm<LoginFormType>>['setFocus'];
  clearErrors: ReturnType<typeof useForm<LoginFormType>>['clearErrors'];
  loading: boolean;
  canSubmit: boolean;
  onSubmit: (data: LoginFormType) => Promise<void>;
  handleEmailKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const useLoginForm = ({
  onLoginSuccess,
  onLoginFail,
}: UseLoginFormProps): UseLoginFormReturn => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setFocus,
    clearErrors,
  } = useForm<LoginFormType>({
    resolver: yupResolver(LoginSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const { mutate: loginMutation, isPending } = useLogin();
  const navigate = useNavigate();

  const emailValue = watch('email');
  const passwordValue = watch('password');

  // Button is activated when both fields have values and no errors
  const canSubmit: boolean =
    !!emailValue && !!passwordValue && !errors.email && !errors.password && !isPending;

  const onSubmit = async (data: LoginFormType) => {
    if (!canSubmit) return;

    loginMutation(data, {
      onSuccess: (response) => {
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
        }
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        navigate('/');
        onLoginSuccess?.();
      },
      onError: (error: any) => {
        const apiErrorMessage = error.response?.data?.message || error.message || 'Login failed';
        onLoginFail?.(apiErrorMessage);
      },
    });
  };

  // After filling email, pressing Enter/Tab moves cursor to Password field
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      setFocus('password');
    }
  };

  // Pressing Enter in Password field activates Login button (if valid)
  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (canSubmit) {
        handleSubmit(onSubmit)();
      }
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    watch,
    setFocus,
    clearErrors,
    loading: isPending,
    canSubmit,
    onSubmit,
    handleEmailKeyDown,
    handlePasswordKeyDown,
  };
};
