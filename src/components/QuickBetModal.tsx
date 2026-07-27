import React, { useState, useEffect } from 'react';
import { Match, User, Bet } from '../types';
import { 
  X, 
  Trophy, 
  Coins, 
  Zap, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowLeftRight,
  Lock,
  Clock,
  XCircle
} from 'lucide-react';

interface QuickBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  initialOutcome?: 'home' | 'draw' | 'away';
  currentUser: User | null;
  onConfirmBet: (matchId: string, outcome: 'home' | 'draw' | 'away', amount: number) => void;
  onOpenAuth: () => void;
  onOpenDeposit: () => void;
  allMatches?: Match[];
  onSelectMatch?: (match: Match) => void;
  activeBets?: Bet[];
}

const STAKE_PRESETS = [50, 100, 250, 500, 1000];

export default function QuickBetModal({
  isOpen,
  onClose,
  match: initialMatch,
  initialOutcome = 'home',
  currentUser,
  onConfirmBet,
  onOpenAuth,
  onOpenDeposit,
  allMatches = [],
  onSelectMatch,
  activeBets = []
}: QuickBetModalProps) {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(initialMatch);
  const [outcome, setOutcome] = useState<'home' | 'draw' | 'away'>(initialOutcome);
  const [stakeAmount, setStakeAmount] = useState<number>(100);
  const [customStakeInput, setCustomStakeInput] = useState<string>('100');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const existingBet = currentUser && currentMatch 
    ? activeBets.find(b => b.userId === currentUser.id && b.matchId === currentMatch.id)
    : null;

  useEffect(() => {
    setCurrentMatch(initialMatch);
  }, [initialMatch]);

  useEffect(() => {
    if (initialOutcome) {
      setOutcome(initialOutcome);
    }
  }, [initialOutcome, currentMatch]);

  useEffect(() => {
    if (currentMatch?.fixedStakeAmount && currentMatch.fixedStakeAmount > 0) {
      setStakeAmount(currentMatch.fixedStakeAmount);
      setCustomStakeInput(currentMatch.fixedStakeAmount.toString());
    } else {
      setStakeAmount(100);
      setCustomStakeInput('100');
    }
    setErrorMessage('');
  }, [currentMatch]);

  if (!isOpen || !currentMatch) return null;

  const activeMatchList = allMatches.filter(m => 
    m.status !== 'finished' && 
    m.isActive !== false &&
    !m.isBettingClosed && 
    m.bettingStatus !== 'closed' && 
    m.bettingStatus !== 'suspended'
  );

  const currentOdds = outcome === 'home' 
    ? currentMatch.oddsHome 
    : outcome === 'away' 
      ? currentMatch.oddsAway 
      : currentMatch.oddsDraw;

  const multiplierFactor = (currentMatch.isFeaturedBet && currentMatch.featuredBetMultiplier && currentMatch.featuredBetMultiplier > 1) 
    ? currentMatch.featuredBetMultiplier 
    : 1;

  const effectiveOdds = Number((currentOdds * multiplierFactor).toFixed(2));
  const potentialPayout = Math.floor(stakeAmount * effectiveOdds);

  const handleStakeChange = (value: number) => {
    setStakeAmount(value);
    setCustomStakeInput(value.toString());
    setErrorMessage('');
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomStakeInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setStakeAmount(num);
      setErrorMessage('');
    } else {
      setStakeAmount(0);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentUser) {
      onClose();
      onOpenAuth();
      return;
    }

    if (stakeAmount <= 0) {
      setErrorMessage('يرجى تحديد مبلغ رهان صحيح أكبر من صفر.');
      return;
    }

    if (currentUser.balance < stakeAmount) {
      setErrorMessage(`رصيدك المالي المتاح (${currentUser.balance} 🪙) غير كافٍ لهذا الرهان.`);
      return;
    }

    onConfirmBet(currentMatch.id, outcome, stakeAmount);
    onClose();
  };

  const outcomeTitle = outcome === 'home' 
    ? `فوز ${currentMatch.teamHome}` 
    : outcome === 'away' 
      ? `فوز ${currentMatch.teamAway}` 
      : 'التعادل بين الفريقين';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div 
        className="relative w-full max-w-lg bg-zinc-950 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-emerald-500/10 space-y-5 overflow-hidden"
        id="quick-bet-modal"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                قسيمة الرهان 🪙
              </h3>
              <p className="text-xs text-zinc-400">
                {currentMatch.league} • {currentMatch.time}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border border-zinc-800 cursor-pointer"
            id="quick-bet-close-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Optional Active Matches Selector Bar if multiple matches exist */}
        {activeMatchList.length > 1 && (
          <div className="space-y-1.5 relative z-10">
            <label className="text-[11px] font-bold text-zinc-400 block">اختر مباراة أخرى للرهان الفوري:</label>
            <select
              value={currentMatch.id}
              onChange={(e) => {
                const found = activeMatchList.find(m => m.id === e.target.value);
                if (found) {
                  setCurrentMatch(found);
                  if (onSelectMatch) onSelectMatch(found);
                }
              }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {activeMatchList.map((m) => (
                <option key={m.id} value={m.id} className="bg-zinc-950 text-white">
                  ⚽ {m.teamHome} × {m.teamAway} ({m.league})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Match Header Info */}
        <div className="bg-zinc-900/90 border border-zinc-850 p-4 rounded-2xl relative z-10 space-y-3">
          <div className="flex items-center justify-between text-center">
            <div className="flex items-center gap-2 max-w-[40%]">
              <span className="text-2xl">{currentMatch.logoHome}</span>
              <span className="text-xs sm:text-sm font-bold text-white truncate">{currentMatch.teamHome}</span>
            </div>
            
            <div className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-black border border-zinc-700">
              VS
            </div>

            <div className="flex items-center gap-2 max-w-[40%] justify-end">
              <span className="text-xs sm:text-sm font-bold text-white truncate">{currentMatch.teamAway}</span>
              <span className="text-2xl">{currentMatch.logoAway}</span>
            </div>
          </div>

          {/* Outcome Selection Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOutcome('home')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                outcome === 'home'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span className="truncate max-w-full">فوز {currentMatch.teamHome}</span>
              <span className="text-sm font-black text-white font-mono">
                {(currentMatch.oddsHome * multiplierFactor).toFixed(2)}x
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOutcome('draw')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                outcome === 'draw'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span>التعادل</span>
              <span className="text-sm font-black text-white font-mono">
                {(currentMatch.oddsDraw * multiplierFactor).toFixed(2)}x
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOutcome('away')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                outcome === 'away'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span className="truncate max-w-full">فوز {currentMatch.teamAway}</span>
              <span className="text-sm font-black text-white font-mono">
                {(currentMatch.oddsAway * multiplierFactor).toFixed(2)}x
              </span>
            </button>
          </div>
        </div>

        {/* Form Body or Existing Bet Status */}
        {existingBet ? (
          <div className="space-y-4 relative z-10">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs border-b border-amber-500/20 pb-2">
                <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                <span>المراهنة مرتان غير مسموحة على نفس المباراة</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                لقد قمت بالفعل بوضع رهان مسجل على مباراة <strong className="text-white">{currentMatch.teamHome} × {currentMatch.teamAway}</strong>.
              </p>

              <div className="bg-zinc-950/90 rounded-xl p-3 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-zinc-300">
                  <span>توقعك المختار:</span>
                  <span className="font-bold text-emerald-400">
                    {existingBet.selectedOutcome === 'home'
                      ? `فوز ${existingBet.teamHome}`
                      : existingBet.selectedOutcome === 'away'
                        ? `فوز ${existingBet.teamAway}`
                        : 'التعادل بين الفريقين'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span>مبلغ الرهان الخصم:</span>
                  <span className="font-bold text-amber-400">{existingBet.amount.toLocaleString()} 🪙</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span>معامل الأودز والعائد:</span>
                  <span className="font-mono font-bold text-white">
                    x{existingBet.odds.toFixed(2)} ({Math.round(existingBet.amount * existingBet.odds).toLocaleString()} 🪙)
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-850">
                  <span className="font-bold text-zinc-400">حالة الرهان الحالية:</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                    existingBet.status === 'won' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : existingBet.status === 'lost' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  }`}>
                    {existingBet.status === 'won' ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>فائز 🟢 (+{Math.round(existingBet.amount * existingBet.odds)} 🪙)</span>
                      </>
                    ) : existingBet.status === 'lost' ? (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                        <span>خاسر 🔴</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-amber-300" />
                        <span>قيد الانتظار ⏳ (جاري انتهاء المباراة)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm transition-all border border-zinc-700 cursor-pointer"
            >
              فهمت، إغلاق القسيمة
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4 relative z-10">
          
          {/* Stake Amount Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-300">مبلغ الرهان (كوينز)</span>
              {currentUser ? (
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <span>رصيدك:</span>
                  <span>{currentUser.balance.toLocaleString()} 🪙</span>
                </span>
              ) : (
                <span className="text-amber-400 text-[11px]">يتطلب تسجيل الدخول</span>
              )}
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {STAKE_PRESETS.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handleStakeChange(amt)}
                  className={`flex-1 min-w-[55px] py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    stakeAmount === amt
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-md'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {amt} 🪙
                </button>
              ))}
              {currentUser && currentUser.balance > 0 && (
                <button
                  type="button"
                  onClick={() => handleStakeChange(currentUser.balance)}
                  className="py-2 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 border border-amber-300 hover:brightness-110 shadow-md cursor-pointer"
                >
                  الكل ({currentUser.balance} 🪙)
                </button>
              )}
            </div>

            {/* Custom Input */}
            <div className="relative pt-1">
              <input
                type="number"
                min="1"
                value={customStakeInput}
                onChange={handleCustomInputChange}
                placeholder="أدخل مبلغ آخر..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pr-4 pl-12 text-xs font-bold text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors dir-ltr text-right"
              />
              <span className="absolute left-3 top-3 text-xs font-bold text-amber-400">🪙 كوينز</span>
            </div>
          </div>

          {/* Potential Payout Calculation Banner */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-400 text-[11px] block">العائد المتوقع في حال الفوز:</span>
              <span className="text-white font-bold">{outcomeTitle}</span>
            </div>
            <div className="text-left">
              <span className="text-base sm:text-lg font-mono font-black text-emerald-400 block">
                {potentialPayout.toLocaleString()} 🪙
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                ({stakeAmount} × {effectiveOdds}x)
              </span>
            </div>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              {currentUser && currentUser.balance < stakeAmount && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="bg-emerald-500 text-zinc-950 px-2.5 py-1 rounded-lg font-black text-[10px] hover:bg-emerald-400 shrink-0 cursor-pointer"
                >
                  شحن رصيد ⚡
                </button>
              )}
            </div>
          )}

          {/* Action Button */}
          {!currentUser ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 font-black text-xs sm:text-sm hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>سجل دخولك لوضع الرهان مجاناً 🚀</span>
            </button>
          ) : (
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 font-black text-xs sm:text-sm hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              id="confirm-quick-bet-btn"
            >
              <span>تأكيد وتثبيت الرهان الآن ({stakeAmount} 🪙)</span>
            </button>
          )}

        </form>
        )}
      </div>
    </div>
  );
}
