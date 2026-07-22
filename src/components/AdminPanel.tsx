import React, { useState } from 'react';
import { User, Match, Bet, DepositRequest, PublicBetOffer, WithdrawalRequest, LeagueStandingItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  PlusCircle, 
  Activity, 
  Trash2, 
  Coins, 
  ShieldAlert,
  Search,
  Target,
  Edit3,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Ticket,
  Filter,
  Check,
  Wallet,
  Phone,
  Eye,
  FileCheck,
  FileX,
  X,
  Flame,
  Globe,
  ArrowUpRight,
  Trophy,
  ShieldCheck,
  Eraser,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface AdminPanelProps {
  allUsers: User[];
  allMatches: Match[];
  allBets: Bet[];
  cashWalletNumber: string;
  depositRequests: DepositRequest[];
  withdrawalRequests?: WithdrawalRequest[];
  publicBetOffers: PublicBetOffer[];
  leagueStandings?: LeagueStandingItem[];
  onAddMatch: (match: Match) => void;
  onUpdateMatchScore: (matchId: string, scoreHome: number, scoreAway: number, status: 'scheduled' | 'live' | 'finished') => void;
  onUpdateMatchStats: (matchId: string, stats: any) => void;
  onUpdateUserBalance: (userId: string, newBalance: number) => void;
  onToggleUserAdmin: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onCreateBetForUser?: (userId: string, matchId: string, outcome: 'home' | 'draw' | 'away', amount: number, customOdds?: number) => void;
  onUpdateBetStatus?: (betId: string, newStatus: 'pending' | 'won' | 'lost') => void;
  onDeleteBet?: (betId: string) => void;
  onUpdateCashWalletNumber: (newNumber: string) => void;
  onApproveDepositRequest: (requestId: string) => void;
  onRejectDepositRequest: (requestId: string, adminNote?: string) => void;
  onDeleteDepositRequest: (requestId: string) => void;
  onApproveWithdrawalRequest?: (requestId: string) => void;
  onRejectWithdrawalRequest?: (requestId: string, adminNote?: string) => void;
  onDeleteWithdrawalRequest?: (requestId: string) => void;
  onCreatePublicBetOffer: (offer: PublicBetOffer) => void;
  onResolvePublicBetOffer: (offerId: string, outcomeStatus: 'won' | 'lost' | 'cancelled') => void;
  onDeletePublicBetOffer: (offerId: string) => void;
  onUpdateMatchCustomizations?: (
    matchId: string, 
    customLabelHome?: string, 
    customLabelDraw?: string, 
    customLabelAway?: string, 
    fixedStakeAmount?: number,
    isFeatured?: boolean,
    featuredTag?: string
  ) => void;
  onUpdateLeagueStandings?: (standings: LeagueStandingItem[]) => void;
  onClearDemoData?: () => void;
}

export default function AdminPanel({
  allUsers,
  allMatches,
  allBets,
  cashWalletNumber,
  depositRequests,
  withdrawalRequests = [],
  publicBetOffers,
  leagueStandings = [],
  onAddMatch,
  onUpdateMatchScore,
  onUpdateMatchStats,
  onUpdateUserBalance,
  onToggleUserAdmin,
  onDeleteUser,
  onCreateBetForUser,
  onUpdateBetStatus,
  onDeleteBet,
  onUpdateCashWalletNumber,
  onApproveDepositRequest,
  onRejectDepositRequest,
  onDeleteDepositRequest,
  onApproveWithdrawalRequest,
  onRejectWithdrawalRequest,
  onDeleteWithdrawalRequest,
  onCreatePublicBetOffer,
  onResolvePublicBetOffer,
  onDeletePublicBetOffer,
  onUpdateMatchCustomizations,
  onUpdateLeagueStandings,
  onClearDemoData
}: AdminPanelProps) {
  const { t, dir } = useLanguage();
  const [adminTab, setAdminTab] = useState<'users' | 'create-bet' | 'bets-list' | 'cash-deposits' | 'cash-withdrawals' | 'events' | 'stats' | 'reports' | 'league-standings' | 'clear-data'>('users');


  // Search/Filter states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [betSearchQuery, setBetSearchQuery] = useState('');
  const [betStatusFilter, setBetStatusFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');

  // Cash Wallet Admin Editing States
  const [editingCashNumber, setEditingCashNumber] = useState(cashWalletNumber);
  const [cashNumberSaveSuccess, setCashNumberSaveSuccess] = useState(false);
  const [depositSearchQuery, setDepositSearchQuery] = useState('');
  const [depositStatusFilter, setDepositStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [previewReceiptImage, setPreviewReceiptImage] = useState<string | null>(null);
  const [rejectNoteInput, setRejectNoteInput] = useState<{ [id: string]: string }>({});

  // Withdrawal Requests States
  const [withdrawSearchQuery, setWithdrawSearchQuery] = useState('');
  const [withdrawStatusFilter, setWithdrawStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Manual User Balance editing state per user
  const [editingUserBalance, setEditingUserBalance] = useState<{ [userId: string]: number }>({});
  const [balanceSaveMsg, setBalanceSaveMsg] = useState<{ [userId: string]: boolean }>({});

  // Public / Single Bet Creation States
  const [betTargetMode, setBetTargetMode] = useState<'public' | 'single'>('public'); // Default is Public Bet for all users
  const [pubTitleInput, setPubTitleInput] = useState<string>('');
  const [pubDescInput, setPubDescInput] = useState<string>('');
  const [pubOddsInput, setPubOddsInput] = useState<number>(2.00);

  // Single User Create Bet form states
  const [selectedUserId, setSelectedUserId] = useState<string>(allUsers[0]?.id || '');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(allMatches[0]?.id || '');
  const [selectedOutcome, setSelectedOutcome] = useState<'home' | 'draw' | 'away'>('home');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [customOddsInput, setCustomOddsInput] = useState<string>('');
  const [createBetSuccess, setCreateBetSuccess] = useState(false);
  const [createBetError, setCreateBetError] = useState('');

  // Create Match form states
  const [newHome, setNewHome] = useState('');
  const [newAway, setNewAway] = useState('');
  const [newSport, setNewSport] = useState<'football' | 'basketball' | 'tennis'>('football');
  const [newLeague, setNewLeague] = useState('الدوري الإنجليزي الممتاز');
  const [newOddsHome, setNewOddsHome] = useState(2.00);
  const [newOddsDraw, setNewOddsDraw] = useState(3.20);
  const [newOddsAway, setNewOddsAway] = useState(2.50);
  const [newTime, setNewTime] = useState('20:00');
  const [newCustomLabelHome, setNewCustomLabelHome] = useState('');
  const [newCustomLabelDraw, setNewCustomLabelDraw] = useState('');
  const [newCustomLabelAway, setNewCustomLabelAway] = useState('');
  const [newFixedStakeAmount, setNewFixedStakeAmount] = useState<string>('');
  const [newIsFeatured, setNewIsFeatured] = useState<boolean>(false);
  const [newFeaturedTag, setNewFeaturedTag] = useState<string>('🔥 قمة الأسبوع');
  const [addMatchSuccess, setAddMatchSuccess] = useState(false);

  // Match Bet Button Customization States
  const [selectedMatchForCustom, setSelectedMatchForCustom] = useState(allMatches[0]?.id || '');
  const [editCustomLabelHome, setEditCustomLabelHome] = useState('');
  const [editCustomLabelDraw, setEditCustomLabelDraw] = useState('');
  const [editCustomLabelAway, setEditCustomLabelAway] = useState('');
  const [editFixedStakeAmount, setEditFixedStakeAmount] = useState<string>('');
  const [editIsFeatured, setEditIsFeatured] = useState<boolean>(false);
  const [editFeaturedTag, setEditFeaturedTag] = useState<string>('');
  const [customSaveSuccess, setCustomSaveSuccess] = useState(false);

  // Stats update states
  const [selectedMatchForStats, setSelectedMatchForStats] = useState(allMatches[0]?.id || '');
  const [statsPossessionHome, setStatsPossessionHome] = useState(50);
  const [statsShotsHome, setStatsShotsHome] = useState(10);
  const [statsShotsAway, setStatsShotsAway] = useState(10);
  const [statsCornersHome, setStatsCornersHome] = useState(5);
  const [statsCornersAway, setStatsCornersAway] = useState(5);
  const [statsFoulsHome, setStatsFoulsHome] = useState(8);
  const [statsFoulsAway, setStatsFoulsAway] = useState(8);
  const [statsSuccess, setStatsSuccess] = useState(false);

  // Manual score resolve states
  const [selectedMatchForScore, setSelectedMatchForScore] = useState(allMatches[0]?.id || '');
  const [scoreHome, setScoreHome] = useState(0);
  const [scoreAway, setScoreAway] = useState(0);
  const [resolveStatus, setResolveStatus] = useState<'scheduled' | 'live' | 'finished'>('finished');
  const [scoreSuccess, setScoreSuccess] = useState(false);

  // Filtered lists
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredBets = allBets.filter(b => {
    const user = allUsers.find(u => u.id === b.userId);
    const matchesQuery = `${b.teamHome} ${b.teamAway} ${user?.name || ''} ${user?.email || ''}`.toLowerCase();
    const matchSearch = matchesQuery.includes(betSearchQuery.toLowerCase());
    const matchStatus = betStatusFilter === 'all' || b.status === betStatusFilter;
    return matchSearch && matchStatus;
  });

  // Target match calculation for Bet Creation
  const currentSelectedMatch = allMatches.find(m => m.id === selectedMatchId) || allMatches[0];
  const autoOdds = currentSelectedMatch 
    ? (selectedOutcome === 'home' ? currentSelectedMatch.oddsHome : selectedOutcome === 'away' ? currentSelectedMatch.oddsAway : currentSelectedMatch.oddsDraw)
    : 2.0;
  
  const activeOdds = customOddsInput !== '' ? parseFloat(customOddsInput) || autoOdds : autoOdds;
  const calculatedPayout = Math.round(betAmount * activeOdds);

  // Handle manual balance edit save
  const handleSaveManualBalance = (userId: string) => {
    const newBal = editingUserBalance[userId];
    if (newBal !== undefined && !isNaN(newBal)) {
      onUpdateUserBalance(userId, Math.max(0, newBal));
      setBalanceSaveMsg(prev => ({ ...prev, [userId]: true }));
      setTimeout(() => {
        setBalanceSaveMsg(prev => ({ ...prev, [userId]: false }));
      }, 2500);
    }
  };

  // Handle Create Bet submit
  const handleAdminSubmitCreateBet = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateBetError('');
    setCreateBetSuccess(false);

    const currentMatch = allMatches.find(m => m.id === selectedMatchId);
    if (!currentMatch) {
      setCreateBetError('المباراة المحددة غير موجودة.');
      return;
    }

    if (betTargetMode === 'public') {
      const outcomeText = selectedOutcome === 'home'
        ? `فوز ${currentMatch.teamHome}`
        : selectedOutcome === 'away'
        ? `فوز ${currentMatch.teamAway}`
        : 'التعادل';

      const title = pubTitleInput.trim() || `تحدي قمة: ${outcomeText} (${currentMatch.teamHome} ضد ${currentMatch.teamAway})`;

      const newPublicOffer: PublicBetOffer = {
        id: `pbet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        matchId: currentMatch.id,
        teamHome: currentMatch.teamHome,
        teamAway: currentMatch.teamAway,
        selectedOutcome,
        outcomeLabel: outcomeText,
        odds: Number(pubOddsInput) || activeOdds || 2.00,
        description: pubDescInput.trim() || `رهان عام مفتوح من الإدارة لجميع المستخدمين بـ معامل ${pubOddsInput || activeOdds || 2.00}x!`,
        status: 'active',
        createdAt: new Date().toISOString(),
        participantsCount: 0,
        totalStakedCoins: 0
      };

      onCreatePublicBetOffer(newPublicOffer);
      setCreateBetSuccess(true);
      setPubTitleInput('');
      setPubDescInput('');
      setTimeout(() => setCreateBetSuccess(false), 3500);
      return;
    }

    if (!selectedUserId || !selectedMatchId) {
      setCreateBetError('يرجى اختيار المستخدم والمباراة.');
      return;
    }

    const targetUser = allUsers.find(u => u.id === selectedUserId);
    if (!targetUser) {
      setCreateBetError('المستخدم المحدد غير موجود.');
      return;
    }

    if (betAmount <= 0) {
      setCreateBetError('مبلغ الرهان يجب أن يكون أكبر من 0.');
      return;
    }

    if (onCreateBetForUser) {
      onCreateBetForUser(selectedUserId, selectedMatchId, selectedOutcome, betAmount, activeOdds);
      setCreateBetSuccess(true);
      setTimeout(() => setCreateBetSuccess(false), 3500);
    }
  };

  // Load selected match details into customization form
  React.useEffect(() => {
    const target = allMatches.find(m => m.id === selectedMatchForCustom);
    if (target) {
      setEditCustomLabelHome(target.customLabelHome || '');
      setEditCustomLabelDraw(target.customLabelDraw || '');
      setEditCustomLabelAway(target.customLabelAway || '');
      setEditFixedStakeAmount(target.fixedStakeAmount ? String(target.fixedStakeAmount) : '');
      setEditIsFeatured(Boolean(target.isFeatured));
      setEditFeaturedTag(target.featuredTag || '');
    }
  }, [selectedMatchForCustom, allMatches]);

  const handleUpdateCustomizationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForCustom) return;

    const parsedFixedStake = editFixedStakeAmount !== '' ? parseInt(editFixedStakeAmount) : undefined;
    
    if (onUpdateMatchCustomizations) {
      onUpdateMatchCustomizations(
        selectedMatchForCustom,
        editCustomLabelHome.trim() || undefined,
        editCustomLabelDraw.trim() || undefined,
        editCustomLabelAway.trim() || undefined,
        parsedFixedStake && parsedFixedStake > 0 ? parsedFixedStake : undefined,
        editIsFeatured,
        editIsFeatured ? (editFeaturedTag.trim() || '🔥 مباراة متميزة') : undefined
      );
      setCustomSaveSuccess(true);
      setTimeout(() => setCustomSaveSuccess(false), 3000);
    }
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHome || !newAway) return;

    const parsedFixedStake = newFixedStakeAmount !== '' ? parseInt(newFixedStakeAmount) : undefined;

    const created: Match = {
      id: `match-${Date.now()}`,
      sport: newSport,
      teamHome: newHome,
      teamAway: newAway,
      logoHome: newSport === 'football' ? '⚽' : newSport === 'basketball' ? '🏀' : '🎾',
      logoAway: '🏳️',
      oddsHome: Number(newOddsHome),
      oddsDraw: Number(newOddsDraw),
      oddsAway: Number(newOddsAway),
      status: 'scheduled',
      scoreHome: 0,
      scoreAway: 0,
      minutes: 0,
      stats: {
        possessionHome: 50,
        possessionAway: 50,
        shotsHome: 0,
        shotsAway: 0,
        cornersHome: 0,
        cornersAway: 0,
        foulsHome: 0,
        foulsAway: 0,
      },
      league: newLeague,
      date: '2026-07-21',
      time: newTime,
      customLabelHome: newCustomLabelHome.trim() || undefined,
      customLabelDraw: newCustomLabelDraw.trim() || undefined,
      customLabelAway: newCustomLabelAway.trim() || undefined,
      fixedStakeAmount: parsedFixedStake && parsedFixedStake > 0 ? parsedFixedStake : undefined,
      isFeatured: newIsFeatured,
      featuredTag: newIsFeatured ? (newFeaturedTag.trim() || '🔥 مباراة متميزة') : undefined,
    };

    onAddMatch(created);
    setAddMatchSuccess(true);
    setNewHome('');
    setNewAway('');
    setNewCustomLabelHome('');
    setNewCustomLabelDraw('');
    setNewCustomLabelAway('');
    setNewFixedStakeAmount('');
    setNewIsFeatured(false);
    setNewFeaturedTag('🔥 قمة الأسبوع');
    setTimeout(() => setAddMatchSuccess(false), 3000);
  };

  const handleUpdateStatsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedStats = {
      possessionHome: Number(statsPossessionHome),
      possessionAway: 100 - Number(statsPossessionHome),
      shotsHome: Number(statsShotsHome),
      shotsAway: Number(statsShotsAway),
      cornersHome: Number(statsCornersHome),
      cornersAway: Number(statsCornersAway),
      foulsHome: Number(statsFoulsHome),
      foulsAway: Number(statsFoulsAway)
    };
    onUpdateMatchStats(selectedMatchForStats, updatedStats);
    setStatsSuccess(true);
    setTimeout(() => setStatsSuccess(false), 3000);
  };

  const handleResolveScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMatchScore(selectedMatchForScore, Number(scoreHome), Number(scoreAway), resolveStatus);
    setScoreSuccess(true);
    setTimeout(() => setScoreSuccess(false), 3000);
  };

  // Handler for saving cash wallet number
  const handleSaveCashNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCashNumber.trim()) return;
    onUpdateCashWalletNumber(editingCashNumber.trim());
    setCashNumberSaveSuccess(true);
    setTimeout(() => setCashNumberSaveSuccess(false), 3000);
  };

  // Filtered Deposit Requests
  const filteredDeposits = depositRequests.filter(req => {
    const searchMatch = 
      req.userName.toLowerCase().includes(depositSearchQuery.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(depositSearchQuery.toLowerCase()) ||
      req.senderPhone.includes(depositSearchQuery);

    const statusMatch = depositStatusFilter === 'all' || req.status === depositStatusFilter;
    return searchMatch && statusMatch;
  });

  // Financial statistics
  const totalVolume = allBets.reduce((acc, b) => acc + b.amount, 0);
  const totalPayout = allBets.reduce((acc, b) => acc + (b.status === 'won' ? b.payout : 0), 0);

  return (
    <div className="space-y-8 py-6" dir={dir}>
      
      {/* Admin Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            <span>لوحة تحكم وتوجيه المسؤول (مينوو AI)</span>
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            إدارة المستخدمين بالكامل، التعديل اليدوي للأرصدة، إنشاء رهانات مباشرة، وإدارة الأحداث.
          </p>
        </div>

        {/* Tab Navigation Triggers */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900">
          {[
            { id: 'users', label: 'المستخدمين والأرصدة', icon: Users },
            { id: 'create-bet', label: 'إنشاء رهان للمستخدم', icon: Target },
            { id: 'bets-list', label: 'سجل الرهانات', icon: Ticket },
            { id: 'cash-deposits', label: 'طلبات الشحن كاش', icon: Wallet },
            { id: 'cash-withdrawals', label: 'طلبات سحب الأرباح 💸', icon: ArrowUpRight },
            { id: 'events', label: 'إدارة الأحداث', icon: Calendar },
            { id: 'stats', label: 'إحداثيات المباريات', icon: Activity },
            { id: 'league-standings', label: 'صدارة وتأمين الدوريات 🛡️', icon: Trophy },
            { id: 'reports', label: 'التقارير المالية', icon: BarChart3 },
            { id: 'clear-data', label: 'تصفية البيانات التجريبية 🧹', icon: Eraser }
          ].map(tab => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  adminTab === tab.id 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-md shadow-red-500/5' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
                id={`admin-tab-trigger-${tab.id}`}
              >
                <IconComp className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. TAB: MANAGE USERS & MANUAL BALANCE EDITING */}
      {adminTab === 'users' && (
        <section className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-semibold">إجمالي المستخدمين</p>
                <p className="text-xl font-black text-white mt-1">{allUsers.length} مستخدم</p>
              </div>
              <Users className="h-8 w-8 text-blue-400/80 bg-blue-500/10 p-1.5 rounded-lg" />
            </div>

            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-semibold">إجمالي الأرصدة المتداولة</p>
                <p className="text-xl font-black text-amber-400 mt-1">
                  {allUsers.reduce((sum, u) => sum + u.balance, 0).toLocaleString()} 🪙
                </p>
              </div>
              <Coins className="h-8 w-8 text-amber-400/80 bg-amber-500/10 p-1.5 rounded-lg" />
            </div>

            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-semibold">حسابات الإدارة (أدمن)</p>
                <p className="text-xl font-black text-red-400 mt-1">
                  {allUsers.filter(u => u.isAdmin).length} حسابات
                </p>
              </div>
              <ShieldAlert className="h-8 w-8 text-red-400/80 bg-red-500/10 p-1.5 rounded-lg" />
            </div>
          </div>

          {/* User List Panel */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                <span>إدارة حسابات المستخدمين والتعديل اليدوي للرصيد</span>
              </h3>

              {/* Search User Input */}
              <div className="relative w-full sm:w-72">
                <Search className="h-4 w-4 absolute right-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="بحث عن اسم أو بريد مستخدم..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-medium">
                    <th className="py-3 px-4">المستخدم</th>
                    <th className="py-3 px-4">البريد الإلكتروني</th>
                    <th className="py-3 px-4 text-center">الرصيد الحالي</th>
                    <th className="py-3 px-4 text-center">التعديل اليدوي للرصيد</th>
                    <th className="py-3 px-4 text-center">الصلاحية</th>
                    <th className="py-3 px-4 text-center">عمليات سريعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                  {filteredUsers.map(u => {
                    const currentEditingVal = editingUserBalance[u.id] !== undefined ? editingUserBalance[u.id] : u.balance;
                    const isSaved = balanceSaveMsg[u.id];

                    return (
                      <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors">
                        {/* User info */}
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover border border-zinc-800" />
                          <div>
                            <div>{u.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">ID: {u.id}</div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-zinc-400 font-mono">{u.email}</td>

                        {/* Current Balance */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-sm font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            {u.balance.toLocaleString()} 🪙
                          </span>
                        </td>

                        {/* Manual Balance Edit Box */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={currentEditingVal}
                              onChange={(e) => setEditingUserBalance({ ...editingUserBalance, [u.id]: parseInt(e.target.value) || 0 })}
                              className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-center font-bold text-amber-300 focus:outline-none focus:border-emerald-500 text-xs"
                            />
                            <button
                              onClick={() => handleSaveManualBalance(u.id)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                              title="حفظ الرصيد الجديد"
                              id={`admin-save-balance-${u.id}`}
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>حفظ</span>
                            </button>

                            {/* Quick Add Buttons */}
                            <div className="flex gap-1">
                              <button
                                onClick={() => onUpdateUserBalance(u.id, u.balance + 100)}
                                className="bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 px-1.5 py-1 rounded text-[10px] font-bold"
                                title="إضافة +100 كوينز"
                              >
                                +100
                              </button>
                              <button
                                onClick={() => onUpdateUserBalance(u.id, u.balance + 1000)}
                                className="bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 px-1.5 py-1 rounded text-[10px] font-bold"
                                title="إضافة +1000 كوينز"
                              >
                                +1K
                              </button>
                            </div>

                            {isSaved && (
                              <span className="text-[10px] text-emerald-400 font-bold animate-pulse">تم الحفظ!</span>
                            )}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            u.isAdmin ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}>
                            {u.isAdmin ? 'أدمن مسيطر' : 'مستخدم عادي'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Create Bet on Behalf Button */}
                            <button
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setAdminTab('create-bet');
                              }}
                              className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] text-emerald-400 font-bold hover:bg-emerald-500 hover:text-zinc-950 transition-all flex items-center gap-1"
                              title="إنشاء رهان خاص بأسماء المستخدم"
                            >
                              <Target className="h-3.5 w-3.5" />
                              <span>إنشاء رهان</span>
                            </button>

                            {/* Toggle Role */}
                            <button
                              onClick={() => onToggleUserAdmin(u.id)}
                              className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-[11px] text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-all"
                              id={`admin-toggle-role-${u.id}`}
                            >
                              عكس الصلاحية
                            </button>

                            {/* Delete User */}
                            {u.id !== 'admin-1' && u.email !== 'fadysoso415@gmail.com' && (
                              <button
                                onClick={() => onDeleteUser(u.id)}
                                className="rounded-lg bg-red-500/10 border border-red-500/20 p-1.5 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                title="حذف حساب المستخدم نهائياً"
                                id={`admin-delete-user-${u.id}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 2. TAB: CREATE BET ("إنشاء وإدارة الرهانات العامة والمخصصة") */}
      {adminTab === 'create-bet' && (
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Form Card */}
          <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-6 shadow-2xl">
            <div className="border-b border-zinc-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-400" />
                  <span>إنشاء ونشر الرهانات العامة والتحديات</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  قم بنشر رهانات عامة معروضة لجميع زوار ومستخدمي الموقع، أو ثبت رهان مخصص لمستخدم محدد.
                </p>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setBetTargetMode('public')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                    betTargetMode === 'public'
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>رهان عام لجميع المستخدمين 🌐</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBetTargetMode('single')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                    betTargetMode === 'single'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>مستخدم محدد 👤</span>
                </button>
              </div>
            </div>

            {createBetSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>
                  {betTargetMode === 'public'
                    ? 'تم نشر الرهان العام بنجاح على الموقع لجميع المستخدمين!'
                    : 'تم إنشاء وتثبيت الرهان بنجاح للمستخدم وحفظ العملية في السجل!'}
                </span>
              </div>
            )}

            {createBetError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                <span>{createBetError}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmitCreateBet} className="space-y-5">
              {/* If Single User Mode -> Target User Selector */}
              {betTargetMode === 'single' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <span>اختر المستخدم المخصص (Target User):</span>
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                    id="admin-create-bet-user-select"
                  >
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — الرصيد: {u.balance.toLocaleString()} 🪙
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Public Bet Offer Title & Description */}
              {betTargetMode === 'public' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Flame className="h-4 w-4" />
                      <span>عنوان الرهان العام / التحدي:</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: تحدي الكلاسيكو: فوز ريال مدريد مضاعف x2.00"
                      value={pubTitleInput}
                      onChange={(e) => setPubTitleInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                      id="admin-public-bet-title-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">وصف قصير للرهان (اختياري):</label>
                    <input
                      type="text"
                      placeholder="مثال: رهان عام معروض لجميع الأعضاء أودز 2x عند الفوز"
                      value={pubDescInput}
                      onChange={(e) => setPubDescInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                      id="admin-public-bet-desc-input"
                    />
                  </div>
                </div>
              )}

              {/* Target Match */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  <span>اختر المباراة المُرتبطة بالرهان:</span>
                </label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  id="admin-create-bet-match-select"
                >
                  {allMatches.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.league}] {m.teamHome} ضد {m.teamAway} — (المضيف: {m.oddsHome} | التعادل: {m.oddsDraw} | الضيف: {m.oddsAway})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bet Outcome Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">خيار الرهان المحدد للمستخدمين:</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOutcome('home')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      selectedOutcome === 'home'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div>فوز المضيف</div>
                    <div className="text-sm font-black mt-1">{currentSelectedMatch?.teamHome}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">معامل: {currentSelectedMatch?.oddsHome}</div>
                  </button>

                  {currentSelectedMatch?.sport === 'football' ? (
                    <button
                      type="button"
                      onClick={() => setSelectedOutcome('draw')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        selectedOutcome === 'draw'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div>التعادل</div>
                      <div className="text-sm font-black mt-1">X</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">معامل: {currentSelectedMatch?.oddsDraw}</div>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl border border-zinc-900 bg-zinc-950 text-center opacity-40 text-xs text-zinc-600 font-bold flex flex-col justify-center">
                      التعادل غير متاح بهذه الرياضة
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedOutcome('away')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      selectedOutcome === 'away'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div>فوز الضيف</div>
                    <div className="text-sm font-black mt-1">{currentSelectedMatch?.teamAway}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">معامل: {currentSelectedMatch?.oddsAway}</div>
                  </button>
                </div>
              </div>

              {/* Amount & Odds Settings */}
              {betTargetMode === 'public' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-400">معامل الرهان العام / المضاعف (Odds Multiplier):</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      value={pubOddsInput}
                      onChange={(e) => setPubOddsInput(parseFloat(e.target.value) || 2.0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-black text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                      id="admin-public-bet-odds-input"
                    />
                    <div className="flex gap-1.5 shrink-0">
                      {[1.5, 2.0, 2.5, 3.0, 5.0].map(mult => (
                        <button
                          key={mult}
                          type="button"
                          onClick={() => setPubOddsInput(mult)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                            pubOddsInput === mult
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          x{mult.toFixed(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    * في الرهان العام، يقوم كل مستخدم بتحديد مبلغ الرهان الخاص به عند الاشتراك، ويحصل على أرباح هائلة بنسبة العائد أعلاه! (مثلاً x2.00 تعني ضعف المبلغ).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">مبلغ الرهان بالكوينز (Bet Amount):</label>
                    <input
                      type="number"
                      min="1"
                      value={betAmount}
                      onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-black text-amber-400 focus:outline-none focus:border-emerald-500"
                      id="admin-create-bet-amount"
                    />
                  </div>

                  {/* Odds Override */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">معامل الرهان / الأودز (Odds):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      placeholder={`تلقائي: ${autoOdds}`}
                      value={customOddsInput}
                      onChange={(e) => setCustomOddsInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                      id="admin-create-bet-odds"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full rounded-xl font-extrabold py-3.5 text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  betTargetMode === 'public'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-amber-500/10'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/10'
                }`}
                id="admin-submit-create-bet-btn"
              >
                {betTargetMode === 'public' ? (
                  <>
                    <Globe className="h-4 w-4" />
                    <span>نشر الرهان العام على الموقع لجميع المستخدمين 🚀</span>
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4" />
                    <span>تثبيت الرهان للمستخدم المخصص</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Public Bets Management Table */}
          <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400" />
                <span>الرهانات العامة المنشورة على الموقع ({publicBetOffers.length})</span>
              </h3>
              <span className="text-xs text-zinc-500">تحكم كامل بنتائج وتسوية الرهانات الجماعية</span>
            </div>

            {publicBetOffers.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                لا توجد رهانات عامة منشورة حالياً. استخدم النموذج أعلاه لنشر رهان عام جديد!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 font-bold border-b border-zinc-800">
                    <tr>
                      <th className="p-3">عنوان الرهان العام</th>
                      <th className="p-3">المباراة والرياضة</th>
                      <th className="p-3">الخيار والأودز</th>
                      <th className="p-3">المشتركين والكوينز</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3 text-center">إجراءات الإدارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {publicBetOffers.map(offer => (
                      <tr key={offer.id} className="hover:bg-zinc-900/40">
                        <td className="p-3">
                          <div className="font-bold text-white">{offer.title}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {new Date(offer.createdAt).toLocaleDateString('ar-EG')}
                          </div>
                        </td>

                        <td className="p-3 font-semibold text-zinc-300">
                          {offer.teamHome} ضد {offer.teamAway}
                        </td>

                        <td className="p-3">
                          <span className="font-bold text-amber-400 block">{offer.outcomeLabel}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">معامل: x{offer.odds}</span>
                        </td>

                        <td className="p-3 font-mono">
                          <div className="text-emerald-400 font-bold">{offer.participantsCount || 0} مشترك</div>
                          <div className="text-[10px] text-zinc-400">{offer.totalStakedCoins || 0} 🪙 مراهن عليها</div>
                        </td>

                        <td className="p-3">
                          {offer.status === 'active' && (
                            <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-500/30">
                              نشط ومتاح للجميع 🟢
                            </span>
                          )}
                          {offer.status === 'won' && (
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30">
                              تم اعتماد الفوز 🏆
                            </span>
                          )}
                          {offer.status === 'lost' && (
                            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-500/30">
                              خاسر ❌
                            </span>
                          )}
                          {offer.status === 'cancelled' && (
                            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-zinc-700">
                              ملغي (تم الإرجاع) 🔄
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {offer.status === 'active' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onResolvePublicBetOffer(offer.id, 'won')}
                                  className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-zinc-950 px-2 py-1 rounded-lg text-[10px] font-black transition-all"
                                  title="تحديد كفائز وإيداع أرباح جميع المشاركين تلقائياً"
                                >
                                  فوز 🏆
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onResolvePublicBetOffer(offer.id, 'lost')}
                                  className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white px-2 py-1 rounded-lg text-[10px] font-black transition-all"
                                  title="تحديد كخاسر"
                                >
                                  خسارة ❌
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onResolvePublicBetOffer(offer.id, 'cancelled')}
                                  className="bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 px-2 py-1 rounded-lg text-[10px] font-black transition-all"
                                  title="إلغاء وإرجاع الكوينز لجميع المشتركين"
                                >
                                  إلغاء 🔄
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeletePublicBetOffer(offer.id)}
                              className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white p-1 rounded-lg transition-all"
                              title="حذف الرهان العام"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* 3. TAB: USER BETS LIST & RESOLVING */}
      {adminTab === 'bets-list' && (
        <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ticket className="h-5 w-5 text-emerald-400" />
                <span>سجل رهانات المستخدمين وحالتها</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                تصفح رهانات الجميع، تحديد الفائزين، أو إلغاء واسترجاع الكوينز.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Filter by status */}
              <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
                {(['all', 'pending', 'won', 'lost'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setBetStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      betStatusFilter === st 
                        ? 'bg-emerald-500 text-zinc-950 shadow' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'الكل' : st === 'pending' ? 'معلق' : st === 'won' ? 'فائز' : 'خاسر'}
                  </button>
                ))}
              </div>

              {/* Search query */}
              <div className="relative w-full sm:w-60">
                <Search className="h-3.5 w-3.5 absolute right-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="بحث باسم الفريق أو المستخدم..."
                  value={betSearchQuery}
                  onChange={(e) => setBetSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Bets Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 font-medium">
                  <th className="py-3 px-4">المستخدم</th>
                  <th className="py-3 px-4">المباراة والخيار</th>
                  <th className="py-3 px-4 text-center">المبلغ والمعامل</th>
                  <th className="py-3 px-4 text-center">الربح المتوقع</th>
                  <th className="py-3 px-4 text-center">الحالة الحالية</th>
                  <th className="py-3 px-4 text-center">تحديث حالة الرهان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                {filteredBets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                      لا توجد رهانات تطابق البحث حالياً.
                    </td>
                  </tr>
                ) : (
                  filteredBets.map(b => {
                    const user = allUsers.find(u => u.id === b.userId);
                    const outcomeLabel = b.selectedOutcome === 'home' 
                      ? `فوز ${b.teamHome}` 
                      : b.selectedOutcome === 'away' 
                      ? `فوز ${b.teamAway}` 
                      : 'التعادل';

                    return (
                      <tr key={b.id} className="hover:bg-zinc-900/30 transition-colors">
                        {/* User */}
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div>{user?.name || 'مستخدم غير معروف'}</div>
                          <div className="text-[10px] text-zinc-500">{user?.email}</div>
                        </td>

                        {/* Match & Outcome */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-zinc-200">{b.teamHome} ضد {b.teamAway}</div>
                          <div className="text-[11px] text-emerald-400 font-semibold">{outcomeLabel}</div>
                        </td>

                        {/* Amount & Odds */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="font-black text-amber-400">{b.amount} 🪙</div>
                          <div className="text-[10px] text-zinc-500">معامل: {b.odds}</div>
                        </td>

                        {/* Payout */}
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                          {Math.round(b.amount * b.odds)} 🪙
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'won' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : b.status === 'lost' 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {b.status === 'won' ? '🏆 فائز' : b.status === 'lost' ? '❌ خاسر' : '⏳ قيد الانتظار'}
                          </span>
                        </td>

                        {/* Admin Action buttons */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {onUpdateBetStatus && (
                              <>
                                <button
                                  onClick={() => onUpdateBetStatus(b.id, 'won')}
                                  disabled={b.status === 'won'}
                                  className={`rounded px-2 py-1 text-[10px] font-bold transition-all ${
                                    b.status === 'won' 
                                      ? 'bg-zinc-900 text-zinc-600 border border-zinc-800' 
                                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950'
                                  }`}
                                  title="تحديد الرهان كفائز وإيداع الأرباح للمستخدم"
                                >
                                  فائز 🏆
                                </button>
                                <button
                                  onClick={() => onUpdateBetStatus(b.id, 'lost')}
                                  disabled={b.status === 'lost'}
                                  className={`rounded px-2 py-1 text-[10px] font-bold transition-all ${
                                    b.status === 'lost' 
                                      ? 'bg-zinc-900 text-zinc-600 border border-zinc-800' 
                                      : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                                  }`}
                                  title="تحديد الرهان كخاسر"
                                >
                                  خاسر ❌
                                </button>
                              </>
                            )}

                            {onDeleteBet && (
                              <button
                                onClick={() => onDeleteBet(b.id)}
                                className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[10px] text-amber-400 font-bold hover:bg-amber-500 hover:text-zinc-950 transition-all"
                                title="إلغاء الرهان واسترجاع الكوينز للمستخدم"
                              >
                                إلغاء واسرجاع 🔄
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 3.5. TAB: CASH WALLET DEPOSITS & NUMBER SETTINGS */}
      {adminTab === 'cash-deposits' && (
        <section className="space-y-6">
          
          {/* Cash Wallet Number Setting Card */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Phone className="h-5 w-5 text-amber-400" />
                  <span>تعديل رقم محفظة الكاش للتحويلات (أدمن)</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  الرقم الظاهر للمستخدمين في خانة شراء الكوينز عند تحويل فودافون كاش / اتصالات / أورنج / البنوك.
                </p>
              </div>

              {cashNumberSaveSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>تم حفظ وتحديث رقم المحفظة بنجاح!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveCashNumber} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Phone className="h-4 w-4 absolute right-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  value={editingCashNumber}
                  onChange={(e) => setEditingCashNumber(e.target.value)}
                  placeholder="أدخل رقم محفظة الكاش هنا... (مثال: 01012345678)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-9 pl-4 py-2.5 text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  required
                  id="admin-cash-number-input"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 text-xs"
                id="admin-save-cash-number-btn"
              >
                <Save className="h-4 w-4" />
                <span>حفظ رقم المحفظة 💾</span>
              </button>
            </form>
          </div>

          {/* Deposit Requests Section */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                  <span>طلبات شحن الكوينز وإيصالات التحويل</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  مراجعة صور الإيصالات المرفقة من المستخدمين والتأكيد لإضافة الكوينز لحساباتهم.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Status Filter */}
                <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setDepositStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        depositStatusFilter === st
                          ? 'bg-amber-500 text-zinc-950 shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st === 'all' ? 'الكل' : st === 'pending' ? 'قيد الانتظار ⏳' : st === 'approved' ? 'مقبول 🟢' : 'مرفوض 🔴'}
                    </button>
                  ))}
                </div>

                {/* Search query */}
                <div className="relative w-full sm:w-56">
                  <Search className="h-3.5 w-3.5 absolute right-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="بحث باسم، بريد، أو رقم محفظة..."
                    value={depositSearchQuery}
                    onChange={(e) => setDepositSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-medium">
                    <th className="py-3 px-4">المستخدم</th>
                    <th className="py-3 px-4 text-center">المبلغ والكوينز</th>
                    <th className="py-3 px-4 text-center">رقم المحول منه</th>
                    <th className="py-3 px-4 text-center">صورة الإيصال</th>
                    <th className="py-3 px-4 text-center">التاريخ والوقت</th>
                    <th className="py-3 px-4 text-center">الحالة</th>
                    <th className="py-3 px-4 text-center">الإجراءات والتحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                  {filteredDeposits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-zinc-500 text-xs">
                        لا توجد طلبات شحن تطابق الفلتر حالياً.
                      </td>
                    </tr>
                  ) : (
                    filteredDeposits.map(req => (
                      <tr key={req.id} className="hover:bg-zinc-900/30 transition-colors">
                        {/* User */}
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div>{req.userName}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{req.userEmail}</div>
                        </td>

                        {/* Amount & Coins */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="font-black text-amber-400">{req.amountEgp} ج.م</div>
                          <div className="text-[10px] text-emerald-400 font-bold">+{req.coinsRequested} 🪙 كوينز</div>
                        </td>

                        {/* Sender Phone */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-zinc-200">
                          {req.senderPhone}
                        </td>

                        {/* Receipt Image Thumbnail */}
                        <td className="py-3.5 px-4 text-center">
                          {req.receiptImage ? (
                            <button
                              onClick={() => setPreviewReceiptImage(req.receiptImage)}
                              className="group relative inline-block rounded-lg overflow-hidden border border-zinc-800 hover:border-amber-500 transition-colors"
                              title="انقر لمعاينة صورة الإيصال بالحجم الكامل"
                            >
                              <img src={req.receiptImage} alt="Receipt" className="h-10 w-12 object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="h-4 w-4 text-white" />
                              </div>
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-600">لا يوجد إيصال</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-center text-[10px] text-zinc-500">
                          {new Date(req.createdAt).toLocaleString('ar-EG')}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            req.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : req.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          }`}>
                            {req.status === 'approved' ? '🟢 مقبول وتم الإيداع' : req.status === 'rejected' ? '🔴 مرفوض' : '⏳ قيد المراجعة'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {req.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => onApproveDepositRequest(req.id)}
                                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all flex items-center gap-1"
                                  title="تأكيد الطلب وإيداع الكوينز للمستخدم فوراً"
                                  id={`approve-deposit-${req.id}`}
                                >
                                  <FileCheck className="h-3.5 w-3.5" />
                                  <span>موافقة وإيداع</span>
                                </button>

                                <button
                                  onClick={() => onRejectDepositRequest(req.id, rejectNoteInput[req.id])}
                                  className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all flex items-center gap-1"
                                  title="رفض الطلب"
                                  id={`reject-deposit-${req.id}`}
                                >
                                  <FileX className="h-3.5 w-3.5" />
                                  <span>رفض</span>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => onDeleteDepositRequest(req.id)}
                              className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                              title="حذف من السجل"
                              id={`delete-deposit-log-${req.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Receipt Image Full Preview Modal */}
          {previewReceiptImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" dir="rtl">
              <div className="relative max-w-2xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="h-4 w-4 text-amber-400" />
                    <span>معاينة صورة إيصال التحويل</span>
                  </h4>
                  <button
                    onClick={() => setPreviewReceiptImage(null)}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black rounded-xl p-2">
                  <img src={previewReceiptImage} alt="Receipt Full Preview" className="max-h-[70vh] object-contain rounded-lg" />
                </div>
              </div>
            </div>
          )}

        </section>
      )}

      {/* 3.6. TAB: CASH WITHDRAWAL REQUESTS */}
      {adminTab === 'cash-withdrawals' && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-5">
            
            {/* Header and filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                  <span>طلبات سحب الأرباح وتحويل الكاش</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  مراجعة طلبات السحب المقدمة من المستخدمين، التأكد من أرقام محافظ الاستلام، وتأكيد التحويل الكاش.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Status Filter */}
                <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setWithdrawStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        withdrawStatusFilter === st
                          ? 'bg-emerald-500 text-zinc-950 shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st === 'all' ? 'الكل' : st === 'pending' ? 'قيد الانتظار ⏳' : st === 'approved' ? 'مكتمل 🟢' : 'مرفوض 🔴'}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-56">
                  <Search className="h-3.5 w-3.5 absolute right-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="بحث باسم، بريد، أو رقم محفظة السحب..."
                    value={withdrawSearchQuery}
                    onChange={(e) => setWithdrawSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Withdrawal Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-medium">
                    <th className="py-3 px-4">المستخدم</th>
                    <th className="py-3 px-4 text-center">المبلغ والكوينز</th>
                    <th className="py-3 px-4 text-center">رقم محفظة الاستلام</th>
                    <th className="py-3 px-4 text-center">تاريخ الطلب</th>
                    <th className="py-3 px-4 text-center">الحالة</th>
                    <th className="py-3 px-4 text-center">إجراءات التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                  {withdrawalRequests.filter(req => {
                    const matchSearch = 
                      req.userName.toLowerCase().includes(withdrawSearchQuery.toLowerCase()) ||
                      req.userEmail.toLowerCase().includes(withdrawSearchQuery.toLowerCase()) ||
                      req.receiverPhone.includes(withdrawSearchQuery);
                    const matchStatus = withdrawStatusFilter === 'all' || req.status === withdrawStatusFilter;
                    return matchSearch && matchStatus;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-zinc-500 text-xs">
                        لا توجد طلبات سحب أرباح تطابق الفلتر حالياً.
                      </td>
                    </tr>
                  ) : (
                    withdrawalRequests.filter(req => {
                      const matchSearch = 
                        req.userName.toLowerCase().includes(withdrawSearchQuery.toLowerCase()) ||
                        req.userEmail.toLowerCase().includes(withdrawSearchQuery.toLowerCase()) ||
                        req.receiverPhone.includes(withdrawSearchQuery);
                      const matchStatus = withdrawStatusFilter === 'all' || req.status === withdrawStatusFilter;
                      return matchSearch && matchStatus;
                    }).map(req => (
                      <tr key={req.id} className="hover:bg-zinc-900/30 transition-colors">
                        {/* User */}
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div>{req.userName}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{req.userEmail}</div>
                        </td>

                        {/* Amount Coins & EGP */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="font-black text-amber-400 font-mono">{req.amountCoins} 🪙 كوينز</div>
                          <div className="text-[10px] text-emerald-400 font-bold">{req.amountEgp} ج.م كاش</div>
                        </td>

                        {/* Receiver Phone */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 font-mono font-black text-white text-xs">
                            {req.receiverPhone}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-center text-[10px] text-zinc-500">
                          {new Date(req.createdAt).toLocaleString('ar-EG')}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            req.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : req.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          }`}>
                            {req.status === 'approved' ? '🟢 تم التحويل بنجاح' : req.status === 'rejected' ? '🔴 مرفوض' : '⏳ قيد المراجعة'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {req.status === 'pending' && (
                              <>
                                {onApproveWithdrawalRequest && (
                                  <button
                                    onClick={() => onApproveWithdrawalRequest(req.id)}
                                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all flex items-center gap-1"
                                    title="تأكيد تحويل الكاش للمستخدم"
                                    id={`approve-withdraw-${req.id}`}
                                  >
                                    <FileCheck className="h-3.5 w-3.5" />
                                    <span>موافقة وتأكيد التحويل</span>
                                  </button>
                                )}

                                {onRejectWithdrawalRequest && (
                                  <button
                                    onClick={() => onRejectWithdrawalRequest(req.id, rejectNoteInput[req.id])}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all flex items-center gap-1"
                                    title="رفض السحب واسترجاع الكوينز لرصيد المستخدم"
                                    id={`reject-withdraw-${req.id}`}
                                  >
                                    <FileX className="h-3.5 w-3.5" />
                                    <span>رفض واسترجاع</span>
                                  </button>
                                )}
                              </>
                            )}

                            {onDeleteWithdrawalRequest && (
                              <button
                                onClick={() => onDeleteWithdrawalRequest(req.id)}
                                className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                                title="حذف من السجل"
                                id={`delete-withdraw-log-${req.id}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </section>
      )}

      {/* 4. TAB: MANAGE EVENTS & LIVE MATCHES */}
      {adminTab === 'events' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Match Event Form */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 lg:col-span-1 h-fit">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <PlusCircle className="h-4 w-4 text-emerald-400" />
              <span>إنشاء مبارة حدث جديد</span>
            </h3>

            {addMatchSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>تمت إضافة المباراة بنجاح للجدول العام!</span>
              </div>
            )}

            <form onSubmit={handleCreateMatch} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-medium">اسم الفريق المضيف (Home):</label>
                <input
                  type="text"
                  placeholder="مثال: برشلونة"
                  value={newHome}
                  onChange={(e) => setNewHome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  required
                  id="admin-new-home-team"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-medium">اسم الفريق الضيف (Away):</label>
                <input
                  type="text"
                  placeholder="مثال: ريال مدريد"
                  value={newAway}
                  onChange={(e) => setNewAway(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  required
                  id="admin-new-away-team"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-medium">نوع الرياضة:</label>
                <select
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  id="admin-new-sport"
                >
                  <option value="football">كرة قدم ⚽</option>
                  <option value="basketball">كرة سلة 🏀</option>
                  <option value="tennis">كرة مضرب (تنس) 🎾</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-medium">اسم البطولة / الدوري:</label>
                <input
                  type="text"
                  value={newLeague}
                  onChange={(e) => setNewLeague(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  id="admin-new-league"
                />
              </div>

              {/* Odds */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-zinc-500 block mb-1 text-[10px]">فوز المضيف:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newOddsHome}
                    onChange={(e) => setNewOddsHome(parseFloat(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-center text-emerald-400 font-bold focus:outline-none"
                    id="admin-new-odds-home"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1 text-[10px]">التعادل:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newOddsDraw}
                    onChange={(e) => setNewOddsDraw(parseFloat(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-center text-amber-400 font-bold focus:outline-none"
                    id="admin-new-odds-draw"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1 text-[10px]">فوز الضيف:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newOddsAway}
                    onChange={(e) => setNewOddsAway(parseFloat(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-center text-blue-400 font-bold focus:outline-none"
                    id="admin-new-odds-away"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-medium">التوقيت:</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  id="admin-new-time"
                />
              </div>

              {/* Custom Buttons Labels & Fixed Stake */}
              <div className="pt-2 border-t border-zinc-900 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 block">🎨 تخصيص أزرار الرهان والمبلغ الثابت (اختياري):</span>
                
                <div>
                  <label className="text-zinc-500 block mb-0.5 text-[10px]">اسم زر فوز المضيف (1):</label>
                  <input
                    type="text"
                    placeholder="افتراضي: فوز (الفريق 1)"
                    value={newCustomLabelHome}
                    onChange={(e) => setNewCustomLabelHome(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    id="admin-new-custom-home"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 block mb-0.5 text-[10px]">اسم زر التعادل (X):</label>
                  <input
                    type="text"
                    placeholder="افتراضي: تعادل"
                    value={newCustomLabelDraw}
                    onChange={(e) => setNewCustomLabelDraw(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    id="admin-new-custom-draw"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 block mb-0.5 text-[10px]">اسم زر خسارة / فوز الضيف (2):</label>
                  <input
                    type="text"
                    placeholder="افتراضي: خسارة / فوز (الفريق 2)"
                    value={newCustomLabelAway}
                    onChange={(e) => setNewCustomLabelAway(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    id="admin-new-custom-away"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 block mb-0.5 text-[10px]">قيمة رهان ثابتة (كوينز):</label>
                  <input
                    type="number"
                    placeholder="اتركه فارغاً لاختيار حر أو أدخل مثلاً 500"
                    value={newFixedStakeAmount}
                    onChange={(e) => setNewFixedStakeAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                    id="admin-new-fixed-stake"
                  />
                </div>

                {/* Featured Match Toggle & Tag */}
                <div className="pt-2 border-t border-zinc-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="admin-new-is-featured"
                      checked={newIsFeatured}
                      onChange={(e) => setNewIsFeatured(e.target.checked)}
                      className="h-4 w-4 rounded bg-zinc-900 border-zinc-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="admin-new-is-featured" className="text-amber-400 font-bold text-xs cursor-pointer flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-amber-400" />
                      <span>إبراز كـ "مباراة متميزة" في أعلى الصفحة 🌟</span>
                    </label>
                  </div>

                  {newIsFeatured && (
                    <div className="space-y-1.5 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                      <label className="text-[10px] text-zinc-300 font-bold block">وسم المباراة المتميزة:</label>
                      <input
                        type="text"
                        value={newFeaturedTag}
                        onChange={(e) => setNewFeaturedTag(e.target.value)}
                        placeholder="مثال: 🔥 الكلاسيكو الأرض"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                      />
                      <div className="flex flex-wrap gap-1 pt-1">
                        {['🔥 الكلاسيكو', '👑 قمة الأسبوع', '🏆 المباراة المرتقبة', '⚔️ ديربي العاصمة', '🌟 مباراة الموسم'].map(preset => (
                          <button
                            type="button"
                            key={preset}
                            onClick={() => setNewFeaturedTag(preset)}
                            className="text-[9px] bg-zinc-900 hover:bg-amber-500 hover:text-black text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 font-bold transition-all"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 text-zinc-950 font-bold py-2.5 text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
                id="admin-submit-match-btn"
              >
                إنشاء المباراة وتعميمها 🚀
              </button>
            </form>
          </div>

          {/* Customization Editor for Existing Matches */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 lg:col-span-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Edit3 className="h-4 w-4 text-emerald-400" />
              <span>تخصيص أسماء أزرار الرهانات وقيمة الرهان الثابتة للمباريات</span>
            </h3>

            {customSaveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>تم حفظ تخصيصات أزرار الرهانات وقيمة الرهان الثابتة بنجاح!</span>
              </div>
            )}

            <form onSubmit={handleUpdateCustomizationsSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-medium">اختر المباراة لتعديل أزرارها وقيمة رهانها:</label>
                <select
                  value={selectedMatchForCustom}
                  onChange={(e) => setSelectedMatchForCustom(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  id="admin-custom-match-select"
                >
                  {allMatches.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.league}] {m.teamHome} ضد {m.teamAway} {m.fixedStakeAmount ? `(رهان ثابت: ${m.fixedStakeAmount} 🪙)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900">
                <div>
                  <label className="text-zinc-400 block mb-1 font-bold">تخصيص اسم زر فوز (المضيف 1):</label>
                  <input
                    type="text"
                    placeholder={`فوز (${allMatches.find(m => m.id === selectedMatchForCustom)?.teamHome || 'المضيف'})`}
                    value={editCustomLabelHome}
                    onChange={(e) => setEditCustomLabelHome(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500"
                    id="admin-edit-custom-home"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-bold">تخصيص اسم زر التعادل (X):</label>
                  <input
                    type="text"
                    placeholder="تعادل"
                    value={editCustomLabelDraw}
                    onChange={(e) => setEditCustomLabelDraw(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500"
                    id="admin-edit-custom-draw"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-bold">تخصيص اسم زر خسارة / فوز (الضيف 2):</label>
                  <input
                    type="text"
                    placeholder={`خسارة (${allMatches.find(m => m.id === selectedMatchForCustom)?.teamAway || 'الضيف'})`}
                    value={editCustomLabelAway}
                    onChange={(e) => setEditCustomLabelAway(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500"
                    id="admin-edit-custom-away"
                  />
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl space-y-1">
                <label className="text-amber-400 block font-bold">تخصيص قيمة رهان ثابتة (مطلوبة إجبارياً على هذا اللقاء):</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="اتركه فارغاً لاختيار حر، أو أدخل مثلاً 1000"
                    value={editFixedStakeAmount}
                    onChange={(e) => setEditFixedStakeAmount(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                    id="admin-edit-fixed-stake"
                  />
                  {editFixedStakeAmount && parseInt(editFixedStakeAmount) > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditFixedStakeAmount('')}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
                    >
                      إلغاء القيمة الثابتة
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400">
                  عند تحديد مبلغ رهان ثابت، لن يتمكن اللاعب من اختيار مبلغ آخر عند الرهان على هذه المباراة.
                </p>
              </div>

              {/* Featured Match Settings & Badge Tag */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="admin-edit-is-featured"
                    checked={editIsFeatured}
                    onChange={(e) => setEditIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded bg-zinc-950 border-zinc-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="admin-edit-is-featured" className="text-amber-300 font-bold text-xs cursor-pointer flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-400" />
                    <span>تمييز وإظهار هذه المباراة في قسم "المباريات المتميزة" 🔥</span>
                  </label>
                </div>

                {editIsFeatured && (
                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] text-zinc-300 font-bold block">وسم التمييز الخاص بالمباراة (مثال: 🔥 الكلاسيكو):</label>
                    <input
                      type="text"
                      placeholder="أدخل وسم التمييز أو اختر وسم جاهز بالأسفل..."
                      value={editFeaturedTag}
                      onChange={(e) => setEditFeaturedTag(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['🔥 الكلاسيكو', '👑 قمة الأسبوع', '🏆 المباراة المرتقبة', '⚔️ ديربي العاصمة', '🌟 مباراة الموسم', '💥 نهائي الكأس'].map(preset => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setEditFeaturedTag(preset)}
                          className="text-[10px] bg-zinc-900 hover:bg-amber-500 hover:text-black text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition-all"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 text-zinc-950 font-bold py-3 text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
                id="admin-submit-customizations-btn"
              >
                حفظ التخصيصات للمباراة 💾
              </button>
            </form>
          </div>

          {/* Resolve Match Score & Status Form */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 lg:col-span-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Activity className="h-4 w-4 text-amber-400" />
              <span>تحديث وحسم أهداف المباراة والتسوية</span>
            </h3>

            {scoreSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>تم تحديث النتيجة وحسم الرهانات التلقائية!</span>
              </div>
            )}

            <form onSubmit={handleResolveScoreSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-medium">اختر المباراة المراد حسمها:</label>
                <select
                  value={selectedMatchForScore}
                  onChange={(e) => setSelectedMatchForScore(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                  id="admin-resolve-match-select"
                >
                  {allMatches.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.league}] {m.teamHome} ({m.scoreHome}) ضد {m.teamAway} ({m.scoreAway}) — الحالة: {m.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                <div>
                  <label className="text-zinc-300 block mb-1 font-bold">أهداف الفريق المضيف:</label>
                  <input
                    type="number"
                    min="0"
                    value={scoreHome}
                    onChange={(e) => setScoreHome(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-center font-black text-lg text-emerald-400 focus:outline-none"
                    id="admin-resolve-score-home"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1 font-bold">أهداف الفريق الضيف:</label>
                  <input
                    type="number"
                    min="0"
                    value={scoreAway}
                    onChange={(e) => setScoreAway(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-center font-black text-lg text-blue-400 focus:outline-none"
                    id="admin-resolve-score-away"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-medium">حالة المباراة الجارية:</label>
                <select
                  value={resolveStatus}
                  onChange={(e) => setResolveStatus(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                  id="admin-resolve-status-select"
                >
                  <option value="scheduled">مجدولة لم تبدأ (Scheduled)</option>
                  <option value="live">جارية الآن بث مباشر (Live)</option>
                  <option value="finished">منتهية وتسوية أرباح الرهانات (Finished)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-500 text-zinc-950 font-bold py-3 text-xs hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"
                id="admin-submit-resolve-score"
              >
                تحديث أهداف المباراة وحسم أرباح الرهانات 🏆
              </button>
            </form>
          </div>
        </section>
      )}

      {/* 5. TAB: STATS MANAGEMENT */}
      {adminTab === 'stats' && (
        <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>محرر إحصائيات المباراة المباشرة (Possession & Shots)</span>
          </h3>

          {statsSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>تم تحديث إحصائيات المباراة المباشرة بنجاح!</span>
            </div>
          )}

          <form onSubmit={handleUpdateStatsSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1 font-medium">اختر المباراة:</label>
              <select
                value={selectedMatchForStats}
                onChange={(e) => setSelectedMatchForStats(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                id="admin-stats-match-select"
              >
                {allMatches.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.teamHome} ضد {m.teamAway}
                  </option>
                ))}
              </select>
            </div>

            {/* Possession slider */}
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-900 space-y-2">
              <div className="flex justify-between font-bold text-zinc-300">
                <span>نسبة الاستحواذ المضيف: {statsPossessionHome}%</span>
                <span>الضيف: {100 - statsPossessionHome}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={statsPossessionHome}
                onChange={(e) => setStatsPossessionHome(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
                id="admin-stats-possession"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 block mb-1 font-medium">تسديدات المضيف:</label>
                <input
                  type="number"
                  value={statsShotsHome}
                  onChange={(e) => setStatsShotsHome(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-center text-white font-bold"
                  id="admin-stats-shots-home"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1 font-medium">تسديدات الضيف:</label>
                <input
                  type="number"
                  value={statsShotsAway}
                  onChange={(e) => setStatsShotsAway(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-center text-white font-bold"
                  id="admin-stats-shots-away"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 text-zinc-950 font-bold py-2.5 text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
              id="admin-submit-stats-btn"
            >
              حفظ الإحصائيات الفورية ⚡
            </button>
          </form>
        </section>
      )}

      {/* 6. TAB: REPORTS & ANALYTICS */}
      {adminTab === 'reports' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-zinc-500 font-medium">حجم الرهانات الكلي (Volume)</span>
              <div className="text-2xl font-black text-white">{totalVolume.toLocaleString()} 🪙</div>
              <p className="text-[10px] text-zinc-500">مجموع الكوينز المراهن بها بالكامل</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-zinc-500 font-medium">الأرباح الموزعة على الفائزين</span>
              <div className="text-2xl font-black text-emerald-400">{totalPayout.toLocaleString()} 🪙</div>
              <p className="text-[10px] text-zinc-500">عائدات الرهانات الرابحة</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-zinc-500 font-medium">صافي هامش بيت المنصة</span>
              <div className="text-2xl font-black text-amber-400">
                {(totalVolume - totalPayout).toLocaleString()} 🪙
              </div>
              <p className="text-[10px] text-zinc-500">الفارق المتبقي لبيت المنصة</p>
            </div>
          </div>
        </section>
      )}

      {/* 7. TAB: LEAGUE STANDINGS & SECURITY CONTROL */}
      {adminTab === 'league-standings' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span>إدارة صدارة وترتيب الدوريات وتحكم الأمن</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                التحكم الكامل في ترتيب الأندية، نقاط الفرق، وتأمين حماية المتصدر بختم الأمن الميداني الرسمي 🛡️
              </p>
            </div>
          </div>

          {/* Standings List & Controls */}
          <div className="space-y-4">
            {leagueStandings.length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-8 text-center text-xs text-zinc-500">
                لا توجد بيانات ترتيب حالية. يتم تحميل البيانات الافتراضية تلقائياً.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-900 bg-zinc-950">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 bg-zinc-900/40 text-[11px]">
                      <th className="py-3 px-3 text-center">الترتيب</th>
                      <th className="py-3 px-4">الفريق</th>
                      <th className="py-3 px-3 text-center">الدوري</th>
                      <th className="py-3 px-3 text-center">النقاط</th>
                      <th className="py-3 px-3 text-center">لعب</th>
                      <th className="py-3 px-3 text-center">فوز</th>
                      <th className="py-3 px-3 text-center">تعادل</th>
                      <th className="py-3 px-3 text-center">خسارة</th>
                      <th className="py-3 px-3 text-center">تأمين الصدارة 🛡️</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {leagueStandings.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-3 text-center font-bold">
                          <input 
                            type="number" 
                            value={item.rank}
                            onChange={(e) => {
                              const updated = leagueStandings.map(s => s.id === item.id ? { ...s, rank: Number(e.target.value) } : s);
                              if (onUpdateLeagueStandings) onUpdateLeagueStandings(updated);
                            }}
                            className="w-12 bg-zinc-900 border border-zinc-800 rounded text-center text-xs text-white py-1 font-mono"
                          />
                        </td>

                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <span className="text-base">{item.logo}</span>
                          <span>{item.teamName}</span>
                        </td>

                        <td className="py-3 px-3 text-center text-amber-300 font-medium">{item.league}</td>

                        <td className="py-3 px-3 text-center font-black text-amber-400">
                          <input 
                            type="number" 
                            value={item.points}
                            onChange={(e) => {
                              const updated = leagueStandings.map(s => s.id === item.id ? { ...s, points: Number(e.target.value) } : s);
                              if (onUpdateLeagueStandings) onUpdateLeagueStandings(updated);
                            }}
                            className="w-16 bg-zinc-900 border border-amber-500/30 rounded text-center text-xs text-amber-400 font-bold py-1 font-mono"
                          />
                        </td>

                        <td className="py-3 px-3 text-center text-zinc-300">
                          <input 
                            type="number" 
                            value={item.played}
                            onChange={(e) => {
                              const updated = leagueStandings.map(s => s.id === item.id ? { ...s, played: Number(e.target.value) } : s);
                              if (onUpdateLeagueStandings) onUpdateLeagueStandings(updated);
                            }}
                            className="w-12 bg-zinc-900 border border-zinc-800 rounded text-center text-xs text-zinc-300 py-1 font-mono"
                          />
                        </td>

                        <td className="py-3 px-3 text-center text-emerald-400">
                          <input 
                            type="number" 
                            value={item.won}
                            onChange={(e) => {
                              const updated = leagueStandings.map(s => s.id === item.id ? { ...s, won: Number(e.target.value) } : s);
                              if (onUpdateLeagueStandings) onUpdateLeagueStandings(updated);
                            }}
                            className="w-12 bg-zinc-900 border border-emerald-500/30 rounded text-center text-xs text-emerald-400 py-1 font-mono font-bold"
                          />
                        </td>

                        <td className="py-3 px-3 text-center text-amber-400">
                          <input 
                            type="number" 
                            value={item.drawn}
                            onChange={(e) => {
                              const updated = leagueStandings.map(s => s.id === item.id ? { ...s, drawn: Number(e.target.value) } : s);
                              if (onUpdateLeagueStandings) onUpdateLeagueStandings(updated);
                            }}
                            className="w-12 bg-zinc-900 border border-zinc-800 rounded text-center text-xs text-amber-400 py-1 font-mono"
                          />
                        </td>

                        <td className="py-3 px-3 text-center text-red-400">
                          <input 
                            type="number" 
                            value={item.lost}
                            onChange={(e) => {
                              const updated = leagueStandings.map(s => s.id === item.id ? { ...s, lost: Number(e.target.value) } : s);
                              if (onUpdateLeagueStandings) onUpdateLeagueStandings(updated);
                            }}
                            className="w-12 bg-zinc-900 border border-zinc-800 rounded text-center text-xs text-red-400 py-1 font-mono"
                          />
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              const updated = leagueStandings.map(s => s.id === item.id ? { 
                                ...s, 
                                isSecuredLeader: !s.isSecuredLeader,
                                securityNote: !s.isSecuredLeader ? 'صدارة مؤمنة بختم حماية الإدارة والأمن الميداني 🛡️' : undefined
                              } : s);
                              if (onUpdateLeagueStandings) onUpdateLeagueStandings(updated);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 mx-auto ${
                              item.isSecuredLeader
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/10'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>{item.isSecuredLeader ? 'مؤمن رسمياً 🛡️' : 'تأمين الصدارة'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. TAB: CLEAR & RESET DEMO DATA */}
      {adminTab === 'clear-data' && (
        <section className="bg-zinc-950 border border-red-500/20 p-8 rounded-3xl space-y-6 max-w-2xl mx-auto shadow-2xl">
          <div className="flex items-center gap-3 text-red-500 border-b border-zinc-900 pb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
              <Eraser className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">تصفية ومسح جميع البيانات التجريبية للمنصة</h3>
              <p className="text-xs text-zinc-500 mt-0.5">تنظيف سجل الرهانات المؤقتة، والطلبات التجريبية لتجهيز المنصة بالكامل</p>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-xs text-zinc-300 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>إجراء إداري هام:</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              عند الضغط على هذا الخيار، سيتم حذف جميع الرهانات الاختبارية المفتوحة والسابقة، وتفريغ قائمة طلبات الشحن والسحب التجريبية، وإعادة تعيين أرصدة الاختبار للحالة النظيفة.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm('هل أنت أخيرًا متأكد من تصفية ومسح جميع الرهانات والطلبات التجريبية للمنصة؟')) {
                  if (onClearDemoData) {
                    onClearDemoData();
                  }
                }
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-3.5 px-6 rounded-xl text-xs transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 active:scale-95"
              id="admin-clear-demo-data-btn"
            >
              <Eraser className="h-4 w-4" />
              <span>مسح وتصفية جميع البيانات التجريبية الآن 🧹</span>
            </button>
          </div>
        </section>
      )}

    </div>
  );
}
