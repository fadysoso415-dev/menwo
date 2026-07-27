import React, { useState } from 'react';
import { User } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Trophy, 
  Coins, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SignUpPageProps {
  allUsers: User[];
  onRegisterUser: (newUser: User) => void;
  onLoginSuccess: (user: User) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAuthModal: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'avatar-1', label: 'كرة القدم', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150' },
  { id: 'avatar-2', label: 'كابتن رياضات', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'avatar-3', label: 'محلل مباريات', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'avatar-4', label: 'لاعب ذهبي', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
];

export default function SignUpPage({
  allUsers,
  onRegisterUser,
  onLoginSuccess,
  onNavigateTab,
  onOpenAuthModal
}: SignUpPageProps) {
  const { dir } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);
  const [acceptTerms, setAcceptTerms] = useState(true);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanConfirm = confirmPassword.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('يرجى إدخال الاسم الكامل.');
      return;
    }

    if (!cleanEmail) {
      setError('يرجى إدخال البريد الإلكتروني.');
      return;
    }

    if (!cleanPass) {
      setError('يرجى إدخال كلمة المرور.');
      return;
    }

    if (cleanPass.length < 4) {
      setError('كلمة المرور يجب أن تتكون من 4 أحرف/أرقام على الأقل.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setError('كلمتا المرور غير متطابقتين. يرجى التأكد وإعادة المحاولة.');
      return;
    }

    if (!acceptTerms) {
      setError('يرجى الموافقة على شروط وقوانين المنصة للمتابعة.');
      return;
    }

    if (allUsers.some(u => u.email.trim().toLowerCase() === cleanEmail)) {
      setError('هذا البريد الإلكتروني مسجل بالفعل! يمكنك تسجيل الدخول مباشرة.');
      return;
    }

    setIsSubmitting(true);

    const isUserAdmin = cleanEmail === 'fadysoso415@gmail.com' || cleanEmail === 'admin@stad.com';

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      phone: cleanPhone || undefined,
      balance: 0,
      isAdmin: isUserAdmin,
      avatar: selectedAvatar,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      onRegisterUser(newUser);
      onLoginSuccess(newUser);
      setIsSubmitting(false);
      onNavigateTab(isUserAdmin ? 'admin' : 'dashboard');
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4" dir={dir}>
      
      {/* Upper Navigation back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigateTab('home')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          id="signup-back-home-btn"
        >
          {dir === 'rtl' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          <span>العودة للرئيسية</span>
        </button>

        <button
          onClick={onOpenAuthModal}
          className="text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
          id="signup-login-link-btn"
        >
          <span>لديك حساب بالفعل؟ تسجيل الدخول</span>
          <ArrowRight className="h-4 w-4 rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/5 relative overflow-hidden">
        
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Left / Info Side Banner */}
        <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-zinc-800/80 pb-6 lg:pb-0 lg:pl-8 relative z-10 space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
              <Sparkles className="h-3.5 w-3.5" />
              <span>انضم لمنصة مينوو الرياضية</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              إنشاء حساب جديد <span className="text-emerald-400">مجاناً</span> 🚀
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              احصل على حساب مراهنات رياضي متكامل واستمتع بأفضل العوائد، التحويلات السريعة عبر فودافون كاش، والتحليلات بالذكاء الاصطناعي.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { title: 'محفظة كاش فورية', desc: 'إيداع وسحب أرباحك في دقائق عبر محفظة فودافون كاش المعتمدة.' },
                { title: 'توقعات بالذكاء الاصطناعي', desc: 'احصل على احتمالات دقيقة مجاناً لكافة الدوريات العالمية.' },
                { title: 'حماية وأمان كامل', desc: 'تشفير بيانات الحساب ومعاملاتك المالية بأعلى معايير الأمان.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-2xl">
                  <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-950/40 to-zinc-900 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">مكافأة ترحيبية</span>
                <span className="text-[11px] text-amber-400 font-semibold">شحن محفظة وسحوبات فورية للمشتركين الجدد</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Form Side */}
        <div className="lg:col-span-7 relative z-10 space-y-5">
          
          <div className="text-right">
            <h2 className="text-lg font-bold text-white">بيانات الحساب الشخصي</h2>
            <p className="text-xs text-zinc-400 mt-0.5">يرجى ملء الحقول التالية لتسجيل حسابك الجديد</p>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-400 text-right font-bold flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-zinc-300 block">الاسم الكامل</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: فادي أحمد"
                  className="w-full rounded-2xl bg-zinc-900/90 border border-zinc-800 py-3 pr-10 pl-4 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  id="signup-input-name"
                />
                <UserIcon className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-zinc-300 block">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="w-full rounded-2xl bg-zinc-900/90 border border-zinc-800 py-3 pr-10 pl-4 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors dir-ltr text-right"
                  id="signup-input-email"
                />
                <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            {/* Phone Number (Vodafone Cash) */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-zinc-300 block">رقم فودافون كاش / الهاتف (اختياري)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full rounded-2xl bg-zinc-900/90 border border-zinc-800 py-3 pr-10 pl-4 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors dir-ltr text-right"
                  id="signup-input-phone"
                />
                <Phone className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-zinc-300 block">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl bg-zinc-900/90 border border-zinc-800 py-3 pr-10 pl-10 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors dir-ltr text-right"
                    id="signup-input-password"
                  />
                  <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-zinc-300 block">تأكيد كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl bg-zinc-900/90 border border-zinc-800 py-3 pr-10 pl-4 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors dir-ltr text-right"
                    id="signup-input-confirm-password"
                  />
                  <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                </div>
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="space-y-2 text-right pt-1">
              <label className="text-xs font-bold text-zinc-300 block">اختر الصورة الشخصية (الأفاتار)</label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`p-2 rounded-2xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      selectedAvatar === av.url 
                        ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30' 
                        : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="h-10 w-10 rounded-full object-cover" />
                    <span className="text-[10px] font-bold text-zinc-300 truncate max-w-full">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center gap-2 text-right pt-2">
              <input
                type="checkbox"
                id="signup-accept-terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
              />
              <label htmlFor="signup-accept-terms" className="text-xs text-zinc-400 cursor-pointer">
                أوافق على <span className="text-emerald-400 font-bold underline">شروط وأحكام منصة مينوو</span> وتأكيد الملكية.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 font-black text-sm hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-3"
              id="signup-submit-btn"
            >
              {isSubmitting ? 'جاري إنشاء الحساب وتفعيل المحفظة...' : 'إنشاء حساب جديد وتفعيل المحفظة 🚀'}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-500">
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="text-emerald-400 hover:underline font-bold"
                >
                  تسجيل الدخول هنا
                </button>
              </p>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
