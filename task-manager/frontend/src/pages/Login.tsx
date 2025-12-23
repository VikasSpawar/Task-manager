// frontend/src/pages/Login.tsx
import {
  AlertCircle,
  ArrowRight,
  Layers,
  Loader2,
  Lock,
  Mail,
  Moon,
  Sun,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

export const Login = () => {
  const { register, handleSubmit } = useForm();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // --- Theme Logic ---
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const res = await api.post(endpoint, data);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Authentication failed. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0B0F19] flex items-center justify-center p-4 transition-colors duration-500 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] opacity-50 dark:opacity-20 mix-blend-multiply dark:mix-blend-lighten pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] opacity-50 dark:opacity-20 mix-blend-multiply dark:mix-blend-lighten pointer-events-none" />

      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:scale-110 active:scale-95 transition-all shadow-lg"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Card Container */}
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/20 border border-white/20 dark:border-gray-700/50 p-8 relative z-10 transition-all">
        
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 mb-4">
            <Layers size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
            {isRegistering ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isRegistering ? 'Join your team and start collaborating' : 'Enter your credentials to access your workspace'}
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Name Field (Register Only) */}
          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  {...register('name')} 
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-gray-800 dark:text-white placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
          )}
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                {...register('email')} 
                type="email"
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-gray-800 dark:text-white placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Password</label>
              {!isRegistering && (
                <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Forgot password?</a>
              )}
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="password"
                {...register('password')} 
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-gray-800 dark:text-white placeholder:text-gray-400"
                required
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <button 
            disabled={isLoading}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-900/10 dark:shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {isRegistering ? 'Create Account' : 'Sign In'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Guest Login Button */}
        {!isRegistering && (
          <button 
            onClick={async () => {
              setIsLoading(true);
              setErrorMsg('');
              try {
                const res = await api.post('/auth/login', {
                  email: 'Guest123@example.com',
                  password: '123456'
                });
                
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                
                navigate('/dashboard');
              } catch (error: any) {
                console.error(error);
                const msg = error.response?.data?.message || "Guest login failed. Please try again.";
                setErrorMsg(msg);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white py-3 rounded-xl font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <User size={18} />
                Continue as Guest
              </>
            )}
          </button>
        )}

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isRegistering ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMsg('');
              }}
              className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
            >
              {isRegistering ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};