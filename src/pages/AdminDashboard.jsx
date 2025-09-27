import React, { useEffect, useState } from 'react';
import { fetchAnalytics } from '../services/api';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchAnalytics().then(setMetrics).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Stories</div>
          <div className="text-2xl font-bold">{metrics?.total_stories ?? '—'}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Views</div>
          <div className="text-2xl font-bold">{metrics?.total_views ?? '—'}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Top Topic</div>
          <div className="text-2xl font-bold">{metrics?.top_topic ?? '—'}</div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Recent Submissions</h3>
        <div className="mt-2 text-sm text-gray-600">(This section expects an API endpoint /analytics/recent-submissions)</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
