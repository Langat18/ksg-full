import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPoints: 0,
    storiesContributed: 0,
    storiesViewed: 0,
    pathwaysCompleted: 0,
    totalViews: 0,
    totalShares: 0,
    level: 1,
    nextLevelPoints: 100
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/analytics/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = response.data;
      
      setStats({
        totalPoints: user.points || 0,
        storiesContributed: data.stories_count || 0,
        storiesViewed: 0,
        pathwaysCompleted: 0,
        totalViews: data.total_views || 0,
        totalShares: data.total_shares || 0,
        level: user.level || 1,
        nextLevelPoints: 100
      });
    } catch (error) {
      if (error.response?.status === 403) {
        console.warn('User analytics not available (permission denied)');
      } else {
        console.error('Failed to fetch user stats:', error);
      }
      setStats({
        totalPoints: user?.points || 0,
        storiesContributed: 0,
        storiesViewed: 0,
        pathwaysCompleted: 0,
        totalViews: 0,
        totalShares: 0,
        level: user?.level || 1,
        nextLevelPoints: 100
      });
    } finally {
      setLoading(false);
    }
  };

  const badges = [
    { name: 'First Story', description: 'Shared your first story', earned: stats.storiesContributed >= 1, icon: '📖' },
    { name: 'County Explorer', description: 'Viewed stories from 5+ counties', earned: false, icon: '🗺️' },
    { name: 'Knowledge Seeker', description: 'Completed 2+ learning pathways', earned: stats.pathwaysCompleted >= 2, icon: '🎓' },
    { name: 'Community Builder', description: 'Got 1000+ views on your stories', earned: stats.totalViews >= 1000, icon: '👥' },
    { name: 'Policy Expert', description: 'Contributed 5+ policy stories', earned: stats.storiesContributed >= 5, icon: '📋' },
    { name: 'Video Pioneer', description: 'Uploaded 3+ video stories', earned: false, icon: '🎬' }
  ];

  const levelProgress = stats.totalPoints > 0 ? ((stats.totalPoints % 200) / 200) * 100 : 0;

  if (loading) {
    return (
      <div className="section-ksg-padding">
        <div className="w-full px-4 lg:px-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7F622C] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-ksg-padding">
      <div className="w-full px-4 lg:px-6 space-y-8">
        <div className="bg-[#7F622C] rounded-xl text-white p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name || user?.username}!</h1>
            <p className="text-white/90 text-lg">Level: {stats.level}</p>
            {user?.campus && (
              <p className="text-white/80 text-sm mt-1">📍 {user.campus}</p>
            )}
            {user?.county && (
              <p className="text-white/80 text-sm">🗺️ {user.county} County</p>
            )}
          </div>
          <div className="mt-4 md:mt-0 text-center">
            <div className="text-4xl font-bold">{stats.totalPoints}</div>
            <div className="text-white/80 text-sm">Total Points</div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm text-white/80 mb-2">
            <span>Progress to next level</span>
            <span>{stats.nextLevelPoints} points to go</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-[#CBD300] mb-1">{stats.storiesContributed}</div>
          <div className="text-gray-600 text-sm">Stories Shared</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">{stats.storiesViewed}</div>
          <div className="text-gray-600 text-sm">Stories Viewed</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-[#7F622C] mb-1">{stats.totalViews}</div>
          <div className="text-gray-600 text-sm">Total Views</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-amber-600 mb-1">{stats.pathwaysCompleted}</div>
          <div className="text-gray-600 text-sm">Pathways Done</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Badges</h2>
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  badge.earned 
                    ? 'border-[#CBD300]/30 bg-[#CBD300]/5' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-2xl mb-2">{badge.icon}</div>
                <div className={`font-medium text-sm ${badge.earned ? 'text-blue-900' : 'text-gray-600'}`}>
                  {badge.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Get Started</h2>
          {stats.storiesContributed === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Your First Story!</h3>
              <p className="text-gray-600 mb-4">
                Start your journey by sharing a transformational story from your experience.
              </p>
              <Link 
                to="/submit" 
                className="inline-block bg-[#CBD300] hover:bg-[#CBD300]/90 text-[#7F622C] py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Create Story (+50 points)
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🎉</div>
                  <div>
                    <p className="font-medium text-green-900">Great start!</p>
                    <p className="text-sm text-green-700">You&apos;ve shared {stats.storiesContributed} {stats.storiesContributed === 1 ? 'story' : 'stories'}</p>
                  </div>
                </div>
              </div>
              <Link 
                to="/submit" 
                className="block w-full bg-[#CBD300] hover:bg-[#CBD300]/90 text-[#7F622C] py-2 px-4 rounded-lg font-medium transition-colors text-center"
              >
                Share Another Story (+50 points)
              </Link>
              <Link 
                to="/pathways" 
                className="block w-full bg-[#7F622C] hover:bg-[#5D4620] text-white py-2 px-4 rounded-lg font-medium transition-colors text-center"
              >
                Explore Learning Pathways
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#7F622C] rounded-lg text-white p-6">
        <h2 className="text-xl font-bold mb-4">Discover Stories from Across Kenya</h2>
        <p className="mb-4">Explore transformational stories from all 47 counties and 5 KSG campuses</p>
        <div className="grid md:grid-cols-3 gap-4">
          <Link 
            to="/search" 
            className="bg-white/20 hover:bg-white/30 p-4 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-medium">Discover Stories</div>
            <div className="text-sm opacity-90">Browse platform stories</div>
          </Link>
          <Link 
            to="/pathways" 
            className="bg-white/20 hover:bg-white/30 p-4 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-2">🎓</div>
            <div className="font-medium">Learning Pathways</div>
            <div className="text-sm opacity-90">Structured learning</div>
          </Link>
          <Link 
            to="/pulse" 
            className="bg-white/20 hover:bg-white/30 p-4 rounded-lg transition-colors text-center"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Platform Pulse</div>
            <div className="text-sm opacity-90">See platform stats</div>
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
};

export default UserDashboard;