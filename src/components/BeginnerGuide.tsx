import React, { useState } from 'react';
import { GuideCategory, GuideStep } from '../types';
import { 
  BookOpen, 
  Wallet, 
  TrendingUp, 
  Sparkles, 
  HelpCircle, 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  Upload, 
  Coins, 
  Award, 
  Percent, 
  ShieldCheck, 
  ArrowUpRight, 
  MessageSquare,
  ExternalLink,
  Edit3,
  ChevronRight,
  Info
} from 'lucide-react';

interface BeginnerGuideProps {
  guideCategories: GuideCategory[];
  onOpenCashDepositModal?: () => void;
  onOpenWithdrawModal?: () => void;
  onNavigateTab?: (tab: string) => void;
  isAdmin?: boolean;
  onOpenAdminGuideEdit?: () => void;
}

export default function BeginnerGuide({
  guideCategories,
  onOpenCashDepositModal,
  onOpenWithdrawModal,
  onNavigateTab,
  isAdmin,
  onOpenAdminGuideEdit
}: BeginnerGuideProps) {
  const [selectedCatId, setSelectedCatId] = useState<string>(guideCategories[0]?.id || 'wallet-guide');
  const [searchQuery, setSearchQuery] = useState('');

  const getIcon = (iconName?: string): React.ReactNode => {
    switch (iconName) {
      case 'Wallet': return <Wallet className="h-5 w-5 text-emerald-400" />;
      case 'TrendingUp': return <TrendingUp className="h-5 w-5 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="h-5 w-5 text-purple-400" />;
      case 'Upload': return <Upload className="h-5 w-5 text-cyan-400" />;
      case 'Coins': return <Coins className="h-5 w-5 text-amber-400" />;
      case 'Award': return <Award className="h-5 w-5 text-emerald-400" />;
      case 'Percent': return <Percent className="h-5 w-5 text-blue-400" />;
      case 'ShieldCheck': return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
      case 'ArrowUpRight': return <ArrowUpRight className="h-5 w-5 text-emerald-400" />;
      case 'MessageSquare': return <MessageSquare className="h-5 w-5 text-amber-400" />;
      default: return <CheckCircle className="h-5 w-5 text-emerald-400" />;
    }
  };

  const selectedCategory = guideCategories.find(c => c.id === selectedCatId) || guideCategories[0];

  // Filter steps if user types in search query
  const filteredCategories = guideCategories.map(cat => ({
    ...cat,
    steps: cat.steps.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.steps.length > 0 || searchQuery === '');

  const handleActionClick = (step: GuideStep) => {
    if (step.actionType === 'deposit' && onOpenCashDepositModal) {
      onOpenCashDepositModal();
    } else if (step.actionType === 'withdraw' && onOpenWithdrawModal) {
      onOpenWithdrawModal();
    } else if (step.actionType === 'public_bets' && onNavigateTab) {
      onNavigateTab('events');
    } else if (step.actionType === 'events' && onNavigateTab) {
      onNavigateTab('events');
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 sm:p-6 space-y-6 shadow-xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">دليل المبتدئين والتعليمات الشاملة</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                سهل ومباشر
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              خطوات توضيحية كاملة لشحن المحفظة، المشاركة في الرهانات العامة، وفهم آلية التوقعات والعوائد.
            </p>
          </div>
        </div>

        {isAdmin && onOpenAdminGuideEdit && (
          <button
            onClick={onOpenAdminGuideEdit}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all"
            title="تعديل محتوى هذا الدليل من لوحة التحكم"
          >
            <Edit3 className="h-4 w-4" />
            <span>تعديل التعليمات (لوحة الأدمن)</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في التعليمات والخطوات (مثال: شحن، رهان عام، أودز، سحب)..."
          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
          >
            مسح
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {guideCategories.map((cat) => {
          const isActive = cat.id === selectedCatId && !searchQuery;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCatId(cat.id);
                setSearchQuery('');
              }}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                  : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{cat.title.split(' ')[0]}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/80 text-zinc-400'
                }`}>
                  {cat.steps.length} خطوات
                </span>
              </div>
              <p className={`text-xs font-bold leading-snug line-clamp-1 ${isActive ? 'text-emerald-400' : 'text-zinc-200'}`}>
                {cat.title.substring(cat.title.indexOf(' ') + 1)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Selected Category Header */}
      {!searchQuery && selectedCategory && (
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{selectedCategory.title}</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {selectedCategory.description}
            </p>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-3.5">
        {searchQuery ? (
          // Search Results View
          filteredCategories.flatMap(c => c.steps).length > 0 ? (
            filteredCategories.flatMap(c => c.steps).map((step) => (
              <StepCard 
                key={step.id} 
                step={step} 
                getIcon={getIcon} 
                handleActionClick={handleActionClick} 
              />
            ))
          ) : (
            <div className="text-center py-8 bg-zinc-900/20 rounded-xl border border-zinc-900">
              <Info className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 font-medium">لم يتم العثور على أية خطوات تطابق بحثك</p>
            </div>
          )
        ) : (
          // Category Specific View
          selectedCategory?.steps.map((step) => (
            <StepCard 
              key={step.id} 
              step={step} 
              getIcon={getIcon} 
              handleActionClick={handleActionClick} 
            />
          ))
        )}
      </div>

      {/* Footnote Banner */}
      <div className="bg-gradient-to-r from-emerald-950/30 via-zinc-900/40 to-zinc-950 border border-emerald-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 hidden sm:block">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">هل تحتاج مساعدة إضافية أو لديك استفسار محدد؟</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">شات بوت الذكاء الاصطناعي الأرضي متاح دائماً في أسفل الشاشة لإجابتك فورياً.</p>
          </div>
        </div>

        {onOpenCashDepositModal && (
          <button
            onClick={onOpenCashDepositModal}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 flex-shrink-0"
          >
            <Wallet className="h-4 w-4" />
            <span>شحن رصيدك الآن</span>
          </button>
        )}
      </div>
    </div>
  );
}

function StepCard({
  step,
  getIcon,
  handleActionClick
}: {
  key?: string;
  step: GuideStep;
  getIcon: (iconName?: string) => React.ReactNode;
  handleActionClick: (step: GuideStep) => void;
}) {
  return (
    <div className="bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-900 hover:border-zinc-800 rounded-xl p-4 transition-all space-y-3 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-zinc-800/80 rounded-xl group-hover:bg-zinc-800 transition-colors flex-shrink-0 mt-0.5">
            {getIcon(step.icon)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white">{step.title}</h4>
              {step.badgeText && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {step.badgeText}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {step.content}
            </p>
          </div>
        </div>

        {step.actionType && step.actionType !== 'none' && (
          <button
            onClick={() => handleActionClick(step)}
            className="flex-shrink-0 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mt-1"
          >
            <span>{step.actionLabel || 'تنفيذ الإجراء'}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
