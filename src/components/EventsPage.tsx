import React, { useState, useEffect, useRef } from 'react';
import { Match, Bet, User, PublicBetOffer, StrategicTipsData } from '../types';
import PublicBetsSection from './PublicBetsSection';
import { useLanguage } from '../context/LanguageContext';
import { 
  Tv, 
  Sparkles, 
  Flame, 
  Activity, 
  Play, 
  Loader2, 
  Check, 
  ShieldAlert, 
  Coins, 
  Dribbble, 
  Circle,
  HelpCircle,
  BarChart3,
  PieChart as PieIcon,
  Lightbulb,
  Compass,
  Target,
  TrendingUp,
  History,
  Award,
  CheckCircle2,
  BrainCircuit,
  ChevronRight,
  ChevronLeft,
  Lock,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

// Custom Tooltip for Possession Donut Chart
const CustomPossessionTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-[11px] shadow-2xl text-right" dir="rtl">
        <p className="font-bold text-white mb-0.5">{data.name}</p>
        <p className="font-extrabold" style={{ color: data.color }}>{data.value}% الاستحواذ</p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Comparative Bar Chart
const CustomStatsBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-850 p-3 rounded-xl text-[11px] shadow-2xl space-y-1 text-right" dir="rtl">
        <p className="font-bold text-zinc-400 border-b border-zinc-800 pb-1 mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-6 items-center">
            <span style={{ color: entry.color }} className="font-semibold">{entry.name}:</span>
            <span className="font-black text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface AiPredictionData {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedScore?: string;
  confidence?: string;
  keyFactors?: string[];
  recommendedBet?: string;
  detailedAnalysis?: string;
}

interface EventsPageProps {
  matches: Match[];
  selectedMatch: Match | null;
  onSelectMatch: (match: Match) => void;
  currentUser: User | null;
  onPlaceBet: (matchId: string, outcome: 'home' | 'draw' | 'away', amount: number) => void;
  onSimulateMatchFinished?: (
    matchId: string, 
    scoreHome: number, 
    scoreAway: number, 
    status?: 'scheduled' | 'live' | 'finished',
    date?: string,
    time?: string,
    minutes?: number,
    stats?: any
  ) => void;
  onOpenAuth: () => void;
  activeBets: Bet[];
  publicBetOffers?: PublicBetOffer[];
  onJoinPublicBet?: (offerId: string, stakeAmount: number) => void;
  onScoreChangeToast?: (match: Match, scoreHome: number, scoreAway: number, scoringTeam: string) => void;
}

export default function EventsPage({
  matches,
  selectedMatch,
  onSelectMatch,
  currentUser,
  onPlaceBet,
  onSimulateMatchFinished,
  onOpenAuth,
  activeBets,
  publicBetOffers = [],
  onJoinPublicBet = () => {},
  onScoreChangeToast
}: EventsPageProps) {
  const { t, dir } = useLanguage();
  const [sportFilter, setSportFilter] = useState<'all' | 'football' | 'basketball' | 'tennis'>('all');
  const [betOutcome, setBetOutcome] = useState<'home' | 'draw' | 'away'>('home');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [betSuccessMsg, setBetSuccessMsg] = useState('');
  const [betErrorMsg, setBetErrorMsg] = useState('');
  const [statsViewTab, setStatsViewTab] = useState<'charts' | 'traditional'>('charts');
  const [isBetSlipClosed, setIsBetSlipClosed] = useState(false);

  // Quick On-Card Betting States
  const [quickBetMatchId, setQuickBetMatchId] = useState<string | null>(null);
  const [quickBetOutcome, setQuickBetOutcome] = useState<'home' | 'draw' | 'away'>('home');
  const [quickBetStake, setQuickBetStake] = useState<number>(100);

  const handleQuickCardBet = (e: React.MouseEvent, match: Match, outcome: 'home' | 'draw' | 'away') => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setQuickBetMatchId(match.id);
    setQuickBetOutcome(outcome);
    setQuickBetStake(match.fixedStakeAmount || 100);
  };

  const handleConfirmQuickCardBet = (e: React.MouseEvent, match: Match) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const stake = (match.fixedStakeAmount && match.fixedStakeAmount > 0) ? match.fixedStakeAmount : quickBetStake;
    if (stake <= 0) return;
    onPlaceBet(match.id, quickBetOutcome, stake);
    setQuickBetMatchId(null);
  };

  // AI Prediction States
  const [aiPrediction, setAiPrediction] = useState<AiPredictionData | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  // AI Strategic Tips States
  const [strategicTips, setStrategicTips] = useState<StrategicTipsData | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [tipsError, setTipsError] = useState('');

  // Helper to check if match is available for betting
  const isMatchAvailableForBetting = (match: Match) => {
    if (match.isActive === false) return false;
    if (match.status === 'finished') return false;
    if (match.isBettingClosed) return false;
    if (match.bettingStatus === 'closed' || match.bettingStatus === 'suspended') return false;
    return true;
  };

  const filteredMatches = matches.filter(match => {
    if (!isMatchAvailableForBetting(match)) return false;
    if (sportFilter === 'all') return true;
    return match.sport === sportFilter;
  });

  // Reset states when selected match changes
  useEffect(() => {
    setAiPrediction(null);
    setAiError('');
    setStrategicTips(null);
    setTipsError('');
    setBetSuccessMsg('');
    setBetErrorMsg('');
    setIsBetSlipClosed(false);

    if (selectedMatch?.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0) {
      setBetAmount(selectedMatch.fixedStakeAmount);
    }
  }, [selectedMatch]);

  // Set initial selected match or replace if selected match is finished or closed for betting
  useEffect(() => {
    const activeMatches = matches.filter(isMatchAvailableForBetting);
    if ((!selectedMatch || !isMatchAvailableForBetting(selectedMatch)) && activeMatches.length > 0) {
      onSelectMatch(activeMatches[0]);
    }
  }, [matches, selectedMatch, onSelectMatch]);

  const handlePlaceBetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBetSuccessMsg('');
    setBetErrorMsg('');

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!selectedMatch) return;

    const effectiveAmount = (selectedMatch.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0)
      ? selectedMatch.fixedStakeAmount
      : betAmount;

    if (effectiveAmount <= 0) {
      setBetErrorMsg('يرجى تحديد مبلغ رهان صحيح أكبر من صفر.');
      return;
    }

    if (currentUser.balance < effectiveAmount) {
      setBetErrorMsg(`رصيدك المالي (${currentUser.balance} 🪙) غير كافٍ لإتمام الرهان بمبلغ ${effectiveAmount} 🪙. يرجى تقديم طلب شحن رصيد من المحفظة أولاً.`);
      return;
    }

    onPlaceBet(selectedMatch.id, betOutcome, effectiveAmount);
    setBetSuccessMsg(`تم اقتطاع وخصم مبلغ الرهان (${effectiveAmount} 🪙) من محفظتك بنجاح وتأكيد الرهان!`);
    setTimeout(() => setBetSuccessMsg(''), 5000);
  };

  // 1. Fetch AI Prediction from server API (with Google Search Grounding & Low-Latency)
  const fetchPrediction = async () => {
    if (!selectedMatch) return;
    setLoadingAi(true);
    setAiError('');
    setAiPrediction(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamHome: selectedMatch.teamHome,
          teamAway: selectedMatch.teamAway,
          league: selectedMatch.league,
          sport: selectedMatch.sport,
          oddsHome: selectedMatch.oddsHome,
          oddsDraw: selectedMatch.oddsDraw,
          oddsAway: selectedMatch.oddsAway,
          stats: selectedMatch.stats
        })
      });
      const data = await response.json();
      if (response.ok && data.prediction) {
        if (typeof data.prediction === 'object') {
          setAiPrediction(data.prediction);
        } else {
          // Format text fallback into structured representation
          const rawH = selectedMatch.oddsHome ? 1 / selectedMatch.oddsHome : 0.45;
          const rawD = (selectedMatch.oddsDraw && selectedMatch.sport === 'football') ? 1 / selectedMatch.oddsDraw : 0;
          const rawA = selectedMatch.oddsAway ? 1 / selectedMatch.oddsAway : 0.35;
          const totalRaw = rawH + rawD + rawA || 1;
          const fallbackH = Math.round((rawH / totalRaw) * 100);
          const fallbackD = rawD > 0 ? Math.round((rawD / totalRaw) * 100) : 0;
          const fallbackA = 100 - fallbackH - fallbackD;

          setAiPrediction({
            homeWinProb: fallbackH,
            drawProb: fallbackD,
            awayWinProb: fallbackA,
            predictedScore: '2 - 1',
            confidence: 'متوسطة',
            keyFactors: [`الأفضلية الرقمية لـ ${selectedMatch.teamHome}`, 'استقرار التشكيلة الأساسية'],
            recommendedBet: `فوز ${selectedMatch.teamHome}`,
            detailedAnalysis: String(data.prediction)
          });
        }
      } else {
        throw new Error(data.error || 'فشل توليد التوقعات.');
      }
    } catch (err: any) {
      setAiError(err.message || 'حدث خطأ أثناء محاولة الاتصال بالذكاء الاصطناعي.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Fetch AI Strategic Tips from server API based on Head-to-Head & match history
  const fetchStrategicTips = async () => {
    if (!selectedMatch) return;
    setLoadingTips(true);
    setTipsError('');
    try {
      const response = await fetch('/api/strategic-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamHome: selectedMatch.teamHome,
          teamAway: selectedMatch.teamAway,
          league: selectedMatch.league,
          sport: selectedMatch.sport,
          headToHead: selectedMatch.headToHead,
          stats: selectedMatch.stats
        })
      });
      const data = await response.json();
      if (response.ok && data.strategicTips) {
        setStrategicTips(data.strategicTips);
      } else {
        throw new Error(data.error || 'فشل استخراج النصائح الاستراتيجية.');
      }
    } catch (err: any) {
      setTipsError(err.message || 'حدث خطأ أثناء محاولة جلب النصائح الاستراتيجية بالذكاء الاصطناعي.');
    } finally {
      setLoadingTips(false);
    }
  };

  const getSportBadge = (sport: string) => {
    switch (sport) {
      case 'football': return '⚽ كرة قدم';
      case 'basketball': return '🏀 كرة سلة';
      case 'tennis': return '🎾 تنس';
      default: return '🏟️ رياضة';
    }
  };

  const currentMatchBets = selectedMatch ? activeBets.filter(b => b.matchId === selectedMatch.id) : [];

  return (
    <div className="space-y-3 py-2 sm:py-3" dir={dir}>
      {/* Informational Banner: Matches Available for Betting Only */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-950/80 via-zinc-950 to-emerald-950/80 border border-emerald-500/30 p-2.5 sm:p-3 text-emerald-300 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <span>صفحة الرهانات المتاحة</span>
              <span className="text-[9px] bg-emerald-500 text-zinc-950 px-1.5 py-0.2 rounded-full font-black">
                مباشر وقادم فقط
              </span>
            </h2>
            <p className="text-[11px] text-zinc-300 font-medium mt-0.5">
              المباريات المتاحة للرهان مع أزرار التأكيد السريع في شاشة واحدة.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400 shrink-0">
          <Coins className="h-3.5 w-3.5" />
          <span>{filteredMatches.length} مباراة</span>
        </div>
      </div>

      {/* 1. Public Bets Offered by Admin for All Users */}
      {publicBetOffers.length > 0 && (
        <PublicBetsSection
          publicBetOffers={publicBetOffers}
          currentUser={currentUser}
          onJoinPublicBet={onJoinPublicBet}
          onOpenAuth={onOpenAuth}
          userBets={activeBets}
        />
      )}

      {/* 2. Main Matches & Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Column 1: List of Matches */}
        <div className={`space-y-3 lg:col-span-1 ${selectedMatch ? 'hidden lg:block' : 'block'}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-emerald-400" />
            <span>المباريات المتاحة للرهان</span>
          </h3>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-extrabold">{filteredMatches.length} مباراة</span>
        </div>

        {/* Sport filters */}
        <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-900 w-full">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'football', label: 'كرة قدم' },
            { id: 'basketball', label: 'سلة' },
            { id: 'tennis', label: 'تنس' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSportFilter(tab.id as any)}
              className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                sportFilter === tab.id 
                  ? 'bg-emerald-500 text-zinc-950 shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              id={`events-filter-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Matches scrolling list */}
        <div className="space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
          {filteredMatches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/80 p-6 text-center space-y-2">
              <div className="mx-auto w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Coins className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-extrabold text-white">لا توجد مباريات متاحة للرهان حالياً</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                جميع المباريات الحالية إما منتهية أو مغلقة. يرجى التفقد لاحقاً عند فتح رهانات جديدة.
              </p>
            </div>
          ) : (
            filteredMatches.map(match => {
            const isSelected = selectedMatch?.id === match.id;
            const matchBetsCount = activeBets.filter(b => b.matchId === match.id).length;
            return (
              <div
                key={match.id}
                onClick={() => onSelectMatch(match)}
                className={`relative rounded-xl p-3 border transition-all cursor-pointer text-right flex flex-col justify-between ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-md' 
                    : 'border-zinc-900 bg-zinc-950 hover:border-zinc-800'
                }`}
                id={`event-item-${match.id}`}
              >
                {matchBetsCount > 0 && (
                  <div className="absolute -top-1.5 -left-1.5 flex h-4.5 px-1.5 items-center justify-center bg-amber-500 text-zinc-950 text-[8px] font-black rounded-full shadow border border-amber-400 z-10">
                    <span>{matchBetsCount} رهان</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-1">
                  <span className="font-semibold text-zinc-400 truncate max-w-[140px]">{match.league}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                    match.status === 'live' 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : match.status === 'finished'
                      ? 'bg-zinc-900 text-zinc-400'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {match.status === 'live' ? `لايف د ${match.minutes}` : match.status === 'finished' ? 'منتهية' : 'متاحة للرهان'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{match.logoHome}</span>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {match.teamHome}
                    </span>
                  </div>
                  {match.status !== 'scheduled' && (
                    <span className="text-xs font-black text-white">{match.scoreHome}</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{match.logoAway}</span>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {match.teamAway}
                    </span>
                  </div>
                  {match.status !== 'scheduled' && (
                    <span className="text-xs font-black text-white">{match.scoreAway}</span>
                  )}
                </div>

                {/* Interactive Odds Buttons for Betting */}
                {match.status !== 'finished' && !match.isBettingClosed && (
                  <div className="mt-2 pt-2 border-t border-zinc-900/80 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between text-[9px] text-zinc-400">
                      <span className="font-bold flex items-center gap-1 text-emerald-400">
                        <span>أزرار الرهان السريع:</span>
                      </span>
                      {match.isFeaturedBet && match.featuredBetMultiplier && match.featuredBetMultiplier > 1 && (
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1 py-0.2 rounded text-[8px] font-black">
                          🔥 مضاعف x{match.featuredBetMultiplier}
                        </span>
                      )}
                    </div>

                    {/* 1 X 2 Odds Buttons */}
                    <div className="grid grid-cols-3 gap-1">
                      {/* Home (1) */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickCardBet(e, match, 'home')}
                        className={`py-1 px-1.5 rounded-lg text-center border transition-all cursor-pointer active:scale-95 ${
                          quickBetMatchId === match.id && quickBetOutcome === 'home'
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black shadow-md'
                            : 'bg-zinc-900/90 text-zinc-200 border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10'
                        }`}
                        title={`مراهنة على فوز ${match.teamHome}`}
                        id={`quick-bet-home-${match.id}`}
                      >
                        <div className="text-[9px] font-bold truncate">1 (مضيف)</div>
                        <div className="text-[11px] font-black font-mono text-emerald-400">
                          {(match.isFeaturedBet && match.featuredBetMultiplier ? match.oddsHome * match.featuredBetMultiplier : match.oddsHome).toFixed(2)}x
                        </div>
                      </button>

                      {/* Draw (X) */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickCardBet(e, match, 'draw')}
                        className={`py-1 px-1.5 rounded-lg text-center border transition-all cursor-pointer active:scale-95 ${
                          quickBetMatchId === match.id && quickBetOutcome === 'draw'
                            ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-md'
                            : 'bg-zinc-900/90 text-zinc-200 border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/10'
                        }`}
                        title="مراهنة على التعادل"
                        id={`quick-bet-draw-${match.id}`}
                      >
                        <div className="text-[9px] font-bold truncate">X (تعادل)</div>
                        <div className="text-[11px] font-black font-mono text-amber-400">
                          {(match.isFeaturedBet && match.featuredBetMultiplier ? match.oddsDraw * match.featuredBetMultiplier : match.oddsDraw).toFixed(2)}x
                        </div>
                      </button>

                      {/* Away (2) */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickCardBet(e, match, 'away')}
                        className={`py-1 px-1.5 rounded-lg text-center border transition-all cursor-pointer active:scale-95 ${
                          quickBetMatchId === match.id && quickBetOutcome === 'away'
                            ? 'bg-blue-500 text-zinc-950 border-blue-400 font-black shadow-md'
                            : 'bg-zinc-900/90 text-zinc-200 border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/10'
                        }`}
                        title={`مراهنة على فوز ${match.teamAway}`}
                        id={`quick-bet-away-${match.id}`}
                      >
                        <div className="text-[9px] font-bold truncate">2 (ضيف)</div>
                        <div className="text-[11px] font-black font-mono text-blue-400">
                          {(match.isFeaturedBet && match.featuredBetMultiplier ? match.oddsAway * match.featuredBetMultiplier : match.oddsAway).toFixed(2)}x
                        </div>
                      </button>
                    </div>

                    {/* Quick Stake Selector Panel inside card when an outcome is clicked */}
                    {quickBetMatchId === match.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="mt-1.5 p-2 rounded-xl bg-zinc-900 border border-emerald-500/40 shadow-lg space-y-1.5 text-right"
                      >
                        <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-400">
                          <span>توقعك: {quickBetOutcome === 'home' ? `فوز ${match.teamHome}` : quickBetOutcome === 'away' ? `فوز ${match.teamAway}` : 'التعادل'}</span>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setQuickBetMatchId(null); }} 
                            className="text-[9px] text-zinc-400 hover:text-white px-1"
                          >
                            إغلاق ✕
                          </button>
                        </div>

                        {match.fixedStakeAmount ? (
                          <div className="text-[11px] text-amber-300 font-bold bg-amber-500/10 p-1 rounded text-center border border-amber-500/20">
                            مبلغ الرهان الثابت: {match.fixedStakeAmount} 🪙
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              {[50, 100, 250, 500].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setQuickBetStake(preset); }}
                                  className={`flex-1 text-[9px] font-extrabold py-0.5 rounded border transition-all ${
                                    quickBetStake === preset
                                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black'
                                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-emerald-500/40'
                                  }`}
                                >
                                  +{preset}🪙
                                </button>
                              ))}
                            </div>
                            <input
                              type="number"
                              value={Number.isNaN(quickBetStake) ? '' : quickBetStake}
                              onChange={(e) => setQuickBetStake(Math.max(1, parseInt(e.target.value) || 0))}
                              className="w-full text-[11px] font-bold text-white bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 text-center focus:border-emerald-500 focus:outline-none"
                              placeholder="المبلغ بالكوينز"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleConfirmQuickCardBet(e, match)}
                          className="w-full py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[11px] shadow transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                          id={`confirm-card-quick-bet-btn-${match.id}`}
                        >
                          <span>تأكيد الرهان بقيمة {match.fixedStakeAmount || quickBetStake} 🪙</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-1.5 pt-1.5 border-t border-zinc-900/60 flex justify-between items-center text-[9px] text-zinc-500">
                  <span className="text-zinc-400 font-semibold">{match.league}</span>
                  <span className="text-emerald-400 font-bold hover:underline">عرض والتفاصيل 📊</span>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* Column 2 & 3: Match Details, Compact Scoreboard & Betting Slip */}
      <div className="lg:col-span-2 space-y-3">
        {selectedMatch ? (
          isBetSlipClosed ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedMatch.logoHome}</span>
                <span className="text-xs sm:text-sm font-bold text-white">{selectedMatch.teamHome} <span className="text-emerald-400 font-extrabold">×</span> {selectedMatch.teamAway}</span>
                <span className="text-2xl">{selectedMatch.logoAway}</span>
                <span className="text-[10px] text-zinc-400 font-bold bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800">بطاقة مصغرة</span>
              </div>
              <button
                type="button"
                onClick={() => setIsBetSlipClosed(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10 active:scale-95"
                id="reopen-betting-slip-btn"
              >
                <Coins className="h-4 w-4" />
                <span>إظهار بطاقة الرهان 🪙</span>
              </button>
            </div>
          ) : (
          <>
            {/* A. Compact Scoreboard */}
            <div className="rounded-2xl border border-emerald-500/30 bg-zinc-950 p-3 sm:p-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1 w-full bg-emerald-500" />
              
              <div className="flex justify-between items-center text-[11px] text-zinc-400 mb-2 border-b border-zinc-900 pb-2">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <span>{selectedMatch.league}</span>
                  <span className="text-zinc-600">•</span>
                  <span>{getSportBadge(selectedMatch.sport)}</span>
                </span>
                
                {/* Prominent Close X Button */}
                <button
                  type="button"
                  onClick={() => setIsBetSlipClosed(true)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
                  title="تصغير / إغلاق بطاقة الرهان"
                  id="close-selected-match-btn"
                >
                  <span className="text-[11px] hidden sm:inline">تصغير / إغلاق</span>
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Score display */}
              <div className="grid grid-cols-3 items-center text-center py-1">
                <div className="flex items-center gap-2 text-right">
                  <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner">
                    {selectedMatch.logoHome}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{selectedMatch.teamHome}</h4>
                </div>

                <div className="space-y-0.5">
                  {selectedMatch.status === 'scheduled' ? (
                    <div className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[11px] text-emerald-400 font-bold inline-block">
                      {selectedMatch.time}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center gap-2 text-2xl font-black text-white tracking-tight">
                      <span>{selectedMatch.scoreHome}</span>
                      <span className="text-zinc-600">:</span>
                      <span>{selectedMatch.scoreAway}</span>
                    </div>
                  )}
                  <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">
                    {selectedMatch.status === 'live' ? `مباشر د ${selectedMatch.minutes}'` : selectedMatch.status === 'finished' ? 'انتهت كاملة' : 'متاحة للرهان'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{selectedMatch.teamAway}</h4>
                  <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner">
                    {selectedMatch.logoAway}
                  </div>
                </div>
              </div>
            </div>

            {/* B. Compact Betting slip */}
            <div className="w-full">
              
              {/* Betting Slip Card */}
              <div className="rounded-2xl border border-emerald-500/30 bg-zinc-950 p-3 sm:p-4 flex flex-col justify-between shadow-xl space-y-3 relative">
                <form onSubmit={handlePlaceBetSubmit} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-emerald-400" />
                      <span>بطاقة الرهان القسيمة (Betting Slip)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsBetSlipClosed(true)}
                      className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors border border-zinc-800 cursor-pointer flex items-center gap-1"
                      title="تصغير بطاقة الرهان"
                      id="close-betting-slip-btn"
                    >
                      <span className="text-[10px] text-zinc-400 font-bold hidden sm:inline">تصغير</span>
                      <X className="h-4 w-4 text-zinc-300" />
                    </button>
                  </div>

                  {betSuccessMsg && (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-400">
                      {betSuccessMsg}
                    </div>
                  )}

                  {betErrorMsg && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400">
                      {betErrorMsg}
                    </div>
                  )}

                  {currentUser && activeBets.some(b => b.userId === currentUser.id && b.matchId === selectedMatch.id) ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                        <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs">
                          <Lock className="h-4 w-4 shrink-0" />
                          <span>تم تسجيل رهانك على هذه المباراة</span>
                        </div>
                        <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                          ممنوع التكرار ⛔
                        </span>
                      </div>
                      {(() => {
                        const existingBet = activeBets.find(b => b.userId === currentUser.id && b.matchId === selectedMatch.id);
                        if (!existingBet) return null;
                        const potentialAmount = Math.round(existingBet.amount * existingBet.odds);
                        return (
                          <div className="bg-zinc-950/90 rounded-xl p-3 border border-zinc-800 text-xs space-y-2">
                            <div className="flex justify-between items-center text-zinc-300">
                              <span>التوقع المختار:</span>
                              <span className="font-extrabold text-emerald-400">
                                {existingBet.selectedOutcome === 'home' ? `فوز ${existingBet.teamHome}` : existingBet.selectedOutcome === 'away' ? `فوز ${existingBet.teamAway}` : 'التعادل'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-300">
                              <span>المبلغ المقتطع:</span>
                              <span className="font-black text-amber-400">{existingBet.amount.toLocaleString()} 🪙</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-300">
                              <span>معامل الأودز والعائد:</span>
                              <span className="font-mono font-black text-white">
                                x{existingBet.odds.toFixed(2)} ({potentialAmount.toLocaleString()} 🪙)
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-zinc-850">
                              <span className="font-bold text-zinc-400">حالة الرهان الفعالة:</span>
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
                                    <span>فائز 🟢 (+{potentialAmount} 🪙)</span>
                                  </>
                                ) : existingBet.status === 'lost' ? (
                                  <>
                                    <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                                    <span>خاسر 🔴</span>
                                  </>
                                ) : (
                                  <>
                                    <Activity className="h-3.5 w-3.5 text-amber-300" />
                                    <span>قيد الانتظار ⏳</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : selectedMatch.status === 'finished' ? (
                    <div className="text-center py-4 text-zinc-500 text-xs">
                      المباراة منتهية بالفعل، لا يمكن قبول رهانات جديدة عليها.
                    </div>
                  ) : (
                    <>
                      {/* Featured Bet Special Banner */}
                      {selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 && (
                        <div className="rounded-lg border border-purple-500/40 bg-gradient-to-r from-purple-950/80 via-zinc-950 to-purple-950/80 p-2 text-xs text-purple-300 flex items-center justify-between shadow-md">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            <div className="font-black text-white text-[11px]">
                              {selectedMatch.featuredBetLabel || `🔥 مضاعف أرباح x${selectedMatch.featuredBetMultiplier}`}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white font-black text-[10px]">
                            x{selectedMatch.featuredBetMultiplier} مضاعف
                          </span>
                        </div>
                      )}

                      {/* Pick outcome */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] font-bold text-zinc-400">اختر التوقع (1 - X - 2):</label>
                          <span className="text-[9px] text-emerald-400 font-bold">مفتوح</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-xs">
                          {/* Home Win / Outcome 1 */}
                          <button
                            type="button"
                            onClick={() => setBetOutcome('home')}
                            className={`rounded-xl p-1.5 border text-center font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              betOutcome === 'home' 
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-md ring-2 ring-emerald-400/40' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                            }`}
                            id="bet-outcome-home"
                          >
                            <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-950/20 text-current font-extrabold">1 - فوز</span>
                            <span className="text-[11px] truncate max-w-full">
                              {selectedMatch.customLabelHome || selectedMatch.teamHome}
                            </span>
                            <div className="flex items-center justify-center gap-0.5 font-mono text-[11px] font-black mt-0.5 text-emerald-400">
                              <span>
                                {((selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 ? selectedMatch.oddsHome * selectedMatch.featuredBetMultiplier : selectedMatch.oddsHome)).toFixed(2)}x
                              </span>
                            </div>
                          </button>

                          {/* Draw / Outcome X */}
                          <button
                            type="button"
                            onClick={() => setBetOutcome('draw')}
                            className={`rounded-xl p-1.5 border text-center font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              betOutcome === 'draw' 
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-md ring-2 ring-emerald-400/40' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                            }`}
                            id="bet-outcome-draw"
                          >
                            <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-950/20 text-current font-extrabold">X - تعادل</span>
                            <span className="text-[11px] truncate max-w-full">
                              {selectedMatch.customLabelDraw || 'تعادل'}
                            </span>
                            <div className="flex items-center justify-center gap-0.5 font-mono text-[11px] font-black mt-0.5 text-amber-400">
                              <span>
                                {((selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 ? selectedMatch.oddsDraw * selectedMatch.featuredBetMultiplier : selectedMatch.oddsDraw)).toFixed(2)}x
                              </span>
                            </div>
                          </button>

                          {/* Away Win / Outcome 2 */}
                          <button
                            type="button"
                            onClick={() => setBetOutcome('away')}
                            className={`rounded-xl p-1.5 border text-center font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              betOutcome === 'away' 
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-md ring-2 ring-emerald-400/40' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                            }`}
                            id="bet-outcome-away"
                          >
                            <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-950/20 text-current font-extrabold">2 - خسارة</span>
                            <span className="text-[11px] truncate max-w-full">
                              {selectedMatch.customLabelAway || selectedMatch.teamAway}
                            </span>
                            <div className="flex items-center justify-center gap-0.5 font-mono text-[11px] font-black mt-0.5 text-blue-400">
                              <span>
                                {((selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 ? selectedMatch.oddsAway * selectedMatch.featuredBetMultiplier : selectedMatch.oddsAway)).toFixed(2)}x
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Bet amount */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] text-zinc-400 mb-1">
                          <label className="font-bold flex items-center gap-1">
                            <span>مبلغ الرهان (كوينز):</span>
                            {selectedMatch.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0 && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-bold">
                                🔒 قيمة ثابتة
                              </span>
                            )}
                          </label>
                          <span className="text-[10px] text-zinc-400">رصيدك: {currentUser?.balance || 0} 🪙</span>
                        </div>

                        {selectedMatch.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0 ? (
                          <div className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 flex items-center justify-between font-bold">
                            <span>القيمة الثابتة:</span>
                            <span className="text-xs font-black text-amber-400">{selectedMatch.fixedStakeAmount} 🪙</span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <input
                              type="number"
                              value={Number.isNaN(betAmount) ? '' : betAmount}
                              onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-bold shadow-inner"
                              id="bet-amount-input"
                              placeholder="أدخل قيمة الرهان"
                            />
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[9px] text-zinc-400 font-bold ml-1">سريع:</span>
                              {[50, 100, 250, 500].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setBetAmount(preset)}
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border transition-all active:scale-95 cursor-pointer ${
                                    betAmount === preset
                                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black'
                                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400'
                                  }`}
                                >
                                  +{preset} 🪙
                                </button>
                              ))}
                              {currentUser && currentUser.balance > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setBetAmount(currentUser.balance)}
                                  className="text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all active:scale-95 cursor-pointer"
                                >
                                  الكل ({currentUser.balance} 🪙)
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="bg-zinc-900/40 rounded-lg p-2.5 border border-zinc-900 text-xs space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">مجموع الرهان:</span>
                          <span className="font-bold text-white">
                            {selectedMatch.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0 ? selectedMatch.fixedStakeAmount : betAmount} 🪙
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">المعامل (Odds):</span>
                          <span className="font-bold text-white flex items-center gap-1">
                            {((betOutcome === 'home' ? selectedMatch.oddsHome : betOutcome === 'away' ? selectedMatch.oddsAway : selectedMatch.oddsDraw) * (selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 ? selectedMatch.featuredBetMultiplier : 1)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-zinc-900/60 pt-1 font-bold text-xs">
                          <span className="text-emerald-400">الربح الصافي المتوقع:</span>
                          <span className="text-amber-400 font-black">
                            {Math.round(
                              (selectedMatch.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0 ? selectedMatch.fixedStakeAmount : betAmount) * 
                              (betOutcome === 'home' ? selectedMatch.oddsHome : betOutcome === 'away' ? selectedMatch.oddsAway : selectedMatch.oddsDraw) *
                              (selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 ? selectedMatch.featuredBetMultiplier : 1)
                            )} 🪙
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 active:scale-95 cursor-pointer"
                        id="place-bet-btn"
                      >
                        {currentUser ? 'تأكيد وتثبيت الرهان' : 'سجل دخولك لوضع رهاناتك'}
                      </button>
                    </>
                  )}
                </form>

                {currentMatchBets.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-900">
                    <span className="text-[10px] font-bold text-emerald-400">رهاناتك الحالية على المباراة:</span>
                    <div className="space-y-1.5 mt-1.5">
                      {currentMatchBets.map(b => (
                        <div key={b.id} className="flex justify-between text-[10px] text-zinc-400 bg-zinc-900/40 border border-zinc-900 rounded p-1.5">
                          <span>المقدار: {b.amount} 🪙 | توقعك: {b.selectedOutcome === 'home' ? 'المضيف' : b.selectedOutcome === 'away' ? 'الضيف' : 'تعادل'}</span>
                          <span className="text-amber-400 font-bold">{b.status === 'pending' ? 'جاري اللعب' : b.status === 'won' ? 'فائز' : 'خاسر'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
          )
        ) : (
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-10 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Coins className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">اختر مباراة متاحة للرهان من القائمة</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
                تقتصر هذه الصفحة حكراً على المباريات والأحداث المتاحة للرهان المباشر والقادم. حدد أي مباراة من القائمة الجانبية لتقديم وتأكيد الرهانات.
              </p>
            </div>
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
