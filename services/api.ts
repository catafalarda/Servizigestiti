const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let authToken: string | null = null;

// Set auth token from localStorage
export const loadAuthToken = (): void => {
  authToken = localStorage.getItem('servicecheck_auth_token');
};

// AuthAPI
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    authToken = data.token;
    localStorage.setItem('servicecheck_auth_token', data.token);
    return data.user;
  },

  logout: () => {
    authToken = null;
    localStorage.removeItem('servicecheck_auth_token');
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/user`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  getUsers: async () => {
    const response = await fetch(`${API_URL}/auth/users`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }
};

// TasksAPI
export const tasksAPI = {
  getTasks: async () => {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  createTask: async (task: any) => {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  updateTask: async (id: string, task: any) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  deleteTask: async (id: string) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!response.ok) throw new Error('Failed to delete task');
    return response.json();
  }
};

// AssignmentsAPI
export const assignmentsAPI = {
  getAssignments: async (filters?: { date?: string; userId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.userId) params.append('userId', filters.userId);

    const response = await fetch(`${API_URL}/assignments?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!response.ok) throw new Error('Failed to fetch assignments');
    return response.json();
  },

  createAssignment: async (assignment: any) => {
    const response = await fetch(`${API_URL}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(assignment)
    });
    if (!response.ok) throw new Error('Failed to create assignment');
    return response.json();
  },

  deleteAssignment: async (id: string) => {
    const response = await fetch(`${API_URL}/assignments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!response.ok) throw new Error('Failed to delete assignment');
    return response.json();
  }
};

// LogsAPI
export const logsAPI = {
  getLogs: async (filters?: { assignmentId?: string; userId?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.assignmentId) params.append('assignmentId', filters.assignmentId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(`${API_URL}/logs?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  },

  createLog: async (log: any) => {
    const response = await fetch(`${API_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(log)
    });
    if (!response.ok) throw new Error('Failed to create log');
    return response.json();
  }
};
