import { useState } from 'react';
import {
  Bot,
  X,
  Search,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import type { Project, AIQueryResult } from '@/types/database';
import { api } from '@/lib/api';
import { queryAILocalFallback } from '@/lib/aiEngine';
import { formatLakhs } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface AISearchModalProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject?: (projectId: string) => void;
}

export function AISearchModal({ open, onClose, projects, onSelectProject }: AISearchModalProps) {
  const { t, isHindi } = useLanguage();
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<AIQueryResult | null>(null);
  const [localFallbackResults, setLocalFallbackResults] = useState<Project[] | null>(null);
  const [searching, setSearching] = useState(false);

  if (!open) return null;

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    if (!q) return;

    setSearching(true);
    setAiResponse(null);
    setLocalFallbackResults(null);

    try {
      const response = await api.queryAI(q);
      setAiResponse(response);
    } catch (e) {
      console.warn('Backend AI query failed, using local NLP engine fallback:', e);
      const fallbackResponse = queryAILocalFallback(projects, q);
      setAiResponse(fallbackResponse);
    } finally {
      setSearching(false);
    }
  };

  const suggestions = isHindi
    ? [
        'किस साइट पर सबसे ज्यादा विसंगति या फ्रॉड दर है?',
        'गाजियाबाद में अति गंभीर जोखिम परियोजनाएं',
        'स्वीकृत बजट से अधिक लागत वाले कार्य',
        'सोलर स्ट्रीट लाइट ठेकेदार विलंब',
        'जल निगम के विकास कार्य',
      ]
    : [
        'Which site has the maximum fraud rate?',
        'Critical risk projects in Ghaziabad',
        'Cost overrun above sanctioned budget',
        'Solar street light contractor delay',
        'Jal Nigam execution works',
      ];

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in-up"
        style={{ animationDuration: '0.2s' }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <Bot className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{t.aiAssistantTitle}</h3>
              <p className="text-xs text-slate-500">
                {t.aiAssistantSubtitle}
              </p>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t.aiInputPlaceholder}
                className="w-full pl-10 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={searching}
              className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> {t.askAiBtn}
            </button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  handleSearch(s);
                }}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* AI Result Container */}
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 min-h-[140px] max-h-[420px] overflow-y-auto space-y-4">
            {searching ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2">
                <span className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-emerald-800 text-xs">
                  {isHindi ? 'एआई सतर्कता इंजन डेटाबेस और ऑन-साइट ऑडिट का विश्लेषण कर रहा है...' : 'AI Surveillance Engine analyzing database & field audits...'}
                </p>
              </div>
            ) : !aiResponse && !localFallbackResults ? (
              <p className="italic text-slate-400 py-6 text-center">
                {isHindi
                  ? 'खोज प्रश्न रीयल-टाइम एआई सतर्कता संश्लेषण, विसंगति मिलान और सांविधिक सिफारिशें प्रदर्शित करेंगे।'
                  : 'Search queries will trigger real-time AI vigilance synthesis, anomaly matching, and statutory recommendations.'}
              </p>
            ) : aiResponse ? (
              <div className="space-y-4 animate-fade-in-up">
                {/* AI Answer */}
                <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
                  <p className="font-bold text-emerald-950 text-xs leading-relaxed flex items-start gap-2">
                    <Bot className="h-4 w-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <span>{aiResponse.answer}</span>
                  </p>
                </div>

                {/* Recommended Statutory Order */}
                {aiResponse.recommended_action && (
                  <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> {t.recommendedActionTitle}:
                    </p>
                    <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                      {aiResponse.recommended_action}
                    </p>
                  </div>
                )}

                {/* Key Findings List */}
                {aiResponse.key_findings.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t.keyFindingsTitle}:
                    </p>
                    <div className="space-y-1">
                      {aiResponse.key_findings.map((f, i) => (
                        <p key={i} className="text-xs text-slate-800 bg-white p-2 rounded-lg border border-slate-200 flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Project Cards */}
                {aiResponse.matched_projects.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t.matchedProjectsTitle} ({aiResponse.matched_projects.length}):
                    </p>
                    <div className="space-y-2">
                      {aiResponse.matched_projects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectProject?.(p.id);
                            onClose();
                          }}
                          className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {p.name}
                              </h5>
                              {p.risk_level === 'CRITICAL' && (
                                <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.2 rounded">
                                  {t.severityCritical}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {p.location} · {p.agency || 'Contractor'}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-2 flex-shrink-0">
                            <div>
                              <p className="text-xs font-bold text-slate-700">
                                {formatLakhs(p.spent_amount_cr)} / {formatLakhs(p.sanctioned_amount_cr)}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium">{t.colSpent} / {t.colSanctioned}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : localFallbackResults && localFallbackResults.length > 0 ? (
              <div className="space-y-2 animate-fade-in-up">
                <p className="font-bold text-slate-800 mb-2">
                  Found {localFallbackResults.length} matching records in Ghaziabad database.
                </p>
                <div className="space-y-2">
                  {localFallbackResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectProject?.(item.id);
                        onClose();
                      }}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-500 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {item.location} · {item.implementing_agency}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-brand-600">
                        {formatLakhs(item.spent_amount_cr)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-red-500 py-4 text-center">
                {t.noProjectsMatch}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function AIFloatingButton({ onClick }: { onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        className="bg-slate-900 border-2 border-emerald-400 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center justify-center gap-2 animate-pulse-ring hover:scale-105 transition-transform cursor-pointer"
        title={t.aiAssistantTitle}
      >
        <Bot className="h-5 w-5 text-emerald-400" />
        <span className="hidden sm:inline text-xs font-bold text-emerald-300">{t.floatingAiBtnText}</span>
      </button>
    </div>
  );
}
