import { useQuery, useMutation, QueryKey } from 'react-query';
import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:5001/api';

interface ApiError {
  message: string;
  success?: boolean;
}

const handleError = (error: unknown, endpoint: string): never => {
  const errorMessage = error instanceof AxiosError 
    ? error.response?.data?.message || error.message
    : 'An error occurred';
  
  console.error(`API Error (${endpoint}):`, errorMessage);
  throw new Error(errorMessage);
};

export const useApiQuery = <T>(
  key: QueryKey,
  endpoint: string,
  options = {}
) => {
  return useQuery<T, Error>(
    key,
    async () => {
      try {
        const { data } = await axios.get(`${API_URL}${endpoint}`);
        return data;
      } catch (error) {
        return handleError(error, endpoint);
      }
    },
    options
  );
};

export const useApiMutation = <T, V>(
  endpoint: string,
  options = {}
) => {
  return useMutation<T, Error, V>(
    async (variables) => {
      try {
        const { data } = await axios.post(`${API_URL}${endpoint}`, variables);
        return data;
      } catch (error) {
        return handleError(error, endpoint);
      }
    },
    options
  );
};