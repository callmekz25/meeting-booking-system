import { useNavigate } from 'react-router-dom';
import { LoginBranding } from '../components/LoginBranding';
import { LoginForm } from '../components/LoginForm';
import { useLoginForm } from '../hook/useLoginForm';

export const LoginPage = () => {
  const navigate = useNavigate();

  // Form logic
  const {
    register,
    handleSubmit,
    errors,
    clearErrors,
    loading,
    canSubmit,
    onSubmit,
    handleEmailKeyDown,
    handlePasswordKeyDown,
  } = useLoginForm({
    onLoginSuccess: () => {
      navigate('/');
    },
  });

  return (
    <div className="min-h-screen w-full flex font-inter">
      {/* Left side – Background / Branding */}
      <LoginBranding />

      {/* Right side – Login Form */}
      <LoginForm
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        clearErrors={clearErrors}
        loading={loading}
        canSubmit={canSubmit}
        onSubmit={onSubmit}
        handleEmailKeyDown={handleEmailKeyDown}
        handlePasswordKeyDown={handlePasswordKeyDown}
      />
    </div>
  );
};
