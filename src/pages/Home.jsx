import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStories } from '../services/api';
import StoryCard from '../components/StoryCard';

const Home = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredStory, setFeaturedStory] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchStories({ limit: 12 })
      .then((data) => {
        const storiesData = data.results ?? data;
        setStories(storiesData);
        if (storiesData.length > 0) {
          setFeaturedStory(storiesData[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { name: 'Alumni Impact', count: '12+', icon: '🎓' },
    { name: 'Policy in Action', count: '8+', icon: '📊' },
    { name: 'Research Brief', count: '15+', icon: '🔬' },
    { name: 'From the Classroom', count: '20+', icon: '📚' },
  ];

  const stats = [
    { label: 'Stories Shared', value: '45+' },
    { label: 'Counties Covered', value: '47' },
    { label: 'Alumni Featured', value: '30+' },
    { label: 'Policy Areas', value: '12+' },
  ];

  return (
    <div className="space-y-16">
      {/* KSG-Inspired Hero Section */}
      <section className="hero-ksg-gradient text-white rounded-2xl overflow-hidden relative">
        <div className="section-ksg-padding">
          <div className="container-ksg-max">
            <div className="max-w-5xl mx-auto text-center animate-ksg-fade-in-up">
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Kenya School of Government Digital Platform
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold mb-8 leading-tight">
                Empowering Public Service Through 
                <span className="block text-yellow-300 text-ksg-gradient mt-2">
                  Shared Stories
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-black mb-12 leading-relaxed max-w-4xl mx-auto">
                Discover multimedia narratives from KSG's community of leaders, showcasing 
                innovation, policy impact, and transformational governance across all 47 counties.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <Link 
                  to="/submit" 
                  className="btn-ksg-primary transform hover:scale-105 inline-flex items-center"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Share Your Story
                </Link>
                <Link 
                  to="/search" 
                  className="btn-ksg-secondary inline-flex items-center"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Explore Stories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KSG-Inspired Statistics Section */}
      <section className="section-ksg-padding bg-white">
        <div className="container-ksg-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transforming Kenya Together
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Building a knowledge network that connects leaders and communities nationwide
            </p>
          </div>
          <div className="grid-ksg-features">
            {stats.map((stat, index) => (
              <div key={index} className="stat-ksg animate-ksg-slide-in-right" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="stat-ksg-number">
                  {stat.value}
                </div>
                <div className="stat-ksg-label">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KSG-Inspired Categories Section */}
      <section className="section-ksg-padding">
        <div className="container-ksg-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore by Impact Area
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover stories organized by the key areas driving Kenya's development agenda
            </p>
          </div>
          <div className="grid-ksg-cards">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/search?category=${encodeURIComponent(category.name)}`}
                className="card-ksg group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                    {category.name}
                  </h3>
                  <div className="flex items-center justify-center mb-4">
                    <span className="tag-ksg">
                      {category.count} Stories
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Explore impactful narratives showcasing transformation in this key area
                  </p>
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

      {/* KSG-Inspired Recent Stories Section */}
      <section className="section-ksg-padding bg-gray-50">
        <div className="container-ksg-max">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Latest Impact Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                Recent narratives from KSG's community of leaders and changemakers
              </p>
            </div>
            <Link
              to="/search"
              className="btn-ksg-outline inline-flex items-center"
            >
              View All Stories
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid-ksg-cards">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card-ksg animate-ksg-pulse">
                  <div className="skeleton-ksg h-6 w-3/4 mb-4"></div>
                  <div className="skeleton-ksg h-4 w-full mb-3"></div>
                  <div className="skeleton-ksg h-4 w-2/3 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="skeleton-ksg h-3 w-1/4"></div>
                    <div className="skeleton-ksg h-3 w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-ksg-cards">
              {stories.slice(0, 6).map((story, index) => (
                <div key={story.id} className="animate-ksg-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <StoryCard story={story} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* KSG-Inspired Call to Action */}
      <section className="hero-ksg-gradient text-white rounded-2xl overflow-hidden relative mx-4 sm:mx-6 lg:mx-8">
        <div className="section-ksg-padding">
          <div className="container-ksg-max">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-yellow-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Share Your Impact?
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Join KSG's knowledge network by sharing your experiences, innovations, 
                and insights that are transforming communities across Kenya.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/submit"
                  className="btn-ksg-primary transform hover:scale-105 inline-flex items-center text-lg px-8 py-4"
                >
                  <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Share Your Story
                </Link>
                <Link
                  to="/search"
                  className="btn-ksg-secondary inline-flex items-center text-lg px-8 py-4"
                >
                  <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V13a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Browse Archive
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;