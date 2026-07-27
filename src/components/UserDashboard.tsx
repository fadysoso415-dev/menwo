import React, { useState, useEffect, useRef } from 'react';
import { User, Bet, Notification, DepositRequest, WithdrawalRequest, Match, GuideCategory } from '../types';
import UserActiveBetsList from './UserActiveBetsList';

interface GlassBalanceCardProps {
  balance: number;
  onOpenCashDepositModal?: () => void;
  onOpenWithdrawModal?: () => void;
  depositRequests: DepositRequest[];
  withdrawalRequests: WithdrawalRequest[];
  userId: string;
}

function GlassBalanceCard({
  balance,
  onOpenCashDepositModal,
  onOpenWithdrawModal,
  depositRequests,
  withdrawalRequests,
  userId
}: GlassBalanceCardProps) {
  const [displayValue, setDisplayValue] = useState<number>(balance);
  const [diffBadge, setDiffBadge] = useState<{ amount: number; type: 'up' | 'down' } | null>(null);
  const prevBalanceRef = useRef<number>(balance);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevBalanceRef.current;
    if (prev !== balance) {
      const diff = balance - prev;
      if (diff !== 0) {
        setDiffBadge({
          amount: Math.abs(diff),
          type: diff > 0 ? 'up' : 'down'
        });

        // Hide floating diff badge after 3.5 seconds
        const timer = setTimeout(() => {
          setDiffBadge(null);
        }, 3500);

        // Smoothly animate counter from prev balance to new balance
        const startTime = performance.now();
        const duration = 1000; // ms

        const step = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out quadratic calculation
          const easeProgress = progress * (2 - progress);
          const currentVal = Math.round(prev + (balance - prev) * easeProgress);

          setDisplayValue(currentVal);

          if (progress < 1) {
            animRef.current = requestAnimationFrame(step);
          } else {
            setDisplayValue(balance);
          }
        };

        if (animRef.current) cancelAnimationFrame(animRef.current);
        animRef.current = requestAnimationFrame(step);

        prevBalanceRef.current = balance;
        return () => clearTimeout(timer);
      }
    } else {
      setDisplayValue(balance);
    }
  }, [balance]);

  const pendingDeposits = depositRequests.filter(r => r.userId === userId && r.status === 'pending');
  const pendingWithdrawals = withdrawalRequests.filter(r => r.userId === userId && r.status === 'pending');

  return (
    <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-white/10 via-zinc-950/90 to-zinc-950 p-6 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 flex flex-col justify-between overflow-hidden group">
      
      {/* Glassmorphism background ambient lights */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none group-hover:bg-emerald-500/30 transition-all duration-700" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none group-hover:bg-amber-500/30 transition-all duration-700" />
      
      {/* Top Header */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 backdrop-blur-md shadow-md">
              <Coins className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide">المحفظة والرصيد المتاح</h3>
              <p className="text-[10px] text-zinc-400 font-medium">حساب الأرباح والكوينز المباشر</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black backdrop-blur-md flex items-center gap-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>تحديث حقيقي ⚡</span>
          </span>
        </div>

        {/* Central Glassmorphism Box with Animated Counter */}
        <div className="relative rounded-2xl border border-white/20 bg-gradient-to-br from-white/15 via-white/5 to-transparent p-5 text-center shadow-inner backdrop-blur-md space-y-2 overflow-hidden">
          
          {/* Animated Diff Badge when balance changes */}
          {diffBadge && (
            <div 
              className={`absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border text-xs font-black shadow-xl flex items-center gap-1.5 animate-bounce z-20 ${
                diffBadge.type === 'up'
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-300 shadow-emerald-500/40'
                  : 'bg-red-500 text-white border-red-300 shadow-red-500/40'
              }`}
            >
              <span>{diffBadge.type === 'up' ? '📈 +' : '📉 -'}</span>
              <span>{diffBadge.amount.toLocaleString()} كوينز</span>
            </div>
          )}

          <span className="text-[11px] text-zinc-300 font-extrabold block tracking-wider uppercase">الرصيد الكلي في الحساب</span>

          {/* Large Animated Counter Number */}
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]">
              {displayValue.toLocaleString()}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400">🪙</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-[11px] font-bold backdrop-blur-md">
            <span>سعر الصرف المباشر:</span>
            <span className="text-white font-black">1 كوين = 1 جنيه مصري 🇪🇬</span>
          </div>
        </div>
      </div>

      {/* Cash Actions & Status */}
      <div className="relative z-10 pt-4 border-t border-white/10 mt-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {onOpenCashDepositModal && (
            <button
              type="button"
              onClick={onOpenCashDepositModal}
              className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-black py-3 px-3 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 border border-amber-300/40 flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              id="glass-open-cash-deposit-btn"
            >
              <Wallet className="h-4 w-4 shrink-0" />
              <span>إيداع وشراء كاش 📲</span>
            </button>
          )}

          {onOpenWithdrawModal && (
            <button
              type="button"
              onClick={onOpenWithdrawModal}
              className="w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-zinc-950 font-black py-3 px-3 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 border border-emerald-300/40 flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              id="glass-open-withdraw-btn"
            >
              <ArrowUpRight className="h-4 w-4 shrink-0" />
              <span>سحب الأرباح 💸</span>
            </button>
          )}
        </div>

        {/* Pending Deposit Status Notice */}
        {pendingDeposits.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-2.5 rounded-xl text-[11px] font-bold flex items-center justify-between backdrop-blur-md">
            <span>⏳ لديك طلب شحن قيد المراجعة والإيداع</span>
            <button onClick={onOpenCashDepositModal} className="underline text-amber-400 hover:text-white">
              متابعة
            </button>
          </div>
        )}

        {/* Pending Withdrawal Status Notice */}
        {pendingWithdrawals.length > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-2.5 rounded-xl text-[11px] font-bold flex items-center justify-between backdrop-blur-md">
            <span>⏳ لديك طلب سحب قيد التحويل</span>
            <button onClick={onOpenWithdrawModal} className="underline text-emerald-400 hover:text-white">
              التفاصيل
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
import BeginnerGuide from './BeginnerGuide';
import { useLanguage } from '../context/LanguageContext';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { 
  Coins, 
  Clock, 
  TrendingUp, 
  Bell, 
  Trash2, 
  User as UserIcon, 
  Check, 
  Award, 
  ShieldCheck,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  X,
  RotateCcw,
  Wallet,
  Upload,
  Phone,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Users,
  BarChart3,
  Flame,
  Sparkles,
  Trophy,
  Percent,
  BookOpen,
  HelpCircle,
  ExternalLink,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

function CustomWeeklyTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950/95 border border-emerald-500/40 p-3.5 rounded-2xl shadow-2xl text-right dir-rtl backdrop-blur-md space-y-2 min-w-[210px] z-50">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
          <span className="text-xs font-black text-white flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            <span>{data.dayLabel}</span>
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">{data.fullDateStr}</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-medium">الربح/الخسارة اليومية:</span>
            <span className={`font-black ${data.dailyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.dailyProfit >= 0 ? `+${data.dailyProfit}` : data.dailyProfit} 🪙
            </span>
          </div>

          <div className="flex justify-between items-center bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-300 font-bold">التراكمي للأسبوع:</span>
            <span className={`font-black ${data.cumulativeProfit >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
              {data.cumulativeProfit >= 0 ? `+${data.cumulativeProfit}` : data.cumulativeProfit} 🪙
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 text-zinc-400 border-t border-zinc-800/80">
            <div>الرهانات: {data.wonCount + data.lostCount + data.pendingCount}</div>
            <div>المبلغ: {data.stakedAmount} 🪙</div>
            <div className="text-emerald-400 font-bold">فوز: {data.wonCount}</div>
            <div className="text-red-400 font-bold">خسارة: {data.lostCount}</div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function CustomMonthlyTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950/95 border border-amber-500/40 p-3.5 rounded-2xl shadow-2xl text-right dir-rtl backdrop-blur-md space-y-2 min-w-[220px] z-50">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
          <span className="text-xs font-black text-white flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>اليوم: {data.dayLabel}</span>
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">{data.fullDateStr}</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-medium">الربح/الخسارة اليومية:</span>
            <span className={`font-black ${data.dailyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.dailyProfit >= 0 ? `+${data.dailyProfit}` : data.dailyProfit} 🪙
            </span>
          </div>

          <div className="flex justify-between items-center bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-300 font-bold">التراكمي للشهر:</span>
            <span className={`font-black ${data.cumulativeProfit >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
              {data.cumulativeProfit >= 0 ? `+${data.cumulativeProfit}` : data.cumulativeProfit} 🪙
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 text-zinc-400 border-t border-zinc-800/80">
            <div>الرهانات: {data.wonCount + data.lostCount + data.pendingCount}</div>
            <div>السيولة: {data.stakedAmount} 🪙</div>
            <div className="text-emerald-400 font-bold">فوز: {data.wonCount}</div>
            <div className="text-red-400 font-bold">خسارة: {data.lostCount}</div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

interface UserDashboardProps {
  currentUser: User;
  onUpdateProfile: (updatedUser: User) => void;
  bets: Bet[];
  allBets?: Bet[];
  matches?: Match[];
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onDeposit: (amount: number) => void;
  onClaimDailyReward?: () => void;
  onOpenCashDepositModal?: () => void;
  depositRequests?: DepositRequest[];
  onOpenWithdrawModal?: () => void;
  withdrawalRequests?: WithdrawalRequest[];
  guideCategories?: GuideCategory[];
  onOpenAdminGuideEdit?: () => void;
  onNavigateTab?: (tab: string) => void;
  onCancelBet?: (betId: string) => void;
  onLogout?: () => void;
}

export default function UserDashboard({
  currentUser,
  onUpdateProfile,
  bets,
  allBets = [],
  matches = [],
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onDeposit,
  onClaimDailyReward,
  onOpenCashDepositModal,
  depositRequests = [],
  onOpenWithdrawModal,
  withdrawalRequests = [],
  guideCategories = [],
  onOpenAdminGuideEdit,
  onNavigateTab,
  onCancelBet,
  onLogout
}: UserDashboardProps) {
  const { t, dir } = useLanguage();
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [betFilter, setBetFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highestAmount' | 'highestPayout' | 'highestOdds'>('newest');
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [chartType, setChartType] = useState<'outcome' | 'status'>('outcome');
  const [weeklyChartViewMode, setWeeklyChartViewMode] = useState<'composed' | 'area' | 'bar'>('composed');
  const [monthlyChartViewMode, setMonthlyChartViewMode] = useState<'composed' | 'area' | 'bar'>('composed');
  const [activeSection, setActiveSection] = useState<'dashboard' | 'guide'>('dashboard');
  const [betToCancelConfirm, setBetToCancelConfirm] = useState<Bet | null>(null);

  // User Statistics calculations
  const userBets = bets.filter(b => b.userId === currentUser.id);
  const totalBetsPlaced = userBets.length;
  const wonBets = userBets.filter(b => b.status === 'won');
  const winRate = totalBetsPlaced > 0 ? Math.round((wonBets.length / totalBetsPlaced) * 100) : 0;
  const totalPayout = userBets.reduce((acc, b) => acc + (b.status === 'won' ? b.payout : 0), 0);
  const totalInvested = userBets.reduce((acc, b) => acc + b.amount, 0);
  const netProfit = totalPayout - totalInvested;

  // Weekly Profit & Loss Recharts Data Calculation (past 7 days)
  const getWeeklyProfitLossData = () => {
    const days: Array<{
      dayLabel: string;
      fullDateStr: string;
      dailyProfit: number;
      cumulativeProfit: number;
      stakedAmount: number;
      wonPayout: number;
      wonCount: number;
      lostCount: number;
      pendingCount: number;
    }> = [];

    const now = new Date();
    let runningCumulative = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKeyStr = `${year}-${month}-${day}`;

      const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
      const dayFormatted = `${dayName} ${d.getDate()}/${d.getMonth() + 1}`;

      const dayBets = userBets.filter(b => {
        if (!b.placedAt) return false;
        const bDate = new Date(b.placedAt);
        return (
          bDate.getFullYear() === d.getFullYear() &&
          bDate.getMonth() === d.getMonth() &&
          bDate.getDate() === d.getDate()
        );
      });

      let dailyStaked = 0;
      let dailyPayout = 0;
      let dailyProfit = 0;
      let wonCount = 0;
      let lostCount = 0;
      let pendingCount = 0;

      dayBets.forEach(b => {
        dailyStaked += b.amount;
        if (b.status === 'won') {
          wonCount++;
          dailyPayout += b.payout;
          dailyProfit += (b.payout - b.amount);
        } else if (b.status === 'lost') {
          lostCount++;
          dailyProfit -= b.amount;
        } else if (b.status === 'pending') {
          pendingCount++;
        }
      });

      runningCumulative += dailyProfit;

      days.push({
        dayLabel: dayFormatted,
        fullDateStr: dateKeyStr,
        dailyProfit,
        cumulativeProfit: runningCumulative,
        stakedAmount: dailyStaked,
        wonPayout: dailyPayout,
        wonCount,
        lostCount,
        pendingCount
      });
    }

    return days;
  };

  const weeklyChartData = getWeeklyProfitLossData();
  const weeklyTotalNetProfit = weeklyChartData.reduce((acc, d) => acc + d.dailyProfit, 0);
  const weeklyTotalStaked = weeklyChartData.reduce((acc, d) => acc + d.stakedAmount, 0);
  const weeklyWonBets = weeklyChartData.reduce((acc, d) => acc + d.wonCount, 0);
  const weeklyLostBets = weeklyChartData.reduce((acc, d) => acc + d.lostCount, 0);
  const hasWeeklyBets = weeklyChartData.some(d => d.wonCount > 0 || d.lostCount > 0 || d.pendingCount > 0);
  const bestDay = [...weeklyChartData].sort((a, b) => b.dailyProfit - a.dailyProfit)[0];

  // Monthly Profit & Loss Recharts Data Calculation (past 30 days)
  const getMonthlyProfitLossData = () => {
    const days: Array<{
      dayLabel: string;
      fullDateStr: string;
      dailyProfit: number;
      cumulativeProfit: number;
      stakedAmount: number;
      wonPayout: number;
      wonCount: number;
      lostCount: number;
      pendingCount: number;
    }> = [];

    const now = new Date();
    let runningCumulative = 0;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKeyStr = `${year}-${month}-${day}`;

      const dayFormatted = `${d.getDate()}/${d.getMonth() + 1}`;

      const dayBets = userBets.filter(b => {
        if (!b.placedAt) return false;
        const bDate = new Date(b.placedAt);
        return (
          bDate.getFullYear() === d.getFullYear() &&
          bDate.getMonth() === d.getMonth() &&
          bDate.getDate() === d.getDate()
        );
      });

      let dailyStaked = 0;
      let dailyPayout = 0;
      let dailyProfit = 0;
      let wonCount = 0;
      let lostCount = 0;
      let pendingCount = 0;

      dayBets.forEach(b => {
        dailyStaked += b.amount;
        if (b.status === 'won') {
          wonCount++;
          dailyPayout += b.payout;
          dailyProfit += (b.payout - b.amount);
        } else if (b.status === 'lost') {
          lostCount++;
          dailyProfit -= b.amount;
        } else if (b.status === 'pending') {
          pendingCount++;
        }
      });

      runningCumulative += dailyProfit;

      days.push({
        dayLabel: dayFormatted,
        fullDateStr: dateKeyStr,
        dailyProfit,
        cumulativeProfit: runningCumulative,
        stakedAmount: dailyStaked,
        wonPayout: dailyPayout,
        wonCount,
        lostCount,
        pendingCount
      });
    }

    return days;
  };

  const monthlyChartData = getMonthlyProfitLossData();
  const monthlyTotalNetProfit = monthlyChartData.reduce((acc, d) => acc + d.dailyProfit, 0);
  const monthlyTotalStaked = monthlyChartData.reduce((acc, d) => acc + d.stakedAmount, 0);
  const monthlyWonBets = monthlyChartData.reduce((acc, d) => acc + d.wonCount, 0);
  const monthlyLostBets = monthlyChartData.reduce((acc, d) => acc + d.lostCount, 0);
  const hasMonthlyBets = monthlyChartData.some(d => d.wonCount > 0 || d.lostCount > 0 || d.pendingCount > 0);
  const monthlyBestDay = [...monthlyChartData].sort((a, b) => b.dailyProfit - a.dailyProfit)[0];
  const monthlyRoi = monthlyTotalStaked > 0 ? ((monthlyTotalNetProfit / monthlyTotalStaked) * 100).toFixed(1) : '0.0';

  // Recharts Pie Chart Datasets
  // 1. Distribution by Selected Outcome (نوع التوقع الخياري: فوز المضيف / التعادل / فوز الضيف)
  const homeCount = userBets.filter(b => b.selectedOutcome === 'home').length;
  const drawCount = userBets.filter(b => b.selectedOutcome === 'draw').length;
  const awayCount = userBets.filter(b => b.selectedOutcome === 'away').length;

  const outcomePieData = [
    { name: 'فوز الفريق المضيف', value: homeCount, color: '#10b981' }, // Emerald
    { name: 'التعادل', value: drawCount, color: '#f59e0b' },            // Amber
    { name: 'فوز الفريق الضيف', value: awayCount, color: '#3b82f6' },   // Blue
  ].filter(d => d.value > 0);

  // 2. Distribution by Bet Result / Status (نوع النتيجة: فوز / معلق / خسارة)
  const wonCount = userBets.filter(b => b.status === 'won').length;
  const pendingCount = userBets.filter(b => b.status === 'pending').length;
  const lostCount = userBets.filter(b => b.status === 'lost').length;

  const statusPieData = [
    { name: 'رهانات فائزة (فوز)', value: wonCount, color: '#10b981' },      // Emerald
    { name: 'قيد الانتظار (معلقة)', value: pendingCount, color: '#f59e0b' },// Amber
    { name: 'رهانات خاسرة (خسارة)', value: lostCount, color: '#ef4444' },    // Red
  ].filter(d => d.value > 0);

  const activePieData = chartType === 'outcome' ? outcomePieData : statusPieData;

  // Community Predictions Logic for Active Matches
  const activeCommunityMatches = matches ? matches.filter(m => m.status !== 'finished') : [];
  const [selectedMatchId, setSelectedMatchId] = useState<string>(activeCommunityMatches[0]?.id || '');

  useEffect(() => {
    if (activeCommunityMatches.length > 0 && (!selectedMatchId || !activeCommunityMatches.some(m => m.id === selectedMatchId))) {
      setSelectedMatchId(activeCommunityMatches[0].id);
    }
  }, [matches]);

  const selectedCommunityMatch = activeCommunityMatches.find(m => m.id === selectedMatchId) || activeCommunityMatches[0];

  // Helper to calculate community bet distribution percentages for a specific match
  const getCommunityPredictionPercentages = (match?: Match) => {
    if (!match) return { homePct: 45, drawPct: 25, awayPct: 30, totalBets: 0, homeBets: 0, drawBets: 0, awayBets: 0 };

    const betsPool = allBets && allBets.length > 0 ? allBets : bets;
    const matchBets = betsPool.filter(b => b.matchId === match.id || (b.teamHome === match.teamHome && b.teamAway === match.teamAway));
    const totalBets = matchBets.length;

    if (totalBets === 0) {
      // Calculate realistic baseline ratio using odds
      const invHome = 1 / (match.oddsHome || 2.0);
      const invDraw = 1 / (match.oddsDraw || 3.2);
      const invAway = 1 / (match.oddsAway || 2.4);
      const sum = invHome + invDraw + invAway;

      const homePct = Math.round((invHome / sum) * 100);
      const drawPct = Math.round((invDraw / sum) * 100);
      const awayPct = 100 - homePct - drawPct;

      return { homePct, drawPct, awayPct, totalBets: 0, homeBets: 0, drawBets: 0, awayBets: 0 };
    }

    const homeBets = matchBets.filter(b => b.selectedOutcome === 'home').length;
    const drawBets = matchBets.filter(b => b.selectedOutcome === 'draw').length;
    const awayBets = matchBets.filter(b => b.selectedOutcome === 'away').length;

    const homePct = Math.round((homeBets / totalBets) * 100);
    const drawPct = Math.round((drawBets / totalBets) * 100);
    const awayPct = Math.max(0, 100 - homePct - drawPct);

    return { homePct, drawPct, awayPct, totalBets, homeBets, drawBets, awayBets };
  };

  const currentCommunityStats = getCommunityPredictionPercentages(selectedCommunityMatch);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setPasswordError('كلمة المرور يجب أن لا تقل عن 6 أحرف');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('كلمتا المرور غير متطابقتين');
        return;
      }
    }

    const updatedUser: User = {
      ...currentUser,
      name: profileName,
      email: profileEmail,
      ...(newPassword ? { password: newPassword } : {})
    };

    onUpdateProfile(updatedUser);
    setShowEditSuccess(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setShowEditSuccess(false), 3000);
  };

  const filteredBets = userBets
    .filter(bet => {
      // 1. Status Filter
      if (betFilter !== 'all' && bet.status !== betFilter) return false;

      // 2. Search Query Filter (Teams, Outcome, Score)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const teams = `${bet.teamHome} ${bet.teamAway}`.toLowerCase();
        const outcome = (
          bet.selectedOutcome === 'home' 
            ? `فوز ${bet.teamHome}` 
            : bet.selectedOutcome === 'away' 
            ? `فوز ${bet.teamAway}` 
            : 'التعادل'
        ).toLowerCase();
        const score = (bet.matchScore || '').toLowerCase();

        const matchesQuery = 
          teams.includes(query) || 
          outcome.includes(query) || 
          score.includes(query);

        if (!matchesQuery) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.placedAt || 0).getTime() - new Date(a.placedAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.placedAt || 0).getTime() - new Date(b.placedAt || 0).getTime();
      }
      if (sortBy === 'highestAmount') {
        return b.amount - a.amount;
      }
      if (sortBy === 'highestPayout') {
        const payoutA = a.status === 'won' ? a.payout : a.status === 'pending' ? Math.round(a.amount * a.odds) : 0;
        const payoutB = b.status === 'won' ? b.payout : b.status === 'pending' ? Math.round(b.amount * b.odds) : 0;
        return payoutB - payoutA;
      }
      if (sortBy === 'highestOdds') {
        return b.odds - a.odds;
      }
      return 0;
    });

  const filteredTotalInvested = filteredBets.reduce((acc, b) => acc + b.amount, 0);
  const filteredTotalPayout = filteredBets.reduce((acc, b) => acc + (b.status === 'won' ? b.payout : 0), 0);
  const isFiltersActive = betFilter !== 'all' || searchQuery.trim() !== '' || sortBy !== 'newest';

  return (
    <div className="space-y-6 py-6" dir={dir}>
      
      {/* Dashboard Top Navigation & Section Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950 p-3 rounded-2xl border border-zinc-900 shadow-md">
        <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSection === 'dashboard'
                ? 'bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
            id="dashboard-section-overview-btn"
          >
            <UserIcon className="h-4 w-4" />
            <span>لوحة التحكم والإحصائيات</span>
          </button>
          
          <button
            onClick={() => setActiveSection('guide')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSection === 'guide'
                ? 'bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
            id="dashboard-section-guide-btn"
          >
            <BookOpen className="h-4 w-4" />
            <span>دليل المبتدئين والتعليمات</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold">
              جديد 💡
            </span>
          </button>
        </div>

        {/* User Balance Quick Badge */}
        <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-900 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-zinc-400 font-medium">الرصيد المتاح:</span>
          <span className="text-sm font-black text-amber-400 flex items-center gap-1">
            <Coins className="h-4 w-4 text-amber-400" />
            <span>{currentUser.balance.toLocaleString()} كوينز</span>
          </span>
        </div>
      </div>

      {/* Beginner Guide Banner Alert when in Overview mode */}
      {activeSection === 'dashboard' && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex-shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>جديد في منصة مينوو للتوقعات؟</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">إرشادات سريعة</span>
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                تعرف على خطوات شحن المحفظة، المشاركة في الرهانات العامة، وطريقة احتساب معاملات الأودز والعوائد المكتسبة.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('guide')}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <span>استكشف دليل المبتدئين 📖</span>
          </button>
        </div>
      )}

      {/* Render Beginner Guide if 'guide' tab is active */}
      {activeSection === 'guide' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-md">
            <button
              onClick={() => setActiveSection('dashboard')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
              id="guide-back-to-dash-btn"
            >
              {dir === 'rtl' ? <ChevronRight className="h-4.5 w-4.5 stroke-[2.5]" /> : <ChevronLeft className="h-4.5 w-4.5 stroke-[2.5]" />}
              <span>الرجوع للوحة التحكم الإحصائية</span>
            </button>
            <span className="text-xs text-zinc-400 font-semibold">دليل التعليمات والإرشادات</span>
          </div>
          <BeginnerGuide
            guideCategories={guideCategories}
            onOpenCashDepositModal={onOpenCashDepositModal}
            onOpenWithdrawModal={onOpenWithdrawModal}
            onNavigateTab={onNavigateTab}
            isAdmin={currentUser.isAdmin}
            onOpenAdminGuideEdit={onOpenAdminGuideEdit}
          />
        </div>
      ) : (
        <>
      {/* 1. Header & Profile customization */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card & Settings */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-1.5">
                <UserIcon className="h-4.5 w-4.5 text-emerald-400" />
                <span>الملف الشخصي والبيانات</span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer active:scale-95"
                  id="dash-header-logout-btn"
                  title="تسجيل الخروج"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>خروج</span>
                </button>
              )}
            </h3>

            <div className="flex items-center gap-4 py-2">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="h-16 w-16 rounded-full border-2 border-emerald-500 object-cover" 
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-white text-lg">{currentUser.name}</h4>
                  {currentUser.isAdmin && (
                    <span className="rounded-md bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 flex items-center gap-0.5">
                      <ShieldCheck className="h-3 w-3" />
                      أدمن
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{currentUser.email}</p>
                <div className="flex items-center gap-1 text-[10px] text-zinc-600 mt-2">
                  <Calendar className="h-3 w-3" />
                  <span>عضو منذ: {new Date(currentUser.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleProfileSubmit} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  id="profile-name-input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  id="profile-email-input"
                  required
                />
              </div>

              {/* Password change fields */}
              <div className="pt-2 border-t border-zinc-900 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-bold">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>تغيير كلمة المرور (اختياري)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                      className="w-full rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none pl-9"
                      id="profile-new-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                      title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">تأكيد كلمة المرور الجديدة</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="أعد كتابة كلمة المرور الجديدة"
                    className="w-full rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                    id="profile-confirm-password-input"
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-xs text-red-400 font-bold flex items-center gap-1 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}

              {showEditSuccess && (
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>تم حفظ البيانات وتحديث معلومات الحساب بنجاح!</span>
                </p>
              )}

              <button 
                type="submit" 
                className="w-full rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400 py-2.5 transition-all cursor-pointer active:scale-98"
                id="save-profile-btn"
              >
                تحديث معلومات الحساب
              </button>
            </form>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs transition-all cursor-pointer active:scale-98 shadow-sm"
                id="dashboard-full-logout-btn"
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج من الحساب</span>
              </button>
            )}
          </div>
        </div>

        {/* Glassmorphism Balance Card with Animated Counter */}
        <GlassBalanceCard
          balance={currentUser.balance}
          onOpenCashDepositModal={onOpenCashDepositModal}
          onOpenWithdrawModal={onOpenWithdrawModal}
          depositRequests={depositRequests}
          withdrawalRequests={withdrawalRequests}
          userId={currentUser.id}
        />


        {/* Interactive Stats Grid */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
            <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
            <span>إحصائيات وتحليل الأداء</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-zinc-900/30 border border-zinc-900 p-3 text-center">
              <span className="text-[10px] text-zinc-500 font-bold block mb-1">إجمالي الرهانات</span>
              <span className="text-2xl font-black text-white">{totalBetsPlaced}</span>
            </div>
            
            <div className="rounded-xl bg-zinc-900/30 border border-zinc-900 p-3 text-center">
              <span className="text-[10px] text-zinc-500 font-bold block mb-1">نسبة الفوز (%)</span>
              <span className="text-2xl font-black text-emerald-400">{winRate}%</span>
            </div>

            <div className="rounded-xl bg-zinc-900/30 border border-zinc-900 p-3 text-center">
              <span className="text-[10px] text-zinc-500 font-bold block mb-1">مسترجع الفوز</span>
              <span className="text-2xl font-black text-amber-400">{totalPayout} 🪙</span>
            </div>

            <div className="rounded-xl bg-zinc-900/30 border border-zinc-900 p-3 text-center">
              <span className="text-[10px] text-zinc-500 font-bold block mb-1">صافي الأرباح</span>
              <span className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {netProfit >= 0 ? `+${netProfit}` : netProfit} 🪙
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900/20 border border-zinc-900/50 p-3 flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span className="text-[10px] text-zinc-400 leading-normal">
              يتم تسوية وتصفية الرهانات بدقة بناءً على النتائج والإحصائيات الرسمية للفعاليات والمباريات.
            </span>
          </div>
        </div>

      </section>

      {/* 1.5 Recharts Pie Chart & Community Predictions Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="analytics-and-predictions-grid">
        
        {/* Card 1: Recharts Pie Chart Section (توزيع الرهانات الشخصية) */}
        <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 shadow-xl flex flex-col justify-between" id="bets-pie-chart-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-sm">
                <PieChartIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>توزيع الرهانات الحالية (Pie Chart)</span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">Recharts</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  تحليل بياني دائري تفاعلي لتوزيع الرهانات حسب نوع النتيجة (فوز، تعادل، خسارة)
                </p>
              </div>
            </div>

            {/* Toggle View Switcher */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
              <button
                onClick={() => setChartType('outcome')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === 'outcome'
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
                id="chart-type-outcome-btn"
              >
                نوع التوقع (مضيف / تعادل / ضيف)
              </button>
              <button
                onClick={() => setChartType('status')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === 'status'
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
                id="chart-type-status-btn"
              >
                نتيجة الرهان (فوز / معلق / خسارة)
              </button>
            </div>
          </div>

          {totalBetsPlaced === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800 text-center space-y-2 my-auto">
              <PieChartIcon className="h-10 w-10 text-zinc-600 animate-pulse" />
              <p className="text-xs font-bold text-zinc-400">لا توجد رهانات حالية لعرض الرسم البياني الدائري</p>
              <p className="text-[11px] text-zinc-500 max-w-sm">
                قم باختيار المبارة المفضلة لديك ووضع أول توقع لتبدأ التحليلات التفاعلية بالظهور هنا فوراً!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 pt-2 my-auto">
              
              {/* The Recharts Pie Chart */}
              <div className="lg:col-span-7 h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={activePieData.length > 0 ? activePieData : [{ name: 'لا توجد بيانات', value: 1, color: '#3f3f46' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      stroke="#09090b"
                      strokeWidth={2}
                    >
                      {activePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-2xl text-right dir-rtl">
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: data.payload.color }} />
                                <span className="text-xs font-black text-white">{data.name}</span>
                              </div>
                              <p className="text-xs font-bold text-amber-400 mt-1">
                                {data.value} رهان ({((data.value / totalBetsPlaced) * 100).toFixed(0)}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={32} 
                      formatter={(value) => <span className="text-[11px] text-zinc-300 font-semibold px-1">{value}</span>}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                
                {/* Center Stat Badge inside donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
                  <span className="text-xl font-black text-white">{totalBetsPlaced}</span>
                  <span className="text-[9px] text-zinc-500 font-bold">رهان</span>
                </div>
              </div>

              {/* Side Metrics Breakdown Card */}
              <div className="lg:col-span-5 space-y-2 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
                <h4 className="text-[11px] font-bold text-zinc-300 border-b border-zinc-800 pb-1.5">
                  تفاصيل التوزيع ({chartType === 'outcome' ? 'أنواع التوقعات' : 'نتائج الرهانات'}):
                </h4>

                {chartType === 'outcome' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        فوز المضيف:
                      </span>
                      <span className="text-[11px] font-black text-white">{homeCount} ({totalBetsPlaced > 0 ? Math.round((homeCount / totalBetsPlaced) * 100) : 0}%)</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        التعادل:
                      </span>
                      <span className="text-[11px] font-black text-white">{drawCount} ({totalBetsPlaced > 0 ? Math.round((drawCount / totalBetsPlaced) * 100) : 0}%)</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[11px] text-blue-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        فوز الضيف:
                      </span>
                      <span className="text-[11px] font-black text-white">{awayCount} ({totalBetsPlaced > 0 ? Math.round((awayCount / totalBetsPlaced) * 100) : 0}%)</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        الرهانات الفائزة:
                      </span>
                      <span className="text-[11px] font-black text-white">{wonCount} ({totalBetsPlaced > 0 ? Math.round((wonCount / totalBetsPlaced) * 100) : 0}%)</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        قيد الانتظار:
                      </span>
                      <span className="text-[11px] font-black text-white">{pendingCount} ({totalBetsPlaced > 0 ? Math.round((pendingCount / totalBetsPlaced) * 100) : 0}%)</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[11px] text-red-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        الرهانات الخاسرة:
                      </span>
                      <span className="text-[11px] font-black text-white">{lostCount} ({totalBetsPlaced > 0 ? Math.round((lostCount / totalBetsPlaced) * 100) : 0}%)</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </section>

        {/* Card 2: Community Predictions Section (نسب توقعات المجتمع) */}
        <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 shadow-xl flex flex-col justify-between" id="community-predictions-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>نسب توقعات المجتمع</span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> مؤشرات حية
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  توزيع توقعات الجمهور والأعضاء للمباريات الحالية ببارات تقدم ملونة
                </p>
              </div>
            </div>
          </div>

          {activeCommunityMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800 text-center space-y-2 my-auto">
              <BarChart3 className="h-10 w-10 text-zinc-600 animate-pulse" />
              <p className="text-xs font-bold text-zinc-400">لا توجد مباريات نشطة حالياً لحساب نسبة التوقعات</p>
            </div>
          ) : (
            <div className="space-y-3 my-auto">
              
              {/* Match Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {activeCommunityMatches.slice(0, 5).map(m => {
                  const isSelected = selectedCommunityMatch?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMatchId(m.id)}
                      className={`whitespace-nowrap px-2.5 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                          : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      <span>{m.teamHome} - {m.teamAway}</span>
                      {m.status === 'live' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedCommunityMatch && (
                <div className="bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-xl space-y-3">
                  {/* Selected Match Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-amber-400 font-extrabold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        {selectedCommunityMatch.league || 'دوري المحترفين'}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-semibold">{selectedCommunityMatch.time}</span>
                    </div>

                    <div className="text-[10px] font-extrabold text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-emerald-400" />
                      <span>{currentCommunityStats.totalBets > 0 ? `${currentCommunityStats.totalBets} رهان` : 'تقدير ذكي بناءً على الأودز'}</span>
                    </div>
                  </div>

                  {/* Multi-segment Combined Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400 px-0.5">
                      <span className="text-emerald-400">{selectedCommunityMatch.teamHome}: {currentCommunityStats.homePct}%</span>
                      <span className="text-amber-400">التعادل: {currentCommunityStats.drawPct}%</span>
                      <span className="text-blue-400">{selectedCommunityMatch.teamAway}: {currentCommunityStats.awayPct}%</span>
                    </div>

                    <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800/80 flex gap-0.5">
                      <div 
                        className="bg-emerald-500 h-full rounded-l-full transition-all duration-700 shadow-sm"
                        style={{ width: `${currentCommunityStats.homePct}%` }}
                        title={`فوز ${selectedCommunityMatch.teamHome}: ${currentCommunityStats.homePct}%`}
                      />
                      <div 
                        className="bg-amber-500 h-full transition-all duration-700 shadow-sm"
                        style={{ width: `${currentCommunityStats.drawPct}%` }}
                        title={`التعادل: ${currentCommunityStats.drawPct}%`}
                      />
                      <div 
                        className="bg-blue-500 h-full rounded-r-full transition-all duration-700 shadow-sm"
                        style={{ width: `${currentCommunityStats.awayPct}%` }}
                        title={`فوز ${selectedCommunityMatch.teamAway}: ${currentCommunityStats.awayPct}%`}
                      />
                    </div>
                  </div>

                  {/* Detailed Individual Progress Bars with Logos and Odds */}
                  <div className="space-y-2 pt-0.5">
                    
                    {/* 1. Home Win Progress Bar */}
                    <div className="space-y-1 bg-zinc-950/80 p-2 rounded-xl border border-zinc-900">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>فوز {selectedCommunityMatch.teamHome}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-zinc-500 font-medium">(أودز x{selectedCommunityMatch.oddsHome})</span>
                          <span className="text-emerald-400 font-black text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {currentCommunityStats.homePct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800/50">
                        <div 
                          className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-700" 
                          style={{ width: `${currentCommunityStats.homePct}%` }} 
                        />
                      </div>
                    </div>

                    {/* 2. Draw Progress Bar */}
                    <div className="space-y-1 bg-zinc-950/80 p-2 rounded-xl border border-zinc-900">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <span>التعادل</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-zinc-500 font-medium">(أودز x{selectedCommunityMatch.oddsDraw})</span>
                          <span className="text-amber-400 font-black text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {currentCommunityStats.drawPct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800/50">
                        <div 
                          className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-700" 
                          style={{ width: `${currentCommunityStats.drawPct}%` }} 
                        />
                      </div>
                    </div>

                    {/* 3. Away Win Progress Bar */}
                    <div className="space-y-1 bg-zinc-950/80 p-2 rounded-xl border border-zinc-900">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-blue-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <span>فوز {selectedCommunityMatch.teamAway}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-zinc-500 font-medium">(أودز x{selectedCommunityMatch.oddsAway})</span>
                          <span className="text-blue-400 font-black text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                            {currentCommunityStats.awayPct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800/50">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-700" 
                          style={{ width: `${currentCommunityStats.awayPct}%` }} 
                        />
                      </div>
                    </div>

                  </div>

                  {/* Insight note */}
                  <div className="pt-1.5 border-t border-zinc-800/60 flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
                    <Flame className="h-3 w-3 text-amber-400 shrink-0 animate-bounce" />
                    <span>
                      {currentCommunityStats.homePct >= currentCommunityStats.awayPct && currentCommunityStats.homePct >= currentCommunityStats.drawPct
                        ? `أغلبية الجمهور ترجح كفة ${selectedCommunityMatch.teamHome} بنسبة ${currentCommunityStats.homePct}% 🔥`
                        : currentCommunityStats.awayPct >= currentCommunityStats.homePct && currentCommunityStats.awayPct >= currentCommunityStats.drawPct
                        ? `أغلبية الجمهور ترجح كفة ${selectedCommunityMatch.teamAway} بنسبة ${currentCommunityStats.awayPct}% 🔥`
                        : `التوقعات ترجح التعادل بين الفريقين بنسبة ${currentCommunityStats.drawPct}% ⚖️`
                      }
                    </span>
                  </div>

                </div>
              )}

            </div>
          )}
        </section>

      </div>

      {/* Section 1.6: Weekly Profit & Loss Evolution Recharts Chart (تطور أرباح وخسائر الأسبوع الماضي) */}
      <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-5 shadow-2xl relative overflow-hidden" id="weekly-profit-loss-chart-section">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <BarChart3 className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>تطور أرباح وخسائر الأسبوع الماضي</span>
                <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Recharts 📊
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                رسم بياني تفاعلي يوضح المنحنى الزمني اليومي والأرباح التراكمية لرهاناتك خلال آخر 7 أيام
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setWeeklyChartViewMode('composed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                weeklyChartViewMode === 'composed'
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
              id="weekly-chart-composed-btn"
            >
              شامل (بارات + مساحة)
            </button>
            <button
              type="button"
              onClick={() => setWeeklyChartViewMode('area')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                weeklyChartViewMode === 'area'
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
              id="weekly-chart-area-btn"
            >
              المساحة التراكمية
            </button>
            <button
              type="button"
              onClick={() => setWeeklyChartViewMode('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                weeklyChartViewMode === 'bar'
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
              id="weekly-chart-bar-btn"
            >
              الربح اليومي (بارات)
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900 text-center">
            <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">صافي أرباح الأسبوع</span>
            <span className={`text-lg font-black ${weeklyTotalNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {weeklyTotalNetProfit >= 0 ? `+${weeklyTotalNetProfit}` : weeklyTotalNetProfit} 🪙
            </span>
          </div>

          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900 text-center">
            <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">أفضل يوم أرباح</span>
            <span className="text-xs font-black text-amber-400 block truncate">
              {bestDay && bestDay.dailyProfit > 0 ? `${bestDay.dayLabel} (+${bestDay.dailyProfit}🪙)` : 'لا توجد أرباح'}
            </span>
          </div>

          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900 text-center">
            <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">سيولة رهانات الأسبوع</span>
            <span className="text-lg font-black text-white">{weeklyTotalStaked} 🪙</span>
          </div>

          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900 text-center">
            <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">نتائج صفقات الأسبوع</span>
            <span className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
              <span>{weeklyWonBets} فوز</span>
              <span className="text-zinc-600">/</span>
              <span className="text-red-400">{weeklyLostBets} خسارة</span>
            </span>
          </div>
        </div>

        {/* Notice if no bets placed in past 7 days */}
        {!hasWeeklyBets && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>لم تقم بوضع رهانات خلال السبعة أيام الماضية. يظهر الرسم البياني خط الأساس الصفري للنشاط اليومي.</span>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('events')}
                className="px-3 py-1 bg-amber-500 text-zinc-950 font-black rounded-lg text-[11px] shrink-0 hover:bg-amber-400 transition-all cursor-pointer"
              >
                تصفح المباريات والرهانات
              </button>
            )}
          </div>
        )}

        {/* Recharts Chart Canvas Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {weeklyChartViewMode === 'area' ? (
              <AreaChart data={weeklyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaProfitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}🪙`} />
                <RechartsTooltip content={<CustomWeeklyTooltip />} />
                <ReferenceLine y={0} stroke="#52525b" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="التراكمي"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#areaProfitGrad)"
                />
              </AreaChart>
            ) : weeklyChartViewMode === 'bar' ? (
              <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}🪙`} />
                <RechartsTooltip content={<CustomWeeklyTooltip />} />
                <ReferenceLine y={0} stroke="#52525b" strokeDasharray="3 3" />
                <Bar dataKey="dailyProfit" name="الربح اليومي" radius={[6, 6, 0, 0]} maxBarSize={36}>
                  {weeklyChartData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.dailyProfit >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <ComposedChart data={weeklyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="composedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}🪙`} />
                <RechartsTooltip content={<CustomWeeklyTooltip />} />
                <ReferenceLine y={0} stroke="#52525b" strokeDasharray="3 3" />
                <Bar dataKey="dailyProfit" name="الربح اليومي" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  {weeklyChartData.map((entry, index) => (
                    <Cell key={`composed-cell-${index}`} fill={entry.dailyProfit >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="التراكمي"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#composedGrad)"
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Legend Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-zinc-900 pt-3 text-[11px] text-zinc-400 gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-emerald-400">أرباح يومية (+🪙)</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
              <span className="text-red-400">خسائر يومية (-🪙)</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="text-amber-400">المسار التراكمي للأسبوع</span>
            </span>
          </div>

          <span className="text-zinc-500 text-[10px]">
            يتم تحديث البيانات وإعادة الحساب تلقائياً مع كل رهان جديد ⚡
          </span>
        </div>

      </section>

      {/* Section 1.7: Monthly Profit & Loss Evolution Recharts Chart (تاريخ أرباح وخسائر الشهر الماضي - 30 يوماً) */}
      <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-5 shadow-2xl relative overflow-hidden" id="monthly-profit-loss-chart-section">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
              <Calendar className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>تاريخ أرباح وخسائر الشهر الماضي (30 يوماً)</span>
                <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Recharts 📊
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                سجل بياني تفاعلي شامل يوضح الأداء المالي اليومي وتطور الأرباح والخسائر التراكمية خلال آخر 30 يوماً
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setMonthlyChartViewMode('composed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                monthlyChartViewMode === 'composed'
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
              id="monthly-chart-composed-btn"
            >
              شامل (بارات + مساحة)
            </button>
            <button
              type="button"
              onClick={() => setMonthlyChartViewMode('area')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                monthlyChartViewMode === 'area'
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
              id="monthly-chart-area-btn"
            >
              المساحة التراكمية
            </button>
            <button
              type="button"
              onClick={() => setMonthlyChartViewMode('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                monthlyChartViewMode === 'bar'
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
              id="monthly-chart-bar-btn"
            >
              الربح اليومي (بارات)
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar for Month */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900 text-center">
            <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">صافي أرباح الشهر</span>
            <span className={`text-lg font-black ${monthlyTotalNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {monthlyTotalNetProfit >= 0 ? `+${monthlyTotalNetProfit}` : monthlyTotalNetProfit} 🪙
            </span>
          </div>

          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900 text-center">
            <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">عائد الاستثمار (ROI)</span>
            <span className={`text-lg font-black ${Number(monthlyRoi) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {Number(monthlyRoi) >= 0 ? `+${monthlyRoi}%` : `${monthlyRoi}%`}
            </span>
          </div>

          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900 text-center">
            <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">أفضل يوم في الشهر</span>
            <span className="text-xs font-black text-amber-400 block truncate">
              {monthlyBestDay && monthlyBestDay.dailyProfit > 0 ? `${monthlyBestDay.dayLabel} (+${monthlyBestDay.dailyProfit}🪙)` : 'لا توجد أرباح'}
            </span>
          </div>

          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900 text-center">
            <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">سيولة الرهانات الشهري</span>
            <span className="text-lg font-black text-white">{monthlyTotalStaked} 🪙</span>
          </div>

          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-900 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">صفقات الشهر</span>
            <span className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
              <span>{monthlyWonBets} فوز</span>
              <span className="text-zinc-600">/</span>
              <span className="text-red-400">{monthlyLostBets} خسارة</span>
            </span>
          </div>
        </div>

        {/* Notice if no bets placed in past 30 days */}
        {!hasMonthlyBets && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>لم تسجل أي نشاط رهان خلال الثلاثين يوماً الماضية. يعرض الرسم الخط الصفري المرجعي.</span>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('events')}
                className="px-3 py-1 bg-amber-500 text-zinc-950 font-black rounded-lg text-[11px] shrink-0 hover:bg-amber-400 transition-all cursor-pointer"
              >
                المباريات والرهانات
              </button>
            )}
          </div>
        )}

        {/* Recharts Chart Canvas Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {monthlyChartViewMode === 'area' ? (
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="monthlyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#a1a1aa" fontSize={10} tickLine={false} interval={2} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}🪙`} />
                <RechartsTooltip content={<CustomMonthlyTooltip />} />
                <ReferenceLine y={0} stroke="#52525b" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="التراكمي الشهري"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#monthlyAreaGrad)"
                />
              </AreaChart>
            ) : monthlyChartViewMode === 'bar' ? (
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#a1a1aa" fontSize={10} tickLine={false} interval={2} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}🪙`} />
                <RechartsTooltip content={<CustomMonthlyTooltip />} />
                <ReferenceLine y={0} stroke="#52525b" strokeDasharray="3 3" />
                <Bar dataKey="dailyProfit" name="الربح اليومي" radius={[4, 4, 0, 0]} maxBarSize={16}>
                  {monthlyChartData.map((entry, index) => (
                    <Cell key={`mbar-cell-${index}`} fill={entry.dailyProfit >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <ComposedChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="monthlyComposedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#a1a1aa" fontSize={10} tickLine={false} interval={2} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}🪙`} />
                <RechartsTooltip content={<CustomMonthlyTooltip />} />
                <ReferenceLine y={0} stroke="#52525b" strokeDasharray="3 3" />
                <Bar dataKey="dailyProfit" name="الربح اليومي" radius={[4, 4, 0, 0]} maxBarSize={14}>
                  {monthlyChartData.map((entry, index) => (
                    <Cell key={`mcomposed-cell-${index}`} fill={entry.dailyProfit >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="التراكمي الشهري"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#monthlyComposedGrad)"
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Legend Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-zinc-900 pt-3 text-[11px] text-zinc-400 gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-emerald-400">أرباح يومية (+🪙)</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
              <span className="text-red-400">خسائر يومية (-🪙)</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="text-amber-400">المسار التراكمي للشهر الماضي (30 يوماً)</span>
            </span>
          </div>

          <span className="text-zinc-500 text-[10px]">
            يتم تحديث رسم الأداء الشهري تلقائياً مع كل تغير في نتائج الرهانات ⚡
          </span>
        </div>

      </section>

      {/* 2. Active Bets List Component */}
      <UserActiveBetsList bets={bets} currentUser={currentUser} matches={matches} />

      {/* 3. Notifications Feed */}
      <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <Bell className="h-5 w-5 text-emerald-400" />
              <span>الإشعارات وتنبيهات النظام</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">تابع تحديثات نتائج المباريات وحسابك أولاً بأول</p>
          </div>

          <button
            onClick={onClearNotifications}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold hover:underline"
            id="clear-all-notifications-btn"
          >
            <Trash2 className="h-4 w-4" />
            <span>مسح جميع الإشعارات</span>
          </button>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <div 
                key={`${notif.id}-${idx}`}
                onClick={() => onMarkNotificationRead(notif.id)}
                className={`rounded-xl p-4 border transition-all flex justify-between items-start cursor-pointer ${
                  notif.read 
                    ? 'border-zinc-900 bg-zinc-950 text-zinc-400' 
                    : 'border-emerald-500/10 bg-emerald-500/5 text-zinc-200'
                }`}
                id={`notif-item-${notif.id}`}
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${notif.read ? 'bg-zinc-900 text-zinc-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {notif.type === 'bet' ? <Coins className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{notif.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{notif.message}</p>
                    <span className="text-[9px] text-zinc-600 mt-2 block">
                      {new Date(notif.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mt-2" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 text-sm">
            صندوق الوارد نظيف بالكامل! لا توجد إشعارات حالياً.
          </div>
        )}
      </section>

      </>
      )}

      {/* Confirmation Modal for cancelling/deleting a pending bet */}
      {betToCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 overflow-hidden">
            
            {/* Decorative background ambient glows */}
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-red-500/10 blur-2xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">تأكيد إلغاء الرهان المعلق</h3>
                  <p className="text-[11px] text-zinc-400">تأكيد الإجراء لمنع الأخطاء غير المقصودة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBetToCancelConfirm(null)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                id="close-cancel-bet-modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Bet Details Box */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">المباراة:</span>
                <span className="font-bold text-white">{betToCancelConfirm.teamHome} × {betToCancelConfirm.teamAway}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">التوقع المختار:</span>
                <span className="font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  {betToCancelConfirm.selectedOutcome === 'home' 
                    ? `فوز ${betToCancelConfirm.teamHome}` 
                    : betToCancelConfirm.selectedOutcome === 'away' 
                    ? `فوز ${betToCancelConfirm.teamAway}` 
                    : 'التعادل'} (معامل x{betToCancelConfirm.odds.toFixed(2)})
                </span>
              </div>

              <div className="flex justify-between items-center text-xs border-t border-zinc-800/80 pt-2.5">
                <span className="text-zinc-400 font-medium">المبلغ المستثمر:</span>
                <span className="font-black text-amber-400 text-sm">{betToCancelConfirm.amount.toLocaleString()} 🪙 كوينز</span>
              </div>
            </div>

            {/* Explanatory Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Coins className="h-4 w-4 shrink-0 text-amber-400" />
                <span>استرداد الكوينز إلى حسابك:</span>
              </p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                عند إلغاء الرهان المعلق، سيتم إزالته فوراً وإعادة مبلغ <strong className="text-amber-400">{betToCancelConfirm.amount.toLocaleString()} كوينز</strong> بالكامل إلى محفظتك المتاحة.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onCancelBet) {
                    onCancelBet(betToCancelConfirm.id);
                  }
                  setBetToCancelConfirm(null);
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-red-500/20 border border-red-400/30 flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
                id="confirm-cancel-bet-btn"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                <span>نعم، إلغاء الرهان</span>
              </button>

              <button
                type="button"
                onClick={() => setBetToCancelConfirm(null)}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold py-3 px-4 rounded-xl border border-zinc-800 flex items-center justify-center gap-1 text-xs transition-all cursor-pointer"
                id="dismiss-cancel-bet-btn"
              >
                <span>تراجع / إغلاق</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
