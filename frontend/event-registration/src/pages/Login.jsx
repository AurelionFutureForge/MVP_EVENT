import React, { useState } from 'react';
import PrivilegeLogin from './PrivilegeLogin';
import AdminRegister from './AdminRegister';

const Login = () => {
  const [loginType, setLoginType] = useState('privilege');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-300 via-white-200 to-indigo-500">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl px-10 py-12 w-full max-w-2xl transition-all duration-300">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-tight">
          Login Portal
        </h2>

        <form className="space-y-6">
          <div>
            <label htmlFor="login-select" className="block text-base font-medium text-gray-700 mb-2">
              Select Login Type
            </label>
            <select
              id="login-select"
              value={loginType}
              onChange={(e) => setLoginType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            >
              <option value="privilege">Privilege Login</option>
              <option value="admin">Admin Register</option>
            </select>
          </div>
        </form>

        <div className="mt-8">
          {loginType === 'privilege' ? <PrivilegeLogin /> : <AdminRegister />}
        </div>
      </div>
    </div>
  );
};

export default Login;
