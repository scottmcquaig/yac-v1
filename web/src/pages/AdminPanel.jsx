import { useState, useEffect } from 'react';
import { getCurrentLeagueId, leagueApi, playerApi, inviteApi, draftApi, scoringApi, weekApi } from '../lib/api';
import { toast } from 'sonner';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('settings');
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);

  const leagueId = getCurrentLeagueId();

  useEffect(() => {
    if (leagueId) {
      loadLeague();
    }
  }, [leagueId]);

  const loadLeague = async () => {
    try {
      const data = await leagueApi.get(leagueId);
      setLeague(data);
    } catch (error) {
      toast.error('Failed to load league');
    } finally {
      setLoading(false);
    }
  };

  if (!leagueId) {
    return <div className="min-h-screen bg-slate-950 text-white p-8">No league selected</div>;
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white p-8">Loading...</div>;
  }

  const tabs = [
    { id: 'settings', label: 'Settings' },
    { id: 'invites', label: 'Invites' },
    { id: 'players', label: 'Players' },
    { id: 'draft', label: 'Draft' },
    { id: 'scoring', label: 'Scoring' },
    { id: 'weeks', label: 'Weeks' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Panel - {league?.leagueName}</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          {activeTab === 'settings' && <SettingsTab league={league} leagueId={leagueId} onUpdate={loadLeague} />}
          {activeTab === 'invites' && <InvitesTab leagueId={leagueId} />}
          {activeTab === 'players' && <PlayersTab leagueId={leagueId} />}
          {activeTab === 'draft' && <DraftTab leagueId={leagueId} league={league} onUpdate={loadLeague} />}
          {activeTab === 'scoring' && <ScoringTab leagueId={leagueId} league={league} />}
          {activeTab === 'weeks' && <WeeksTab leagueId={leagueId} />}
        </div>
      </div>
    </div>
  );
}

// Settings Tab
function SettingsTab({ league, leagueId, onUpdate }) {
  const [scoringRules, setScoringRules] = useState('');
  const [status, setStatus] = useState(league?.status || 'setup');

  useEffect(() => {
    if (league?.settings?.scoringRules) {
      const rules = Object.fromEntries(league.settings.scoringRules);
      setScoringRules(JSON.stringify(rules, null, 2));
    }
  }, [league]);

  const handleSaveSettings = async () => {
    try {
      const rules = JSON.parse(scoringRules);
      await leagueApi.updateSettings(leagueId, { scoringRules: rules });
      toast.success('Settings saved');
      onUpdate();
    } catch (error) {
      toast.error('Failed to save settings: ' + error.message);
    }
  };

  const handleStatusChange = async () => {
    try {
      await leagueApi.updateStatus(leagueId, status);
      toast.success('Status updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">League Settings</h3>
        <div className="space-y-2 text-sm">
          <p><span className="text-gray-400">Show:</span> {league?.settings?.show}</p>
          <p><span className="text-gray-400">Season:</span> {league?.settings?.seasonLabel}</p>
          <p><span className="text-gray-400">Max Teams:</span> {league?.settings?.maxTeams}</p>
          <p><span className="text-gray-400">Members per Team:</span> {league?.settings?.membersPerTeam}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Scoring Rules (JSON)</h3>
        <textarea
          value={scoringRules}
          onChange={(e) => setScoringRules(e.target.value)}
          className="w-full h-64 bg-slate-950 border border-slate-700 rounded p-4 font-mono text-sm"
        />
        <button
          onClick={handleSaveSettings}
          className="mt-2 bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Save Scoring Rules
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">League Status</h3>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded px-4 py-2 mr-2"
        >
          <option value="setup">Setup</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="final">Final</option>
        </select>
        <button
          onClick={handleStatusChange}
          className="bg-accent hover:bg-yellow-500 text-slate-950 px-6 py-2 rounded font-semibold"
        >
          Update Status
        </button>
      </div>
    </div>
  );
}

// Invites Tab
function InvitesTab({ leagueId }) {
  const [invites, setInvites] = useState([]);
  const [type, setType] = useState('league');
  const [maxUses, setMaxUses] = useState('');

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      const data = await inviteApi.getAll(leagueId);
      setInvites(data);
    } catch (error) {
      toast.error('Failed to load invites');
    }
  };

  const handleCreateInvite = async () => {
    try {
      await inviteApi.create(leagueId, {
        type,
        maxUses: maxUses ? parseInt(maxUses) : null,
      });
      toast.success('Invite created');
      loadInvites();
    } catch (error) {
      toast.error('Failed to create invite: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Generate Invite Code</h3>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-4 py-2"
            >
              <option value="league">League</option>
              <option value="team">Team</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Max Uses (optional)</label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Unlimited"
              className="bg-slate-950 border border-slate-700 rounded px-4 py-2 w-32"
            />
          </div>
          <button
            onClick={handleCreateInvite}
            className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Generate
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Active Invites</h3>
        <div className="space-y-2">
          {invites.map((invite) => (
            <div key={invite._id} className="bg-slate-950 border border-slate-800 rounded p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-mono font-bold text-accent">{invite.code}</span>
                  <span className="ml-4 text-sm text-gray-400">
                    {invite.type} • {invite.uses} uses
                    {invite.maxUses && ` / ${invite.maxUses}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Players Tab
function PlayersTab({ leagueId }) {
  const [players, setPlayers] = useState([]);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const data = await playerApi.getAll(leagueId);
      setPlayers(data);
    } catch (error) {
      toast.error('Failed to load players');
    }
  };

  const handleImport = async () => {
    try {
      const lines = importText.trim().split('\n');
      const playersToImport = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          name: parts[0],
          tribe: parts[1] || '',
        };
      });

      await playerApi.import(leagueId, playersToImport);
      toast.success(`Imported ${playersToImport.length} players`);
      setImportText('');
      loadPlayers();
    } catch (error) {
      toast.error('Failed to import players: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Bulk Import Players</h3>
        <p className="text-sm text-gray-400 mb-2">
          Enter one player per line. Format: Name, Tribe (optional)
        </p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Charlie, Nami&#10;Hunter, Nami&#10;Venus, Siga"
          className="w-full h-32 bg-slate-950 border border-slate-700 rounded p-4 font-mono text-sm"
        />
        <button
          onClick={handleImport}
          className="mt-2 bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Import Players
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Players ({players.length})</h3>
        <div className="grid gap-2">
          {players.map((player) => (
            <div key={player._id} className="bg-slate-950 border border-slate-800 rounded p-3 flex justify-between items-center">
              <div>
                <span className="font-semibold">{player.name}</span>
                {player.meta?.tribe && (
                  <span className="ml-2 text-sm text-gray-400">({player.meta.tribe})</span>
                )}
                {player.draftedBy && (
                  <span className="ml-2 text-xs text-accent">Drafted</span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {player.totalPoints} pts
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Draft Tab
function DraftTab({ leagueId, league, onUpdate }) {
  const handleStartDraft = async () => {
    try {
      await draftApi.start(leagueId);
      toast.success('Draft started!');
      onUpdate();
    } catch (error) {
      toast.error('Failed to start draft: ' + error.message);
    }
  };

  const handleResetDraft = async () => {
    if (!confirm('Are you sure you want to reset the draft? This cannot be undone.')) return;

    try {
      await draftApi.reset(leagueId);
      toast.success('Draft reset');
      onUpdate();
    } catch (error) {
      toast.error('Failed to reset draft: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Draft Controls</h3>
        <p className="text-sm text-gray-400 mb-4">
          Current Status: <span className="text-white capitalize">{league?.status}</span>
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleStartDraft}
            disabled={league?.status !== 'setup'}
            className="bg-primary hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded"
          >
            Start Draft
          </button>
          <button
            onClick={handleResetDraft}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
          >
            Reset Draft
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        <p>⚠️ Starting the draft will:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Randomize team draft order (if enabled)</li>
          <li>Change league status to "draft"</li>
          <li>Allow teams to start picking players</li>
        </ul>
      </div>
    </div>
  );
}

// Scoring Tab
function ScoringTab({ leagueId, league }) {
  const [week, setWeek] = useState(1);
  const [playerId, setPlayerId] = useState('');
  const [eventType, setEventType] = useState('');
  const [description, setDescription] = useState('');
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);

  const scoringRules = league?.settings?.scoringRules ? Object.fromEntries(league.settings.scoringRules) : {};
  const eventTypes = Object.keys(scoringRules);

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (week) {
      loadEvents();
    }
  }, [week]);

  const loadPlayers = async () => {
    try {
      const data = await playerApi.getAll(leagueId);
      setPlayers(data);
    } catch (error) {
      toast.error('Failed to load players');
    }
  };

  const loadEvents = async () => {
    try {
      const data = await scoringApi.getWeek(leagueId, week);
      setEvents(data);
    } catch (error) {
      toast.error('Failed to load events');
    }
  };

  const handleAddEvent = async () => {
    try {
      await scoringApi.add(leagueId, {
        week: parseInt(week),
        playerId,
        type: eventType,
        description,
      });
      toast.success('Event added');
      setDescription('');
      loadEvents();
      loadPlayers();
    } catch (error) {
      toast.error('Failed to add event: ' + error.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await scoringApi.delete(leagueId, eventId);
      toast.success('Event deleted');
      loadEvents();
      loadPlayers();
    } catch (error) {
      toast.error('Failed to delete event: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Add Scoring Event</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Week</label>
            <input
              type="number"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              min="1"
              className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Player</label>
            <select
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2"
            >
              <option value="">Select Player</option>
              {players.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2"
            >
              <option value="">Select Event</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type} ({scoringRules[type]} pts)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2"
            />
          </div>
        </div>
        <button
          onClick={handleAddEvent}
          disabled={!week || !playerId || !eventType}
          className="mt-4 bg-primary hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded"
        >
          Add Event
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Week {week} Events</h3>
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event._id} className="bg-slate-950 border border-slate-800 rounded p-3 flex justify-between items-center">
              <div>
                <span className="font-semibold">{event.player?.name}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-accent">{event.type}</span>
                <span className="mx-2">•</span>
                <span className="text-sm">{event.points} pts</span>
                {event.description && (
                  <span className="ml-2 text-sm text-gray-400">({event.description})</span>
                )}
              </div>
              <button
                onClick={() => handleDeleteEvent(event._id)}
                className="text-red-500 hover:text-red-400 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Weeks Tab
function WeeksTab({ leagueId }) {
  const [weeks, setWeeks] = useState([]);
  const [weekNumber, setWeekNumber] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    loadWeeks();
  }, []);

  const loadWeeks = async () => {
    try {
      const data = await weekApi.getAll(leagueId);
      setWeeks(data);
    } catch (error) {
      toast.error('Failed to load weeks');
    }
  };

  const handleCreateWeek = async () => {
    try {
      await weekApi.create(leagueId, {
        weekNumber: parseInt(weekNumber),
        title,
      });
      toast.success('Week created');
      setWeekNumber('');
      setTitle('');
      loadWeeks();
    } catch (error) {
      toast.error('Failed to create week: ' + error.message);
    }
  };

  const handleFinalizeWeek = async (week) => {
    try {
      await weekApi.finalize(leagueId, week);
      toast.success(`Week ${week} finalized`);
      loadWeeks();
    } catch (error) {
      toast.error('Failed to finalize week: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Create Week</h3>
        <div className="flex gap-4">
          <input
            type="number"
            value={weekNumber}
            onChange={(e) => setWeekNumber(e.target.value)}
            placeholder="Week #"
            className="bg-slate-950 border border-slate-700 rounded px-4 py-2 w-32"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Episode Title"
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-4 py-2"
          />
          <button
            onClick={handleCreateWeek}
            disabled={!weekNumber}
            className="bg-primary hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded"
          >
            Create
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Weeks</h3>
        <div className="space-y-2">
          {weeks.map((week) => (
            <div key={week._id} className="bg-slate-950 border border-slate-800 rounded p-3 flex justify-between items-center">
              <div>
                <span className="font-semibold">Week {week.weekNumber}</span>
                {week.title && <span className="ml-2 text-gray-400">{week.title}</span>}
                {week.scoringFinalized && (
                  <span className="ml-2 text-xs text-green-500">✓ Finalized</span>
                )}
              </div>
              {!week.scoringFinalized && (
                <button
                  onClick={() => handleFinalizeWeek(week.weekNumber)}
                  className="text-accent hover:text-yellow-400 text-sm"
                >
                  Finalize
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
