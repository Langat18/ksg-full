import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const LearningPathways = () => {
  const { user, isAuthenticated } = useAuth();
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPathways();
  }, [isAuthenticated]);

  const fetchPathways = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/pathways');
      setPathways(response.data || []);
    } catch (error) {
      console.error('Failed to fetch pathways:', error);
      setPathways([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryComplete = async (pathwayId, storyId) => {
    if (!isAuthenticated) return;

    try {
      await axios.post(`http://localhost:5000/api/pathways/${pathwayId}/progress`, {
        story_id: storyId
      });
      
      // Refresh pathways to get updated progress
      fetchPathways();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const getMediaIcon = (contentType) => {
    switch (contentType) {
      case 'video':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 17a1 1 0 01-1-1v-4a1 1 0 011-1h1.83l4.51-2.7a.5.5 0 01.76.43v9.54a.5.5 0 01-.76.43L10.83 17H9z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#235D4C]"></div>
          <span className="ml-3 text-gray-600">Loading pathways...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Learning Pathways</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Structured learning journeys that connect stories, insights, and knowledge 
          to deepen your understanding of Kenya's development challenges and solutions.
        </p>
      </div>

      {/* User Progress Summary */}
      {isAuthenticated && pathways.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Learning Progress</h2>
            <div className="text-sm text-gray-600">
              {pathways.filter(p => p.completed > 0).length} of {pathways.length} pathways started
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#B5955B]/5 rounded-lg">
              <div className="text-2xl font-bold text-[#B5955B]">
                {pathways.reduce((acc, p) => acc + (p.completed || 0), 0)}
              </div>
              <div className="text-sm text-[#B5955B]/80">Stories Completed</div>
            </div>
            <div className="text-center p-4 bg-[#235D4C]/5 rounded-lg">
              <div className="text-2xl font-bold text-[#235D4C]">
                {pathways.filter(p => p.completed === p.stories_count).length}
              </div>
              <div className="text-sm text-[#235D4C]/80">Pathways Finished</div>
            </div>
            <div className="text-center p-4 bg-[#B5955B]/5 rounded-lg">
              <div className="text-2xl font-bold text-[#B5955B]">
                {pathways.reduce((acc, p) => 
                  p.completed === p.stories_count ? acc + p.points_reward : acc, 0
                )}
              </div>
              <div className="text-sm text-[#B5955B]/80">Points Earned</div>
            </div>
          </div>
        </div>
      )}

      {/* Pathways Grid */}
      {pathways.length > 0 ? (
        <div className="grid gap-8">
          {pathways.map((pathway) => {
            const completed = pathway.completed || 0;
            const total = pathway.stories_count || 0;
            const steps = pathway.steps || [];

            return (
              <div key={pathway.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                {/* Pathway Header */}
                <div className="bg-[#B5955B] text-white p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                          {pathway.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(pathway.difficulty)}`}>
                          {pathway.difficulty}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{pathway.title}</h3>
                      <p className="text-white/90 text-lg">{pathway.description}</p>
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                      <div className="text-3xl font-bold">
                        {completed}/{total}
                      </div>
                      <div className="text-white/80 text-sm">Stories Complete</div>
                      <div className="text-white/60 text-xs mt-1">{pathway.duration}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {isAuthenticated && total > 0 && (
                    <div className="mt-4">
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{ width: `${(completed / total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pathway Steps */}
                <div className="p-6">
                  {steps.length > 0 ? (
                    <div className="space-y-4">
                      {steps.map((step, index) => {
                        const story = step.story;
                        const isCompleted = isAuthenticated && pathway.user_progress && 
                          (pathway.user_progress.completed_items || []).includes(story?.id);
                        const isCurrent = isAuthenticated && index === completed;
                        
                        return (
                          <div
                            key={step.id}
                            className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                              isCompleted
                                ? 'border-green-200 bg-green-50'
                                : isCurrent
                                ? 'border-blue-200 bg-blue-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-4 flex-1">
                              {/* Step Number/Status */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : isCurrent
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                {isCompleted ? '✓' : step.order}
                              </div>

                              {/* Media Icon */}
                              <div className={`p-2 rounded-lg ${
                                isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {getMediaIcon(story?.content_type)}
                              </div>

                              {/* Step Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{story?.title || 'Story'}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span className="capitalize">{story?.content_type || 'N/A'}</span>
                                  <span>•</span>
                                  <span>{formatDuration(story?.duration)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div>
                              {isAuthenticated ? (
                                isCompleted ? (
                                  <span className="text-green-600 font-medium text-sm">Completed</span>
                                ) : isCurrent ? (
                                  <Link
                                    to={`/story/${story?.id}`}
                                    className="bg-[#B5955B] hover:bg-[#B5955B]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    Continue
                                  </Link>
                                ) : index < completed ? (
                                  <Link
                                    to={`/story/${story?.id}`}
                                    className="text-[#B5955B] hover:text-[#B5955B]/80 font-medium text-sm"
                                  >
                                    Review
                                  </Link>
                                ) : (
                                  <span className="text-gray-400 text-sm">Locked</span>
                                )
                              ) : (
                                <Link
                                  to="/login"
                                  className="text-[#B5955B] hover:text-[#B5955B]/80 font-medium text-sm"
                                >
                                  Login
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No stories in this pathway yet</p>
                  )}

                  {/* Pathway Actions */}
                  {steps.length > 0 && (
                    <div className="mt-6 flex justify-between items-center pt-4 border-t">
                      {isAuthenticated ? (
                        <>
                          {completed === total ? (
                            <div className="flex items-center text-green-600">
                              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">Pathway Completed!</span>
                            </div>
                          ) : completed > 0 ? (
                            <Link
                              to={`/story/${steps[completed]?.story?.id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                              Continue Learning
                            </Link>
                          ) : (
                            <Link
                              to={`/story/${steps[0]?.story?.id}`}
                              className="bg-[#B5955B] hover:bg-[#B5955B]/90 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                            >
                              Start Pathway
                            </Link>
                          )}
                        </>
                      ) : (
                        <Link
                          to="/login"
                          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Login to Start
                        </Link>
                      )}

                      <div className="text-sm text-gray-500">
                        Earn {pathway.points_reward} points upon completion
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Learning Pathways Yet</h3>
          <p className="text-gray-600 mb-6">
            Learning pathways will be created once there are enough stories in the platform.
          </p>
          <Link
            to="/submit"
            className="inline-block bg-[#B5955B] hover:bg-[#B5955B]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Share Your Story
          </Link>
        </div>
      )}

      {/* Call to Action */}
      {pathways.length > 0 && (
        <div className="bg-[#B5955B] rounded-xl text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Deepen Your Knowledge?</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            These carefully curated learning pathways help you understand complex topics 
            through real stories and experiences from across Kenya.
          </p>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="bg-white text-[#B5955B] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-block shadow-sm border border-white/20"
            >
              Login to Track Your Progress
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default LearningPathways;