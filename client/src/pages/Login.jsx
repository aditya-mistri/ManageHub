import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, emailLogin, register, error: authError, loading } = useAuth();
  
  // Main state management
  const [activeView, setActiveView] = useState('options'); // options, login, register
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // We only reset field-specific errors when view changes
    // But we NEVER reset the view due to errors
    setErrors({});
  }, [activeView]);

  //every 3 seconds reset the error
  useEffect(() => {
    const interval = setInterval(() => {
      setErrors(prev => ({ ...prev, general: null }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  
  // Handle auth errors from context
  useEffect(() => {
    // If there's an auth error from the context, we make sure to display it
    // but we don't change the current view
    if (authError) {
      setErrors(prev => ({ ...prev, general: authError }));
    }
  }, [authError]);
  
  // Clear specific field error when user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear just this field's error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Additional register validations
    if (activeView === 'register') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (activeView === 'register') {
        await register(formData.name, formData.email, formData.password);
        // Success: We'll let the AuthContext handle redirects
      } else {
        await emailLogin(formData.email, formData.password);
        // Success: We'll let the AuthContext handle redirects 
      }
    } catch (err) {
      const message = err?.response?.data?.message || 
                      err?.response?.data?.error || 
                      'An unexpected error occurred';
      
      // We NEVER change the view due to errors, just handle the errors appropriately
      if (message.toLowerCase().includes('email') || message.toLowerCase().includes('already exists')) {
        setErrors(prev => ({ ...prev, email: message }));
      } else if (message.toLowerCase().includes('password') || message.toLowerCase().includes('credentials')) {
        setErrors(prev => ({ ...prev, password: message }));
      } else {
        // General error
        setErrors(prev => ({ ...prev, general: message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle Google authentication
  const handleGoogleLogin = () => {
    try {
      login();
      // Google login is handled by AuthContext, we don't need to change views
    } catch (err) {
      // We stay on the options page and just show the error
      setErrors({ general: 'Failed to login with Google. Please try again.' });
    }
  };
  
  // Render input field with error handling
  const renderInput = (type, name, label, placeholder) => {
    const isPasswordField = type === 'password';
    
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
        <div className={`relative ${errors[name] ? 'mb-1' : 'mb-3'}`}>
          <input
            type={isPasswordField && showPassword ? 'text' : type}
            id={name}
            name={name}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            className={`w-full bg-gray-700 border ${
              errors[name] ? 'border-red-500' : 'border-gray-600'
            } text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200`}
          />
          {isPasswordField && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </div>
        {errors[name] && (
          <p className="text-red-500 text-xs italic mt-1">{errors[name]}</p>
        )}
      </div>
    );
  };
  
  // Option selection view
  const renderOptionsView = () => (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
      <p className="text-gray-400 text-sm mb-8">Choose your preferred login method</p>
      
      <div className="space-y-4">
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-md flex items-center justify-center transition duration-300 font-medium border border-gray-600"
          disabled={loading}
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
          onClick={() => setActiveView('login')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md transition duration-300 font-medium"
        >
          Continue with Email
        </button>
      </div>
      
      {errors.general && (
        <div className="mt-6 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md text-sm">
          {errors.general}
        </div>
      )}
    </>
  );

  // Login view
  const renderLoginView = () => (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
      <p className="text-gray-400 text-sm mb-8">Enter your credentials to continue</p>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        {renderInput('email', 'email', 'Email', 'your@email.com')}
        {renderInput('password', 'password', 'Password', '••••••••')}
        
        <div className="flex justify-between items-center mt-2 mb-6">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
              Remember me
            </label>
          </div>
          
          <button
            type="button"
            className="text-indigo-400 text-sm hover:text-indigo-300 hover:underline transition duration-300"
          >
            Forgot Password?
          </button>
        </div>
        
        {(errors.general || authError) && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md text-sm mb-4">
            {errors.general || authError}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium transition duration-300"
          disabled={isSubmitting || loading}
        >
          {(isSubmitting || loading) ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
        
        <div className="flex items-center justify-between pt-5">
          <button
            type="button"
            className="flex items-center text-gray-500 hover:text-gray-300 text-sm transition duration-300"
            onClick={() => setActiveView('options')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <button
            type="button"
            className="text-indigo-400 hover:text-indigo-300 hover:underline text-sm font-medium transition duration-300"
            onClick={() => setActiveView('register')}
          >
            Create Account
          </button>
        </div>
      </form>
    </>
  );
  
  // Register view
  const renderRegisterView = () => (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
      <p className="text-gray-400 text-sm mb-8">Fill in your details to get started</p>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        {renderInput('text', 'name', 'Full Name', 'John Doe')}
        {renderInput('email', 'email', 'Email', 'your@email.com')}
        {renderInput('password', 'password', 'Password', '••••••••')}
        {renderInput('password', 'confirmPassword', 'Confirm Password', '••••••••')}
        
        {(errors.general || authError) && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md text-sm mb-4">
            {errors.general || authError}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium transition duration-300 mt-6"
          disabled={isSubmitting || loading}
        >
          {(isSubmitting || loading) ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
        
        <div className="flex items-center justify-between pt-5">
          <button
            type="button"
            className="flex items-center text-gray-500 hover:text-gray-300 text-sm transition duration-300"
            onClick={() => setActiveView('options')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <button
            type="button"
            className="text-indigo-400 hover:text-indigo-300 hover:underline text-sm font-medium transition duration-300"
            onClick={() => setActiveView('login')}
          >
            Sign In Instead
          </button>
        </div>
      </form>
    </>
  );
  
  // Render the appropriate view based on state
  const renderActiveView = () => {
    switch (activeView) {
      case 'login':
        return renderLoginView();
      case 'register':
        return renderRegisterView();
      default:
        return renderOptionsView();
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        {renderActiveView()}
      </div>
    </div>
  );
};

export default Login;