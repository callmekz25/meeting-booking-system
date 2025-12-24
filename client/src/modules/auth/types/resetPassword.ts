import * as yup from 'yup';

const PASSWORD_MIN_LENGTH = 8;
const ERROR_MESSAGES = {
    requiredPassword: 'Password is required.',
    minLength: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    match: 'Passwords must match.',
};
export const ResetPasswordSchema = yup.object().shape({
    password: yup
        .string()
        .required(ERROR_MESSAGES.requiredPassword)
        .min(PASSWORD_MIN_LENGTH, ERROR_MESSAGES.minLength),
        
    confirmPassword: yup
        .string()
        .required(ERROR_MESSAGES.requiredPassword)
        .oneOf([yup.ref('password')], ERROR_MESSAGES.match),
});

export type ResetPasswordFormType = yup.InferType<typeof ResetPasswordSchema>;