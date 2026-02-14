
import React from 'react';
import { User, UserRole } from '../types';
import { ViewType } from '../App';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  badgeCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, currentView, onViewChange, badgeCount = 0 }) => {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-blue-600 p-1 rounded text-white">SC</span>
          ServiceCheck
        </h1>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Managed Services Portal</p>
      </div>

      <div className="p-6 flex-1">
        <div className="mb-8">
          <p className="text-[10px] font-bold text-slate-600 uppercase mb-3 tracking-widest">Utente Connesso</p>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-bold text-sm truncate">{user.name}</p>
            <p className="text-[10px] text-blue-400 font-bold mt-1 uppercase">{user.role}</p>
          </div>
        </div>

        <nav className="space-y-1">
          <p className="text-[10px] font-bold text-slate-600 uppercase mb-3 tracking-widest">Principale</p>
          
          <button 
            onClick={() => onViewChange('dashboard')}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm font-bold rounded-md transition ${
              currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Dashboard
            </span>
            {badgeCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                {badgeCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => onViewChange('audit')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-md transition ${
              currentView === 'audit' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Audit Log
          </button>

          {user.role === UserRole.ADMIN && (
            <>
              <p className="text-[10px] font-bold text-slate-600 uppercase mt-6 mb-3 tracking-widest">Sistema</p>
              <button 
                onClick={() => onViewChange('admin')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-md transition ${
                  currentView === 'admin' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Pannello Admin
              </button>
            </>
          )}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-red-600 rounded-md transition duration-200"
        >
          Disconnetti
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
