import React from 'react';
import { Route, Routes } from 'react-router-dom';
import RegistrationForm from './pages/RegistrationForm';
import SuccessPage from './pages/SuccessPage';
import AdminScanner from './pages/AdminScanner';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import EventCreation from './pages/EventCreation';
import AdminRegister from './pages/AdminRegister'
import ProtectedRoute from './pages/ProtectedRoute';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register/:companyName/:eventName' element={<RegistrationForm />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/admin/scanner" element={<ProtectedRoute> <AdminScanner /> </ProtectedRoute>} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/create-event' element={<EventCreation />} />
      </Routes>
    </div>
  );
};

export default App;
