import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import AuthCallback from './pages/AuthCallback'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/dashboard" replace /> : <SignUp />} 
        />
        <Route 
          path="/signin" 
          element={user ? <Navigate to="/dashboard" replace /> : <SignIn />} 
        />
        <Route 
          path="/auth/callback" 
          element={<AuthCallback />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/signin" replace />} 
        />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/signin"} replace />} 
        />
        
        {/* Catch all */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard" : "/signin"} replace />} 
        />
      </Routes>
    </div>
  )
}

export default App
