
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (user) {
      // In un sistema reale useremmo hash, qui controlliamo in chiaro per semplicità MVP
      if (user.password === password) {
        onLogin(user);
      } else {
        setError('Password errata per l\'utente ' + username);
      }
    } else {
      setError('Utente non trovato. Verifica lo username.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-10">
          <div className="inline-block bg-blue-600 text-white p-3 rounded-2xl mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">ServiceCheck</h2>
          <p className="mt-2 text-slate-600 font-medium">Accedi al Portale Operativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
            <input 
              type="text" 
              required
              placeholder="Inserisci il tuo username..."
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-xs text-red-700 font-bold">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transform transition active:scale-[0.98] shadow-lg"
          >
            Accedi
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 italic">
            Suggerimento: L'utente di sistema predefinito è <span className="font-bold text-slate-600">admin</span> con password <span className="font-bold text-slate-600">admin</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
