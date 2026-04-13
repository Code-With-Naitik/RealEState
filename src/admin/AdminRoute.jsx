import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/auth_Context.jsx';

export default function AdminRoute() {
    const { admin, loading } = useAuth(); // Check 'admin' instead of 'user'

    if (loading) return null;

    if (!admin) {
        return <Navigate to="/admin/signin" />;
    }

    return <Outlet />;
}