import {Routes, Route} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage';
import RequestResetPage from './pages/RequestResetPage';
import ConfirmResetPage from './pages/ConfirmResetPage';


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify/:token" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<RequestResetPage />} />
      <Route path="/reset-password/:token" element={<ConfirmResetPage />} />
      
    </Routes>

  )
}

export default App