import * as yup from 'yup';
import { EMAIL_REGEX, ERROR_MESSAGES } from './login';

export const ForgotPassSchema = yup.object().shape({
  email: yup
    .string()
    .email(ERROR_MESSAGES.invalidEmail)
    .required(ERROR_MESSAGES.requiredEmail)
    .matches(EMAIL_REGEX, ERROR_MESSAGES.invalidEmail),
});

export type ForgotPasswordType = yup.InferType<typeof ForgotPassSchema>;
