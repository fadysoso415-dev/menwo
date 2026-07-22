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

export interface Match {
  id: string;
  sport: 'football' | 'basketball' | 'tennis';
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
