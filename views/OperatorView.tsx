
import React, { useState, useEffect } from 'react';
import { User, TaskAssignment, TaskDefinition, ExecutionLog, ExecutionStatus } from '../types';

interface OperatorViewProps {
  user: User;
  assignments: TaskAssignment[];
  tasks: TaskDefinition[];
  logs: ExecutionLog[];
  onAddLog: (log: ExecutionLog) => void;
  onViewedAssignments?: (ids: string[]) => void;
}

const OperatorView: React.FC<OperatorViewProps> = ({ 
  user, assignments, tasks, logs, onAddLog, onViewedAssignments 
}) => {
  const [executionNote, setExecutionNote] = useState<{ [key: string]: string }>({});
  const today = new Date().toISOString().split('T')[0];

  const myAssignments = assignments.filter(a => a.assignedUserId === user.id && a.date === today);

  // Quando il componente monta, segniamo i task correnti come "visti"
  useEffect(() => {
    if (onViewedAssignments && myAssignments.length > 0) {
      onViewedAssignments(myAssignments.map(a => a.id));
    }
  }, [myAssignments.length, onViewedAssignments]);

  const handleExecute = (assignmentId: string, status: ExecutionStatus) => {
    const note = executionNote[assignmentId] || '';
    onAddLog({
      id: 'l' + Math.random().toString(36).substr(2, 9),
      assignmentId,
      status,
      notes: note,
      completedByUserId: user.id,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-800">Checklist Giornaliera</h2>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-slate-500">Tecnico: <span className="font-bold text-slate-800 uppercase">{user.name}</span></p>
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
            {today}
          </span>
        </div>
      </header>

      {myAssignments.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center flex flex-col items-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Nessuna attività</h3>
          <p className="text-slate-500 text-sm">Contatta il Team Leader per le assegnazioni di oggi.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {myAssignments.sort((a,b) => {
            const tA = tasks.find(t => t.id === a.taskDefinitionId)?.scheduledTime || '00:00';
            const tB = tasks.find(t => t.id === b.taskDefinitionId)?.scheduledTime || '00:00';
            return tA.localeCompare(tB);
          }).map(assignment => {
            const task = tasks.find(t => t.id === assignment.taskDefinitionId);
            const log = logs.find(l => l.assignmentId === assignment.id);

            if (!task) return null;

            return (
              <div key={assignment.id} className={`bg-white rounded-xl shadow-sm border transition ${log ? 'border-slate-200' : 'border-blue-200 ring-2 ring-blue-50'}`}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-mono font-bold h-fit shadow-md">
                        {task.scheduledTime}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 leading-tight">{task.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                      </div>
                    </div>
                    {log && (
                      <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${log.status === ExecutionStatus.OK ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {log.status}
                      </span>
                    )}
                  </div>

                  {!log && (
                    <div className="space-y-4">
                      <textarea 
                        placeholder="Note opzionali..."
                        className="w-full px-4 py-2 border rounded-lg text-sm h-16 outline-none focus:ring-1 focus:ring-blue-500 transition"
                        value={executionNote[assignment.id] || ''}
                        onChange={(e) => setExecutionNote({ ...executionNote, [assignment.id]: e.target.value })}
                      />
                      <div className="flex gap-4">
                        <button onClick={() => handleExecute(assignment.id, ExecutionStatus.OK)} className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition shadow-sm">OK</button>
                        <button onClick={() => handleExecute(assignment.id, ExecutionStatus.KO)} className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition shadow-sm">KO</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OperatorView;
