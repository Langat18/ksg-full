import React from 'react';
import { Link } from 'react-router-dom';

const StoryCard = ({ story }) => {
  const date = new Date(story.published_at ?? story.created_at ?? Date.now());

  return (
    <article className="card-ksg group">
      <div className="flex items-start space-x-3 mb-4">
        <div className="h-10 w-10 bg-gradient-to-br from-ksg-gold to-ksg-green rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-[#1A1A1A] group-hover:text-ksg-gold transition-colors leading-tight mb-2">
            <Link to={`/story/${story.id}`} className="hover:underline">
              {story.title}
            </Link>
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 7v5a7 7 0 01-7-7h1a6 6 0 006 6z" />
              </svg>
              <span>{date.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{story.author_name || 'KSG Community'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 leading-relaxed mb-4 text-ksg-truncate-3">
        {story.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {story.category && (
            <span className="tag-ksg">
              {story.category}
            </span>
          )}
          {story.media_url && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Media
            </span>
          )}
        </div>
        
        <Link 
          to={`/story/${story.id}`} 
          className="inline-flex items-center text-blue-700 hover:text-blue-800 font-medium transform transition-all"
        >
          Read Story
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Professional hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-green-500 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </article>
  );
};

export default StoryCard;