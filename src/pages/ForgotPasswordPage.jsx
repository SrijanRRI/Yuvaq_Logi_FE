import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import API from '../API';
import { Mail } from 'lucide-react';

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleForgotPassword(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await axios({
        method: 'post',
        url: `${API.FORGOTPASSWORD}`,
        data: { email },
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
          
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Forgot Password</h2>
          <p className="text-gray-500 mt-1 text-center">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-5 rounded-lg mb-6 border border-green-100">
              <svg className="w-12 h-12 mx-auto mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-lg font-medium mb-2">Email Sent Successfully!</h3>
              <p>Password reset link has been sent to your email. Please check your inbox.</p>
            </div>
            <Link 
              to="/signin" 
              className="inline-block text-center w-full py-3 px-4 bg-[#ca000e] hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 shadow-md"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleForgotPassword}>
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
                {errorMessage}
              </div>
            )}
            
            <div className="relative">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="pl-10 w-full py-2.5 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
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
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center pt-4">
              <Link
                to="/signin"
                className="text-[#ca000e] hover:text-red-700 text-sm font-medium transition duration-200"
              >
                Remember your password? Sign in
              </Link>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#ca000e] font-medium hover:underline cursor-pointer"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;