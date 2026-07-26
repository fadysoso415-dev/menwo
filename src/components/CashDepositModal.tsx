import React, { useState } from 'react';
import { DepositRequest, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Wallet, 
  Upload, 
  Coins, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  X, 
  Phone, 
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';

interface CashDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  cashWalletNumber: string;
  depositRequests: DepositRequest[];
  onSubmitDepositRequest: (request: DepositRequest) => void;
}

export default function CashDepositModal({
  isOpen,
  onClose,
  currentUser,
  cashWalletNumber,
  depositRequests,
  onSubmitDepositRequest
}: CashDepositModalProps) {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<'new-deposit' | 'my-requests'>('new-deposit');

  // Form states
  const [amountEgp, setAmountEgp] = useState<number>(50);
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter requests for current user
  const userRequests = depositRequests.filter(r => r.userId === currentUser.id);

  // Handle Copy Phone Number
  const handleCopyNumber = () => {
    navigator.clipboard.writeText(cashWalletNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // Handle Image Upload (Convert to Base64 data URL)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('حجم صورة الإيصال كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت.');
      return;
    }

    setImageFileName(file.name);
    setFormError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Request
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (amountEgp < 50) {
      setFormError('الحد الأدنى لشحن الكوينز هو 50 جنيه مصري (50 كوينز).');
      return;
    }

    if (!senderPhone.trim() || senderPhone.trim().length < 8) {
      setFormError('يرجى كتابة رقم المحفظة التي تم التحويل منها بشكل صحيح.');
      return;
    }

    if (!receiptImage) {
      setFormError('يرجى رفع صورة إيصال التحويل لتقوم الإدارة بمراجعته وتأكيده.');
      return;
    }

    const newRequest: DepositRequest = {
      id: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      amountEgp,
      coinsRequested: amountEgp, // 1 EGP = 1 Coin
      senderPhone: senderPhone.trim(),
      receiptImage,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onSubmitDepositRequest(newRequest);
    setFormSuccess(true);
    setReceiptImage('');
    setImageFileName('');
    setSenderPhone('');

    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab('my-requests');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" dir={dir}>
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-amber-500/10 p-2 border border-amber-500/20 text-amber-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">محفظة كاش لشراء الكوينز</h3>
              <p className="text-xs text-zinc-500">حَوِّل عبر فودافون كاش / اتصالات / أورنج وارفع الإيصال لشحن حسابك فورياً</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-900 p-1 rounded-xl my-4 border border-zinc-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('new-deposit')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'new-deposit'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>طلب شحن جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('my-requests')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'my-requests'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>طلباتي السابقة ({userRequests.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">

          {activeTab === 'new-deposit' && (
            <div className="space-y-5">
              
              {/* Cash Wallet Number Box */}
              <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 rounded-xl p-4 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-amber-400" />
                    <span>رقم محفظة الكاش المعتمد للتحويل:</span>
                  </span>
                  <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[10px]">
                    فودافون كاش / أورنج / اتصالات / WE
                  </span>
                </div>

                <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="text-xl font-black text-white font-mono tracking-widest">{cashWalletNumber}</span>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="flex items-center gap-1 text-xs bg-amber-500/20 hover:bg-amber-500 hover:text-zinc-950 text-amber-400 font-bold px-3 py-1.5 rounded-lg transition-all"
                  >
                    {copiedNumber ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>نسخ الرقم</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  💡 قم بتحويل المبلغ المطلوب إلى الرقم أسترناه، ثم قم بتعبئة بيانات التحويل وارفع صورة الإيصال.
                </p>
              </div>

              {/* Success Notification */}
              {formSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>تم إرسال طلب الشحن بنجاح! سيتم مراجعته من قبل الإدارة وإيداع الكوينز في حسابك فوراً.</span>
                </div>
              )}

              {/* Error Notification */}
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                
                {/* Amount EGP */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-bold block">1. حدد مبلغ الشحن (بالجنيه المصري):</label>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                      سعر الكوين: 1 جنيه = 1 كوين (أقل مبلغ 50) 🪙
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="50"
                      step="10"
                      value={Number.isNaN(amountEgp) ? '' : amountEgp}
                      onChange={(e) => setAmountEgp(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-black text-amber-400 focus:outline-none focus:border-amber-500"
                      required
                      id="deposit-amount-egp-input"
                    />
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-black whitespace-nowrap">
                      = {amountEgp} 🪙 كوينز
                    </div>
                  </div>

                  {/* Preset Quick Buttons */}
                  <div className="flex gap-1.5 pt-1">
                    {[50, 100, 250, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmountEgp(amt)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                          amountEgp === amt
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {amt} ج.م
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sender Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">2. رقم المحفظة التي قمت بالتحويل منها:</label>
                  <input
                    type="text"
                    placeholder="مثال: 01012345678"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                    required
                    id="deposit-sender-phone-input"
                  />
                </div>

                {/* Receipt Image Upload */}
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">3. صورة إيصال التحويل (Receipt Image):</label>

                  <div className="relative border-2 border-dashed border-zinc-800 hover:border-amber-500/50 bg-zinc-900/50 rounded-xl p-4 text-center cursor-pointer transition-colors group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="deposit-receipt-file-input"
                    />

                    {receiptImage ? (
                      <div className="space-y-2">
                        <img
                          src={receiptImage}
                          alt="Receipt preview"
                          className="mx-auto max-h-36 rounded-lg object-contain border border-zinc-700 shadow"
                        />
                        <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>تم اختيار صورة الإيصال: {imageFileName}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">انقر لتغيير الصورة</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-2">
                        <Upload className="h-7 w-7 text-amber-400 mx-auto group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-zinc-300">انقر هنا لرفع صورة الإيصال أو اسحب الملف</div>
                        <div className="text-[10px] text-zinc-500">يدعم الصور بصيغة PNG, JPG, JPEG (حد أقصى 5 ميجا)</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-500 text-zinc-950 font-black py-3 text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  id="submit-deposit-request-btn"
                >
                  <Coins className="h-4 w-4" />
                  <span>تأكيد وإرسال طلب الشحن 🚀</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'my-requests' && (
            <div className="space-y-3">
              {userRequests.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Clock className="h-10 w-10 text-zinc-600 mx-auto" />
                  <p className="text-xs font-bold text-zinc-400">لا توجد طلبات شحن سابقة</p>
                  <p className="text-[10px] text-zinc-600">عند إرسال طلب جديد سيظهر هنا لمتابعة حالته.</p>
                </div>
              ) : (
                userRequests.map(req => (
                  <div key={req.id} className="bg-zinc-900/60 rounded-xl p-3.5 border border-zinc-850 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="font-black text-amber-400 text-sm">{req.amountEgp} ج.م ({req.coinsRequested} 🪙)</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : req.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                      }`}>
                        {req.status === 'approved' ? '🟢 تم القبول والإيداع' : req.status === 'rejected' ? '🔴 تم الرفض' : '⏳ قيد المراجعة'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">المحول منه:</span>
                        <span className="font-mono text-zinc-200">{req.senderPhone}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">تاريخ الطلب:</span>
                        <span>{new Date(req.createdAt).toLocaleString('ar-EG')}</span>
                      </div>
                    </div>

                    {req.receiptImage && (
                      <div className="pt-1">
                        <span className="text-[10px] text-zinc-500 block mb-1">صورة الإيصال المرفقة:</span>
                        <img 
                          src={req.receiptImage} 
                          alt="Receipt" 
                          className="h-16 rounded object-cover border border-zinc-800 hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    {req.adminNote && (
                      <div className="text-[10px] bg-red-500/10 text-red-300 p-2 rounded border border-red-500/20">
                        ملاحظة الإدارة: {req.adminNote}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="border-t border-zinc-900 pt-3 mt-4 text-[10px] text-zinc-500 text-center">
          تطبق شروط الشحن الفوري — يتم إضافة الكوينز مباشرة بمجرد تأكيد المطابقة.
        </div>

      </div>
    </div>
  );
}
