import React from 'react';
import { User, Notification } from '../types';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { 
  User as UserIcon, 
  UserPlus,
  Bell, 
  ShieldAlert, 
  LogOut, 
  PlusCircle, 
  Coins,
  MessageSquare,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  notifications: Notification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onToggleChat?: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw?: () => void;
  onOpenQuickBet?: () => void;
}

export default function Navbar({
  currentUser,
  notifications,
  activeTab,
  setActiveTab,
  canGoBack = false,
  onGoBack,
  onOpenAuth,
  onLogout,
  onToggleChat,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenQuickBet
}: NavbarProps) {
  const { t, dir } = useLanguage();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8" dir={dir}>
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-emerald-400 hover:opacity-90 transition-opacity"
            id="nav-logo-btn"
          >
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {t.appName.split(' ')[0]} <span className="text-emerald-400">{t.appName.split(' ')[1] || 'AI'}</span>
            </span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'home' 
                ? 'bg-emerald-500/10 text-emerald-400 font-bold' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
            id="nav-tab-home"
          >
            {t.home}
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'events' 
                ? 'bg-emerald-500/10 text-emerald-400 font-bold' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
            id="nav-tab-events"
          >
            <Coins className="h-4 w-4 text-emerald-400" />
            <span>صفحة الرهانات</span>
          </button>

          
          {currentUser && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              id="nav-tab-dashboard"
            >
              {t.userDashboard}
            </button>
          )}

          {currentUser?.isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'admin' 
                  ? 'bg-red-500/10 text-red-400 font-bold' 
                  : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-900'
              }`}
              id="nav-tab-admin"
            >
              <ShieldAlert className="h-4 w-4" />
              {t.adminPanel}
            </button>
          )}
        </nav>

        {/* User profile, Balance, Notifications, Language Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Selector Component */}
          <LanguageSelector />

          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Virtual Balance Chip */}
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-zinc-900 px-2.5 sm:px-3 py-1.5 border border-zinc-800">
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="hidden lg:inline text-xs font-semibold text-zinc-300">{t.balance}:</span>
                <span className="text-xs sm:text-sm font-bold text-amber-400">{currentUser.balance.toLocaleString()} 🪙</span>
                <div className={`flex items-center gap-1 ${dir === 'rtl' ? 'border-r pr-2 mr-1' : 'border-l pl-2 ml-1'} border-zinc-800`}>
                  <button 
                    onClick={onOpenDeposit}
                    title={t.depositCash}
                    className="text-zinc-400 hover:text-amber-400 transition-colors"
                    id="add-coins-nav-btn"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </button>
                  {onOpenWithdraw && (
                    <button 
                      onClick={onOpenWithdraw}
                      title={t.withdrawCash}
                      className="text-zinc-400 hover:text-emerald-400 transition-colors"
                      id="withdraw-coins-nav-btn"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notification bell */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                id="notification-bell-btn"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                )}
              </button>

              {/* User Avatar & Name */}
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 text-start hover:opacity-80 transition-opacity hidden sm:flex"
                id="nav-profile-menu-btn"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="h-8 w-8 rounded-full border border-emerald-500/50 object-cover" 
                />
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-400">{t.welcome}</span>
                  <span className="text-sm font-medium text-white max-w-[100px] truncate">{currentUser.name}</span>
                </div>
              </button>

              {/* Logout button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-extrabold text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition-all cursor-pointer active:scale-95 shadow-sm"
                title={t.logout}
                id="logout-nav-btn"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t.logout}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex items-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
                }`}
                id="signup-nav-btn"
              >
                <UserPlus className="h-4 w-4 text-emerald-400" />
                <span className="hidden sm:inline">إنشاء حساب</span>
              </button>

              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 sm:px-4 py-2 text-xs sm:text-sm font-black text-zinc-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 cursor-pointer"
                id="login-register-btn"
              >
                <UserIcon className="h-4 w-4" />
                <span>{t.login}</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
