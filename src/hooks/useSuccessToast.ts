import { useState, useCallback } from 'react';

export const useSuccessToast = () => {
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  return { successMessage, showSuccess };
};