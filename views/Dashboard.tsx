
import React, { useState } from 'react';
import { User, UserRole, TaskDefinition, TaskAssignment, ExecutionStatus, ExecutionLog, TaskFrequency } from '../types';
import { FREQUENCY_OPTIONS } from '../constants';

interface DashboardProps {
  user: User;
  allUsers: User[];
  tasks: TaskDefinition[];
  assignments: TaskAssignment[];
  logs: ExecutionLog[];
  onAddTask: (task: TaskDefinition) => void;
  onUpdateTask: (task: TaskDefinition) => void;
  onAddAssignment: (assignment: TaskAssignment) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  allUsers, tasks, assignments, logs, onAddAssignment, onAddTask 
}) => {
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Form state per nuova task
  const [newTask, setNewTask] = useState<Partial<TaskDefinition>>({
    frequency: TaskFrequency.DAILY,
    scheduledTime: '09:00',
    startDate: new Date().toISOString().split('T')[0],
    title: '',
    description: ''
  });

  const getAssignmentsForDate = (date: string) => {
    return assignments.filter(a => a.date === date);
  };

  const operators = allUsers.filter(u => u.role === UserRole.OPERATOR);

  const handleAssign = (taskId: string, userId: string) => {
    const exists = assignments.some(a => a.taskDefinitionId === taskId && a.date === selectedDate);
    if(exists && userId) {
      alert("Questa attività è già stata pianificata per questa data.");
      return;
    }

    if(userId) {
      onAddAssignment({
        id: 'a' + Math.random().toString(36).substr(2, 9),
        taskDefinitionId: taskId,
        assignedUserId: userId,
        date: selectedDate
      });
    }
  };

  const handleCreateAndAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title && newTask.description) {
      const taskObj: TaskDefinition = {
        id: 't' + Date.now(),
        title: newTask.title!,
        description: newTask.description!,
        frequency: newTask.frequency as TaskFrequency,
        startDate: newTask.startDate!,
        scheduledTime: newTask.scheduledTime!,
      };
      
      // Salva nel catalogo globale
      onAddTask(taskObj);
      
      // Pulisci e chiudi
      setNewTask({ 
        frequency: TaskFrequency.DAILY, 
        scheduledTime: '09:00', 
        startDate: new Date().toISOString().split('T')[0], 
        title: '', 
        description: '' 
      });
      setShowCreateModal(false);
      
      // Apri il catalogo per assegnarla subito se desiderato, o informa l'utente
      alert("Attività creata con successo nel catalogo master.");
    }
  };

  const dailyAssignments = getAssignmentsForDate(selectedDate);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pianificazione Giornaliera</h2>
          <p className="text-slate-500 font-medium">Gestione carichi di lavoro e assegnazioni</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-900 transition flex items-center gap-2 shadow-md border border-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nuova Attività
          </button>
          <button 
            onClick={() => setShowCatalogModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            Assegna dal Catalogo
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
            <tr>
              <th className="px-6 py-4">Orario</th>
              <th className="px-6 py-4">Attività</th>
              <th className="px-6 py-4">Frequenza</th>
              <th className="px-6 py-4">Assegnato a</th>
              <th className="px-6 py-4 text-right">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dailyAssignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                  Nessuna attività pianificata per questa data.
                </td>
              </tr>
            ) : (
              dailyAssignments.sort((a,b) => {
                const tA = tasks.find(t => t.id === a.taskDefinitionId)?.scheduledTime || '00:00';
                const tB = tasks.find(t => t.id === b.taskDefinitionId)?.scheduledTime || '00:00';
                return tA.localeCompare(tB);
              }).map(assignment => {
                const task = tasks.find(t => t.id === assignment.taskDefinitionId);
                const assignedUser = allUsers.find(u => u.id === assignment.assignedUserId);
                const log = logs.find(l => l.assignmentId === assignment.id);

                if (!task) return null;

                return (
                  <tr key={assignment.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{task.scheduledTime}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{task.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{task.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">{task.frequency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                          {assignedUser?.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700">{assignedUser?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log ? (
                        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${log.status === ExecutionStatus.OK ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 italic bg-slate-100 px-2 py-1 rounded">PENDING</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Creazione Nuova Attività */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Crea Nuova Attività Master</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateAndAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titolo Servizio</label>
                <input 
                  className="w-full px-4 py-2 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="es. Verifica Backup SQL"
                  value={newTask.title || ''}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrizione / Istruzioni</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded-lg outline-none text-sm h-24 focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Inserisci i passaggi operativi..."
                  value={newTask.description || ''}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frequenza</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 transition"
                    value={newTask.frequency}
                    onChange={e => setNewTask({...newTask, frequency: e.target.value as TaskFrequency})}
                  >
                    {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Orario Pianificato</label>
                  <input 
                    type="time"
                    className="w-full px-4 py-2 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-500 transition"
                    value={newTask.scheduledTime}
                    onChange={e => setNewTask({...newTask, scheduledTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
                >
                  Salva nel Catalogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pick from Master Catalog */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-slate-50 px-8 py-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Catalogo Attività Master</h3>
              <button onClick={() => setShowCatalogModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 font-medium mb-4">Il catalogo è attualmente vuoto.</p>
                  <button 
                    onClick={() => { setShowCatalogModal(false); setShowCreateModal(true); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Crea ora la prima attività
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map(task => {
                    const isAlreadyAssigned = dailyAssignments.some(a => a.taskDefinitionId === task.id);
                    return (
                      <div key={task.id} className={`p-4 border rounded-xl flex justify-between items-center transition ${isAlreadyAssigned ? 'bg-slate-50 border-slate-200 opacity-80' : 'hover:border-blue-300 border-slate-100 shadow-sm'}`}>
                        <div className="flex-1 mr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-600 font-mono">{task.scheduledTime}</span>
                            <h4 className="font-bold text-slate-800">{task.title}</h4>
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{task.frequency}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {isAlreadyAssigned ? (
                            <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Pianificata
                            </span>
                          ) : (
                            <select 
                              className="text-xs border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              onChange={(e) => handleAssign(task.id, e.target.value)}
                              defaultValue=""
                            >
                              <option value="" disabled>Assegna a...</option>
                              {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 border-t flex justify-end">
              <button 
                onClick={() => setShowCatalogModal(false)}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition shadow-md"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
