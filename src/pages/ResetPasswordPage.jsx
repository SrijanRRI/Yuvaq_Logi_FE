import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import API from "../API";
import { Lock, Eye, EyeOff } from 'lucide-react';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState({
    password: "",
    confirmPassword: ""
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  async function handleResetPassword(e) {
    e.preventDefault();
    
    if (password.password !== password.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await axios({
        method: "post",
        url: `${API.RESETPASSWORD}` + token,
        data: password
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-8">
          {/* Logo */}
          <div className="w-60 h-24 flex items-center justify-center">
            <img
              src="/assets/LogiYatraLogo.png"
              alt="LogiYatra Logo"
              className="w-60 h-28 object-contain"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Reset Password</h2>
          <p className="text-gray-500 mt-1 text-center">
            Create a new password for your account
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-5 rounded-lg mb-6 border border-green-100">
              <svg className="w-12 h-12 mx-auto mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-lg font-medium mb-2">Password Reset Successful!</h3>
              <p>Your password has been reset successfully. You can now sign in with your new password.</p>
            </div>
            <Link 
              to="/signin" 
              className="inline-block text-center w-full py-3 px-4 bg-[#ca000e] hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 shadow-md"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleResetPassword}>
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
                {errorMessage}
              </div>
            )}
            
            <div className="relative">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password.password}
                  onChange={(e) => setPassword({ ...password, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength="8"
                  className="pl-10 w-full py-2.5 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
            </div>

            <div className="relative">
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={password.confirmPassword}
                  onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength="8"
                  className="pl-10 w-full py-2.5 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 text-gray-500 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 flex items-center justify-center rounded-lg font-medium transition duration-200 shadow-md ${
                loading 
                  ? 'bg-red-300 cursor-not-allowed' 
                  : 'bg-[#ca000e] hover:bg-red-700'
              } text-white`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 border-2 border-t-transparent border-white rounded-full"
                    viewBox="0 0 24 24"
                  />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="text-center pt-4">
              <Link
                to="/signin"
                className="text-[#ca000e] hover:text-red-700 text-sm font-medium transition duration-200"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;