
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, TaskDefinition, TaskAssignment, ExecutionLog } from './types';
import { APP_CONFIG } from './constants';
import { db } from './services/db';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import OperatorView from './views/OperatorView';
import AuditLogView from './views/AuditLogView';
import AdminView from './views/AdminView';
import Sidebar from './components/Sidebar';

export type ViewType = 'dashboard' | 'audit' | 'admin';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<TaskDefinition[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Notifiche state
  const [notification, setNotification] = useState<string | null>(null);
  const [seenAssignmentIds, setSeenAssignmentIds] = useState<string[]>([]);
  const prevAssignmentsCount = useRef<number>(0);

  useEffect(() => {
    const initApp = () => {
      try {
        const savedUser = localStorage.getItem(APP_CONFIG.STORAGE_KEY_USER);
        if (savedUser) {
          try {
            setCurrentUser(JSON.parse(savedUser));
          } catch(e) {
            localStorage.removeItem(APP_CONFIG.STORAGE_KEY_USER);
          }
        }
        
        const loadedUsers = db.getUsers();
        setAllUsers(loadedUsers);
        setTasks(db.getTasks());
        const loadedAssignments = db.getAssignments();
        setAssignments(loadedAssignments);
        setLogs(db.getLogs());

        // Carica ID visti per le notifiche
        const savedSeen = localStorage.getItem('servicecheck_seen_assignments');
        if (savedSeen) setSeenAssignmentIds(JSON.parse(savedSeen));
      } catch (error) {
        console.error("Errore inizializzazione:", error);
      } finally {
        setTimeout(() => setIsLoaded(true), 500);
      }
    };

    initApp();
  }, []);

  // Monitoraggio nuove assegnazioni per notifica toast
  useEffect(() => {
    if (!currentUser || currentUser.role !== UserRole.OPERATOR) return;

    const today = new Date().toISOString().split('T')[0];
    const myTodayAssignments = assignments.filter(a => a.assignedUserId === currentUser.id && a.date === today);
    
    // Se il numero di assegnazioni per oggi è aumentato rispetto all'ultima verifica
    if (myTodayAssignments.length > prevAssignmentsCount.current && prevAssignmentsCount.current > 0) {
      setNotification("Hai una nuova attività assegnata per oggi!");
      setTimeout(() => setNotification(null), 5000);
    }
    
    prevAssignmentsCount.current = myTodayAssignments.length;
  }, [assignments, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(APP_CONFIG.STORAGE_KEY_USER, JSON.stringify(user));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEY_USER);
  };

  const handleUpdateUsers = (newUsers: User[]) => {
    setAllUsers(newUsers);
    db.saveUsers(newUsers);
  };

  const handleUpdateTasks = (newTasks: TaskDefinition[]) => {
    setTasks(newTasks);
    db.saveTasks(newTasks);
  };

  const addTask = (task: TaskDefinition) => {
    const newTasks = [...tasks, task];
    handleUpdateTasks(newTasks);
  };

  const addAssignment = (assignment: TaskAssignment) => {
    const newAssignments = [...assignments, assignment];
    setAssignments(newAssignments);
    db.saveAssignments(newAssignments);
  };

  const addLog = (log: ExecutionLog) => {
    const newLogs = [...logs, log];
    setLogs(newLogs);
    db.saveLogs(newLogs);
  };

  const markAssignmentsAsSeen = (ids: string[]) => {
    const newSeen = Array.from(new Set([...seenAssignmentIds, ...ids]));
    setSeenAssignmentIds(newSeen);
    localStorage.setItem('servicecheck_seen_assignments', JSON.stringify(newSeen));
  };

  if (!isLoaded) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">ServiceCheck: Inizializzazione...</p>
      </div>
    </div>
  );

  if (!currentUser) {
    return <Login users={allUsers} onLogin={handleLogin} />;
  }

  // Calcolo badge count per sidebar
  const today = new Date().toISOString().split('T')[0];
  const unseenCount = currentUser.role === UserRole.OPERATOR 
    ? assignments.filter(a => a.assignedUserId === currentUser.id && a.date === today && !seenAssignmentIds.includes(a.id)).length 
    : 0;

  const renderContent = () => {
    switch(currentView) {
      case 'admin':
        return <AdminView 
          users={allUsers} 
          tasks={tasks} 
          onUpdateUsers={handleUpdateUsers} 
          onUpdateTasks={handleUpdateTasks} 
        />;
      case 'audit':
        return <AuditLogView logs={logs} assignments={assignments} tasks={tasks} users={allUsers} />;
      default:
        if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SERVICE_MANAGER || currentUser.role === UserRole.TEAM_LEADER) {
          return (
            <Dashboard 
              user={currentUser}
              allUsers={allUsers}
              tasks={tasks}
              assignments={assignments}
              logs={logs}
              onAddTask={addTask}
              onUpdateTask={() => {}}
              onAddAssignment={addAssignment}
            />
          );
        }
        return (
          <OperatorView 
            user={currentUser}
            assignments={assignments}
            tasks={tasks}
            logs={logs}
            onAddLog={addLog}
            onViewedAssignments={markAssignmentsAsSeen}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        user={currentUser} 
        onLogout={handleLogout} 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        badgeCount={unseenCount}
      />
      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-6 right-6 z-[100] animate-bounce-in">
            <div className="bg-white border-l-4 border-blue-600 shadow-2xl rounded-lg p-4 flex items-center gap-4 min-w-[300px]">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Nuova Assegnazione</p>
                <p className="text-xs text-slate-500">{notification}</p>
              </div>
              <button onClick={() => setNotification(null)} className="ml-auto text-slate-300 hover:text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {renderContent()}
      </main>
      
      <style>{`
        @keyframes bounce-in {
          0% { transform: translateX(100%); opacity: 0; }
          70% { transform: translateX(-10px); opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
