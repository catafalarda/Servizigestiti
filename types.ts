
export enum UserRole {
  ADMIN = 'Admin',
  SERVICE_MANAGER = 'Service Manager',
  TEAM_LEADER = 'Team Leader',
  OPERATOR = 'Operatore'
}

export enum TaskFrequency {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  SPECIFIC = 'Specific'
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  OK = 'OK',
  KO = 'KO'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
}

export interface TaskDefinition {
  id: string;
  title: string;
  description: string;
  frequency: TaskFrequency;
  startDate: string; // ISO Date
  scheduledTime: string; // HH:mm
  endDate?: string;  // ISO Date for specific periods
}

export interface TaskAssignment {
  id: string;
  taskDefinitionId: string;
  assignedUserId: string;
  date: string; // YYYY-MM-DD
}

export interface ExecutionLog {
  id: string;
  assignmentId: string;
  status: ExecutionStatus;
  notes: string;
  completedByUserId: string;
  timestamp: string; // ISO string
}

export interface TaskWithExecution extends TaskAssignment {
  definition: TaskDefinition;
  execution?: ExecutionLog;
  assignedUser?: User;
}
