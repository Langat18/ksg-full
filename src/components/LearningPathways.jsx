import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LearningPathways = () => {
  const { user } = useAuth();
  const [selectedPathway, setSelectedPathway] = useState(null);
  
  // Styling constants
  const cardStyle = 'bg-white border border-gray-200 rounded-lg shadow-sm hover:border-ksg-gold transition-all duration-300';
  const headingStyle = 'text-2xl font-bold text-gray-900 mb-4';
  const buttonStyle = 'bg-ksg-gold hover:bg-ksg-goldDark text-white font-medium px-4 py-2 rounded transition-colors';

  const pathways = [
    {
      id: 1,
      title: "Understanding Devolution: A 5-Part Journey",
      description: "Explore Kenya's devolution process through real stories from county officials, policy experts, and citizens.",
      duration: "2 hours",
      difficulty: "Beginner",
      stories: 5,
      completed: user ? 3 : 0,
      category: "Policy & Governance",
      color: "from-ksg-gold to-ksg-goldDark",
      steps: [
        { id: 1, title: "The Foundation of Devolution", type: "video", duration: "15 min", completed: true },
        { id: 2, title: "County Government Structure", type: "audio", duration: "20 min", completed: true },
        { id: 3, title: "Challenges in Implementation", type: "document", duration: "25 min", completed: true },
        { id: 4, title: "Success Stories from Makueni", type: "video", duration: "18 min", completed: false },
        { id: 5, title: "Future of Devolution", type: "audio", duration: "22 min", completed: false }
      ]
    },
    {
      id: 2,
      title: "Climate Resilience in Arid Counties",
      description: "Learn from innovative water and agricultural projects transforming Kenya's arid and semi-arid lands.",
      duration: "1.5 hours",
      difficulty: "Intermediate",
      stories: 4,
      completed: user ? 0 : 0,
      category: "Environment & Climate",
      color: "from-ksg-gold to-ksg-goldDark",
      steps: [
        { id: 1, title: "Understanding ASAL Challenges", type: "video", duration: "20 min", completed: false },
        { id: 2, title: "Water Innovation in Turkana", type: "audio", duration: "25 min", completed: false },
        { id: 3, title: "Drought-Resistant Agriculture", type: "document", duration: "15 min", completed: false },
        { id: 4, title: "Community-Led Solutions", type: "video", duration: "20 min", completed: false }
      ]
    },
    {
      id: 3,
      title: "Digital Transformation in Public Service",
      description: "Discover how technology is revolutionizing service delivery across Kenyan counties.",
      duration: "1.75 hours",
      difficulty: "Advanced",
      stories: 6,
      completed: user ? 1 : 0,
      category: "Digital Innovation",
      color: "from-ksg-gold to-ksg-goldDark",
      steps: [
        { id: 1, title: "Digital Kenya Strategy Overview", type: "document", duration: "15 min", completed: true },
        { id: 2, title: "E-Government in Nairobi", type: "video", duration: "18 min", completed: false },
        { id: 3, title: "Mobile Money Integration", type: "audio", duration: "22 min", completed: false },
        { id: 4, title: "Citizen Engagement Platforms", type: "video", duration: "20 min", completed: false },
        { id: 5, title: "Data-Driven Decision Making", type: "document", duration: "25 min", completed: false },
        { id: 6, title: "Future Trends and Challenges", type: "audio", duration: "15 min", completed: false }
      ]
    }
  ];

  const getMediaIcon = (type) => {
    switch (type) {
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
      case 'Beginner': return 'bg-ksg-gold/10 text-ksg-gold';
      case 'Intermediate': return 'bg-ksg-gold/20 text-ksg-goldDark';
      case 'Advanced': return 'bg-ksg-goldDark/20 text-ksg-goldDark';
      default: return 'bg-ksg-gold/10 text-ksg-gold';
    }
  };

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
      {user && (
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
                {pathways.reduce((acc, p) => acc + p.completed, 0)}
              </div>
              <div className="text-sm text-[#B5955B]/80">Stories Completed</div>
            </div>
            <div className="text-center p-4 bg-[#235D4C]/5 rounded-lg">
              <div className="text-2xl font-bold text-[#235D4C]">
                {pathways.filter(p => p.completed === p.stories).length}
              </div>
              <div className="text-sm text-[#235D4C]/80">Pathways Finished</div>
            </div>
            <div className="text-center p-4 bg-[#B5955B]/5 rounded-lg">
              <div className="text-2xl font-bold text-[#B5955B]">150</div>
              <div className="text-sm text-[#B5955B]/80">Points Earned</div>
            </div>
          </div>
        </div>
      )}

      {/* Pathways Grid */}
      <div className="grid gap-8">
        {pathways.map((pathway) => (
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
                    {user ? pathway.completed : 0}/{pathway.stories}
                  </div>
                  <div className="text-white/80 text-sm">Stories Complete</div>
                  <div className="text-white/60 text-xs mt-1">{pathway.duration}</div>
                </div>
              </div>

              {/* Progress Bar */}
              {user && (
                <div className="mt-4">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${(pathway.completed / pathway.stories) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Pathway Steps */}
            <div className="p-6">
              <div className="space-y-4">
                {pathway.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                      user && step.completed
                        ? 'border-green-200 bg-green-50'
                        : user && index === pathway.completed
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Step Number/Status */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        user && step.completed
                          ? 'bg-green-500 text-white'
                          : user && index === pathway.completed
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {user && step.completed ? '✓' : step.id}
                      </div>

                      {/* Media Icon */}
                      <div className={`p-2 rounded-lg ${
                        user && step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getMediaIcon(step.type)}
                      </div>

                      {/* Step Details */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{step.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="capitalize">{step.type}</span>
                          <span>•</span>
                          <span>{step.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {user && step.completed ? (
                        <span className="text-green-600 font-medium text-sm">Completed</span>
                      ) : user && index === pathway.completed ? (
                        <Link
                          to={`/story/${step.id}`}
                          className="bg-[#B5955B] hover:bg-[#B5955B]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Continue
                        </Link>
                      ) : user && index < pathway.completed ? (
                        <Link
                          to={`/story/${step.id}`}
                          className="text-[#B5955B] hover:text-[#B5955B]/80 font-medium text-sm"
                        >
                          Review
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">Locked</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pathway Actions */}
              <div className="mt-6 flex justify-between items-center pt-4 border-t">
                {user ? (
                  <>
                    {pathway.completed === pathway.stories ? (
                      <div className="flex items-center text-green-600">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Pathway Completed!</span>
                      </div>
                    ) : pathway.completed > 0 ? (
                      <Link
                        to={`/story/${pathway.steps[pathway.completed].id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Continue Learning
                      </Link>
                    ) : (
                      <Link
                        to={`/story/${pathway.steps[0].id}`}
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
                  Earn 50 points upon completion
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-[#B5955B] rounded-xl text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Deepen Your Knowledge?</h2>
        <p className="text-white/80 mb-6 max-w-2xl mx-auto">
          These carefully curated learning pathways help you understand complex topics 
          through real stories and experiences from across Kenya.
        </p>
        {!user && (
          <Link
            to="/login"
            className="bg-white text-[#B5955B] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-block shadow-sm border border-white/20"
          >
            Login to Track Your Progress
          </Link>
        )}
      </div>
    </div>
  );
};

export default LearningPathways;