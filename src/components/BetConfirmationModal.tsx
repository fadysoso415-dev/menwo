import React from 'react';
import { Bet, Match } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, Trophy, Coins, ChevronLeft, ChevronRight, ShieldCheck, Flame, Wallet, Sparkles, X } from 'lucide-react';

interface BetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bet: Bet | null;
  match?: Match | null;
  userRemainingBalance?: number;
  onNavigateToDashboard?: () => void;
  onKeepBetting?: () => void;
}

export default function BetConfirmationModal({
  isOpen,
  onClose,
  bet,
  match,
  userRemainingBalance,
  onNavigateToDashboard,
  onKeepBetting
}: BetConfirmationModalProps) {
  const { t, dir } = useLanguage();

  if (!isOpen || !bet) return null;

  const potentialReturn = Math.round(bet.amount * bet.odds);

  const getOutcomeText = () => {
    if (bet.selectedOutcome === 'home') {
      return `فوز ${bet.teamHome} (صاحب الأرض 🏠)`;
    }
    if (bet.selectedOutcome === 'away') {
      return `فوز ${bet.teamAway} (الفريق الضيف ✈️)`;
    }
    return `التعادل بين الفريقين (X 🤝)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" dir={dir}>
      <div className="relative w-full max-w-md bg-zinc-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-right overflow-hidden space-y-5">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 transition-all cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>تم تأكيد الرهان بنجاح!</span>
            <span className="text-emerald-400">⚡</span>
          </h2>
          <p className="text-xs text-zinc-400 font-semibold">
            تم تسجيل رهانك واقتطاع القيمة من محفظتك بنجاح
          </p>
        </div>

        {/* Match Overview Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-[11px] text-zinc-400 border-b border-zinc-800/80 pb-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>مباشر وفي الانتظار</span>
            </span>
            <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-mono">
              رقم الرهان: #{bet.id.slice(-6)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm font-bold text-white py-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{match?.logoHome || '⚽'}</span>
              <span className="truncate max-w-[110px] sm:max-w-[130px]">{bet.teamHome}</span>
            </div>
            <span className="text-zinc-500 text-xs px-2">ضد</span>
            <div className="flex items-center gap-2">
              <span className="truncate max-w-[110px] sm:max-w-[130px]">{bet.teamAway}</span>
              <span className="text-lg">{match?.logoAway || '⚽'}</span>
            </div>
          </div>
        </div>

        {/* Bet Summary Grid */}
        <div className="space-y-2.5 text-xs">
          {/* Outcome */}
          <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-zinc-900">
            <span className="text-zinc-400 font-medium">توقعك المختار:</span>
            <span className="font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              {getOutcomeText()}
            </span>
          </div>

          {/* Stake & Odds */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900 flex flex-col justify-center">
              <span className="text-zinc-400 text-[11px]">مبلغ الرهان:</span>
              <span className="font-black text-sm text-white flex items-center gap-1 mt-0.5">
                <Coins className="h-4 w-4 text-amber-400" />
                <span>{bet.amount} كوينز</span>
              </span>
            </div>

            <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900 flex flex-col justify-center">
              <span className="text-zinc-400 text-[11px]">معامل الأرباح (الأودز):</span>
              <span className="font-black text-sm text-emerald-400 flex items-center gap-1 mt-0.5">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>{bet.odds.toFixed(2)}x</span>
                {bet.featuredMultiplierApplied && bet.featuredMultiplierApplied > 1 && (
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded font-black">
                    🔥 x{bet.featuredMultiplierApplied}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Potential Return */}
          <div className="bg-gradient-to-r from-emerald-950/80 to-zinc-900 p-3.5 rounded-xl border border-emerald-500/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400 animate-pulse" />
              <div>
                <span className="text-[11px] text-zinc-300 font-bold block">الربح الصافي المتوقع:</span>
                <span className="text-[10px] text-zinc-400">عند تحقق توقعك بنجاح</span>
              </div>
            </div>
            <span className="text-lg font-black text-amber-400 tracking-wide">
              +{potentialReturn} 🪙
            </span>
          </div>

          {/* Remaining Balance */}
          {userRemainingBalance !== undefined && (
            <div className="flex justify-between items-center px-1 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 text-zinc-500" />
                <span>رصيدك المتبقي بالمحفظة:</span>
              </span>
              <span className="font-black text-white">{userRemainingBalance} كوينز 🪙</span>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              if (onKeepBetting) onKeepBetting();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            id="bet-confirm-modal-keep-betting-btn"
          >
            <Flame className="h-4.5 w-4.5" />
            <span>المراهنة على مباريات أخرى في الصفحة ⚽</span>
          </button>

          {onNavigateToDashboard && (
            <button
              onClick={() => {
                onNavigateToDashboard();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold text-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              id="bet-confirm-modal-view-dashboard-btn"
            >
              <span>عرض سجلي وسجل مراهناتي في المحفظة 📋</span>
              {dir === 'rtl' ? <ChevronLeft className="h-4 w-4 stroke-[2.5]" /> : <ChevronRight className="h-4 w-4 stroke-[2.5]" />}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
