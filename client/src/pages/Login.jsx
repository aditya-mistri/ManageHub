import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, emailLogin, register, error, loading } = useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState(null);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError(null); // Clear error on input change
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLocalError(null);

    try {
      if (isRegister) {
        if (!formData.name || !formData.email || !formData.password) {
          setLocalError('All fields are required');
          return;
        }
        await register(formData.name, formData.email, formData.password);
      } else {
        if (!formData.email || !formData.password) {
          setLocalError('Email and password are required');
          return;
        }
        await emailLogin(formData.email, formData.password);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'An unexpected error occurred. Please try again.';
      setLocalError(msg);
    }
  };

  useEffect(() => {
    // Reset errors when switching form types
    setLocalError(null);
  }, [showEmailForm, isRegister]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            {showEmailForm ? (isRegister ? 'Create Account' : 'Welcome Back') : 'Authentication'}
          </h1>
          <p className="text-gray-400 text-sm">
            {showEmailForm 
              ? (isRegister 
                ? 'Fill in your details to get started' 
                : 'Enter your credentials to continue') 
              : 'Choose your preferred login method'}
          </p>
        </div>

        {!showEmailForm && (
          <div className="space-y-4">
            <button
              onClick={login}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-md flex items-center justify-center transition duration-300 font-medium border border-gray-600"
            >
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              </span>
              Continue with Google
            </button>
            
            <div className="flex items-center justify-center my-6">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md transition duration-300 font-medium"
            >
              Continue with Email
            </button>
          </div>
        )}

        {showEmailForm && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isRegister && (
              <div className="flex justify-end">
                <button type="button" className="text-indigo-400 text-sm hover:text-indigo-300 hover:underline transition duration-300">
                  Forgot Password?
                </button>
              </div>
            )}

            {(localError || error) && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md text-sm">
                {localError || error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium transition duration-300 mt-6"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </button>

            <div className="text-center text-gray-400 text-sm mt-6">
              {isRegister ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
              <button
                type="button"
                className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium transition duration-300"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? 'Sign In' : 'Create Account'}
              </button>
            </div>

            <div className="text-center mt-6">
              <button
                type="button"
                className="text-gray-500 text-sm hover:text-gray-300 transition duration-300 flex items-center justify-center mx-auto"
                onClick={() => {
                  setShowEmailForm(false);
                  setIsRegister(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to login options
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
