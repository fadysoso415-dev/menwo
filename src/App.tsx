import React, { useState, useEffect } from 'react';
import { User, Match, Bet, Notification, ChatMessage, DepositRequest, PublicBetOffer, WithdrawalRequest, LeagueStandingItem, SportCategory, GuideCategory } from './types';
import { 
  DEFAULT_USERS, 
  INITIAL_MATCHES, 
  INITIAL_BETS,
  INITIAL_PUBLIC_BETS,
  INITIAL_LEAGUE_STANDINGS,
  INITIAL_SPORTS_CATEGORIES,
  INITIAL_GUIDE_CATEGORIES
} from './data/defaultData';
import { 
  subscribeToMatches, 
  subscribeToBets, 
  saveMatchToFirestore, 
  seedMatchesIfEmpty, 
  saveBetToFirestore, 
  updateBetInFirestore, 
  deleteBetFromFirestore, 
  seedBetsIfEmpty,
  saveUserToFirestore,
  subscribeToUsers,
  subscribeToPublicBets,
  savePublicBetToFirestore,
  deletePublicBetFromFirestore
} from './lib/firestoreService';

// Component Imports
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import MainPage from './components/MainPage';
import EventsPage from './components/EventsPage';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import SignUpPage from './components/SignUpPage';
import Chatbot from './components/Chatbot';
import CashDepositModal from './components/CashDepositModal';
import WithdrawModal from './components/WithdrawModal';
import ToastContainer, { ToastItem } from './components/ToastContainer';
import MobileBottomNav from './components/MobileBottomNav';
import BetConfirmationModal from './components/BetConfirmationModal';
import QuickBetModal from './components/QuickBetModal';

import { Trophy, Coins, MessageSquare, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [tabHistory, setTabHistory] = useState<string[]>(['home']);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Toast Notifications state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Bet Confirmation Modal state
  const [confirmedBetModalData, setConfirmedBetModalData] = useState<{
    bet: Bet;
    match: Match;
    userRemainingBalance: number;
  } | null>(null);
  
  // Storage states
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [publicBetOffers, setPublicBetOffers] = useState<PublicBetOffer[]>([]);
  const [leagueStandings, setLeagueStandings] = useState<LeagueStandingItem[]>([]);
  const [sportsCategories, setSportsCategories] = useState<SportCategory[]>([]);
  const [guideCategories, setGuideCategories] = useState<GuideCategory[]>([]);
  
  // Cash Wallet & Deposit / Withdrawal Requests states
  const [cashWalletNumber, setCashWalletNumber] = useState<string>('01012345678');
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);

  // UI Modals / Toggles
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCashDepositOpen, setIsCashDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isQuickBetModalOpen, setIsQuickBetModalOpen] = useState(false);
  const [quickBetModalMatch, setQuickBetModalMatch] = useState<Match | null>(null);
  const [quickBetModalOutcome, setQuickBetModalOutcome] = useState<'home' | 'draw' | 'away'>('home');


  // Initialize data and set up real-time Firestore listeners for Matches, Bets, Users, and Public Bets
  useEffect(() => {
    // Seed initial matches and bets if Firestore collections are empty
    seedMatchesIfEmpty(INITIAL_MATCHES);
    seedBetsIfEmpty(INITIAL_BETS);

    // Real-time listener for Matches from Firestore
    const unsubMatches = subscribeToMatches((realtimeMatches) => {
      if (realtimeMatches.length > 0) {
        setMatches(realtimeMatches);
      } else {
        setMatches(INITIAL_MATCHES);
      }
    });

    // Real-time listener for Bets from Firestore
    const unsubBets = subscribeToBets((realtimeBets) => {
      setBets(realtimeBets);
    });

    // Real-time listener for Users
    const unsubUsers = subscribeToUsers((realtimeUsers) => {
      if (realtimeUsers.length > 0) {
        const updated = realtimeUsers.map(u => 
          (u.email.toLowerCase() === 'fadysoso415@gmail.com' || u.email.toLowerCase() === 'admin@stad.com') ? { ...u, isAdmin: true } : u
        );
        setAllUsers(updated);
      }
    });

    // Real-time listener for Public Bets
    const unsubPublicBets = subscribeToPublicBets((realtimeOffers) => {
      if (realtimeOffers.length > 0) {
        setPublicBetOffers(realtimeOffers);
      }
    });

    // Fallback users from local storage
    const savedUsers = localStorage.getItem('stad_users');
    if (savedUsers) {
      const parsed: User[] = JSON.parse(savedUsers);
      const updated = parsed.map(u => 
        (u.email.toLowerCase() === 'fadysoso415@gmail.com' || u.email.toLowerCase() === 'admin@stad.com') ? { ...u, isAdmin: true } : u
      );
      setAllUsers(updated);
    } else {
      setAllUsers(DEFAULT_USERS);
      localStorage.setItem('stad_users', JSON.stringify(DEFAULT_USERS));
    }

    // Active user session
    const savedActiveUser = localStorage.getItem('stad_active_user');
    if (savedActiveUser) {
      try {
        const parsedUser: User = JSON.parse(savedActiveUser);
        if (parsedUser.email.toLowerCase() === 'fadysoso415@gmail.com' || parsedUser.email.toLowerCase() === 'admin@stad.com') {
          parsedUser.isAdmin = true;
        }
        setCurrentUser(parsedUser);
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }

    // Local notifications, chat history, cash wallet, etc.
    const savedNotifs = localStorage.getItem('stad_notifications');
    if (savedNotifs) {
      try {
        const parsed: Notification[] = JSON.parse(savedNotifs);
        const unique = parsed.filter((notif, index, self) => index === self.findIndex(n => n.id === notif.id));
        setNotifications(unique);
      } catch (e) {
        setNotifications([]);
      }
    } else {
      const initialNotifs: Notification[] = [
        {
          id: 'notif-1',
          userId: 'user-1',
          title: '👋 مرحباً بك في منصة مينوو!',
          message: 'أهلاً بك في المنصة! يمكنك الآن شحن محفظتك، والمشاركة في التحديات، وتوقع نتائج مبارياتك المفضلة.',
          read: false,
          type: 'system',
          createdAt: new Date().toISOString()
        }
      ];
      setNotifications(initialNotifs);
      localStorage.setItem('stad_notifications', JSON.stringify(initialNotifs));
    }

    const savedChat = localStorage.getItem('stad_chat_history');
    if (savedChat) {
      setChatHistory(JSON.parse(savedChat));
    }

    const savedCashNumber = localStorage.getItem('stad_cash_wallet_number');
    if (savedCashNumber) {
      setCashWalletNumber(savedCashNumber);
    } else {
      localStorage.setItem('stad_cash_wallet_number', '01012345678');
    }

    const savedDepositReqs = localStorage.getItem('stad_deposit_requests');
    if (savedDepositReqs) {
      setDepositRequests(JSON.parse(savedDepositReqs));
    }

    const savedWithdrawReqs = localStorage.getItem('stad_withdrawal_requests');
    if (savedWithdrawReqs) {
      setWithdrawalRequests(JSON.parse(savedWithdrawReqs));
    }

    const savedStandings = localStorage.getItem('stad_league_standings');
    if (savedStandings) {
      setLeagueStandings(JSON.parse(savedStandings));
    } else {
      setLeagueStandings(INITIAL_LEAGUE_STANDINGS);
    }

    const savedSportsCats = localStorage.getItem('stad_sports_categories');
    if (savedSportsCats) {
      setSportsCategories(JSON.parse(savedSportsCats));
    } else {
      setSportsCategories(INITIAL_SPORTS_CATEGORIES);
    }

    const savedGuide = localStorage.getItem('stad_guide_categories');
    if (savedGuide) {
      setGuideCategories(JSON.parse(savedGuide));
    } else {
      setGuideCategories(INITIAL_GUIDE_CATEGORIES);
    }

    return () => {
      unsubMatches();
      unsubBets();
      unsubUsers();
      unsubPublicBets();
    };
  }, []);

  // Handler for Beginner Guide Management
  const handleUpdateGuideCategories = (newCategories: GuideCategory[]) => {
    setGuideCategories(newCategories);
    localStorage.setItem('stad_guide_categories', JSON.stringify(newCategories));
    triggerNotification('📖 دليل المبتدئين والتعليمات', 'تم تحديث صفحة التعليمات ودليل المبتدئين بنجاح!', 'system');
  };

  // Handlers for Sports Categories Management
  const handleAddSportCategory = (newCat: SportCategory) => {
    const updated = [...sportsCategories, newCat];
    setSportsCategories(updated);
    localStorage.setItem('stad_sports_categories', JSON.stringify(updated));
    triggerNotification('🏆 تصنيفات الرياضات', `تمت إضافة تصنيف الرياضة "${newCat.name}" بنجاح`, 'system');
  };

  const handleUpdateSportCategory = (catId: string, updatedFields: Partial<SportCategory>) => {
    const updated = sportsCategories.map(c => c.id === catId ? { ...c, ...updatedFields } : c);
    setSportsCategories(updated);
    localStorage.setItem('stad_sports_categories', JSON.stringify(updated));
    triggerNotification('🏆 تصنيفات الرياضات', `تم تحديث تصنيف الرياضة بنجاح`, 'system');
  };

  const handleDeleteSportCategory = (catId: string) => {
    const updated = sportsCategories.filter(c => c.id !== catId);
    setSportsCategories(updated);
    localStorage.setItem('stad_sports_categories', JSON.stringify(updated));
    triggerNotification('🏆 تصنيفات الرياضات', `تم حذف تصنيف الرياضة بنجاح`, 'system');
  };

  // Handler to Update League Standings from Admin Panel
  const handleUpdateLeagueStandings = (updatedStandings: LeagueStandingItem[]) => {
    setLeagueStandings(updatedStandings);
    localStorage.setItem('stad_league_standings', JSON.stringify(updatedStandings));
    triggerNotification('🛡️ تحديث صدارة الدوريات', 'تم تحديث وتأمين ترتيب صدارة الدوريات وختم حماية المتصدر بنجاح!', 'system');
  };

  // Handler to Clear & Wipe Demo/Test Data from Platform
  const handleClearDemoData = () => {
    // 1. Clear test bets
    setBets([]);
    localStorage.setItem('stad_bets', JSON.stringify([]));

    // 2. Clear deposit requests
    setDepositRequests([]);
    localStorage.setItem('stad_deposit_requests', JSON.stringify([]));

    // 3. Clear withdrawal requests
    setWithdrawalRequests([]);
    localStorage.setItem('stad_withdrawal_requests', JSON.stringify([]));

    // 4. Notify admin
    triggerNotification('🧹 تصفية البيانات التجريبية', 'تمت تصفية ومسح جميع البيانات والرهانات والطلبات التجريبية للمنصة بنجاح!', 'system');
  };

  // Handlers for Cash Deposit Management
  const handleUpdateCashWalletNumber = (newNumber: string) => {
    setCashWalletNumber(newNumber);
    localStorage.setItem('stad_cash_wallet_number', newNumber);
    triggerNotification('📲 تحديث رقم المحفظة', `تم تحديث رقم محفظة الكاش المعتمدة للتحويلات إلى: ${newNumber}`, 'system');
  };

  // Handlers for Withdrawal Requests (سحب الأرباح)
  const handleSubmitWithdrawalRequest = (amountCoins: number, receiverPhone: string) => {
    if (!currentUser) return;

    if (currentUser.balance < amountCoins || amountCoins <= 0) {
      triggerNotification('🔴 رصيد غير كافٍ', `عذراً، رصيدك المالي الحالي (${currentUser.balance} 🪙) غير كافٍ لسحب ${amountCoins} كوينز.`, 'system');
      return;
    }

    // 1. Deduct coins from user balance right away so they cannot double spend
    const updatedUser = {
      ...currentUser,
      balance: Math.max(0, currentUser.balance - amountCoins)
    };

    updateCurrentUserAndState(updatedUser);

    // 2. Create withdrawal request
    const newReq: WithdrawalRequest = {
      id: `wreq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      amountCoins,
      amountEgp: amountCoins,
      receiverPhone,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setWithdrawalRequests(prev => {
      const next = [newReq, ...prev];
      localStorage.setItem('stad_withdrawal_requests', JSON.stringify(next));
      return next;
    });

    triggerNotification(
      '⏳ جاري مراجعة طلب سحب الأرباح',
      `تم خصم واقتطاع ${amountCoins} 🪙 كوينز من محفظتك وتقديم طلب سحب بمبلغ ${amountCoins} ج.م كاش على رقم ${receiverPhone}. طلبك قيد المراجعة واعتماد الأدمن.`,
      'system'
    );
  };

  const handleApproveWithdrawalRequest = (requestId: string) => {
    setWithdrawalRequests(prev => {
      const targetReq = prev.find(r => r.id === requestId);
      if (!targetReq || targetReq.status === 'approved') return prev;

      // Update Firestore / state for target user balance confirmation
      setAllUsers(uList => {
        const uNext = uList.map(u => {
          if (u.id === targetReq.userId) {
            saveUserToFirestore(u);
            if (currentUser?.id === u.id) {
              setCurrentUser(u);
              localStorage.setItem('stad_active_user', JSON.stringify(u));
            }
          }
          return u;
        });
        localStorage.setItem('stad_users', JSON.stringify(uNext));
        return uNext;
      });

      const next = prev.map(r => r.id === requestId ? { ...r, status: 'approved' as const } : r);
      localStorage.setItem('stad_withdrawal_requests', JSON.stringify(next));

      triggerNotification(
        '💸 تم اعتماد السحب وتأكيد الخصم!',
        `تمت موافقة الأدمن وتأكيد خصم ${targetReq.amountCoins} 🪙 كوينز من محفظتك وتحويل مبلغ ${targetReq.amountEgp} ج.م كاش إلى محفظتك رقم ${targetReq.receiverPhone}.`,
        'system'
      );

      return next;
    });
  };

  const handleRejectWithdrawalRequest = (requestId: string, adminNote?: string) => {
    setWithdrawalRequests(prev => {
      const targetReq = prev.find(r => r.id === requestId);
      if (!targetReq || targetReq.status === 'rejected') return prev;

      // Refund the held coins back to user
      setAllUsers(uList => {
        const uNext = uList.map(u => {
          if (u.id === targetReq.userId) {
            const updated = { ...u, balance: u.balance + targetReq.amountCoins };
            saveUserToFirestore(updated);
            if (currentUser?.id === u.id) {
              setCurrentUser(updated);
              localStorage.setItem('stad_active_user', JSON.stringify(updated));
            }
            return updated;
          }
          return u;
        });
        localStorage.setItem('stad_users', JSON.stringify(uNext));
        return uNext;
      });

      const next = prev.map(r => r.id === requestId ? { ...r, status: 'rejected' as const, adminNote } : r);
      localStorage.setItem('stad_withdrawal_requests', JSON.stringify(next));

      triggerNotification(
        '❌ تم رفض طلب سحب الأرباح',
        `تم رفض طلب السحب وإعادة ${targetReq.amountCoins} 🪙 كوينز إلى محفظتك مرة أخرى.`,
        'system'
      );

      return next;
    });
  };

  const handleDeleteWithdrawalRequest = (requestId: string) => {
    setWithdrawalRequests(prev => {
      const next = prev.filter(r => r.id !== requestId);
      localStorage.setItem('stad_withdrawal_requests', JSON.stringify(next));
      return next;
    });
  };

  const handleSubmitDepositRequest = (request: DepositRequest) => {
    setDepositRequests(prev => {
      const next = [request, ...prev];
      localStorage.setItem('stad_deposit_requests', JSON.stringify(next));
      return next;
    });

    triggerNotification(
      '⏳ إرسال طلب شحن رصيد',
      `تم استلام طلب شحن ${request.amountEgp} ج.م (${request.coinsRequested} 🪙). جاري مراجعة صورة الإيصال من الإدارة لتأكيد زيادة المحفظة.`,
      'system'
    );
  };

  const handleApproveDepositRequest = (requestId: string) => {
    setDepositRequests(prev => {
      const targetReq = prev.find(r => r.id === requestId);
      if (!targetReq || targetReq.status === 'approved') return prev;

      // 1. Credit coins to user's balance & sync to Firestore and state
      setAllUsers(uList => {
        const uNext = uList.map(u => {
          if (u.id === targetReq.userId) {
            const updated = { ...u, balance: u.balance + targetReq.coinsRequested };
            saveUserToFirestore(updated);
            if (currentUser?.id === u.id) {
              setCurrentUser(updated);
              localStorage.setItem('stad_active_user', JSON.stringify(updated));
            }
            return updated;
          }
          return u;
        });
        localStorage.setItem('stad_users', JSON.stringify(uNext));
        return uNext;
      });

      // 2. Update request status
      const updatedReqs = prev.map(r => r.id === requestId ? { ...r, status: 'approved' as const } : r);
      localStorage.setItem('stad_deposit_requests', JSON.stringify(updatedReqs));

      // 3. Trigger notification
      triggerNotification(
        '🎉 تم تأكيد اعتماد الشحن وزيادة الكوينز!',
        `تمت موافقة الأدمن على طلب الشحن وزيادة +${targetReq.coinsRequested} 🪙 كوينز في محفظتك بنجاح مقابل ${targetReq.amountEgp} ج.م!`,
        'system'
      );

      return updatedReqs;
    });
  };

  const handleRejectDepositRequest = (requestId: string, adminNote?: string) => {
    setDepositRequests(prev => {
      const targetReq = prev.find(r => r.id === requestId);
      if (!targetReq) return prev;

      const updatedReqs = prev.map(r => 
        r.id === requestId ? { ...r, status: 'rejected' as const, adminNote: adminNote || 'تعذر التأكد من صحة إيصال التحويل.' } : r
      );
      localStorage.setItem('stad_deposit_requests', JSON.stringify(updatedReqs));

      triggerNotification(
        '🔴 تم رفض طلب الشحن',
        `عذراً، تم رفض طلب الشحن لمبلغ ${targetReq.amountEgp} ج.م. ${adminNote ? `ملاحظة: ${adminNote}` : ''}`,
        'system'
      );

      return updatedReqs;
    });
  };

  const handleDeleteDepositRequest = (requestId: string) => {
    setDepositRequests(prev => {
      const next = prev.filter(r => r.id !== requestId);
      localStorage.setItem('stad_deposit_requests', JSON.stringify(next));
      return next;
    });
  };

  // Selected Match State (used for Event page sync)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Synchronize active user state to allUsers array and LocalStorage & Firestore
  const updateCurrentUserAndState = (updatedUser: User | null) => {
    setCurrentUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('stad_active_user', JSON.stringify(updatedUser));
      setAllUsers(prev => {
        const next = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
        localStorage.setItem('stad_users', JSON.stringify(next));
        return next;
      });
      saveUserToFirestore(updatedUser);
    } else {
      localStorage.removeItem('stad_active_user');
    }
  };

  // Helper: Post a live Notification to current user
  const triggerNotification = (title: string, message: string, type: 'bet' | 'match' | 'system') => {
    if (!currentUser) return;
    const uniqueId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${Math.floor(Math.random() * 1000000)}`;
    const newNotif: Notification = {
      id: uniqueId,
      userId: currentUser.id,
      title,
      message,
      read: false,
      type,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== newNotif.id);
      const next = [newNotif, ...filtered];
      localStorage.setItem('stad_notifications', JSON.stringify(next));
      return next;
    });
  };

  // Helper: Trigger Pop-up Toast Notification
  const triggerToast = (
    title: string,
    message: string,
    matchInfo?: {
      teamHome: string;
      teamAway: string;
      scoreHome: number;
      scoreAway: number;
      userBetOutcome?: 'home' | 'draw' | 'away';
      userBetAmount?: number;
      userBetOdds?: number;
      scoringTeam?: string;
    },
    type: 'score_change' | 'goal' | 'bet_win' | 'bet_lost' | 'info' = 'score_change'
  ) => {
    const newToast: ToastItem = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      matchInfo,
      type,
      createdAt: Date.now()
    };

    setToasts(prev => [newToast, ...prev].slice(0, 3));

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleScoreChangeToast = (match: Match, scoreHome: number, scoreAway: number, scoringTeam?: string) => {
    const userBets = bets.filter(b => b.matchId === match.id && (currentUser ? b.userId === currentUser.id : false));
    if (userBets.length > 0) {
      const userBet = userBets[0];
      triggerToast(
        `⚽ هدف وتغير النتيجة في مباراة تراهن عليها!`,
        `سجل ${scoringTeam || 'فريق'} هدفاً! النتيجة الحالية: ${match.teamHome} (${scoreHome}) - (${scoreAway}) ${match.teamAway}`,
        {
          teamHome: match.teamHome,
          teamAway: match.teamAway,
          scoreHome,
          scoreAway,
          userBetOutcome: userBet.selectedOutcome,
          userBetAmount: userBet.amount,
          userBetOdds: userBet.odds,
          scoringTeam
        },
        'goal'
      );
    } else {
      triggerToast(
        `⚽ تغير نتيجة مباراة: ${match.teamHome} × ${match.teamAway}`,
        `النتيجة أصبحت الآن: ${scoreHome} - ${scoreAway}`,
        {
          teamHome: match.teamHome,
          teamAway: match.teamAway,
          scoreHome,
          scoreAway,
          scoringTeam
        },
        'score_change'
      );
    }
  };

  // Monitor matches list for score changes
  const prevMatchesRef = React.useRef<Match[]>([]);

  useEffect(() => {
    if (prevMatchesRef.current.length > 0) {
      matches.forEach(m => {
        const prev = prevMatchesRef.current.find(p => p.id === m.id);
        if (prev && (prev.scoreHome !== m.scoreHome || prev.scoreAway !== m.scoreAway)) {
          const userBets = bets.filter(b => b.matchId === m.id && currentUser && b.userId === currentUser.id);
          const userBet = userBets.length > 0 ? userBets[0] : undefined;

          triggerToast(
            userBet ? `⚽ تغير نتيجة مباراة تراهن عليها!` : `⚽ تحديث نتيجة: ${m.teamHome} × ${m.teamAway}`,
            `النتيجة الحالية: ${m.teamHome} (${m.scoreHome}) - (${m.scoreAway}) ${m.teamAway}`,
            {
              teamHome: m.teamHome,
              teamAway: m.teamAway,
              scoreHome: m.scoreHome,
              scoreAway: m.scoreAway,
              userBetOutcome: userBet?.selectedOutcome,
              userBetAmount: userBet?.amount,
              userBetOdds: userBet?.odds
            },
            'score_change'
          );
        }
      });
    }
    prevMatchesRef.current = matches;
  }, [matches, bets, currentUser]);

  // navbar tab selector helper & back navigation stack
  const handleTabSelect = (tab: string) => {
    if (tab !== activeTab) {
      setTabHistory(prev => [...prev, tab]);
      setActiveTab(tab);
    }
  };

  const handleGoBack = () => {
    // If a match is selected in EventsPage, reset selected match first
    if (selectedMatch) {
      setSelectedMatch(null);
      return;
    }

    if (tabHistory.length > 1) {
      const updatedHistory = tabHistory.slice(0, -1);
      setTabHistory(updatedHistory);
      setActiveTab(updatedHistory[updatedHistory.length - 1]);
    } else {
      setActiveTab('home');
      setTabHistory(['home']);
    }
  };

  const canGoBack = activeTab !== 'home' || selectedMatch !== null || tabHistory.length > 1;

  const handleSelectMatchFromHome = (match: Match) => {
    setSelectedMatch(match);
    if (activeTab !== 'events') {
      setTabHistory(prev => [...prev, 'events']);
      setActiveTab('events');
    }
  };

  // User Auth Actions
  const handleLoginSuccess = (user: User) => {
    const isEmailAdmin = user.email.trim().toLowerCase() === 'fadysoso415@gmail.com' || user.email.trim().toLowerCase() === 'admin@stad.com';
    const effectiveUser = (isEmailAdmin || user.isAdmin) ? { ...user, isAdmin: true } : user;

    setCurrentUser(effectiveUser);
    localStorage.setItem('stad_active_user', JSON.stringify(effectiveUser));
    
    // If not in allUsers, add or update
    setAllUsers(prev => {
      const exists = prev.some(u => u.id === effectiveUser.id || u.email.toLowerCase() === effectiveUser.email.toLowerCase());
      if (!exists) {
        const next = [...prev, effectiveUser];
        localStorage.setItem('stad_users', JSON.stringify(next));
        return next;
      }
      const updated = prev.map(u => (u.id === effectiveUser.id || u.email.toLowerCase() === effectiveUser.email.toLowerCase()) ? effectiveUser : u);
      localStorage.setItem('stad_users', JSON.stringify(updated));
      return updated;
    });

    saveUserToFirestore(effectiveUser);

    if (effectiveUser.isAdmin) {
      // Direct redirect to Admin Panel for admin users / fadysoso415@gmail.com
      setActiveTab('admin');
      setTabHistory(['home', 'admin']);
      triggerToast('مرحباً بك يا مسؤول المنصة! 👑', 'تم تسجيل الدخول وتحويلك مباشرةً إلى لوحة التحكم الإدارية.');
    } else {
      // Instantly navigate regular user to available matches for betting
      setActiveTab('events');
      setTabHistory(['home', 'events']);

      // Auto-select active match so betting card is instantly open and ready
      const activeMatch = matches.find(m => m.status === 'live' || m.status === 'upcoming') || matches[0];
      if (activeMatch) {
        setSelectedMatch(activeMatch);
      }
      
      triggerNotification(
        '⚡ تم تسجيل الدخول بنجاح', 
        `أهلاً بك يا ${user.name}! تم نقلك فوراً لقسم المباريات المتاحة للرهان لبدء التوقع والمراهنة السريعة.`, 
        'system'
      );
    }
  };

  const handleRegisterUser = (newUser: User) => {
    saveUserToFirestore(newUser);
    setAllUsers(prev => {
      const filtered = prev.filter(u => u.id !== newUser.id && u.email !== newUser.email);
      const next = [...filtered, newUser];
      localStorage.setItem('stad_users', JSON.stringify(next));
      return next;
    });
  };

  const handleLogout = () => {
    updateCurrentUserAndState(null);
    setActiveTab('home');
    setIsChatOpen(false);
  };

  // User Coins & Wallet
  const handleDeposit = (amount: number) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      balance: currentUser.balance + amount
    };
    updateCurrentUserAndState(updated);
    triggerNotification('🪙 تم شحن الرصيد بنجاح', `تم بنجاح إضافة ${amount} كوينز إلى محفظتك.`, 'system');
  };

  const handleClaimDailyReward = () => {
    if (!currentUser) return;
    const currentClaims = currentUser.dailyClaimsCount || 0;
    if (currentClaims >= 7) {
      triggerNotification('⚠️ تنبيه المكافأة اليومية', 'لقد استوفيت الحد الأقصى للمكافأة اليومية (7 أيام فقط).', 'system');
      return;
    }
    const newCount = currentClaims + 1;
    const updated = {
      ...currentUser,
      balance: currentUser.balance + 10,
      dailyClaimsCount: newCount,
      lastClaimDate: new Date().toISOString()
    };
    updateCurrentUserAndState(updated);
    triggerNotification(
      '🎁 مكافأة حضور يومي',
      `تمت إضافة 10 كوينز بنجاح إلى محفظتك! (تمت المطالبة باليوم ${newCount} من 7 أيام)`,
      'system'
    );
  };

  // 1. PLACE BET ENGINE (تثبيت الرهان)
  const handlePlaceBet = (matchId: string, outcome: 'home' | 'draw' | 'away', amount: number) => {
    if (!currentUser) return;

    if (amount <= 0) {
      triggerNotification('⚠️ خطأ في المبلغ', 'يرجى إدخال قيمة رهان صحيحة أكبر من صفر.', 'system');
      return;
    }

    // STRICT BALANCE CHECK PREVENTING TRANSACTIONS WITHOUT SUFFICIENT BALANCE
    if (currentUser.balance < amount) {
      triggerNotification(
        '🔴 رصيد غير كافٍ',
        `عذراً، رصيدك الحقيقي (${currentUser.balance} 🪙) غير كافٍ لإجراء رهان بقيمة ${amount} 🪙. يرجى تقديم طلب شحن رصيد من المحفظة أولاً.`,
        'system'
      );
      return;
    }

    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    // STRICT CHECK: PREVENT DUPLICATE BETS ON THE SAME MATCH (1 BET PER MATCH PER USER)
    const hasAlreadyBetOnMatch = bets.some(b => b.userId === currentUser.id && b.matchId === matchId);
    if (hasAlreadyBetOnMatch) {
      triggerNotification(
        '⛔ اشتراك مكرر ممنوع',
        `لقد قمت بالفعل بالمراهنة على هذه المباراة (${match.teamHome} × ${match.teamAway}). النظام يسمح باشتراك رهان واحد فقط لكل مباراة ولا يمكن تكراره أو تعديله بعد الاعتماد.`,
        'system'
      );
      return;
    }

    const baseOdds = outcome === 'home' ? match.oddsHome : outcome === 'away' ? match.oddsAway : match.oddsDraw;
    const multiplierFactor = (match.isFeaturedBet && match.featuredBetMultiplier && match.featuredBetMultiplier > 1) ? match.featuredBetMultiplier : 1;
    const odds = Number((baseOdds * multiplierFactor).toFixed(2));

    const newBet: Bet = {
      id: `bet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: currentUser.id,
      matchId,
      teamHome: match.teamHome,
      teamAway: match.teamAway,
      selectedOutcome: outcome,
      amount,
      odds,
      baseOdds,
      featuredMultiplierApplied: multiplierFactor,
      isFeaturedBet: Boolean(match.isFeaturedBet),
      status: 'pending',
      payout: 0,
      placedAt: new Date().toISOString()
    };

    // Deduct coins from user balance & save user to Firestore
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance - amount
    };
    updateCurrentUserAndState(updatedUser);

    // Save bet to Firestore
    saveBetToFirestore(newBet);

    // Open rich Bet Confirmation Modal Overlay
    setConfirmedBetModalData({
      bet: newBet,
      match,
      userRemainingBalance: updatedUser.balance
    });

    triggerNotification(
      '⚡ تم خصم المبلغ وتأكيد الرهان', 
      `تمت الموافقة واقتطاع مبلغ الرهان (${amount} 🪙) من محفظتك بنجاح لتثبيت رهانك على مباراة (${match.teamHome} × ${match.teamAway}). الرصيد المتبقي: ${updatedUser.balance} 🪙.`, 
      'bet'
    );
  };

  // Quick Bet Home helper
  const handlePlaceQuickBet = (match?: Match, outcome: 'home' | 'draw' | 'away' = 'home') => {
    const isBettingAvailable = (m: Match) => m.status !== 'finished' && !m.isBettingClosed && m.bettingStatus !== 'closed' && m.bettingStatus !== 'suspended';
    const targetMatch = (match && isBettingAvailable(match)) 
      ? match 
      : matches.find(isBettingAvailable) || matches[0];
    if (!targetMatch) return;
    setQuickBetModalMatch(targetMatch);
    setQuickBetModalOutcome(outcome);
    setIsQuickBetModalOpen(true);
  };

  // 2. SIMULATE MATCH RESOLUTION & ADMIN MATCH ENGINE (تحديث حالة وتاريخ المباراة وتصفية تسوية الرهانات)
  const handleSimulateMatchFinished = (
    matchId: string, 
    scoreHome: number, 
    scoreAway: number, 
    status?: 'scheduled' | 'live' | 'finished',
    date?: string,
    time?: string,
    minutes?: number,
    stats?: any
  ) => {
    let matchRef: Match | null = null;
    const targetStatus = status || 'finished';

    const currentMatch = matches.find(m => m.id === matchId);
    if (!currentMatch) return;

    matchRef = {
      ...currentMatch,
      status: targetStatus,
      scoreHome,
      scoreAway,
      date: date !== undefined && date !== '' ? date : currentMatch.date,
      time: time !== undefined && time !== '' ? time : currentMatch.time,
      minutes: minutes !== undefined ? minutes : (targetStatus === 'live' ? (currentMatch.minutes || 1) : currentMatch.minutes),
      stats: stats ? { ...currentMatch.stats, ...stats } : currentMatch.stats
    };

    // Save updated match in Firestore
    saveMatchToFirestore(matchRef);

    if (selectedMatch?.id === matchId) {
      if (targetStatus === 'finished') {
        const nextActive = matches.find(m => m.id !== matchId && m.status !== 'finished');
        setSelectedMatch(nextActive || null);
      } else if (matchRef) {
        setSelectedMatch(matchRef);
      }
    }

    // If targetStatus is not 'finished', we don't settle bets yet
    if (targetStatus !== 'finished') {
      return;
    }

    // Target status IS 'finished': SETTLE ALL BETS & PAYOUTS FOR ALL USERS
    let finalOutcome: 'home' | 'draw' | 'away' = 'draw';
    if (scoreHome > scoreAway) finalOutcome = 'home';
    else if (scoreAway > scoreHome) finalOutcome = 'away';

    const matchName = matchRef ? `(${matchRef.teamHome} × ${matchRef.teamAway})` : 'المباراة الرياضية';

    const userPayoutsMap: Record<string, number> = {};
    const userWonBetsCount: Record<string, number> = {};
    const userLostBetsCount: Record<string, number> = {};

    bets.forEach(bet => {
      if (bet.matchId === matchId && bet.status === 'pending') {
        const didWin = bet.selectedOutcome === finalOutcome;
        const payout = didWin ? Math.round(bet.amount * bet.odds) : 0;
        
        if (didWin) {
          userPayoutsMap[bet.userId] = (userPayoutsMap[bet.userId] || 0) + payout;
          userWonBetsCount[bet.userId] = (userWonBetsCount[bet.userId] || 0) + 1;
        } else {
          userLostBetsCount[bet.userId] = (userLostBetsCount[bet.userId] || 0) + 1;
        }

        // Update bet status & payout in Firestore
        updateBetInFirestore(bet.id, {
          status: didWin ? 'won' : 'lost',
          payout,
          matchScore: `${scoreHome} - ${scoreAway}`
        });
      }
    });

    // Update user balances in Firestore
    allUsers.forEach(u => {
      const addedCoins = userPayoutsMap[u.id] || 0;
      if (addedCoins > 0) {
        const updatedUser = { ...u, balance: u.balance + addedCoins };
        saveUserToFirestore(updatedUser);
        if (currentUser?.id === u.id) {
          updateCurrentUserAndState(updatedUser);
        }
      }
    });

    if (currentUser && userPayoutsMap[currentUser.id]) {
      const addedCoins = userPayoutsMap[currentUser.id];
      triggerNotification(
        '🏆 مبارك! تم تصفية أرباح الرهان',
        `لقد تم إضافة ${addedCoins} كوينز لمحفظتك بعد انتهاء مباراة ${matchName} بنتيجة ${scoreHome}-${scoreAway}!`,
        'bet'
      );
    } else if (currentUser && userLostBetsCount[currentUser.id]) {
      triggerNotification(
        '💔 حظاً أوفر في التوقع التالي',
        `انتهت مباراة ${matchName} بنتيجة ${scoreHome}-${scoreAway}. لم يحالفك الحظ في توقعك هذه المرة.`,
        'bet'
      );
    }

    // Settle public bet offers associated with this match
    publicBetOffers.forEach(pOffer => {
      if (pOffer.matchId === matchId && pOffer.status === 'active') {
        savePublicBetToFirestore({
          ...pOffer,
          status: 'resolved'
        });
      }
    });
  };

  // 3. ADMIN ACTION: Update Match Stats
  const handleUpdateMatchStats = (matchId: string, stats: any) => {
    const target = matches.find(m => m.id === matchId);
    if (!target) return;
    const updated = {
      ...target,
      stats: { ...target.stats, ...stats }
    };
    saveMatchToFirestore(updated);
    if (selectedMatch?.id === matchId) {
      setSelectedMatch(updated);
    }
  };

  // 4. ADMIN ACTION: Create new Match
  const handleAddMatch = (newMatch: Match) => {
    saveMatchToFirestore(newMatch);
  };

  const handleUpdateMatchCustomizations = (
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
    bettingNote?: string,
    isActive?: boolean
  ) => {
    const target = matches.find(m => m.id === matchId);
    if (!target) return;

    const updated: Match = {
      ...target,
      customLabelHome,
      customLabelDraw,
      customLabelAway,
      fixedStakeAmount,
      isFeatured,
      featuredTag,
      oddsHome: oddsHome !== undefined ? oddsHome : target.oddsHome,
      oddsDraw: oddsDraw !== undefined ? oddsDraw : target.oddsDraw,
      oddsAway: oddsAway !== undefined ? oddsAway : target.oddsAway,
      isFeaturedBet: isFeaturedBet !== undefined ? isFeaturedBet : target.isFeaturedBet,
      featuredBetMultiplier: featuredBetMultiplier !== undefined ? featuredBetMultiplier : target.featuredBetMultiplier,
      featuredBetLabel: featuredBetLabel !== undefined ? featuredBetLabel : target.featuredBetLabel,
      matchImage: matchImage !== undefined ? matchImage : target.matchImage,
      adTitle: adTitle !== undefined ? adTitle : target.adTitle,
      adDescription: adDescription !== undefined ? adDescription : target.adDescription,
      adBadge: adBadge !== undefined ? adBadge : target.adBadge,
      isAdFeatured: isAdFeatured !== undefined ? isAdFeatured : target.isAdFeatured,
      isBettingClosed: isBettingClosed !== undefined ? isBettingClosed : target.isBettingClosed,
      bettingStatus: bettingStatus !== undefined ? bettingStatus : target.bettingStatus,
      bettingNote: bettingNote !== undefined ? bettingNote : target.bettingNote,
      isActive: isActive !== undefined ? isActive : target.isActive
    };

    saveMatchToFirestore(updated);
    if (selectedMatch?.id === matchId) {
      setSelectedMatch(updated);
    }
  };

  // 5. ADMIN ACTIONS ON USERS
  const handleUpdateUserBalance = (userId: string, newBalance: number) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    const updated = { ...target, balance: newBalance };
    saveUserToFirestore(updated);
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
      localStorage.setItem('stad_active_user', JSON.stringify(updated));
    }
  };

  const handleToggleUserAdmin = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    const updated = { ...target, isAdmin: !target.isAdmin };
    saveUserToFirestore(updated);
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
      localStorage.setItem('stad_active_user', JSON.stringify(updated));
    }
  };

  const handleDeleteUser = (userId: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  // 6. ADMIN ACTIONS ON BETS & CREATING USER BETS
  const handleAdminCreateBetForUser = (userId: string, matchId: string, outcome: 'home' | 'draw' | 'away', amount: number, customOdds?: number) => {
    const targetUser = allUsers.find(u => u.id === userId);
    const match = matches.find(m => m.id === matchId);
    if (!targetUser || !match) return;

    const odds = customOdds || (outcome === 'home' ? match.oddsHome : outcome === 'away' ? match.oddsAway : match.oddsDraw);

    const newBet: Bet = {
      id: `bet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: targetUser.id,
      matchId,
      teamHome: match.teamHome,
      teamAway: match.teamAway,
      selectedOutcome: outcome,
      amount,
      odds,
      status: 'pending',
      payout: 0,
      placedAt: new Date().toISOString()
    };

    // Deduct coins from user balance
    const updatedUser = {
      ...targetUser,
      balance: Math.max(0, targetUser.balance - amount)
    };

    saveUserToFirestore(updatedUser);
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
      localStorage.setItem('stad_active_user', JSON.stringify(updatedUser));
    }

    saveBetToFirestore(newBet);

    triggerNotification(
      '🎯 رهان جديد تم إنشاؤه بواسطة الإدارة',
      `تم إنشاء رهان جديد للمستخدم ${targetUser.name} بقيمة ${amount} كوينز على مباراة ${match.teamHome} ضد ${match.teamAway}.`,
      'bet'
    );
  };

  const handleAdminUpdateBetStatus = (betId: string, newStatus: 'pending' | 'won' | 'lost') => {
    const betToUpdate = bets.find(b => b.id === betId);
    if (!betToUpdate) return;

    const payout = newStatus === 'won' ? Math.round(betToUpdate.amount * betToUpdate.odds) : 0;

    if (newStatus === 'won' && betToUpdate.status !== 'won') {
      const u = allUsers.find(x => x.id === betToUpdate.userId);
      if (u) {
        const updatedUser = { ...u, balance: u.balance + payout };
        saveUserToFirestore(updatedUser);
        if (currentUser?.id === u.id) {
          setCurrentUser(updatedUser);
          localStorage.setItem('stad_active_user', JSON.stringify(updatedUser));
        }
      }
    }

    updateBetInFirestore(betId, {
      status: newStatus,
      payout
    });
  };

  const handleAdminDeleteBet = (betId: string) => {
    handleCancelBet(betId);
  };

  const handleCancelBet = (betId: string) => {
    const betToCancel = bets.find(b => b.id === betId);
    if (!betToCancel) return;

    if (betToCancel.status === 'pending') {
      const u = allUsers.find(x => x.id === betToCancel.userId);
      if (u) {
        const updatedUser = { ...u, balance: u.balance + betToCancel.amount };
        saveUserToFirestore(updatedUser);
        if (currentUser?.id === u.id) {
          setCurrentUser(updatedUser);
          localStorage.setItem('stad_active_user', JSON.stringify(updatedUser));
        }
      }

      triggerNotification(
        '🔄 تم إلغاء الرهان المعلق بنجاح',
        `تم إلغاء توقعك المعلق على مباراة (${betToCancel.teamHome} × ${betToCancel.teamAway}) وإعادة ${betToCancel.amount.toLocaleString()} 🪙 كوينز إلى محفظتك.`,
        'bet'
      );
    }

    deleteBetFromFirestore(betId);
  };

  // 7. PUBLIC BET OFFER HANDLERS (الرهانات العامة التفاعلية للجميع)
  const handleCreatePublicBetOffer = (offer: PublicBetOffer) => {
    savePublicBetToFirestore(offer);

    triggerNotification(
      '🌐 رهان عام جديد معروض!',
      `تم نشر رهان عام جديد من قبل إدارة الموقع: "${offer.title}" بمعامل أرباح x${offer.odds}! شارك الآن بحجم كوينزاتك المفضلة.`,
      'system'
    );
  };

  const handleJoinPublicBetOffer = (offerId: string, stakeAmount: number) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    if (currentUser.balance < stakeAmount || stakeAmount <= 0) {
      triggerNotification(
        '🔴 رصيد غير كافٍ',
        `عذراً، رصيدك المالي (${currentUser.balance} 🪙) غير كافٍ للاشتراك بالرهان بمبلغ ${stakeAmount} 🪙. يرجى تقديم طلب شحن رصيد أولاً.`,
        'system'
      );
      return;
    }

    const offer = publicBetOffers.find(o => o.id === offerId);
    if (!offer) return;

    // STRICT CHECK: PREVENT DUPLICATE BETS ON THE SAME PUBLIC OFFER OR MATCH
    const hasAlreadyJoinedOffer = bets.some(b => b.userId === currentUser.id && (b.publicOfferId === offerId || (b.matchId && offer.matchId && b.matchId === offer.matchId)));
    if (hasAlreadyJoinedOffer) {
      triggerNotification(
        '⛔ اشتراك مكرر ممنوع',
        `لقد قمت بالفعل بالمراهنة أو الاشتراك في هذا التحدي (${offer.title}). النظام يسمح باشتراك واحد فقط لكل مباراة أو تحدي ولا يمكن تعديله أو حذفه.`,
        'system'
      );
      return;
    }

    // 1. Deduct coins from user
    const updatedUser = { ...currentUser, balance: currentUser.balance - stakeAmount };
    updateCurrentUserAndState(updatedUser);

    // 2. Add user bet
    const outcomeLabel = offer.outcomeLabel || (offer.selectedOutcome === 'home' ? `فوز ${offer.teamHome}` : offer.selectedOutcome === 'away' ? `فوز ${offer.teamAway}` : 'التعادل');
    const newBet: Bet = {
      id: `bet-pub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.id,
      matchId: offer.matchId || 'public-offer',
      teamHome: offer.teamHome,
      teamAway: offer.teamAway,
      selectedOutcome: offer.selectedOutcome,
      amount: stakeAmount,
      odds: offer.odds,
      status: 'pending',
      payout: Math.round(stakeAmount * offer.odds),
      placedAt: new Date().toISOString(),
      publicBetOfferId: offer.id
    };

    saveBetToFirestore(newBet);

    // 3. Update public bet offer stats
    savePublicBetToFirestore({
      ...offer,
      participantsCount: (offer.participantsCount || 0) + 1,
      totalStakedCoins: (offer.totalStakedCoins || 0) + stakeAmount
    });

    setConfirmedBetModalData({
      bet: newBet,
      match: null,
      userRemainingBalance: updatedUser.balance
    });

    triggerNotification(
      '⚡ تم خصم المبلغ والاشتراك بالرهان العام',
      `تم اقتطاع ${stakeAmount} كوينز من محفظتك بنجاح واشتراكك في تحدي "${offer.title}" (الخيار: ${outcomeLabel} - معامل x${offer.odds}). الرصيد المتبقي: ${updatedUser.balance} 🪙.`,
      'bet'
    );
  };

  const handleResolvePublicBetOffer = (offerId: string, outcomeStatus: 'won' | 'lost' | 'cancelled') => {
    const offer = publicBetOffers.find(o => o.id === offerId);
    if (!offer) return;

    savePublicBetToFirestore({
      ...offer,
      status: outcomeStatus
    });

    const userPayouts: { [uId: string]: number } = {};

    bets.forEach(b => {
      if (b.publicBetOfferId === offerId && b.status === 'pending') {
        if (outcomeStatus === 'won') {
          const winAmount = b.payout || Math.round(b.amount * b.odds);
          userPayouts[b.userId] = (userPayouts[b.userId] || 0) + winAmount;
          updateBetInFirestore(b.id, { status: 'won', payout: winAmount });
        } else if (outcomeStatus === 'lost') {
          updateBetInFirestore(b.id, { status: 'lost', payout: 0 });
        } else if (outcomeStatus === 'cancelled') {
          userPayouts[b.userId] = (userPayouts[b.userId] || 0) + b.amount;
          updateBetInFirestore(b.id, { status: 'lost', payout: 0 });
        }
      }
    });

    Object.keys(userPayouts).forEach(uId => {
      const u = allUsers.find(x => x.id === uId);
      if (u) {
        const updatedUser = { ...u, balance: u.balance + userPayouts[uId] };
        saveUserToFirestore(updatedUser);
        if (currentUser?.id === uId) {
          setCurrentUser(updatedUser);
          localStorage.setItem('stad_active_user', JSON.stringify(updatedUser));
        }
      }
    });

    triggerNotification(
      outcomeStatus === 'won' ? '🏆 فوز بالرهان العام!' : outcomeStatus === 'cancelled' ? '🔄 إلغاء الرهان العام' : '❌ نتيجة الرهان العام',
      `تم حسم الرهان العام "${offer.title}". ${
        outcomeStatus === 'won'
          ? 'تهانينا لجميع المشاركين الفائزين، تمت إضافة الأرباح المضاعفة تلقائياً لمحافظكم!'
          : outcomeStatus === 'cancelled'
          ? 'تم إلغاء الرهان وإعادة الكوينز إلى حسابات جميع المشاركين.'
          : 'حظاً أوفر في الرهانات القادمة.'
      }`,
      'bet'
    );
  };

  const handleDeletePublicBetOffer = (offerId: string) => {
    deletePublicBetFromFirestore(offerId);
  };

  // Chatbot Actions (Google Search Grounding proxy route)
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => {
      const next = [...prev, userMsg];
      localStorage.setItem('stad_chat_history', JSON.stringify(next));
      return next;
    });

    setLoadingChat(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: chatHistory.slice(-10), // send last 10 messages for context
          message: text,
        }),
      });

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'model',
        text: data.text || 'عذراً، أواجه مشكلة في معالجة طلبك حالياً.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
      };

      setChatHistory(prev => {
        const next = [...prev, modelMsg];
        localStorage.setItem('stad_chat_history', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.error('Error in chat sending:', err);
      const errorMsg: ChatMessage = {
        id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'model',
        text: 'عذراً، فشل الاتصال بخادم الذكاء الاصطناعي للمساعد الرياضي المباشر. يرجى محاولة التحديث لاحقاً.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Helper clear chats
  const handleClearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('stad_notifications', JSON.stringify([]));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('stad_notifications', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Real-time Pop-up Toast Notifications System */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Navigation Header */}
      <Navbar 
        currentUser={currentUser}
        notifications={notifications}
        activeTab={activeTab}
        setActiveTab={handleTabSelect}
        canGoBack={canGoBack}
        onGoBack={handleGoBack}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onOpenDeposit={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
            return;
          }
          setIsCashDepositOpen(true);
        }}
        onOpenWithdraw={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
            return;
          }
          setIsWithdrawOpen(true);
        }}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pb-16 pt-3 sm:pt-4">
        
        {/* Render Tab pages dynamically */}
        {activeTab === 'home' && (
          <MainPage 
            matches={matches}
            onSelectMatch={handleSelectMatchFromHome}
            onPlaceQuickBet={handlePlaceQuickBet}
            currentUser={currentUser}
            leagueStandings={leagueStandings}
            sportsCategories={sportsCategories}
            onTriggerToast={triggerToast}
            onTriggerNotification={triggerNotification}
            activeBets={bets}
          />
        )}

        {activeTab === 'events' && (
          <EventsPage 
            matches={matches}
            selectedMatch={selectedMatch}
            onSelectMatch={setSelectedMatch}
            currentUser={currentUser}
            onPlaceBet={handlePlaceBet}
            onSimulateMatchFinished={handleSimulateMatchFinished}
            onOpenAuth={() => setIsAuthOpen(true)}
            activeBets={bets}
            publicBetOffers={publicBetOffers}
            onJoinPublicBet={handleJoinPublicBetOffer}
            onScoreChangeToast={handleScoreChangeToast}
          />
        )}

        {activeTab === 'dashboard' && currentUser && (
          <UserDashboard 
            currentUser={currentUser}
            onUpdateProfile={updateCurrentUserAndState}
            bets={bets}
            allBets={bets}
            matches={matches}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onClearNotifications={handleClearNotifications}
            onDeposit={handleDeposit}
            onClaimDailyReward={handleClaimDailyReward}
            onOpenCashDepositModal={() => setIsCashDepositOpen(true)}
            depositRequests={depositRequests}
            onOpenWithdrawModal={() => setIsWithdrawOpen(true)}
            withdrawalRequests={withdrawalRequests}
            guideCategories={guideCategories}
            onOpenAdminGuideEdit={() => setActiveTab('admin')}
            onNavigateTab={handleTabSelect}
            onCancelBet={handleCancelBet}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'admin' && currentUser?.isAdmin && (
          <AdminPanel 
            allUsers={allUsers}
            allMatches={matches}
            allBets={bets}
            cashWalletNumber={cashWalletNumber}
            depositRequests={depositRequests}
            withdrawalRequests={withdrawalRequests}
            publicBetOffers={publicBetOffers}
            onAddMatch={handleAddMatch}
            onUpdateMatchScore={handleSimulateMatchFinished}
            onUpdateMatchStats={handleUpdateMatchStats}
            onUpdateUserBalance={handleUpdateUserBalance}
            onToggleUserAdmin={handleToggleUserAdmin}
            onDeleteUser={handleDeleteUser}
            onCreateBetForUser={handleAdminCreateBetForUser}
            onCreatePublicBetOffer={handleCreatePublicBetOffer}
            onResolvePublicBetOffer={handleResolvePublicBetOffer}
            onDeletePublicBetOffer={handleDeletePublicBetOffer}
            onUpdateBetStatus={handleAdminUpdateBetStatus}
            onDeleteBet={handleAdminDeleteBet}
            onUpdateCashWalletNumber={handleUpdateCashWalletNumber}
            onApproveDepositRequest={handleApproveDepositRequest}
            onRejectDepositRequest={handleRejectDepositRequest}
            onDeleteDepositRequest={handleDeleteDepositRequest}
            onApproveWithdrawalRequest={handleApproveWithdrawalRequest}
            onRejectWithdrawalRequest={handleRejectWithdrawalRequest}
            onDeleteWithdrawalRequest={handleDeleteWithdrawalRequest}
            onUpdateMatchCustomizations={handleUpdateMatchCustomizations}
            leagueStandings={leagueStandings}
            onUpdateLeagueStandings={handleUpdateLeagueStandings}
            onClearDemoData={handleClearDemoData}
            sportsCategories={sportsCategories}
            onAddSportCategory={handleAddSportCategory}
            onUpdateSportCategory={handleUpdateSportCategory}
            onDeleteSportCategory={handleDeleteSportCategory}
            guideCategories={guideCategories}
            onUpdateGuideCategories={handleUpdateGuideCategories}
          />
        )}

        {activeTab === 'signup' && (
          <SignUpPage 
            allUsers={allUsers}
            onRegisterUser={handleRegisterUser}
            onLoginSuccess={handleLoginSuccess}
            onNavigateTab={handleTabSelect}
            onOpenAuthModal={() => setIsAuthOpen(true)}
          />
        )}

      </main>

      {/* Cash Deposit Modal */}
      {currentUser && (
        <CashDepositModal
          isOpen={isCashDepositOpen}
          onClose={() => setIsCashDepositOpen(false)}
          currentUser={currentUser}
          cashWalletNumber={cashWalletNumber}
          depositRequests={depositRequests}
          onSubmitDepositRequest={handleSubmitDepositRequest}
        />
      )}

      {/* Cash Withdrawal Modal */}
      {currentUser && (
        <WithdrawModal
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          currentUser={currentUser}
          withdrawalRequests={withdrawalRequests}
          onSubmitWithdrawalRequest={handleSubmitWithdrawalRequest}
        />
      )}

      {/* Bet Confirmation Modal Overlay */}
      {confirmedBetModalData && (
        <BetConfirmationModal
          isOpen={Boolean(confirmedBetModalData)}
          onClose={() => setConfirmedBetModalData(null)}
          bet={confirmedBetModalData.bet}
          match={confirmedBetModalData.match}
          userRemainingBalance={confirmedBetModalData.userRemainingBalance}
          onNavigateToDashboard={() => handleTabSelect('dashboard')}
          onKeepBetting={() => handleTabSelect('events')}
        />
      )}

      {/* Quick Bet Modal Overlay - Accessible From Any Page */}
      <QuickBetModal
        isOpen={isQuickBetModalOpen}
        onClose={() => setIsQuickBetModalOpen(false)}
        match={quickBetModalMatch}
        initialOutcome={quickBetModalOutcome}
        currentUser={currentUser}
        onConfirmBet={handlePlaceBet}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDeposit={() => {
          if (!currentUser) setIsAuthOpen(true);
          else setIsCashDepositOpen(true);
        }}
        allMatches={matches}
        onSelectMatch={(m) => setQuickBetModalMatch(m)}
        activeBets={bets}
      />

      {/* Auth Login/Signup Modal popup */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        allUsers={allUsers}
        onRegisterUser={handleRegisterUser}
        onNavigateSignUp={() => handleTabSelect('signup')}
      />


      {/* Footer credits and details */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex justify-center gap-2 items-center text-zinc-400 font-bold">
            <Trophy className="h-4 w-4 text-emerald-400" />
            <span>منصة مينوو الرياضية © 2026</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed">
            منصة مينوو الرياضية المتكاملة لتوقع النتائج والمنافسات وتحديات الرياضة الرسمية. جميع الحقوق محفوظة © 2026.
          </p>
        </div>
      </footer>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <MobileBottomNav 
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={handleTabSelect}
        canGoBack={canGoBack}
        onGoBack={handleGoBack}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

    </div>
  );
}
