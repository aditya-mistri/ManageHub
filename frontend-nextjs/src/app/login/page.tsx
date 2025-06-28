'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isAuthenticated, error, clearError } = useAuthStore();
  
  const [activeView, setActiveView] = useState<'options' | 'login' | 'register'>('options');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setErrors({});
  }, [activeView]);

  useEffect(() => {
    if (error) {
      setErrors(prev => ({ ...prev, general: error }));
      const timer = setTimeout(() => {
        clearError();
        setErrors(prev => ({ ...prev, general: '' }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (activeView === 'register') {
        await register(formData.name, formData.email, formData.password);
        toast.success('Account created successfully!');
      } else {
        await login(formData.email, formData.password);
        toast.success('Logged in successfully!');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 
                      err?.response?.data?.error || 
                      'An unexpected error occurred';
      
      if (message.toLowerCase().includes('email') || message.toLowerCase().includes('already exists')) {
        setErrors(prev => ({ ...prev, email: message }));
      } else if (message.toLowerCase().includes('password') || message.toLowerCase().includes('credentials')) {
        setErrors(prev => ({ ...prev, password: message }));
      } else {
        setErrors(prev => ({ ...prev, general: message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`;
  };

  const renderInput = (type: string, name: string, label: string, placeholder: string) => {
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
            value={formData[name as keyof typeof formData]}
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
              {showPassword ? '🙈' : '👁️'}
            </button>
          )}
        </div>
        {errors[name] && (
          <p className="text-red-500 text-xs italic mt-1">{errors[name]}</p>
        )}
      </div>
    );
  };

  const renderOptionsView = () => (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
      <p className="text-gray-400 text-sm mb-8">Choose your preferred login method</p>
      
      <div className="space-y-4">
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-md flex items-center justify-center transition duration-300 font-medium border border-gray-600"
        >
          <span className="mr-2">🔍</span>
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

  const renderLoginView = () => (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
      <p className="text-gray-400 text-sm mb-8">Enter your credentials to continue</p>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        {renderInput('email', 'email', 'Email', 'your@email.com')}
        {renderInput('password', 'password', 'Password', '••••••••')}
        
        {errors.general && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md text-sm mb-4">
            {errors.general}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium transition duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
        
        <div className="flex items-center justify-between pt-5">
          <button
            type="button"
            className="flex items-center text-gray-500 hover:text-gray-300 text-sm transition duration-300"
            onClick={() => setActiveView('options')}
          >
            ← Back
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

  const renderRegisterView = () => (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
      <p className="text-gray-400 text-sm mb-8">Fill in your details to get started</p>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        {renderInput('text', 'name', 'Full Name', 'John Doe')}
        {renderInput('email', 'email', 'Email', 'your@email.com')}
        {renderInput('password', 'password', 'Password', '••••••••')}
        {renderInput('password', 'confirmPassword', 'Confirm Password', '••••••••')}
        
        {errors.general && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md text-sm mb-4">
            {errors.general}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium transition duration-300 mt-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="flex items-center justify-between pt-5">
          <button
            type="button"
            className="flex items-center text-gray-500 hover:text-gray-300 text-sm transition duration-300"
            onClick={() => setActiveView('options')}
          >
            ← Back
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
}