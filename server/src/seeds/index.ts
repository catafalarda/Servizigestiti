import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, UserRole } from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/servicecheck';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('✓ Cleared existing users');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin', 10);
    const managerPassword = await bcrypt.hash('manager', 10);
    const leadPassword = await bcrypt.hash('lead', 10);
    const opPassword = await bcrypt.hash('op1', 10);

    // Create mock users
    const users = [
      {
        username: 'admin',
        password: adminPassword,
        name: 'Amministratore',
        role: UserRole.ADMIN,
        email: 'admin@servicecheck.local'
      },
      {
        username: 'manager',
        password: managerPassword,
        name: 'Mario Rossi',
        role: UserRole.SERVICE_MANAGER,
        email: 'mario.rossi@servicecheck.local'
      },
      {
        username: 'lead',
        password: leadPassword,
        name: 'Luca Bianchi',
        role: UserRole.TEAM_LEADER,
        email: 'luca.bianchi@servicecheck.local'
      },
      {
        username: 'op1',
        password: opPassword,
        name: 'Stefano Verdi',
        role: UserRole.OPERATOR,
        email: 'stefano.verdi@servicecheck.local'
      },
      {
        username: 'op2',
        password: opPassword,
        name: 'Anna Neri',
        role: UserRole.OPERATOR,
        email: 'anna.neri@servicecheck.local'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✓ Created ${createdUsers.length} users`);

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seed error:', error);
    process.exit(1);
  }
};

seedUsers();
