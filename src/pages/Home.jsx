import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchStories, fetchAnalytics } from '../services/api';
import StoryCard from '../components/StoryCard';
import SkeletonLoader from '../components/SkeletonLoader';
import API_URL from '../config/api';

const CATEGORY_META = [
  { name: 'Alumni Impact',     icon: '🎓' },
  { name: 'Policy in Action',  icon: '📊' },
  { name: 'Research Brief',    icon: '🔬' },
  { name: 'From the Classroom',icon: '📚' },
  { name: 'Innovation Story',  icon: '💡' },
  { name: 'Community Impact',  icon: '🤝' },
];

const CONTENT_ICONS = {
  video: (
    <svg className="h-24 w-24 text-white/80" fill="currentColor" viewBox="0 0 24 24">
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  audio: (
    <svg className="h-24 w-24 text-white/80" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  ),
  document: (
    <svg className="h-24 w-24 text-white/80" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

const FeaturedMedia = ({ story }) => {
  const type = story.content_type;
  if (type === 'video') {
    return <div className="w-full h-full bg-gradient-to-br from-[#235D4C] to-[#B5955B] flex items-center justify-center">{CONTENT_ICONS.video}</div>;
  }
  if (type === 'audio') {
    return <div className="w-full h-full bg-gradient-to-br from-purple-600 to-[#B5955B] flex items-center justify-center">{CONTENT_ICONS.audio}</div>;
  }
  if (type === 'document' || type === 'pdf') {
    return <div className="w-full h-full bg-gradient-to-br from-red-600 to-[#B5955B] flex items-center justify-center">{CONTENT_ICONS.document}</div>;
  }
  if (story.thumbnail_url || story.media_url) {
    return (
      <img
        src={`${API_URL}${story.thumbnail_url || story.media_url}`}
        alt={story.title}
        className="w-full h-full object-cover"
        onError={(e) => { e.target.src = '/assets/placeholder.jpg'; }}
      />
    );
  }
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#235D4C] to-[#B5955B] flex items-center justify-center">
      <svg className="h-20 w-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
  );
};

const Home = () => {
  const [stories, setStories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [storiesData, analyticsData] = await Promise.all([
          fetchStories({ limit: 12 }),
          fetchAnalytics().catch(() => null),
        ]);
        if (!cancelled) {
          setStories(storiesData);
          setAnalytics(analyticsData);
        }
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    if (analytics) {
      return {
        storiesShared: analytics.total_stories || stories.length,
        countiesCovered: analytics.counties_covered || 0,
        contributors: analytics.active_users || 0,
        policyAreas: analytics.hot_topics?.length || 0,
      };
    }
    return {
      storiesShared: stories.length,
      countiesCovered: new Set(stories.map(s => s.county).filter(Boolean)).size,
      contributors: new Set(stories.map(s => s.author?.id).filter(Boolean)).size,
      policyAreas: new Set(stories.map(s => s.category).filter(Boolean)).size,
    };
  }, [analytics, stories]);

  const categories = useMemo(() => {
    const topicMap = Object.fromEntries(
      (analytics?.hot_topics || []).map(t => [t.topic, t.count])
    );
    const countMap = {};
    if (!analytics) {
      stories.forEach(s => { if (s.category) countMap[s.category] = (countMap[s.category] || 0) + 1; });
    }
    return CATEGORY_META.map(cat => ({
      ...cat,
      count: analytics ? (topicMap[cat.name] || 0) : (countMap[cat.name] || 0),
    }));
  }, [analytics, stories]);

  const featuredStory = stories[0] ?? null;

  const statsDisplay = [
    { label: 'Stories Shared',   value: stats.storiesShared },
    { label: 'Counties Covered', value: `${stats.countiesCovered}/47` },
    { label: 'Contributors',     value: stats.contributors },
    { label: 'Policy Areas',     value: stats.policyAreas },
  ];

  return (
    <div className="space-y-16">
      <section className="relative h-[900px] rounded-2xl overflow-hidden">
        <img src="/assets/homepage.png" alt="KSG Homepage" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0">
          <div className="w-full px-4 lg:px-6 h-full flex items-center">
            <div className="max-w-5xl mx-auto text-center animate-ksg-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Transforming Kenya Through<br />
                <span className="text-brown">Shared Stories</span>
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/search" className="px-6 py-4 text-lg font-semibold rounded-lg transition-all duration-200 text-[#7F622C] bg-[#CBD300] hover:shadow-2xl shadow-xl">
                  Explore Stories
                </Link>
                <Link to="/submit" className="px-6 py-4 text-lg font-semibold rounded-lg transition-all duration-200 text-[#7F622C] bg-[#CBD300] hover:shadow-2xl shadow-xl">
                  Share Your Impact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-ksg-padding bg-white">
        <div className="w-full px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Transforming Kenya Together</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Building a knowledge network that connects leaders and communities nationwide
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsDisplay.map((stat, i) => (
              <div key={i} className="stat-ksg animate-ksg-slide-in-right" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-ksg-number">{stat.value}</div>
                <div className="stat-ksg-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredStory && (
        <section className="section-ksg-padding">
          <div className="w-full px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Story</h2>
              <p className="text-xl text-gray-600">Highlighting transformational narratives from our community</p>
            </div>
            {loading ? (
              <SkeletonLoader type="featured" />
            ) : (
              <div className="card-ksg-featured hover:shadow-2xl transition-shadow duration-300">
                <Link to={`/story/${featuredStory.id}`}>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="relative h-64 md:h-full rounded-lg overflow-hidden">
                      <FeaturedMedia story={featuredStory} />
                      <div className="absolute top-4 left-4">
                        <span className="tag-ksg bg-[#CBD300] text-[#7F622C]">Featured</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="mb-4">
                        {featuredStory.category && <span className="tag-ksg">{featuredStory.category}</span>}
                        {featuredStory.county && (
                          <span className="tag-ksg ml-2">
                            <svg className="inline h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {featuredStory.county}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{featuredStory.title}</h3>
                      <p className="text-gray-600 text-lg mb-6 line-clamp-3">{featuredStory.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{featuredStory.views || 0} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{featuredStory.likes || 0} likes</span>
                          </div>
                        </div>
                        <span className="text-[#B5955B] font-medium flex items-center">
                          Read More
                          <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section-ksg-padding bg-gray-50">
        <div className="w-full px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore by Impact Area</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover stories organized by the key areas driving Kenya's development agenda
            </p>
          </div>
          <div className="grid-ksg-cards">
            {categories.map((cat, i) => (
              <Link key={i} to={`/search?category=${encodeURIComponent(cat.name)}`} className="card-ksg group">
                <div className="text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">{cat.name}</h3>
                  <div className="flex items-center justify-center mb-4">
                    <span className="tag-ksg">{cat.count} {cat.count === 1 ? 'Story' : 'Stories'}</span>
                  </div>
                  <p className="text-gray-600 mb-4">Explore impactful narratives showcasing transformation in this key area</p>
                  <div className="flex items-center justify-center text-blue-700 font-medium group-hover:text-blue-800">
                    View Stories
                    <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-ksg-padding">
        <div className="w-full px-4 lg:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest Stories</h2>
              <p className="text-xl text-gray-600">Fresh narratives from our community</p>
            </div>
            <Link to="/search" className="btn-ksg-secondary hidden md:inline-flex">View All Stories</Link>
          </div>

          {loading ? (
            <SkeletonLoader type="card" count={6} />
          ) : stories.length > 0 ? (
            <div className="grid-ksg-cards">
              {stories.slice(0, 6).map(story => <StoryCard key={story.id} story={story} />)}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-24 w-24 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share a transformational story!</p>
              <Link to="/submit" className="btn-ksg-primary">Share Your Story</Link>
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link to="/search" className="btn-ksg-secondary w-full">View All Stories</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;