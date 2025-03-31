// Example: frontend/src/api/authService.ts
import apiClient from './client';
import { AuthStatusResponse } from '../types'; // Adjust path if needed

export const getAuthStatus = async (): Promise<AuthStatusResponse> => {
  try {
    // Assuming the route is /api/auth/status based on handlers.go
    const response = await apiClient.get<AuthStatusResponse>('/auth/status');
    return response.data;
  } catch (error: any) {
    // Handle cases where the user is not authenticated (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // The backend already sends { authenticated: false } on 401
      // but we can return a default structure just in case
      return { authenticated: false };
    }
    // Re-throw other errors
    console.error("Error fetching auth status:", error);
    throw error; // Let React Query handle the error state
  }
}; // End of getAuthStatus function

// Function to call the backend logout endpoint
export const logoutUser = async (): Promise<void> => {
  try {
    // Backend route is POST /api/logout
    await apiClient.post('/logout');
    // Backend handles session clearing and redirect, but we might not see the redirect effect via axios.
    // We'll handle UI updates/redirects in the mutation's onSuccess.
  } catch (error) {
    console.error("Error logging out:", error);
    // Re-throw error to be handled by useMutation
    throw error;
  }
}; // End of logoutUser function