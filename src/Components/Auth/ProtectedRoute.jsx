import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../Context/AuthProvider'

const ProtectedRoute = () => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-background-a flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secundary"></div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
