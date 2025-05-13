import React, { useState } from 'react';
import PrivilegeLogin from './PrivilegeLogin';
import AdminLogin from './AdminLogin';

const Login = () => {
  const [loginType, setLoginType] = useState('privilege');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login Portal</h2>

        <form className="space-y-4">
          <div>
            <label htmlFor="login-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Login Type:
            </label>
            <select
              id="login-select"
              value={loginType}
              onChange={(e) => setLoginType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-300"
            >
              <option value="privilege">Privilege Login</option>
              <option value="admin">Admin Registration</option>
            </select>
          </div>
        </form>

        <div className="mt-6">
          {loginType === 'privilege' ? <PrivilegeLogin /> : <AdminRegistartion />}
        </div>
      </div>
    </div>
  );
};

export default Login;
