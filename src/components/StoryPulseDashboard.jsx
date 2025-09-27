import React, { useState, useEffect } from 'react';

const StoryPulseDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalStories: 47,
    totalPlays: 12450,
    totalShares: 890,
    activeUsers: 234,
    countiesCovered: 32
  });

  // Mock data for visualizations
  const countiesData = [
    { county: 'Nairobi', stories: 12, plays: 3200 },
    { county: 'Mombasa', stories: 8, plays: 2100 },
    { county: 'Kisumu', stories: 6, plays: 1800 },
    { county: 'Nakuru', stories: 5, plays: 1500 },
    { county: 'Machakos', stories: 4, plays: 1200 },
    { county: 'Meru', stories: 3, plays: 900 },
    { county: 'Kakamega', stories: 3, plays: 850 },
    { county: 'Nyeri', stories: 2, plays: 600 }
  ];

  const hotTopics = [
    { topic: 'Digital Governance', count: 15, trend: 'up', color: 'from-ksg-gold to-ksg-goldDark' },
    { topic: 'Climate Resilience', count: 12, trend: 'up', color: 'from-ksg-goldLight to-ksg-gold' },
    { topic: 'Healthcare Innovation', count: 10, trend: 'stable', color: 'from-ksg-gold to-ksg-goldDark' },
    { topic: 'Youth Empowerment', count: 8, trend: 'up', color: 'from-ksg-goldLight to-ksg-gold' },
    { topic: 'Water Management', count: 7, trend: 'down' },
    { topic: 'Education Reform', count: 6, trend: 'stable' }
  ];

  const topInfluencers = [
    { name: 'Dr. Mary Wanjiku', stories: 5, impact: 'High', category: 'Healthcare' },
    { name: 'John Kiprotich', stories: 4, impact: 'High', category: 'Agriculture' },
    { name: 'Grace Mueni', stories: 3, impact: 'Medium', category: 'Education' },
    { name: 'David Ochieng', stories: 3, impact: 'Medium', category: 'Governance' }
  ];

  const recentActivity = [
    { action: 'New story published', title: 'Innovation in Machakos Water Project', time: '2 minutes ago' },
    { action: 'Story reached 1K views', title: 'Youth Leadership in Kisumu', time: '15 minutes ago' },
    { action: 'New contributor joined', title: 'Dr. Sarah Mwangi from Nyeri', time: '1 hour ago' },
    { action: 'Story featured', title: 'Digital Transformation in Mombasa', time: '2 hours ago' }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Story Pulse Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl p-8">
        <h1 className="text-4xl font-bold mb-4">KSG Story Pulse</h1>
        <p className="text-xl text-blue-100">Real-time insights into Kenya's knowledge network</p>
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
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.totalStories.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm font-medium">Total Stories</div>
          <div className="text-xs text-green-600 mt-1">+3 today</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.totalPlays.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm font-medium">Total Plays</div>
          <div className="text-xs text-green-600 mt-1">+157 today</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.totalShares.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm font-medium">Total Shares</div>
          <div className="text-xs text-green-600 mt-1">+23 today</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-amber-600 mb-2">
            {stats.activeUsers}
          </div>
          <div className="text-gray-600 text-sm font-medium">Active Users</div>
          <div className="text-xs text-blue-600 mt-1">Online now</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {stats.countiesCovered}/47
          </div>
          <div className="text-gray-600 text-sm font-medium">Counties</div>
          <div className="text-xs text-gray-500 mt-1">68% coverage</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Stories by County */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Stories by County</h2>
          <div className="space-y-3">
            {countiesData.map((county, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{county.county}</div>
                  <div className="text-sm text-gray-500">{county.plays.toLocaleString()} plays</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold text-blue-600">{county.stories}</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(county.stories / 15) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hot Topics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hot Topics This Month</h2>
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
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top Contributors */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Contributors</h2>
          <div className="space-y-4">
            {topInfluencers.map((contributor, index) => (
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
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Live Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                  <div className="text-sm text-blue-600">{activity.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t text-center">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Activity
            </button>
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg text-white p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Platform Goals Progress</h2>
          <p className="text-green-100">Tracking our journey to connect Kenya's knowledge network</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{stats.totalStories}/50</div>
            <div className="text-sm text-green-100 mb-3">Stories Target</div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-1000"
                style={{ width: `${(stats.totalStories / 50) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-green-200 mt-1">94% Complete</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{stats.totalPlays.toLocaleString()}/15K</div>
            <div className="text-sm text-green-100 mb-3">Engagement Target</div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-1000"
                style={{ width: `${(stats.totalPlays / 15000) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-green-200 mt-1">83% Complete</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{stats.countiesCovered}/47</div>
            <div className="text-sm text-green-100 mb-3">Counties Target</div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-1000"
                style={{ width: `${(stats.countiesCovered / 47) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-green-200 mt-1">68% Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPulseDashboard;