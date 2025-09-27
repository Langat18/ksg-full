import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStory, fetchRelated } from '../services/api';

const StoryDetails = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const loadStoryData = async () => {
      try {
        setLoading(true);
        const [storyData, relatedData] = await Promise.all([
          fetchStory(id),
          fetchRelated(id)
        ]);
        
        setStory(storyData);
        setRelated(relatedData);
      } catch (error) {
        console.error('Failed to load story:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoryData();
  }, [id]);

  if (loading) {
    return (
      <div className="section-ksg-padding">
        <div className="container-ksg-max">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="skeleton-ksg h-8 w-3/4 mb-4"></div>
              <div className="skeleton-ksg h-4 w-1/2 mb-8"></div>
              <div className="skeleton-ksg h-64 w-full mb-8"></div>
              <div className="skeleton-ksg h-4 w-full mb-2"></div>
              <div className="skeleton-ksg h-4 w-full mb-2"></div>
              <div className="skeleton-ksg h-4 w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="section-ksg-padding">
        <div className="container-ksg-max">
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Story Not Found</h3>
            <p className="text-gray-600 mb-6">The story you're looking for might have been moved or doesn't exist.</p>
            <Link to="/search" className="btn-ksg-primary">
              Browse All Stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const publishDate = new Date(story.published_at ?? story.created_at ?? Date.now());

  return (
    <div className="section-ksg-padding">
      <div className="container-ksg-max">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-700 transition-colors">Home</Link>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/search" className="hover:text-blue-700 transition-colors">Stories</Link>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium truncate">{story.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Story Content */}
          <section className="lg:col-span-2">
            <article className="card-ksg-featured">
              {/* Story Header */}
              <div className="border-b border-gray-200 pb-6 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                  {story.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 hero-ksg-gradient rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-medium">{story.author_name || 'KSG Community'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 7v5a7 7 0 01-7-7h1a6 6 0 006 6z" />
                    </svg>
                    <span>{publishDate.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>

                  {story.category && (
                    <span className="tag-ksg">
                      {story.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="text-sm font-medium">Share Story</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="text-sm font-medium">Save</span>
                  </button>
                </div>
              </div>

              {/* Media Content */}
              {story.media_url && (
                <div className="mb-8">
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <video 
                      controls 
                      src={story.media_url} 
                      className="media-ksg-video w-full"
                      poster="/api/placeholder/800/450"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* Story Description */}
              <div className="prose prose-lg max-w-none mb-8">
                <div className="text-gray-700 leading-relaxed text-lg">
                  {story.description}
                </div>
              </div>

              {/* Transcript Section */}
              {story.transcript && (
                <details className="card-ksg mt-8">
                  <summary className="font-semibold text-gray-900 cursor-pointer flex items-center space-x-2 p-4">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Full Transcript</span>
                  </summary>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t">
                    <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm leading-relaxed">
                      {story.transcript}
                    </pre>
                  </div>
                </details>
              )}

              {/* Story Tags */}
              {story.tags && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {story.tags.split(',').map((tag, index) => (
                      <span key={index} className="tag-ksg">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Author Information */}
            <div className="card-ksg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Story Contributor
              </h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 hero-ksg-gradient rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {(story.author_name || 'KSG').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {story.author_name || 'KSG Community'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Storyteller & Change Agent
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Contributing to Kenya's transformation through shared experiences and insights.
              </p>
            </div>

            {/* Related Stories */}
            <div className="card-ksg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Connected Stories
              </h3>
              
              {related.length === 0 ? (
                <div className="text-center py-6">
                  <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm text-gray-500 mb-3">No connected stories found yet.</p>
                  <Link to="/search" className="text-blue-700 hover:text-blue-800 text-sm font-medium">
                    Explore More Stories →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {related.slice(0, 3).map((relatedStory) => (
                    <Link
                      key={relatedStory.id}
                      to={`/story/${relatedStory.id}`}
                      className="block group"
                    >
                      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                            {relatedStory.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {relatedStory.description?.slice(0, 80)}...
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {related.length > 3 && (
                    <div className="pt-3 border-t border-gray-200">
                      <Link
                        to="/search"
                        className="block text-center text-blue-700 hover:text-blue-800 text-sm font-medium"
                      >
                        View {related.length - 3} more connected stories →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="card-ksg hero-ksg-gradient text-white">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-yellow-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <h3 className="font-semibold mb-2">Share Your Story</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Have an impact story to tell? Join our community of changemakers.
                </p>
                <Link
                  to="/submit"
                  className="btn-ksg-secondary text-sm"
                >
                  Submit Your Story
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StoryDetails;