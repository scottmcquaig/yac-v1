import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentLeagueId, leagueApi, teamApi } from '../lib/api';
import DraftBoard from '../components/DraftBoard';

export default function Dashboard() {
  const [league, setLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const leagueId = getCurrentLeagueId();
  const navigate = useNavigate();

  useEffect(() => {
    if (!leagueId) {
      navigate('/leagues');
      return;
    }
    loadData();
  }, [leagueId]);

  const loadData = async () => {
    try {
      const [leagueData, teamsData] = await Promise.all([
        leagueApi.get(leagueId),
        teamApi.getLeaderboard(leagueId),
      ]);
      setLeague(leagueData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">{league?.leagueName}</h1>
            <p className="text-gray-400">
              {league?.settings?.show} {league?.settings?.seasonLabel} • {league?.status}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
          >
            Admin Panel
          </button>
        </div>

        {/* Leaderboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="text-left p-4">Rank</th>
                  <th className="text-left p-4">Team</th>
                  <th className="text-left p-4">Players</th>
                  <th className="text-right p-4">Total Points</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <tr key={team._id} className="border-b border-slate-800/50 last:border-0">
                    <td className="p-4">
                      <span className="font-semibold text-lg">#{index + 1}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">{team.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {team.players?.slice(0, 3).map((player) => (
                          <span key={player._id} className="text-sm bg-slate-950 px-2 py-1 rounded">
                            {player.name}
                          </span>
                        ))}
                        {team.players?.length > 3 && (
                          <span className="text-sm text-gray-400">
                            +{team.players.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-xl font-bold text-accent">{team.totalPoints}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Draft Board */}
        {league?.status === 'draft' && (
          <div className="mt-8">
            <DraftBoard leagueId={leagueId} />
          </div>
        )}
      </div>
    </div>
  );
}
