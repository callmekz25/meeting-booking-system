import { useState } from 'react';
import type { FieldError, UseFormRegister, FieldValues, FieldPath } from 'react-hook-form';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Định nghĩa Props với Generic <TFormValues>
interface InputFieldProps<TFormValues extends FieldValues> {
  label: string;
  type?: string;
  error?: FieldError;
  name: FieldPath<TFormValues>;
  register: UseFormRegister<TFormValues>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange?: () => void;
  disabled?: boolean;
}

// Chỉnh sửa định nghĩa component thành Generic Component
export const InputField = <TFormValues extends FieldValues>({
  label,
  type = 'text',
  name,
  register,
  error,
  onKeyDown,
  onChange,
  disabled = false,
}: InputFieldProps<TFormValues>) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const fieldName = name as string;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={fieldName} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-gray-400">
          {name === 'email' ? <EmailIcon /> : <LockIcon />}
        </div>

        <input
          {...register(name)}
          id={fieldName}
          type={isPassword && showPassword ? 'text' : type}
          onChange={(e) => {
            register(name).onChange(e);

            if (onChange) onChange();
          }}
          onKeyDown={onKeyDown}
          disabled={disabled}
          className={`border rounded-lg pl-10 ${
            isPassword ? 'pr-12' : 'pr-3'
          } py-2.5 w-full outline-none transition-colors placeholder:text-gray-400 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          placeholder={`Enter your ${label.toLowerCase()}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
            tabIndex={-1}
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
        )}
      </div>

      {error && <span className="text-xs text-red-600 mt-1">{error.message}</span>}
    </div>
  );
};
