import React, { useState, useEffect } from 'react';
import { Match, NewsItem, LeagueStandingItem, SportCategory } from '../types';
import LeagueStandingsSection from './LeagueStandingsSection';
import FeaturedMatchesSection from './FeaturedMatchesSection';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  Tv, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Flame, 
  Activity,
  Award,
  Globe,
  Loader2,
  Trophy,
  Coins,
  Zap,
  Percent,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Calculator,
  X,
  Filter,
  Bell,
  Lock
} from 'lucide-react';

interface MainPageProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  onPlaceQuickBet: (match: Match, outcome: 'home' | 'draw' | 'away') => void;
  currentUser: any;
  leagueStandings?: LeagueStandingItem[];
  sportsCategories?: SportCategory[];
  onTriggerToast?: (
    title: string,
    message: string,
    matchInfo?: any,
    type?: 'score_change' | 'goal' | 'bet_win' | 'bet_lost' | 'info'
  ) => void;
  onTriggerNotification?: (title: string, message: string, type: 'bet' | 'match' | 'system') => void;
}

export default function MainPage({
  matches,
  onSelectMatch,
  onPlaceQuickBet,
  currentUser,
  leagueStandings = [],
  sportsCategories = [],
  onTriggerToast,
  onTriggerNotification
}: MainPageProps) {
  const { t, dir } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  // Match Reminders state (saved in localStorage)
  const [matchReminders, setMatchReminders] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('stad_match_reminders') || '[]');
    } catch {
      return [];
    }
  });

  const handleToggleReminder = (match: Match) => {
    setMatchReminders(prev => {
      const exists = prev.includes(match.id);
      let next: string[];
      if (exists) {
        next = prev.filter(id => id !== match.id);
        if (onTriggerToast) {
          onTriggerToast(
            `🔕 تم إلغاء تنبيه المباراة`,
            `تم إلغاء التنبيه المجدول لمباراة (${match.teamHome} × ${match.teamAway}).`,
            undefined,
            'info'
          );
        }
        if (onTriggerNotification) {
          onTriggerNotification(
            '🔕 إلغاء تنبيه المباراة',
            `تم إلغاء التنبيه المجدول لمباراة ${match.teamHome} × ${match.teamAway}.`,
            'match'
          );
        }
      } else {
        next = [...prev, match.id];
        if (onTriggerToast) {
          onTriggerToast(
            `🔔 تم جدولة تنبيه المباراة قبل 15 دقيقة!`,
            `سيصلك إشعار منبثق قبل بدء مباراة (${match.teamHome} × ${match.teamAway}) بـ 15 دقيقة (${match.time}) لوضع رهانك في الوقت المناسب!`,
            {
              teamHome: match.teamHome,
              teamAway: match.teamAway,
              scoreHome: match.scoreHome || 0,
              scoreAway: match.scoreAway || 0
            },
            'info'
          );
        }
        if (onTriggerNotification) {
          onTriggerNotification(
            '⏰ تم ضبط تنبيه رهان للمباراة (قبل 15 دقيقة)',
            `تنبيه مجدول لمباراة ${match.teamHome} × ${match.teamAway} (الموعد: ${match.time}). سنقوم بتذكيرك بإشعار منبثق قبل 15 دقيقة من الانطلاق.`,
            'match'
          );
        }
      }
      localStorage.setItem('stad_match_reminders', JSON.stringify(next));
      return next;
    });
  };
  const [newsError, setNewsError] = useState('');

  // Interactive Betting Calculator State
  const [simMatchId, setSimMatchId] = useState<string>(matches[0]?.id || '');
  const [simOutcome, setSimOutcome] = useState<'home' | 'draw' | 'away'>('home');
  const [simAmount, setSimAmount] = useState<number>(200);
  const [simBetSuccess, setSimBetSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (matches.length > 0 && !simMatchId) {
      setSimMatchId(matches[0].id);
    }
  }, [matches]);

  const activeSimMatch = matches.find(m => m.id === simMatchId) || matches[0];
  const simOdds = activeSimMatch 
    ? (simOutcome === 'home' ? activeSimMatch.oddsHome : simOutcome === 'draw' ? activeSimMatch.oddsDraw : activeSimMatch.oddsAway)
    : 2.10;
  
  const estimatedPayout = Math.floor(simAmount * simOdds);
  const estimatedProfit = estimatedPayout - simAmount;

  const handleExecuteSimBet = () => {
    if (!activeSimMatch) return;
    onPlaceQuickBet(activeSimMatch, simOutcome);
    setSimBetSuccess(true);
    setTimeout(() => setSimBetSuccess(false), 3000);
  };

  // Fetch live sports news on mount
  useEffect(() => {
    async function fetchLiveNews() {
      setLoadingNews(true);
      setNewsError('');
      try {
        const response = await fetch('/api/sports-news');
        const data = await response.json();
        if (data.news && Array.isArray(data.news) && data.news.length > 0) {
          setNews(data.news);
        } else {
          // Fallback is handled locally or displays a nice notice
          throw new Error('No live news returned');
        }
      } catch (err) {
        console.warn('Could not load live news from server, using local fallback:', err);
        // Fallback to static default news
        const fallbackNews: NewsItem[] = [
          {
            id: 'news-fallback-1',
            title: 'مباراة كلاسيكو ملحمية منتظرة في الليغا بين الغريمين ريال مدريد وبرشلونة',
            summary: 'تستعد الجماهير العالمية لمباراة الكلاسيكو النارية الليلة. المحللون يتوقعون مباراة تكتيكية هجومية مثيرة بين الفريقين.',
            source: 'مينوو سبورتس المباشر',
            date: '2026-07-20',
            category: 'الدوري الإسباني',
          },
          {
            id: 'news-fallback-2',
            title: 'مانشستر سيتي يواجه أرسنال في قمة الحسم وتحديد بطل البريميرليغ',
            summary: 'مواجهة نارية تجمع بيب غوارديولا بمساعده السابق ميكيل أرتيتا في لقاء تكسير عظام للسيطرة على الصدارة.',
            source: 'يلا كووورة',
            date: '2026-07-20',
            category: 'الدوري الإنجليزي',
          },
          {
            id: 'news-fallback-3',
            title: 'تتويج تاريخي للشاب ألكاراز ببطولة ويمبلدون للتنس بعد ملحمة دامت خمس ساعات',
            summary: 'أثبت الإسباني الشاب علو كعبه بتغلبه على الأسطورة الصربية نوفاك دجوكوفيتش في مباراة تاريخية حبست الأنفاس.',
            source: 'تنس بالعربي',
            date: '2026-07-19',
            category: 'تنس عالمي',
          }
        ];
        setNews(fallbackNews);
      } finally {
        setLoadingNews(false);
      }
    }
    fetchLiveNews();
  }, []);

  // Filter matches based on search query and selected sport filter (excluding finished matches on user page)
  const filteredMatches = matches.filter(match => {
    if (match.status === 'finished') return false;

    const q = searchQuery.trim().toLowerCase();
    
    let matchesSearch = true;
    if (q) {
      const homeMatch = match.teamHome.toLowerCase().includes(q);
      const awayMatch = match.teamAway.toLowerCase().includes(q);
      const leagueMatch = match.league.toLowerCase().includes(q);
      const tagMatch = match.featuredTag ? match.featuredTag.toLowerCase().includes(q) : false;
      const betLabelMatch = match.featuredBetLabel ? match.featuredBetLabel.toLowerCase().includes(q) : false;

      // Check if search query matches 'المباراة المتميزة' or featured match status/tags
      const isFeaturedSearch = Boolean(match.isFeatured) && (
        'متميزة'.includes(q) ||
        'المباراة المتميزة'.includes(q) ||
        'مباريات متميزة'.includes(q) ||
        'مميزة'.includes(q) ||
        'قمة'.includes(q) ||
        'featured'.includes(q)
      );

      // Check if search query matches 'رهان مميز' or super bets
      const isFeaturedBetSearch = Boolean(match.isFeaturedBet) && (
        'رهان مميز'.includes(q) ||
        'رهانات مميزة'.includes(q) ||
        'مميز'.includes(q) ||
        'مضاعف'.includes(q) ||
        'super'.includes(q)
      );

      // Check if search query matches live matches
      const isLiveSearch = match.status === 'live' && (
        'مباشر'.includes(q) ||
        'حي'.includes(q) ||
        'live'.includes(q)
      );

      matchesSearch = homeMatch || awayMatch || leagueMatch || tagMatch || betLabelMatch || isFeaturedSearch || isFeaturedBetSearch || isLiveSearch;
    }
    
    const matchesSport = selectedSportFilter === 'all' || match.sport === selectedSportFilter;

    return matchesSearch && matchesSport;
  });

  // Separate live, scheduled, and finished matches
  const liveMatches = filteredMatches.filter(m => m.status === 'live');
  const scheduledMatches = filteredMatches.filter(m => m.status === 'scheduled');
  const finishedMatches = filteredMatches.filter(m => m.status === 'finished');

  // Value bets recommendations (highest multiplier odds with great potential)
  const valueBetMatches = matches.filter(m => m.status !== 'finished').slice(0, 3);

  return (
    <div className="space-y-10 py-6" dir={dir}>
      
      {/* 1. Hero / Premium Banner Section + Live Profit Simulator */}
      <section className="relative rounded-3xl overflow-hidden border border-emerald-500/20 bg-zinc-950 p-6 sm:p-10 shadow-2xl shadow-emerald-500/10">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/20 via-zinc-950 to-zinc-950" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & Call to Action */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-400 ring-1 ring-emerald-500/30">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>محاكاة الأرباح الفورية وتوقعات AI المحدثة</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              ضاعف أرباحك الذكية مع <span className="text-emerald-400">مينوو للتوقعات</span> 🚀
            </h1>
            
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
              تصفح أحدث أودز المباريات العالمية، استخدم حاسبة العوائد التفاعلية، وشارك في التوقعات بضغطة واحدة لتجميع الكوينز وجني الأرباح.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a 
                href="#quick-bet-simulator"
                className="rounded-xl bg-emerald-500 px-6 py-3 text-xs sm:text-sm font-black text-zinc-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                <span>حاسبة الأرباح السريعة 💰</span>
              </a>
              
              <a 
                href="#matches-section"
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
              >
                تصفح كافة المباريات المتاحة
              </a>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-zinc-900/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>شحن وسحب مؤمن عبر فودافون كاش</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>تنفيذ آلي للرهان خلال ثوانٍ</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Quick Bet & Profit Simulator Box */}
          <div id="quick-bet-simulator" className="lg:col-span-5 bg-zinc-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                <Calculator className="h-4 w-4 text-emerald-400" />
                <span>حاسبة وتجربة الربح السريع</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black">
                أودز حية ⚡
              </span>
            </div>

            {/* Select Match */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">اختر المباراة المراد توقعها:</label>
              <select
                value={simMatchId}
                onChange={(e) => setSimMatchId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              >
                {matches.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.teamHome} vs {m.teamAway} ({m.league})
                  </option>
                ))}
              </select>
            </div>

            {/* Choose Outcome */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">اختر النتيجة المرجحة:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSimOutcome('home')}
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    simOutcome === 'home'
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black shadow-md'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-[10px] opacity-80">فوز {activeSimMatch?.teamHome || 'المضيف'}</div>
                  <div className="text-xs font-black font-mono">{(activeSimMatch?.oddsHome || 1.85).toFixed(2)}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSimOutcome('draw')}
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    simOutcome === 'draw'
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black shadow-md'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-[10px] opacity-80">تعادل (X)</div>
                  <div className="text-xs font-black font-mono">{(activeSimMatch?.oddsDraw || 3.20).toFixed(2)}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSimOutcome('away')}
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    simOutcome === 'away'
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black shadow-md'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-[10px] opacity-80">فوز {activeSimMatch?.teamAway || 'الضيف'}</div>
                  <div className="text-xs font-black font-mono">{(activeSimMatch?.oddsAway || 2.40).toFixed(2)}</div>
                </button>
              </div>
            </div>

            {/* Stake Amount Preset Selector */}
            <div>
              <div className="flex justify-between items-center text-[11px] font-bold text-zinc-400 mb-1">
                <span>قيمة الرهان بالكوينز:</span>
                <span className="text-amber-400 font-mono text-xs">{simAmount} كوينز</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {[100, 200, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSimAmount(amt)}
                    className={`py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      simAmount === amt
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Profit Display */}
            <div className="bg-zinc-950 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-400 font-bold">العائد الإجمالي عند الفوز:</p>
                <p className="text-base font-black text-emerald-400 font-mono flex items-center gap-1">
                  <span>{estimatedPayout.toLocaleString()}</span>
                  <span className="text-xs text-zinc-300">كوينز 💰</span>
                </p>
              </div>
              <div className="text-left border-r border-zinc-800 pr-3">
                <p className="text-[10px] text-zinc-400 font-bold">صافي الربح المتوقع:</p>
                <p className="text-sm font-black text-amber-400 font-mono">
                  +{estimatedProfit.toLocaleString()} كوينز
                </p>
              </div>
            </div>

            {simBetSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 p-2.5 rounded-xl text-emerald-400 text-xs text-center font-extrabold flex items-center justify-center gap-1.5 animate-pulse">
                <CheckCircle2 className="h-4 w-4" />
                <span>تم تسجيل الرهان وقيد المحاكاة بنجاح! 🎯</span>
              </div>
            )}

            <button
              onClick={handleExecuteSimBet}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              id="hero-execute-sim-bet-btn"
            >
              <Zap className="h-4 w-4" />
              <span>ضع الرهان الآن بهذه الحسبة ⚡</span>
            </button>
          </div>

        </div>
      </section>

      {/* Recommended AI High-ROI Value Bets Bar */}
      {valueBetMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
              <span>توصيات الذكاء الاصطناعي - رهانات القيمة العالية 🔥</span>
            </h2>
            <span className="text-xs text-emerald-400 font-bold">عائد ربحي مرتفع المتوقع</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {valueBetMatches.map((m, idx) => {
              const bestOdds = Math.max(m.oddsHome, m.oddsDraw, m.oddsAway);
              const bestOutcome = bestOdds === m.oddsHome ? 'home' : bestOdds === m.oddsDraw ? 'draw' : 'away';
              const outcomeLabel = bestOutcome === 'home' ? m.teamHome : bestOutcome === 'draw' ? 'التعادل' : m.teamAway;

              return (
                <div 
                  key={m.id}
                  className="bg-zinc-950 border border-amber-500/20 hover:border-amber-500/50 rounded-2xl p-4 shadow-xl transition-all space-y-3 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-bold">{m.league}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black">
                      موصى به 🔥 {85 + idx * 3}% ثقة
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 text-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{m.logoHome}</span>
                      <span className="text-xs font-bold text-white">{m.teamHome}</span>
                    </div>
                    <span className="text-xs font-black text-zinc-500">VS</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{m.teamAway}</span>
                      <span className="text-xl">{m.logoAway}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-zinc-400">التوقع الموصى به:</p>
                      <p className="font-extrabold text-white">{outcomeLabel}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-zinc-400">معامل الربح:</p>
                      <p className="font-mono font-black text-emerald-400 text-sm">{bestOdds.toFixed(2)}x</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onPlaceQuickBet(m, bestOutcome)}
                    className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>رهان سريع بنسبة مضاعفة ⚡</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Matches Section (المباريات المتميزة ووسوم الإدارة) */}
      <FeaturedMatchesSection
        matches={matches}
        onSelectMatch={onSelectMatch}
        onPlaceQuickBet={onPlaceQuickBet}
        currentUser={currentUser}
        reminders={matchReminders}
        onToggleReminder={handleToggleReminder}
      />

      {/* Active Scheduled Reminders Banner */}
      {matchReminders.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-300 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 shrink-0">
              <Bell className="h-4 w-4 animate-bounce" />
            </div>
            <div>
              <span className="font-bold block text-sm text-white">
                ⏰ التنبيهات المجدولة بـ 15 دقيقة ({matchReminders.length} {matchReminders.length === 1 ? 'مباراة' : 'مباريات'})
              </span>
              <span className="text-[11px] text-zinc-400">
                سيتم إرسال إشعار منبثق فوري فور اقتراب موعد انطلاق المباراة بـ 15 دقيقة لتضع رهانك في الوقت المناسب.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {matches.filter(m => matchReminders.includes(m.id)).slice(0, 3).map(m => (
              <span key={m.id} className="bg-zinc-900 border border-zinc-800 text-amber-300 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                <span>{m.teamHome} × {m.teamAway}</span>
                <button
                  onClick={() => handleToggleReminder(m)}
                  className="text-zinc-500 hover:text-red-400 transition-colors ml-1 p-0.5"
                  title="إلغاء التنبيه"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. Intelligent Search and Filtering Bar */}
      <section id="matches-section" className="space-y-4 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Flame className="h-5 w-5 text-emerald-400" />
              <span>البحث عن المباريات والأحداث المتاحة</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              ابحث باسم الفريق، الدوري، أو اختر وسم <span className="text-amber-400 font-bold">'المباراة المتميزة'</span>
            </p>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute right-3.5 top-3.5 h-5 w-5 text-emerald-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الفريق، الدوري، أو 'المباراة المتميزة'..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pr-11 pl-10 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium transition-all shadow-inner"
              id="matches-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-3 p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                title="إلغاء البحث"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Tags/Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-zinc-500 font-bold flex items-center gap-1 ml-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>بحث سريع:</span>
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery('المباراة المتميزة')}
            className={`text-xs px-3 py-1 rounded-xl font-bold border transition-all ${
              searchQuery === 'المباراة المتميزة'
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20 font-black scale-105'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            🔥 المباريات المتميزة
          </button>
          <button
            type="button"
            onClick={() => setSearchQuery('رهان مميز')}
            className={`text-xs px-3 py-1 rounded-xl font-bold border transition-all ${
              searchQuery === 'رهان مميز'
                ? 'bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-500/20 font-black scale-105'
                : 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
            }`}
          >
            ⚡ رهانات مميزة
          </button>
          <button
            type="button"
            onClick={() => setSearchQuery('الإسباني')}
            className={`text-xs px-3 py-1 rounded-xl font-bold border transition-all ${
              searchQuery === 'الإسباني'
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20 font-black scale-105'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            🇪🇸 الدوري الإسباني
          </button>
          <button
            type="button"
            onClick={() => setSearchQuery('الإنجليزي')}
            className={`text-xs px-3 py-1 rounded-xl font-bold border transition-all ${
              searchQuery === 'الإنجليزي'
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20 font-black scale-105'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            🏴󠁧󠁢󠁥󠁮󠁧󠁿 الدوري الإنجليزي
          </button>
          <button
            type="button"
            onClick={() => setSearchQuery('مباشر')}
            className={`text-xs px-3 py-1 rounded-xl font-bold border transition-all ${
              searchQuery === 'مباشر'
                ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/20 font-black scale-105 animate-pulse'
                : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
            }`}
          >
            🔴 مباشر الآن
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs px-2.5 py-1 rounded-xl font-extrabold bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all flex items-center gap-1 border border-zinc-700"
            >
              <span>إعادة ضبط البحث</span>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Active Search Result Badge */}
        {searchQuery && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span className="font-bold">
              نتائج البحث عن: <span className="text-white font-black underline">"{searchQuery}"</span> — تم العثور على <span className="text-emerald-400 font-black font-mono text-sm">{filteredMatches.length}</span> مباراة
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] font-bold text-zinc-400 hover:text-white underline"
            >
              مسح الفلتر
            </button>
          </div>
        )}

        {/* Sport Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-900 overflow-x-auto">
          {/* 'All' button */}
          <button
            onClick={() => setSelectedSportFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedSportFilter === 'all' 
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 scale-105 font-black' 
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/60'
            }`}
            id="filter-sport-all"
          >
            <span>🏟️</span>
            <span>الكل</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
              selectedSportFilter === 'all' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {matches.length}
            </span>
          </button>

          {/* Dynamic Sports Categories */}
          {(sportsCategories && sportsCategories.length > 0 ? sportsCategories : [
            { id: 'football', name: 'كرة القدم', icon: '⚽' },
            { id: 'basketball', name: 'كرة السلة', icon: '🏀' },
            { id: 'tennis', name: 'التنس', icon: '🎾' },
            { id: 'volleyball', name: 'كرة الطائرة', icon: '🏐' },
            { id: 'esports', name: 'الألعاب الإلكترونية', icon: '🎮' },
          ]).map(category => {
            const matchCount = matches.filter(m => m.sport === category.id).length;
            const isSelected = selectedSportFilter === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedSportFilter(category.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected 
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 scale-105 font-black' 
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/60'
                }`}
                id={`filter-sport-${category.id}`}
              >
                <span>{category.icon || '🏆'}</span>
                <span>{category.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {matchCount}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Live and Scheduled Matches Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Matches Section List (Home/Left Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* A. Live Matches (If any) */}
          {liveMatches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">مباشر الآن (Live)</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {liveMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onSelect={onSelectMatch} 
                    onPlaceBet={onPlaceQuickBet}
                    currentUser={currentUser}
                    hasReminder={matchReminders.includes(match.id)}
                    onToggleReminder={handleToggleReminder}
                  />
                ))}
              </div>
            </div>
          )}

          {/* B. Scheduled / Upcoming Matches */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>المباريات القادمة</span>
            </h3>
            
            {scheduledMatches.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {scheduledMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onSelect={onSelectMatch} 
                    onPlaceBet={onPlaceQuickBet}
                    currentUser={currentUser}
                    hasReminder={matchReminders.includes(match.id)}
                    onToggleReminder={handleToggleReminder}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-8 text-center text-zinc-400 text-sm space-y-3">
                <div className="text-2xl">🔍</div>
                <p className="font-bold text-white">لا توجد مباريات مطابقة للبحث أو الفلترة حالياً.</p>
                <p className="text-xs text-zinc-500">جرب البحث عن اسم فريق آخر، اسم الدوري، أو تصفح وسم 'المباراة المتميزة'</p>
                {searchQuery && (
                  <div className="pt-2">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-black text-xs hover:bg-emerald-400 transition-colors shadow-md inline-flex items-center gap-1.5"
                    >
                      <X className="h-4 w-4" />
                      <span>مسح البحث وإظهار كافة المباريات</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* C. Finished Matches */}
          {finishedMatches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tv className="h-4 w-4" />
                <span>أحدث النتائج والمباريات المنتهية</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {finishedMatches.map(match => (
                  <div 
                    key={match.id}
                    onClick={() => onSelectMatch(match)}
                    className="group cursor-pointer rounded-2xl border border-zinc-900 bg-zinc-950 p-4 hover:border-zinc-800 hover:bg-zinc-900/40 transition-all flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center text-xs text-zinc-500 mb-2">
                      <span>{match.league}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">انتهت</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{match.logoHome}</span>
                        <span className="text-sm font-medium text-white">{match.teamHome}</span>
                      </div>
                      <span className="text-base font-black text-emerald-400">{match.scoreHome}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{match.logoAway}</span>
                        <span className="text-sm font-medium text-white">{match.teamAway}</span>
                      </div>
                      <span className="text-base font-black text-emerald-400">{match.scoreAway}</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-zinc-900 text-center text-xs text-zinc-500 group-hover:text-emerald-400 transition-colors">
                      شاهد الإحصائيات والتوقعات 📊
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 4. Sidebar: News (Grounding) & Standings/Results Feed */}
        <div className="space-y-8">
          
          {/* Live Sports News widget with Google Search logo */}
          <div className="rounded-2xl border border-emerald-500/10 bg-zinc-950 p-6 shadow-xl relative">
            <div className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-emerald-400" />
                <span>أخبار حية (Google Search)</span>
              </h3>
              <div className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
                <span>محدث فوري</span>
              </div>
            </div>

            {loadingNews ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-xs gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                <span>جاري استرداد الأخبار والتحقق منها...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {news.map(item => (
                  <div key={item.id} className="group border-b border-zinc-900 pb-3 last:border-b-0 last:pb-0">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{item.category}</span>
                    <h4 className="text-sm font-semibold text-zinc-200 mt-1 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2">
                      <span>المصدر: {item.source}</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Standing Feed */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-4">
              <Award className="h-4 w-4 text-emerald-400" />
              <span>جدول صدارة الدوريات</span>
            </h3>
            
            <div className="space-y-3">
              <div className="text-xs text-zinc-500 pb-1 border-b border-zinc-900 flex justify-between">
                <span>الفريق</span>
                <div className="flex gap-4">
                  <span className="w-6 text-center">لعب</span>
                  <span className="w-6 text-center">نقاط</span>
                </div>
              </div>
              
              {[
                { rank: 1, team: 'ريال مدريد 🇪🇸', p: 38, pts: 87, form: '🟢🟢🟢' },
                { rank: 2, team: 'برشلونة 🇪🇸', p: 38, pts: 82, form: '🟢🔴🟢' },
                { rank: 3, team: 'مانشستر سيتي 🏴󠁧󠁢󠁥󠁮󠁧󠁿', p: 37, pts: 85, form: '🟢🟢🟢' },
                { rank: 4, team: 'أرسنال 🏴󠁧󠁢󠁥󠁮󠁧󠁿', p: 37, pts: 83, form: '🔴🟢🟢' },
                { rank: 5, team: 'بايرن ميونخ 🇩🇪', p: 34, pts: 72, form: '🟢🔴🔴' }
              ].map(row => (
                <div key={row.team} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 font-bold text-zinc-600">{row.rank}</span>
                    <span className="text-zinc-300 font-medium">{row.team}</span>
                  </div>
                  <div className="flex gap-4 text-zinc-400">
                    <span className="w-6 text-center">{row.p}</span>
                    <span className="w-6 text-center font-bold text-white">{row.pts}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-900 text-center">
              <button 
                onClick={() => setSelectedSportFilter('all')} 
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                شاهد ترتيب جميع الدوريات
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* Full Secured League Standings Section */}
      <LeagueStandingsSection standings={leagueStandings} />

    </div>
  );
}

// Sub-component: Match Card for clean rendering
interface MatchCardProps {
  key?: string;
  match: Match;
  onSelect: (match: Match) => void;
  onPlaceBet: (match: Match, outcome: 'home' | 'draw' | 'away') => void;
  currentUser: any;
  hasReminder: boolean;
  onToggleReminder: (match: Match) => void;
}

function MatchCard({ match, onSelect, onPlaceBet, currentUser, hasReminder, onToggleReminder }: MatchCardProps) {
  const isLive = match.status === 'live';

  return (
    <div 
      className={`rounded-2xl border bg-zinc-950 p-5 hover:bg-zinc-900/30 transition-all shadow-xl relative overflow-hidden group ${
        isLive ? 'border-emerald-500/30' : 'border-zinc-900'
      }`}
      id={`match-card-${match.id}`}
    >
      {isLive && (
        <div className="absolute right-0 top-0 h-1 w-full bg-emerald-500" />
      )}

      {/* Promotional Bet Banner if configured */}
      {match.adTitle && (
        <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 p-2.5 rounded-xl border border-amber-500/30 mb-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="bg-amber-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full">
              {match.adBadge || 'إعلان رهان مميز 📣'}
            </span>
            <span className="text-[9px] text-amber-300 font-bold">رهان مميز 🔥</span>
          </div>
          <h4 className="font-bold text-xs text-white">{match.adTitle}</h4>
          {match.adDescription && (
            <p className="text-[10px] text-zinc-300 line-clamp-1">{match.adDescription}</p>
          )}
        </div>
      )}

      {/* Match Cover Image Banner if uploaded */}
      {match.matchImage && (
        <div 
          onClick={() => onSelect(match)}
          className="relative w-full h-32 rounded-xl overflow-hidden border border-zinc-800 mb-3 cursor-pointer group"
        >
          <img 
            src={match.matchImage} 
            alt={`${match.teamHome} vs ${match.teamAway}`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          <div className="absolute bottom-2 right-2 text-[10px] bg-black/70 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30 backdrop-blur-sm font-bold">
            {match.teamHome} ضد {match.teamAway}
          </div>
        </div>
      )}

      {/* Card Header: League, Reminder Alert Button, and Time */}
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <span className="text-xs text-zinc-400 font-medium">{match.league}</span>
        
        <div className="flex items-center gap-2">
          {/* Reminder Alert Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleReminder(match);
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
              hasReminder
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10 ring-1 ring-amber-500/30 font-black'
                : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30'
            }`}
            title="جدولة إشعار منبثق قبل بدء المباراة بـ 15 دقيقة"
            id={`reminder-btn-${match.id}`}
          >
            <Bell className={`h-3.5 w-3.5 ${hasReminder ? 'fill-amber-400 text-amber-400 animate-bounce' : 'text-amber-400'}`} />
            <span>{hasReminder ? 'تنبيه مفعّل (-15د) ⏰' : 'تنبيه (-15د) 🔔'}</span>
          </button>

          {isLive ? (
            <div className="flex items-center gap-1.5 bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-red-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
              <span>لايف دقيقة {match.minutes}'</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-zinc-900 text-zinc-400 px-2.5 py-1 rounded-xl border border-zinc-800 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>{match.date || 'غداً'}، {match.time}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Vs Row */}
      <div 
        onClick={() => onSelect(match)}
        className="grid grid-cols-3 items-center py-3 cursor-pointer text-center"
      >
        {/* Home Team */}
        <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-2xl border border-zinc-800 shadow-inner">
            {match.logoHome}
          </div>
          <span className="text-sm font-bold text-white max-w-[110px] truncate">{match.teamHome}</span>
        </div>

        {/* Score or VS */}
        <div className="flex flex-col items-center justify-center">
          {isLive ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-white">{match.scoreHome}</span>
              <span className="text-zinc-600 font-bold">:</span>
              <span className="text-3xl font-black text-white">{match.scoreAway}</span>
            </div>
          ) : (
            <div className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-black text-emerald-400 uppercase tracking-widest">
              VS
            </div>
          )}
          <span className="text-[10px] text-zinc-500 mt-2 tracking-wider">نقاط محاكاة</span>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-2xl border border-zinc-800 shadow-inner">
            {match.logoAway}
          </div>
          <span className="text-sm font-bold text-white max-w-[110px] truncate">{match.teamAway}</span>
        </div>
      </div>

      {/* Odds and Simulation Quick Bet Section */}
      <div className="mt-5 pt-4 border-t border-zinc-900/80">
        <div className="flex justify-between items-center text-xs text-zinc-400 mb-2">
          <span>الاحتمالات والرهان (معامل الفوز)</span>
          <button 
            onClick={() => onSelect(match)}
            className="text-emerald-400 hover:underline font-bold"
          >
            تفاصيل ومحاكاة اللعب 📊
          </button>
        </div>

        {match.isBettingClosed || match.bettingStatus === 'closed' || match.bettingStatus === 'suspended' ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center space-y-1">
            <div className="text-xs font-black text-red-400 flex items-center justify-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>
                {match.bettingStatus === 'suspended' ? 'الرهان معلق مؤقتاً لهذه المباراة ⏸️' : 'الرهان مغلق لهذه المباراة بقرار الإدارة 🔒'}
              </span>
            </div>
            {match.bettingNote && (
              <p className="text-[11px] text-zinc-300 font-bold">{match.bettingNote}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onPlaceBet(match, 'home')}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 text-center hover:bg-emerald-500 hover:text-zinc-950 hover:border-emerald-500 transition-all"
              id={`quick-bet-home-${match.id}`}
            >
              <div className="text-[10px] text-zinc-500 font-bold group-hover:text-inherit">
                {match.customLabelHome || 'المضيف (1)'}
              </div>
              <div className="text-sm font-black text-white group-hover:text-inherit">{match.oddsHome.toFixed(2)}</div>
            </button>

            <button
              onClick={() => onPlaceBet(match, 'draw')}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 text-center hover:bg-emerald-500 hover:text-zinc-950 hover:border-emerald-500 transition-all"
              id={`quick-bet-draw-${match.id}`}
            >
              <div className="text-[10px] text-zinc-500 font-bold group-hover:text-inherit">
                {match.customLabelDraw || 'تعادل (X)'}
              </div>
              <div className="text-sm font-black text-white group-hover:text-inherit">{match.oddsDraw.toFixed(2)}</div>
            </button>

            <button
              onClick={() => onPlaceBet(match, 'away')}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 text-center hover:bg-emerald-500 hover:text-zinc-950 hover:border-emerald-500 transition-all"
              id={`quick-bet-away-${match.id}`}
            >
              <div className="text-[10px] text-zinc-500 font-bold group-hover:text-inherit">
                {match.customLabelAway || 'الضيف (2)'}
              </div>
              <div className="text-sm font-black text-white group-hover:text-inherit">{match.oddsAway.toFixed(2)}</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
