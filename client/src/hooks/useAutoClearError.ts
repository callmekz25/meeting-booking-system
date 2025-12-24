import { useEffect } from "react";

export const useAutoClearError = (
  error: string | null,
  clearError: () => void
) => {
  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      clearError();
    }, 5000);

    return () => clearTimeout(timer);
  }, [error, clearError]);
};