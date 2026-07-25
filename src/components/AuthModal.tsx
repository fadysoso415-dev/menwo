import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Shield, Eye, EyeOff, Sparkles, Trophy, Coins, ArrowLeft, Phone, ShieldCheck } from 'lucide-react';
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
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotMsg(false);

    if (isLoginMode) {
      // Find matching user in state list
      const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        if (!password) {
          setError('يرجى إدخال كلمة المرور لدخول حسابك.');
          return;
        }
        const userToLogin = user.email.toLowerCase() === 'fadysoso415@gmail.com' 
          ? { ...user, isAdmin: true } 
          : user;
        onLoginSuccess(userToLogin);
        onClose();
      } else {
        setError('عفواً، البريد الإلكتروني غير مسجل. يمكنك إنشاء حساب جديد مجاناً!');
      }
    } else {
      // Register mode
      if (!name || !email || !password) {
        setError('جميع الحقول الأساسية مطلوبة لإنشاء الحساب.');
        return;
      }
      if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('هذا البريد الإلكتروني مسجل بالفعل لدينا! حاول تسجيل الدخول.');
        return;
      }

      const isUserAdmin = email.toLowerCase() === 'fadysoso415@gmail.com' || email.toLowerCase().includes('admin');

      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        phone: phone || undefined,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md transition-all duration-300" dir="rtl">
      <div 
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 relative overflow-hidden max-h-[92vh] overflow-y-auto"
        id="auth-modal-container"
      >
        {/* Glow ambient radial backgrounds */}
        <div className="absolute -top-20 right-1/2 translate-x-1/2 w-72 h-40 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Top Header Row with Close */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg">
              ⚽
            </div>
            <div>
              <span className="font-black text-white text-base tracking-wide block">منصة مينوو</span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> آمنة وموثوقة 100%
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all border border-zinc-800/80"
            id="close-auth-modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher (Login / Register) */}
        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800/90 mb-6 relative z-10 shadow-inner">
          <button
            type="button"
            onClick={() => { setIsLoginMode(true); setError(''); setForgotMsg(false); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              isLoginMode 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/25 font-black' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
            id="auth-tab-login"
          >
            <UserIcon className="h-4 w-4" />
            <span>تسجيل الدخول</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsLoginMode(false); setError(''); setForgotMsg(false); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              !isLoginMode 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/25 font-black' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
            id="auth-tab-register"
          >
            <Sparkles className="h-4 w-4 text-amber-950" />
            <span>إنشاء حساب جديد</span>
          </button>
        </div>

        {/* Sub Header Intro */}
        <div className="text-right mb-5 relative z-10">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {isLoginMode ? 'مرحباً بك مجدداً! 👋' : 'انضم إلى مجتمع كبار المراهنين 🚀'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            {isLoginMode 
              ? 'أدخل بيانات حسابك للوصول إلى محفظتك وقسائم الرهان المباشرة.' 
              : 'أنشئ حسابك الآن واستمتع بسحب وإيداع سريع فوراً عبر فودافون كاش.'}
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 text-right font-bold flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Forgot Password Message */}
        {forgotMsg && (
          <div className="mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-300 text-right font-bold">
            💡 لتغيير كلمة المرور الخاصة بحسابك، يرجى التواصل مع الدعم الفني عبر الواتساب أو أدمن المنصة.
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLoginMode && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 text-right">
                  الاسم الكامل أو النيك نيم <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute right-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: أحمد المراهن الذهبي"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2.5 pr-10 pl-4 text-xs text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-bold"
                    id="auth-input-name"
                  />
                </div>
              </div>

              {/* Vodafone Cash Phone Number */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 text-right flex items-center justify-between">
                  <span>رقم الهاتف / فودافون كاش (اختياري)</span>
                  <span className="text-[10px] text-emerald-400 font-bold">لسرعة السحب ⚡</span>
                </label>
                <div className="relative">
                  <Phone className="absolute right-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2.5 pr-10 pl-4 text-xs text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-mono font-bold"
                    id="auth-input-phone"
                  />
                </div>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 text-right">
                  اختر أيقونة أفتار لحسابك
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      type="button"
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        selectedAvatar === av.url 
                          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 scale-105' 
                          : 'border-zinc-800/80 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-9 h-9 rounded-lg object-cover" />
                      <span className="text-[9px] text-zinc-400 font-bold">{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 text-right">
              البريد الإلكتروني <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute right-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2.5 pr-10 pl-4 text-xs text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-bold"
                id="auth-input-email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-300 text-right">
                كلمة المرور <span className="text-red-400">*</span>
              </label>
              {isLoginMode && (
                <button
                  type="button"
                  onClick={() => setForgotMsg(true)}
                  className="text-[11px] text-emerald-400 hover:underline font-bold"
                >
                  نسيت كلمة المرور؟
                </button>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute right-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2.5 pr-10 pl-10 text-xs text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-bold"
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

          {/* Remember Me Option */}
          {isLoginMode && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-zinc-200">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-800 text-emerald-500 focus:ring-emerald-500/20 h-4 w-4"
                />
                <span className="font-bold">تذكر بيانات تسجيل الدخول</span>
              </label>
            </div>
          )}

          {/* Action Submit Button */}
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 py-3.5 text-xs sm:text-sm font-black text-zinc-950 hover:brightness-110 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
            id="auth-submit-btn"
          >
            <span>{isLoginMode ? 'دخول المنصة الآن' : 'تأكيد حسابي والانضمام'}</span>
            <ArrowLeft className="h-4 w-4" />
          </button>
        </form>

        {/* Alternative Bottom Toggle */}
        <div className="mt-6 pt-4 border-t border-zinc-900 text-center relative z-10">
          <p className="text-xs text-zinc-400 font-bold">
            {isLoginMode ? 'ليس لديك حساب حتى الآن؟' : 'لديك حساب بالفعل؟'}
            <button
              type="button"
              onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setForgotMsg(false); }}
              className="mr-1.5 text-emerald-400 font-black hover:underline"
            >
              {isLoginMode ? 'إنشاء حساب جديد مجاناً' : 'تسجيل الدخول مباشرة'}
            </button>
          </p>
        </div>

        {/* Trust & Guarantee Badges Footer */}
        <div className="mt-5 grid grid-cols-3 gap-2 pt-3 text-center border-t border-zinc-900/60">
          <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
            <Coins className="h-3.5 w-3.5 text-amber-400 mx-auto mb-0.5" />
            <p className="text-[10px] font-bold text-white">سحب كاش</p>
            <p className="text-[8px] text-zinc-500">فوري بأي وقت</p>
          </div>

          <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 mx-auto mb-0.5" />
            <p className="text-[10px] font-bold text-white">أعلى أودز</p>
            <p className="text-[8px] text-zinc-500">مباريات مباشرة</p>
          </div>

          <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
            <Trophy className="h-3.5 w-3.5 text-blue-400 mx-auto mb-0.5" />
            <p className="text-[10px] font-bold text-white">دعم 24/7</p>
            <p className="text-[8px] text-zinc-500">خدمة عملاء</p>
          </div>
        </div>

      </div>
    </div>
  );
}

