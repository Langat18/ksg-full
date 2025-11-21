import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StoryPulseDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [countiesData, setCountiesData] = useState([]);
  const [hotTopics, setHotTopics] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchPulseData();
  }, []);

  const fetchPulseData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/analytics/summary');
      const data = response.data;
      
      setStats({
        totalStories: data.total_stories || 0,
        totalPlays: data.total_plays || 0,
        totalShares: data.total_shares || 0,
        activeUsers: data.active_users || 0,
        countiesCovered: data.counties_covered || 0
      });
      
      setCountiesData(data.counties_data || []);
      setHotTopics(data.hot_topics || []);
      setTopContributors(data.top_contributors || []);
      setRecentActivity(data.recent_activity || []);
      
    } catch (error) {
      console.error('Failed to fetch pulse data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">↗</span>;
      case 'down':
        return <span className="text-red-500">↘</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#235D4C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Story Pulse Data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load pulse data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center bg-[#B5955B] text-white rounded-xl p-8">
        <h1 className="text-4xl font-bold mb-4">KSG Story Pulse</h1>
        <p className="text-xl text-white/90">Real-time insights into Kenya's knowledge network</p>
        <div className="mt-4 flex justify-center">
          <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Data</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-[#B5955B] mb-2">
            {stats.totalStories}
          </div>
          <div className="text-gray-600 text-sm font-medium">Total Stories</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-[#235D4C] mb-2">
            {stats.totalPlays.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm font-medium">Total Views</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-[#B5955B] mb-2">
            {stats.totalShares}
          </div>
          <div className="text-gray-600 text-sm font-medium">Total Shares</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-[#235D4C] mb-2">
            {stats.activeUsers}
          </div>
          <div className="text-gray-600 text-sm font-medium">Active Users</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-[#B5955B] mb-2">
            {stats.countiesCovered}/47
          </div>
          <div className="text-gray-600 text-sm font-medium">Counties</div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((stats.countiesCovered / 47) * 100)}% coverage
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Stories by County */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Stories by County</h2>
          {countiesData.length > 0 ? (
            <div className="space-y-3">
              {countiesData.map((county, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{county.county}</div>
                    <div className="text-sm text-gray-500">{county.plays.toLocaleString()} views</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-bold text-[#B5955B]">{county.stories}</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#B5955B] h-2 rounded-full"
                        style={{ width: `${Math.min(100, (county.stories / 15) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No county data available</p>
          )}
        </div>

        {/* Hot Topics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hot Topics</h2>
          {hotTopics.length > 0 ? (
            <div className="space-y-3">
              {hotTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{topic.topic}</div>
                    <div className="text-sm text-gray-500">{topic.count} stories</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(topic.trend)}
                    <div className="text-lg font-bold text-gray-700">{topic.count}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No topics data available</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top Contributors */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Contributors</h2>
          {topContributors.length > 0 ? (
            <div className="space-y-4">
              {topContributors.map((contributor, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">
                      {contributor.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{contributor.name}</div>
                    <div className="text-sm text-gray-500">{contributor.category}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-700">{contributor.stories}</div>
                    <div className="text-xs text-gray-500">stories</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(contributor.impact)}`}>
                    {contributor.impact}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No contributors data available</p>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                    <div className="text-sm text-blue-600 truncate">{activity.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>

      {/* Goal Progress */}
      <div className="bg-[#B5955B] rounded-lg text-white p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Platform Goals Progress</h2>
          <p className="text-white/90">Tracking our journey to connect Kenya's knowledge network</p>
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
      </div>
    </div>
  );
};

export default StoryPulseDashboard;