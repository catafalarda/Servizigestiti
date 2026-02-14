
import { TaskDefinition, TaskAssignment, ExecutionLog, User } from '../types';
import { APP_CONFIG, MOCK_USERS } from '../constants';

// Rimosso DB_VERSION e localStorage.clear() per evitare perdite di dati accidentali

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(APP_CONFIG.STORAGE_KEY_ALL_USERS);
    if (!data) {
      // Solo se il database è vuoto inizializziamo con i mock
      db.saveUsers(MOCK_USERS);
      return MOCK_USERS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Errore parsing utenti:", e);
      return MOCK_USERS;
    }
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(APP_CONFIG.STORAGE_KEY_ALL_USERS, JSON.stringify(users));
  },
  getTasks: (): TaskDefinition[] => {
    const data = localStorage.getItem(APP_CONFIG.STORAGE_KEY_TASKS);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveTasks: (tasks: TaskDefinition[]) => {
    localStorage.setItem(APP_CONFIG.STORAGE_KEY_TASKS, JSON.stringify(tasks));
  },
  getAssignments: (): TaskAssignment[] => {
    const data = localStorage.getItem(APP_CONFIG.STORAGE_KEY_ASSIGNMENTS);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveAssignments: (assignments: TaskAssignment[]) => {
    localStorage.setItem(APP_CONFIG.STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
  },
  getLogs: (): ExecutionLog[] => {
    const data = localStorage.getItem(APP_CONFIG.STORAGE_KEY_LOGS);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveLogs: (logs: ExecutionLog[]) => {
    localStorage.setItem(APP_CONFIG.STORAGE_KEY_LOGS, JSON.stringify(logs));
  }
};
