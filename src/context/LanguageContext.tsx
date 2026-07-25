import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en' | 'fr';

export interface Translations {
  appName: string;
  home: string;
  eventsAndMatches: string;
  userDashboard: string;
  adminPanel: string;
  welcome: string;
  balance: string;
  coins: string;
  depositCash: string;
  withdrawCash: string;
  login: string;
  register: string;
  logout: string;
  aiAssistant: string;
  notifications: string;
  rateNote: string;
  minDepositNote: string;
  // Events / Matches
  allSports: string;
  football: string;
  basketball: string;
  tennis: string;
  esports: string;
  liveNow: string;
  upcomingMatches: string;
  finishedMatches: string;
  homeWin: string;
  draw: string;
  awayWin: string;
  placeBet: string;
  betAmount: string;
  fixedStake: string;
  expectedPayout: string;
  netProfit: string;
  loginToBet: string;
  insufficientBalance: string;
  myBets: string;
  activeBets: string;
  wonBets: string;
  lostBets: string;
  publicOffers: string;
  challengeOffer: string;
  // Dashboard
  dailyReward: string;
  claimReward: string;
  depositHistory: string;
  withdrawHistory: string;
  accountDetails: string;
  phone: string;
  email: string;
  role: string;
  admin: string;
  user: string;
  // Modals
  close: string;
  cancel: string;
  confirm: string;
  depositTitle: string;
  withdrawTitle: string;
  paymentMethod: string;
  vodafoneCash: string;
  instapay: string;
  phoneNumber: string;
  attachReceipt: string;
  submitRequest: string;
  // General
  status: string;
  pending: string;
  approved: string;
  rejected: string;
  search: string;
  noData: string;
  selectLanguage: string;
}

const translations: Record<Language, Translations> = {
  ar: {
    appName: 'مينوو AI',
    home: 'الرئيسية',
    eventsAndMatches: 'الأحداث والمباريات',
    userDashboard: 'لوحة المستخدم',
    adminPanel: 'لوحة المسؤول',
    welcome: 'مرحباً بك',
    balance: 'الرصيد',
    coins: 'كوينز',
    depositCash: 'شحن كاش',
    withdrawCash: 'سحب كاش',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    aiAssistant: 'المساعد الذكي',
    notifications: 'الإشعارات',
    rateNote: 'سعر الكوين: 1 جنيه = 1 كوين',
    minDepositNote: 'أقل مبلغ للشحن هو 50 كوينز (50 ج.م)',
    allSports: 'جميع الرياضات',
    football: 'كرة القدم',
    basketball: 'كرة السلة',
    tennis: 'كرة المضرب (تنس)',
    esports: 'الألعاب الإلكترونية',
    liveNow: 'مباشر الآن',
    upcomingMatches: 'المباريات القادمة',
    finishedMatches: 'المباريات المنتهية',
    homeWin: 'فوز (المضيف)',
    draw: 'تعادل',
    awayWin: 'فوز / خسارة (الضيف)',
    placeBet: 'تأكيد الرهان',
    betAmount: 'مبلغ الرهان (كوينز)',
    fixedStake: 'قيمة ثابتة مخصصة من الإدارة',
    expectedPayout: 'العائد المتوقع',
    netProfit: 'الربح الصافي المتوقع',
    loginToBet: 'سجل الدخول للمشاركة في الرهان',
    insufficientBalance: 'رصيدك غير كافٍ',
    myBets: 'رهاناتي',
    activeBets: 'نشطة',
    wonBets: 'فائزة',
    lostBets: 'خاسرة',
    publicOffers: 'التحديات والعروض العامة',
    challengeOffer: 'تحدي عام',
    dailyReward: 'المكافأة اليومية (10 كوينز)',
    claimReward: 'مطالبة بالمكافأة اليومية',
    depositHistory: 'سجل عمليات الشحن',
    withdrawHistory: 'سجل عمليات السحب',
    accountDetails: 'بيانات الحساب',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    role: 'الرتبة',
    admin: 'مسؤول',
    user: 'عضو',
    close: 'إغلاق',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    depositTitle: 'شحن حسابك عبر فودافون كاش / إنستا باي',
    withdrawTitle: 'سحب الأرباح إلى فودافون كاش',
    paymentMethod: 'طريقة الدفع',
    vodafoneCash: 'فودافون كاش',
    instapay: 'إنستا باي (InstaPay)',
    phoneNumber: 'رقم الهاتف المبتعث منه',
    attachReceipt: 'إرفاق صورة التحويل',
    submitRequest: 'إرسال الطلب للمراجعة',
    status: 'الحالة',
    pending: 'قيد الانتظار',
    approved: 'مقبول',
    rejected: 'مرفوض',
    search: 'بحث',
    noData: 'لا توجد بيانات متاحة حالياً',
    selectLanguage: 'اختر اللغة',
  },
  en: {
    appName: 'Minoo AI',
    home: 'Home',
    eventsAndMatches: 'Events & Matches',
    userDashboard: 'User Dashboard',
    adminPanel: 'Admin Panel',
    welcome: 'Welcome',
    balance: 'Balance',
    coins: 'Coins',
    depositCash: 'Deposit Cash',
    withdrawCash: 'Withdraw Cash',
    login: 'Log In',
    register: 'Sign Up',
    logout: 'Log Out',
    aiAssistant: 'AI Assistant',
    notifications: 'Notifications',
    rateNote: 'Rate: 1 EGP = 1 Coin',
    minDepositNote: 'Minimum deposit is 50 Coins (50 EGP)',
    allSports: 'All Sports',
    football: 'Football',
    basketball: 'Basketball',
    tennis: 'Tennis',
    esports: 'E-Sports',
    liveNow: 'Live Now',
    upcomingMatches: 'Upcoming Matches',
    finishedMatches: 'Finished Matches',
    homeWin: 'Home Win',
    draw: 'Draw',
    awayWin: 'Away Win',
    placeBet: 'Place Virtual Bet',
    betAmount: 'Bet Amount (Coins)',
    fixedStake: 'Fixed Admin Stake',
    expectedPayout: 'Expected Payout',
    netProfit: 'Expected Net Profit',
    loginToBet: 'Log in to place a bet',
    insufficientBalance: 'Insufficient balance',
    myBets: 'My Bets',
    activeBets: 'Active',
    wonBets: 'Won',
    lostBets: 'Lost',
    publicOffers: 'Public Challenges & Offers',
    challengeOffer: 'Public Challenge',
    dailyReward: 'Daily Bonus (10 Coins)',
    claimReward: 'Claim Daily Reward',
    depositHistory: 'Deposit History',
    withdrawHistory: 'Withdrawal History',
    accountDetails: 'Account Details',
    phone: 'Phone Number',
    email: 'Email',
    role: 'Role',
    admin: 'Admin',
    user: 'Member',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    depositTitle: 'Deposit via Vodafone Cash / InstaPay',
    withdrawTitle: 'Withdraw Profits to Vodafone Cash',
    paymentMethod: 'Payment Method',
    vodafoneCash: 'Vodafone Cash',
    instapay: 'InstaPay',
    phoneNumber: 'Sender Phone Number',
    attachReceipt: 'Attach Transfer Receipt',
    submitRequest: 'Submit Request for Approval',
    status: 'Status',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    search: 'Search',
    noData: 'No data available',
    selectLanguage: 'Select Language',
  },
  fr: {
    appName: 'Minoo AI',
    home: 'Accueil',
    eventsAndMatches: 'Événements & Matchs',
    userDashboard: 'Tableau de bord',
    adminPanel: 'Panneau d\'administration',
    welcome: 'Bienvenue',
    balance: 'Solde',
    coins: 'Coins',
    depositCash: 'Déposer Cash',
    withdrawCash: 'Retirer Cash',
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    aiAssistant: 'Assistant AI',
    notifications: 'Notifications',
    rateNote: 'Taux: 1 EGP = 1 Coin',
    minDepositNote: 'Dépôt minimum: 50 Coins (50 EGP)',
    allSports: 'Tous les sports',
    football: 'Football',
    basketball: 'Basketball',
    tennis: 'Tennis',
    esports: 'E-Sports',
    liveNow: 'En Direct',
    upcomingMatches: 'Matchs à venir',
    finishedMatches: 'Matchs terminés',
    homeWin: 'Victoire Domicile',
    draw: 'Match Nul',
    awayWin: 'Victoire Extérieur',
    placeBet: 'Placer un pari virtuel',
    betAmount: 'Montant du pari (Coins)',
    fixedStake: 'Mise fixe admin',
    expectedPayout: 'Gain estimé',
    netProfit: 'Bénéfice net estimé',
    loginToBet: 'Connectez-vous pour parier',
    insufficientBalance: 'Solde insuffisant',
    myBets: 'Mes Paris',
    activeBets: 'Actifs',
    wonBets: 'Gagnés',
    lostBets: 'Perdus',
    publicOffers: 'Défis & Offres Publiques',
    challengeOffer: 'Défi Public',
    dailyReward: 'Bonus Quotidien (10 Coins)',
    claimReward: 'Réclamer le bonus',
    depositHistory: 'Historique des dépôts',
    withdrawHistory: 'Historique des retraits',
    accountDetails: 'Détails du compte',
    phone: 'Numéro de téléphone',
    email: 'E-mail',
    role: 'Rôle',
    admin: 'Administrateur',
    user: 'Membre',
    close: 'Fermer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    depositTitle: 'Dépôt via Vodafone Cash / InstaPay',
    withdrawTitle: 'Retrait vers Vodafone Cash',
    paymentMethod: 'Moyen de paiement',
    vodafoneCash: 'Vodafone Cash',
    instapay: 'InstaPay',
    phoneNumber: 'Numéro d\'expéditeur',
    attachReceipt: 'Joindre le reçu',
    submitRequest: 'Soumettre la demande',
    status: 'Statut',
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    search: 'Rechercher',
    noData: 'Aucune donnée disponible',
    selectLanguage: 'Choisir la langue',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  t: translations.ar,
  dir: 'rtl'
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('minoo_lang') as Language;
    return saved && ['ar', 'en', 'fr'].includes(saved) ? saved : 'ar';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('minoo_lang', lang);
  };

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language], dir }}>
      <div dir={dir} className={language !== 'ar' ? 'font-sans' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
