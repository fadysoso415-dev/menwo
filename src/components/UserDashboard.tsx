import React, { useState } from 'react';
import { User, Bet, Notification, DepositRequest, WithdrawalRequest } from '../types';
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
  ArrowUpRight
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  onUpdateProfile: (updatedUser: User) => void;
  bets: Bet[];
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onDeposit: (amount: number) => void;
  onClaimDailyReward: () => void;
  onOpenCashDepositModal?: () => void;
  depositRequests?: DepositRequest[];
  onOpenWithdrawModal?: () => void;
  withdrawalRequests?: WithdrawalRequest[];
}

export default function UserDashboard({
  currentUser,
  onUpdateProfile,
  bets,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onDeposit,
  onClaimDailyReward,
  onOpenCashDepositModal,
  depositRequests = [],
  onOpenWithdrawModal,
  withdrawalRequests = []
}: UserDashboardProps) {

  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [betFilter, setBetFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highestAmount' | 'highestPayout' | 'highestOdds'>('newest');
  const [depositAmount, setDepositAmount] = useState<number>(500);

  // User Statistics calculations
  const userBets = bets.filter(b => b.userId === currentUser.id);
  const totalBetsPlaced = userBets.length;
  const wonBets = userBets.filter(b => b.status === 'won');
  const winRate = totalBetsPlaced > 0 ? Math.round((wonBets.length / totalBetsPlaced) * 100) : 0;
  const totalPayout = userBets.reduce((acc, b) => acc + (b.status === 'won' ? b.payout : 0), 0);
  const totalInvested = userBets.reduce((acc, b) => acc + b.amount, 0);
  const netProfit = totalPayout - totalInvested;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      name: profileName,
      email: profileEmail,
    });
    setShowEditSuccess(true);
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
    <div className="space-y-8 py-6" dir="rtl">
      
      {/* 1. Header & Profile customization */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card & Settings */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <UserIcon className="h-4.5 w-4.5 text-emerald-400" />
              <span>الملف الشخصي والبيانات</span>
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
                />
              </div>

              {showEditSuccess && (
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  <span>تم حفظ البيانات الشخصية بنجاح!</span>
                </p>
              )}

              <button 
                type="submit" 
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 py-2 hover:bg-zinc-800 hover:text-white transition-colors"
                id="save-profile-btn"
              >
                تحديث معلومات الحساب
              </button>
            </form>
          </div>
        </div>

        {/* Balance controls & Virtual Recharge */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Coins className="h-4.5 w-4.5 text-amber-400" />
              <span>إدارة المحفظة والرصيد الافتراضي</span>
            </h3>

            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-900 text-center space-y-1.5">
              <span className="text-xs text-zinc-400 font-medium">رصيدك الافتراضي المتاح</span>
              <div className="text-3xl font-black text-amber-400 tracking-tight">
                {currentUser.balance.toLocaleString()} <span className="text-lg">🪙 كوينز</span>
              </div>
              <div className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full">
                سعر الشحن والسحب: 1 كوين = 1 جنيه مصري 🇪🇬
              </div>
            </div>

            {/* Daily claim (10 coins up to 7 days limit) */}
            <div className="space-y-2.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium flex items-center gap-1">
                  <span>مكافأة الحضور اليومي:</span>
                  <span className="text-emerald-400 font-bold">+10 🪙</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  (currentUser.dailyClaimsCount || 0) >= 7 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {currentUser.dailyClaimsCount || 0} / 7 أيام
                </span>
              </div>

              {/* 7 Days Progress Tracker */}
              <div className="flex justify-between items-center gap-1 py-1">
                {[1, 2, 3, 4, 5, 6, 7].map((dayNumber) => {
                  const claims = currentUser.dailyClaimsCount || 0;
                  const isClaimed = dayNumber <= claims;
                  const isCurrent = dayNumber === claims + 1 && claims < 7;

                  return (
                    <div 
                      key={dayNumber}
                      className={`flex-1 flex flex-col items-center justify-center py-1 rounded border text-[9px] font-mono font-bold transition-all ${
                        isClaimed
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          : isCurrent
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 animate-pulse'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                      }`}
                      title={`اليوم ${dayNumber}: ${isClaimed ? 'تمت المطالبة' : isCurrent ? 'جاهز للمطالبة' : 'مغلق'}`}
                    >
                      <span>يوم {dayNumber}</span>
                      <span className="text-[10px]">
                        {isClaimed ? '✓' : '+10'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={onClaimDailyReward}
                disabled={(currentUser.dailyClaimsCount || 0) >= 7}
                className={`w-full rounded-xl text-xs font-bold py-2.5 transition-all shadow-lg flex items-center justify-center gap-1.5 ${
                  (currentUser.dailyClaimsCount || 0) >= 7
                    ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed shadow-none'
                    : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-emerald-500/10 cursor-pointer'
                }`}
                id="claim-daily-btn"
              >
                <Award className="h-4 w-4" />
                <span>
                  {(currentUser.dailyClaimsCount || 0) >= 7
                    ? 'اكتملت المكافأة الترحيبية (7 / 7 أيام)'
                    : `المطالبة بمكافأة اليوم (${(currentUser.dailyClaimsCount || 0) + 1} من 7) +10 🪙`}
                </span>
              </button>
            </div>
          </div>

          {/* Cash Wallet Purchase & Withdrawal Controls */}
          <div className="pt-4 border-t border-zinc-900 mt-4 space-y-3">
            
            {/* Cash Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Cash Deposit Button */}
              {onOpenCashDepositModal && (
                <button
                  type="button"
                  onClick={onOpenCashDepositModal}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black py-3 px-3 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
                  id="open-cash-deposit-modal-btn"
                >
                  <Wallet className="h-4 w-4 shrink-0" />
                  <span>شراء كوينز كاش 📲</span>
                </button>
              )}

              {/* Cash Withdrawal Button */}
              {onOpenWithdrawModal && (
                <button
                  type="button"
                  onClick={onOpenWithdrawModal}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black py-3 px-3 rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
                  id="open-withdraw-modal-btn"
                >
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                  <span>سحب الأرباح كاش 💸</span>
                </button>
              )}
            </div>

            {/* Pending Deposit Status Notice */}
            {depositRequests.filter(r => r.userId === currentUser.id && r.status === 'pending').length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-2.5 rounded-lg text-[11px] font-bold flex items-center justify-between">
                <span>⏳ لديك طلب شحن قيد المراجعة والإيداع من قبل الإدارة</span>
                <button
                  onClick={onOpenCashDepositModal}
                  className="underline text-amber-400 hover:text-white"
                >
                  متابعة
                </button>
              </div>
            )}

            {/* Pending Withdrawal Status Notice */}
            {withdrawalRequests.filter(r => r.userId === currentUser.id && r.status === 'pending').length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-2.5 rounded-lg text-[11px] font-bold flex items-center justify-between">
                <span>⏳ لديك طلب سحب أرباح قيد المراجعة والتحويل من قبل الإدارة</span>
                <button
                  onClick={onOpenWithdrawModal}
                  className="underline text-emerald-400 hover:text-white"
                >
                  التفاصيل
                </button>
              </div>
            )}


          </div>
        </div>


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
              كل الرهانات تصفى فورياً عند محاكاة اللعب. تذكر دائماً أن هذا اللعب افتراضي وخالٍ تماماً من القمار الحقيقي.
            </span>
          </div>
        </div>

      </section>

      {/* 2. Previous Bets Log (الرهانات السابقة) */}
      <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-emerald-400" />
              <span>سجل الرهانات والمحاكاة السابقة</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">تتبع نتائج جميع توقعاتك، فلترها حسب النتيجة، وابحث بأسماء الفرق</p>
          </div>

          {/* Quick Metrics Bar for Active Filter */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-zinc-400">
            <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 flex items-center gap-1">
              <Filter className="h-3 w-3 text-emerald-400" />
              <span>العدد: <strong className="text-white">{filteredBets.length}</strong></span>
            </span>
            <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
              استثمار: <strong className="text-amber-400">{filteredTotalInvested.toLocaleString()} 🪙</strong>
            </span>
            <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
              مسترجع: <strong className="text-emerald-400">{filteredTotalPayout.toLocaleString()} 🪙</strong>
            </span>
          </div>
        </div>

        {/* Filter and Search Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
          
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="h-4 w-4 text-zinc-500 absolute right-3 top-2.5" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الفريق أو النتيجة أو التوقع..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pr-9 pl-8 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              id="search-bets-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2.5 text-zinc-500 hover:text-white"
                title="مسح البحث"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="md:col-span-4 flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 overflow-x-auto">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'pending', label: 'قيد الانتظار' },
              { id: 'won', label: 'فائز 🟢' },
              { id: 'lost', label: 'خاسر 🔴' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setBetFilter(tab.id as any)}
                className={`flex-1 min-w-[65px] px-2 py-1 rounded text-[11px] font-semibold transition-all text-center whitespace-nowrap ${
                  betFilter === tab.id 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
                id={`bet-filter-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown & Reset */}
          <div className="md:col-span-3 flex items-center gap-2">
            <div className="relative flex-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500 absolute right-2.5 top-2.5 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pr-8 pl-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                id="sort-bets-select"
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
                className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors flex items-center gap-1 text-xs"
                title="إعادة ضبط الفلاتر"
                id="reset-bets-filters-btn"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Bets list/table */}
        {filteredBets.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-zinc-900">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-900/60 border-b border-zinc-900 text-zinc-400 font-medium">
                  <th className="py-3 px-4">تفاصيل المباراة</th>
                  <th className="py-3 px-4">الرهان المختار</th>
                  <th className="py-3 px-4 text-center">المبلغ المستثمر</th>
                  <th className="py-3 px-4 text-center">الاحتمالات (Odds)</th>
                  <th className="py-3 px-4 text-center">الربح المتوقع / المحقق</th>
                  <th className="py-3 px-4 text-center">النتيجة الفعلية</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                {filteredBets.map(bet => {
                  return (
                    <tr key={bet.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {bet.teamHome} <span className="text-zinc-600 px-1">×</span> {bet.teamAway}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-semibold">
                          {bet.selectedOutcome === 'home' ? `فوز ${bet.teamHome}` : bet.selectedOutcome === 'away' ? `فوز ${bet.teamAway}` : 'التعادل'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-zinc-300">
                        {bet.amount.toLocaleString()} 🪙
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-zinc-400">
                        {bet.odds.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-amber-400">
                        {bet.status === 'won' ? `${bet.payout.toLocaleString()} 🪙` : bet.status === 'pending' ? `${Math.round(bet.amount * bet.odds).toLocaleString()} 🪙` : '0 🪙'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-zinc-200">
                        {bet.matchScore || '-- : --'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          bet.status === 'won' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : bet.status === 'lost' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                        }`}>
                          {bet.status === 'won' ? 'فائز 🟢' : bet.status === 'lost' ? 'خاسر 🔴' : 'قيد الانتظار ⏳'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-900/20 rounded-xl border border-zinc-900 text-zinc-500 text-sm space-y-2">
            <Filter className="h-8 w-8 text-zinc-700 mx-auto" />
            <p className="text-zinc-400 font-semibold">لا توجد رهانات سابقة مطابقة للتصفية أو البحث الحالي.</p>
            {isFiltersActive && (
              <button
                onClick={() => {
                  setBetFilter('all');
                  setSearchQuery('');
                  setSortBy('newest');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline mt-2 font-bold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>إلغاء البحث وإظهار كافة الرهانات</span>
              </button>
            )}
          </div>
        )}
      </section>

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
            {notifications.map(notif => (
              <div 
                key={notif.id}
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

    </div>
  );
}
