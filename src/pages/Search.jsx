import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchStories } from '../services/api';
import StoryCard from '../components/StoryCard';
import SkeletonLoader from '../components/SkeletonLoader';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const categories = [
    'All Categories',
    'Alumni Impact',
    'Policy in Action',
    'Research Brief',
    'From the Classroom',
    'Innovation Story',
    'Community Impact'
  ];

  useEffect(() => {
    const initialCategory = searchParams.get('category');
    const initialQuery = searchParams.get('q');
    
    if (initialCategory || initialQuery) {
      performSearch(initialQuery || '', initialCategory || '');
    }
  }, []);

  const performSearch = async (searchQuery, selectedCategory) => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      const params = {
        limit: 20
      };
      
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory && selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }
      
      const searchData = await fetchStories(params);
      setResults(searchData || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category && category !== 'All Categories') params.set('category', category);
    setSearchParams(params);
    
    await performSearch(query, category);
  };

  const handleCategorySelect = async (selectedCategory) => {
    setCategory(selectedCategory);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory !== 'All Categories') params.set('category', selectedCategory);
    setSearchParams(params);
    
    await performSearch(query, selectedCategory);
  };

  return (
    <div className="section-ksg-padding">
      <div className="w-full px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Stories
          </h1>
          <div className="text-[#B5955B] text-xl font-semibold mb-4">
            Explore Kenya&apos;s Knowledge Network
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search through impactful stories from KSG&apos;s community across all 47 counties
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-[#235D4C]/10 hover:border-[#235D4C]/20 transition-all duration-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <label className="form-ksg-label">Search Stories</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by keywords, people, places..."
                    className="w-full pl-12 pr-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="form-ksg-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="text-center">
              <button 
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-[#CBD300] text-[#7F622C] font-medium rounded-md hover:bg-[#CBD300]/90 focus:outline-none focus:ring-2 focus:ring-[#CBD300]/20 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Stories
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.slice(1).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-[#CBD300] text-[#7F622C] shadow-md'
                    : 'bg-white text-gray-700 border-2 border-[#CBD300]/30 hover:border-[#CBD300]/50 hover:bg-[#CBD300]/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <>
            {loading ? (
              <SkeletonLoader type="card" count={6} />
            ) : (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
                    <p className="text-gray-600 mt-1">
                      {results.length > 0 
                        ? `Found ${results.length} ${results.length === 1 ? 'story' : 'stories'}`
                        : 'No stories found'
                      }
                      {(query || category) && (
                        <span className="ml-1">
                          {query && `for "${query}"`}
                          {query && category && category !== 'All Categories' && ' in '}
                          {category && category !== 'All Categories' && `"${category}"`}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Results */}
                {results.length > 0 ? (
                  <div className="grid-ksg-cards">
                    {results.map((story, index) => (
                      <div 
                        key={story.id} 
                        className="animate-ksg-fade-in-up" 
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <StoryCard story={story} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-20 w-20 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Found</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Try different keywords or explore our categories.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => {
                          setQuery('');
                          setCategory('');
                          setHasSearched(false);
                          setResults([]);
                          setSearchParams({});
                        }}
                        className="px-6 py-3 border-2 border-[#CBD300] text-[#CBD300] font-medium rounded-md hover:bg-[#CBD300]/5 focus:outline-none focus:ring-2 focus:ring-[#CBD300]/20 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                      >
                        Clear Search
                      </button>
                      <Link 
                        to="/submit"
                        className="px-6 py-3 bg-[#CBD300] text-[#7F622C] font-medium rounded-md hover:bg-[#CBD300]/90 focus:outline-none focus:ring-2 focus:ring-[#CBD300]/20 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                      >
                        Share Your Story
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Search Suggestions */}
        {!hasSearched && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center border-2 border-[#235D4C]/10 hover:border-[#235D4C]/20 transition-all duration-200">
            <svg className="mx-auto h-16 w-16 mb-6 text-[#B5955B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Your Discovery</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Search transformational stories from across Kenya&apos;s 47 counties
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {['Leadership', 'Innovation', 'Policy', 'Community'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term.toLowerCase());
                    performSearch(term.toLowerCase(), '');
                  }}
                  className="p-3 rounded-lg font-medium text-[#CBD300] bg-[#CBD300]/10 hover:bg-[#CBD300]/20 transition-all duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;