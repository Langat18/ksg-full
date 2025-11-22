import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add token to axios headers
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      // Fetch user profile with stats
      const profileResponse = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = profileResponse.data;
      
      // Fetch user's stories
      const storiesResponse = await axios.get(`http://localhost:5000/api/users/${userData.id}/stories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userStories = storiesResponse.data.stories || [];
      
      // Calculate stats
      const totalViews = userStories.reduce((sum, story) => sum + (story.views || 0), 0);
      const totalShares = userStories.reduce((sum, story) => sum + (story.shares || 0), 0);
      const totalLikes = userStories.reduce((sum, story) => sum + (story.likes || 0), 0);
      
      setStats({
        totalPoints: userData.points || 0,
        storiesContributed: userStories.length,
        storiesViewed: 0,
        pathwaysCompleted: 0,
        totalViews: totalViews,
        totalShares: totalShares,
        totalLikes: totalLikes,
        level: calculateLevel(userData.points || 0),
        nextLevelPoints: calculateNextLevelPoints(userData.points || 0)
      });
      
      // Set badges based on achievements
      setBadges([
        { 
          name: 'First Story', 
          description: 'Shared your first story', 
          earned: userStories.length >= 1, 
          icon: '📖' 
        },
        { 
          name: 'Storyteller', 
          description: 'Shared 3+ stories', 
          earned: userStories.length >= 3, 
          icon: '✍️' 
        },
        { 
          name: 'Popular Voice', 
          description: 'Got 100+ total views', 
          earned: totalViews >= 100, 
          icon: '👀' 
        },
        { 
          name: 'Community Builder', 
          description: 'Got 1000+ views on your stories', 
          earned: totalViews >= 1000, 
          icon: '👥' 
        },
        { 
          name: 'Influencer', 
          description: 'Got 50+ shares', 
          earned: totalShares >= 50, 
          icon: '🔄' 
        },
        { 
          name: 'Rising Star', 
          description: 'Earned 500+ points', 
          earned: (userData.points || 0) >= 500, 
          icon: '⭐' 
        }
      ]);
      
      // Set recent activity
      setRecentActivity(userStories.slice(0, 5).map(story => ({
        type: 'contribution',
        title: `Shared "${story.title}"`,
        points: 50,
        date: formatDate(story.created_at)
      })));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (points) => {
    if (points < 100) return 'Beginner';
    if (points < 250) return 'Storyteller';
    if (points < 500) return 'Contributor';
    if (points < 1000) return 'Expert';
    return 'Master';
  };

  const calculateNextLevelPoints = (points) => {
    if (points < 100) return 100 - points;
    if (points < 250) return 250 - points;
    if (points < 500) return 500 - points;
    if (points < 1000) return 1000 - points;
    return 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#235D4C]"></div>
          <span className="ml-3 text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 mb-4">{error || 'Failed to load dashboard data.'}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-[#B5955B] hover:bg-[#B5955B]/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const levelProgress = ((stats.totalPoints % 250) / 250) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-[#235D4C] rounded-xl text-white p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name || user?.username}!</h1>
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
          <div className="text-3xl font-bold text-[#235D4C] mb-1">{stats.totalViews}</div>
          <div className="text-gray-600 text-sm">Total Views</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">{stats.totalShares}</div>
          <div className="text-gray-600 text-sm">Total Shares</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-3xl font-bold text-amber-600 mb-1">{stats.totalLikes}</div>
          <div className="text-gray-600 text-sm">Total Likes</div>
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
          {recentActivity.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
              <p className="text-sm mt-2">Start sharing stories to see your activity here!</p>
            </div>
          )}
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