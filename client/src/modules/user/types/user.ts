import * as yup from 'yup';

export const userSchema = yup.object({
  userID: yup.string().required(),
  fullName: yup.string().required(),
  email: yup.string().required(),
  phoneNumber: yup.string().required(),
  role: yup.string().optional().nullable(),
  isAvailable: yup.boolean().optional(),
  roleID: yup.string().optional().nullable(),
});
export const userFormSchema = yup.object({
  userID: yup.string().optional().nullable(),
  fullName: yup
    .string()
    .required('Full Name is required')
    .min(4, 'Full Name must be at least 4 characters'),
  email: yup.string().required('Email is required').email('Email is not valid'),
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^(0|\+84)(\d{9})$/, 'Phone number is not valid'),
  roleID: yup.string().required('Role is required'),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*?&]/, 'Password must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export type ChangePasswordFormType = yup.InferType<typeof changePasswordSchema>;

export type UserFormType = yup.InferType<typeof userFormSchema>;
export type User = yup.InferType<typeof userSchema>;
