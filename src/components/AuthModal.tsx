import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Shield, Eye, EyeOff, Sparkles, Gift, CheckCircle2, Trophy, Coins, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
  onRegisterUser: (newUser: User) => void;
}

const AVATAR_OPTIONS = [
  { id: 'avatar-1', label: 'كرة القدم', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150' },
  { id: 'avatar-2', label: 'كابتن رياضات', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'avatar-3', label: 'محلل مباريات', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'avatar-4', label: 'لاعب ذهبي', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
];

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
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);
  const [favSport, setFavSport] = useState('football');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      // Find matching user in state list
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
        setError('البريد الإلكتروني غير مسجل لدينا. يرجى إنشاء حساب جديد للانضمام المنصة!');
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

      // Initial 0 coins balance for new users
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        balance: 0,
        isAdmin: isUserAdmin,
        avatar: selectedAvatar,
        createdAt: new Date().toISOString()
      };

      onRegisterUser(newUser);
      onLoginSuccess(newUser);
      onClose();
    }
  };

  // Quick select helper
  const handleQuickLogin = (targetEmail = 'fadysoso415@gmail.com') => {
    const matchedUser = allUsers.find(u => u.email.toLowerCase() === targetEmail);
    if (matchedUser) {
      onLoginSuccess({ ...matchedUser, isAdmin: targetEmail === 'fadysoso415@gmail.com' });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" dir="rtl">
      <div 
        className="w-full max-w-lg rounded-3xl border border-emerald-500/20 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 relative overflow-hidden max-h-[92vh] overflow-y-auto"
        id="auth-modal-container"
      >
        {/* Glowing Top Ambient Backlight */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-24 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute left-4 top-4 rounded-xl p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors z-10"
          id="close-auth-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Welcome Header Banner */}
        {!isLoginMode && (
          <div className="mb-6 bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-xs mb-1">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>منصة التوقعات الرياضية الذكية</span>
            </div>
            <p className="text-sm sm:text-base font-black text-white flex items-center justify-center gap-1.5">
              <span>أنشئ حسابك واستمتع بأعلى العوائد وأسرع سحب كاش 🚀</span>
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">يمكنك شحن رصيدك بسهولة عبر فودافون كاش ومتابعة أودز المباريات الحية</p>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="flex bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => { setIsLoginMode(true); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              isLoginMode 
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
            id="auth-tab-login"
          >
            <UserIcon className="h-4 w-4" />
            <span>تسجيل الدخول</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginMode(false); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              !isLoginMode 
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
            id="auth-tab-register"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>حساب جديد ✨</span>
          </button>
        </div>

        {/* Sub Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>{isLoginMode ? 'مرحباً بعودتك إلى منصة مينوو' : 'انضم إلى مجتمع التوقعات الأكبر'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {isLoginMode 
              ? 'سجل دخولك لمتابعة محفظتك وقسائم الرهانات المفتوحة والعوائد.' 
              : 'أنشئ حسابك في ثوانٍ واستمتع بأعلى أودز وأسرع عمليات شحن وسحب.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 text-center font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">الاسم الكامل أو اسم اللقب</label>
                <div className="relative">
                  <UserIcon className="absolute right-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: أحمد المحلل الرياضي"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pr-10 pl-4 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="auth-input-name"
                  />
                </div>
              </div>

              {/* Avatar Options Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">اختر الصورة الرمزية لحسابك</label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      type="button"
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        selectedAvatar === av.url 
                          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 scale-105' 
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="text-[10px] text-zinc-400 font-semibold">{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@example.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pr-10 pl-4 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                id="auth-input-email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pr-10 pl-10 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                id="auth-input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-500 py-3.5 text-xs sm:text-sm font-black text-zinc-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
            id="auth-submit-btn"
          >
            <span>{isLoginMode ? 'تسجيل الدخول ومتابعة الرهانات' : 'تأكيد التسجيل واستلام 500 كوينز 🎁'}</span>
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
        </form>

        {/* Benefits Cards for High Conversion */}
        <div className="mt-6 grid grid-cols-3 gap-2 pt-4 border-t border-zinc-900 text-center">
          <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-900">
            <Coins className="h-4 w-4 text-amber-400 mx-auto mb-1" />
            <p className="text-[10px] font-bold text-white">سحب فورى</p>
            <p className="text-[9px] text-zinc-500">فودافون كاش</p>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-900">
            <Sparkles className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[10px] font-bold text-white">تحليل AI</p>
            <p className="text-[9px] text-zinc-500">أعلى دقة أودز</p>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-900">
            <Trophy className="h-4 w-4 text-blue-400 mx-auto mb-1" />
            <p className="text-[10px] font-bold text-white">رهانات عامة</p>
            <p className="text-[9px] text-zinc-500">تحدى اللاعبين</p>
          </div>
        </div>

        {/* Quick Testing Accounts Section */}
        <div className="mt-5 pt-4 border-t border-zinc-900">
          <p className="text-center text-[10px] font-black text-zinc-500 mb-2.5 tracking-wider uppercase flex items-center justify-center gap-1">
            <span>⚡ تسجيل دخول سريع وتجربة فورية</span>
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleQuickLogin('fadysoso415@gmail.com')}
              className="w-full flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:border-emerald-500/50 transition-all group"
              id="quick-login-user"
            >
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white">دخول كـ مسؤول النظام (fadysoso415@gmail.com)</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">مدير 🛡️</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

