import React, { useState } from 'react';
import { User, Match, Bet, DepositRequest, PublicBetOffer, WithdrawalRequest, LeagueStandingItem, SportCategory, GuideCategory, GuideStep } from '../types';
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
  AlertTriangle,
  BookOpen,
  Plus,
  HelpCircle,
  Info,
  Sparkles,
  Lock,
  Unlock,
  Sliders,
  PauseCircle,
  PlayCircle,
  EyeOff,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Gamepad2
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
  onUpdateMatchScore: (
    matchId: string, 
    scoreHome: number, 
    scoreAway: number, 
    status: 'scheduled' | 'live' | 'finished',
    date?: string,
    time?: string,
    minutes?: number
  ) => void;
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
    featuredTag?: string,
    oddsHome?: number,
    oddsDraw?: number,
    oddsAway?: number,
    isFeaturedBet?: boolean,
    featuredBetMultiplier?: number,
    featuredBetLabel?: string,
    matchImage?: string,
    adTitle?: string,
    adDescription?: string,
    adBadge?: string,
    isAdFeatured?: boolean,
    isBettingClosed?: boolean,
    bettingStatus?: 'open' | 'closed' | 'suspended',
    bettingNote?: string
  ) => void;
  onUpdateLeagueStandings?: (standings: LeagueStandingItem[]) => void;
  onClearDemoData?: () => void;
  sportsCategories?: SportCategory[];
  onAddSportCategory?: (category: SportCategory) => void;
  onUpdateSportCategory?: (catId: string, updatedFields: Partial<SportCategory>) => void;
  onDeleteSportCategory?: (catId: string) => void;
  guideCategories?: GuideCategory[];
  onUpdateGuideCategories?: (categories: GuideCategory[]) => void;
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
  onClearDemoData,
  sportsCategories = [],
  onAddSportCategory,
  onUpdateSportCategory,
  onDeleteSportCategory,
  guideCategories = [],
  onUpdateGuideCategories
}: AdminPanelProps) {
  const { t, dir } = useLanguage();
  const [adminTab, setAdminTab] = useState<'users' | 'match-bets-management' | 'create-bet' | 'bets-list' | 'cash-deposits' | 'cash-withdrawals' | 'events' | 'sports-categories' | 'stats' | 'reports' | 'league-standings' | 'guide-management' | 'clear-data'>('users');

  // Dedicated Match Bets Management States
  const [matchBetsSearchQuery, setMatchBetsSearchQuery] = useState('');
  const [matchBetsStatusFilter, setMatchBetsStatusFilter] = useState<'all' | 'open' | 'closed' | 'suspended' | 'live' | 'finished'>('all');
  const [expandedMatchBetsId, setExpandedMatchBetsId] = useState<string | null>(null);
  const [editingMatchOdds, setEditingMatchOdds] = useState<{ [matchId: string]: { home: number; draw: number; away: number } }>({});
  const [editingMatchBetNote, setEditingMatchBetNote] = useState<{ [matchId: string]: string }>({});
  const [matchOddsSaveMsg, setMatchOddsSaveMsg] = useState<{ [matchId: string]: boolean }>({});


  // Search/Filter states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [betSearchQuery, setBetSearchQuery] = useState('');
  const [betStatusFilter, setBetStatusFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');
  const [betToDeleteConfirm, setBetToDeleteConfirm] = useState<Bet | null>(null);

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

  // Beginner Guide Editing States
  const [editingGuideCategories, setEditingGuideCategories] = useState<GuideCategory[]>(guideCategories);
  const [guideSaveSuccess, setGuideSaveSuccess] = useState(false);
  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [newGuideCatTitle, setNewGuideCatTitle] = useState('');
  const [newGuideCatDesc, setNewGuideCatDesc] = useState('');
  const [newGuideCatIcon, setNewGuideCatIcon] = useState('BookOpen');

  const [addingStepForCatId, setAddingStepForCatId] = useState<string | null>(null);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepContent, setNewStepContent] = useState('');
  const [newStepBadge, setNewStepBadge] = useState('');
  const [newStepIcon, setNewStepIcon] = useState('CheckCircle');
  const [newStepActionType, setNewStepActionType] = useState<'deposit' | 'withdraw' | 'public_bets' | 'events' | 'none'>('none');
  const [newStepActionLabel, setNewStepActionLabel] = useState('');

  React.useEffect(() => {
    if (guideCategories && guideCategories.length > 0) {
      setEditingGuideCategories(guideCategories);
    }
  }, [guideCategories]);

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
  const [newSport, setNewSport] = useState<string>('football');
  const [newLeague, setNewLeague] = useState('الدوري الإنجليزي الممتاز');

  // Sports Categories Management States
  const [newCatId, setNewCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏆');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catAddSuccess, setCatAddSuccess] = useState(false);

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatIcon, setEditCatIcon] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [catEditSuccess, setCatEditSuccess] = useState(false);
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
  const [newIsFeaturedBet, setNewIsFeaturedBet] = useState<boolean>(false);
  const [newFeaturedBetMultiplier, setNewFeaturedBetMultiplier] = useState<number>(3.0);
  const [newFeaturedBetLabel, setNewFeaturedBetLabel] = useState<string>('🔥 رهان مميز مضاعف x3');
  const [newMatchImage, setNewMatchImage] = useState<string>('');
  const [addMatchSuccess, setAddMatchSuccess] = useState(false);

  // Match Bet Button Customization States
  const [selectedMatchForCustom, setSelectedMatchForCustom] = useState(allMatches[0]?.id || '');
  const [editCustomLabelHome, setEditCustomLabelHome] = useState('');
  const [editCustomLabelDraw, setEditCustomLabelDraw] = useState('');
  const [editCustomLabelAway, setEditCustomLabelAway] = useState('');
  const [editFixedStakeAmount, setEditFixedStakeAmount] = useState<string>('');
  const [editIsFeatured, setEditIsFeatured] = useState<boolean>(false);
  const [editFeaturedTag, setEditFeaturedTag] = useState<string>('');
  const [editOddsHome, setEditOddsHome] = useState<number>(2.00);
  const [editOddsDraw, setEditOddsDraw] = useState<number>(3.20);
  const [editOddsAway, setEditOddsAway] = useState<number>(2.50);
  const [editIsFeaturedBet, setEditIsFeaturedBet] = useState<boolean>(false);
  const [editFeaturedBetMultiplier, setEditFeaturedBetMultiplier] = useState<number>(3.0);
  const [editFeaturedBetLabel, setEditFeaturedBetLabel] = useState<string>('🔥 رهان مميز مضاعف x3');
  const [editMatchImage, setEditMatchImage] = useState<string>('');
  const [customSaveSuccess, setCustomSaveSuccess] = useState(false);

  // Promotional Betting Announcement States (إعلان للرهان على مباراة مميزة)
  const [adMatchId, setAdMatchId] = useState<string>(allMatches[0]?.id || '');
  const [adTitle, setAdTitle] = useState<string>('');
  const [adDescription, setAdDescription] = useState<string>('');
  const [adBadge, setAdBadge] = useState<string>('🔥 رهان موسم 2026');
  const [adImage, setAdImage] = useState<string>('');
  const [isAdFeaturedToggle, setIsAdFeaturedToggle] = useState<boolean>(true);
  const [adSaveSuccess, setAdSaveSuccess] = useState<boolean>(false);

  // Helper for uploading image files locally
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
  const [matchDate, setMatchDate] = useState('2026-07-25');
  const [matchTime, setMatchTime] = useState('20:00');
  const [matchMinutes, setMatchMinutes] = useState(0);
  const [scoreSuccess, setScoreSuccess] = useState(false);

  // Sync match details whenever selectedMatchForScore changes
  React.useEffect(() => {
    const target = allMatches.find(m => m.id === selectedMatchForScore);
    if (target) {
      setScoreHome(target.scoreHome || 0);
      setScoreAway(target.scoreAway || 0);
      setResolveStatus(target.status || 'scheduled');
      setMatchDate(target.date || '2026-07-25');
      setMatchTime(target.time || '20:00');
      setMatchMinutes(target.minutes || 0);
    }
  }, [selectedMatchForScore, allMatches]);

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
      setEditOddsHome(target.oddsHome || 2.00);
      setEditOddsDraw(target.oddsDraw || 3.20);
      setEditOddsAway(target.oddsAway || 2.50);
      setEditIsFeaturedBet(Boolean(target.isFeaturedBet));
      setEditFeaturedBetMultiplier(target.featuredBetMultiplier || 3.0);
      setEditFeaturedBetLabel(target.featuredBetLabel || '🔥 رهان مميز مضاعف x3');
      setEditMatchImage(target.matchImage || '');
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
        editIsFeatured ? (editFeaturedTag.trim() || '🔥 مباراة متميزة') : undefined,
        Number(editOddsHome) > 0 ? Number(editOddsHome) : 2.00,
        Number(editOddsDraw) > 0 ? Number(editOddsDraw) : 3.20,
        Number(editOddsAway) > 0 ? Number(editOddsAway) : 2.50,
        editIsFeaturedBet,
        editIsFeaturedBet ? (Number(editFeaturedBetMultiplier) > 0 ? Number(editFeaturedBetMultiplier) : 3) : 1,
        editIsFeaturedBet ? (editFeaturedBetLabel.trim() || `🔥 رهان مميز مضاعف x${editFeaturedBetMultiplier}`) : undefined,
        editMatchImage.trim() || undefined
      );
      setCustomSaveSuccess(true);
      setTimeout(() => setCustomSaveSuccess(false), 3000);
    }
  };

  // Handler to publish a promotional betting announcement on a featured match
  const handlePublishPromotionalAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adMatchId) return;

    const targetMatch = allMatches.find(m => m.id === adMatchId);
    if (!targetMatch) return;

    if (onUpdateMatchCustomizations) {
      onUpdateMatchCustomizations(
        adMatchId,
        targetMatch.customLabelHome,
        targetMatch.customLabelDraw,
        targetMatch.customLabelAway,
        targetMatch.fixedStakeAmount,
        true, // Ensure it is set as featured
        targetMatch.featuredTag || '🔥 مباراة متميزة',
        targetMatch.oddsHome,
        targetMatch.oddsDraw,
        targetMatch.oddsAway,
        true, // Enable featured bet multiplier
        targetMatch.featuredBetMultiplier || 3,
        targetMatch.featuredBetLabel || '🔥 رهان مميز مضاعف x3',
        adImage.trim() || targetMatch.matchImage || undefined,
        adTitle.trim() || `🚀 إعلان رهان قمة الأسبوع: ${targetMatch.teamHome} × ${targetMatch.teamAway}`,
        adDescription.trim() || `توقع نتيجة مباراة ${targetMatch.teamHome} × ${targetMatch.teamAway} الآن واحصل على أرباح حصرية مضاعفة!`,
        adBadge.trim() || '🔥 إعلان رهان مميز',
        isAdFeaturedToggle
      );
      setAdSaveSuccess(true);
      setTimeout(() => setAdSaveSuccess(false), 3500);
    }
  };

  // Handle Add Sports Category
  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const generatedId = newCatId.trim().toLowerCase().replace(/\s+/g, '-') || `cat-${Date.now()}`;
    const newCategory: SportCategory = {
      id: generatedId,
      name: newCatName.trim(),
      icon: newCatIcon.trim() || '🏆',
      description: newCatDesc.trim() || undefined
    };

    if (onAddSportCategory) {
      onAddSportCategory(newCategory);
      setCatAddSuccess(true);
      setNewCatId('');
      setNewCatName('');
      setNewCatIcon('🏆');
      setNewCatDesc('');
      setTimeout(() => setCatAddSuccess(false), 3000);
    }
  };

  // Start Editing Category
  const handleStartEditCategory = (category: SportCategory) => {
    setEditingCatId(category.id);
    setEditCatName(category.name);
    setEditCatIcon(category.icon || '🏆');
    setEditCatDesc(category.description || '');
  };

  // Save Category Edit
  const handleSaveCategoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatId || !editCatName.trim()) return;

    if (onUpdateSportCategory) {
      onUpdateSportCategory(editingCatId, {
        name: editCatName.trim(),
        icon: editCatIcon.trim() || '🏆',
        description: editCatDesc.trim() || undefined
      });
      setCatEditSuccess(true);
      setEditingCatId(null);
      setTimeout(() => setCatEditSuccess(false), 3000);
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
      logoHome: sportsCategories.find(c => c.id === newSport)?.icon || (newSport === 'football' ? '⚽' : newSport === 'basketball' ? '🏀' : '🎾'),
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
      isFeaturedBet: newIsFeaturedBet,
      featuredBetMultiplier: newIsFeaturedBet ? (Number(newFeaturedBetMultiplier) > 0 ? Number(newFeaturedBetMultiplier) : 3) : 1,
      featuredBetLabel: newIsFeaturedBet ? (newFeaturedBetLabel.trim() || `🔥 رهان مميز مضاعف x${newFeaturedBetMultiplier}`) : undefined,
      matchImage: newMatchImage.trim() || undefined,
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
    setNewIsFeaturedBet(false);
    setNewFeaturedBetMultiplier(3.0);
    setNewFeaturedBetLabel('🔥 رهان مميز مضاعف x3');
    setNewMatchImage('');
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
    onUpdateMatchScore(
      selectedMatchForScore, 
      Number(scoreHome), 
      Number(scoreAway), 
      resolveStatus,
      matchDate,
      matchTime,
      Number(matchMinutes)
    );
    setScoreSuccess(true);
    setTimeout(() => setScoreSuccess(false), 3000);
  };

  // Helper to directly determine winning team and trigger automatic profit payout
  const handleSetWinnerAndSettle = (
    matchId: string,
    winnerOutcome: 'home' | 'draw' | 'away',
    customScoreHome?: number,
    customScoreAway?: number
  ) => {
    const targetMatch = allMatches.find(m => m.id === matchId);
    if (!targetMatch) return;

    let finalHome = customScoreHome !== undefined ? customScoreHome : (targetMatch.scoreHome || 0);
    let finalAway = customScoreAway !== undefined ? customScoreAway : (targetMatch.scoreAway || 0);

    if (winnerOutcome === 'home') {
      if (finalHome <= finalAway) {
        finalHome = Math.max(finalAway + 1, 2);
      }
    } else if (winnerOutcome === 'draw') {
      if (finalHome !== finalAway) {
        finalHome = 1;
        finalAway = 1;
      }
    } else if (winnerOutcome === 'away') {
      if (finalAway <= finalHome) {
        finalAway = Math.max(finalHome + 1, 2);
      }
    }

    onUpdateMatchScore(
      matchId,
      finalHome,
      finalAway,
      'finished',
      targetMatch.date,
      targetMatch.time,
      90
    );

    setScoreSuccess(true);
    setTimeout(() => setScoreSuccess(false), 4000);
  };

  const handleSaveMatchOdds = (matchId: string) => {
    const currentOdds = editingMatchOdds[matchId];
    if (!currentOdds) return;
    const targetMatch = allMatches.find(m => m.id === matchId);
    if (!targetMatch || !onUpdateMatchCustomizations) return;

    onUpdateMatchCustomizations(
      matchId,
      targetMatch.customLabelHome,
      targetMatch.customLabelDraw,
      targetMatch.customLabelAway,
      targetMatch.fixedStakeAmount,
      targetMatch.isFeatured,
      targetMatch.featuredTag,
      currentOdds.home,
      currentOdds.draw,
      currentOdds.away,
      targetMatch.isFeaturedBet,
      targetMatch.featuredBetMultiplier,
      targetMatch.featuredBetLabel,
      targetMatch.matchImage,
      targetMatch.adTitle,
      targetMatch.adDescription,
      targetMatch.adBadge,
      targetMatch.isAdFeatured,
      targetMatch.isBettingClosed,
      targetMatch.bettingStatus,
      targetMatch.bettingNote
    );

    setMatchOddsSaveMsg({ ...matchOddsSaveMsg, [matchId]: true });
    setTimeout(() => {
      setMatchOddsSaveMsg(prev => ({ ...prev, [matchId]: false }));
    }, 2500);
  };

  const handleSaveGuideCategories = (updatedCats: GuideCategory[]) => {
    setEditingGuideCategories(updatedCats);
    if (onUpdateGuideCategories) {
      onUpdateGuideCategories(updatedCats);
    }
    setGuideSaveSuccess(true);
    setTimeout(() => setGuideSaveSuccess(false), 3000);
  };

  const handleUpdateCategoryField = (catId: string, field: string, value: string) => {
    const updated = editingGuideCategories.map(cat => cat.id === catId ? { ...cat, [field]: value } : cat);
    setEditingGuideCategories(updated);
  };

  const handleUpdateStepField = (catId: string, stepId: string, field: string, value: any) => {
    const updated = editingGuideCategories.map(cat => {
      if (cat.id !== catId) return cat;
      const updatedSteps = cat.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s);
      return { ...cat, steps: updatedSteps };
    });
    setEditingGuideCategories(updated);
  };

  const handleDeleteStep = (catId: string, stepId: string) => {
    const updated = editingGuideCategories.map(cat => {
      if (cat.id !== catId) return cat;
      return { ...cat, steps: cat.steps.filter(s => s.id !== stepId) };
    });
    setEditingGuideCategories(updated);
  };

  const handleDeleteCategory = (catId: string) => {
    const updated = editingGuideCategories.filter(cat => cat.id !== catId);
    setEditingGuideCategories(updated);
  };

  const handleAddCategory = () => {
    if (!newGuideCatTitle.trim()) return;
    const newCat: GuideCategory = {
      id: `cat-${Date.now()}`,
      title: newGuideCatTitle,
      description: newGuideCatDesc,
      icon: newGuideCatIcon,
      steps: []
    };
    const updated = [...editingGuideCategories, newCat];
    setEditingGuideCategories(updated);
    setNewGuideCatTitle('');
    setNewGuideCatDesc('');
    setAddingNewCategory(false);
  };

  const handleAddStepToCategory = (catId: string) => {
    if (!newStepTitle.trim() || !newStepContent.trim()) return;
    const newStep: GuideStep = {
      id: `step-${Date.now()}`,
      title: newStepTitle,
      content: newStepContent,
      icon: newStepIcon,
      badgeText: newStepBadge || undefined,
      actionType: newStepActionType !== 'none' ? newStepActionType : undefined,
      actionLabel: newStepActionLabel || undefined
    };
    const updated = editingGuideCategories.map(cat => {
      if (cat.id !== catId) return cat;
      return { ...cat, steps: [...cat.steps, newStep] };
    });
    setEditingGuideCategories(updated);
    setNewStepTitle('');
    setNewStepContent('');
    setNewStepBadge('');
    setNewStepActionLabel('');
    setAddingStepForCatId(null);
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
            { id: 'match-bets-management', label: 'إدارة رهانات المباريات 🎲', icon: SlidersHorizontal },
            { id: 'create-bet', label: 'إنشاء رهان للمستخدم', icon: Target },
            { id: 'bets-list', label: 'سجل الرهانات', icon: Ticket },
            { id: 'cash-deposits', label: 'طلبات الشحن كاش', icon: Wallet },
            { id: 'cash-withdrawals', label: 'طلبات سحب الأرباح 💸', icon: ArrowUpRight },
            { id: 'events', label: 'إدارة الأحداث', icon: Calendar },
            { id: 'sports-categories', label: 'تصنيفات الرياضات 🏆', icon: Trophy },
            { id: 'guide-management', label: 'دليل المبتدئين والتعليمات 📖', icon: BookOpen },
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

      {/* NEW TAB: MATCH BETS MANAGEMENT (إدارة وتصفية رهانات المباريات) */}
      {adminTab === 'match-bets-management' && (
        <section className="space-y-6">
          {/* Header Overview Banner */}
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 rounded-2xl border border-amber-500/30 space-y-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-6 w-6 text-amber-400" />
                  <span>صفحة إدارة رهانات المباريات للتحكم الكامل</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  تحكم مطلق في فتح وإغلاق الرهان لكل مباراة، تعديل قيم الأودز المباشرة، وتخصيص الخيارات مع إمكانية الوصول لسجل المراهنين والتصفية الآلية للأرباح.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Unlock className="h-3.5 w-3.5" />
                  <span>{allMatches.filter(m => m.status !== 'finished' && !m.isBettingClosed && m.bettingStatus !== 'closed' && m.bettingStatus !== 'suspended').length} مباريات مفتوحة للرهان</span>
                </span>
                <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{allMatches.filter(m => m.isBettingClosed || m.bettingStatus === 'closed' || m.bettingStatus === 'suspended').length} رهانات مغلقة / معلقة</span>
                </span>
              </div>
            </div>

            {/* Quick Metrics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <p className="text-[11px] text-zinc-400 font-bold">إجمالي المباريات المتاحة</p>
                <p className="text-lg font-black text-white mt-0.5">{allMatches.length} مباراة</p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <p className="text-[11px] text-zinc-400 font-bold">إجمالي الرهانات القائمة</p>
                <p className="text-lg font-black text-amber-400 mt-0.5">{allBets.length} رهان</p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <p className="text-[11px] text-zinc-400 font-bold">إجمالي كوينز الرهان</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">
                  {allBets.reduce((sum, b) => sum + b.amount, 0).toLocaleString()} 🪙
                </p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <p className="text-[11px] text-zinc-400 font-bold">مباريات البث المباشر (لايف)</p>
                <p className="text-lg font-black text-red-400 mt-0.5">
                  {allMatches.filter(m => m.status === 'live').length} مباراة
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute right-3 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="بحث باسم الفريق أو الدوري أو الرياضة..."
                value={matchBetsSearchQuery}
                onChange={(e) => setMatchBetsSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-9 pl-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'جميع المباريات' },
                { id: 'open', label: 'رهانات مفتوحة 🟢' },
                { id: 'suspended', label: 'معلقة مؤقتاً ⏸️' },
                { id: 'closed', label: 'مغلقة 🔒' },
                { id: 'live', label: 'جارية لايف ⚡' },
                { id: 'finished', label: 'منتهية 🏁' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setMatchBetsStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    matchBetsStatusFilter === f.id
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Matches List with Individual Betting Control Panels */}
          <div className="space-y-6">
            {allMatches.filter(m => {
              const query = matchBetsSearchQuery.toLowerCase();
              const matchText = `${m.teamHome} ${m.teamAway} ${m.league} ${m.sport}`.toLowerCase();
              const passesSearch = matchText.includes(query);

              let passesStatus = true;
              if (matchBetsStatusFilter === 'open') {
                passesStatus = m.status !== 'finished' && !m.isBettingClosed && m.bettingStatus !== 'closed' && m.bettingStatus !== 'suspended';
              } else if (matchBetsStatusFilter === 'suspended') {
                passesStatus = m.bettingStatus === 'suspended';
              } else if (matchBetsStatusFilter === 'closed') {
                passesStatus = m.isBettingClosed || m.bettingStatus === 'closed';
              } else if (matchBetsStatusFilter === 'live') {
                passesStatus = m.status === 'live';
              } else if (matchBetsStatusFilter === 'finished') {
                passesStatus = m.status === 'finished';
              }

              return passesSearch && passesStatus;
            }).length === 0 ? (
              <div className="bg-zinc-950 p-12 rounded-2xl border border-zinc-900 text-center space-y-3">
                <Sliders className="h-10 w-10 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-400 font-bold">لا توجد مباريات تطابق الفلتر أو البحث حالياً.</p>
              </div>
            ) : (
              allMatches.filter(m => {
                const query = matchBetsSearchQuery.toLowerCase();
                const matchText = `${m.teamHome} ${m.teamAway} ${m.league} ${m.sport}`.toLowerCase();
                const passesSearch = matchText.includes(query);

                let passesStatus = true;
                if (matchBetsStatusFilter === 'open') {
                  passesStatus = m.status !== 'finished' && !m.isBettingClosed && m.bettingStatus !== 'closed' && m.bettingStatus !== 'suspended';
                } else if (matchBetsStatusFilter === 'suspended') {
                  passesStatus = m.bettingStatus === 'suspended';
                } else if (matchBetsStatusFilter === 'closed') {
                  passesStatus = m.isBettingClosed || m.bettingStatus === 'closed';
                } else if (matchBetsStatusFilter === 'live') {
                  passesStatus = m.status === 'live';
                } else if (matchBetsStatusFilter === 'finished') {
                  passesStatus = m.status === 'finished';
                }

                return passesSearch && passesStatus;
              }).map(m => {
                const isBettingOpen = m.status !== 'finished' && !m.isBettingClosed && m.bettingStatus !== 'closed' && m.bettingStatus !== 'suspended';
                const matchBets = allBets.filter(b => b.matchId === m.id);
                const totalStakedOnMatch = matchBets.reduce((sum, b) => sum + b.amount, 0);
                const isExpanded = expandedMatchBetsId === m.id;

                const homeBetsCount = matchBets.filter(b => b.selectedOutcome === 'home').length;
                const drawBetsCount = matchBets.filter(b => b.selectedOutcome === 'draw').length;
                const awayBetsCount = matchBets.filter(b => b.selectedOutcome === 'away').length;

                const currentOdds = editingMatchOdds[m.id] || { home: m.oddsHome, draw: m.oddsDraw, away: m.oddsAway };

                return (
                  <div 
                    key={m.id}
                    className={`rounded-2xl border bg-zinc-950 p-5 space-y-5 transition-all shadow-xl ${
                      m.status === 'live' 
                        ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' 
                        : m.isBettingClosed || m.bettingStatus === 'closed'
                        ? 'border-red-500/30 bg-zinc-950/80'
                        : m.bettingStatus === 'suspended'
                        ? 'border-amber-500/40 bg-zinc-950/90'
                        : 'border-zinc-900'
                    }`}
                  >
                    {/* Top Bar inside Match Card */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          {m.league}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">
                          {m.date || 'اليوم'} - {m.time}
                        </span>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {m.status === 'finished' ? (
                          <span className="bg-zinc-800 text-zinc-300 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                            🏁 مباراة منتهية
                          </span>
                        ) : m.status === 'live' ? (
                          <span className="bg-red-500/20 text-red-400 text-[11px] font-black px-2.5 py-1 rounded-lg border border-red-500/30 flex items-center gap-1 animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            <span>مباشر لايف ({m.minutes}')</span>
                          </span>
                        ) : null}

                        {isBettingOpen ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-black px-3 py-1 rounded-lg flex items-center gap-1">
                            <Unlock className="h-3.5 w-3.5" />
                            <span>الرهان مفتوح 🟢</span>
                          </span>
                        ) : m.bettingStatus === 'suspended' ? (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-black px-3 py-1 rounded-lg flex items-center gap-1">
                            <PauseCircle className="h-3.5 w-3.5" />
                            <span>الرهان معلق مؤقتاً ⏸️</span>
                          </span>
                        ) : (
                          <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[11px] font-black px-3 py-1 rounded-lg flex items-center gap-1">
                            <Lock className="h-3.5 w-3.5" />
                            <span>الرهان مغلق 🔒</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Match Score & Goals Control Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                      {/* Home Team */}
                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <div className="text-2xl">{m.logoHome}</div>
                        <div>
                          <div className="font-black text-white text-sm">{m.teamHome}</div>
                          <div className="text-[10px] text-emerald-400 font-bold">فريق المضيف (1)</div>
                        </div>
                        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-emerald-500/30 mr-auto sm:mr-0">
                          <button
                            type="button"
                            onClick={() => onUpdateMatchScore(m.id, Math.max(0, (m.scoreHome || 0) - 1), m.scoreAway || 0, m.status, m.date, m.time, m.minutes)}
                            className="h-7 w-7 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-black rounded text-xs"
                          >-</button>
                          <span className="text-emerald-400 font-mono font-black px-2">{m.scoreHome ?? 0}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateMatchScore(m.id, (m.scoreHome || 0) + 1, m.scoreAway || 0, m.status, m.date, m.time, m.minutes)}
                            className="h-7 w-7 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded text-xs"
                          >+</button>
                        </div>
                      </div>

                      {/* VS / Score Divider */}
                      <div className="text-center space-y-1">
                        <div className="text-2xl font-black text-white font-mono">
                          {m.scoreHome ?? 0} : {m.scoreAway ?? 0}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-bold">
                          حالة المباراة: {m.status === 'live' ? `شغال دقيقة ${m.minutes}'` : m.status === 'finished' ? 'منتهية' : 'مجدولة'}
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-blue-500/30 ml-auto sm:ml-0">
                          <button
                            type="button"
                            onClick={() => onUpdateMatchScore(m.id, m.scoreHome || 0, (m.scoreAway || 0) + 1, m.status, m.date, m.time, m.minutes)}
                            className="h-7 w-7 bg-blue-500 hover:bg-blue-400 text-zinc-950 font-black rounded text-xs"
                          >+</button>
                          <span className="text-blue-400 font-mono font-black px-2">{m.scoreAway ?? 0}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateMatchScore(m.id, m.scoreHome || 0, Math.max(0, (m.scoreAway || 0) - 1), m.status, m.date, m.time, m.minutes)}
                            className="h-7 w-7 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-black rounded text-xs"
                          >-</button>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="font-black text-white text-sm">{m.teamAway}</div>
                          <div className="text-[10px] text-blue-400 font-bold">فريق الضيف (2)</div>
                        </div>
                        <div className="text-2xl">{m.logoAway}</div>
                      </div>
                    </div>

                    {/* Full Match Betting Control Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      
                      {/* Section 1: Controlling Betting Status (فتح / تعليق / إغلاق) */}
                      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
                        <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                          <Lock className="h-4 w-4" />
                          <span>1. التحكم في حالة الرهان لهذه المباراة:</span>
                        </span>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateMatchCustomizations) {
                                onUpdateMatchCustomizations(
                                  m.id, m.customLabelHome, m.customLabelDraw, m.customLabelAway,
                                  m.fixedStakeAmount, m.isFeatured, m.featuredTag,
                                  m.oddsHome, m.oddsDraw, m.oddsAway,
                                  m.isFeaturedBet, m.featuredBetMultiplier, m.featuredBetLabel,
                                  m.matchImage, m.adTitle, m.adDescription, m.adBadge, m.isAdFeatured,
                                  false, 'open', ''
                                );
                              }
                            }}
                            className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                              isBettingOpen
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/20'
                                : 'bg-zinc-950 text-emerald-400 border-zinc-800 hover:bg-emerald-500/10'
                            }`}
                          >
                            <Unlock className="h-4 w-4" />
                            <span>فتح الرهان 🟢</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateMatchCustomizations) {
                                onUpdateMatchCustomizations(
                                  m.id, m.customLabelHome, m.customLabelDraw, m.customLabelAway,
                                  m.fixedStakeAmount, m.isFeatured, m.featuredTag,
                                  m.oddsHome, m.oddsDraw, m.oddsAway,
                                  m.isFeaturedBet, m.featuredBetMultiplier, m.featuredBetLabel,
                                  m.matchImage, m.adTitle, m.adDescription, m.adBadge, m.isAdFeatured,
                                  true, 'suspended', editingMatchBetNote[m.id] || 'تم تعليق الرهان مؤقتاً'
                                );
                              }
                            }}
                            className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                              m.bettingStatus === 'suspended'
                                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
                                : 'bg-zinc-950 text-amber-400 border-zinc-800 hover:bg-amber-500/10'
                            }`}
                          >
                            <PauseCircle className="h-4 w-4" />
                            <span>تعليق مؤقت ⏸️</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateMatchCustomizations) {
                                onUpdateMatchCustomizations(
                                  m.id, m.customLabelHome, m.customLabelDraw, m.customLabelAway,
                                  m.fixedStakeAmount, m.isFeatured, m.featuredTag,
                                  m.oddsHome, m.oddsDraw, m.oddsAway,
                                  m.isFeaturedBet, m.featuredBetMultiplier, m.featuredBetLabel,
                                  m.matchImage, m.adTitle, m.adDescription, m.adBadge, m.isAdFeatured,
                                  true, 'closed', editingMatchBetNote[m.id] || 'الرهان مغلق بقرار الإدارة'
                                );
                              }
                            }}
                            className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                              m.isBettingClosed || m.bettingStatus === 'closed'
                                ? 'bg-red-500 text-white border-red-400 font-black shadow-lg shadow-red-500/20'
                                : 'bg-zinc-950 text-red-400 border-zinc-800 hover:bg-red-500/10'
                            }`}
                          >
                            <Lock className="h-4 w-4" />
                            <span>إغلاق الرهان 🔒</span>
                          </button>
                        </div>

                        {/* Note Input */}
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-1 font-bold">ملاحظة يراها المستخدم عند تعليق أو إغلاق الرهان:</label>
                          <input
                            type="text"
                            placeholder="مثال: تم تعليق الرهان لمراجعة حالة الفار VAR..."
                            value={editingMatchBetNote[m.id] !== undefined ? editingMatchBetNote[m.id] : (m.bettingNote || '')}
                            onChange={(e) => setEditingMatchBetNote({ ...editingMatchBetNote, [m.id]: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-bold"
                          />
                        </div>
                      </div>

                      {/* Section 2: Editing Odds (تعديل نسب الأودز المباشرة) */}
                      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                            <Activity className="h-4 w-4" />
                            <span>2. تعديل نسب معاملات الفوز (Odds):</span>
                          </span>
                          {matchOddsSaveMsg[m.id] && (
                            <span className="text-[10px] text-emerald-400 font-bold animate-pulse">تم حفظ الأودز!</span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          {/* Home Odds */}
                          <div className="bg-zinc-950 p-2 rounded-xl border border-emerald-500/30">
                            <label className="text-[10px] text-emerald-400 font-bold block mb-1">فوز المضيف (1)</label>
                            <input
                              type="number"
                              step="0.05"
                              min="1.01"
                              value={currentOdds.home}
                              onChange={(e) => setEditingMatchOdds({
                                ...editingMatchOdds,
                                [m.id]: { ...currentOdds, home: parseFloat(e.target.value) || 1.01 }
                              })}
                              className="w-full bg-zinc-900 border border-emerald-500/40 rounded-lg p-1.5 text-center text-sm font-black text-emerald-400"
                            />
                          </div>

                          {/* Draw Odds */}
                          <div className="bg-zinc-950 p-2 rounded-xl border border-amber-500/30">
                            <label className="text-[10px] text-amber-400 font-bold block mb-1">تعادل (X)</label>
                            <input
                              type="number"
                              step="0.05"
                              min="1.01"
                              value={currentOdds.draw}
                              onChange={(e) => setEditingMatchOdds({
                                ...editingMatchOdds,
                                [m.id]: { ...currentOdds, draw: parseFloat(e.target.value) || 1.01 }
                              })}
                              className="w-full bg-zinc-900 border border-amber-500/40 rounded-lg p-1.5 text-center text-sm font-black text-amber-400"
                            />
                          </div>

                          {/* Away Odds */}
                          <div className="bg-zinc-950 p-2 rounded-xl border border-blue-500/30">
                            <label className="text-[10px] text-blue-400 font-bold block mb-1">فوز الضيف (2)</label>
                            <input
                              type="number"
                              step="0.05"
                              min="1.01"
                              value={currentOdds.away}
                              onChange={(e) => setEditingMatchOdds({
                                ...editingMatchOdds,
                                [m.id]: { ...currentOdds, away: parseFloat(e.target.value) || 1.01 }
                              })}
                              className="w-full bg-zinc-900 border border-blue-500/40 rounded-lg p-1.5 text-center text-sm font-black text-blue-400"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveMatchOdds(m.id)}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>حفظ تحديث الأودز الآن</span>
                        </button>
                      </div>

                    </div>

                    {/* Section 3: Winner Determination & Quick Settle */}
                    <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 p-4 rounded-xl border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                          <Trophy className="h-4 w-4" />
                          <span>3. تحديد الفريق الفائز وتوزيع الأرباح فوراً:</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold">
                          يحوّل الحالة لـ (منتهية) ويحوّل الكوينز للفائزين
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetWinnerAndSettle(m.id, 'home', 2, 0)}
                          className="py-2.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          🥇 فوز {m.teamHome}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetWinnerAndSettle(m.id, 'draw', 1, 1)}
                          className="py-2.5 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          🤝 تعادل الفريقين
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetWinnerAndSettle(m.id, 'away', 0, 2)}
                          className="py-2.5 px-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500 hover:text-black font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          🥇 فوز {m.teamAway}
                        </button>
                      </div>
                    </div>

                    {/* Section 4: Active Bets Placed on Match Breakdown */}
                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-black text-white">
                            إحصائيات المراهنين على هذه المباراة: ({matchBets.length} رهانات)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono font-bold">
                          <span className="text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                            مجموع المراهنات: {totalStakedOnMatch.toLocaleString()} 🪙
                          </span>
                        </div>
                      </div>

                      {/* Outcome Breakdown Bar */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                        <div className="bg-zinc-950 p-2 rounded-lg border border-emerald-500/20">
                          <span className="text-emerald-400 block text-[10px]">فوز {m.teamHome}</span>
                          <span className="text-white font-mono">{homeBetsCount} رهان</span>
                        </div>
                        <div className="bg-zinc-950 p-2 rounded-lg border border-amber-500/20">
                          <span className="text-amber-400 block text-[10px]">التعادل</span>
                          <span className="text-white font-mono">{drawBetsCount} رهان</span>
                        </div>
                        <div className="bg-zinc-950 p-2 rounded-lg border border-blue-500/20">
                          <span className="text-blue-400 block text-[10px]">فوز {m.teamAway}</span>
                          <span className="text-white font-mono">{awayBetsCount} رهان</span>
                        </div>
                      </div>

                      {/* Toggle Expand Active Bettors List */}
                      <button
                        type="button"
                        onClick={() => setExpandedMatchBetsId(isExpanded ? null : m.id)}
                        className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold text-xs py-2 px-3 rounded-xl border border-zinc-800 flex items-center justify-between transition-all"
                      >
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-amber-400" />
                          <span>عرض قائمة المراهنين لهذه المباراة والتصفية الفردية</span>
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>

                      {/* Expanded Active Bettors Table */}
                      {isExpanded && (
                        <div className="pt-2 overflow-x-auto">
                          {matchBets.length === 0 ? (
                            <p className="text-center text-zinc-500 text-xs py-4">
                              لم يقم أي مستخدم بالرهان على هذه المباراة حتى الآن.
                            </p>
                          ) : (
                            <table className="w-full text-right border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-zinc-800 text-zinc-500 font-bold">
                                  <th className="py-2 px-3">المستخدم</th>
                                  <th className="py-2 px-3 text-center">الخيار المختار</th>
                                  <th className="py-2 px-3 text-center">المبلغ والأودز</th>
                                  <th className="py-2 px-3 text-center">الربح المحتمل</th>
                                  <th className="py-2 px-3 text-center">الحالة</th>
                                  <th className="py-2 px-3 text-center">إجراءات التحكم</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                                {matchBets.map(bet => {
                                  const betUser = allUsers.find(u => u.id === bet.userId);
                                  const potWin = Math.round(bet.amount * bet.odds);

                                  return (
                                    <tr key={bet.id} className="hover:bg-zinc-900/50 transition-colors">
                                      <td className="py-2.5 px-3 font-bold text-white">
                                        <div>{betUser?.name || bet.userId}</div>
                                        <div className="text-[10px] text-zinc-500 font-mono">{betUser?.email}</div>
                                      </td>

                                      <td className="py-2.5 px-3 text-center">
                                        <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                                          bet.selectedOutcome === 'home'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : bet.selectedOutcome === 'draw'
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        }`}>
                                          {bet.selectedOutcome === 'home' ? `فوز ${m.teamHome}` : bet.selectedOutcome === 'draw' ? 'تعادل' : `فوز ${m.teamAway}`}
                                        </span>
                                      </td>

                                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                                        <div className="text-amber-400">{bet.amount} 🪙</div>
                                        <div className="text-[10px] text-zinc-500">معامل: x{bet.odds.toFixed(2)}</div>
                                      </td>

                                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400">
                                        {potWin} 🪙
                                      </td>

                                      <td className="py-2.5 px-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          bet.status === 'won'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : bet.status === 'lost'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        }`}>
                                          {bet.status === 'won' ? 'فائز 🟢' : bet.status === 'lost' ? 'خاسر 🔴' : 'قيد الانتظار ⏳'}
                                        </span>
                                      </td>

                                      <td className="py-2.5 px-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => onUpdateBetStatus(bet.id, 'won')}
                                            className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 text-[10px] font-bold border border-emerald-500/20"
                                            title="اعتماد كـ فائز وتحويل الأرباح"
                                          >
                                            فائز 🟢
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => onUpdateBetStatus(bet.id, 'lost')}
                                            className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 text-[10px] font-bold border border-red-500/20"
                                            title="اعتماد كـ خاسر"
                                          >
                                            خاسر 🔴
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => onDeleteBet(bet.id)}
                                            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded"
                                            title="حذف الرهان"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
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
                                onClick={() => setBetToDeleteConfirm(b)}
                                className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[10px] text-amber-400 font-bold hover:bg-amber-500 hover:text-zinc-950 transition-all cursor-pointer"
                                title="إلغاء الرهان واسترجاع الكوينز للمستخدم"
                              >
                                إلغاء واسترجاع 🔄
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

          {/* Admin Confirmation Modal for cancelling/deleting a bet */}
          {betToDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
              <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 overflow-hidden">
                
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <AlertTriangle className="h-6 w-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">تأكيد إلغاء / حذف الرهان (إدارة)</h3>
                      <p className="text-[11px] text-zinc-400">تأكيد لمنع الحذف أو الإلغاء بالخطأ</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBetToDeleteConfirm(null)}
                    className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">المستخدم:</span>
                    <span className="font-bold text-white">{allUsers.find(u => u.id === betToDeleteConfirm.userId)?.name || betToDeleteConfirm.userId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">المباراة:</span>
                    <span className="font-bold text-white">{betToDeleteConfirm.teamHome} × {betToDeleteConfirm.teamAway}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">المبلغ المستثمر:</span>
                    <span className="font-black text-amber-400">{betToDeleteConfirm.amount.toLocaleString()} 🪙 كوينز</span>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-300">
                  سيتم حذف هذا الرهان وإعادة مبلغ <strong className="text-white">{betToDeleteConfirm.amount.toLocaleString()} كوينز</strong> إلى محفظة المستخدم.
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteBet) {
                        onDeleteBet(betToDeleteConfirm.id);
                      }
                      setBetToDeleteConfirm(null);
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black py-2.5 px-4 rounded-xl shadow-lg shadow-red-500/20 text-xs transition-all cursor-pointer"
                  >
                    تأكيد الإلغاء والإرجاع
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetToDeleteConfirm(null)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-2.5 px-4 rounded-xl border border-zinc-800 text-xs transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>

              </div>
            </div>
          )}
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
                <label className="text-zinc-400 block mb-1 font-medium">نوع الرياضة (التصنيف):</label>
                <select
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  id="admin-new-sport"
                >
                  {(sportsCategories && sportsCategories.length > 0 ? sportsCategories : [
                    { id: 'football', name: 'كرة القدم', icon: '⚽' },
                    { id: 'basketball', name: 'كرة السلة', icon: '🏀' },
                    { id: 'tennis', name: 'التنس', icon: '🎾' }
                  ]).map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon || '🏆'} {cat.name}
                    </option>
                  ))}
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

                  {/* Featured Super Bet (ميزة رهان مميز / مضاعَف الأرباح) */}
                  <div className="pt-2 border-t border-zinc-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="admin-new-is-featured-bet"
                        checked={newIsFeaturedBet}
                        onChange={(e) => setNewIsFeaturedBet(e.target.checked)}
                        className="h-4 w-4 rounded bg-zinc-900 border-zinc-800 text-purple-500 focus:ring-purple-500 cursor-pointer"
                      />
                      <label htmlFor="admin-new-is-featured-bet" className="text-purple-400 font-bold text-xs cursor-pointer flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        <span>تفعيل ميزة "رهان مميز" (مضاعفة أرباح المباراة) 🔥</span>
                      </label>
                    </div>

                    {newIsFeaturedBet && (
                      <div className="space-y-2 bg-purple-500/10 p-3 rounded-xl border border-purple-500/30 text-xs">
                        <div>
                          <label className="text-purple-300 font-bold block mb-1">
                            قيمة مضاعفة الرهان المميز (أضعاف الرهان العادي):
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.5"
                              min="1.1"
                              value={newFeaturedBetMultiplier}
                              onChange={(e) => setNewFeaturedBetMultiplier(parseFloat(e.target.value) || 1)}
                              className="w-full bg-zinc-950 border border-purple-500/40 rounded-xl px-3 py-1.5 text-purple-300 font-black text-sm focus:outline-none focus:border-purple-400"
                              placeholder="مثال: 2, 3, 5, 10..."
                            />
                            <span className="font-black text-purple-400 text-xs whitespace-nowrap">x أضعاف</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {[2, 3, 5, 10, 20].map(val => (
                              <button
                                type="button"
                                key={val}
                                onClick={() => setNewFeaturedBetMultiplier(val)}
                                className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border transition-all ${
                                  newFeaturedBetMultiplier === val
                                    ? 'bg-purple-500 text-white border-purple-400 font-black'
                                    : 'bg-zinc-900 text-purple-300 border-purple-500/20 hover:bg-purple-500/20'
                                }`}
                              >
                                x{val} مضاعف
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-zinc-400 font-bold block mb-1">عنوان الرهان المميز:</label>
                          <input
                            type="text"
                            value={newFeaturedBetLabel}
                            onChange={(e) => setNewFeaturedBetLabel(e.target.value)}
                            placeholder="مثال: 🔥 رهان مميز مضاعف x3"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-purple-400 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Match Image Upload Field */}
                  <div className="pt-2 border-t border-zinc-900 space-y-2">
                    <label className="text-zinc-300 font-bold block text-xs">📸 رفع/تحديد صورة غلاف للمباراة (Image Banner):</label>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(e, setNewMatchImage)}
                          className="text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer w-full sm:w-auto"
                        />
                        <input
                          type="url"
                          value={newMatchImage}
                          onChange={(e) => setNewMatchImage(e.target.value)}
                          placeholder="أو أدخل رابط صورة مباشر https://..."
                          className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Preset Image Selection */}
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] text-zinc-500 block w-full">نماذج صور جاهزة:</span>
                        {[
                          { label: '⚽ ملعب تحت الأضواء', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80' },
                          { label: '🔥 جمهور الكلاسيكو', url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80' },
                          { label: '🏆 ليلة النهائي', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80' },
                          { label: '🏀 صالة كرة سلة', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80' }
                        ].map((preset, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setNewMatchImage(preset.url)}
                            className="text-[9px] bg-zinc-900 hover:bg-emerald-500 hover:text-black text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 font-medium transition-all"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {newMatchImage && (
                        <div className="relative w-full h-24 rounded-xl overflow-hidden border border-emerald-500/40 mt-1">
                          <img src={newMatchImage} alt="Match Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setNewMatchImage('')}
                            className="absolute top-1 right-1 bg-black/80 text-red-400 p-1 rounded-full hover:bg-red-500 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
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

              {/* Edit Odds & Multipliers */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
                <label className="text-emerald-400 font-bold block text-xs">
                  تعديل أودز المباراة (Odds الأساسية قبل المضاعفة):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-400 text-[11px] font-semibold block mb-1">فوز المضيف (1):</label>
                    <input
                      type="number"
                      step="0.05"
                      min="1.01"
                      value={editOddsHome}
                      onChange={(e) => setEditOddsHome(parseFloat(e.target.value) || 1)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-[11px] font-semibold block mb-1">التعادل (X):</label>
                    <input
                      type="number"
                      step="0.05"
                      min="1.01"
                      value={editOddsDraw}
                      onChange={(e) => setEditOddsDraw(parseFloat(e.target.value) || 1)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 text-[11px] font-semibold block mb-1">فوز الضيف (2):</label>
                    <input
                      type="number"
                      step="0.05"
                      min="1.01"
                      value={editOddsAway}
                      onChange={(e) => setEditOddsAway(parseFloat(e.target.value) || 1)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-blue-400 font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Super Multiplier Bet Toggle */}
              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="admin-edit-is-featured-bet"
                    checked={editIsFeaturedBet}
                    onChange={(e) => setEditIsFeaturedBet(e.target.checked)}
                    className="h-4 w-4 rounded bg-zinc-950 border-zinc-800 text-purple-500 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="admin-edit-is-featured-bet" className="text-purple-300 font-bold text-xs cursor-pointer flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>تفعيل ميزة "رهان مميز" (مضاعفة أرباح المباراة بالكامل برقم يحدده الأدمن) 🔥</span>
                  </label>
                </div>

                {editIsFeaturedBet && (
                  <div className="space-y-3 pt-2 border-t border-purple-500/20">
                    <div>
                      <label className="text-purple-300 text-xs font-bold block mb-1">
                        قيمة مضاعفة الرهان المميز (أضعاف الرهان العادي):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="1.1"
                          value={editFeaturedBetMultiplier}
                          onChange={(e) => setEditFeaturedBetMultiplier(parseFloat(e.target.value) || 1)}
                          className="flex-1 bg-zinc-950 border border-purple-500/40 rounded-xl px-3 py-2 text-purple-300 font-black text-sm focus:outline-none focus:border-purple-400"
                          placeholder="أدخل أي قيمة: 2, 3, 5, 10..."
                        />
                        <span className="font-black text-purple-400 text-sm">x أضعاف</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[2, 3, 5, 10, 20].map(val => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setEditFeaturedBetMultiplier(val)}
                            className={`text-xs px-3 py-1 rounded-lg font-bold border transition-all ${
                              editFeaturedBetMultiplier === val
                                ? 'bg-purple-500 text-white border-purple-400 font-black shadow-md'
                                : 'bg-zinc-900 text-purple-300 border-purple-500/20 hover:bg-purple-500/20'
                            }`}
                          >
                            x{val} مضاعف
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-300 text-xs font-bold block mb-1">وسم / عنوان الرهان المميز:</label>
                      <input
                        type="text"
                        value={editFeaturedBetLabel}
                        onChange={(e) => setEditFeaturedBetLabel(e.target.value)}
                        placeholder="مثال: 🔥 رهان مميز مضاعف x3"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-semibold text-xs focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Live Odds Preview Calculation Box */}
                    <div className="bg-zinc-950/80 p-3 rounded-xl border border-purple-500/30 text-[11px] text-purple-200 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1">
                        <span>⚡ الأودز النهائية التي سيحصل عليها الفائز بعد تطبيق المضاعفة (x{editFeaturedBetMultiplier}):</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                        <div className="bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                          <div className="text-zinc-400 text-[9px]">فوز المضيف</div>
                          <div className="text-emerald-400 font-bold">{(editOddsHome * editFeaturedBetMultiplier).toFixed(2)}x</div>
                        </div>
                        <div className="bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                          <div className="text-zinc-400 text-[9px]">التعادل</div>
                          <div className="text-amber-400 font-bold">{(editOddsDraw * editFeaturedBetMultiplier).toFixed(2)}x</div>
                        </div>
                        <div className="bg-blue-500/10 p-1.5 rounded border border-blue-500/20">
                          <div className="text-zinc-400 text-[9px]">فوز الضيف</div>
                          <div className="text-blue-400 font-bold">{(editOddsAway * editFeaturedBetMultiplier).toFixed(2)}x</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

              {/* Match Image Upload Field in Customization */}
              <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                <label className="text-zinc-300 font-bold block text-xs">📸 رفع / تغيير صورة غلاف المباراة (Match Banner Image):</label>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setEditMatchImage)}
                      className="text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer w-full sm:w-auto"
                    />
                    <input
                      type="url"
                      value={editMatchImage}
                      onChange={(e) => setEditMatchImage(e.target.value)}
                      placeholder="أو أدخل رابط صورة مباشر https://..."
                      className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] text-zinc-500 block w-full">نماذج صور جاهزة للتحديد السريع:</span>
                    {[
                      { label: '⚽ ملعب سانتياغو برنابيو', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80' },
                      { label: '🔥 جمهور الكلاسيكو', url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80' },
                      { label: '🏆 كرة القدم تحت الأضواء', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80' },
                      { label: '🏀 صالة كرة سلة', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80' }
                    ].map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setEditMatchImage(preset.url)}
                        className="text-[9px] bg-zinc-950 hover:bg-emerald-500 hover:text-black text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 font-medium transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {editMatchImage && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-emerald-500/40 mt-1">
                      <img src={editMatchImage} alt="Match Custom Banner" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditMatchImage('')}
                        className="absolute top-1.5 right-1.5 bg-black/80 text-red-400 p-1 rounded-full hover:bg-red-500 hover:text-white transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 text-zinc-950 font-bold py-3 text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
                id="admin-submit-customizations-btn"
              >
                حفظ التخصيصات والصورة للمباراة 💾
              </button>
            </form>
          </div>

          {/* 📣 Promotional Betting Announcement Creator (إنشاء إعلان للرهان على مباراة مميزة) */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-zinc-950 to-zinc-950 p-6 space-y-5 lg:col-span-2 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 flex-wrap gap-2">
              <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span>إنشاء إعلان ترويجي للرهان على مباراة مميزة 📣</span>
              </h3>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/30">
                إعلان مخصص مع وسم وصورة وبانر للمستخدمين
              </span>
            </div>

            {adSaveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>تم نشر وتعميم إعلان الرهان المميز بنجاح للمستخدمين! 🚀</span>
              </div>
            )}

            <form onSubmit={handlePublishPromotionalAd} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">اختر المباراة المميزة للإعلان:</label>
                  <select
                    value={adMatchId}
                    onChange={(e) => {
                      const mId = e.target.value;
                      setAdMatchId(mId);
                      const selected = allMatches.find(m => m.id === mId);
                      if (selected) {
                        setAdTitle(selected.adTitle || `🚀 إعلان رهان قمة الأسبوع: ${selected.teamHome} × ${selected.teamAway}`);
                        setAdDescription(selected.adDescription || `توقع النتيجة الآن واحصل على أرباح مضاعفة x${selected.featuredBetMultiplier || 3} مع تسوية فورية للأرباح!`);
                        setAdBadge(selected.adBadge || '🔥 رهان موسم 2026');
                        setAdImage(selected.matchImage || '');
                        setIsAdFeaturedToggle(Boolean(selected.isAdFeatured !== false));
                      }
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    {allMatches.map(m => (
                      <option key={m.id} value={m.id}>
                        [{m.league}] {m.teamHome} ضد {m.teamAway} {m.isFeatured ? '🔥 (مباراة متميزة)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">وسم / شارة الإعلان (Badge):</label>
                  <input
                    type="text"
                    value={adBadge}
                    onChange={(e) => setAdBadge(e.target.value)}
                    placeholder="مثال: 🔥 رهان موسم 2026 / 👑 المباراة الكبرى"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['🔥 إعلان رهان مميز', '👑 تحدي الكلاسيكو الذهبي', '💥 أرباح مضاعفة x5', '🌟 مباراة اليوم الكبرى'].map(preset => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setAdBadge(preset)}
                        className="text-[10px] bg-zinc-900 text-zinc-300 hover:text-amber-300 px-2 py-0.5 rounded border border-zinc-800 font-bold"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">عنوان الإعلان للرهان (Ad Title):</label>
                <input
                  type="text"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder="مثال: 🚀 رهان الكلاسيكو المميز: ضاعف أرباحك الآن بنسبة x3!"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">وصف الإعلان الترويجي (Ad Description):</label>
                <textarea
                  rows={2}
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  placeholder="مثال: اشترك في الرهان المباشر لمباراة القمة واحصل على أرباح حصرية، بدون حد أقصى للرهان!"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Image upload / preset for Ad Banner */}
              <div>
                <label className="text-zinc-300 font-bold block mb-1">صورة إعلان الرهان الترويجي (Upload Image):</label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, setAdImage)}
                    className="text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer w-full sm:w-auto"
                  />
                  <input
                    type="url"
                    value={adImage}
                    onChange={(e) => setAdImage(e.target.value)}
                    placeholder="أو أدخل رابط صورة مباشر https://..."
                    className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="admin-ad-featured-toggle"
                  checked={isAdFeaturedToggle}
                  onChange={(e) => setIsAdFeaturedToggle(e.target.checked)}
                  className="h-4 w-4 rounded bg-zinc-900 border-zinc-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="admin-ad-featured-toggle" className="text-amber-300 font-bold text-xs cursor-pointer">
                  إظهار بانر الإعلان الترويجي في أعلى صفحة المباريات الرئيسية للمستخدمين 🌟
                </label>
              </div>

              {/* Live Preview Card */}
              <div className="bg-zinc-900/80 p-4 rounded-xl border border-amber-500/30 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 block">👀 معاينة شكل إعلان الرهان للمستخدمين:</span>
                <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-zinc-950 p-4 flex flex-col sm:flex-row items-center gap-4">
                  {adImage ? (
                    <img src={adImage} alt="Ad Preview" className="w-full sm:w-32 h-24 object-cover rounded-lg shrink-0 border border-zinc-800" />
                  ) : (
                    <div className="w-full sm:w-32 h-24 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-lg shrink-0 flex items-center justify-center font-bold text-amber-400 text-xs border border-amber-500/30">
                      ⚽ صورة الإعلان
                    </div>
                  )}
                  <div className="space-y-1 flex-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-black font-black text-[10px] px-2 py-0.5 rounded-full">{adBadge || 'إعلان رهان'}</span>
                      <span className="text-[10px] text-zinc-400">مباراة مميزة</span>
                    </div>
                    <h4 className="font-black text-white text-sm">{adTitle || 'عنوان إعلان الرهان المميز'}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">{adDescription || 'وصف إعلان الرهان للجمهور والمراهنين.'}</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 font-black py-3 text-sm hover:brightness-110 transition-all shadow-xl shadow-amber-500/20"
              >
                🚀 نشر الإعلان الترويجي للرهان وتعميمه فوراً
              </button>
            </form>
          </div>

          {/* Resolve Match Score & Status Form */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 lg:col-span-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Activity className="h-4 w-4 text-amber-400" />
              <span>التحكم في حالة المباراة، تاريخ انعقادها، وتصفية أرباح المراهنين</span>
            </h3>

            {scoreSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>تم تحديث المباراة بنجاح وحسم وتصفية أرباح المراهنين تلقائياً!</span>
              </div>
            )}

            <form onSubmit={handleResolveScoreSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-medium">اختر المباراة المراد تعديل حالتها أو تاريخها أو تسويتها:</label>
                <select
                  value={selectedMatchForScore}
                  onChange={(e) => setSelectedMatchForScore(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                  id="admin-resolve-match-select"
                >
                  {allMatches.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.league}] {m.teamHome} ({m.scoreHome}) ضد {m.teamAway} ({m.scoreAway}) — {m.date} | {m.time} — (الحالة: {m.status === 'scheduled' ? '📅 مجدولة' : m.status === 'live' ? '🔴 بث مباشر' : '🏁 منتهية'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dedicated Winner Determination & Automatic Profit Payout Card */}
              {selectedMatchForScore && (() => {
                const activeMatch = allMatches.find(m => m.id === selectedMatchForScore);
                if (!activeMatch) return null;
                return (
                  <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-4 rounded-xl border border-amber-500/40 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-500/20 pb-2">
                      <span className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                        <Trophy className="h-4 w-4 text-amber-400" />
                        <span>🏆 تحديد الفريق الفائز وتوزيع الأرباح تلقائياً بنقرة واحدة:</span>
                      </span>
                      <span className="text-[10px] text-zinc-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
                        {activeMatch.teamHome} (مضيف) × {activeMatch.teamAway} (ضيف)
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      اختر الفريق الفائز فوراً أدناه لتسجيل النتيجة النهائية، تحويل حالة المباراة إلى (منتهية)، وتوزيع الأرباح والكوينز تلقائياً لجميع المستخدمين الذين راهنوا بصورة صحيحة:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSetWinnerAndSettle(selectedMatchForScore, 'home', 2, 0)}
                        className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black font-black text-xs transition-all shadow-lg flex flex-col items-center justify-center gap-1 group cursor-pointer"
                        title={`تحديد ${activeMatch.teamHome} كفائز وتمرير الأرباح للمراهنين على المضيف`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>🥇</span>
                          <span>فوز {activeMatch.teamHome}</span>
                        </div>
                        <span className="text-[10px] opacity-80 font-normal group-hover:opacity-100">
                          (توزيع أرباح المضيف 🪙)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetWinnerAndSettle(selectedMatchForScore, 'draw', 1, 1)}
                        className="p-3.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500 hover:text-black font-black text-xs transition-all shadow-lg flex flex-col items-center justify-center gap-1 group cursor-pointer"
                        title="تحديد النتيجة كتعادل وتوزيع الأرباح على مراهني التعادل"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>🤝</span>
                          <span>تعادل الفريقين</span>
                        </div>
                        <span className="text-[10px] opacity-80 font-normal group-hover:opacity-100">
                          (توزيع أرباح التعادل 🪙)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetWinnerAndSettle(selectedMatchForScore, 'away', 0, 2)}
                        className="p-3.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/50 hover:bg-blue-500 hover:text-black font-black text-xs transition-all shadow-lg flex flex-col items-center justify-center gap-1 group cursor-pointer"
                        title={`تحديد ${activeMatch.teamAway} كفائز وتمرير الأرباح للمراهنين على الضيف`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>🥇</span>
                          <span>فوز {activeMatch.teamAway}</span>
                        </div>
                        <span className="text-[10px] opacity-80 font-normal group-hover:opacity-100">
                          (توزيع أرباح الضيف 🪙)
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Date & Time Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800">
                <div>
                  <label className="text-amber-400 block mb-1 font-bold">تاريخ المباراة المحدد (Date):</label>
                  <input
                    type="date"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                    id="admin-resolve-match-date"
                  />
                </div>
                <div>
                  <label className="text-amber-400 block mb-1 font-bold">توقيت المباراة (Time):</label>
                  <input
                    type="text"
                    placeholder="20:00"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                    id="admin-resolve-match-time"
                  />
                </div>
              </div>

              {/* Scores & Minutes */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 block border-b border-zinc-800 pb-2">
                  ⚽ تعديل نتيجة الأهداف بدقة لكل فريق:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Home Team Goals */}
                  <div className="bg-zinc-950 p-3 rounded-xl border border-emerald-500/30 space-y-2">
                    <label className="text-emerald-400 block font-bold text-xs">
                      أهداف {selectedMatchForScore ? (allMatches.find(m => m.id === selectedMatchForScore)?.teamHome || 'الفريق المضيف') : 'الفريق المضيف'}:
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setScoreHome(prev => Math.max(0, prev - 1))}
                        className="h-10 w-10 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-black rounded-lg border border-zinc-800 text-lg transition-all active:scale-95 flex items-center justify-center shrink-0"
                        title="إنقاص هدف"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={scoreHome}
                        onChange={(e) => setScoreHome(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 bg-zinc-900 border border-emerald-500/50 rounded-lg p-2 text-center font-black text-xl text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        id="admin-resolve-score-home"
                      />
                      <button
                        type="button"
                        onClick={() => setScoreHome(prev => prev + 1)}
                        className="h-10 w-10 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-lg text-lg transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20"
                        title="إضافة هدف"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Away Team Goals */}
                  <div className="bg-zinc-950 p-3 rounded-xl border border-blue-500/30 space-y-2">
                    <label className="text-blue-400 block font-bold text-xs">
                      أهداف {selectedMatchForScore ? (allMatches.find(m => m.id === selectedMatchForScore)?.teamAway || 'الفريق الضيف') : 'الفريق الضيف'}:
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setScoreAway(prev => Math.max(0, prev - 1))}
                        className="h-10 w-10 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-black rounded-lg border border-zinc-800 text-lg transition-all active:scale-95 flex items-center justify-center shrink-0"
                        title="إنقاص هدف"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={scoreAway}
                        onChange={(e) => setScoreAway(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 bg-zinc-900 border border-blue-500/50 rounded-lg p-2 text-center font-black text-xl text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        id="admin-resolve-score-away"
                      />
                      <button
                        type="button"
                        onClick={() => setScoreAway(prev => prev + 1)}
                        className="h-10 w-10 bg-blue-500 hover:bg-blue-400 text-zinc-950 font-black rounded-lg text-lg transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20"
                        title="إضافة هدف"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Match Minutes */}
                  <div className="bg-zinc-950 p-3 rounded-xl border border-amber-500/30 space-y-2">
                    <label className="text-amber-400 block font-bold text-xs">
                      دقيقة المباراة الحالية (للبث المباشر):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMatchMinutes(prev => Math.max(0, prev - 5))}
                        className="h-10 px-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-bold rounded-lg border border-zinc-800 text-xs transition-all active:scale-95 flex items-center justify-center shrink-0"
                        title="-5 دقائق"
                      >
                        -5د
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={matchMinutes}
                        onChange={(e) => setMatchMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 bg-zinc-900 border border-amber-500/50 rounded-lg p-2 text-center font-black text-xl text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        id="admin-resolve-match-minutes"
                      />
                      <button
                        type="button"
                        onClick={() => setMatchMinutes(prev => Math.min(120, prev + 5))}
                        className="h-10 px-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-bold rounded-lg border border-zinc-800 text-xs transition-all active:scale-95 flex items-center justify-center shrink-0"
                        title="+5 دقائق"
                      >
                        +5د
                      </button>
                    </div>
                  </div>
                </div>

                {/* Score Presets */}
                <div className="pt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-zinc-400 font-bold">نماذج نتيجه سريعة:</span>
                  {[
                    { h: 0, a: 0, label: '0 - 0 (تعادل سلبي)' },
                    { h: 1, a: 0, label: '1 - 0 (فوز المضيف)' },
                    { h: 2, a: 1, label: '2 - 1 (تقدم المضيف)' },
                    { h: 3, a: 0, label: '3 - 0 (ثلاثية)' },
                    { h: 0, a: 1, label: '0 - 1 (فوز الضيف)' },
                    { h: 1, a: 2, label: '1 - 2 (تقدم الضيف)' },
                    { h: 2, a: 2, label: '2 - 2 (تعادل إيجابي)' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setScoreHome(preset.h);
                        setScoreAway(preset.a);
                      }}
                      className="text-[10px] bg-zinc-950 hover:bg-amber-500 hover:text-black text-zinc-300 font-bold px-2 py-1 rounded-lg border border-zinc-800 transition-all"
                    >
                      ⚽ {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-zinc-300 block mb-1 font-bold">حالة المباراة الجارية:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolveStatus('scheduled')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      resolveStatus === 'scheduled'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-md'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    📅 قادمة / مجدولة (Scheduled)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolveStatus('live')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      resolveStatus === 'live'
                        ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-md animate-pulse'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    🔴 جارية الآن (Live)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolveStatus('finished')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      resolveStatus === 'finished'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    🏁 منتهية وتصفية الأرباح (Finished)
                  </button>
                </div>
              </div>

              {/* Active Bets on this Match Stats Banner */}
              {(() => {
                const targetMatchBets = allBets.filter(b => b.matchId === selectedMatchForScore && b.status === 'pending');
                const totalStaked = targetMatchBets.reduce((acc, b) => acc + b.amount, 0);
                return (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-300">
                    <div>
                      <span className="font-bold block">🎯 إحصائيات الرهانات القائمة على هذا اللقاء:</span>
                      <span className="text-[11px] text-zinc-400">
                        {targetMatchBets.length > 0
                          ? `يوجد ${targetMatchBets.length} رهانات معلقة بقيمة إجمالية ${totalStaked} 🪙 سيتلقى أصحاب التوقعات الفائزة أرباحهم فور تحويل المباراة إلى "منتهية".`
                          : 'لا توجد رهانات قائمة معلقة حالياً على هذه المباراة.'}
                      </span>
                    </div>
                    {targetMatchBets.length > 0 && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-black shrink-0">
                        {targetMatchBets.length} رهانات
                      </span>
                    )}
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-500 text-zinc-950 font-black py-3.5 text-xs hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                id="admin-submit-resolve-score"
              >
                <Check className="h-4 w-4" />
                <span>حفظ التعديلات وتصفية أرباح المراهنين 🏆</span>
              </button>
            </form>
          </div>

          {/* Quick All Matches List & Direct Control Panel */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>جدول جميع المباريات والتحكم السريع في الحالة والتصفية</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  تغيير حالة أية مباراة بنقرة واحدة، تحديث تواريخها، وإخفائها تلقائياً من صفحة المستخدمين فور انتهائها
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg font-bold">
                  {allMatches.filter(m => m.status === 'scheduled').length} قادمة
                </span>
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg font-bold">
                  {allMatches.filter(m => m.status === 'live').length} مباشر
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-bold">
                  {allMatches.filter(m => m.status === 'finished').length} منتهية
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {allMatches.map(m => {
                const matchBets = allBets.filter(b => b.matchId === m.id);
                const pendingBets = matchBets.filter(b => b.status === 'pending');
                const wonBets = matchBets.filter(b => b.status === 'won');

                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      m.id === selectedMatchForScore
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-zinc-900/50 border-zinc-900 hover:border-zinc-800'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {m.league}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          m.status === 'scheduled'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : m.status === 'live'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {m.status === 'scheduled' ? '📅 مجدولة' : m.status === 'live' ? `🔴 مباشر (${m.minutes || 0}')` : '🏁 منتهية (مخفية من المستخدمين)'}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          🗓️ {m.date} | ⏰ {m.time}
                        </span>
                      </div>

                      <div className="text-sm font-black text-white flex items-center gap-3 flex-wrap">
                        {/* Home Team Goals Quick Control */}
                        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-emerald-500/30">
                          <span className="text-xs text-emerald-400 font-bold px-1">{m.teamHome}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateMatchScore(m.id, Math.max(0, (m.scoreHome || 0) - 1), m.scoreAway || 0, m.status, m.date, m.time, m.minutes)}
                            className="h-6 w-6 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-black rounded text-xs transition-all flex items-center justify-center"
                            title={`إنقاص هدف من ${m.teamHome}`}
                          >
                            -
                          </button>
                          <span className="text-emerald-400 font-mono font-black text-sm px-1.5">{m.scoreHome ?? 0}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateMatchScore(m.id, (m.scoreHome || 0) + 1, m.scoreAway || 0, m.status, m.date, m.time, m.minutes)}
                            className="h-6 w-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded text-xs transition-all flex items-center justify-center shadow-sm"
                            title={`إضافة هدف لـ ${m.teamHome}`}
                          >
                            +
                          </button>
                        </div>

                        <span className="text-zinc-500 font-bold text-xs">مقالبل</span>

                        {/* Away Team Goals Quick Control */}
                        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-blue-500/30">
                          <button
                            type="button"
                            onClick={() => onUpdateMatchScore(m.id, m.scoreHome || 0, (m.scoreAway || 0) + 1, m.status, m.date, m.time, m.minutes)}
                            className="h-6 w-6 bg-blue-500 hover:bg-blue-400 text-zinc-950 font-black rounded text-xs transition-all flex items-center justify-center shadow-sm"
                            title={`إضافة هدف لـ ${m.teamAway}`}
                          >
                            +
                          </button>
                          <span className="text-blue-400 font-mono font-black text-sm px-1.5">{m.scoreAway ?? 0}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateMatchScore(m.id, m.scoreHome || 0, Math.max(0, (m.scoreAway || 0) - 1), m.status, m.date, m.time, m.minutes)}
                            className="h-6 w-6 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-black rounded text-xs transition-all flex items-center justify-center"
                            title={`إنقاص هدف من ${m.teamAway}`}
                          >
                            -
                          </button>
                          <span className="text-xs text-blue-400 font-bold px-1">{m.teamAway}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-zinc-400 flex items-center gap-3">
                        <span>إجمالي الرهانات: <strong className="text-white">{matchBets.length}</strong></span>
                        {pendingBets.length > 0 && (
                          <span className="text-amber-400 font-bold">معلقة: {pendingBets.length}</span>
                        )}
                        {wonBets.length > 0 && (
                          <span className="text-emerald-400 font-bold">فائزة ومصفاة: {wonBets.length}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedMatchForScore(m.id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
                      >
                        ✏️ اختيار للتعديل
                      </button>

                      {m.status !== 'scheduled' && (
                        <button
                          type="button"
                          onClick={() => onUpdateMatchScore(m.id, m.scoreHome || 0, m.scoreAway || 0, 'scheduled', m.date, m.time, m.minutes)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold hover:bg-blue-500/20 transition-all"
                        >
                          📅 تحويل لمجدولة
                        </button>
                      )}

                      {m.status !== 'live' && (
                        <button
                          type="button"
                          onClick={() => onUpdateMatchScore(m.id, m.scoreHome || 0, m.scoreAway || 0, 'live', m.date, m.time, m.minutes || 1)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all"
                        >
                          🔴 بدء بث مباشر
                        </button>
                      )}

                      {m.status !== 'finished' && (
                        <div className="flex items-center gap-1 bg-zinc-950 p-1.5 rounded-xl border border-amber-500/30 flex-wrap">
                          <span className="text-[10px] text-amber-400 font-black px-1">🏆 تحديد الفائز وتوزيع الأرباح:</span>
                          <button
                            type="button"
                            onClick={() => handleSetWinnerAndSettle(m.id, 'home', 2, 0)}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black text-[10px] font-bold transition-all border border-emerald-500/30"
                            title={`تحديد ${m.teamHome} كفائز وتوزيع الأرباح للمراهنين على المضيف`}
                          >
                            🥇 {m.teamHome}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetWinnerAndSettle(m.id, 'draw', 1, 1)}
                            className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black text-[10px] font-bold transition-all border border-amber-500/30"
                            title="تحديد تعادل الفريقين وتوزيع الأرباح"
                          >
                            🤝 تعادل
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetWinnerAndSettle(m.id, 'away', 0, 2)}
                            className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500 hover:text-black text-[10px] font-bold transition-all border border-blue-500/30"
                            title={`تحديد ${m.teamAway} كفائز وتوزيع الأرباح للمراهنين على الضيف`}
                          >
                            🥇 {m.teamAway}
                          </button>
                        </div>
                      )}

                      {m.status !== 'finished' && (
                        <button
                          type="button"
                          onClick={() => onUpdateMatchScore(m.id, m.scoreHome || 0, m.scoreAway || 0, 'finished', m.date, m.time, m.minutes)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-black hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1"
                        >
                          💰 إنهاء بالنتيجة الحالية
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* TAB: SPORTS CATEGORIES MANAGEMENT */}
      {adminTab === 'sports-categories' && (
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span>إدارة تصنيفات الأحداث الرياضية</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                يمكنك إضافة تصنيفات جديدة (مثل: كرة قدم، كرة سلة، تنس، كرة يد) أو تعديل أسمائها وأيقوناتها وحذفها لتغيير خيارات التصفية على MainPage.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-zinc-900 text-amber-400 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
                {sportsCategories.length} تصنيفات نشطة
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form to Add New Category */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 lg:col-span-1 h-fit">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
                <PlusCircle className="h-4 w-4 text-emerald-400" />
                <span>إضافة تصنيف رياضي جديد</span>
              </h4>

              {catAddSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>تمت إضافة التصنيف الرياضي بنجاح!</span>
                </div>
              )}

              <form onSubmit={handleCreateCategorySubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">اسم التصنيف (مثال: كرة القدم، الشطرنج):</label>
                  <input
                    type="text"
                    placeholder="مثال: كرة الطائرة الشاطئية"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-bold"
                    required
                    id="admin-new-cat-name"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">الأيقونة / الرمز التعبيري (Emoji):</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="⚽"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-20 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-center text-lg text-white focus:outline-none focus:border-emerald-500"
                      required
                      id="admin-new-cat-icon"
                    />
                    <div className="flex gap-1 flex-wrap text-sm">
                      {['⚽', '🏀', '🎾', '🏐', '🏉', '🏈', '⚾', '🥎', '🏓', '🏸', '🥊', '🎮', '🏎️', '⛳'].map(preset => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setNewCatIcon(preset)}
                          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">المعرّف الكودي الفريد (ID) - اختياري:</label>
                  <input
                    type="text"
                    placeholder="يتم التوليد تلقائياً إن تركته فارغاً"
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 font-mono text-[11px] placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    id="admin-new-cat-id"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">وصف مختصر للتصنيف:</label>
                  <textarea
                    rows={2}
                    placeholder="وصف للبطولات التابعة لهذا التصنيف..."
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    id="admin-new-cat-desc"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-500 text-zinc-950 font-bold py-2.5 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                  id="admin-submit-new-cat-btn"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>إضافة التصنيف الرياضي</span>
                </button>
              </form>
            </div>

            {/* Existing Categories Table & Edit Modal/Inline */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-amber-400" />
                  <span>تصنيفات الرياضات الحالية وتعديل المسميات</span>
                </h4>
                {catEditSuccess && (
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    ✓ تم حفظ التعديلات بنجاح
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                      <th className="py-2.5 px-3">الأيقونة والاسم</th>
                      <th className="py-2.5 px-3">المعرف الكودي (ID)</th>
                      <th className="py-2.5 px-3">الوصف</th>
                      <th className="py-2.5 px-3 text-center">المباريات المرتبطة</th>
                      <th className="py-2.5 px-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {sportsCategories.map(cat => {
                      const matchCount = allMatches.filter(m => m.sport === cat.id).length;
                      const isEditing = editingCatId === cat.id;

                      if (isEditing) {
                        return (
                          <tr key={cat.id} className="bg-amber-500/5">
                            <td colSpan={5} className="p-4">
                              <form onSubmit={handleSaveCategoryEdit} className="space-y-3 bg-zinc-900/90 p-4 rounded-xl border border-amber-500/30">
                                <div className="flex items-center justify-between text-amber-400 font-bold text-xs">
                                  <span>تعديل تصنيف: {cat.name} ({cat.id})</span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCatId(null)}
                                    className="text-zinc-500 hover:text-white"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <label className="text-zinc-400 text-[10px] block mb-1">اسم التصنيف:</label>
                                    <input
                                      type="text"
                                      value={editCatName}
                                      onChange={(e) => setEditCatName(e.target.value)}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white font-bold"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="text-zinc-400 text-[10px] block mb-1">الأيقونة (Emoji):</label>
                                    <input
                                      type="text"
                                      value={editCatIcon}
                                      onChange={(e) => setEditCatIcon(e.target.value)}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-center text-white text-base font-bold"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="text-zinc-400 text-[10px] block mb-1">الوصف:</label>
                                    <input
                                      type="text"
                                      value={editCatDesc}
                                      onChange={(e) => setEditCatDesc(e.target.value)}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCatId(null)}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700"
                                  >
                                    إلغاء
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 flex items-center gap-1"
                                  >
                                    <Save className="h-3.5 w-3.5" />
                                    <span>حفظ التغييرات</span>
                                  </button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={cat.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="py-3 px-3 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{cat.icon || '🏆'}</span>
                              <span className="text-emerald-400 font-extrabold">{cat.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-zinc-400">
                            {cat.id}
                          </td>
                          <td className="py-3 px-3 text-zinc-400 text-[11px]">
                            {cat.description || '—'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="bg-zinc-900 text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] border border-zinc-800">
                              {matchCount} مباريات
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleStartEditCategory(cat)}
                                className="bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
                                title="تعديل اسم أو أيقونة التصنيف"
                                id={`edit-cat-${cat.id}`}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>تعديل</span>
                              </button>
                              {onDeleteSportCategory && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`هل أنت تأكد من حذف تصنيف "${cat.name}"؟`)) {
                                      onDeleteSportCategory(cat.id);
                                    }
                                  }}
                                  className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                                  title="حذف التصنيف"
                                  id={`delete-cat-${cat.id}`}
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

      {/* TAB: GUIDE & INSTRUCTIONS MANAGEMENT */}
      {adminTab === 'guide-management' && (
        <section className="space-y-6">
          {/* Header & Main Control Buttons */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-400" />
                <span>متابعة وتعديل صفحة التعليمات ودليل المبتدئين</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                يمكنك التعديل الكامل على أقسام الدليل، إضافة أو حذف إرشادات الشحن، الرهانات العامة، وطريقة عمل منصة التوقعات.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAddingNewCategory(true)}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                id="add-new-guide-cat-btn"
              >
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>إضافة قسم جديد</span>
              </button>

              <button
                onClick={() => handleSaveGuideCategories(editingGuideCategories)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                id="save-guide-changes-btn"
              >
                <Save className="h-4 w-4" />
                <span>حفظ وتثبيت الدليل</span>
              </button>
            </div>
          </div>

          {guideSaveSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="h-4 w-4" />
              <span>تم حفظ وتحديث كافة تعليمات إرشادات المبتدئين بنجاح! تظهر الآن مباشرة لكافة المستخدمين.</span>
            </div>
          )}

          {/* Form to add new Category */}
          {addingNewCategory && (
            <div className="bg-zinc-950 border border-emerald-500/30 p-5 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>إضافة قسم تعليمي جديد ➕</span>
                <button 
                  onClick={() => setAddingNewCategory(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">عنوان القسم</label>
                  <input
                    type="text"
                    value={newGuideCatTitle}
                    onChange={(e) => setNewGuideCatTitle(e.target.value)}
                    placeholder="مثال: كيفية سحب الأرباح"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">رمز الأيقونة</label>
                  <select
                    value={newGuideCatIcon}
                    onChange={(e) => setNewGuideCatIcon(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Wallet">محفظة (Wallet)</option>
                    <option value="Target">هدف/رهان (Target)</option>
                    <option value="TrendingUp">نمو/أودز (TrendingUp)</option>
                    <option value="HelpCircle">أسئلة شائعة (HelpCircle)</option>
                    <option value="Coins">عملات/كوينز (Coins)</option>
                    <option value="ShieldCheck">أمان/حماية (ShieldCheck)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">وصف مختصر للقسم</label>
                  <input
                    type="text"
                    value={newGuideCatDesc}
                    onChange={(e) => setNewGuideCatDesc(e.target.value)}
                    placeholder="وصف توضيحي للقسم..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setAddingNewCategory(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-extrabold"
                >
                  إضافة القسم
                </button>
              </div>
            </div>
          )}

          {/* Categories & Steps List */}
          <div className="space-y-6">
            {editingGuideCategories.map((cat, catIdx) => (
              <div key={cat.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
                
                {/* Category Header Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-4 gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center">
                      {catIdx + 1}
                    </span>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cat.title}
                        onChange={(e) => handleUpdateCategoryField(cat.id, 'title', e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm font-extrabold text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={cat.description}
                        onChange={(e) => handleUpdateCategoryField(cat.id, 'description', e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => setAddingStepForCatId(cat.id)}
                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>إضافة خطوة</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                      title="حذف هذا القسم بالكامل"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Form to add a new step inside this category */}
                {addingStepForCatId === cat.id && (
                  <div className="bg-zinc-900/60 border border-emerald-500/30 p-4 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                      <span>إضافة خطوة جديدة لـ "{cat.title}"</span>
                      <button onClick={() => setAddingStepForCatId(null)}>
                        <X className="h-3.5 w-3.5 text-zinc-500 hover:text-white" />
                      </button>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="عنوان الخطوة (مثال: أرسل المبلغ عبر فودافون كاش)"
                        value={newStepTitle}
                        onChange={(e) => setNewStepTitle(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-white"
                      />
                      <input
                        type="text"
                        placeholder="وسام جانبي (مثال: الخطوة الأولى)"
                        value={newStepBadge}
                        onChange={(e) => setNewStepBadge(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-300"
                      />
                      <textarea
                        rows={2}
                        placeholder="محتوى الإرشاد بالتفصيل..."
                        value={newStepContent}
                        onChange={(e) => setNewStepContent(e.target.value)}
                        className="md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white"
                      />
                      <select
                        value={newStepActionType}
                        onChange={(e) => setNewStepActionType(e.target.value as any)}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-zinc-300"
                      >
                        <option value="none">بدون زر اختصار تفاعلي</option>
                        <option value="deposit">زر فتح نافذة الإيداع 💳</option>
                        <option value="withdraw">زر فتح نافذة سحب الأرباح 💸</option>
                        <option value="public_bets">زر الانتقال للرهانات العامة 🎯</option>
                        <option value="events">زر الانتقال لجدول المباريات ⚽</option>
                      </select>
                      {newStepActionType !== 'none' && (
                        <input
                          type="text"
                          placeholder="نص الزر (مثال: افتح نافذة الإيداع الآن)"
                          value={newStepActionLabel}
                          onChange={(e) => setNewStepActionLabel(e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-white"
                        />
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setAddingStepForCatId(null)}
                        className="px-3 py-1 rounded bg-zinc-950 text-zinc-400 text-xs"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleAddStepToCategory(cat.id)}
                        className="px-4 py-1 rounded bg-emerald-500 text-zinc-950 font-bold text-xs"
                      >
                        حفظ الخطوة
                      </button>
                    </div>
                  </div>
                )}

                {/* Steps List */}
                <div className="space-y-3">
                  {cat.steps.map((step, stepIdx) => (
                    <div key={step.id} className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            خطوة {stepIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => handleUpdateStepField(cat.id, step.id, 'title', e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <button
                          onClick={() => handleDeleteStep(cat.id, step.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                          title="حذف هذه الخطوة"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={step.content}
                        onChange={(e) => handleUpdateStepField(cat.id, step.id, 'content', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-0.5">وسام التمييز (اختياري)</label>
                          <input
                            type="text"
                            value={step.badgeText || ''}
                            onChange={(e) => handleUpdateStepField(cat.id, step.id, 'badgeText', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-0.5">نوع اختصار العمل</label>
                          <select
                            value={step.actionType || 'none'}
                            onChange={(e) => handleUpdateStepField(cat.id, step.id, 'actionType', e.target.value === 'none' ? undefined : e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 text-[11px]"
                          >
                            <option value="none">بدون زر اختصار</option>
                            <option value="deposit">زر فتح نافذة الإيداع 💳</option>
                            <option value="withdraw">زر فتح نافذة سحب الأرباح 💸</option>
                            <option value="public_bets">زر الانتقال للرهانات العامة 🎯</option>
                            <option value="events">زر الانتقال لجدول المباريات ⚽</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-0.5">عنوان زر الإجراء</label>
                          <input
                            type="text"
                            value={step.actionLabel || ''}
                            onChange={(e) => handleUpdateStepField(cat.id, step.id, 'actionLabel', e.target.value)}
                            placeholder="مثال: شحن الحساب الآن"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 text-[11px]"
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => handleSaveGuideCategories(editingGuideCategories)}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>حفظ وتطبيق التغييرات على دليل المبتدئين</span>
            </button>
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
