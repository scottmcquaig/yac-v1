import { useState, useEffect } from 'react';
import { draftApi } from '../lib/api';

export default function DraftBoard({ leagueId }) {
  const [draftStatus, setDraftStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDraftStatus();
    const interval = setInterval(loadDraftStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [leagueId]);

  const loadDraftStatus = async () => {
    try {
      const data = await draftApi.getStatus(leagueId);
      setDraftStatus(data);
    } catch (error) {
      console.error('Failed to load draft status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading draft board...</div>;
  }

  if (!draftStatus || !draftStatus.teams || draftStatus.teams.length === 0) {
    return <div className="text-gray-400">No draft data available</div>;
  }

  const { teams, currentPickTeam, totalPlayers, draftedPlayers } = draftStatus;

  // Calculate max rounds
  const maxPicks = Math.max(...teams.map(t => t.players?.length || 0));
  const rounds = Array.from({ length: maxPicks || 1 }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Draft Board</h2>
        <div className="text-sm text-gray-400">
          {draftedPlayers} / {totalPlayers} players drafted
        </div>
      </div>

      {currentPickTeam && (
        <div className="bg-accent/20 border border-accent rounded-lg p-4">
          <p className="text-accent font-semibold">
            Current Pick: {currentPickTeam.name}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left p-2 text-sm font-semibold text-gray-400">Round</th>
              {teams.map((team) => (
                <th key={team._id} className="text-left p-2 text-sm font-semibold">
                  <div className="truncate max-w-[120px]" title={team.name}>
                    {team.name}
                  </div>
                  <div className="text-xs text-gray-400 font-normal">
                    Order #{team.draftOrder}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => {
              // Calculate snake order for this round
              const isEvenRound = round % 2 === 0;
              const orderedTeams = isEvenRound ? [...teams].reverse() : teams;

              return (
                <tr key={round} className="border-b border-slate-800/50">
                  <td className="p-2 text-sm text-gray-400">{round}</td>
                  {orderedTeams.map((team) => {
                    const pickIndex = round - 1;
                    const player = team.players?.[pickIndex];

                    return (
                      <td key={team._id} className="p-2">
                        {player ? (
                          <div className="bg-slate-950 border border-slate-800 rounded p-2">
                            <div className="text-sm font-medium truncate" title={player.name}>
                              {player.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {player.totalPoints} pts
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-900/50 border border-slate-800/50 rounded p-2 h-12">
                            <div className="text-xs text-gray-600">—</div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
