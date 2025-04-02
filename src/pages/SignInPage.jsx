import React, { useState } from 'react';
import InputField from '../components/InputField';
import { useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  // const [userType, setUserType] = useState('RR');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in", { ...form});
    // Call your login API here

    // // Simulate login and redirect
    // if (userType === 'RR') {
    //   navigate('/rr/dashboard', { state: { name: 'RR User Name', phone: form.phone } });
    // } else {
    //   navigate('/customer/dashboard', { state: { name: 'Customer Name', phone: form.phone } });
    // }

    // alert("Logged in as ");
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const res = await fetch('https://your-api-endpoint.com/api/signin', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(form)
  //     });

  //     const data = await res.json();

  //     if (res.ok) {
  //       const { name, role } = data;

  //       if (role === 'user') {
  //         navigate('/rr/dashboard', { state: { name } });
  //       } else if (role === 'admin') {
  //         navigate('/admin/dashboard', { state: { name } });
  //       } else if (role === 'transportUser') {
  //         navigate('/customer/dashboard', { state: { name } });
  //       } else {
  //         alert('Unknown role.');
  //       }
  //     } else {
  //       alert(data.message || 'Invalid credentials');
  //     }
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     alert('Something went wrong. Please try again later.');
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

        <form onSubmit={handleSubmit}>
          <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          <InputField label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="******" />

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Don’t have an account?{' '}
          <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/signup')}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
