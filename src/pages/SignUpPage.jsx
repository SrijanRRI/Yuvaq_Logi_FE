import React, { useState } from 'react';
import InputField from '../components/InputField';
import UserToggle from '../components/UserToggle';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [userType, setUserType] = useState('RR'); // UI toggle state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getRoleFromUserType = (type) => {
    if (type === 'Customer') return 'transportUser';
    return 'user'; // Default RR User or Admin handled via backend check
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const role = getRoleFromUserType(userType);
    const payload = {...form , role};

    console.log("Registering", payload);
    // Call your signup API here

    navigate('/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

        <UserToggle userType={userType} setUserType={setUserType} />

        <form onSubmit={handleSubmit}>
          <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
          <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="johndoe@example.com" />
          <InputField label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="******" />
          <InputField label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="******" />

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/signin')}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
