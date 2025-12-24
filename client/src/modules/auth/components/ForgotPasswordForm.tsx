import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { ForgotPasswordType } from '../types/forgotPassword';
import { Logo } from '@/components/Logo';
import type { 
    FieldErrors,
    UseFormRegister,
    UseFormHandleSubmit,
    UseFormClearErrors,
} from 'react-hook-form';
import type { AxiosError } from 'axios';

interface ForgotPasswordFormProps {
    register: UseFormRegister<ForgotPasswordType>;
    handleSubmit: UseFormHandleSubmit<ForgotPasswordType>;
    errors: FieldErrors<ForgotPasswordType>;
    clearErrors: UseFormClearErrors<ForgotPasswordType>;
    loading: boolean;
    canSubmit: boolean;
    serverError: string | null; 
    isSuccess: boolean; 
    onSubmit: (data: ForgotPasswordType) => void; 
    onClearStatus: () => void;
}

export const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
  const { 
    register, 
    handleSubmit, 
    errors, 
    clearErrors, 
    loading, 
    canSubmit, 
    serverError, 
    isSuccess, 
    onSubmit, 
    onClearStatus 
  } = props;

  const renderAlert = () => {
    if (!serverError && !isSuccess) return null;

    const message = serverError || 'Password reset link sent successfully. Please check your mailbox.';
    const isError = !isSuccess && !!serverError;
    const classes = isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
    const IconComponent = isError ? CloseIcon : CheckCircleOutlineIcon;
    const iconColor = isError ? 'text-red-500' : 'text-green-500';
    const messageColor = isError ? 'text-red-800' : 'text-green-800';
    const buttonColor = isError ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700';

    return (
      <div className={`mb-4 rounded-lg p-3 flex items-start gap-2 border ${classes}`}>
        <IconComponent className={`w-5 h-5 ${iconColor} mt-0.5`} />
        <div className="flex-1">
          <p className={`text-sm ${messageColor}`}>{message}</p>
        </div>
        <button type="button" onClick={onClearStatus} className={`${buttonColor} transition-colors`}>
          <CloseIcon style={{ fontSize: '1rem' }} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-center items-center w-full lg:w-2/5 p-4 sm:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-blue-50/30 min-h-screen">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10">
          <div className="text-center mb-8">
            <Logo width={48} height={48} />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Password Recovery</h1>
            <p className="text-sm text-gray-600">Enter your email address to receive a password reset link.</p>
          </div>

          {renderAlert()}

          {/* Form chỉ dùng props từ hook */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email">Email Address</label>
              <div className="relative">
                <EmailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: '1.25rem' }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  disabled={loading || isSuccess}
                  {...register("email", {
                    onChange: () => {
                      clearErrors('email');
                      onClearStatus();
                    }
                  })}
                />
              </div>
              {errors.email && <span className="text-xs text-red-600 mt-1">{errors.email.message}</span>}
            </div>

            <Button type="submit" disabled={!canSubmit || isSuccess} className="w-full">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : 'Submit a Reset Request'}
            </Button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

