import { useState, useCallback } from 'react';

export interface FormState<T = Record<string, unknown>> {
  data: T;
  isLoading: boolean;
  error: string | null;
}

export function useFormState<T>(initialData: T) {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    isLoading: false,
    error: null
  });

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      error: null // Clear error when user starts typing
    }));
  }, []);

  const updateData = useCallback((newData: Partial<T>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...newData }
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null
    });
  }, [initialData]);

  return {
    ...state,
    updateField,
    updateData,
    setLoading,
    setError,
    reset
  };
}