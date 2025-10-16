// pages/admin.js
import { useEffect, useState, useMemo } from 'react';
import { auth } from '../lib/firebaseClient';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import Link from 'next/link';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, LineElement, PointElement);

export default function Admin() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const [summary, setSummary] = useState(null);
  const [list, setList] = useState({ docs: [], total: 0, page: 1 });
  const [loading, setLoading] = useState(false);
  const [townshipFilter, setTownshipFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChart, setSelectedChart] = useState('bar'); // 'bar', 'pie', 'line'
  const [exportLoading, setExportLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Add notification
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        await loadSummary(u);
        await loadList(u, 1, 50, townshipFilter, dateRange);
        addNotification('Welcome back! Dashboard loaded successfully.', 'success');
      } else {
        setSummary(null);
        setList({ docs: [], total: 0, page: 1 });
      }
    });

    // Hide disclaimer after 5 seconds
    const disclaimerTimer = setTimeout(() => {
      setShowDisclaimer(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(disclaimerTimer);
    };
  }, []);

  async function getAuthHeader() {
    const token = await auth.currentUser.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function signIn(e) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      addNotification('Successfully signed in!', 'success');
    } catch (err) {
      addNotification('Sign in error: ' + err.message, 'error');
    } finally {
      setLoginLoading(false);
    }
  }

  async function signUp(e) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      addNotification('User created successfully. Please sign in.', 'success');
    } catch (err) {
      addNotification('Sign up error: ' + err.message, 'error');
    } finally {
      setLoginLoading(false);
    }
  }

  async function signUserOut() {
    await signOut(auth);
    addNotification('Signed out successfully.', 'info');
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
      addNotification('Failed to load summary data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadList(u, page = 1, limit = 50, township = '', dateRange = {}) {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const params = { page, limit, ...(township && { township }), ...(dateRange.start && { startDate: dateRange.start }), ...(dateRange.end && { endDate: dateRange.end }) };
      const qs = new URLSearchParams(params).toString();
      const res = await fetch('/api/admin/list?' + qs, { headers });
      const json = await res.json();
      setList(json);
    } catch (err) {
      console.error(err);
      addNotification('Failed to load survey data', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return list.docs;
    return list.docs.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [list.docs, searchTerm]);

  function buildChartData() {
    if (!summary || !summary.byTownship || !Array.isArray(summary.byTownship)) {
      return { labels: [], datasets: [] };
    }
    
    const labels = summary.byTownship.map(x => x.township || 'Unknown');
    const data = summary.byTownship.map(x => x.count || 0);
    
    const backgroundColors = [
      '#1e40af', '#0891b2', '#10b981', '#f59e0b', '#ef4444', 
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];

    switch (selectedChart) {
      case 'bar':
        return {
          labels,
          datasets: [{ 
            label: 'Survey Responses', 
            data, 
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
            borderWidth: 2
          }]
        };
      case 'pie':
        return {
          labels,
          datasets: [{ 
            data, 
            backgroundColor: backgroundColors,
            borderWidth: 2,
            borderColor: '#fff'
          }]
        };
      case 'line':
        return {
          labels,
          datasets: [{ 
            label: 'Response Trend',
            data,
            borderColor: '#1e40af',
            backgroundColor: 'rgba(30, 64, 175, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }]
        };
      default:
        return { labels: [], datasets: [] };
    }
  }

  async function exportCSV() {
    if (!list.docs || !list.docs.length) {
      addNotification('No data available to export', 'warning');
      return;
    }

    setExportLoading(true);
    try {
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
      a.download = `water_survey_data_${new Date().toISOString().split('T')[0]}_page${list.page}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addNotification('CSV exported successfully!', 'success');
    } catch (err) {
      addNotification('Export failed: ' + err.message, 'error');
    } finally {
      setExportLoading(false);
    }
  }

  function printTable() {
    window.print();
  }

  const handleDateFilter = () => {
    loadList(user, 1, 50, townshipFilter, dateRange);
  };

  const clearFilters = () => {
    setTownshipFilter('');
    setDateRange({ start: '', end: '' });
    setSearchTerm('');
    loadList(user, 1, 50);
  };

  return (
    <>
      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .admin-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex;
          flex-direction: column;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        /* Notification System */
        .notifications-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 420px;
        }
        
        .notification {
          padding: 16px 20px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .notification.success { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        .notification.error { 
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        .notification.warning { 
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        .notification.info { 
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        
        @keyframes slideIn {
          from { 
            transform: translateX(100%) scale(0.9); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0) scale(1); 
            opacity: 1; 
          }
        }
        
        /* Enhanced Header */
        .admin-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          box-shadow: 0 4px 24px rgba(0,0,0,0.16);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
        }
        
        .header-content {
          max-width: 1440px;
          margin: 0 auto;
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .logo-image {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.2);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        
        .admin-title {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(12px);
          padding: 10px 18px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .user-section {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          padding: 12px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
        }
        
        .user-email {
          color: white;
          font-size: 14px;
          font-weight: 600;
        }
        
        .signout-btn {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .signout-btn:hover {
          background: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }
        
        /* Main Content */
        .main-content {
          flex: 1;
          max-width: 1440px;
          width: 100%;
          margin: 0 auto;
          padding: 32px;
        }
        
        /* Enhanced Login */
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          position: relative;
          overflow: hidden;
          padding: 40px 24px;
        }
        
        /* Disclaimer */
        .disclaimer {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3);
          z-index: 20;
          max-width: 500px;
          width: 90%;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          border: 2px solid rgba(255,255,255,0.2);
          animation: fadeOut 0.5s ease-in-out 4.5s forwards;
          backdrop-filter: blur(8px);
        }
        
        @keyframes fadeOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
        
        /* Enhanced Animations */
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) rotate(0deg) scale(1); 
            opacity: 0.6; 
          }
          50% { 
            transform: translateY(-40px) rotate(180deg) scale(1.1); 
            opacity: 0.8; 
          }
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0) rotate(0deg) scale(1); 
            opacity: 0.5; 
          }
          50% { 
            transform: translateY(-50px) rotate(-180deg) scale(1.05); 
            opacity: 0.7; 
          }
        }
        
        @keyframes ripple {
          0% { 
            transform: scale(0.8); 
            opacity: 0.8; 
          }
          100% { 
            transform: scale(1.4); 
            opacity: 0; 
          }
        }
        
        .water-bubble {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.5), rgba(14, 165, 233, 0.3));
          backdrop-filter: blur(12px);
          border: 2px solid rgba(56, 189, 248, 0.4);
          filter: blur(1px);
        }
        
        .bubble-1 { width: 100px; height: 100px; top: 10%; left: 10%; animation: float 8s ease-in-out infinite; }
        .bubble-2 { width: 150px; height: 150px; top: 60%; left: 8%; animation: float-delayed 10s ease-in-out infinite; }
        .bubble-3 { width: 80px; height: 80px; top: 25%; right: 15%; animation: float 9s ease-in-out infinite 1s; }
        .bubble-4 { width: 120px; height: 120px; bottom: 10%; right: 12%; animation: float-delayed 11s ease-in-out infinite 2s; }
        .bubble-5 { width: 90px; height: 90px; top: 75%; left: 35%; animation: float 7s ease-in-out infinite 1.5s; }
        .bubble-6 { width: 110px; height: 110px; top: 12%; right: 40%; animation: float-delayed 8s ease-in-out infinite 0.5s; }
        
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 56px 48px;
          max-width: 480px;
          width: 100%;
          box-shadow: 
            0 24px 80px rgba(0,0,0,0.15),
            0 0 0 1px rgba(255,255,255,0.9);
          border: 1px solid rgba(255,255,255,0.6);
          position: relative;
          z-index: 10;
        }
        
        .login-logo-container {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .login-logo-wrapper {
          width: 140px;
          height: 140px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 16px 40px rgba(14, 165, 233, 0.4);
        }
        
        .login-logo-wrapper::before {
          content: '';
          position: absolute;
          inset: -4px;
          background: linear-gradient(135deg, #0ea5e9, #0284c7, #06b6d4);
          border-radius: 28px;
          z-index: -1;
          animation: ripple 3s ease-out infinite;
        }
        
        .login-logo-img {
          width: 80px;
          height: 80px;
          border-radius: 16px;
        }
        
        .login-title {
          text-align: center;
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 12px 0;
          letter-spacing: -0.5px;
        }
        
        .login-subtitle {
          text-align: center;
          font-size: 16px;
          color: #64748b;
          margin: 0 0 40px 0;
          font-weight: 500;
          line-height: 1.6;
        }
        
        .form-group {
          margin-bottom: 24px;
        }
        
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 10px;
        }
        
        .form-input {
          width: 100%;
          padding: 16px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(248, 250, 252, 0.9);
          font-weight: 500;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
          background: white;
          transform: translateY(-2px);
        }
        
        .form-input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }
        
        .btn-primary-login {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(14, 165, 233, 0.4);
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .btn-primary-login::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.6s;
        }
        
        .btn-primary-login:hover:not(:disabled)::before {
          left: 100%;
        }
        
        .btn-primary-login:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(14, 165, 233, 0.5);
        }
        
        .btn-secondary-login {
          width: 100%;
          padding: 18px;
          background: white;
          color: #0284c7;
          border: 2px solid #e0f2fe;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-secondary-login:hover {
          background: #f0f9ff;
          border-color: #0ea5e9;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(14, 165, 233, 0.2);
        }
        
        /* Enhanced Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          padding: 32px 28px;
          box-shadow: 
            0 4px 16px rgba(0,0,0,0.08),
            0 0 0 1px rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.6);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 6px;
          height: 100%;
          background: linear-gradient(to bottom, #0ea5e9, #1e40af);
        }
        
        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 
            0 12px 40px rgba(0,0,0,0.15),
            0 0 0 1px rgba(255,255,255,0.9);
        }
        
        .stat-label {
          font-size: 14px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 12px;
        }
        
        .stat-value {
          font-size: 42px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 8px;
        }
        
        .stat-trend {
          font-size: 13px;
          font-weight: 700;
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .trend-up { color: #10b981; }
        .trend-down { color: #ef4444; }
        
        /* Enhanced Charts */
        .charts-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
          gap: 28px;
          margin-bottom: 32px;
        }
        
        .chart-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 
            0 4px 16px rgba(0,0,0,0.08),
            0 0 0 1px rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.6);
          transition: transform 0.3s ease;
        }
        
        .chart-card:hover {
          transform: translateY(-4px);
        }
        
        .chart-header {
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .chart-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .chart-controls {
          display: flex;
          gap: 8px;
        }
        
        .chart-btn {
          padding: 8px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          background: white;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .chart-btn.active {
          background: linear-gradient(135deg, #1e40af 0%, #0f172a 100%);
          color: white;
          border-color: #1e40af;
        }
        
        .chart-btn:hover:not(.active) {
          border-color: #1e40af;
          color: #1e40af;
          transform: translateY(-2px);
        }
        
        .chart-body {
          height: 320px;
          position: relative;
        }
        
        /* Enhanced Table Section */
        .table-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          padding: 32px 28px;
          box-shadow: 
            0 4px 16px rgba(0,0,0,0.08),
            0 0 0 1px rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.6);
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          gap: 24px;
          flex-wrap: wrap;
        }
        
        .table-title-section h6 {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }
        
        .table-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }
        
        .table-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        /* Enhanced Filters */
        .filters-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          align-items: flex-end;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .filter-label {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .filter-select, .filter-input {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 160px;
          background: white;
        }
        
        .filter-input {
          cursor: text;
        }
        
        .filter-select:focus, .filter-input:focus {
          outline: none;
          border-color: #1e40af;
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
          transform: translateY(-2px);
        }
        
        .search-input {
          min-width: 240px;
        }
        
        .btn-action {
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-action:hover {
          border-color: #1e40af;
          color: #1e40af;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        
        .btn-action:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
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
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-color: #10b981;
          color: white;
        }
        
        .btn-export:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border-color: #059669;
        }
        
        .btn-print {
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
          border-color: #64748b;
          color: white;
        }
        
        .btn-print:hover {
          background: linear-gradient(135deg, #475569 0%, #374151 100%);
          border-color: #475569;
        }
        
        .btn-clear {
          background: #fef2f2;
          border-color: #ef4444;
          color: #ef4444;
        }
        
        .btn-clear:hover {
          background: #fee2e2;
        }
        
        /* Enhanced Table */
        .table-container {
          overflow-x: auto;
          margin-bottom: 24px;
          border-radius: 12px;
          border: 2px solid #f1f5f9;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table thead {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .data-table th {
          padding: 18px 20px;
          text-align: left;
          font-size: 13px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 2px solid #e2e8f0;
          white-space: nowrap;
        }
        
        .data-table td {
          padding: 18px 20px;
          font-size: 14px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          font-weight: 500;
        }
        
        .data-table tbody tr {
          transition: all 0.2s ease;
        }
        
        .data-table tbody tr:hover {
          background: #f8fafc;
          transform: scale(1.002);
        }
        
        .township-badge {
          display: inline-block;
          padding: 6px 12px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #1e40af;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid #dbeafe;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-complete { 
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        
        .status-pending { 
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          border: 1px solid #fde68a;
        }
        
        /* Enhanced Pagination */
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 2px solid #f1f5f9;
        }
        
        .page-info {
          font-size: 14px;
          color: #64748b;
          font-weight: 600;
        }
        
        .pagination-btns {
          display: flex;
          gap: 10px;
        }
        
        .btn-page {
          padding: 10px 18px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-page:hover:not(:disabled) {
          border-color: #1e40af;
          color: #1e40af;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .btn-page:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }
        
        /* Loading States */
        .loading-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Footer */
        .admin-footer {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-top: 2px solid #e2e8f0;
          padding: 28px 32px;
          margin-top: auto;
        }
        
        .footer-content {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .footer-text {
          font-size: 14px;
          color: #64748b;
          font-weight: 600;
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        .footer-brand:hover {
          color: #0f172a;
        }
        
        .footer-logo {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          object-fit: cover;
        }
        
        /* Responsive Design */
        @media (max-width: 1024px) {
          .charts-row {
            grid-template-columns: 1fr;
          }
          
          .chart-body {
            height: 280px;
          }
        }
        
        @media (max-width: 768px) {
          .header-content, .main-content {
            padding: 20px;
          }
          
          .login-card {
            padding: 40px 28px;
          }
          
          .table-actions, .filters-section {
            width: 100%;
          }
          
          .btn-action, .filter-select, .filter-input {
            flex: 1;
            min-width: auto;
          }
          
          .chart-controls {
            flex-wrap: wrap;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .header-left {
            justify-content: center;
            text-align: center;
          }
          
          .user-section {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .login-card {
            padding: 32px 20px;
          }
          
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-select, .filter-input {
            min-width: auto;
          }
          
          .table-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          
          .table-actions {
            justify-content: stretch;
          }
          
          .btn-action {
            flex: 1;
            justify-content: center;
          }
        }
        
        @media print {
          .admin-header, .table-actions, .pagination, .admin-footer, .filters-section, .chart-controls {
            display: none !important;
          }
          
          .table-card {
            box-shadow: none;
            border: 1px solid #000;
          }
        }
      `}</style>

      <div className="admin-wrapper">
        {/* Notification System */}
        <div className="notifications-container">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              {notification.type === 'success' && '✓ '}
              {notification.type === 'error' && '✗ '}
              {notification.type === 'warning' && '⚠ '}
              {notification.type === 'info' && 'ℹ '}
              {notification.message}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <div className="header-left">
              <div className="logo-container">
                <img 
                  src="./randwaterlogo.png" 
                  alt="Admin Logo" 
                  className="logo-image"
                />
                <div className="admin-title">Administrative Dashboard</div>
              </div>
            </div>
            {user && (
              <div className="user-section">
                <span className="user-email">{user.email}</span>
                <button className="signout-btn" onClick={signUserOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {!user ? (
            <div className="login-container">
              {/* Disclaimer */}
              {showDisclaimer && (
                <div className="disclaimer">
                  ⚠️ WARNING: This page is for authorized administrators only. 
                  Unauthorized access will result in serious consequences.
                </div>
              )}
              
              {/* Animated Water Bubbles */}
              <div className="water-bubble bubble-1"></div>
              <div className="water-bubble bubble-2"></div>
              <div className="water-bubble bubble-3"></div>
              <div className="water-bubble bubble-4"></div>
              <div className="water-bubble bubble-5"></div>
              <div className="water-bubble bubble-6"></div>
              
              <div className="login-card">
                <div className="login-logo-container">
                  <div className="login-logo-wrapper">
                    <img 
                      src="/WaterWiseLogo.png" 
                      alt="WaterWise Analytics" 
                      className="login-logo-img"
                    />
                  </div>
                </div>
                <h2 className="login-title">Administrative Portal</h2>
                <p className="login-subtitle">
                  Access the Water Conservation Survey analytics dashboard
                </p>
                <form onSubmit={signIn}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email"
                      className="form-input" 
                      value={email} 
                      onChange={(e)=>setEmail(e.target.value)}
                      placeholder="administrator@example.com"
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
                      placeholder="Enter your secure password"
                      required
                    />
                  </div>
                  <button 
                    className="btn-primary-login" 
                    type="submit"
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <span className="loading-spinner" style={{marginRight: '8px'}}></span>
                    ) : null}
                    {loginLoading ? 'Authenticating...' : 'Secure Sign In'}
                  </button>
                  <button 
                    className="btn-secondary-login" 
                    type="button" 
                    onClick={signUp}
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <span className="loading-spinner" style={{marginRight: '8px'}}></span>
                    ) : null}
                    {loginLoading ? 'Processing...' : 'Create Administrator Account'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Survey Responses</div>
                  <div className="stat-value">
                    {loading ? '...' : (summary?.totalResponses ?? 0).toLocaleString()}
                  </div>
                  <div className="stat-trend trend-up">
                    
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active Locations</div>
                  <div className="stat-value">
                    {summary?.byTownship?.length || 0}
                  </div>
                  <div className="stat-trend trend-up">
                  
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Current Page</div>
                  <div className="stat-value">
                    {list.page}
                  </div>
                  <div className="stat-trend">
                    of {Math.ceil(list.total / 50) || 1} total
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Filtered Results</div>
                  <div className="stat-value">
                    {filteredData.length.toLocaleString()}
                  </div>
                  <div className="stat-trend">
                    matching current criteria
                  </div>
                </div>
              </div>

              {/* Charts - Only Response Distribution */}
              <div className="charts-row">
                <div className="chart-card">
                  <div className="chart-header">
                    <h6 className="chart-title">
                      📊 Response Distribution Analytics
                    </h6>
                    <div className="chart-controls">
                      <button 
                        className={`chart-btn ${selectedChart === 'bar' ? 'active' : ''}`}
                        onClick={() => setSelectedChart('bar')}
                      >
                        Bar Chart
                      </button>
                      <button 
                        className={`chart-btn ${selectedChart === 'pie' ? 'active' : ''}`}
                        onClick={() => setSelectedChart('pie')}
                      >
                        Pie Chart
                      </button>
                      <button 
                        className={`chart-btn ${selectedChart === 'line' ? 'active' : ''}`}
                        onClick={() => setSelectedChart('line')}
                      >
                        Trend Line
                      </button>
                    </div>
                  </div>
                  <div className="chart-body">
                    {loading ? (
                      <div style={{
                        display:'flex', 
                        alignItems:'center', 
                        justifyContent:'center', 
                        height:'100%', 
                        color:'#64748b',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        <span className="loading-spinner" style={{marginRight: '12px'}}></span>
                        Loading visualization data...
                      </div>
                    ) : selectedChart === 'bar' ? (
                      <Bar 
                        data={buildChartData()} 
                        options={{ 
                          responsive: true, 
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                font: {
                                  size: 12,
                                  weight: '600'
                                }
                              }
                            }
                          }
                        }} 
                      />
                    ) : selectedChart === 'pie' ? (
                      <Pie 
                        data={buildChartData()} 
                        options={{ 
                          responsive: true, 
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                font: {
                                  size: 11,
                                  weight: '600'
                                }
                              }
                            }
                          }
                        }} 
                      />
                    ) : (
                      <Line 
                        data={buildChartData()} 
                        options={{ 
                          responsive: true, 
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                font: {
                                  size: 12,
                                  weight: '600'
                                }
                              }
                            }
                          }
                        }} 
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <div className="table-card">
                <div className="table-header">
                  <div className="table-title-section">
                    <h6>Survey Response Management</h6>
                    <p className="table-subtitle">
                      Displaying {filteredData.length.toLocaleString()} of {list.total.toLocaleString()} records • 
                      Page {list.page} of {Math.ceil(list.total / 50) || 1}
                    </p>
                  </div>
                  <div className="table-actions">
                    <button 
                      className="btn-action btn-refresh" 
                      onClick={()=>loadList(user, list.page, list.limit, townshipFilter, dateRange)}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        '↻'
                      )}
                      Refresh Data
                    </button>
                    <button 
                      className="btn-action btn-export" 
                      onClick={exportCSV}
                      disabled={exportLoading || !list.docs.length}
                    >
                      {exportLoading ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        '📥'
                      )}
                      Export CSV
                    </button>
                    <button className="btn-action btn-print" onClick={printTable}>
                      🖨️ Print Report
                    </button>
                  </div>
                </div>

                {/* Enhanced Filters */}
                <div className="filters-section">
                  <div className="filter-group">
                    <label className="filter-label">Township Filter</label>
                    <select 
                      className="filter-select" 
                      value={townshipFilter} 
                      onChange={(e)=> { 
                        setTownshipFilter(e.target.value); 
                        loadList(user, 1, 50, e.target.value, dateRange); 
                      }}
                    >
                      <option value="">All Townships</option>
                      <option value="Soweto">Soweto</option>
                      <option value="Alexandra">Alexandra</option>
                      <option value="Tembisa">Tembisa</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label className="filter-label">Start Date</label>
                    <input 
                      type="date" 
                      className="filter-input" 
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label className="filter-label">End Date</label>
                    <input 
                      type="date" 
                      className="filter-input" 
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                    />
                  </div>
                  
                  <button 
                    className="btn-action" 
                    onClick={handleDateFilter}
                    disabled={loading}
                  >
                    Apply Date Range
                  </button>

                  <div className="filter-group" style={{flex: 1}}>
                    <label className="filter-label">Global Search</label>
                    <input 
                      type="text" 
                      className="filter-input search-input" 
                      placeholder="Search across all fields and columns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <button 
                    className="btn-action btn-clear" 
                    onClick={clearFilters}
                  >
                    ✕ Clear All Filters
                  </button>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date Submitted</th>
        <th>Township</th>
        <th>Household Size</th>
        <th>Dwelling Type</th>
        <th>Dwelling Type (Other)</th>
        <th>Own or Rent</th>
        <th>Own/Rent (Other)</th>
        <th>Has Meter</th>
        <th>Water Sources</th>
        <th>Water Sources (Other)</th>
        <th>Shortage Frequency</th>
        <th>Home Devices</th>
        <th>Garden Watering</th>
        <th>Received Education</th>
        <th>Concern Level</th>
        <th>Know How To Report</th>
        <th>Reported Issue</th>
        <th>Area Notices</th>
        <th>Infrastructure Rating</th>
        <th>Interest in Workshop</th>
        <th>Willing to Adopt Changes</th>
        <th>Community Role</th>
        <th>Biggest Challenge</th>
        <th>Suggestions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData && filteredData.length ? filteredData.map((r) => (
                        <tr key={r._id?.$oid || r._id || Math.random()}>
                          <td>
                            {r.submittedAt ? 
                              new Date(r.submittedAt).toLocaleString() : 
                              (r.submittedAt?._bsontype ? 
                                new Date(r.submittedAt.toString()).toLocaleString() : 
                                'N/A'
                              )
                            }
                          </td>
                          <td>
                            <span className="township-badge">{r.township}</span>
                          </td>
                          <td>{r.householdSize}</td>
                          <td>{r.dwellingType}</td>
                          <td>
                            {Array.isArray(r.waterSources) ? 
                              r.waterSources.join('; ') : 
                              r.waterSources}
                          </td>
                          <td>{r.shortagesFreq}</td>
                          <td>
                            <span className="status-badge status-complete">
                              Complete
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" style={{
                            textAlign:'center', 
                            padding:'48px', 
                            color:'#64748b', 
                            fontStyle:'italic',
                            fontSize: '16px',
                            fontWeight: '500'
                          }}>
                            {loading ? (
                              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'}}>
                                <span className="loading-spinner"></span>
                                Loading survey data...
                              </div>
                            ) : 'No records found matching your current filter criteria'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <div className="page-info">
                    Page {list.page} of {Math.ceil(list.total / 50) || 1} • 
                    {list.total.toLocaleString()} total records • 
                    {filteredData.length.toLocaleString()} displayed
                  </div>
                  <div className="pagination-btns">
                    <button 
                      className="btn-page" 
                      onClick={()=> { 
                        if(list.page > 1) 
                          loadList(user, list.page-1, list.limit, townshipFilter, dateRange); 
                      }}
                      disabled={list.page <= 1 || loading}
                    >
                      ← Previous Page
                    </button>
                    <button 
                      className="btn-page" 
                      onClick={()=> loadList(user, list.page+1, list.limit, townshipFilter, dateRange)}
                      disabled={list.page >= Math.ceil(list.total / 50) || loading}
                    >
                      Next Page →
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
            <span className="footer-text">
              © {new Date().getFullYear()} Drop-By-Drop Water Conservation Initiative
            </span>
            <a href="https://brandscapersafrica.com" target="_blank" rel="noopener noreferrer" className="footer-brand">
              <img 
                src="./brandlogo.jpeg" 
                alt="Brandscapers Africa" 
                className="footer-logo"
              />
              <span>Powered by Brandscapers Africa</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}