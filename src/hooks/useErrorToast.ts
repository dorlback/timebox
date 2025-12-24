import { useState, useCallback } from 'react';

export const useErrorToast = () => {
  const [errorMessage, setErrorMessage] = useState('');

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  }, []);

  return { errorMessage, showError };
};