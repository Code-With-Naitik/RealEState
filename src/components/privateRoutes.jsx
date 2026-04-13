import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/auth_Context.jsx';

export default function PrivateRoute() {
    const { user } = useAuth();
    return user ? <Outlet /> : <Navigate to="/sign-in" />;
}