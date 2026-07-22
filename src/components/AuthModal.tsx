import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Shield } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
  onRegisterUser: (newUser: User) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  allUsers,
  onRegisterUser
}: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      // Find matching user in state list (virtually authenticated)
      const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        if (!password) {
          setError('يرجى إدخال كلمة المرور.');
          return;
        }
        const userToLogin = user.email.toLowerCase() === 'fadysoso415@gmail.com' 
          ? { ...user, isAdmin: true } 
          : user;
        onLoginSuccess(userToLogin);
        onClose();
      } else {
        setError('البريد الإلكتروني غير مسجل لدينا. يرجى إنشاء حساب جديد!');
      }
    } else {
      // Register mode
      if (!name || !email || !password) {
        setError('جميع الحقول مطلوبة لإنشاء الحساب.');
        return;
      }
      if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('هذا البريد الإلكتروني مسجل بالفعل!');
        return;
      }

      const isUserAdmin = email.toLowerCase() === 'fadysoso415@gmail.com' || email.toLowerCase().includes('admin');

      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        balance: 10, // starting balance bonus!
        isAdmin: isUserAdmin,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150`,
        createdAt: new Date().toISOString()
      };

      onRegisterUser(newUser);
      onLoginSuccess(newUser);
      onClose();
    }
  };

  // Quick select helper
  const handleQuickLogin = () => {
    const targetEmail = 'fadysoso415@gmail.com';
    const matchedUser = allUsers.find(u => u.email.toLowerCase() === targetEmail);
    if (matchedUser) {
      onLoginSuccess({ ...matchedUser, isAdmin: true });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" dir="rtl">
      <div 
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-emerald-500/5 relative"
        id="auth-modal-container"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute left-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          id="close-auth-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {isLoginMode ? 'مرحباً بعودتك! سجل الدخول لمواصلة رهاناتك الافتراضية.' : 'انضم إلينا واحصل على 10 كوينز كهدية ترحيبية!'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">الاسم الكامل</label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-3 h-5 w-5 text-zinc-500" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 pr-10 pl-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  id="auth-input-name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 h-5 w-5 text-zinc-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@stad.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 pr-10 pl-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                id="auth-input-email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-5 w-5 text-zinc-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 pr-10 pl-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                id="auth-input-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
            id="auth-submit-btn"
          >
            {isLoginMode ? 'تسجيل الدخول' : 'إنشاء الحساب'}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="text-center mt-5 text-sm">
          <span className="text-zinc-500">
            {isLoginMode ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
          </span>
          <button 
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-emerald-400 hover:underline font-medium"
            id="auth-toggle-mode-btn"
          >
            {isLoginMode ? 'أنشئ حساباً الآن' : 'سجل دخولك هنا'}
          </button>
        </div>

        {/* Quick Testing Accounts Section */}
        <div className="mt-6 pt-5 border-t border-zinc-900">
          <p className="text-center text-xs font-semibold text-zinc-500 mb-3 tracking-wider uppercase">
            ⚡ تسجيل دخول سريع للتجربة
          </p>
          <div>
            <button
              onClick={() => handleQuickLogin()}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700 transition-colors"
              id="quick-login-user"
            >
              <UserIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span>دخول سريع كـ فادي سوسو (fadysoso415@gmail.com)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
