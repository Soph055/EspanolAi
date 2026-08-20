import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import RequestResetPage from './pages/RequestResetPage'
import ConfirmResetPage from './pages/ConfirmResetPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import ChatPage from './pages/ChatPage'
import VocabularyPage from './pages/VocabularyPage'
import QuizPage from './pages/QuizPage'

 
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
        <Route path="chat" element={<ChatPage />} />
        <Route path ="vocabulary" element={<VocabularyPage />} />
        <Route path ="quiz" element={<QuizPage />} />
    </Route>
    </Routes>
  )
}

export default App