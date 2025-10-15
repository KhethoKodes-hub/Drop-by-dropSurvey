// pages/admin.js
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebaseClient';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import Link from 'next/link';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function Admin() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [summary, setSummary] = useState(null);
  const [list, setList] = useState({ docs: [], total: 0, page: 1 });
  const [loading, setLoading] = useState(false);
  const [townshipFilter, setTownshipFilter] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        await loadSummary(u);
        await loadList(u, 1, 50, townshipFilter);
      } else {
        setSummary(null);
        setList({ docs: [], total: 0, page: 1 });
      }
    });
    return () => unsubscribe();
  }, []);

  async function getAuthHeader() {
    const token = await auth.currentUser.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function signIn(e) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert('Sign in error: ' + err.message);
    }
  }

  async function signUp(e) {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('User created. Please sign in.');
    } catch (err) {
      alert('Sign up error: ' + err.message);
    }
  }

  async function signUserOut() {
    await signOut(auth);
  }

  async function loadSummary(u) {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/admin/summary', { headers });
      const json = await res.json();
      setSummary(json);
    } catch (err) {
      console.error(err);
      alert('Failed to load summary: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function loadList(u, page=1, limit=50, township='') {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const qs = new URLSearchParams({ page, limit, ...(township ? { township } : {}) }).toString();
      const res = await fetch('/api/admin/list?' + qs, { headers });
      const json = await res.json();
      setList(json);
    } catch (err) {
      console.error(err);
      alert('Failed to load list');
    } finally {
      setLoading(false);
    }
  }

  function buildBarData() {
    if (!summary || !summary.byTownship || !Array.isArray(summary.byTownship)) {
      return { labels: [], datasets: [] };
    }
    const labels = summary.byTownship.map(x => x.township || 'Unknown');
    const data = summary.byTownship.map(x => x.count || 0);
    return {
      labels,
      datasets: [{ label: 'Responses', data, backgroundColor: ['#1e40af', '#0891b2', '#10b981'] }]
    };
  }

  function buildPieData() {
    if (!summary || !summary.byTownship || !Array.isArray(summary.byTownship)) {
      return { labels: [], datasets: [] };
    }
    const labels = summary.byTownship.map(x => x.township || 'Unknown');
    const data = summary.byTownship.map(x => x.count || 0);
    return {
      labels,
      datasets: [{ data, backgroundColor: ['#1e40af', '#0891b2', '#10b981'] }]
    };
  }

  function exportCSV() {
    if (!list.docs || !list.docs.length) {
      alert('No rows to export');
      return;
    }
    const rows = list.docs.map(d => {
      const copy = { ...d };
      if (copy._id) copy._id = copy._id.$oid || copy._id;
      Object.keys(copy).forEach(k => {
        if (typeof copy[k] === 'object' && copy[k] !== null) {
          copy[k] = JSON.stringify(copy[k]);
        }
      });
      return copy;
    });
    const keys = Object.keys(rows[0]);
    const csv = [
      keys.join(','),
      ...rows.map(r => keys.map(k => {
        const v = (r[k] ?? '').toString().replace(/"/g, '""');
        return (v.includes(',') || v.includes('"') || v.includes('\n')) ? `"${v}"` : v;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey_data_${new Date().toISOString().split('T')[0]}_page${list.page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printTable() {
    window.print();
  }

  return (
    <>
      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .admin-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%);
          display: flex;
          flex-direction: column;
        }
        
        /* Header Styles */
        .admin-header {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-bottom: 3px solid #1e40af;
        }
        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .logo-badges {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .logo-badge {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .logo-badge:hover {
          background: rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }
        .admin-title {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .user-section {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .user-email {
          color: white;
          font-size: 13px;
          font-weight: 600;
        }
        .signout-btn {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .signout-btn:hover {
          background: rgba(255,255,255,0.3);
        }
        
        /* Main Content */
        .main-content {
          flex: 1;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 32px;
        }
        
        /* Login Card */
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 500px;
        }
        .login-card {
          background: white;
          border-radius: 16px;
          padding: 48px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
        }
        .login-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          border-radius: 14px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
        }
        .login-title {
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
        }
        .login-subtitle {
          text-align: center;
          font-size: 15px;
          color: #64748b;
          margin: 0 0 32px 0;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.3s ease;
        }
        .form-input:focus {
          outline: none;
          border-color: #1e40af;
          box-shadow: 0 0 0 3px rgba(30,64,175,0.1);
        }
        .btn-primary-login {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 12px;
          transition: all 0.3s ease;
        }
        .btn-primary-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(30,64,175,0.3);
        }
        .btn-secondary-login {
          width: 100%;
          padding: 14px;
          background: #f1f5f9;
          color: #475569;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-secondary-login:hover {
          background: #e2e8f0;
        }
        
        /* Dashboard Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 28px 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .stat-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .stat-value {
          font-size: 36px;
          font-weight: 800;
          color: #1e293b;
        }
        
        /* Charts */
        .charts-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 24px;
          margin-bottom: 28px;
        }
        .chart-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #e2e8f0;
        }
        .chart-header {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f1f5f9;
        }
        .chart-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }
        .chart-body {
          height: 280px;
        }
        
        /* Table Section */
        .table-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #e2e8f0;
        }
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          gap: 20px;
          flex-wrap: wrap;
        }
        .table-title-section h6 {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 6px 0;
        }
        .table-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }
        .table-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .filter-select {
          padding: 8px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .filter-select:focus {
          outline: none;
          border-color: #1e40af;
        }
        .btn-action {
          padding: 8px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          color: #475569;
        }
        .btn-action:hover {
          border-color: #1e40af;
          color: #1e40af;
        }
        .btn-refresh {
          background: #eff6ff;
          border-color: #1e40af;
          color: #1e40af;
        }
        .btn-refresh:hover {
          background: #dbeafe;
        }
        .btn-export {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }
        .btn-export:hover {
          background: #059669;
        }
        .btn-print {
          background: #64748b;
          border-color: #64748b;
          color: white;
        }
        .btn-print:hover {
          background: #475569;
        }
        
        /* Table */
        .table-container {
          overflow-x: auto;
          margin-bottom: 20px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table thead {
          background: #f8fafc;
        }
        .data-table th {
          padding: 14px 16px;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }
        .data-table td {
          padding: 14px 16px;
          font-size: 14px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }
        .data-table tbody tr:hover {
          background: #f8fafc;
        }
        .township-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #eff6ff;
          color: #1e40af;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        
        /* Pagination */
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 2px solid #f1f5f9;
        }
        .page-info {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }
        .pagination-btns {
          display: flex;
          gap: 8px;
        }
        .btn-page {
          padding: 8px 16px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-page:hover:not(:disabled) {
          border-color: #1e40af;
          color: #1e40af;
        }
        .btn-page:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Footer */
        .admin-footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 24px 32px;
          margin-top: auto;
        }
        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-text {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }
        .footer-brand {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }
        
        @media (max-width: 768px) {
          .header-content, .main-content {
            padding: 20px;
          }
          .login-card {
            padding: 32px 24px;
          }
          .charts-row {
            grid-template-columns: 1fr;
          }
          .table-actions {
            width: 100%;
          }
          .btn-action, .filter-select {
            flex: 1;
          }
        }
        
        @media print {
          .admin-header, .table-actions, .pagination, .admin-footer {
            display: none !important;
          }
        }
      `}</style>

      <div className="admin-wrapper">
        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <div className="header-left">
              <div className="logo-badges">
                <div className="logo-badge">💧 WaterWise</div>
                <div className="logo-badge">🏢 Rand Water</div>
              </div>
              <div className="admin-title" href="./index">Admin Dashboard</div>
            </div>
            {user && (
              <div className="user-section">
                <span className="user-email">{user.email}</span>
                <button className="signout-btn" onClick={signUserOut}>Sign Out</button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {!user ? (
            <div className="login-container">
              <div className="login-card">
                <div className="login-icon">🔐</div>
                <h2 className="login-title">Administrator Access</h2>
                <p className="login-subtitle">Sign in to access the admin dashboard</p>
                <form onSubmit={signIn}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email"
                      className="form-input" 
                      value={email} 
                      onChange={(e)=>setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                      type="password"
                      className="form-input" 
                      value={password} 
                      onChange={(e)=>setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <button className="btn-primary-login" type="submit">Sign In</button>
                  <button className="btn-secondary-login" type="button" onClick={signUp}>Create Account</button>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Responses</div>
                  <div className="stat-value">{loading ? '...' : (summary?.totalResponses ?? 0)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active Locations</div>
                  <div className="stat-value">{summary?.byTownship?.length || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Current Page</div>
                  <div className="stat-value">{list.page}</div>
                </div>
              </div>

              {/* Charts */}
              <div className="charts-row">
                <div className="chart-card">
                  <div className="chart-header">
                    <h6 className="chart-title">📊 Response Distribution</h6>
                  </div>
                  <div className="chart-body">
                    {loading ? <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#64748b'}}>Loading data...</div> : <Bar data={buildBarData()} options={{ responsive: true, maintainAspectRatio: false }} />}
                  </div>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <h6 className="chart-title">📍 Township Distribution</h6>
                  </div>
                  <div className="chart-body">
                    <Pie data={buildPieData()} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="table-card">
                <div className="table-header">
                  <div className="table-title-section">
                    <h6>Survey Responses</h6>
                    <p className="table-subtitle">Page {list.page} — {list.total} total records</p>
                  </div>
                  <div className="table-actions">
                    <select 
                      className="filter-select" 
                      value={townshipFilter} 
                      onChange={(e)=> { setTownshipFilter(e.target.value); loadList(user, 1, 50, e.target.value); }}
                    >
                      <option value="">All Townships</option>
                      <option value="Soweto">Soweto</option>
                      <option value="Alexandra">Alexandra</option>
                      <option value="Tembisa">Tembisa</option>
                    </select>
                    <button className="btn-action btn-refresh" onClick={()=>loadList(user, list.page, list.limit, townshipFilter)}>Refresh</button>
                    <button className="btn-action btn-export" onClick={exportCSV}>Export CSV</button>
                    <button className="btn-action btn-print" onClick={printTable}>Print</button>
                  </div>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Submitted</th>
                        <th>Township</th>
                        <th>Household Size</th>
                        <th>Dwelling Type</th>
                        <th>Water Sources</th>
                        <th>Shortage Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.docs && list.docs.length ? list.docs.map((r) => (
                        <tr key={r._id?.$oid || r._id || Math.random()}>
                          <td>{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : (r.submittedAt?._bsontype ? new Date(r.submittedAt.toString()).toLocaleString() : '')}</td>
                          <td><span className="township-badge">{r.township}</span></td>
                          <td>{r.householdSize}</td>
                          <td>{r.dwellingType}</td>
                          <td>{Array.isArray(r.waterSources) ? r.waterSources.join('; ') : r.waterSources}</td>
                          <td>{r.shortagesFreq}</td>
                        </tr>
                      )) : <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#64748b', fontStyle:'italic'}}>No records found</td></tr>}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <div className="page-info">Page {list.page} of {Math.ceil(list.total / 50) || 1}</div>
                  <div className="pagination-btns">
                    <button 
                      className="btn-page" 
                      onClick={()=> { if(list.page>1) loadList(user, list.page-1, list.limit, townshipFilter); }}
                      disabled={list.page <= 1}
                    >
                      Previous
                    </button>
                    <button 
                      className="btn-page" 
                      onClick={()=> loadList(user, list.page+1, list.limit, townshipFilter)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="admin-footer">
          <div className="footer-content">
            <span className="footer-text">© {new Date().getFullYear()} Drop-By-Drop Water Conservation Survey</span>
            <span className="footer-brand">Powered by Brandscapers Africa</span>
          </div>
        </div>
      </div>
    </>
  );
}