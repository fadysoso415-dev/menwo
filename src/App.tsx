import React, { useState, useEffect } from 'react';
import { User, Match, Bet, Notification, ChatMessage, DepositRequest, PublicBetOffer, WithdrawalRequest } from './types';
import { 
  DEFAULT_USERS, 
  INITIAL_MATCHES, 
  INITIAL_BETS,
  INITIAL_PUBLIC_BETS
} from './data/defaultData';

// Component Imports
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import MainPage from './components/MainPage';
import EventsPage from './components/EventsPage';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import Chatbot from './components/Chatbot';
import CashDepositModal from './components/CashDepositModal';
import WithdrawModal from './components/WithdrawModal';
import ToastContainer, { ToastItem } from './components/ToastContainer';

import { Trophy, Coins, MessageSquare, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Toast Notifications state
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  // Storage states
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [publicBetOffers, setPublicBetOffers] = useState<PublicBetOffer[]>([]);
  
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


  // Initialize data from LocalStorage or defaults
  useEffect(() => {
    // 1. Users
    const savedUsers = localStorage.getItem('stad_users');
    if (savedUsers) {
      const parsed: User[] = JSON.parse(savedUsers);
      const updated = parsed.map(u => 
        u.email.toLowerCase() === 'fadysoso415@gmail.com' ? { ...u, isAdmin: true } : u
      );
      setAllUsers(updated);
    } else {
      setAllUsers(DEFAULT_USERS);
      localStorage.setItem('stad_users', JSON.stringify(DEFAULT_USERS));
    }

    // 2. Matches
    const savedMatches = localStorage.getItem('stad_matches');
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    } else {
      setMatches(INITIAL_MATCHES);
      localStorage.setItem('stad_matches', JSON.stringify(INITIAL_MATCHES));
    }

    // 3. Bets
    const savedBets = localStorage.getItem('stad_bets');
    if (savedBets) {
      setBets(JSON.parse(savedBets));
    } else {
      setBets(INITIAL_BETS);
      localStorage.setItem('stad_bets', JSON.stringify(INITIAL_BETS));
    }

    // 4. Notifications
    const savedNotifs = localStorage.getItem('stad_notifications');
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    } else {
      const initialNotifs: Notification[] = [
        {
          id: 'notif-1',
          userId: 'user-1',
          title: '🎁 هدية ترحيبية بالرصيد!',
          message: 'مرحباً بك في منصة مينوو! تمت إضافة 10 كوينز افتراضية ترحيبية إلى محفظتك لبدء اللعب ومحاكاة المباريات.',
          read: false,
          type: 'system',
          createdAt: new Date().toISOString()
        }
      ];
      setNotifications(initialNotifs);
      localStorage.setItem('stad_notifications', JSON.stringify(initialNotifs));
    }

    // 5. Public Bet Offers
    const savedPublicBets = localStorage.getItem('stad_public_bets');
    if (savedPublicBets) {
      setPublicBetOffers(JSON.parse(savedPublicBets));
    } else {
      setPublicBetOffers(INITIAL_PUBLIC_BETS);
      localStorage.setItem('stad_public_bets', JSON.stringify(INITIAL_PUBLIC_BETS));
    }

    // 5. Active user session (Auto-login as Fady Soso for absolute friction-free testing!)
    const savedActiveUser = localStorage.getItem('stad_active_user');
    if (savedActiveUser) {
      const parsedUser: User = JSON.parse(savedActiveUser);
      if (parsedUser.email.toLowerCase() === 'fadysoso415@gmail.com') {
        parsedUser.isAdmin = true;
      }
      setCurrentUser(parsedUser);
    } else {
      // Default auto-login as User-1 (Fady Soso)
      const defaultUser = { ...DEFAULT_USERS[1], isAdmin: true };
      setCurrentUser(defaultUser);
      localStorage.setItem('stad_active_user', JSON.stringify(defaultUser));
    }

    // 6. Chat History
    const savedChat = localStorage.getItem('stad_chat_history');
    if (savedChat) {
      setChatHistory(JSON.parse(savedChat));
    } else {
      setChatHistory([]);
    }

    // 7. Cash Wallet Number & Deposit Requests
    const savedCashNumber = localStorage.getItem('stad_cash_wallet_number');
    if (savedCashNumber) {
      setCashWalletNumber(savedCashNumber);
    } else {
      localStorage.setItem('stad_cash_wallet_number', '01012345678');
    }

    const savedDepositReqs = localStorage.getItem('stad_deposit_requests');
    if (savedDepositReqs) {
      setDepositRequests(JSON.parse(savedDepositReqs));
    } else {
      setDepositRequests([]);
    }

    const savedWithdrawReqs = localStorage.getItem('stad_withdrawal_requests');
    if (savedWithdrawReqs) {
      setWithdrawalRequests(JSON.parse(savedWithdrawReqs));
    } else {
      setWithdrawalRequests([]);
    }
  }, []);

  // Handlers for Cash Deposit Management
  const handleUpdateCashWalletNumber = (newNumber: string) => {
    setCashWalletNumber(newNumber);
    localStorage.setItem('stad_cash_wallet_number', newNumber);
    triggerNotification('📲 تحديث رقم المحفظة', `تم تحديث رقم محفظة الكاش المعتمدة للتحويلات إلى: ${newNumber}`, 'system');
  };

  // Handlers for Withdrawal Requests (سحب الأرباح)
  const handleSubmitWithdrawalRequest = (amountCoins: number, receiverPhone: string) => {
    if (!currentUser) return;

    // 1. Deduct coins from user balance right away so they cannot double spend
    const updatedUser = {
      ...currentUser,
      balance: Math.max(0, currentUser.balance - amountCoins)
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('stad_active_user', JSON.stringify(updatedUser));

    setAllUsers(prev => {
      const next = prev.map(u => u.id === currentUser.id ? updatedUser : u);
      localStorage.setItem('stad_users', JSON.stringify(next));
      return next;
    });

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
      `تم تقديم طلب سحب أرباح بمبلغ ${amountCoins} ج.م (${amountCoins} 🪙) على محفظة ${receiverPhone}. طلبك قيد المراجعة الفورية من القسم المالي.`,
      'system'
    );
  };

  const handleApproveWithdrawalRequest = (requestId: string) => {
    setWithdrawalRequests(prev => {
      const targetReq = prev.find(r => r.id === requestId);
      if (!targetReq || targetReq.status === 'approved') return prev;

      const next = prev.map(r => r.id === requestId ? { ...r, status: 'approved' as const } : r);
      localStorage.setItem('stad_withdrawal_requests', JSON.stringify(next));

      triggerNotification(
        '💸 تم تحويل الأرباح بنجاح!',
        `تمت الموافقة على طلب سحب الأرباح وتحويل مبلغ ${targetReq.amountEgp} ج.م كاش إلى محفظتك رقم ${targetReq.receiverPhone}.`,
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
        `تم رفض طلب سحب الأرباح بمبلغ ${targetReq.amountEgp} ج.م وإعادة ${targetReq.amountCoins} 🪙 كوينز إلى حسابك.`,
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
      `تم استلام طلب شحن ${request.amountEgp} ج.م (${request.coinsRequested} 🪙). جاري مراجعة صورة الإيصال من الإدارة.`,
      'system'
    );
  };

  const handleApproveDepositRequest = (requestId: string) => {
    setDepositRequests(prev => {
      const targetReq = prev.find(r => r.id === requestId);
      if (!targetReq || targetReq.status === 'approved') return prev;

      // 1. Credit coins to user's balance
      setAllUsers(uList => {
        const uNext = uList.map(u => {
          if (u.id === targetReq.userId) {
            const updated = { ...u, balance: u.balance + targetReq.coinsRequested };
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
        '🎉 تم تأكيد طلب الشحن بنجاح!',
        `تم قبول إيصال التحويل واكتمل إيداع +${targetReq.coinsRequested} 🪙 كوينز في محفظتك بنجاح مقابل ${targetReq.amountEgp} ج.م.`,
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

  // Synchronize active user state to allUsers array and LocalStorage
  const updateCurrentUserAndState = (updatedUser: User | null) => {
    setCurrentUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('stad_active_user', JSON.stringify(updatedUser));
      setAllUsers(prev => {
        const next = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
        localStorage.setItem('stad_users', JSON.stringify(next));
        return next;
      });
    } else {
      localStorage.removeItem('stad_active_user');
    }
  };

  // Helper: Post a live Notification to current user
  const triggerNotification = (title: string, message: string, type: 'bet' | 'match' | 'system') => {
    if (!currentUser) return;
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: currentUser.id,
      title,
      message,
      read: false,
      type,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => {
      const next = [newNotif, ...prev];
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

  // navbar tab selector helper
  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSelectMatchFromHome = (match: Match) => {
    setSelectedMatch(match);
    setActiveTab('events');
  };

  // User Auth Actions
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('stad_active_user', JSON.stringify(user));
    
    // If not in allUsers, add
    setAllUsers(prev => {
      if (!prev.some(u => u.id === user.id)) {
        const next = [...prev, user];
        localStorage.setItem('stad_users', JSON.stringify(next));
        return next;
      }
      return prev;
    });
    
    triggerNotification('🔓 تم تسجيل الدخول بنجاح', `مرحباً بك مجدداً يا ${user.name}! تصفح وتوقع نتائج مبارياتك الرياضية المفضلة الآن.`, 'system');
  };

  const handleRegisterUser = (newUser: User) => {
    setAllUsers(prev => {
      const next = [...prev, newUser];
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
    triggerNotification('🪙 شحن رصيد افتراضي ناجح', `تم بنجاح إضافة ${amount} كوينز افتراضية إلى محفظتك لأغراض التوقع والمحاكاة.`, 'system');
  };

  const handleClaimDailyReward = () => {
    if (!currentUser) return;
    const currentClaims = currentUser.dailyClaimsCount || 0;
    if (currentClaims >= 7) {
      triggerNotification('⚠️ تنبيه المكافأة اليومية', 'لقد استوفيت الحد الأقصى للمكافأة الترحيبية اليومية (7 أيام فقط).', 'system');
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
      '🎁 مكافأة حضور يومي مجانية',
      `تمت إضافة 10 كوينز افتراضية بنجاح إلى محفظتك! (تمت المطالبة باليوم ${newCount} من 7 أيام)`,
      'system'
    );
  };

  // 1. PLACE BET ENGINE (تثبيت الرهان)
  const handlePlaceBet = (matchId: string, outcome: 'home' | 'draw' | 'away', amount: number) => {
    if (!currentUser) return;

    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const odds = outcome === 'home' ? match.oddsHome : outcome === 'away' ? match.oddsAway : match.oddsDraw;

    const newBet: Bet = {
      id: `bet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: currentUser.id,
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
      ...currentUser,
      balance: currentUser.balance - amount
    };
    updateCurrentUserAndState(updatedUser);

    setBets(prev => {
      const next = [newBet, ...prev];
      localStorage.setItem('stad_bets', JSON.stringify(next));
      return next;
    });

    triggerNotification(
      '💸 تم تثبيت توقعك بنجاح', 
      `رهانك بقيمة ${amount} كوينز افتراضية على مباراة (${match.teamHome} × ${match.teamAway}) قد تم تسجيله! معامل الفوز المتوقع: ${odds.toFixed(2)}.`, 
      'bet'
    );
  };

  // Quick Bet Home helper
  const handlePlaceQuickBet = (match: Match, outcome: 'home' | 'draw' | 'away') => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    handlePlaceBet(match.id, outcome, 100); // quick 100 bet
  };

  // 2. SIMULATE MATCH RESOLUTION ENGINE (تصفية وتسوية الرهانات)
  const handleSimulateMatchFinished = (matchId: string, scoreHome: number, scoreAway: number, stats: any) => {
    // 1. Update Match Score, status and stats in state & storage
    let matchRef: Match | null = null;
    setMatches(prev => {
      const next = prev.map(m => {
        if (m.id === matchId) {
          matchRef = {
            ...m,
            status: 'finished',
            scoreHome,
            scoreAway,
            stats: {
              ...m.stats,
              ...stats
            }
          };
          return matchRef;
        }
        return m;
      });
      localStorage.setItem('stad_matches', JSON.stringify(next));
      if (selectedMatch?.id === matchId && matchRef) {
        setSelectedMatch(matchRef);
      }
      return next;
    });

    // We must find the actual outcome of the match
    let finalOutcome: 'home' | 'draw' | 'away' = 'draw';
    if (scoreHome > scoreAway) finalOutcome = 'home';
    else if (scoreAway > scoreHome) finalOutcome = 'away';

    const matchName = matchRef ? `(${matchRef.teamHome} × ${matchRef.teamAway})` : 'المباراة الرياضية';

    // 2. Resolve ALL bets associated with this match in state & storage
    setBets(prev => {
      let coinsPayoutSum = 0;
      let userWonCount = 0;
      let userLostCount = 0;

      const next = prev.map(bet => {
        if (bet.matchId === matchId && bet.status === 'pending') {
          const didWin = bet.selectedOutcome === finalOutcome;
          const payout = didWin ? Math.round(bet.amount * bet.odds) : 0;
          
          if (bet.userId === currentUser?.id) {
            if (didWin) {
              coinsPayoutSum += payout;
              userWonCount++;
            } else {
              userLostCount++;
            }
          }

          return {
            ...bet,
            status: didWin ? 'won' : 'lost',
            payout,
            matchScore: `${scoreHome} - ${scoreAway}`
          } as Bet;
        }
        return bet;
      });

      localStorage.setItem('stad_bets', JSON.stringify(next));

      // 3. Update User Balance if they won coins
      if (currentUser) {
        if (coinsPayoutSum > 0) {
          const updated = {
            ...currentUser,
            balance: currentUser.balance + coinsPayoutSum
          };
          updateCurrentUserAndState(updated);
          triggerNotification(
            '🏆 مبارك! فوز توقع رائع', 
            `لقد ربحت ${coinsPayoutSum} كوينز افتراضية بعد انتهاء مباراة ${matchName} بنتيجة ${scoreHome}-${scoreAway}!`, 
            'bet'
          );
        } else if (userLostCount > 0) {
          triggerNotification(
            '💔 حظاً أوفر في التوقع التالي', 
            `انتهت مباراة ${matchName} بنتيجة ${scoreHome}-${scoreAway}. لم يحالفك الحظ في توقعك المرة، جرب تحليلات الذكاء الاصطناعي مستقبلاً!`, 
            'bet'
          );
        }
      }

      return next;
    });
  };

  // 3. ADMIN ACTION: Update Match Stats
  const handleUpdateMatchStats = (matchId: string, stats: any) => {
    setMatches(prev => {
      const next = prev.map(m => {
        if (m.id === matchId) {
          const updated = {
            ...m,
            stats: { ...m.stats, ...stats }
          };
          if (selectedMatch?.id === matchId) {
            setSelectedMatch(updated);
          }
          return updated;
        }
        return m;
      });
      localStorage.setItem('stad_matches', JSON.stringify(next));
      return next;
    });
  };

  // 4. ADMIN ACTION: Create new Match
  const handleAddMatch = (newMatch: Match) => {
    setMatches(prev => {
      const next = [...prev, newMatch];
      localStorage.setItem('stad_matches', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateMatchCustomizations = (
    matchId: string,
    customLabelHome?: string,
    customLabelDraw?: string,
    customLabelAway?: string,
    fixedStakeAmount?: number
  ) => {
    setMatches(prev => {
      const next = prev.map(m => {
        if (m.id === matchId) {
          const updated = {
            ...m,
            customLabelHome,
            customLabelDraw,
            customLabelAway,
            fixedStakeAmount
          };
          if (selectedMatch?.id === matchId) {
            setSelectedMatch(updated);
          }
          return updated;
        }
        return m;
      });
      localStorage.setItem('stad_matches', JSON.stringify(next));
      return next;
    });
  };

  // 5. ADMIN ACTIONS ON USERS
  const handleUpdateUserBalance = (userId: string, newBalance: number) => {
    setAllUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, balance: newBalance } : u);
      localStorage.setItem('stad_users', JSON.stringify(next));
      if (currentUser?.id === userId) {
        setCurrentUser({ ...currentUser, balance: newBalance });
        localStorage.setItem('stad_active_user', JSON.stringify({ ...currentUser, balance: newBalance }));
      }
      return next;
    });
  };

  const handleToggleUserAdmin = (userId: string) => {
    setAllUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u);
      localStorage.setItem('stad_users', JSON.stringify(next));
      if (currentUser?.id === userId) {
        const updated = { ...currentUser, isAdmin: !currentUser.isAdmin };
        setCurrentUser(updated);
        localStorage.setItem('stad_active_user', JSON.stringify(updated));
      }
      return next;
    });
  };

  const handleDeleteUser = (userId: string) => {
    setAllUsers(prev => {
      const next = prev.filter(u => u.id !== userId);
      localStorage.setItem('stad_users', JSON.stringify(next));
      return next;
    });
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

    setAllUsers(prev => {
      const next = prev.map(u => u.id === userId ? updatedUser : u);
      localStorage.setItem('stad_users', JSON.stringify(next));
      return next;
    });

    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
      localStorage.setItem('stad_active_user', JSON.stringify(updatedUser));
    }

    setBets(prev => {
      const next = [newBet, ...prev];
      localStorage.setItem('stad_bets', JSON.stringify(next));
      return next;
    });

    triggerNotification(
      '🎯 رهان جديد تم إنشاؤه بواسطة الإدارة',
      `تم إنشاء رهان جديد للمستخدم ${targetUser.name} بقيمة ${amount} كوينز على مباراة ${match.teamHome} ضد ${match.teamAway}.`,
      'bet'
    );
  };

  const handleAdminUpdateBetStatus = (betId: string, newStatus: 'pending' | 'won' | 'lost') => {
    setBets(prev => {
      const betToUpdate = prev.find(b => b.id === betId);
      if (!betToUpdate) return prev;

      const payout = newStatus === 'won' ? Math.round(betToUpdate.amount * betToUpdate.odds) : 0;
      const updatedBet: Bet = {
        ...betToUpdate,
        status: newStatus,
        payout
      };

      // If status changed to won, credit payout to user
      if (newStatus === 'won' && betToUpdate.status !== 'won') {
        setAllUsers(uList => {
          const uNext = uList.map(u => {
            if (u.id === betToUpdate.userId) {
              const updated = { ...u, balance: u.balance + payout };
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
      }

      const next = prev.map(b => b.id === betId ? updatedBet : b);
      localStorage.setItem('stad_bets', JSON.stringify(next));
      return next;
    });
  };

  const handleAdminDeleteBet = (betId: string) => {
    setBets(prev => {
      const betToDelete = prev.find(b => b.id === betId);
      if (betToDelete && betToDelete.status === 'pending') {
        // Refund pending bet coins to user
        setAllUsers(uList => {
          const uNext = uList.map(u => {
            if (u.id === betToDelete.userId) {
              const updated = { ...u, balance: u.balance + betToDelete.amount };
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
      }

      const next = prev.filter(b => b.id !== betId);
      localStorage.setItem('stad_bets', JSON.stringify(next));
      return next;
    });
  };

  // 7. PUBLIC BET OFFER HANDLERS (الرهانات العامة التفاعلية للجميع)
  const handleCreatePublicBetOffer = (offer: PublicBetOffer) => {
    setPublicBetOffers(prev => {
      const next = [offer, ...prev];
      localStorage.setItem('stad_public_bets', JSON.stringify(next));
      return next;
    });

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

    if (currentUser.balance < stakeAmount) {
      alert('رصيدك الافتراضي غير كافٍ لهذا الرهان! يرجى شحن الكوينز أو طلب هدايا.');
      return;
    }

    const offer = publicBetOffers.find(o => o.id === offerId);
    if (!offer) return;

    // 1. Deduct coins from user
    const updatedUser = { ...currentUser, balance: currentUser.balance - stakeAmount };
    setCurrentUser(updatedUser);
    localStorage.setItem('stad_active_user', JSON.stringify(updatedUser));

    setAllUsers(prev => {
      const next = prev.map(u => u.id === currentUser.id ? updatedUser : u);
      localStorage.setItem('stad_users', JSON.stringify(next));
      return next;
    });

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

    setBets(prev => {
      const next = [newBet, ...prev];
      localStorage.setItem('stad_bets', JSON.stringify(next));
      return next;
    });

    // 3. Update public bet offer stats
    setPublicBetOffers(prev => {
      const next = prev.map(o => {
        if (o.id === offerId) {
          return {
            ...o,
            participantsCount: (o.participantsCount || 0) + 1,
            totalStakedCoins: (o.totalStakedCoins || 0) + stakeAmount
          };
        }
        return o;
      });
      localStorage.setItem('stad_public_bets', JSON.stringify(next));
      return next;
    });

    triggerNotification(
      '🎯 تم الاشتراك بالرهان العام بنجاح',
      `تم تسجيل رهانك بمبلغ ${stakeAmount} 🪙 في تحدي "${offer.title}". خيارك: ${outcomeLabel} (معامل x${offer.odds}).`,
      'bet'
    );
  };

  const handleResolvePublicBetOffer = (offerId: string, outcomeStatus: 'won' | 'lost' | 'cancelled') => {
    const offer = publicBetOffers.find(o => o.id === offerId);
    if (!offer) return;

    // 1. Update public offer status
    setPublicBetOffers(prev => {
      const next = prev.map(o => o.id === offerId ? { ...o, status: outcomeStatus } : o);
      localStorage.setItem('stad_public_bets', JSON.stringify(next));
      return next;
    });

    // 2. Resolve matching bets for all users
    const userPayouts: { [uId: string]: number } = {};

    setBets(prevBets => {
      const updatedBets = prevBets.map(b => {
        if (b.publicBetOfferId === offerId && b.status === 'pending') {
          if (outcomeStatus === 'won') {
            const winAmount = b.payout || Math.round(b.amount * b.odds);
            userPayouts[b.userId] = (userPayouts[b.userId] || 0) + winAmount;
            return { ...b, status: 'won' as const, payout: winAmount };
          } else if (outcomeStatus === 'lost') {
            return { ...b, status: 'lost' as const, payout: 0 };
          } else if (outcomeStatus === 'cancelled') {
            userPayouts[b.userId] = (userPayouts[b.userId] || 0) + b.amount;
            return { ...b, status: 'lost' as const, payout: 0 };
          }
        }
        return b;
      });
      localStorage.setItem('stad_bets', JSON.stringify(updatedBets));
      return updatedBets;
    });

    // 3. Deposit earnings/refunds to users
    setTimeout(() => {
      setAllUsers(uList => {
        const uNext = uList.map(u => {
          if (userPayouts[u.id]) {
            const newBal = u.balance + userPayouts[u.id];
            if (currentUser?.id === u.id) {
              const updatedCurrent = { ...currentUser, balance: newBal };
              setCurrentUser(updatedCurrent);
              localStorage.setItem('stad_active_user', JSON.stringify(updatedCurrent));
            }
            return { ...u, balance: newBal };
          }
          return u;
        });
        localStorage.setItem('stad_users', JSON.stringify(uNext));
        return uNext;
      });
    }, 50);

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
    setPublicBetOffers(prev => {
      const next = prev.filter(o => o.id !== offerId);
      localStorage.setItem('stad_public_bets', JSON.stringify(next));
      return next;
    });
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4">
        
        {/* Render Tab pages dynamically */}
        {activeTab === 'home' && (
          <MainPage 
            matches={matches}
            onSelectMatch={handleSelectMatchFromHome}
            onPlaceQuickBet={handlePlaceQuickBet}
            currentUser={currentUser}
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
            onUpdateProfile={setCurrentUser}
            bets={bets}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onClearNotifications={handleClearNotifications}
            onDeposit={handleDeposit}
            onClaimDailyReward={handleClaimDailyReward}
            onOpenCashDepositModal={() => setIsCashDepositOpen(true)}
            depositRequests={depositRequests}
            onOpenWithdrawModal={() => setIsWithdrawOpen(true)}
            withdrawalRequests={withdrawalRequests}
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

      {/* Auth Login/Signup Modal popup */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        allUsers={allUsers}
        onRegisterUser={handleRegisterUser}
      />


      {/* Floating Conversational AI Coach / Chatbot sidebar */}
      <Chatbot 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatHistory={chatHistory}
        onSendMessage={handleSendMessage}
        loadingChat={loadingChat}
      />

      {/* Footer credits and details */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex justify-center gap-2 items-center text-zinc-400 font-bold">
            <Trophy className="h-4 w-4 text-emerald-400" />
            <span>منصة مينوو AI الافتراضية © 2026</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed">
            جميع البيانات، الأخبار، الإحصائيات، الرهانات، والأرصدة الظاهرة في هذا التطبيق هي محاكاة افتراضية لأغراض التسلية وتجربة دمج الذكاء الاصطناعي الأرضي. لا وجود لأي معاملات مالية حقيقية.
          </p>
        </div>
      </footer>

    </div>
  );
}
