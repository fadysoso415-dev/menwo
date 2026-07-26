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
  Zap
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

  const filteredMatches = matches.filter(match => {
    if (match.status === 'finished') return false;
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

    if (selectedMatch?.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0) {
      setBetAmount(selectedMatch.fixedStakeAmount);
    }
  }, [selectedMatch]);

  // Set initial selected match or replace if selected match is finished
  useEffect(() => {
    const activeMatches = matches.filter(m => m.status !== 'finished');
    if ((!selectedMatch || selectedMatch.status === 'finished') && activeMatches.length > 0) {
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
    setBetSuccessMsg('تم تسجيل الرهان بنجاح! سيتم تسوية الرهان عند انتهاء المباراة.');
    setTimeout(() => setBetSuccessMsg(''), 4000);
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
    <div className="space-y-6 py-6" dir={dir}>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: List of Matches */}
        <div className={`space-y-4 lg:col-span-1 ${selectedMatch ? 'hidden lg:block' : 'block'}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <Flame className="h-4.5 w-4.5 text-emerald-400" />
            <span>قائمة المباريات والأحداث</span>
          </h3>
          <span className="text-xs text-zinc-500 font-semibold">{filteredMatches.length} حدث</span>
        </div>

        {/* Sport filters */}
        <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-900 w-full">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'football', label: 'كرة قدم' },
            { id: 'basketball', label: 'سلة' },
            { id: 'tennis', label: 'تنس' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSportFilter(tab.id as any)}
              className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${
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
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {filteredMatches.map(match => {
            const isSelected = selectedMatch?.id === match.id;
            const matchBetsCount = activeBets.filter(b => b.matchId === match.id).length;
            return (
              <div
                key={match.id}
                onClick={() => onSelectMatch(match)}
                className={`relative rounded-2xl p-4 border transition-all cursor-pointer text-right flex flex-col justify-between ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/5' 
                    : 'border-zinc-900 bg-zinc-950 hover:border-zinc-800'
                }`}
                id={`event-item-${match.id}`}
              >
                {matchBetsCount > 0 && (
                  <div className="absolute -top-1.5 -left-1.5 flex h-5 px-2 items-center justify-center bg-amber-500 text-zinc-950 text-[9px] font-extrabold rounded-full shadow-lg border border-amber-400 z-10 animate-bounce">
                    <span>{matchBetsCount} {matchBetsCount === 1 ? 'رهان' : matchBetsCount === 2 ? 'رهانان' : 'رهانات'}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-2">
                  <span>{match.league}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    match.status === 'live' 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : match.status === 'finished'
                      ? 'bg-zinc-900 text-zinc-400'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {match.status === 'live' ? `لايف د ${match.minutes}` : match.status === 'finished' ? 'منتهية' : 'مجدولة'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{match.logoHome}</span>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {match.teamHome}
                    </span>
                  </div>
                  {match.status !== 'scheduled' && (
                    <span className="text-sm font-black text-white">{match.scoreHome}</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{match.logoAway}</span>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {match.teamAway}
                    </span>
                  </div>
                  {match.status !== 'scheduled' && (
                    <span className="text-sm font-black text-white">{match.scoreAway}</span>
                  )}
                </div>

                {/* Interactive Odds Buttons for Quick On-Card Betting */}
                {match.status !== 'finished' && !match.isBettingClosed && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-900/80 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-bold flex items-center gap-1 text-emerald-400">
                        <Zap className="h-3 w-3" />
                        <span>رهان سريع مباشر من الكارت:</span>
                      </span>
                      {match.isFeaturedBet && match.featuredBetMultiplier && match.featuredBetMultiplier > 1 && (
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded text-[9px] font-black">
                          🔥 مضاعف x{match.featuredBetMultiplier}
                        </span>
                      )}
                    </div>

                    {/* 1 X 2 Odds Buttons */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {/* Home (1) */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickCardBet(e, match, 'home')}
                        className={`py-1.5 px-2 rounded-xl text-center border transition-all cursor-pointer active:scale-95 ${
                          quickBetMatchId === match.id && quickBetOutcome === 'home'
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black shadow-md'
                            : 'bg-zinc-900/90 text-zinc-200 border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10'
                        }`}
                        title={`مراهنة سريعة على فوز ${match.teamHome}`}
                        id={`quick-bet-home-${match.id}`}
                      >
                        <div className="text-[10px] font-bold truncate">1 (مضيف)</div>
                        <div className="text-xs font-black font-mono text-emerald-400">
                          {(match.isFeaturedBet && match.featuredBetMultiplier ? match.oddsHome * match.featuredBetMultiplier : match.oddsHome).toFixed(2)}x
                        </div>
                      </button>

                      {/* Draw (X) */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickCardBet(e, match, 'draw')}
                        className={`py-1.5 px-2 rounded-xl text-center border transition-all cursor-pointer active:scale-95 ${
                          quickBetMatchId === match.id && quickBetOutcome === 'draw'
                            ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-md'
                            : 'bg-zinc-900/90 text-zinc-200 border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/10'
                        }`}
                        title="مراهنة سريعة على التعادل"
                        id={`quick-bet-draw-${match.id}`}
                      >
                        <div className="text-[10px] font-bold truncate">X (تعادل)</div>
                        <div className="text-xs font-black font-mono text-amber-400">
                          {(match.isFeaturedBet && match.featuredBetMultiplier ? match.oddsDraw * match.featuredBetMultiplier : match.oddsDraw).toFixed(2)}x
                        </div>
                      </button>

                      {/* Away (2) */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickCardBet(e, match, 'away')}
                        className={`py-1.5 px-2 rounded-xl text-center border transition-all cursor-pointer active:scale-95 ${
                          quickBetMatchId === match.id && quickBetOutcome === 'away'
                            ? 'bg-blue-500 text-zinc-950 border-blue-400 font-black shadow-md'
                            : 'bg-zinc-900/90 text-zinc-200 border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/10'
                        }`}
                        title={`مراهنة سريعة على فوز ${match.teamAway}`}
                        id={`quick-bet-away-${match.id}`}
                      >
                        <div className="text-[10px] font-bold truncate">2 (ضيف)</div>
                        <div className="text-xs font-black font-mono text-blue-400">
                          {(match.isFeaturedBet && match.featuredBetMultiplier ? match.oddsAway * match.featuredBetMultiplier : match.oddsAway).toFixed(2)}x
                        </div>
                      </button>
                    </div>

                    {/* Quick Stake Selector Panel inside card when an outcome is clicked */}
                    {quickBetMatchId === match.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="mt-2 p-2.5 rounded-xl bg-zinc-900 border border-emerald-500/40 shadow-lg space-y-2 text-right"
                      >
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-400">
                          <span>توقعك: {quickBetOutcome === 'home' ? `فوز ${match.teamHome}` : quickBetOutcome === 'away' ? `فوز ${match.teamAway}` : 'التعادل'}</span>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setQuickBetMatchId(null); }} 
                            className="text-[10px] text-zinc-400 hover:text-white px-1"
                          >
                            إغلاق ✕
                          </button>
                        </div>

                        {match.fixedStakeAmount ? (
                          <div className="text-xs text-amber-300 font-bold bg-amber-500/10 p-1.5 rounded text-center border border-amber-500/20">
                            مبلغ الرهان المعتمد لهذه المباراة: {match.fixedStakeAmount} 🪙
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1">
                              {[50, 100, 250, 500].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setQuickBetStake(preset); }}
                                  className={`flex-1 text-[10px] font-extrabold py-1 rounded border transition-all ${
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
                              className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-center focus:border-emerald-500 focus:outline-none"
                              placeholder="المبلغ بالكوينز"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleConfirmQuickCardBet(e, match)}
                          className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                          id={`confirm-card-quick-bet-btn-${match.id}`}
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>تأكيد الرهان بقيمة {match.fixedStakeAmount || quickBetStake} 🪙</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-zinc-900/60 flex justify-between items-center text-[10px] text-zinc-500">
                  <span className="text-zinc-400 font-semibold">{match.league}</span>
                  <span className="text-emerald-400 font-bold hover:underline">عرض الإحصائيات والتفاصيل 📊</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Column 2 & 3: Match Details, Betting, stats & AI Predictor */}
      <div className="lg:col-span-2 space-y-6">
        {selectedMatch ? (
          <>
            {/* Back button above match details on mobile & desktop */}
            <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-md">
              <button
                onClick={() => onSelectMatch(null as any)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
                id="events-back-to-list-btn"
              >
                {dir === 'rtl' ? <ChevronRight className="h-4.5 w-4.5 stroke-[2.5]" /> : <ChevronLeft className="h-4.5 w-4.5 stroke-[2.5]" />}
                <span>الرجوع إلى قائمة المباريات</span>
              </button>
              <span className="text-xs text-zinc-400 font-semibold truncate max-w-[150px] sm:max-w-none">
                تفاصيل مباراة {selectedMatch.teamHome} × {selectedMatch.teamAway}
              </span>
            </div>

            {/* A. Selected Match Scoreboard */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1 w-full bg-emerald-500" />
              
              <div className="flex justify-between items-center text-xs text-zinc-400 mb-4">
                <span>{selectedMatch.league}</span>
                <span>{getSportBadge(selectedMatch.sport)}</span>
              </div>

              {/* Score display */}
              <div className="grid grid-cols-3 items-center text-center py-4">
                <div className="space-y-2">
                  <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
                    {selectedMatch.logoHome}
                  </div>
                  <h4 className="text-base font-bold text-white">{selectedMatch.teamHome}</h4>
                </div>

                <div className="space-y-1">
                  {selectedMatch.status === 'scheduled' ? (
                    <div className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-emerald-400 font-bold inline-block">
                      {selectedMatch.time}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center gap-4 text-4xl font-black text-white tracking-tight">
                      <span>{selectedMatch.scoreHome}</span>
                      <span className="text-zinc-600">:</span>
                      <span>{selectedMatch.scoreAway}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    {selectedMatch.status === 'live' ? `مباشر دقيقة ${selectedMatch.minutes}'` : selectedMatch.status === 'finished' ? 'انتهت كاملة' : 'مباراة قادمة'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
                    {selectedMatch.logoAway}
                  </div>
                  <h4 className="text-base font-bold text-white">{selectedMatch.teamAway}</h4>
                </div>
              </div>


            </div>

            {/* B. Two Column widgets: Betting slip vs Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Betting Slip */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between">
                <form onSubmit={handlePlaceBetSubmit} className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
                    <Coins className="h-4 w-4 text-emerald-400" />
                    <span>بطاقة الرهان (Betting Slip)</span>
                  </h3>

                  {betSuccessMsg && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                      {betSuccessMsg}
                    </div>
                  )}

                  {betErrorMsg && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                      {betErrorMsg}
                    </div>
                  )}

                  {currentUser && activeBets.some(b => b.userId === currentUser.id && b.matchId === selectedMatch.id) ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                        <Lock className="h-4 w-4 shrink-0" />
                        <span>لديك رهان نشط مسجل مسبقاً لهذه المباراة</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                        يسمح النظام باشتراك رهان واحد فقط لكل مباراة لكل لاعب لضمان التكافؤ والعدالة. الرهانات نهائية ولا يمكن تعديلها أو إلغاؤها بعد الاشتراك.
                      </p>
                      {(() => {
                        const existingBet = activeBets.find(b => b.userId === currentUser.id && b.matchId === selectedMatch.id);
                        if (!existingBet) return null;
                        return (
                          <div className="bg-zinc-950/80 rounded-xl p-3 border border-amber-500/20 text-xs font-mono space-y-1.5">
                            <div className="flex justify-between text-zinc-300">
                              <span>التوقع المختار:</span>
                              <span className="font-bold text-emerald-400">
                                {existingBet.selectedOutcome === 'home' ? `فوز ${existingBet.teamHome}` : existingBet.selectedOutcome === 'away' ? `فوز ${existingBet.teamAway}` : 'التعادل'}
                              </span>
                            </div>
                            <div className="flex justify-between text-zinc-300">
                              <span>المبلغ المستثمر:</span>
                              <span className="font-bold text-amber-400">{existingBet.amount.toLocaleString()} 🪙</span>
                            </div>
                            <div className="flex justify-between text-zinc-300">
                              <span>المعامل النهائي:</span>
                              <span className="font-bold text-white">x{existingBet.odds.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : selectedMatch.status === 'finished' ? (
                    <div className="text-center py-6 text-zinc-500 text-xs">
                      المباراة منتهية بالفعل، لا يمكن قبول رهانات جديدة عليها.
                    </div>
                  ) : (
                    <>
                      {/* Featured Bet Special Banner */}
                      {selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 && (
                        <div className="rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-950/80 via-zinc-950 to-purple-950/80 p-3 text-xs text-purple-300 flex items-center justify-between shadow-lg shadow-purple-500/10 animate-pulse">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                            <div>
                              <div className="font-black text-white text-xs">
                                {selectedMatch.featuredBetLabel || `🔥 رهان مميز - مضاعفة الأرباح x${selectedMatch.featuredBetMultiplier}`}
                              </div>
                              <div className="text-[10px] text-purple-300/80 font-medium">
                                مضاعفة مخصصة من الأدمن ترفع قيمة الربح النهائي!
                              </div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-purple-500 text-white font-black text-xs shadow-md">
                            x{selectedMatch.featuredBetMultiplier} مضاعف
                          </span>
                        </div>
                      )}

                      {/* Pick outcome */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-semibold text-zinc-400">اختر التوقع (فوز - تعادل - خسارة):</label>
                          <span className="text-[10px] text-emerald-400 font-medium">اختيار حر مفتوح</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {/* Home Win / Outcome 1 */}
                          <button
                            type="button"
                            onClick={() => setBetOutcome('home')}
                            className={`rounded-xl p-2.5 border text-center font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                              betOutcome === 'home' 
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/40' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                            }`}
                            id="bet-outcome-home"
                          >
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950/20 text-current font-extrabold mb-0.5">1 - فوز</span>
                            <span className="text-xs truncate max-w-full">
                              {selectedMatch.customLabelHome || `فوز (${selectedMatch.teamHome})`}
                            </span>
                            <div className="flex items-center justify-center gap-1 font-mono text-[10px] mt-0.5 opacity-90">
                              <span>
                                {((selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 ? selectedMatch.oddsHome * selectedMatch.featuredBetMultiplier : selectedMatch.oddsHome)).toFixed(2)}
                              </span>
                              {selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 && (
                                <span className="text-[9px] bg-purple-500/30 text-purple-200 px-1 rounded font-black">
                                  🔥x{selectedMatch.featuredBetMultiplier}
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Draw / Outcome X */}
                          <button
                            type="button"
                            onClick={() => setBetOutcome('draw')}
                            className={`rounded-xl p-2.5 border text-center font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                              betOutcome === 'draw' 
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/40' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                            }`}
                            id="bet-outcome-draw"
                          >
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950/20 text-current font-extrabold mb-0.5">X - تعادل</span>
                            <span className="text-xs truncate max-w-full">
                              {selectedMatch.customLabelDraw || 'تعادل'}
                            </span>
                            <div className="flex items-center justify-center gap-1 font-mono text-[10px] mt-0.5 opacity-90">
                              <span>
                                {((selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 ? selectedMatch.oddsDraw * selectedMatch.featuredBetMultiplier : selectedMatch.oddsDraw)).toFixed(2)}
                              </span>
                              {selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 && (
                                <span className="text-[9px] bg-purple-500/30 text-purple-200 px-1 rounded font-black">
                                  🔥x{selectedMatch.featuredBetMultiplier}
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Away Win / Outcome 2 */}
                          <button
                            type="button"
                            onClick={() => setBetOutcome('away')}
                            className={`rounded-xl p-2.5 border text-center font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                              betOutcome === 'away' 
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/40' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                            }`}
                            id="bet-outcome-away"
                          >
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950/20 text-current font-extrabold mb-0.5">2 - خسارة</span>
                            <span className="text-xs truncate max-w-full">
                              {selectedMatch.customLabelAway || `خسارة (${selectedMatch.teamAway})`}
                            </span>
                            <div className="flex items-center justify-center gap-1 font-mono text-[10px] mt-0.5 opacity-90">
                              <span>
                                {((selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 ? selectedMatch.oddsAway * selectedMatch.featuredBetMultiplier : selectedMatch.oddsAway)).toFixed(2)}
                              </span>
                              {selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 && (
                                <span className="text-[9px] bg-purple-500/30 text-purple-200 px-1 rounded font-black">
                                  🔥x{selectedMatch.featuredBetMultiplier}
                                </span>
                              )}
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Bet amount */}
                      <div>
                        <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5">
                          <label className="font-semibold flex items-center gap-1">
                            <span>مبلغ الرهان (كوينز):</span>
                            {selectedMatch.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0 && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-md font-bold">
                                🔒 قيمة ثابتة مخصصة من الإدارة
                              </span>
                            )}
                          </label>
                          <span>رصيدك: {currentUser?.balance || 0} 🪙</span>
                        </div>

                        {selectedMatch.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0 ? (
                          <div className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-300 flex items-center justify-between font-bold">
                            <span>قيمة الرهان الثابتة المحددة لهذه المباراة:</span>
                            <span className="text-sm font-black text-amber-400">{selectedMatch.fixedStakeAmount} 🪙</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="number"
                              value={Number.isNaN(betAmount) ? '' : betAmount}
                              onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-bold shadow-inner"
                              id="bet-amount-input"
                              placeholder="أدخل قيمة الرهان بالكوينز"
                            />
                            {/* Fast preset amount chips */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-zinc-400 font-bold ml-1">تحديد سريع:</span>
                              {[50, 100, 250, 500].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setBetAmount(preset)}
                                  className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                                    betAmount === preset
                                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black shadow'
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
                                  className="text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all active:scale-95 cursor-pointer"
                                >
                                  الكل ({currentUser.balance} 🪙)
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="bg-zinc-900/30 rounded-xl p-3 border border-zinc-900 text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">مجموع الرهان:</span>
                          <span className="font-bold text-white">
                            {selectedMatch.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0 ? selectedMatch.fixedStakeAmount : betAmount} 🪙
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">معامل الاحتمال النهائي (Odds):</span>
                          <span className="font-bold text-white flex items-center gap-1">
                            {((betOutcome === 'home' ? selectedMatch.oddsHome : betOutcome === 'away' ? selectedMatch.oddsAway : selectedMatch.oddsDraw) * (selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 ? selectedMatch.featuredBetMultiplier : 1)).toFixed(2)}
                            {selectedMatch.isFeaturedBet && selectedMatch.featuredBetMultiplier && selectedMatch.featuredBetMultiplier > 1 && (
                              <span className="text-[9px] text-purple-400 font-black">
                                (مضاعف x{selectedMatch.featuredBetMultiplier})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-zinc-900/60 pt-1.5 font-bold">
                          <span className="text-emerald-400">الربح الصافي المتوقع عند الفوز:</span>
                          <span className="text-amber-400 font-black text-sm">
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
                        className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
                        id="place-bet-btn"
                      >
                        {currentUser ? 'تأكيد وتثبيت الرهان' : 'سجل دخولك لوضع رهاناتك'}
                      </button>
                    </>
                  )}
                </form>
              </div>

              {/* Match Stats Column */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span>إحصائيات اللقاء التحليلية</span>
                  </h3>
                  
                  {/* View Toggles */}
                  <div className="flex bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => setStatsViewTab('charts')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        statsViewTab === 'charts' 
                          ? 'bg-emerald-500 text-zinc-950 shadow-sm' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      مخططات ذكية 📊
                    </button>
                    <button
                      onClick={() => setStatsViewTab('traditional')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        statsViewTab === 'traditional' 
                          ? 'bg-emerald-500 text-zinc-950 shadow-sm' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      أرقام تقليدية 📈
                    </button>
                  </div>
                </div>

                {statsViewTab === 'traditional' ? (
                  <div className="space-y-4 text-xs">
                    {/* Possession */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold text-zinc-400">
                        <span>الاستحواذ (مضيف) {selectedMatch.stats.possessionHome}%</span>
                        <span>{selectedMatch.stats.possessionAway}% (ضيف)</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-900 overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${selectedMatch.stats.possessionHome}%` }} />
                        <div className="h-full bg-zinc-700" style={{ width: `${selectedMatch.stats.possessionAway}%` }} />
                      </div>
                    </div>

                    {/* Shots */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold text-zinc-400">
                        <span>التسديدات {selectedMatch.stats.shotsHome}</span>
                        <span>{selectedMatch.stats.shotsAway}</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-900 overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${(selectedMatch.stats.shotsHome / (selectedMatch.stats.shotsHome + selectedMatch.stats.shotsAway || 1)) * 100}%` }} />
                        <div className="h-full bg-zinc-700" style={{ width: `${(selectedMatch.stats.shotsAway / (selectedMatch.stats.shotsHome + selectedMatch.stats.shotsAway || 1)) * 100}%` }} />
                      </div>
                    </div>

                    {/* Corners */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold text-zinc-400">
                        <span>الركنيات {selectedMatch.stats.cornersHome}</span>
                        <span>{selectedMatch.stats.cornersAway}</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-900 overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${(selectedMatch.stats.cornersHome / (selectedMatch.stats.cornersHome + selectedMatch.stats.cornersAway || 1)) * 100}%` }} />
                        <div className="h-full bg-zinc-700" style={{ width: `${(selectedMatch.stats.cornersAway / (selectedMatch.stats.cornersHome + selectedMatch.stats.cornersAway || 1)) * 100}%` }} />
                      </div>
                    </div>

                    {/* Fouls */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold text-zinc-400">
                        <span>الأخطاء {selectedMatch.stats.foulsHome}</span>
                        <span>{selectedMatch.stats.foulsAway}</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-900 overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${(selectedMatch.stats.foulsHome / (selectedMatch.stats.foulsHome + selectedMatch.stats.foulsAway || 1)) * 100}%` }} />
                        <div className="h-full bg-zinc-700" style={{ width: `${(selectedMatch.stats.foulsAway / (selectedMatch.stats.foulsHome + selectedMatch.stats.foulsAway || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Recharts Block 1: Ball Possession Donut */}
                    <div className="rounded-xl bg-zinc-900/30 border border-zinc-900 p-3 flex flex-col items-center">
                      <span className="text-[10px] font-bold text-zinc-400 mb-2">مقارنة نسبة الاستحواذ الكلية</span>
                      
                      {(() => {
                        const hPoss = selectedMatch.stats.possessionHome || 50;
                        const aPoss = selectedMatch.stats.possessionAway || 50;
                        const possessionData = [
                          { name: selectedMatch.teamHome, value: hPoss, color: '#10b981' },
                          { name: selectedMatch.teamAway, value: aPoss, color: '#3b82f6' }
                        ];
                        return (
                          <div className="relative w-full h-40 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={possessionData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={38}
                                  outerRadius={50}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {possessionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomPossessionTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                              <span className="text-[9px] text-zinc-500 font-bold">الاستحواذ</span>
                              <span className="text-xs font-black text-white">{hPoss}% - {aPoss}%</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Donut Legend */}
                      <div className="flex gap-4 justify-center text-[10px] font-bold mt-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span className="text-zinc-300">{selectedMatch.teamHome} ({selectedMatch.stats.possessionHome}%)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                          <span className="text-zinc-300">{selectedMatch.teamAway} ({selectedMatch.stats.possessionAway}%)</span>
                        </span>
                      </div>
                    </div>

                    {/* Recharts Block 2: Performance metrics comparative Bar Chart */}
                    <div className="rounded-xl bg-zinc-900/30 border border-zinc-900 p-3">
                      <span className="text-[10px] font-bold text-zinc-400 block text-center mb-3">مقارنة التسديدات، الركنيات، والأخطاء</span>
                      
                      {(() => {
                        const barData = [
                          {
                            name: 'التسديدات',
                            [selectedMatch.teamHome]: selectedMatch.stats.shotsHome || 0,
                            [selectedMatch.teamAway]: selectedMatch.stats.shotsAway || 0,
                          },
                          {
                            name: 'الركنيات',
                            [selectedMatch.teamHome]: selectedMatch.stats.cornersHome || 0,
                            [selectedMatch.teamAway]: selectedMatch.stats.cornersAway || 0,
                          },
                          {
                            name: 'الأخطاء',
                            [selectedMatch.teamHome]: selectedMatch.stats.foulsHome || 0,
                            [selectedMatch.teamAway]: selectedMatch.stats.foulsAway || 0,
                          }
                        ];
                        return (
                          <div className="w-full h-44">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={barData}
                                margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                                barSize={12}
                              >
                                <XAxis 
                                  dataKey="name" 
                                  stroke="#71717a" 
                                  fontSize={9} 
                                  tickLine={false} 
                                  axisLine={false}
                                />
                                <YAxis 
                                  stroke="#71717a" 
                                  fontSize={9} 
                                  tickLine={false} 
                                  axisLine={false} 
                                  allowDecimals={false}
                                />
                                <Tooltip 
                                  content={<CustomStatsBarTooltip />} 
                                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} 
                                />
                                <Bar 
                                  name={selectedMatch.teamHome} 
                                  dataKey={selectedMatch.teamHome} 
                                  fill="#10b981" 
                                  radius={[3, 3, 0, 0]} 
                                />
                                <Bar 
                                  name={selectedMatch.teamAway} 
                                  dataKey={selectedMatch.teamAway} 
                                  fill="#3b82f6" 
                                  radius={[3, 3, 0, 0]} 
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        );
                      })()}

                      {/* Bar chart Legend */}
                      <div className="flex gap-4 justify-center text-[10px] font-bold mt-2">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span className="text-zinc-300">{selectedMatch.teamHome}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                          <span className="text-zinc-300">{selectedMatch.teamAway}</span>
                        </span>
                      </div>

                    </div>
                  </div>
                )}

                {currentMatchBets.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-900">
                    <span className="text-[10px] font-bold text-emerald-400">رهاناتك الحالية على المباراة:</span>
                    <div className="space-y-1.5 mt-2">
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

            {/* Head-to-Head Section */}
            {selectedMatch.headToHead && (
              <div 
                className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl relative overflow-hidden space-y-6"
                id="head-to-head-pane"
              >
                <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-900 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <History className="h-4 w-4 text-amber-400" />
                      <span>سجل المواجهات المباشرة التاريخي (H2H)</span>
                    </span>
                    <span className="text-zinc-500 text-[11px]">إجمالي المواجهات: {selectedMatch.headToHead.totalMatches} مباراة</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1">
                    <div className="bg-zinc-950 p-2.5 rounded-xl border border-emerald-500/20">
                      <div className="text-[11px] font-bold text-zinc-400 truncate">{selectedMatch.teamHome}</div>
                      <div className="text-xl font-black text-emerald-400">{selectedMatch.headToHead.homeWins} فوز</div>
                    </div>
                    <div className="bg-zinc-950 p-2.5 rounded-xl border border-amber-500/20">
                      <div className="text-[11px] font-bold text-zinc-400">التعادل</div>
                      <div className="text-xl font-black text-amber-400">{selectedMatch.headToHead.draws}</div>
                    </div>
                    <div className="bg-zinc-950 p-2.5 rounded-xl border border-blue-500/20">
                      <div className="text-[11px] font-bold text-zinc-400 truncate">{selectedMatch.teamAway}</div>
                      <div className="text-xl font-black text-blue-400">{selectedMatch.headToHead.awayWins} فوز</div>
                    </div>
                  </div>

                  {selectedMatch.headToHead.recentMatches && selectedMatch.headToHead.recentMatches.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-900/60">
                      <span className="text-[11px] text-zinc-400 font-semibold block">آخر اللقاءات المباشرة المسجلة:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedMatch.headToHead.recentMatches.slice(0, 4).map((m, idx) => (
                          <div key={idx} className="bg-zinc-950/80 p-2 rounded-lg border border-zinc-900 flex items-center justify-between text-[11px]">
                            <span className="text-zinc-400">{m.date} ({m.competition})</span>
                            <span className="font-bold text-amber-300 font-mono">{m.homeTeam} {m.scoreHome} - {m.scoreAway} {m.awayTeam}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-12 text-center text-zinc-500 text-sm">
            يرجى اختيار مباراة من القائمة لعرض تفاصيلها والإحصائيات.
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
