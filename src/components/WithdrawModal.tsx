import React, { useState } from 'react';
import { User, WithdrawalRequest } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  Wallet, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  Send,
  Building2,
  Sparkles
} from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  withdrawalRequests: WithdrawalRequest[];
  onSubmitWithdrawalRequest: (amountCoins: number, receiverPhone: string) => void;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  currentUser,
  withdrawalRequests = [],
  onSubmitWithdrawalRequest
}: WithdrawModalProps) {
  const { t, dir } = useLanguage();
  const [amountInput, setAmountInput] = useState<number>(100);
  const [receiverPhone, setReceiverPhone] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [reviewNotification, setReviewNotification] = useState<boolean>(false);

  if (!isOpen) return null;

  const userRequests = withdrawalRequests.filter(r => r.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!receiverPhone || receiverPhone.length < 10) {
      setErrorMsg('يرجى إدخال رقم محفظة كاش صحيح (11 رقم) لاستلام الأرباح عليه.');
      return;
    }

    if (amountInput <= 0) {
      setErrorMsg('يرجى إدخال مبلغ صحيح لسحب الأرباح.');
      return;
    }

    if (currentUser.balance < amountInput) {
      setErrorMsg(`رصيدك الحالي (${currentUser.balance} 🪙) غير كافٍ لسحب مبلغ (${amountInput} 🪙).`);
      return;
    }

    setIsSubmitting(true);
    
    // Call parent handler to create withdrawal request
    onSubmitWithdrawalRequest(amountInput, receiverPhone);

    // Show 3-second reviewing notification alert as requested by user
    setReviewNotification(true);

    setTimeout(() => {
      setReviewNotification(false);
      setIsSubmitting(false);
      setReceiverPhone('');
      setAmountInput(100);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={dir}>
      <div className="relative w-full max-w-lg bg-zinc-950 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>سحب الأرباح كاش</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                  فوري ومضمون 💸
                </span>
              </h2>
              <p className="text-xs text-zinc-400">تحويل كوينزات أرباحك إلى مبالغ كاش مباشرة على محفظتك!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3-Second Floating Review Notification Banner */}
        {reviewNotification && (
          <div className="p-4 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border-b border-amber-500/40 animate-pulse text-center">
            <div className="inline-flex items-center gap-2 text-amber-300 font-black text-sm">
              <Clock className="h-5 w-5 animate-spin" />
              <span>جاري مراجعة طلب سحب الأرباح... ⏳</span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 font-semibold">
              تم إرسال طلبك بنجاح للقسم المالي. سيتم إرسال الكاش لمحفظتك فور التأكيد!
            </p>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Current Balance Display Card */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 p-4 rounded-2xl border border-zinc-850 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400 font-bold block">رصيد أرباحك القابل للسحب:</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 flex items-center gap-1.5">
                <Coins className="h-6 w-6 text-amber-400" />
                <span>{currentUser.balance.toLocaleString()} 🪙</span>
              </span>
            </div>
            <div className="text-left font-mono">
              <span className="text-[10px] text-zinc-500 block">القيمة بالكاش (EGP):</span>
              <span className="text-lg font-black text-emerald-400">{currentUser.balance.toLocaleString()} ج.م</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-zinc-200">1. حدد مبلغ الكوينز المراد سحبه:</label>
                <span className="text-emerald-400 font-mono font-bold text-[11px]">
                  1 كوين = 1 جنيه مصري 🇪🇬
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max={currentUser.balance}
                  value={Number.isNaN(amountInput) ? '' : amountInput}
                  onChange={(e) => setAmountInput(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-black text-amber-400 font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="أدخل مبلغ السحب..."
                  id="withdraw-amount-input"
                />
                <span className="absolute left-3 top-3.5 text-xs text-zinc-500 font-bold">🪙 كوينز</span>
              </div>

              {/* Quick Amount Selector */}
              <div className="flex gap-2 pt-1">
                {[50, 100, 250, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountInput(amt)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      amountInput === amt
                        ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmountInput(currentUser.balance)}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all mr-auto"
                >
                  الكل ({currentUser.balance})
                </button>
              </div>
            </div>

            {/* Receiver Phone Number Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span>2. أدخل رقم محفظتك الكاش لاستلام المبلغ (فودافون/أورانج/اتصالات/وي كاش):</span>
              </label>

              <input
                type="tel"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                placeholder="مثال: 01012345678"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-black text-white font-mono focus:outline-none focus:border-emerald-500"
                id="withdraw-phone-input"
              />
              <p className="text-[11px] text-zinc-500">
                تأكد من كتابة رقم المحفظة بشكل صحيح، سيتم تحويل {amountInput} ج.م مباشرة على هذا الرقم.
              </p>
            </div>

            {/* Error Notice */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || currentUser.balance <= 0}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-zinc-950 font-black py-3.5 text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
              id="submit-withdraw-btn"
            >
              <Send className="h-4 w-4" />
              <span>إرسال طلب سحب الأرباح الآن ({amountInput} ج.م) 💸</span>
            </button>
          </form>

          {/* User's Withdrawal History */}
          <div className="space-y-3 pt-4 border-t border-zinc-900">
            <h4 className="text-xs font-bold text-zinc-400 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>سجل طلبات سحب الأرباح السابقة ({userRequests.length})</span>
            </h4>

            {userRequests.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-3 bg-zinc-900/40 rounded-xl">
                لا توجد طلبات سحب سابقة لديك.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userRequests.map(req => (
                  <div
                    key={req.id}
                    className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-850 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="font-mono text-amber-400">{req.amountCoins} 🪙</span>
                        <span className="text-zinc-500">({req.amountEgp} ج.م)</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        محفظة: {req.receiverPhone} • {new Date(req.createdAt).toLocaleDateString('ar-EG')}
                      </div>
                    </div>

                    <div>
                      {req.status === 'pending' && (
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>قيد المراجعة</span>
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>تم التحويل ✅</span>
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg text-[10px] font-bold">
                          مرفوض ❌
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/60 border-t border-zinc-900 text-center">
          <p className="text-[10px] text-zinc-500 font-semibold flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>يتم تحويل الأرباح بأمان عبر شبكات كاش المعتمدة في جمهورية مصر العربية.</span>
          </p>
        </div>

      </div>
    </div>
  );
}
