import React, { useState, useEffect, useCallback } from 'react';
import SkeletonLoader from './SkeletonLoader';
import { fetchAnalytics } from '../services/api';

const StoryPulseDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch pulse data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getTrendIcon = (trend) => {
    if (trend === 'up')   return <span className="text-green-500">↗</span>;
    if (trend === 'down') return <span className="text-red-500">↘</span>;
    return <span className="text-gray-500">→</span>;
  };

  const getImpactColor = (impact) => {
    if (impact === 'High')   return 'bg-red-100 text-red-800';
    if (impact === 'Medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return (
      <div className="section-ksg-padding">
        <div className="w-full px-4 lg:px-6">
          <SkeletonLoader type="dashboard" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="section-ksg-padding">
        <div className="w-full px-4 lg:px-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Failed to load pulse data</p>
            <button onClick={loadData} className="mt-4 btn-ksg-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    totalStories:    data.total_stories    || 0,
    totalPlays:      data.total_plays      || 0,
    totalShares:     data.total_shares     || 0,
    activeUsers:     data.active_users     || 0,
    countiesCovered: data.counties_covered || 0,
    totalCampuses:   data.total_campuses   || 0,
  };

  const countiesData        = data.counties_data        || [];
  const hotTopics           = data.hot_topics           || [];
  const topContributors     = data.top_contributors     || [];
  const recentActivity      = data.recent_activity      || [];
  const campusDistribution  = data.campus_distribution  || {};

  return (
    <div className="section-ksg-padding">
      <div className="w-full px-4 lg:px-6 space-y-8">
        <div className="text-center bg-[#CBD300] text-[#7F622C] rounded-xl p-8">
          <h1 className="text-4xl font-bold mb-4">KSG Story Pulse</h1>
          <p className="text-xl text-white/90">Real-time insights into Kenya&apos;s knowledge network</p>
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Data</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { label: 'Total Stories', value: stats.totalStories,                      color: '[#7F622C]' },
            { label: 'Total Views',   value: stats.totalPlays.toLocaleString(),        color: '[#7F622C]' },
            { label: 'Total Shares',  value: stats.totalShares,                        color: '[#B5955B]' },
            { label: 'Active Users',  value: stats.activeUsers,                        color: '[#235D4C]' },
            { label: 'Counties',      value: `${stats.countiesCovered}/47`,            color: '[#B5955B]',
              sub: `${Math.round((stats.countiesCovered / 47) * 100)}% coverage` },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className={`text-3xl font-bold text-${color} mb-2`}>{value}</div>
              <div className="text-gray-600 text-sm font-medium">{label}</div>
              {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Users by County</h2>
            {countiesData.length > 0 ? (
              <div className="space-y-3">
                {countiesData.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{c.county}</div>
                      <div className="text-sm text-gray-500">
                        {c.users} {c.users === 1 ? 'user' : 'users'} • {c.stories} {c.stories === 1 ? 'story' : 'stories'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-[#B5955B]">{c.users}</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-[#CBD300] h-2 rounded-full" style={{ width: `${Math.min(100, (c.users / 10) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No county data available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Campus Distribution</h2>
            {Object.keys(campusDistribution).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(campusDistribution).map(([campus, count], i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">📍 {campus}</div>
                      <div className="text-sm text-gray-500">{count} {count === 1 ? 'user' : 'users'}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-[#7F622C]">{count}</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-[#7F622C] h-2 rounded-full" style={{ width: `${Math.min(100, (count / 20) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🏫</div>
                <p className="text-gray-500">No campus data available yet</p>
                <p className="text-sm text-gray-400 mt-2">Campus data will appear as users register</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hot Topics</h2>
            {hotTopics.length > 0 ? (
              <div className="space-y-3">
                {hotTopics.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{t.topic}</div>
                      <div className="text-sm text-gray-500">{t.count} stories</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(t.trend)}
                      <div className="text-lg font-bold text-gray-700">{t.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No topics data available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Contributors</h2>
            {topContributors.length > 0 ? (
              <div className="space-y-4">
                {topContributors.map((c, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="h-12 w-12 bg-[#7F622C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#7F622C] font-bold">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-sm text-gray-500">{c.category}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-700">{c.stories}</div>
                      <div className="text-xs text-gray-500">stories</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(c.impact)}`}>
                      {c.impact}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No contributors data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{a.action}</div>
                    <div className="text-sm text-[#7F622C] truncate">{a.title}</div>
                    <div className="text-xs text-gray-500 mt-1">by {a.author} • {a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>

        {/* <div className="bg-[#7F622C] rounded-lg text-white p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Platform Goals Progress</h2>
            <p className="text-white/90">Tracking our journey to connect Kenya&apos;s knowledge network</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{stats.totalStories}/50</div>
              <div className="text-sm text-white/90 mb-3">Stories Target</div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-1000"
                  style={{ width: `${Math.min(100, (stats.totalStories / 50) * 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-white/80 mt-1">
                {Math.round((stats.totalStories / 50) * 100)}% Complete
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{stats.totalPlays}/15K</div>
              <div className="text-sm text-white/90 mb-3">Engagement Target</div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-1000"
                  style={{ width: `${Math.min(100, (stats.totalPlays / 15000) * 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-white/80 mt-1">
                {Math.round((stats.totalPlays / 15000) * 100)}% Complete
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{stats.countiesCovered}/47</div>
              <div className="text-sm text-white/90 mb-3">Counties Target</div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-1000"
                  style={{ width: `${(stats.countiesCovered / 47) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-white/80 mt-1">
                {Math.round((stats.countiesCovered / 47) * 100)}% Complete
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default StoryPulseDashboard;