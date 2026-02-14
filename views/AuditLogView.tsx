
import React, { useState, useMemo } from 'react';
import { ExecutionLog, TaskAssignment, TaskDefinition, User, ExecutionStatus } from '../types';

interface AuditLogViewProps {
  logs: ExecutionLog[];
  assignments: TaskAssignment[];
  tasks: TaskDefinition[];
  users: User[];
}

const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, assignments, tasks, users }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return [...logs].reverse().filter(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      
      if (startDate && logDate < startDate) return false;
      if (endDate && logDate > endDate) return false;
      
      return true;
    });
  }, [logs, startDate, endDate]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Storico Audit</h2>
          <p className="text-slate-500">Tracciabilità completa di tutte le esecuzioni</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dal</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Al</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition"
            />
          </div>
          <div className="flex items-end h-full">
            <button 
              onClick={resetFilters}
              disabled={!startDate && !endDate}
              className="h-[38px] px-4 text-xs font-bold text-slate-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
            <tr>
              <th className="px-6 py-4">Data/Ora</th>
              <th className="px-6 py-4">Attività</th>
              <th className="px-6 py-4">Operatore</th>
              <th className="px-6 py-4">Esito</th>
              <th className="px-6 py-4">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                  {logs.length === 0 ? "Nessun log registrato nel sistema." : "Nessun log trovato per il periodo selezionato."}
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => {
                const assignment = assignments.find(a => a.id === log.assignmentId);
                const task = tasks.find(t => t.id === assignment?.taskDefinitionId);
                const user = users.find(u => u.id === log.completedByUserId);

                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('it-IT')}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {task?.title || 'Attività eliminata'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                          {user?.name.charAt(0) || '?'}
                        </div>
                        <span className="text-slate-700 font-medium">{user?.name || 'Utente sconosciuto'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        log.status === ExecutionStatus.OK ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {log.notes || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogView;
