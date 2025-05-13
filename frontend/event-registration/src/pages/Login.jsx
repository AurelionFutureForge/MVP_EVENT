import React, { useState } from 'react';
import PrivilegeLogin from './PrivilegeLogin';
import AdminLogin from './AdminLogin';

const Login = () => {
  const [loginType, setLoginType] = useState('privilege'); // default option

  return (
    <div className="p-4">
      <form>
        <label htmlFor="login-select" className="block mb-2 text-sm font-medium">
          Select Login Type:
        </label>
        <select
          id="login-select"
          value={loginType}
          onChange={(e) => setLoginType(e.target.value)}
          className="border rounded p-2 mb-4"
        >
          <option value="privilege">Privilege Login</option>
          <option value="admin">Admin Login</option>
        </select>
      </form>

      {/* Conditionally render the login components */}
      {loginType === 'privilege' ? <PrivilegeLogin /> : <AdminLogin />}
    </div>
  );
};

export default Login;
