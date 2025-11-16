import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAnalytics } from '../services/api';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [stories, setStories] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics using the service function
      try {
        const analyticsData = await fetchAnalytics();
        setMetrics(analyticsData);
      } catch (error) {
        console.log('Analytics endpoint not available:', error);
        setMetrics(null);
      }
      
      // Fetch all stories
      try {
        const storiesResponse = await axios.get('http://localhost:5000/api/stories/', {
          params: { limit: 100, status: 'published' }
        });
        setStories(storiesResponse.data.stories || []);
      } catch (error) {
        console.error('Failed to fetch stories:', error);
        setStories([]);
      }

      // Fetch recent submissions
      try {
        const submissionsResponse = await axios.get('http://localhost:5000/api/analytics/recent-submissions');
        setRecentSubmissions(submissionsResponse.data.submissions || []);
      } catch (error) {
        console.log('Recent submissions endpoint not available:', error);
        setRecentSubmissions([]);
      }
      
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/stories/${storyId}`);
      setStories(stories.filter(s => s.id !== storyId));
      alert('Story deleted successfully');
      fetchAdminData();
    } catch (error) {
      alert('Failed to delete story: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleToggleStatus = async (storyId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      await axios.patch(`http://localhost:5000/api/stories/${storyId}`, {
        status: newStatus
      });
      setStories(stories.map(s => 
        s.id === storyId ? { ...s, status: newStatus } : s
      ));
      alert(`Story ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      alert('Failed to update story status: ' + (error.response?.data?.error || error.message));
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <Link to="/" className="bg-[#235D4C] text-white px-6 py-2 rounded-lg hover:bg-[#1a4438] transition">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#235D4C]"></div>
          <span className="ml-3 text-gray-600">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculate fallback metrics from stories if analytics API is unavailable
  const totalStories = metrics?.total_stories ?? stories.length;
  const totalViews = metrics?.total_views ?? stories.reduce((sum, s) => sum + (s.views || 0), 0);
  const totalLikes = metrics?.total_likes ?? stories.reduce((sum, s) => sum + (s.likes || 0), 0);
  
  // Calculate top category/topic
  const categoryCount = {};
  stories.forEach(story => {
    if (story.category) {
      categoryCount[story.category] = (categoryCount[story.category] || 0) + 1;
    }
  });
  const topTopic = metrics?.top_topic ?? 
    (Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a])[0] || 'N/A');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#235D4C] to-[#1a4438] rounded-xl text-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-white/80">Welcome back, {user?.full_name || user?.username}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-t-lg">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'overview'
                ? 'border-[#B5955B] text-[#235D4C]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'stories'
                ? 'border-[#B5955B] text-[#235D4C]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manage Stories ({stories.length})
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 font-medium">Total Stories</div>
                <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalStories}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 font-medium">Total Views</div>
                <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalViews.toLocaleString()}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 font-medium">Top Topic</div>
                <svg className="h-8 w-8 text-[#B5955B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 truncate">{topTopic}</div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
            {recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.slice(0, 5).map((submission, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{submission.title}</h4>
                      <p className="text-sm text-gray-500">
                        by {submission.author_name} • {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      submission.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No recent submissions available</p>
                <p className="text-sm mt-1">This section requires the /api/analytics/recent-submissions endpoint</p>
              </div>
            )}
          </div>

          {/* Additional Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Likes</span>
                    <span className="font-bold text-gray-900">{totalLikes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Views per Story</span>
                    <span className="font-bold text-gray-900">
                      {totalStories > 0 ? Math.round(totalViews / totalStories) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stories Management Tab */}
      {activeTab === 'stories' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">All Stories</h3>
              <Link 
                to="/submit-story"
                className="bg-[#235D4C] text-white px-4 py-2 rounded-lg hover:bg-[#1a4438] transition text-sm font-medium"
              >
                + New Story
              </Link>
            </div>

            {stories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stories.map((story) => (
                      <tr key={story.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {story.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {story.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {story.author_name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {story.views || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            story.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {story.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            to={`/stories/${story.id}`}
                            className="text-[#235D4C] hover:text-[#1a4438]"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(story.id, story.status)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {story.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleDeleteStory(story.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-lg font-medium">No stories yet</p>
                <p className="text-sm mt-1">Create your first story to get started</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;