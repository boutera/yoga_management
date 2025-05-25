import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

declare const ProtectedRoute: React.FC<ProtectedRouteProps>;

export default ProtectedRoute; 