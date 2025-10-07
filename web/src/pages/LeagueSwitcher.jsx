import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leagueApi, setCurrentLeagueId, inviteApi, teamApi } from '../lib/api';
import { toast } from 'sonner';

export default function LeagueSwitcher() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      const data = await leagueApi.getMine();
      setLeagues(data);
    } catch (error) {
      toast.error('Failed to load leagues: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectLeague = (leagueId) => {
    setCurrentLeagueId(leagueId);
    navigate('/dashboard');
  };

  const handleCreateLeague = async (e) => {
    e.preventDefault();
    try {
      const league = await leagueApi.create({
        leagueName,
        settings: {
          show: 'Survivor',
          seasonLabel: 'S1',
          scoringRules: {
            IMMUNITY_WIN: 5,
            REWARD_WIN: 3,
            FIND_IDOL: 4,
            VOTED_OUT: -3,
            WINS_SEASON: 10,
          },
        },
      });

      toast.success('League created!');
      setCurrentLeagueId(league._id);
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to create league: ' + error.message);
    }
  };

  const handleJoinLeague = async (e) => {
    e.preventDefault();
    try {
      const result = await inviteApi.redeem(inviteCode, teamName);
      toast.success('Joined league!');
      setCurrentLeagueId(result.league);
      await loadLeagues();
      setShowJoinForm(false);
    } catch (error) {
      toast.error('Failed to join league: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-primary mb-8">Select a League</h1>

        {leagues.length > 0 ? (
          <div className="grid gap-4 mb-8">
            {leagues.map((league) => (
              <div
                key={league._id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-primary transition-colors cursor-pointer"
                onClick={() => selectLeague(league._id)}
              >
                <h2 className="text-2xl font-semibold mb-2">{league.leagueName}</h2>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>{league.settings.show}</span>
                  <span>{league.settings.seasonLabel}</span>
                  <span className="capitalize">{league.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center mb-8">
            <p className="text-gray-400 mb-4">You haven't joined any leagues yet.</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex-1 bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Create New League
          </button>
          <button
            onClick={() => setShowJoinForm(!showJoinForm)}
            className="flex-1 bg-accent hover:bg-yellow-500 text-slate-950 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Join via Invite Code
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateLeague} className="mt-8 bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Create League</h3>
            <input
              type="text"
              placeholder="League Name"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 mb-4 text-white"
              required
            />
            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Create
            </button>
          </form>
        )}

        {showJoinForm && (
          <form onSubmit={handleJoinLeague} className="mt-8 bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Join League</h3>
            <input
              type="text"
              placeholder="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 mb-4 text-white"
              required
            />
            <input
              type="text"
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 mb-4 text-white"
              required
            />
            <button
              type="submit"
              className="w-full bg-accent hover:bg-yellow-500 text-slate-950 font-semibold py-2 px-4 rounded transition-colors"
            >
              Join
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
