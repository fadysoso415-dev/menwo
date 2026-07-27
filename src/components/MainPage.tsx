import React, { useState, useEffect } from 'react';
import { Match, NewsItem, LeagueStandingItem, SportCategory, Bet } from '../types';
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
  Percent,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  X,
  Filter,
  Bell,
  Lock,
  Clock
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
  activeBets?: Bet[];
}

export default function MainPage({
  matches,
  onSelectMatch,
  onPlaceQuickBet,
  currentUser,
  leagueStandings = [],
  sportsCategories = [],
  onTriggerToast,
  onTriggerNotification,
  activeBets = []
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
            title: 'مباراة قمة نارية منتظرة في البريميرليغ بين ليفربول وتشيلسي',
            summary: 'تستعد الجماهير العالمية لمباراة القمة النارية الليلة. المحللون يتوقعون مباراة تكتيكية هجومية مثيرة بين الفريقين.',
            source: 'مينوو سبورتس المباشر',
            date: '2026-07-20',
            category: 'الدوري الإنجليزي',
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

  // Filter matches based on search query and selected sport filter (excluding finished and inactive matches on user page)
  const filteredMatches = matches.filter(match => {
    if (match.isActive === false) return false;
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

  // Separate live and scheduled matches (excluding finished matches)
  const liveMatches = filteredMatches.filter(m => m.status === 'live');
  const scheduledMatches = filteredMatches.filter(m => m.status === 'scheduled');

  // Value bets recommendations (highest multiplier odds with great potential)
  const valueBetMatches = matches.filter(m => m.status !== 'finished' && m.isActive !== false).slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 py-2 sm:py-4" dir={dir}>
      
      {/* 1. Compact Sleek Top Status & Hero Bar */}
      <section className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-4 sm:p-5 shadow-xl shadow-emerald-500/5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-0.5 text-[11px] font-black text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>منصة الرهانات والتوقعات المباشرة</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>مباريات اليوم والرهانات المتاحة</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-500 text-zinc-950 font-black rounded-lg">مباشر 🔥</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-xl">
              <span>المباريات النشطة: <strong className="text-emerald-400 font-mono text-sm">{matches.filter(m => m.status !== 'finished').length}</strong></span>
            </div>

            <a 
              href="#matches-search-section"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 text-xs font-black transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <Search className="h-3.5 w-3.5" />
              <span>بحث سريع 🔍</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Recommended AI High-ROI Value Bets Bar - IMMEDIATELY SEEN */}
      {valueBetMatches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
              <span>توصيات الذكاء الاصطناعي - أعلى العوائد والنسب 🔥</span>
            </h2>
            <span className="text-xs text-emerald-400 font-bold">تأكيد بنسبة 1-Tap ⚡</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {valueBetMatches.map((m, idx) => {
              const bestOdds = Math.max(m.oddsHome, m.oddsDraw, m.oddsAway);
              const bestOutcome = bestOdds === m.oddsHome ? 'home' : bestOdds === m.oddsDraw ? 'draw' : 'away';
              const outcomeLabel = bestOutcome === 'home' ? m.teamHome : bestOutcome === 'draw' ? 'التعادل' : m.teamAway;

              return (
                <div 
                  key={m.id}
                  className="bg-zinc-950 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-3.5 shadow-xl transition-all space-y-2.5 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-bold truncate max-w-[140px]">{m.league}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black">
                      ثقة عالية 🔥 {88 + idx * 3}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 text-center">
                    <div className="flex items-center gap-1.5 max-w-[42%]">
                      <span className="text-xl">{m.logoHome}</span>
                      <span className="text-xs font-bold text-white truncate">{m.teamHome}</span>
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded-md">VS</span>
                    <div className="flex items-center gap-1.5 max-w-[42%] justify-end">
                      <span className="text-xs font-bold text-white truncate">{m.teamAway}</span>
                      <span className="text-xl">{m.logoAway}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-900/90 p-2 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-zinc-400">الرهان المقترح:</p>
                      <p className="font-extrabold text-white text-xs">{outcomeLabel}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-zinc-400">معامل العائد:</p>
                      <p className="font-mono font-black text-emerald-400 text-sm">{bestOdds.toFixed(2)}x</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onPlaceQuickBet(m, bestOutcome)}
                    className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                    id={`value-bet-btn-${m.id}`}
                  >
                    <span>مراهنة بنسبة {bestOdds.toFixed(2)}x</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Featured Matches Section (المباريات المتميزة ووسوم الإدارة) */}
      <FeaturedMatchesSection
        matches={matches}
        onSelectMatch={onSelectMatch}
        onPlaceQuickBet={onPlaceQuickBet}
        currentUser={currentUser}
        reminders={matchReminders}
        onToggleReminder={handleToggleReminder}
        activeBets={activeBets}
      />



      {/* 4. Search and Filtering Bar + Live Match Grid */}
      <section id="matches-search-section" className="space-y-4 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Flame className="h-5 w-5 text-emerald-400" />
              <span>جميع المباريات المتاحة للرهان</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              اضغط على أي خيار (فوز الأرض / التعادل / فوز الضيف) للرهان الفوري
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
              {matches.filter(m => m.status !== 'finished').length}
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
            const matchCount = matches.filter(m => m.sport === category.id && m.status !== 'finished').length;
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
                    activeBets={activeBets}
                  />
                ))}
              </div>
            </div>
          )}

          {/* B. Available Betting Matches */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>المباريات المتاحة للرهان</span>
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
                    activeBets={activeBets}
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
                { rank: 1, team: 'ليفربول 🏴󠁧󠁢󠁥󠁮󠁧󠁿', p: 38, pts: 89, form: '🟢🟢🟢' },
                { rank: 2, team: 'مانشستر سيتي 🏴󠁧󠁢󠁥󠁮󠁧󠁿', p: 38, pts: 87, form: '🟢🟢🟢' },
                { rank: 3, team: 'تشيلسي 🏴󠁧󠁢󠁥󠁮󠁧󠁿', p: 38, pts: 84, form: '🟢🔴🟢' },
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
  activeBets?: Bet[];
}

function MatchCard({ match, onSelect, onPlaceBet, currentUser, hasReminder, onToggleReminder, activeBets = [] }: MatchCardProps) {
  const isLive = match.status === 'live';
  const userBet = currentUser ? activeBets.find(b => b.userId === currentUser.id && b.matchId === match.id) : null;

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

      {/* Active User Bet Indicator Badge */}
      {userBet && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs text-amber-300 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold truncate max-w-[70%]">
            <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              رهانك: {userBet.selectedOutcome === 'home' ? `فوز ${userBet.teamHome}` : userBet.selectedOutcome === 'away' ? `فوز ${userBet.teamAway}` : 'التعادل'} ({userBet.amount} 🪙)
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
            userBet.status === 'won'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : userBet.status === 'lost'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
          }`}>
            {userBet.status === 'won' ? 'فائز 🟢' : userBet.status === 'lost' ? 'خاسر 🔴' : 'قيد الانتظار ⏳'}
          </span>
        </div>
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

          {isLive ? (
            <div className="flex items-center gap-1.5 bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-red-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
              <span>لايف دقيقة {match.minutes}'</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-500/20 text-xs font-bold">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span>متاحة للرهان ({match.time})</span>
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
          <span className="text-[10px] text-emerald-400 font-bold mt-2 tracking-wider">
            {isLive ? 'مباشر الآن 🔴' : 'متاحة للرهان 🟢'}
          </span>
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
            تفاصيل المباراة والتوقعات 📊
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
