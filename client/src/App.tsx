import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import RequestResetPage from './pages/RequestResetPage'
import ConfirmResetPage from './pages/ConfirmResetPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/layout/AppShell'
 
function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify/:token" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<RequestResetPage />} />
      <Route path="/reset-password/:token" element={<ConfirmResetPage />} />

      {/* Protected routes */}
     
      <Route element={<ProtectedRoute><AppShell /> </ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="chat" element={<DashboardPage />} />
        <Route path ="vocbulary" element={<DashboardPage />} />
    </Route>
    </Routes>
  )
}

export default App