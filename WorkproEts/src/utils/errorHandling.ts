export const serializeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const createErrorMessage = (error: unknown, context?: string): string => {
  const message = serializeError(error);
  return context ? `${context}: ${message}` : message;
};