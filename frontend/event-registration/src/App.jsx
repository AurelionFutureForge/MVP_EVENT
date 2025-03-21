import React from 'react'
import { Route, Routes } from 'react-router-dom';
import RegistrationForm from './pages/RegistrationForm';
import SuccessPage from './pages/SuccessPage';
import AdminScanner from './pages/AdminScanner'
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<RegistrationForm />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path='/admin/scanner' element={<AdminScanner />} />
        <Route path='/admin/login' element={<AdminLogin/> } />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}

export default App