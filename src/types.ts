export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  avatar: string;
  createdAt: string;
  dailyClaimsCount?: number;
  lastClaimDate?: string;
}

export interface MatchStats {
  possessionHome: number;
  possessionAway: number;
  shotsHome: number;
  shotsAway: number;
  cornersHome: number;
  cornersAway: number;
  foulsHome: number;
  foulsAway: number;
}

export interface HeadToHeadMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  scoreHome: number;
  scoreAway: number;
  winner: string;
  competition: string;
}

export interface HeadToHeadData {
  totalMatches: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  recentMatches: HeadToHeadMatch[];
}

export interface StrategicTipItem {
  title: string;
  description: string;
  riskLevel: 'منخفضة' | 'متوسطة' | 'عالية' | 'Low' | 'Medium' | 'High';
  statBasis: string;
  category?: string;
  suggestedOutcome?: 'home' | 'draw' | 'away';
}

export interface StrategicTipsData {
  summary: string;
  keyInsight: string;
  historicalFact: string;
  tips: StrategicTipItem[];
}

export interface SportCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface Match {
  id: string;
  sport: string;
  teamHome: string;
  teamAway: string;
  logoHome: string;
  logoAway: string;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  status: 'scheduled' | 'live' | 'finished';
  scoreHome: number;
  scoreAway: number;
  minutes: number;
  stats: MatchStats;
  league: string;
  date: string;
  time: string;
  customLabelHome?: string;
  customLabelDraw?: string;
  customLabelAway?: string;
  fixedStakeAmount?: number;
  isFeatured?: boolean;
  featuredTag?: string;
  isFeaturedBet?: boolean;
  featuredBetMultiplier?: number;
  featuredBetLabel?: string;
  headToHead?: HeadToHeadData;
  matchImage?: string;
  adTitle?: string;
  adDescription?: string;
  adBadge?: string;
  isAdFeatured?: boolean;
  isBettingClosed?: boolean;
  bettingStatus?: 'open' | 'closed' | 'suspended';
  bettingNote?: string;
}

export interface Bet {
  id: string;
  userId: string;
  matchId: string;
  teamHome: string;
  teamAway: string;
  selectedOutcome: 'home' | 'draw' | 'away';
  amount: number;
  odds: number;
  baseOdds?: number;
  featuredMultiplierApplied?: number;
  isFeaturedBet?: boolean;
  status: 'pending' | 'won' | 'lost';
  payout: number;
  placedAt: string;
  matchScore?: string;
  publicBetOfferId?: string;
}

export interface PublicBetOffer {
  id: string;
  title: string;
  matchId?: string;
  teamHome: string;
  teamAway: string;
  selectedOutcome: 'home' | 'draw' | 'away';
  outcomeLabel: string;
  odds: number;
  description?: string;
  status: 'active' | 'won' | 'lost' | 'cancelled';
  createdAt: string;
  participantsCount?: number;
  totalStakedCoins?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'bet' | 'match' | 'system';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  sources?: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  category: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountEgp: number;
  coinsRequested: number;
  senderPhone: string;
  receiptImage: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  adminNote?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountCoins: number;
  amountEgp: number;
  receiverPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  adminNote?: string;
}

export interface LeagueStandingItem {
  id: string;
  teamName: string;
  logo: string;
  league: string;
  rank: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string[]; // e.g. ['W', 'W', 'D', 'W', 'L']
  isSecuredLeader?: boolean;
  securityNote?: string;
}

export interface GuideStep {
  id: string;
  title: string;
  content: string;
  icon?: string;
  badgeText?: string;
  actionType?: 'deposit' | 'public_bets' | 'events' | 'withdraw' | 'none';
  actionLabel?: string;
}

export interface GuideCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: GuideStep[];
}

