import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Sparkles, 
  TrendingUp, 
  Radio, 
  Coins, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  matchInfo?: {
    teamHome: string;
    teamAway: string;
    scoreHome: number;
    scoreAway: number;
    userBetOutcome?: 'home' | 'draw' | 'away';
    userBetAmount?: number;
    userBetOdds?: number;
    scoringTeam?: string;
  };
  type?: 'score_change' | 'goal' | 'bet_win' | 'bet_lost' | 'info';
  createdAt: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play audio chime on new score toasts
  useEffect(() => {
    if (toasts.length > 0 && soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5 note
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        // AudioContext browser restrictions handled silently
      }
    }
  }, [toasts.length, soundEnabled]);

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none"
      dir="rtl"
      id="toast-notifications-container"
    >
      {toasts.map((toast) => {
        const { matchInfo } = toast;

        // Calculate if current user outcome is currently matching the current score
        let currentLeadingOutcome: 'home' | 'draw' | 'away' = 'draw';
        if (matchInfo) {
          if (matchInfo.scoreHome > matchInfo.scoreAway) currentLeadingOutcome = 'home';
          else if (matchInfo.scoreAway > matchInfo.scoreHome) currentLeadingOutcome = 'away';
        }

        const isUserWinning = matchInfo && matchInfo.userBetOutcome === currentLeadingOutcome;
        const outcomeLabel = matchInfo?.userBetOutcome === 'home' 
          ? `فوز ${matchInfo.teamHome}` 
          : matchInfo?.userBetOutcome === 'away' 
          ? `فوز ${matchInfo.teamAway}` 
          : 'التعادل';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto relative overflow-hidden bg-zinc-950/95 border-2 border-emerald-500/50 shadow-2xl rounded-2xl p-4 backdrop-blur-xl transition-all transform hover:scale-[1.02] duration-300 animate-in fade-in slide-in-from-top-5"
            style={{
              boxShadow: isUserWinning 
                ? '0 20px 40px -10px rgba(16, 185, 129, 0.3)' 
                : '0 20px 40px -10px rgba(245, 158, 11, 0.25)'
            }}
          >
            {/* Top Accent Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              isUserWinning ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500' : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500'
            }`} />

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 border ${
                  isUserWinning 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  <Flame className="h-5 w-5 animate-pulse" />
                </div>

                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>{toast.title}</span>
                    <span className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      <Radio className="h-2.5 w-2.5 animate-ping text-red-500" />
                      مباشر
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">{toast.message}</p>
                </div>
              </div>

              {/* Close & Mute Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title={soundEnabled ? 'كتم صوت التنبيه' : 'تفعيل صوت التنبيه'}
                >
                  {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-zinc-400" /> : <VolumeX className="h-3.5 w-3.5 text-zinc-600" />}
                </button>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="p-1 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title="إغلاق التنبيه"
                  id={`dismiss-toast-${toast.id}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Match Score Display Card */}
            {matchInfo && (
              <div className="mt-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-zinc-200 truncate max-w-[110px]">{matchInfo.teamHome}</span>
                  
                  {/* Score Pill */}
                  <div className="bg-zinc-950 border border-amber-500/40 px-3 py-1 rounded-lg text-amber-400 font-mono font-black text-sm shadow-inner flex items-center gap-1.5">
                    <span>{matchInfo.scoreHome}</span>
                    <span className="text-zinc-600">-</span>
                    <span>{matchInfo.scoreAway}</span>
                  </div>

                  <span className="text-zinc-200 truncate max-w-[110px] text-left">{matchInfo.teamAway}</span>
                </div>

                {/* User Active Bet Status Indicator */}
                {matchInfo.userBetOutcome && (
                  <div className={`p-2 rounded-lg text-[11px] font-bold flex items-center justify-between border ${
                    isUserWinning
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-amber-400" />
                      <span>رهانك: {outcomeLabel} ({matchInfo.userBetAmount} 🪙)</span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isUserWinning
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isUserWinning ? 'متقدم حالياً 🔥' : 'جارٍ اللعب ⏳'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Auto-Dismiss Progress Line */}
            <div className="mt-3 w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full w-full animate-[progress_5s_linear_forwards]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
