import mongoose from 'mongoose';
import dotenv from 'dotenv';
import League from '../models/League.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import Week from '../models/Week.js';
import { connectDB } from '../lib/db.js';

dotenv.config();

const SAMPLE_UID = 'test-user-123';

const seedData = {
  league: {
    leagueName: 'YAC Survivor Fantasy 2025',
    ownerUid: SAMPLE_UID,
    admins: [SAMPLE_UID],
    settings: {
      show: 'Survivor',
      seasonLabel: 'S49',
      maxTeams: 8,
      membersPerTeam: 2,
      draft: {
        type: 'snake',
        pickSeconds: 60,
        randomizedOrder: true,
      },
      invites: {
        allowTeamInvites: true,
        allowLeagueInvites: true,
      },
      scoringRules: {
        IMMUNITY_WIN: 5,
        REWARD_WIN: 3,
        FIND_IDOL: 4,
        PLAY_IDOL_CORRECT: 6,
        RECEIVES_VOTES_SURVIVES: 2,
        MAKES_JURY: 3,
        VOTED_OUT: -3,
        QUIT_OR_MED: -6,
        WINS_SEASON: 10,
      },
    },
    status: 'setup',
  },
  teams: [
    { name: 'Team Alpha' },
    { name: 'Team Bravo' },
    { name: 'Team Charlie' },
    { name: 'Team Delta' },
  ],
  players: [
    { name: 'Charlie', tribe: 'Nami' },
    { name: 'Hunter', tribe: 'Nami' },
    { name: 'Venus', tribe: 'Siga' },
    { name: 'Kenzie', tribe: 'Siga' },
    { name: 'Ben', tribe: 'Yanu' },
    { name: 'Maria', tribe: 'Yanu' },
    { name: 'Tevin', tribe: 'Nami' },
    { name: 'Q', tribe: 'Siga' },
    { name: 'Liz', tribe: 'Yanu' },
    { name: 'Tiffany', tribe: 'Siga' },
    { name: 'Kendra', tribe: 'Nami' },
    { name: 'Austin', tribe: 'Siga' },
    { name: 'Dee', tribe: 'Yanu' },
    { name: 'Soda', tribe: 'Yanu' },
    { name: 'Taylor', tribe: 'Nami' },
    { name: 'Mariah', tribe: 'Siga' },
  ],
  weeks: [
    { weekNumber: 1, title: 'Premiere' },
    { weekNumber: 2, title: 'Episode 2' },
    { weekNumber: 3, title: 'Episode 3' },
    { weekNumber: 4, title: 'Episode 4' },
    { weekNumber: 5, title: 'Episode 5' },
  ],
};

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      League.deleteMany({}),
      Team.deleteMany({}),
      Player.deleteMany({}),
      Week.deleteMany({}),
    ]);

    console.log('Creating league...');
    const league = await League.create(seedData.league);
    console.log(`Created league: ${league.leagueName} (ID: ${league._id})`);

    console.log('Creating teams...');
    const teams = await Promise.all(
      seedData.teams.map((teamData, index) =>
        Team.create({
          ...teamData,
          leagueId: league._id,
          members: [SAMPLE_UID],
          maxMembers: league.settings.membersPerTeam,
          draftOrder: index + 1,
        })
      )
    );
    console.log(`Created ${teams.length} teams`);

    console.log('Creating players...');
    const players = await Promise.all(
      seedData.players.map((playerData) =>
        Player.create({
          ...playerData,
          leagueId: league._id,
          meta: {
            tribe: playerData.tribe,
            status: 'active',
          },
        })
      )
    );
    console.log(`Created ${players.length} players`);

    console.log('Creating weeks...');
    const weeks = await Promise.all(
      seedData.weeks.map((weekData) =>
        Week.create({
          ...weekData,
          leagueId: league._id,
        })
      )
    );
    console.log(`Created ${weeks.length} weeks`);

    console.log('\n✅ Seed data created successfully!');
    console.log(`\nLeague ID: ${league._id}`);
    console.log(`Test User UID: ${SAMPLE_UID}`);
    console.log('\nYou can now:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Use the League ID to test API endpoints');
    console.log('3. Use the test UID for authentication (or create a real Firebase user)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
