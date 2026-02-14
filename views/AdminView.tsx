
import React, { useState } from 'react';
import { User, UserRole, TaskDefinition, TaskFrequency } from '../types';
import { FREQUENCY_OPTIONS, ROLE_OPTIONS } from '../constants';

interface AdminViewProps {
  users: User[];
  tasks: TaskDefinition[];
  onUpdateUsers: (users: User[]) => void;
  onUpdateTasks: (tasks: TaskDefinition[]) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ users, tasks, onUpdateUsers, onUpdateTasks }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('users');
  
  // User Form State
  const [newUser, setNewUser] = useState<Partial<User>>({ role: UserRole.OPERATOR, password: '' });
  
  // Task Form State
  const [editingTask, setEditingTask] = useState<TaskDefinition | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<TaskDefinition>>({
    frequency: TaskFrequency.DAILY,
    scheduledTime: '09:00',
    startDate: new Date().toISOString().split('T')[0],
    title: '',
    description: ''
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.username && newUser.name && newUser.password) {
      const userObj: User = {
        id: 'u' + Date.now(),
        username: newUser.username!,
        password: newUser.password!,
        name: newUser.name!,
        role: newUser.role as UserRole
      };
      onUpdateUsers([...users, userObj]);
      setNewUser({ role: UserRole.OPERATOR, username: '', name: '', password: '' });
    } else {
      alert("Tutti i campi sono obbligatori, inclusa la password.");
    }
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskForm.title && taskForm.description) {
      if (editingTask) {
        // Logica di Modifica
        const updatedTasks = tasks.map(t => 
          t.id === editingTask.id 
            ? { ...t, ...taskForm } as TaskDefinition 
            : t
        );
        onUpdateTasks(updatedTasks);
        cancelTaskEdit();
      } else {
        // Logica di Inserimento
        const taskObj: TaskDefinition = {
          id: 't' + Date.now(),
          title: taskForm.title!,
          description: taskForm.description!,
          frequency: taskForm.frequency as TaskFrequency,
          startDate: taskForm.startDate!,
          scheduledTime: taskForm.scheduledTime!,
        };
        onUpdateTasks([...tasks, taskObj]);
        setTaskForm({ 
          frequency: TaskFrequency.DAILY, 
          scheduledTime: '09:00', 
          startDate: new Date().toISOString().split('T')[0], 
          title: '', 
          description: '' 
        });
      }
    }
  };

  const startTaskEdit = (task: TaskDefinition) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      frequency: task.frequency,
      scheduledTime: task.scheduledTime,
      startDate: task.startDate
    });
    // Scroll to form for better UX on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
    setTaskForm({ 
      frequency: TaskFrequency.DAILY, 
      scheduledTime: '09:00', 
      startDate: new Date().toISOString().split('T')[0], 
      title: '', 
      description: '' 
    });
  };

  const deleteUser = (id: string) => {
    if(confirm('Eliminare questo utente?')) onUpdateUsers(users.filter(u => u.id !== id));
  };

  const deleteTask = (id: string) => {
    if(confirm('Eliminare questa attività dal catalogo?')) onUpdateTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Pannello Amministratore</h2>
        <p className="text-slate-500">Configurazione anagrafiche e catalogo servizi</p>
      </header>

      <div className="flex gap-4 mb-8 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-4 text-sm font-bold transition ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
        >
          Gestione Tecnici
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`pb-4 px-4 text-sm font-bold transition ${activeTab === 'tasks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
        >
          Anagrafica Attività
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-800 mb-4">Nuovo Utente</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                <input 
                  className="w-full px-4 py-2 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="es. Marco Bianchi"
                  value={newUser.name || ''}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                <input 
                  className="w-full px-4 py-2 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="es. mbianchi"
                  value={newUser.username || ''}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg outline-none text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Password di accesso"
                  value={newUser.password || ''}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ruolo</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 transition"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                >
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md mt-2">Crea Utente</button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Ruolo</th>
                  <th className="px-6 py-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-800">{u.name}</td>
                    <td className="px-6 py-4 text-slate-500">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{u.role}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        disabled={u.username === 'admin'}
                        onClick={() => deleteUser(u.id)}
                        className={`text-red-500 hover:text-red-700 font-bold ${u.username === 'admin' ? 'opacity-20 cursor-not-allowed' : ''}`}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-1 p-6 rounded-xl shadow-sm border transition-all duration-300 h-fit ${editingTask ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-slate-200'}`}>
            <h3 className={`font-bold mb-4 ${editingTask ? 'text-blue-800' : 'text-slate-800'}`}>
              {editingTask ? 'Modifica Attività Master' : 'Nuova Attività Master'}
            </h3>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titolo Servizio</label>
                <input 
                  className="w-full px-4 py-2 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 transition bg-white"
                  placeholder="Titolo Servizio"
                  value={taskForm.title || ''}
                  onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrizione / Istruzioni</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded-lg outline-none text-sm h-24 focus:ring-2 focus:ring-blue-500 transition bg-white"
                  placeholder="Descrizione / Istruzioni"
                  value={taskForm.description || ''}
                  onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frequenza</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 transition bg-white"
                    value={taskForm.frequency}
                    onChange={e => setTaskForm({...taskForm, frequency: e.target.value as TaskFrequency})}
                  >
                    {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Orario</label>
                  <input 
                    type="time"
                    className="w-full px-4 py-2 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 transition bg-white"
                    value={taskForm.scheduledTime}
                    onChange={e => setTaskForm({...taskForm, scheduledTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {editingTask && (
                  <button 
                    type="button"
                    onClick={cancelTaskEdit}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-bold hover:bg-slate-300 transition"
                  >
                    Annulla
                  </button>
                )}
                <button className={`flex-[2] py-2 rounded-lg font-bold transition shadow-md ${editingTask ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {editingTask ? 'Salva Modifiche' : 'Aggiungi al Catalogo'}
                </button>
              </div>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Attività</th>
                  <th className="px-6 py-4 text-center">Orario</th>
                  <th className="px-6 py-4">Frequenza</th>
                  <th className="px-6 py-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map(t => (
                  <tr key={t.id} className={`hover:bg-slate-50 transition ${editingTask?.id === t.id ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{t.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{t.description}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-blue-600 font-bold">{t.scheduledTime}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 uppercase">{t.frequency}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => startTaskEdit(t)} 
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase"
                      >
                        Modifica
                      </button>
                      <button 
                        onClick={() => deleteTask(t.id)} 
                        className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
