import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPoints: 150,
    storiesContributed: 3,
    storiesViewed: 12,
    pathwaysCompleted: 2,
    totalViews: 1250,
    totalShares: 45,
    level: 'Storyteller',
    nextLevelPoints: 100
  });

  const [recentActivity, setRecentActivity] = useState([
    { type: 'contribution', title: 'Shared "Innovation in Machakos"', points: 50, date: '2 days ago' },
    { type: 'engagement', title: 'Completed "Leadership Journey" pathway', points: 50, date: '1 week ago' },
    { type: 'social', title: 'Story shared by KSG Official Account', points: 100, date: '2 weeks ago' }
  ]);

  const badges = [
    { name: 'First Story', description: 'Shared your first story', earned: true, icon: '📖' },
    { name: 'County Explorer', description: 'Viewed stories from 5+ counties', earned: true, icon: '🗺️' },
    { name: 'Knowledge Seeker', description: 'Completed 2+ learning pathways', earned: true, icon: '🎓' },
    { name: 'Community Builder', description: 'Got 1000+ views on your stories', earned: true, icon: '👥' },
    { name: 'Policy Expert', description: 'Contributed 5+ policy stories', earned: false, icon: '📋' },
    { name: 'Video Pioneer', description: 'Uploaded 3+ video stories', earned: false, icon: '🎬' }
  ];

  const kenyaCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Machakos', 'Meru', 'Nyeri',
    'Kakamega', 'Kitui', 'Garissa', 'Thika', 'Malindi', 'Kitale', 'Isiolo'
  ];

  const [impactData, setImpactData] = useState(
    kenyaCounties.slice(0, 8).map(county => ({
      county,
      storiesViewed: Math.floor(Math.random() * 20) + 1,
      storiesContributed: Math.floor(Math.random() * 3)
    }))
  );

  const levelProgress = (stats.totalPoints % 200) / 200 * 100;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'contribution': return '📝';
      case 'engagement': return '🎯';
      case 'social': return '🔄';
      default: return '⭐';
    }
  };

  const getPointsColor = (points) => {
    if (points >= 100) return 'text-[#B5955B]';
    if (points >= 50) return 'text-[#235D4C]';
    return 'text-[#235D4C]/80';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-[#235D4C] rounded-xl text-white p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-white/80 text-lg">Level: {stats.level}</p>
          </div>
          <div className="mt-4 md:mt-0 text-center">
            <div className="text-4xl font-bold">{stats.totalPoints}</div>
            <div className="text-blue-200 text-sm">Total Points</div>
          </div>
        </div>
        
        {/* Level Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span>Progress to next level</span>
            <span>{stats.nextLevelPoints} points to go</span>
          </div>
          <div className="w-full bg-[#235D4C]/20 rounded-full h-3">
            <div 
              className="bg-[#B5955B] h-3 rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-[#235D4C] mb-1">{stats.storiesContributed}</div>
          <div className="text-gray-600 text-sm">Stories Shared</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-[#235D4C] mb-1">{stats.storiesViewed}</div>
          <div className="text-gray-600 text-sm">Stories Viewed</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">{stats.totalViews}</div>
          <div className="text-gray-600 text-sm">Total Views</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-amber-600 mb-1">{stats.pathwaysCompleted}</div>
          <div className="text-gray-600 text-sm">Pathways Done</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Badges Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Badges</h2>
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  badge.earned 
                    ? 'border-[#B5955B] bg-[#B5955B]/5' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-2xl mb-2">{badge.icon}</div>
                <div className={`font-medium text-sm ${badge.earned ? 'text-[#235D4C]' : 'text-gray-600'}`}>
                  {badge.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="text-xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
                <div className={`text-sm font-bold ${getPointsColor(activity.points)}`}>
                  +{activity.points}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link 
              to="/submit" 
              className="w-full bg-[#B5955B] hover:bg-[#B5955B]/90 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center block shadow-sm"
            >
              Share Another Story (+50 points)
            </Link>
          </div>
        </div>
      </div>

      {/* Knowledge Impact Map */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Knowledge Impact Across Kenya</h2>
        <p className="text-gray-600 mb-6">Counties where your stories have made an impact</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {impactData.map((county, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="font-medium text-gray-900 mb-2">{county.county}</div>
              <div className="text-sm text-gray-600">
                <div>📖 {county.storiesViewed} viewed</div>
                {county.storiesContributed > 0 && (
                  <div>✍️ {county.storiesContributed} contributed</div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-[#235D4C]/5 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#235D4C]">{impactData.length}</div>
            <div className="text-sm text-[#235D4C]/80">Counties Reached</div>
            <p className="text-xs text-[#235D4C]/70 mt-2">
              Your stories are connecting communities across Kenya!
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#B5955B] rounded-lg text-white p-6">
        <h2 className="text-xl font-bold mb-4">Ready for More Impact?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link 
            to="/submit" 
            className="bg-white/20 hover:bg-white/30 p-4 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium">Share New Story</div>
            <div className="text-sm opacity-90">+50 points</div>
          </Link>
          <Link 
            to="/pathways" 
            className="bg-white/20 hover:bg-white/30 p-4 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-2">🎓</div>
            <div className="font-medium">Complete Pathway</div>
            <div className="text-sm opacity-90">+50 points</div>
          </Link>
          <Link 
            to="/search" 
            className="bg-white/20 hover:bg-white/30 p-4 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-medium">Discover Stories</div>
            <div className="text-sm opacity-90">+10 points each</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;