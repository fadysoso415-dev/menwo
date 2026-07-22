import React, { useState } from 'react';
import { LeagueStandingItem } from '../types';
import { Trophy, ShieldCheck, Lock, Search, Filter, Sparkles, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react';

interface LeagueStandingsSectionProps {
  standings: LeagueStandingItem[];
}

export default function LeagueStandingsSection({ standings }: LeagueStandingsSectionProps) {
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const leaguesList = Array.from(new Set(standings.map(s => s.league)));

  const filteredStandings = standings.filter(item => {
    const matchesLeague = selectedLeague === 'all' || item.league === selectedLeague;
    const matchesSearch = item.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.league.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLeague && matchesSearch;
  }).sort((a, b) => a.rank - b.rank);

  // Group standings by league if 'all' is selected
  const groupedStandings = leaguesList.reduce((acc, league) => {
    const list = filteredStandings.filter(item => item.league === league);
    if (list.length > 0) {
      acc[league] = list;
    }
    return acc;
  }, {} as Record<string, LeagueStandingItem[]>);

  return (
    <section 
      className="rounded-3xl border border-zinc-900 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
      id="league-standings-section"
    >
      {/* Background glow effect */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>جدول ترتيب وصدارة الدوريات</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>مؤمن بالأمن الميداني 🛡️</span>
              </span>
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              تابع ترتيب الفرق، النقاط، وفارق الأهداف مع توثيق حماية المتصدر رسمياً
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 bg-zinc-900/60 hover:bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-850 transition-all self-start sm:self-auto"
        >
          <span>{isExpanded ? 'إخفاء الترتيب' : 'عرض الترتيب الكامل'}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Controls: League Filter & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* League Tabs */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedLeague('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedLeague === 'all'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-zinc-900/50 text-zinc-400 hover:text-white border border-zinc-850'
                }`}
              >
                جميع الدوريات ({standings.length})
              </button>
              {leaguesList.map(league => (
                <button
                  key={league}
                  onClick={() => setSelectedLeague(league)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedLeague === league
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-zinc-900/50 text-zinc-400 hover:text-white border border-zinc-850'
                  }`}
                >
                  {league}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="ابحث عن فريق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
          </div>

          {/* Standings Tables grouped by League */}
          {Object.keys(groupedStandings).length === 0 ? (
            <div className="bg-zinc-900/30 rounded-2xl p-8 text-center text-xs text-zinc-500 border border-zinc-900">
              لا يوجد نتائج مطابقة للبحث أو التصفية الحالية.
            </div>
          ) : (
            Object.entries(groupedStandings).map(([leagueName, items]) => (
              <div key={leagueName} className="space-y-3">
                {/* League Title Header */}
                <div className="flex items-center justify-between bg-zinc-900/40 px-4 py-2.5 rounded-xl border border-zinc-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span>{leagueName}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">{items.length} فرق مسجلة</span>
                </div>

                {/* Table Layout */}
                <div className="overflow-x-auto rounded-2xl border border-zinc-900 bg-zinc-950">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 font-semibold bg-zinc-900/20 text-[11px]">
                        <th className="py-3 px-3 text-center w-12">#</th>
                        <th className="py-3 px-4">الفريق</th>
                        <th className="py-3 px-3 text-center">لعب</th>
                        <th className="py-3 px-3 text-center">فوز</th>
                        <th className="py-3 px-3 text-center">تعادل</th>
                        <th className="py-3 px-3 text-center">خسارة</th>
                        <th className="py-3 px-3 text-center">أهداف (+/-)</th>
                        <th className="py-3 px-3 text-center">الفارق</th>
                        <th className="py-3 px-4 text-center font-bold text-white">النقاط</th>
                        <th className="py-3 px-3 text-center hidden sm:table-cell">الحالة والأمن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {items.map((team) => (
                        <tr 
                          key={team.id}
                          className={`hover:bg-zinc-900/50 transition-colors ${
                            team.rank === 1 ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          {/* Rank # */}
                          <td className="py-3 px-3 text-center font-bold">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] ${
                              team.rank === 1 
                                ? 'bg-amber-500 text-black font-black' 
                                : team.rank === 2 
                                ? 'bg-zinc-300 text-black font-bold'
                                : team.rank === 3
                                ? 'bg-amber-700 text-white font-bold'
                                : 'bg-zinc-900 text-zinc-400'
                            }`}>
                              {team.rank}
                            </span>
                          </td>

                          {/* Team Info */}
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                            <span className="text-lg shrink-0">{team.logo}</span>
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1.5">
                                <span className="hover:text-amber-400 transition-colors">{team.teamName}</span>
                                {team.isSecuredLeader && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 font-bold">
                                    <ShieldCheck className="h-3 w-3" />
                                    <span>صدارة مؤمنة 🛡️</span>
                                  </span>
                                )}
                              </span>
                              {team.securityNote && (
                                <span className="text-[10px] text-amber-400/80 font-normal">{team.securityNote}</span>
                              )}
                            </div>
                          </td>

                          {/* Played */}
                          <td className="py-3 px-3 text-center text-zinc-300 font-mono">{team.played}</td>

                          {/* Won */}
                          <td className="py-3 px-3 text-center text-emerald-400 font-mono font-bold">{team.won}</td>

                          {/* Drawn */}
                          <td className="py-3 px-3 text-center text-amber-400 font-mono">{team.drawn}</td>

                          {/* Lost */}
                          <td className="py-3 px-3 text-center text-red-400 font-mono">{team.lost}</td>

                          {/* Goals */}
                          <td className="py-3 px-3 text-center text-zinc-400 font-mono dir-ltr">{team.goalsFor}:{team.goalsAgainst}</td>

                          {/* Goal Difference */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-zinc-300">
                            {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                          </td>

                          {/* Points */}
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                              {team.points}
                            </span>
                          </td>

                          {/* Form & Security status */}
                          <td className="py-3 px-3 text-center hidden sm:table-cell">
                            {team.form && team.form.length > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                {team.form.map((f, fIdx) => (
                                  <span
                                    key={fIdx}
                                    className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                                      f === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                      f === 'D' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                      'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-zinc-600 text-[10px]">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
