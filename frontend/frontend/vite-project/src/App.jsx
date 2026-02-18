import React, { useState } from 'react';
import './App.css'; // Importation des styles séparés

// --- ICONS ---
const Icons = {
  Dashboard: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  Logs: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Terminal: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  Smile: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
};

// --- LOGIN VIEW ---
const LoginView = ({ onLogin }) => (
  <div className="login-wrapper">
    <div className="login-card">
      
      <div className="icon-header">
        <div className="icon-circle">
           <Icons.Smile />
        </div>
      </div>

      <div className="login-headings">
        <h2 className="login-title">Welcome back</h2>
        <p className="login-subtitle">Sign in to your peaceful space</p>
      </div>

      <div className="login-form">
        <div className="input-group">
          <input
            type="email"
            placeholder="Email address"
            className="form-input"
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            className="form-input pr-12"
          />
          <button className="eye-btn">
            <Icons.Eye />
          </button>
        </div>

        <div className="options-row">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              className="checkbox-input"
            />
            Remember me
          </label>
          <a href="#" className="forgot-link">
            Forgot password?
          </a>
        </div>

        <button onClick={onLogin} className="btn-primary">
          Sign in
        </button>

      </div>
    </div>
  </div>
);

// --- DASHBOARD COMPONENTS ---

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: <Icons.Dashboard /> },
    { id: 'logs', label: 'Log Explorer', icon: <Icons.Logs /> },
    { id: 'anomalies', label: 'Anomalies', icon: <Icons.Alert /> },
    { id: 'settings', label: 'Settings', icon: <Icons.Settings /> },
  ];

  return (
    <div className="sidebar">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 font-bold text-slate-800 tracking-tight">
          <div className="bg-indigo-600 w-6 h-6 rounded flex items-center justify-center text-white">
             <Icons.Terminal />
          </div>
          LogWatch
        </div>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Platform
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">John Doe</p>
            <p className="text-xs text-slate-500 truncate">Engineering Lead</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ onLogout }) => (
  <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="font-medium text-slate-900 hidden sm:inline">Organization</span>
      <span className="text-slate-300 hidden sm:inline">/</span>
      <span className="hidden sm:inline">Projects</span>
      <span className="text-slate-300 hidden sm:inline">/</span>
      <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs border border-indigo-100">Backend-API-V2</span>
    </div>
    
    <div className="flex items-center gap-4">
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <span className="text-xs font-mono text-slate-500 hidden sm:inline">Live Connection</span>
      <div className="h-4 w-px bg-slate-200 mx-2 hidden sm:inline"></div>
      <button onClick={onLogout} className="text-sm text-slate-600 hover:text-slate-900 font-medium">
        Sign out
      </button>
    </div>
  </header>
);

const KPICard = ({ title, value, change, trend }) => (
  <div className="kpi-card">
    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">{title}</h3>
    <div className="flex items-baseline justify-between">
      <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{value}</p>
      <span className={trend === 'up' ? 'badge-trend-up' : 'badge-trend-down'}>
        {change}
      </span>
    </div>
  </div>
);

const DashboardView = ({ onLogout }) => (
  <div className="dashboard-layout">
    <Sidebar activeTab="dashboard" setActiveTab={() => {}} />
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar onLogout={onLogout} />
      
      <main className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Real-time metrics for last 24 hours.</p>
          </div>
          <div className="flex gap-2">
             <select className="text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
               <option>Last 24 Hours</option>
               <option>Last 7 Days</option>
             </select>
             <button className="text-sm bg-white border border-slate-300 px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50">
               Export Report
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard title="Total Logs" value="1.2M" change="+12.5%" trend="up" />
          <KPICard title="Error Rate" value="0.04%" change="-0.01%" trend="up" />
          <KPICard title="Anomalies" value="3" change="Detected" trend="down" />
          <KPICard title="Avg Latency" value="42ms" change="Stable" trend="up" />
        </div>

        {/* Tableau recent Anomalies */}
        <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-900">Recent Anomalies</h3>
            <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View all <Icons.ArrowRight />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Severity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Message</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Confidence</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {[
                  { time: '10:24:01', level: 'Critical', msg: 'Database pool exhaustion detected', score: 98 },
                  { time: '09:12:45', level: 'Warning', msg: 'Unusual spike in 404 responses', score: 85 },
                  { time: '08:45:12', level: 'Error', msg: 'Timeout waiting for upstream service', score: 72 },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{row.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        row.level === 'Critical' ? 'bg-red-100 text-red-800' : 
                        row.level === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {row.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{row.msg}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500 font-mono">
                      {row.score}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="antialiased text-slate-900">
      {isAuthenticated ? (
        <DashboardView onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <LoginView onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}