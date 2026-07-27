import React, { useState, useMemo } from 'react';
import { Bet, Match, User } from '../types';
import { 
  Clock, 
  Filter, 
  Search, 
  ArrowUpDown, 
  X, 
  RotateCcw, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Coins, 
  ShieldCheck, 
  Trophy,
  Flame
} from 'lucide-react';

interface UserActiveBetsListProps {
  bets: Bet[];
  currentUser: User | null;
  matches?: Match[];
}

export default function UserActiveBetsList({
  bets,
  currentUser,
  matches = []
}: UserActiveBetsListProps) {
  const [betFilter, setBetFilter] = useState<'all' | 'pending' | 'won' | 'lost' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highestAmount' | 'highestPayout' | 'highestOdds'>('newest');

  // Filter user's bets specifically
  const userBets = useMemo(() => {
    if (!currentUser) return [];
    return bets.filter(b => b.userId === currentUser.id);
  }, [bets, currentUser]);

  // Quick stats
  const stats = useMemo(() => {
    const total = userBets.length;
    const pending = userBets.filter(b => b.status === 'pending');
    const won = userBets.filter(b => b.status === 'won');
    const lost = userBets.filter(b => b.status === 'lost');
    const cancelled = userBets.filter(b => b.status === 'cancelled');

    const totalStaked = userBets.reduce((acc, b) => acc + (b.amount || 0), 0);
    const activeStaked = pending.reduce((acc, b) => acc + (b.amount || 0), 0);
    const totalPayoutWon = won.reduce((acc, b) => acc + (b.payout || 0), 0);
    const potentialPayoutActive = pending.reduce((acc, b) => acc + Math.round((b.amount || 0) * (b.odds || 1)), 0);

    return {
      total,
      pendingCount: pending.length,
      wonCount: won.length,
      lostCount: lost.length,
      cancelledCount: cancelled.length,
      totalStaked,
      activeStaked,
      totalPayoutWon,
      potentialPayoutActive
    };
  }, [userBets]);

  // Filtered & Sorted list
  const filteredBets = useMemo(() => {
    let result = [...userBets];

    // Status Filter
    if (betFilter !== 'all') {
      result = result.filter(b => b.status === betFilter);
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(b => 
        b.teamHome?.toLowerCase().includes(q) ||
        b.teamAway?.toLowerCase().includes(q) ||
        b.selectedOutcome?.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.placedAt || 0).getTime() - new Date(b.placedAt || 0).getTime();
      } else if (sortBy === 'highestAmount') {
        return b.amount - a.amount;
      } else if (sortBy === 'highestPayout') {
        const payoutA = a.status === 'won' ? a.payout : Math.round(a.amount * a.odds);
        const payoutB = b.status === 'won' ? b.payout : Math.round(b.amount * b.odds);
        return payoutB - payoutA;
      } else if (sortBy === 'highestOdds') {
        return b.odds - a.odds;
      } else { // 'newest'
        return new Date(b.placedAt || Date.now()).getTime() - new Date(a.placedAt || Date.now()).getTime();
      }
    });

    return result;
  }, [userBets, betFilter, searchQuery, sortBy]);

  const isFiltersActive = betFilter !== 'all' || searchQuery.trim() !== '' || sortBy !== 'newest';

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5 sm:p-6 space-y-5 shadow-2xl" id="user-active-bets-list-container">
      {/* 1. Component Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>قائمة الرهانات والتوقعات النشطة</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> مراهنة واحدة لكل مباراة
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                تتبع حالة ونتائج جميع توقعاتك بوضوح. الرهانات نهائية ومحمية ضد التعديل أو الحذف بعد الاشتراك.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Metrics Cards Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <div className="bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-1.5 text-zinc-300">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>إجمالي الرهانات: <strong className="text-white font-mono">{stats.total}</strong></span>
          </div>

          <div className="bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5 text-amber-300 font-bold">
            <Clock className="h-3.5 w-3.5" />
            <span>نشطة حالياً: <strong className="font-mono">{stats.pendingCount}</strong></span>
          </div>

          <div className="bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5 text-emerald-300 font-bold">
            <Trophy className="h-3.5 w-3.5" />
            <span>فائزة: <strong className="font-mono">{stats.wonCount}</strong></span>
          </div>

          <div className="bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 flex items-center gap-1.5 text-red-300 font-bold">
            <XCircle className="h-3.5 w-3.5" />
            <span>خاسرة: <strong className="font-mono">{stats.lostCount}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Filter, Search & Sort Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-900/80">
        
        {/* Search Input */}
        <div className="lg:col-span-5 relative">
          <Search className="h-4 w-4 text-zinc-500 absolute right-3 top-3" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الفريق، التوقع، أو رقم الرهان..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-9 pl-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
            id="user-active-bets-search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-2.5 text-zinc-500 hover:text-white"
              title="مسح البحث"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="lg:col-span-4 flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
          {[
            { id: 'all', label: `الكل (${stats.total})` },
            { id: 'pending', label: `نشط (${stats.pendingCount})` },
            { id: 'won', label: `فائز 🟢 (${stats.wonCount})` },
            { id: 'lost', label: `خاسر 🔴 (${stats.lostCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setBetFilter(tab.id as any)}
              className={`flex-1 min-w-[70px] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-center whitespace-nowrap ${
                betFilter === tab.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
              id={`user-active-bets-filter-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort selector & reset button */}
        <div className="lg:col-span-3 flex items-center gap-2">
          <div className="relative flex-1">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500 absolute right-2.5 top-2.5 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-8 pl-2 py-2 text-xs text-zinc-300 font-bold focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
              id="user-active-bets-sort-select"
            >
              <option value="newest">التاريخ: الأحدث أولاً</option>
              <option value="oldest">التاريخ: الأقدم أولاً</option>
              <option value="highestAmount">المبلغ: الأعلى أولاً</option>
              <option value="highestPayout">العائد: الأعلى أولاً</option>
              <option value="highestOdds">الاحتمال: الأعلى أولاً</option>
            </select>
          </div>

          {isFiltersActive && (
            <button
              onClick={() => {
                setBetFilter('all');
                setSearchQuery('');
                setSortBy('newest');
              }}
              className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors flex items-center gap-1 text-xs font-bold shrink-0"
              title="إعادة ضبط الفلاتر"
              id="user-active-bets-reset-filters-btn"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* 3. Detailed Bets Table & List */}
      {filteredBets.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-zinc-900 bg-zinc-950/60 shadow-inner">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-900 text-zinc-400 font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4">المباراة / التحدي</th>
                <th className="py-3.5 px-4">التوقع المختار</th>
                <th className="py-3.5 px-4 text-center">المبلغ المستثمر</th>
                <th className="py-3.5 px-4 text-center">المعامل (Odds)</th>
                <th className="py-3.5 px-4 text-center">العائد (المتوقع / الفعلي)</th>
                <th className="py-3.5 px-4 text-center">النتيجة الحالية</th>
                <th className="py-3.5 px-4 text-center">الحالة والتأكيد</th>
                <th className="py-3.5 px-4 text-center">الحماية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-zinc-300 font-medium">
              {filteredBets.map(bet => {
                const liveMatch = matches.find(m => m.id === bet.matchId);
                const currentScore = bet.matchScore || (liveMatch ? `${liveMatch.scoreHome} : ${liveMatch.scoreAway}` : '-- : --');
                const outcomeDisplay = bet.selectedOutcome === 'home' 
                  ? `فوز ${bet.teamHome}` 
                  : bet.selectedOutcome === 'away' 
                  ? `فوز ${bet.teamAway}` 
                  : 'التعادل';

                const estimatedPayout = Math.round(bet.amount * bet.odds);

                return (
                  <tr key={bet.id} className="hover:bg-zinc-900/40 transition-colors group">
                    {/* Match name */}
                    <td className="py-4 px-4 font-black text-white">
                      <div className="flex flex-col">
                        <span className="text-sm text-zinc-100 font-extrabold group-hover:text-amber-400 transition-colors">
                          {bet.teamHome} <span className="text-emerald-500 font-mono px-1">×</span> {bet.teamAway}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {bet.placedAt ? new Date(bet.placedAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : 'مسجل مسبقاً'}
                        </span>
                      </div>
                    </td>

                    {/* Outcome */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] font-black">
                        {outcomeDisplay}
                      </span>
                    </td>

                    {/* Staked amount */}
                    <td className="py-4 px-4 text-center font-black text-amber-400 font-mono text-sm">
                      {bet.amount.toLocaleString()} 🪙
                    </td>

                    {/* Odds */}
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black font-mono">
                        x{bet.odds.toFixed(2)}
                      </span>
                    </td>

                    {/* Estimated/Actual Payout */}
                    <td className="py-4 px-4 text-center font-black font-mono">
                      {bet.status === 'won' ? (
                        <span className="text-emerald-400 text-sm">+{bet.payout.toLocaleString()} 🪙</span>
                      ) : bet.status === 'pending' ? (
                        <span className="text-amber-400">{estimatedPayout.toLocaleString()} 🪙</span>
                      ) : (
                        <span className="text-zinc-600 line-through">0 🪙</span>
                      )}
                    </td>

                    {/* Current match score */}
                    <td className="py-4 px-4 text-center font-mono font-black text-zinc-200">
                      <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                        {currentScore}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black ${
                        bet.status === 'won' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : bet.status === 'lost' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}>
                        {bet.status === 'won' ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>فائز 🟢</span>
                          </>
                        ) : bet.status === 'lost' ? (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            <span>خاسر 🔴</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5" />
                            <span>نشط (بانتظار النتيجة) ⚡</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Immutability & Protection Status */}
                    <td className="py-4 px-4 text-center">
                      <span 
                        className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800/80 px-2.5 py-1 rounded-xl cursor-default"
                        title="الرهانات ثابتة ونهائية فور اعتمادها لضمان الشفافية والعدالة"
                      >
                        <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                        <span className="font-bold">مؤكد وثابت</span>
                      </span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 px-4 rounded-2xl border border-zinc-900 bg-zinc-900/20 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-white">لا توجد رهانات مطابقة للفلاتر المختارة</h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {isFiltersActive 
              ? 'جرّب تغيير فلاتر البحث أو التصفية لإظهار كافة الرهانات المسجلة.' 
              : 'لم تقم بإجراء أي رهان بعد. يمكنك تصفح جدول المباريات المتاحة والمشاركة في التوقعات الآن!'}
          </p>
          {isFiltersActive && (
            <button
              onClick={() => {
                setBetFilter('all');
                setSearchQuery('');
                setSortBy('newest');
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>إعادة إظهار كافة الرهانات</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
