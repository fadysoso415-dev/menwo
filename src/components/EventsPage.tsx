import React, { useState, useEffect, useRef } from 'react';
import { Match, Bet, User, PublicBetOffer } from '../types';
import PublicBetsSection from './PublicBetsSection';
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
  PieChart as PieIcon
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
  onSimulateMatchFinished: (matchId: string, scoreHome: number, scoreAway: number, stats: any) => void;
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
  const [sportFilter, setSportFilter] = useState<'all' | 'football' | 'basketball' | 'tennis'>('all');
  const [betOutcome, setBetOutcome] = useState<'home' | 'draw' | 'away'>('home');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [betSuccessMsg, setBetSuccessMsg] = useState('');
  const [betErrorMsg, setBetErrorMsg] = useState('');
  const [statsViewTab, setStatsViewTab] = useState<'charts' | 'traditional'>('charts');

  // AI Prediction States
  const [aiPrediction, setAiPrediction] = useState<AiPredictionData | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  // Live Match Simulation States
  const [simulating, setSimulating] = useState(false);
  const [simMinute, setSimMinute] = useState(0);
  const [simScoreHome, setSimScoreHome] = useState(0);
  const [simScoreAway, setSimScoreAway] = useState(0);
  const [simEvents, setSimEvents] = useState<string[]>([]);
  const [simStats, setSimStats] = useState<any>(null);

  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Set initial selected match if none is selected
  useEffect(() => {
    if (!selectedMatch && matches.length > 0) {
      onSelectMatch(matches[0]);
    }
  }, [matches, selectedMatch, onSelectMatch]);

  // Reset states when selected match changes
  useEffect(() => {
    setAiPrediction(null);
    setAiError('');
    setBetSuccessMsg('');
    setBetErrorMsg('');
    setSimulating(false);
    setSimEvents([]);

    if (selectedMatch?.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0) {
      setBetAmount(selectedMatch.fixedStakeAmount);
    }
  }, [selectedMatch]);

  // Auto-scroll simulation events console
  useEffect(() => {
    if (eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simEvents]);

  const filteredMatches = matches.filter(match => {
    if (sportFilter === 'all') return true;
    return match.sport === sportFilter;
  });

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
      setBetErrorMsg('رصيدك غير كافٍ لإتمام هذا الرهان الافتراضي. يرجى شحن الرصيد مجاناً من لوحتك.');
      return;
    }

    onPlaceBet(selectedMatch.id, betOutcome, effectiveAmount);
    setBetSuccessMsg('تم تسجيل الرهان الافتراضي بنجاح! سيتم تسوية الرهان فوراً عند انتهاء المباراة.');
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

  // 2. Interactive Real-Time Match Simulation Engine
  const startMatchSimulation = () => {
    if (!selectedMatch) return;
    setSimulating(true);
    setSimMinute(0);
    setSimScoreHome(0);
    setSimScoreAway(0);
    setSimEvents(['🚀 انطلاق المباراة وصافرة البداية ترن في أرجاء الملعب!']);

    let currentHome = 0;
    let currentAway = 0;
    let currentMinute = 0;

    const gameEvents = [
      { min: 10, prob: 0.3, homeEv: '⚽ هدف رائع للمضيف بعد تمريرة حاسمة مبهرة!', awayEv: '⚽ هدف أول للضيف يسكت جماهير الملعب!' },
      { min: 25, prob: 0.25, homeEv: '🟨 بطاقة صفراء لمدافع المضيف بعد تدخل خشن لمنع هجمة مرتدة.', awayEv: '🟨 بطاقة صفراء للاعب وسط الفريق الضيف.' },
      { min: 38, prob: 0.2, homeEv: '🔥 هجمة خطيرة للمضيف تصطدم بالعارضة وتحبس الأنفاس!', awayEv: '🔥 انفراد تام للفريق الضيف لكن الحارس يتألق بإنقاذ تاريخي!' },
      { min: 45, prob: 1.0, homeEv: '⏳ نهاية الشوط الأول بتبادل هجومي حاد وسيطرة نسبية.', awayEv: '⏳ صافرة الشوط الأول تُنهي المعركة التكتيكية مؤقتاً.' },
      { min: 58, prob: 0.3, homeEv: '⚽ جول! رأسية متقنة تمنح أصحاب الأرض الأفضلية الكاسحة!', awayEv: '⚽ جول! تسديدة صاروخية بعيدة المدى تعلن تقدم الضيف!' },
      { min: 72, prob: 0.2, homeEv: '🟥 بطاقة حمراء مباشرة للاعب المضيف بعد مراجعة الـ VAR لتهور خشن!', awayEv: '🟥 بطاقة حمراء للاعب الضيف بداعي سلوك غير رياضي!' },
      { min: 85, prob: 0.4, homeEv: '⚽ هدف قاتل في الدقائق الأخيرة يثير جنون الجماهير في المدرجات!', awayEv: '⚽ هدف قاتل للضيوف يقلب الطاولة بالكامل في وقت حرج!' },
      { min: 90, prob: 1.0, homeEv: '🏁 صافرة النهاية تعلن انتهاء المباراة الملحمية وصراع العمالقة!', awayEv: '🏁 صافرة النهاية تسدل الستار على مواجهة تكتيكية رفيعة المستوى!' }
    ];

    const interval = setInterval(() => {
      currentMinute += 10;
      if (currentMinute > 90) {
        clearInterval(interval);
        setSimulating(false);

        // Save simulated result
        const finalStats = {
          possessionHome: 40 + Math.floor(Math.random() * 20),
          possessionAway: 100 - (40 + Math.floor(Math.random() * 20)),
          shotsHome: 5 + Math.floor(Math.random() * 12),
          shotsAway: 5 + Math.floor(Math.random() * 12),
          cornersHome: Math.floor(Math.random() * 8),
          cornersAway: Math.floor(Math.random() * 8),
          foulsHome: 8 + Math.floor(Math.random() * 8),
          foulsAway: 8 + Math.floor(Math.random() * 8)
        };
        onSimulateMatchFinished(selectedMatch.id, currentHome, currentAway, finalStats);
        return;
      }

      setSimMinute(currentMinute);

      // Trigger probability-based events
      const potentialEvent = gameEvents.find(e => e.min === currentMinute);
      if (potentialEvent && Math.random() < potentialEvent.prob) {
        const isHomeEvent = Math.random() > 0.5;
        if (isHomeEvent) {
          if (potentialEvent.homeEv.includes('⚽')) {
            currentHome += 1;
            setSimScoreHome(currentHome);
            if (onScoreChangeToast && selectedMatch) {
              onScoreChangeToast(selectedMatch, currentHome, currentAway, selectedMatch.teamHome);
            }
          }
          setSimEvents(prev => [...prev, `⏱️ دقيقة ${currentMinute}': ${potentialEvent.homeEv}`]);
        } else {
          if (potentialEvent.awayEv.includes('⚽')) {
            currentAway += 1;
            setSimScoreAway(currentAway);
            if (onScoreChangeToast && selectedMatch) {
              onScoreChangeToast(selectedMatch, currentHome, currentAway, selectedMatch.teamAway);
            }
          }
          setSimEvents(prev => [...prev, `⏱️ دقيقة ${currentMinute}': ${potentialEvent.awayEv}`]);
        }
      } else {
        // Normal progression logs
        const passiveLogs = [
          `صراع قوي للسيطرة على وسط الملعب وهجمات متبادلة.`,
          `ضغط هجومي متواصل وتراجع دفاعي منظم من الفريقين.`,
          `تمريرات بينية جميلة في الخلف لمحاولة فك الثغرات.`,
          `ركنيات متبادلة وتألق من دفاع كلا الطرفين.`
        ];
        const randomLog = passiveLogs[Math.floor(Math.random() * passiveLogs.length)];
        setSimEvents(prev => [...prev, `⏱️ دقيقة ${currentMinute}': ${randomLog}`]);
      }

    }, 1200); // 1.2s per 10 mins makes complete game simulation last ~11s
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
    <div className="space-y-6 py-6" dir="rtl">
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
      <div className="space-y-4 lg:col-span-1">
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

                <div className="mt-3 pt-2 border-t border-zinc-900/60 flex justify-between items-center text-[10px] text-zinc-500">
                  <span>معامل الفوز: {match.oddsHome.toFixed(1)} - {match.oddsDraw.toFixed(1)} - {match.oddsAway.toFixed(1)}</span>
                  <span className="text-emerald-400 font-bold">عرض التفاصيل 📊</span>
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
                      <span>{simulating ? simScoreHome : selectedMatch.scoreHome}</span>
                      <span className="text-zinc-600">:</span>
                      <span>{simulating ? simScoreAway : selectedMatch.scoreAway}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    {simulating ? `محاكاة الشوط ${simMinute <= 45 ? 'الأول' : 'الثاني'}` : selectedMatch.status === 'live' ? `مباشر دقيقة ${selectedMatch.minutes}'` : selectedMatch.status === 'finished' ? 'انتهت كاملة' : 'غداً'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
                    {selectedMatch.logoAway}
                  </div>
                  <h4 className="text-base font-bold text-white">{selectedMatch.teamAway}</h4>
                </div>
              </div>

              {/* Simulation Log (Active during match simulation) */}
              {simulating && (
                <div className="mt-6 rounded-xl bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-emerald-400">محاكي مينوو المباشر: {simMinute}' دقيقة</span>
                  </div>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto text-xs text-zinc-300 border-r-2 border-emerald-500/20 pr-3">
                    {simEvents.map((ev, i) => (
                      <p key={i} className="animate-fade-in">{ev}</p>
                    ))}
                    <div ref={eventsEndRef} />
                  </div>
                </div>
              )}

              {/* Match Action Buttons */}
              <div className="mt-5 pt-4 border-t border-zinc-900 flex flex-wrap gap-3">
                {selectedMatch.status !== 'finished' && !simulating && (
                  <button
                    onClick={startMatchSimulation}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-zinc-950 py-3 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                    id="trigger-simulation-btn"
                  >
                    <Play className="h-4.5 w-4.5 text-zinc-950 fill-zinc-950" />
                    <span>محاكاة اللعب وإنهاء اللقاء فورا ⚡</span>
                  </button>
                )}

                <button
                  onClick={fetchPrediction}
                  disabled={loadingAi}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-5 py-3 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-2 justify-center shadow-lg shadow-emerald-500/5 active:scale-95"
                  id="generate-prediction-btn"
                >
                  {loadingAi ? (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                  )}
                  <span>توقع وتحليل الذكاء الاصطناعي (Gemini AI) ✨</span>
                </button>
              </div>
            </div>

            {/* B. Two Column widgets: Betting slip vs Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Betting Slip */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between">
                <form onSubmit={handlePlaceBetSubmit} className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
                    <Coins className="h-4 w-4 text-emerald-400" />
                    <span>بطاقة الرهان الافتراضي (Sim Slip)</span>
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

                  {selectedMatch.status === 'finished' ? (
                    <div className="text-center py-6 text-zinc-500 text-xs">
                      المباراة منتهية بالفعل، لا يمكن قبول رهانات جديدة عليها.
                    </div>
                  ) : (
                    <>
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
                            <span className="block text-[10px] font-mono mt-0.5 opacity-80">{selectedMatch.oddsHome.toFixed(2)}</span>
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
                            <span className="block text-[10px] font-mono mt-0.5 opacity-80">{selectedMatch.oddsDraw.toFixed(2)}</span>
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
                            <span className="block text-[10px] font-mono mt-0.5 opacity-80">{selectedMatch.oddsAway.toFixed(2)}</span>
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
                          <input
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full rounded-lg border border-zinc-900 bg-zinc-900/50 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            id="bet-amount-input"
                          />
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
                          <span className="text-zinc-500">معامل الاحتمال المختار:</span>
                          <span className="font-bold text-white">
                            {betOutcome === 'home' ? selectedMatch.oddsHome.toFixed(2) : betOutcome === 'away' ? selectedMatch.oddsAway.toFixed(2) : selectedMatch.oddsDraw.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-zinc-900/60 pt-1.5 font-bold">
                          <span className="text-emerald-400">الربح الصافي المتوقع:</span>
                          <span className="text-amber-400">
                            {Math.round(
                              (selectedMatch.fixedStakeAmount && selectedMatch.fixedStakeAmount > 0 ? selectedMatch.fixedStakeAmount : betAmount) * 
                              (betOutcome === 'home' ? selectedMatch.oddsHome : betOutcome === 'away' ? selectedMatch.oddsAway : selectedMatch.oddsDraw)
                            )} 🪙
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
                        id="place-bet-btn"
                      >
                        {currentUser ? 'تثبيت الرهان الافتراضي' : 'سجل دخولك لوضع رهانات افتراضية'}
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

            {/* C. AI Match Predictor Response Pane */}
            {(loadingAi || aiPrediction || aiError) && (
              <div 
                className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl relative overflow-hidden space-y-6"
                id="ai-prediction-pane"
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
                    <div>
                      <h3 className="text-base font-bold text-white">توقع وتحليل الذكاء الاصطناعي (Gemini AI)</h3>
                      <p className="text-xs text-zinc-500">نسب احتمالية الفوز والتحليل الفني المعمق للمباراة</p>
                    </div>
                  </div>

                  {aiPrediction?.confidence && (
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      درجة الثقة: {aiPrediction.confidence}
                    </span>
                  )}
                </div>

                {loadingAi && (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-400 text-xs gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                    <span className="font-semibold text-zinc-300">جاري تحليل إحصائيات المباراة وتوقع النسب باستخدام Gemini...</span>
                    <span className="text-zinc-500 text-[11px]">مقارنة الأداء، المواجهات المباشرة ومحرك البحث الرياضي Google Grounding</span>
                  </div>
                )}

                {aiError && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400">
                    {aiError}
                  </div>
                )}

                {aiPrediction && (
                  <div className="space-y-6">
                    {/* 1. Win Probabilities Distribution Section */}
                    <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-900 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                        <span className="flex items-center gap-1">
                          <Activity className="h-4 w-4 text-emerald-400" />
                          <span>توزيع احتمالية فوز كل فريق:</span>
                        </span>
                        <span className="text-zinc-500 font-mono text-[11px]">مجموع الاحتمالات = 100%</span>
                      </div>

                      {/* Team Cards with Percentages */}
                      <div className="grid grid-cols-3 gap-2 text-center py-1">
                        {/* Home Team Prob */}
                        <div className="bg-zinc-950 p-3 rounded-xl border border-emerald-500/30 space-y-1">
                          <div className="text-xs font-bold text-zinc-300 truncate">{selectedMatch.teamHome}</div>
                          <div className="text-2xl font-black text-emerald-400">{aiPrediction.homeWinProb}%</div>
                          <div className="text-[10px] text-emerald-500/80 font-semibold">فوز المضيف</div>
                        </div>

                        {/* Draw Prob (if applicable) */}
                        {aiPrediction.drawProb > 0 ? (
                          <div className="bg-zinc-950 p-3 rounded-xl border border-amber-500/30 space-y-1">
                            <div className="text-xs font-bold text-zinc-300">التعادل</div>
                            <div className="text-2xl font-black text-amber-400">{aiPrediction.drawProb}%</div>
                            <div className="text-[10px] text-amber-500/80 font-semibold">تعادل الفريقين</div>
                          </div>
                        ) : (
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1 opacity-50">
                            <div className="text-xs font-bold text-zinc-400">التعادل</div>
                            <div className="text-lg font-bold text-zinc-500">غير متاح</div>
                            <div className="text-[10px] text-zinc-600">رياضة حسم</div>
                          </div>
                        )}

                        {/* Away Team Prob */}
                        <div className="bg-zinc-950 p-3 rounded-xl border border-blue-500/30 space-y-1">
                          <div className="text-xs font-bold text-zinc-300 truncate">{selectedMatch.teamAway}</div>
                          <div className="text-2xl font-black text-blue-400">{aiPrediction.awayWinProb}%</div>
                          <div className="text-[10px] text-blue-500/80 font-semibold">فوز الضيف</div>
                        </div>
                      </div>

                      {/* Segmented Progress Bar */}
                      <div className="space-y-1">
                        <div className="h-3.5 w-full bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800 p-0.5">
                          <div 
                            style={{ width: `${aiPrediction.homeWinProb}%` }} 
                            className="bg-emerald-500 h-full rounded-r-full transition-all duration-700"
                            title={`${selectedMatch.teamHome}: ${aiPrediction.homeWinProb}%`}
                          />
                          {aiPrediction.drawProb > 0 && (
                            <div 
                              style={{ width: `${aiPrediction.drawProb}%` }} 
                              className="bg-amber-400 h-full transition-all duration-700"
                              title={`التعادل: ${aiPrediction.drawProb}%`}
                            />
                          )}
                          <div 
                            style={{ width: `${aiPrediction.awayWinProb}%` }} 
                            className="bg-blue-500 h-full rounded-l-full transition-all duration-700"
                            title={`${selectedMatch.teamAway}: ${aiPrediction.awayWinProb}%`}
                          />
                        </div>

                        <div className="flex justify-between text-[10px] font-bold text-zinc-500 px-1 pt-0.5">
                          <span className="text-emerald-400">{selectedMatch.teamHome} ({aiPrediction.homeWinProb}%)</span>
                          {aiPrediction.drawProb > 0 && <span className="text-amber-400">التعادل ({aiPrediction.drawProb}%)</span>}
                          <span className="text-blue-400">{selectedMatch.teamAway} ({aiPrediction.awayWinProb}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Key Highlights Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {aiPrediction.predictedScore && (
                        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-850 flex items-center justify-between">
                          <span className="text-xs text-zinc-400 font-medium">النتيجة المتوقعة بالذكاء الاصطناعي:</span>
                          <span className="text-base font-black text-white bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 font-mono">
                            {aiPrediction.predictedScore}
                          </span>
                        </div>
                      )}

                      {aiPrediction.recommendedBet && (
                        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-850 flex items-center justify-between">
                          <span className="text-xs text-zinc-400 font-medium">التوصية المرفقة للرهان:</span>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                            {aiPrediction.recommendedBet}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 3. Key Decision Factors */}
                    {aiPrediction.keyFactors && aiPrediction.keyFactors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                          <Flame className="h-4 w-4 text-amber-400" />
                          <span>أهم عوامل الحسم الفنية:</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {aiPrediction.keyFactors.map((factor, idx) => (
                            <div key={idx} className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-300 flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Detailed Analysis Text */}
                    {aiPrediction.detailedAnalysis && (
                      <div className="pt-2 border-t border-zinc-900 space-y-2">
                        <h4 className="text-xs font-bold text-zinc-300">التحليل الفني والمعمق:</h4>
                        <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/20 p-4 rounded-xl border border-zinc-900/80">
                          {aiPrediction.detailedAnalysis}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-12 text-center text-zinc-500 text-sm">
            يرجى اختيار مباراة من القائمة لعرض تفاصيلها والإحصائيات وتوقعات الذكاء الاصطناعي.
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
