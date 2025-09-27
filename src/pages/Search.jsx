import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchStories } from '../services/api';
import StoryCard from '../components/StoryCard';

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
      const searchData = await fetchStories({ 
        q: searchQuery, 
        category: selectedCategory === 'All Categories' ? '' : selectedCategory,
        limit: 20 
      });
      setResults(searchData.results ?? searchData);
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
      <div className="container-ksg-max">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Stories
          </h1>
          <div className="text-ksg-gradient text-xl font-semibold mb-4">
            Explore Kenya's Knowledge Network
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search through impactful stories from KSG's community across all 47 counties
          </p>
        </div>

        {/* Search Form */}
        <div className="card-ksg-featured mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search Input - Fixed icon overlap */}
              <div className="lg:col-span-2">
                <label className="form-ksg-label">Search Stories</label>
                <div className="relative">
                  <svg className="input-icon h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by keywords, people, places..."
                    className="input-ksg input-ksg-with-icon focus-ksg"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="form-ksg-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="input-ksg focus-ksg"
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
                className="btn-ksg-primary"
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
                    ? 'bg-green-800 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-50 hover:border-green-300'
                }`}
                style={{
                  backgroundColor: category === cat ? 'var(--ksg-primary)' : undefined,
                  borderColor: category !== cat ? 'var(--ksg-gray-300)' : undefined
                }}
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
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mx-auto mb-4" style={{ borderColor: 'var(--ksg-primary)' }}></div>
                <p className="text-gray-600">Searching stories...</p>
              </div>
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
                        className="btn-ksg-outline"
                      >
                        Clear Search
                      </button>
                      <Link to="/submit" className="btn-ksg-primary">
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
          <div className="card-ksg text-center">
            <svg className="mx-auto h-16 w-16 mb-6" style={{ color: 'var(--ksg-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Your Discovery</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Search transformational stories from across Kenya's 47 counties
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {['Leadership', 'Innovation', 'Policy', 'Community'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term.toLowerCase());
                    performSearch(term.toLowerCase(), '');
                  }}
                  className="p-3 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: 'rgba(27, 77, 62, 0.1)',
                    color: 'var(--ksg-primary-dark)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(27, 77, 62, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(27, 77, 62, 0.1)';
                  }}
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