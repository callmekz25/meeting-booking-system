

import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useValidateToken } from '../hook/resetPassword';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { NewPasswordForm } from '../components/newPasswordForm';
export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const {mutate: validateMutate, isPending: validating, error: validationError} = useValidateToken();
    const [token,setToken] = useState<string | null>(null);
    const [isTokenValid, setIsTokenValid] = useState(false);

    useEffect (() => {
        const urlToken = searchParams.get('token');
        if(!urlToken){
            navigate('/forgot-password?error=missingToken');
            return;
        }
        setToken(urlToken);

        validateMutate({token: urlToken},{
            onSuccess: () => {
                setIsTokenValid(true);
            },
            onError: () =>{
                setIsTokenValid(false);
            } 
            });
        },[searchParams,navigate,validateMutate]);
    
        if(validating){
            return <div className="p-10 text-center">Validating reset link...</div>
        }

        if(!isTokenValid || validationError){
            const message = validationError ? (validationError as any).response?.data?.message || 'Token is invalid or expired. Please request a new link.'
            : 'Token is invalid or expired. Please request a new link.';

            return (
                <div className="text-center p-10">
                <p className="text-red-500 mb-4">{message}</p>
                <Link to="/forgot-password">
                    <Button>Request New Reset Link</Button>
                </Link>
                </div>
            );
        }
    return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <Logo width={48} height={48} className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-6">Create New Password</h2>
                {token && <NewPasswordForm token={token} />} 
            </div>
        </div>
    )
}
export default ResetPasswordPage;
