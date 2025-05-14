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
import ProtectedEventRoute from './pages/ProtectedEventRoute';
import ProtectedPrivilege from './pages/ProtectedPrivilege';
import ManageAccess from './pages/ManageAccess';
import PrivilegeLogin from './pages/PrivilegeLogin';
import PrivilegeDashboard from './pages/PrivilegeDashboard';
import EditEvent from './pages/EditEvent';
import EventLogin from './pages/EventLogin';
import CreateRegistrationForm from './pages/CreateRegistrationForm';
import EventList from './pages/EventList';
import ManualReg from './pages/ManualReg';
import Login from './pages/Login';
import PaymentSuccess from './pages/PaymentSuccess';


const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register/:eventID' element={<RegistrationForm />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/admin/scanner" element={<ProtectedPrivilege> <AdminScanner /> </ProtectedPrivilege>} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin/dashboard/:eventId' element={<ProtectedRoute> <AdminDashboard /> </ ProtectedRoute>} />
        <Route path='/create-event' element={<ProtectedEventRoute> <EventCreation />  </ProtectedEventRoute>} />
        <Route path='/admin/manage-access' element={<ManageAccess />} />
        <Route path='/privilege-login' element={<PrivilegeLogin />} />
        <Route path="/privilege/dashboard" element={<PrivilegeDashboard />} />
        <Route path='/edit-event/:eventId' element={<EditEvent />} />
        <Route path='/event-login' element={<EventLogin />} />
        <Route path='/create-regform' element={<ProtectedRoute> <CreateRegistrationForm /> </ ProtectedRoute>} />
        <Route path='event-list' element={<ProtectedRoute> <EventList/> </ ProtectedRoute>} />
        <Route path='/manual-registration' element={<ProtectedRoute> <ManualReg /> </ ProtectedRoute>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/payment-success' element={<PaymentSuccess/>} />
        
      </Routes>
    </div>
  );
};

export default App;
