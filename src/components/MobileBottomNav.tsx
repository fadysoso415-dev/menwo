import React from 'react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Home, 
  Coins,
  User as UserIcon, 
  MessageSquare, 
  ShieldAlert, 
  ChevronRight, 
  ChevronLeft,
  LogIn,
  LogOut
} from 'lucide-react';

interface MobileBottomNavProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  onOpenQuickBet?: () => void;
}

export default function MobileBottomNav({
  currentUser,
  activeTab,
  setActiveTab,
  canGoBack = false,
  onGoBack,
  onOpenAuth,
  onLogout,
  onToggleChat,
  isChatOpen = false,
  onOpenQuickBet
}: MobileBottomNavProps) {
  const { t, dir } = useLanguage();

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-xl shadow-[0_-8px_20px_rgba(0,0,0,0.6)] safe-area-bottom transition-all duration-300"
      dir={dir}
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        
        {/* 1. Home Tab */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'home'
              ? 'text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          id="mobile-bottom-nav-home"
        >
          <Home className={`h-5 w-5 transition-transform ${activeTab === 'home' ? 'scale-110 text-emerald-400' : ''}`} />
          <span className="text-[10px] tracking-tight">{t.home}</span>
        </button>

        {/* 2. Bets Tab (صفحة الرهانات المتاحة) */}
        <button
          onClick={() => setActiveTab('events')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeTab === 'events'
              ? 'text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          id="mobile-bottom-nav-events"
        >
          <Coins className={`h-5 w-5 transition-transform ${activeTab === 'events' ? 'scale-110 text-emerald-400' : ''}`} />
          <span className="text-[10px] tracking-tight">صفحة الرهانات</span>
        </button>



        {/* 3. Go Back Button (Prominently placed when sub-pages/matches are active) */}
        {(canGoBack || activeTab !== 'home') && onGoBack && (
          <button
            onClick={onGoBack}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl bg-gradient-to-b from-emerald-500/20 to-emerald-500/10 text-emerald-400 border border-emerald-500/40 shadow-sm active:scale-90 transition-all cursor-pointer"
            id="mobile-bottom-nav-back"
            title={t.goBack}
          >
            {dir === 'rtl' ? <ChevronRight className="h-5 w-5 animate-pulse stroke-[2.5]" /> : <ChevronLeft className="h-5 w-5 animate-pulse stroke-[2.5]" />}
            <span className="text-[10px] font-black">{t.goBack}</span>
          </button>
        )}

        {/* 4. User Profile / Dashboard Tab or Login */}
        {currentUser ? (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                activeTab === 'dashboard'
                  ? 'text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              id="mobile-bottom-nav-dashboard"
            >
              <div className="relative">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className={`h-5 w-5 rounded-full object-cover border ${
                      activeTab === 'dashboard' ? 'border-emerald-400 ring-2 ring-emerald-500/30' : 'border-zinc-700'
                    }`}
                  />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </div>
              <span className="text-[10px] tracking-tight max-w-[50px] truncate">{currentUser.name.split(' ')[0]}</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex flex-col items-center justify-center gap-1 py-1 px-1.5 rounded-xl text-zinc-400 hover:text-red-400 transition-all cursor-pointer active:scale-95"
                id="mobile-bottom-nav-logout"
                title={t.logout}
              >
                <LogOut className="h-5 w-5 text-red-400/90" />
                <span className="text-[9px] font-bold text-red-400">{t.logout}</span>
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
                activeTab === 'signup'
                  ? 'text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-emerald-400'
              }`}
              id="mobile-bottom-nav-signup"
            >
              <UserIcon className="h-5 w-5 text-emerald-400" />
              <span className="text-[10px] tracking-tight">حساب جديد</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl text-zinc-400 hover:text-emerald-400 transition-all cursor-pointer active:scale-95"
              id="mobile-bottom-nav-login"
            >
              <LogIn className="h-5 w-5 text-emerald-400" />
              <span className="text-[10px] tracking-tight">{t.login}</span>
            </button>
          </>
        )}

        {/* 6. Admin Panel Tab if Admin */}
        {currentUser?.isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'admin'
                ? 'text-red-400 font-extrabold bg-red-500/10 border border-red-500/20'
                : 'text-zinc-400 hover:text-red-400'
            }`}
            id="mobile-bottom-nav-admin"
          >
            <ShieldAlert className="h-5 w-5" />
            <span className="text-[10px] tracking-tight">{t.adminPanel}</span>
          </button>
        )}

      </div>
    </div>
  );
}
