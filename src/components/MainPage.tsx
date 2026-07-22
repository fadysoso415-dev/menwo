import React, { useState, useEffect } from 'react';
import { Match, NewsItem } from '../types';
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
  Loader2
} from 'lucide-react';

interface MainPageProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  onPlaceQuickBet: (match: Match, outcome: 'home' | 'draw' | 'away') => void;
  currentUser: any;
}

export default function MainPage({
  matches,
  onSelectMatch,
  onPlaceQuickBet,
  currentUser
}: MainPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState<'all' | 'football' | 'basketball' | 'tennis'>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
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

  // Filter matches based on search query and selected sport filter
  const filteredMatches = matches.filter(match => {
    const matchesSearch = 
      match.teamHome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.teamAway.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.league.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSport = selectedSportFilter === 'all' || match.sport === selectedSportFilter;

    return matchesSearch && matchesSport;
  });

  // Separate live, scheduled, and finished matches
  const liveMatches = filteredMatches.filter(m => m.status === 'live');
  const scheduledMatches = filteredMatches.filter(m => m.status === 'scheduled');
  const finishedMatches = filteredMatches.filter(m => m.status === 'finished');

  return (
    <div className="space-y-10 py-6" dir="rtl">
      
      {/* 1. Hero / Premium Banner Section */}
      <section className="relative rounded-3xl overflow-hidden border border-emerald-500/10 bg-zinc-950 p-8 sm:p-12 shadow-2xl shadow-emerald-500/5">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-zinc-950 to-zinc-950" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>توقعات حية مدعومة بالذكاء الاصطناعي و Google Search</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            مينوو الرياضة الرقمي المتكامل بذكاء <span className="text-emerald-400">AI</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl">
            تابع تفاصيل المباريات، الإحصائيات الفورية، وتوقع نتائجها بدقة مذهلة بالاستعانة بمحلل الذكاء الاصطناعي الذكي ومحاكي اللعب الفوري.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a 
              href="#matches-section"
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
            >
              استكشف المباريات المتاحة
            </a>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{matches.filter(m => m.status === 'live').length} مباريات تلعب الآن</span>
            </div>
          </div>
        </div>
        {/* Subtle background sports wireframe elements */}
        <div className="absolute right-12 bottom-0 h-48 w-48 bg-emerald-500/5 blur-3xl rounded-full" />
      </section>

      {/* 2. Intelligent Search and Filtering Bar */}
      <section id="matches-section" className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Flame className="h-5 w-5 text-emerald-400" />
              <span>المباريات والأحداث المتاحة</span>
            </h2>
            <p className="text-sm text-zinc-500">تصفح الرهانات والمباريات لمحاكاة توقعاتك</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3.5 top-3 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن فريق، دوري أو بطولة..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 pr-11 pl-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="matches-search-input"
            />
          </div>
        </div>

        {/* Sport Filters */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-4">
          {[
            { id: 'all', label: 'الكل 🏟️' },
            { id: 'football', label: 'كرة القدم ⚽' },
            { id: 'basketball', label: 'كرة السلة 🏀' },
            { id: 'tennis', label: 'التنس 🎾' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedSportFilter(filter.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedSportFilter === filter.id 
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              id={`filter-sport-${filter.id}`}
            >
              {filter.label}
            </button>
          ))}
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
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-8 text-center text-zinc-500 text-sm">
                لا توجد مباريات قادمة مطابقة للبحث أو الفلترة حالياً.
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
              <span>جدول صدارة الدوريات (افتراضي)</span>
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
}

function MatchCard({ match, onSelect, onPlaceBet, currentUser }: MatchCardProps) {
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

      {/* Card Header: League and Time */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-zinc-400 font-medium">{match.league}</span>
        
        {isLive ? (
          <div className="flex items-center gap-1.5 bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-red-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
            <span>لايف دقيقة {match.minutes}'</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 text-xs">
            <Calendar className="h-3 w-3" />
            <span>غداً، {match.time}</span>
          </div>
        )}
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

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onPlaceBet(match, 'home')}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 text-center hover:bg-emerald-500 hover:text-zinc-950 hover:border-emerald-500 transition-all"
            id={`quick-bet-home-${match.id}`}
          >
            <div className="text-[10px] text-zinc-500 font-bold group-hover:text-inherit">المضيف (1)</div>
            <div className="text-sm font-black text-white group-hover:text-inherit">{match.oddsHome.toFixed(2)}</div>
          </button>

          <button
            onClick={() => onPlaceBet(match, 'draw')}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 text-center hover:bg-emerald-500 hover:text-zinc-950 hover:border-emerald-500 transition-all"
            id={`quick-bet-draw-${match.id}`}
          >
            <div className="text-[10px] text-zinc-500 font-bold group-hover:text-inherit">تعادل (X)</div>
            <div className="text-sm font-black text-white group-hover:text-inherit">{match.oddsDraw.toFixed(2)}</div>
          </button>

          <button
            onClick={() => onPlaceBet(match, 'away')}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 text-center hover:bg-emerald-500 hover:text-zinc-950 hover:border-emerald-500 transition-all"
            id={`quick-bet-away-${match.id}`}
          >
            <div className="text-[10px] text-zinc-500 font-bold group-hover:text-inherit">الضيف (2)</div>
            <div className="text-sm font-black text-white group-hover:text-inherit">{match.oddsAway.toFixed(2)}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
