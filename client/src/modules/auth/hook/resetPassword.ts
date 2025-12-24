import { useMutation } from "@tanstack/react-query"
import { resetPassword, validatePasswordResetToken, type ResetPasswordPayload } from "../api/auth.api";

export const useValidateToken = () => {
    return useMutation({
        mutationFn: validatePasswordResetToken,
    });
}

export const useResetPassword = () =>{
    return useMutation({
        mutationFn:  (payload: ResetPasswordPayload) => resetPassword(payload),
    });
} 