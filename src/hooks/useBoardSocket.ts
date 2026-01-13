import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getToken } from '../services/auth-service';
import socketService from '../services/socket-service';

export default function useBoardSocket(): void {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    try {
      if (!isAuthenticated) {
        socketService.disconnect();
        return;
      }

      const token = getToken();
      if (token) socketService.connect(token);

      return () => {
        socketService.disconnect();
      };
    } catch (error) {
      console.error('useBoardSocket:', error);
    }
  }, [isAuthenticated]);
}
