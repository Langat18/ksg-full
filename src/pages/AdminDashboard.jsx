import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';
import { fetchAnalytics, fetchStories, deleteStory, invalidateCache } from '../services/api';

const AdminDashboard = () => {
  const { user, isAdmin }   = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsData, storiesData] = await Promise.all([
        fetchAnalytics().catch(() => null),
        fetchStories({ limit: 100, status: 'published' }),
      ]);
      setMetrics(analyticsData);
      setStories(storiesData);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await deleteStory(id);
      setStories(prev => prev.filter(s => s.id !== id));
      invalidateCache('analytics:summary');
    } catch (err) {
      alert('Failed to delete story: ' + (err.response?.data?.error || err.message));
    }
  }, []);

  const derived = useMemo(() => {
    const views  = stories.reduce((s, x) => s + (x.views  || 0), 0);
    const likes  = stories.reduce((s, x) => s + (x.likes  || 0), 0);
    const shares = stories.reduce((s, x) => s + (x.shares || 0), 0);
    const catCount = {};
    stories.forEach(x => { if (x.category) catCount[x.category] = (catCount[x.category] || 0) + 1; });
    const topCat = Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a])[0] || 'N/A';
    return { views, likes, shares, topCat };
  }, [stories]);

  if (!isAdmin) {
    return (
      <div className="w-full py-12 px-4 lg:px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
        <Link to="/" className="bg-[#7F622C] text-white px-6 py-2 rounded-lg hover:bg-[#9A774A] transition">Go Home</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="w-full px-4 lg:px-6 section-ksg-padding"><SkeletonLoader type="dashboard" /></div>;
  }

  const statCards = [
    { label: 'Total Stories',    value: metrics?.total_stories || stories.length, color: 'text-[#7F622C]',  icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Total Views',      value: metrics?.total_views  || derived.views,   color: 'text-green-500', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { label: 'Total Engagement', value: derived.likes + derived.shares,           color: 'text-[#CBD300]', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { label: 'Top Category',     value: metrics?.top_category || derived.topCat,  color: 'text-amber-500', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', small: true },
  ];

  return (
    <div className="w-full space-y-8 px-4 lg:px-6">
      <div className="bg-gradient-to-r from-[#7F622C] to-[#5D4620] rounded-xl text-white p-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-white/80">Welcome back, {user?.full_name || user?.username}</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'stories'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-[#CBD300] text-[#7F622C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              {tab === 'stories' ? `Manage Stories (${stories.length})` : 'Overview'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statCards.map(({ label, value, color, icon, small }) => (
              <div key={label} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">{label}</div>
                  <svg className={`h-8 w-8 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </div>
                <div className={`font-bold text-gray-900 ${small ? 'text-lg truncate' : 'text-3xl'}`}>{value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {stories.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1 min-w-0 mr-4">
                    <h4 className="font-medium text-gray-900 truncate">{s.title}</h4>
                    <p className="text-sm text-gray-500">
                      by {s.author?.full_name || s.author?.username || 'Unknown'} • {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 flex-shrink-0">
                    <span>{s.views || 0} views</span>
                    <span>{s.likes || 0} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'stories' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Manage Stories</h2>
            <p className="text-sm text-gray-600 mt-1">View and manage all published stories</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Story', 'Author', 'Category', 'Stats', 'Date', 'Actions'].map(h => (
                    <th key={h} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stories.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{s.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{s.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {s.author?.full_name || s.author?.username || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {s.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{s.views || 0} views</div>
                      <div>{s.likes || 0} likes</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link to={`/story/${s.id}`} className="text-[#7F622C] hover:text-[#CBD300]">View</Link>
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900">Delete</button>
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

export default AdminDashboard;