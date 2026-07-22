import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Globe, 
  CornerDownLeft,
  Flame,
  Search
} from 'lucide-react';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  loadingChat: boolean;
}

export default function Chatbot({
  isOpen,
  onClose,
  chatHistory,
  onSendMessage,
  loadingChat
}: ChatbotProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loadingChat) return;

    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSuggestionClick = (text: string) => {
    if (loadingChat) return;
    onSendMessage(text);
  };

  // Simple, robust client-side helper to render model output with simple markdown support
  const renderMessageText = (text: string) => {
    // Replace markdown bold with JSX bold elements
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let content = line;
      // Handle simple bullet points
      const isBullet = line.trim().startsWith('*') || line.trim().startsWith('-');
      if (isBullet) {
        content = line.replace(/^[\s*-]+/, '').trim();
      }

      // Handle simple bold tags **text** -> <strong>text</strong>
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-emerald-400 font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const formattedLine = parts.length > 0 ? parts : content;

      if (isBullet) {
        return (
          <li key={lineIdx} className="mr-4 list-disc text-zinc-300 mt-1">
            {formattedLine}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="mt-1 leading-relaxed text-zinc-300">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div 
      className="fixed inset-y-0 left-0 z-50 w-full sm:w-[420px] border-r border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col justify-between" 
      dir="rtl"
      id="sports-chatbot-container"
    >
      {/* 1. Chat Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-sm">مساعد مينوو AI</h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-0.5">
              <Globe className="h-3 w-3 text-emerald-400" />
              <span>مدعوم بـ Google Search Grounding</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          id="close-chat-sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 2. Messages list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-zinc-950/50">
        
        {/* Welcome message */}
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-900 p-4 space-y-2">
          <p className="text-xs text-zinc-300 font-medium leading-relaxed">
            أهلاً بك! أنا <strong>محلل مينوو AI</strong>، مستشارك الرياضي الذكي ⚽
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            يمكنني إخبارك بأدق التفاصيل والنتائج الحقيقية مباشرة من محرك بحث Google بفضل دمج الذكاء الاصطناعي الأرضي. جرب سؤالي عن:
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
            {[
              'ما هي ترتيب الدوري الإنجليزي حالياً؟',
              'متى مباراة ريال مدريد وبرشلونة القادمة؟',
              'من فاز ببطولة ويمبلدون للتنس الأخيرة؟',
              'أعطني إحصائيات مواجهات مانشستر سيتي وأرسنال'
            ].map(suggest => (
              <button
                key={suggest}
                onClick={() => handleSuggestionClick(suggest)}
                className="rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-emerald-500 hover:text-zinc-950 transition-colors px-2 py-1 font-semibold"
              >
                {suggest}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Bubbles */}
        {chatHistory.map(msg => {
          const isModel = msg.role === 'model';
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[85%] ${isModel ? 'mr-0 ml-auto items-start' : 'mr-auto ml-0 items-end'}`}
            >
              <div 
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed border ${
                  isModel 
                    ? 'bg-zinc-900/50 border-zinc-900 text-zinc-100 rounded-tr-none' 
                    : 'bg-emerald-500 text-zinc-950 border-emerald-500 rounded-tl-none font-medium shadow-md shadow-emerald-500/5'
                }`}
              >
                {isModel ? renderMessageText(msg.text) : <p>{msg.text}</p>}

                {/* Grounded Sources indicators if any */}
                {isModel && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-800 text-[9px] text-zinc-500 space-y-0.5">
                    <span className="font-semibold text-emerald-400/80 flex items-center gap-0.5">
                      <Search className="h-2.5 w-2.5" />
                      المصادر الرياضية من بحث Google:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.slice(0, 3).map((src, i) => (
                        <span key={i} className="underline max-w-[200px] truncate" title={src}>
                          {src.replace(/https?:\/\/(www\.)?/, '')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-zinc-600 mt-1 px-1">{msg.timestamp}</span>
            </div>
          );
        })}

        {/* Loader bubble while generating */}
        {loadingChat && (
          <div className="flex flex-col items-start max-w-[85%] mr-0 ml-auto">
            <div className="rounded-2xl rounded-tr-none px-4 py-3 bg-zinc-900 border border-zinc-900 text-zinc-400 text-xs flex items-center gap-2">
              <Loader2 className="h-4.5 w-4.5 animate-spin text-emerald-400" />
              <span>جاري تصفح وبحث كووورة وماركا عن الإجابة الحية...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Input footer */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-900 bg-zinc-950">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اسأل المحلل الرياضي عن مباريات، دوريات، لاعبين..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-3 pr-4 pl-12 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            id="chat-input-field"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loadingChat}
            className="absolute left-2.5 top-2 rounded-lg bg-emerald-500 p-1.5 text-zinc-950 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors"
            id="chat-send-btn"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

    </div>
  );
}
