import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import type {
  FieldErrors,
  UseFormRegister,
  UseFormHandleSubmit,
  UseFormClearErrors,
} from 'react-hook-form';
import type { LoginFormType } from '../types/login';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
  register: UseFormRegister<LoginFormType>;
  handleSubmit: UseFormHandleSubmit<LoginFormType>;
  errors: FieldErrors<LoginFormType>;
  clearErrors: UseFormClearErrors<LoginFormType>;
  loading: boolean;
  canSubmit: boolean;
  onSubmit: (data: LoginFormType) => Promise<void>;
  handleEmailKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const LoginForm = ({
  register,
  handleSubmit,
  errors,
  clearErrors,
  loading,
  canSubmit,
  onSubmit,
  handleEmailKeyDown,
  handlePasswordKeyDown,
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center w-full lg:w-2/5 p-4 sm:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-blue-50/30 min-h-screen">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-3xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-4 shadow-lg">
              <Logo width={48} height={48} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Sign in to continue to your account
            </p>
          </div>

          {/* Form */}
          <form className="space-y-1" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={`pl-10 h-11 ${
                    errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  {...register('email', {
                    onChange: () => clearErrors('email'),
                  })}
                  onKeyDown={handleEmailKeyDown}
                />
              </div>
              <div className="min-h-5">
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`pl-10 pr-10 h-11 ${
                    errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  {...register('password', {
                    onChange: () => clearErrors('password'),
                  })}
                  onKeyDown={handlePasswordKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="min-h-5">
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
