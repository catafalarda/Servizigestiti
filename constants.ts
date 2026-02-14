
import { User, UserRole, TaskFrequency } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u0', username: 'admin', password: 'admin', name: 'Amministratore', role: UserRole.ADMIN },
  { id: 'u1', username: 'manager', password: 'manager', name: 'Mario Rossi', role: UserRole.SERVICE_MANAGER },
  { id: 'u2', username: 'lead', password: 'lead', name: 'Luca Bianchi', role: UserRole.TEAM_LEADER },
  { id: 'u3', username: 'op1', password: 'op1', name: 'Stefano Verdi', role: UserRole.OPERATOR },
  { id: 'u4', username: 'op2', password: 'op2', name: 'Anna Neri', role: UserRole.OPERATOR },
];

export const FREQUENCY_OPTIONS = Object.values(TaskFrequency);
export const ROLE_OPTIONS = Object.values(UserRole);

export const APP_CONFIG = {
  STORAGE_KEY_TASKS: 'servicecheck_v1_tasks',
  STORAGE_KEY_ASSIGNMENTS: 'servicecheck_v1_assignments',
  STORAGE_KEY_LOGS: 'servicecheck_v1_logs',
  STORAGE_KEY_USER: 'servicecheck_v1_current_session',
  STORAGE_KEY_ALL_USERS: 'servicecheck_v1_users_registry'
};
