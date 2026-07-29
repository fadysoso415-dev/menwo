import React, { useState } from 'react';
import { Match, Bet } from '../types';
import { Flame, Crown, Sparkles, Trophy, ChevronLeft, ShieldCheck, Clock, PlayCircle, Bell, Lock, CheckCircle2, XCircle } from 'lucide-react';

interface FeaturedMatchesSectionProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  onPlaceQuickBet: (match: Match, outcome: 'home' | 'draw' | 'away') => void;
  currentUser?: any;
  reminders?: string[];
  onToggleReminder?: (match: Match) => void;
  activeBets?: Bet[];
}

export default function FeaturedMatchesSection({
  matches,
  onSelectMatch,
  onPlaceQuickBet,
  currentUser,
  reminders = [],
  onToggleReminder,
  activeBets = []
}: FeaturedMatchesSectionProps) {
  // Filter matches that are featured or have a featuredTag, excluding finished and inactive matches
  const featuredMatches = matches.filter(m => (m.isFeatured || Boolean(m.featuredTag)) && m.status !== 'finished' && m.isActive !== false);

  const [activeFilterTag, setActiveFilterTag] = useState<string>('all');
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number>(0);

  if (featuredMatches.length === 0) {
    return null;
  }

  // Extract unique tags for quick filtering
  const allTags = Array.from(new Set(featuredMatches.map(m => m.featuredTag).filter(Boolean))) as string[];

  const filteredList = featuredMatches.filter(m => {
    if (activeFilterTag === 'all') return true;
    return m.featuredTag === activeFilterTag;
  });

  const activeMatch = filteredList[selectedMatchIndex] || filteredList[0] || featuredMatches[0];
  const existingBet = currentUser && activeMatch ? activeBets.find(b => b.userId === currentUser.id && b.matchId === activeMatch.id) : null;

  return (
    <section 
      className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-zinc-950 to-zinc-950 p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6"
      id="featured-matches-section"
    >
      {/* Background Lighting Effects */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-900/80 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/20 animate-pulse">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                <span>المباريات المتميزة</span>
                <span className="text-amber-400">🔥</span>
              </h2>
              <span className="text-[10px] sm:text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="h-3 w-3" />
                <span>اختيارات الإدارة</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              أبرز الديربيات، القمم الكروية، واللقاءات الحاسم بفرص أودز استثنائية
            </p>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => { setActiveFilterTag('all'); setSelectedMatchIndex(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilterTag === 'all'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              الكل ({featuredMatches.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => { setActiveFilterTag(tag); setSelectedMatchIndex(0); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilterTag === tag
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Featured Match Showcase Card */}
      {activeMatch && (
        <div className="relative z-10 bg-zinc-900/60 border border-amber-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-xl hover:border-amber-500/40 transition-all overflow-hidden">
          
          {/* Match Image / Banner if uploaded by Admin */}
          {activeMatch.matchImage && (
            <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl mb-4 group">
              <img 
                src={activeMatch.matchImage} 
                alt={`${activeMatch.teamHome} vs ${activeMatch.teamAway}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute bottom-3 right-4 left-4 flex items-center justify-between flex-wrap gap-2">
                <span className="bg-amber-500/90 text-black font-black text-xs px-3 py-1 rounded-xl backdrop-blur-md shadow-lg flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5" />
                  <span>غلاف المباراة الرسمي</span>
                </span>
                <span className="text-xs text-amber-300 font-bold bg-black/60 px-3 py-1 rounded-xl backdrop-blur-md border border-amber-500/30">
                  {activeMatch.teamHome} ⚡ {activeMatch.teamAway}
                </span>
              </div>
            </div>
          )}

          {/* User's Active Bet Status Badge if already placed */}
          {(() => {
            const userBet = currentUser ? activeBets.find(b => b.userId === currentUser.id && b.matchId === activeMatch.id) : null;
            if (!userBet) return null;
            const payoutAmt = Math.round(userBet.amount * userBet.odds);
            return (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-300 shadow-lg">
                <div className="flex items-center gap-2 font-bold">
                  <Lock className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    لديك رهان مسجل على هذه المباراة: <strong className="text-emerald-400">{userBet.selectedOutcome === 'home' ? `فوز ${userBet.teamHome}` : userBet.selectedOutcome === 'away' ? `فوز ${userBet.teamAway}` : 'التعادل'}</strong> بمبلغ <strong className="text-white">{userBet.amount} 🪙</strong> (العائد المتوقع: {payoutAmt} 🪙)
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shrink-0 ${
                  userBet.status === 'won'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : userBet.status === 'lost'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                }`}>
                  {userBet.status === 'won' ? `فائز 🟢 (+${payoutAmt} 🪙)` : userBet.status === 'lost' ? 'خاسر 🔴' : 'قيد الانتظار ⏳'}
                </span>
              </div>
            );
          })()}

          {/* Promotional Betting Announcement (إذا تم إنشاؤه بواسطة الأدمن) */}
          {activeMatch.adTitle && (
            <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 p-4 rounded-2xl border border-amber-500/40 shadow-xl space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="bg-amber-500 text-black font-black text-[10px] sm:text-xs px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{activeMatch.adBadge || 'إعلان رهان مميز 📣'}</span>
                </span>
                <span className="text-[11px] text-amber-300 font-bold">فرصة حصريّة للمراهنين 🔥</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">{activeMatch.adTitle}</h3>
              {activeMatch.adDescription && (
                <p className="text-xs text-zinc-300 leading-relaxed">{activeMatch.adDescription}</p>
              )}
            </div>
          )}

          {/* Top Info Bar inside Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" />
                <span>{activeMatch.league}</span>
              </span>

              {/* Tag Badge */}
              {activeMatch.featuredTag && (
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{activeMatch.featuredTag}</span>
                </span>
              )}
            </div>

            {/* Status / Time Badge */}
            <div className="flex items-center gap-2">
              {activeMatch.status === 'live' ? (
                <span className="flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black px-3 py-1 rounded-full animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>مباشر - الدقيقة {activeMatch.minutes}'</span>
                </span>
              ) : activeMatch.status === 'finished' ? (
                <span className="bg-zinc-800 text-zinc-400 text-xs font-bold px-3 py-1 rounded-full">
                  انتهت المباراة
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>متاحة للرهان ({activeMatch.time})</span>
                </span>
              )}
            </div>
          </div>

          {/* Teams vs Display */}
          <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-6 py-2">
            
            {/* Home Team */}
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-2">
              <span className="text-5xl sm:text-6xl filter drop-shadow-md">{activeMatch.logoHome}</span>
              <h3 className="text-lg sm:text-xl font-black text-white">{activeMatch.teamHome}</h3>
              <span className="text-xs text-zinc-400">الفريق المضيف</span>
            </div>

            {/* Score / VS Center */}
            <div className="md:col-span-3 flex flex-col items-center justify-center text-center space-y-2 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
              {activeMatch.status === 'scheduled' ? (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400">VS</span>
                  <span className="text-[11px] text-zinc-400 font-medium">قمة مرتقبة اليوم</span>
                </>
              ) : (
                <>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono dir-ltr flex items-center justify-center gap-3">
                    <span>{activeMatch.scoreHome}</span>
                    <span className="text-amber-500 text-2xl">:</span>
                    <span>{activeMatch.scoreAway}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">
                    {activeMatch.status === 'live' ? 'أهداف المباراة حية ⚡' : 'النتيجة النهائية'}
                  </span>
                </>
              )}

              {activeMatch.fixedStakeAmount && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  مبلغ الرهان المعتمد: {activeMatch.fixedStakeAmount} 🪙
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-2">
              <span className="text-5xl sm:text-6xl filter drop-shadow-md">{activeMatch.logoAway}</span>
              <h3 className="text-lg sm:text-xl font-black text-white">{activeMatch.teamAway}</h3>
              <span className="text-xs text-zinc-400">الفريق الضيف</span>
            </div>

          </div>

          {/* Odds & Action Bar */}
          <div className="space-y-3 pt-2">
            {existingBet ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-400 font-extrabold text-xs">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>تم تسجيل رهانك مسبقاً على هذه المباراة المميزة</span>
                </div>
                <p className="text-xs text-zinc-300">
                  راهنت بمبلغ <strong className="text-amber-400">{existingBet.amount.toLocaleString()} 🪙</strong> على{' '}
                  <strong className="text-emerald-400">
                    {existingBet.selectedOutcome === 'home'
                      ? `فوز ${existingBet.teamHome}`
                      : existingBet.selectedOutcome === 'away'
                        ? `فوز ${existingBet.teamAway}`
                        : 'التعادل'}
                  </strong>
                </p>
                <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-bold">
                  ممنوع المراهنة مرتين لنفس المباراة ⛔
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
                  <span className="flex items-center gap-1 text-amber-400">
                    <span>فرص الأودز والتوقعات المباشرة:</span>
                  </span>
                  <span className="text-[11px] text-zinc-500">اختر توقعك للمباراة</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Home Outcome */}
                  <button
                    onClick={() => onPlaceQuickBet(activeMatch, 'home')}
                    className="group relative bg-zinc-950/80 hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-3 sm:p-4 text-center transition-all shadow-md active:scale-95"
                  >
                    <span className="text-[11px] text-zinc-400 group-hover:text-emerald-300 block mb-1 truncate font-bold">
                      {activeMatch.customLabelHome || `فوز ${activeMatch.teamHome}`}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                      x{activeMatch.oddsHome}
                    </span>
                  </button>

                  {/* Draw Outcome */}
                  <button
                    onClick={() => onPlaceQuickBet(activeMatch, 'draw')}
                    className="group relative bg-zinc-950/80 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-3 sm:p-4 text-center transition-all shadow-md active:scale-95"
                  >
                    <span className="text-[11px] text-zinc-400 group-hover:text-amber-300 block mb-1 truncate font-bold">
                      {activeMatch.customLabelDraw || 'التعادل'}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                      x{activeMatch.oddsDraw}
                    </span>
                  </button>

                  {/* Away Outcome */}
                  <button
                    onClick={() => onPlaceQuickBet(activeMatch, 'away')}
                    className="group relative bg-zinc-950/80 hover:bg-blue-500/20 border border-zinc-800 hover:border-blue-500/50 rounded-2xl p-3 sm:p-4 text-center transition-all shadow-md active:scale-95"
                  >
                    <span className="text-[11px] text-zinc-400 group-hover:text-blue-300 block mb-1 truncate font-bold">
                      {activeMatch.customLabelAway || `فوز ${activeMatch.teamAway}`}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-blue-400 font-mono">
                      x{activeMatch.oddsAway}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Strategic Insight */}
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>مؤشرات المباراة موثقة بإحصائيات المواجهات المباشرة الموثوقة</span>
            </div>

            <button
              onClick={() => onSelectMatch(activeMatch)}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>فتح تحليلات المباراة وإحداثيات الرهان</span>
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>

        </div>
      )}

      {/* Pagination / Selector tabs if multiple featured matches */}
      {filteredList.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 relative z-10">
          {filteredList.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setSelectedMatchIndex(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMatchIndex === idx
                  ? 'bg-amber-500 text-black border border-amber-400 font-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span>{m.teamHome} ضد {m.teamAway}</span>
              {m.featuredTag && <span className="text-[10px]">{m.featuredTag}</span>}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
