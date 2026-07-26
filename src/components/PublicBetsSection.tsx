import React, { useState } from 'react';
import { PublicBetOffer, User, Bet } from '../types';
import { 
  Trophy, 
  Flame, 
  Coins, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';

interface PublicBetsSectionProps {
  publicBetOffers: PublicBetOffer[];
  currentUser: User | null;
  onJoinPublicBet: (offerId: string, stakeAmount: number) => void;
  onOpenAuth: () => void;
  userBets?: Bet[];
}

export default function PublicBetsSection({
  publicBetOffers,
  currentUser,
  onJoinPublicBet,
  onOpenAuth,
  userBets = []
}: PublicBetsSectionProps) {
  // State for stake amounts per offer ID
  const [stakeAmounts, setStakeAmounts] = useState<{ [offerId: string]: number }>({});
  const [successMsg, setSuccessMsg] = useState<{ [offerId: string]: string }>({});
  const [errorMsg, setErrorMsg] = useState<{ [offerId: string]: string }>({});

  const activeOffers = publicBetOffers.filter(o => o.status === 'active');

  if (activeOffers.length === 0) {
    return null;
  }

  const handleStakeChange = (offerId: string, value: number) => {
    setStakeAmounts(prev => ({ ...prev, [offerId]: Math.max(1, value) }));
    setErrorMsg(prev => ({ ...prev, [offerId]: '' }));
  };

  const handleJoinSubmit = (e: React.FormEvent, offer: PublicBetOffer) => {
    e.preventDefault();
    const offerId = offer.id;
    setSuccessMsg(prev => ({ ...prev, [offerId]: '' }));
    setErrorMsg(prev => ({ ...prev, [offerId]: '' }));

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const stake = stakeAmounts[offerId] || 100;

    if (stake <= 0) {
      setErrorMsg(prev => ({ ...prev, [offerId]: 'يرجى إدخال مبلغ رهان صحيح أكبر من 0.' }));
      return;
    }

    if (currentUser.balance < stake) {
      setErrorMsg(prev => ({
        ...prev,
        [offerId]: `رصيدك الحالي (${currentUser.balance} 🪙) غير كافٍ. يرجى تقديم طلب شحن رصيد من المحفظة أولاً.`
      }));
      return;
    }

    onJoinPublicBet(offerId, stake);

    const potentialPayout = Math.round(stake * offer.odds);
    setSuccessMsg(prev => ({
      ...prev,
      [offerId]: `تم الاشتراك بالرهان بنجاح بمبلغ ${stake} 🪙! ربحك المتوقع عند الفوز هو ${potentialPayout} 🪙.`
    }));

    setTimeout(() => {
      setSuccessMsg(prev => ({ ...prev, [offerId]: '' }));
    }, 4000);
  };

  return (
    <div className="w-full space-y-4 my-6" dir="rtl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-2 border border-amber-500/30 text-amber-400">
            <Flame className="h-5 w-5 animate-bounce" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>الرهانات والتحديات العامة من الإدارة</span>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                متاحة للجميع 🔥
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              رهانات عامة منشورة لجميع المشتركين — حدد مبلغ الرهان الخاص بك وضاعف كوينزاتك عند الفوز!
            </p>
          </div>
        </div>

        <div className="text-xs text-zinc-500 font-bold bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800 self-start sm:self-auto">
          عدد الرهانات العامة النشطة: <span className="text-amber-400 font-black">{activeOffers.length}</span>
        </div>
      </div>

      {/* Grid of Public Bets Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeOffers.map(offer => {
          const currentStake = stakeAmounts[offer.id] ?? 100;
          const potentialPayout = Math.round(currentStake * offer.odds);

          // Check if current user already joined this public bet
          const userJoinedBets = userBets.filter(
            b => b.publicBetOfferId === offer.id && currentUser && b.userId === currentUser.id
          );
          const totalUserJoinedCoins = userJoinedBets.reduce((acc, b) => acc + b.amount, 0);

          return (
            <div
              key={offer.id}
              className="group relative rounded-2xl border border-amber-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-5 space-y-4 shadow-xl hover:border-amber-500/60 transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

              <div className="space-y-3">
                {/* Badge Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 font-black px-2.5 py-1 rounded-lg border border-amber-500/20 text-[11px]">
                    <Target className="h-3.5 w-3.5" />
                    <span>رهان عام معروض للجميع</span>
                  </span>

                  <span className="font-mono text-zinc-500 text-[10px]">
                    {new Date(offer.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                {/* Challenge Title & Teams */}
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {offer.title}
                  </h3>
                  <div className="text-xs font-bold text-zinc-400 mt-1 flex items-center gap-1.5">
                    <span>{offer.teamHome}</span>
                    <span className="text-zinc-600 font-mono">VS</span>
                    <span>{offer.teamAway}</span>
                  </div>
                </div>

                {/* Description if any */}
                {offer.description && (
                  <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                    {offer.description}
                  </p>
                )}

                {/* Offered Bet Choice & Odds */}
                <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold">خيار الرهان المحدد:</span>
                    <span className="text-sm font-black text-white">{offer.outcomeLabel}</span>
                  </div>

                  <div className="text-left">
                    <span className="text-[10px] text-zinc-400 block font-bold">نسبة العائد (الأودز):</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      x{offer.odds.toFixed(2)}
                      {offer.odds === 2 && <span className="text-[10px] text-amber-300 mr-1">(ضعف المبلغ!)</span>}
                    </span>
                  </div>
                </div>

                {/* Social Proof: Participants */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-900/40 px-3 py-1.5 rounded-lg border border-zinc-850">
                  <span className="flex items-center gap-1 font-bold">
                    <Users className="h-3.5 w-3.5 text-amber-400" />
                    <span>المشتركين: {(offer.participantsCount || 0) + (userJoinedBets.length > 0 ? 1 : 0)} مستخدم</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-amber-300 font-bold">
                    <Coins className="h-3.5 w-3.5" />
                    <span>{(offer.totalStakedCoins || 0) + totalUserJoinedCoins} 🪙</span>
                  </span>
                </div>

                {/* Previous participation status / Lock form if already joined */}
              </div>

              {/* Form or Already Subscribed Lock Banner */}
              {userJoinedBets.length > 0 ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-xs font-bold space-y-1.5 pt-3 border-t border-zinc-900">
                  <div className="flex items-center gap-2 text-emerald-300 font-black">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>أنت مشترك بالفعل بـ ({totalUserJoinedCoins} 🪙) 🔒</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-normal leading-relaxed">
                    تم اعتماد اشتراكك بنجاح. يُسمح باشتراك واحد فقط لكل مباراة أو تحدي، ولا يمكن تعديله أو إلغاؤه بعد الاعتماد.
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => handleJoinSubmit(e, offer)} className="space-y-3 pt-2 border-t border-zinc-900">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-zinc-300 font-bold">حدد مبلغ رهانك (بالكوينز):</label>
                    <span className="text-emerald-400 font-mono font-extrabold text-[11px]">
                      ربحك المتوقع: +{potentialPayout} 🪙
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="10"
                      value={Number.isNaN(currentStake) ? '' : currentStake}
                      onChange={(e) => handleStakeChange(offer.id, parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-black text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                      placeholder="أدخل مبلغ الرهان..."
                      id={`public-bet-stake-input-${offer.id}`}
                    />
                    <span className="text-xs font-bold text-zinc-400 whitespace-nowrap">🪙 كوينز</span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex gap-1.5 pt-0.5">
                    {[50, 100, 250, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleStakeChange(offer.id, amt)}
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-all ${
                          currentStake === amt
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                {successMsg[offer.id] && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{successMsg[offer.id]}</span>
                  </div>
                )}

                {errorMsg[offer.id] && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg[offer.id]}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black py-2.5 text-xs rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
                  id={`join-public-bet-btn-${offer.id}`}
                >
                  <Coins className="h-4 w-4" />
                  <span>الاشتراك بالرهان بـ ({currentStake} 🪙) 🚀</span>
                </button>
              </form>
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
