// Example: frontend/src/hooks/useAuthStatus.ts
import { useQuery } from '@tanstack/react-query';
import { getAuthStatus } from '../api/authService'; // Adjust path

// Define a query key
const authStatusQueryKey = ['authStatus'];

export const useAuthStatus = () => {
  return useQuery({
    queryKey: authStatusQueryKey,
    queryFn: getAuthStatus,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    retry: false, // Don't retry on 401 errors
    refetchOnWindowFocus: true, // Optional: Refetch when window regains focus
  });
};

// Optional: Function to invalidate the query cache (e.g., after login/logout)
// You might call this from your login/logout functions
// import { useQueryClient } from '@tanstack/react-query';
// export const invalidateAuthStatus = () => {
//   const queryClient = useQueryClient();
//   queryClient.invalidateQueries({ queryKey: authStatusQueryKey });
// }