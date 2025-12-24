import * as yup from 'yup';

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const ERROR_MESSAGES = {
  invalidEmail: 'Invalid email.',
  requiredEmail: 'Please enter Email.',
  requiredPassword: 'Please enter Password.',
  incorrectCredentials: 'Username or password is incorrect.',
  accountLocked: 'Your account has been temporarily locked due to too many failed login attempts.',
};

export const LoginSchema = yup.object().shape({
  email: yup
    .string()
    .required(ERROR_MESSAGES.requiredEmail)
    .matches(EMAIL_REGEX, ERROR_MESSAGES.invalidEmail),
  password: yup.string().required(ERROR_MESSAGES.requiredPassword),
});

export type LoginFormType = yup.InferType<typeof LoginSchema>;
