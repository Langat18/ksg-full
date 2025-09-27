import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StoryForm from '../widgets/StoryForm';
import { submitStory } from '../services/api';

const SubmitStory = () => {
  const [status, setStatus] = useState(null);
  const [submittedStory, setSubmittedStory] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setStatus({ type: 'pending' });
      
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('category', formData.category);
      payload.append('authorName', formData.authorName);
      payload.append('authorEmail', formData.authorEmail);
      payload.append('transcript', formData.transcript || '');
      
      if (formData.file) {
        payload.append('file', formData.file);
      }
      
      const result = await submitStory(payload);
      setSubmittedStory(result);
      setStatus({ type: 'success', data: result });
    } catch (error) {
      console.error('Submission error:', error);
      setStatus({ type: 'error', message: error.message || 'Submission failed' });
    }
  };

  const resetForm = () => {
    setStatus(null);
    setSubmittedStory(null);
  };

  return (
    <div className="section-ksg-padding" style={{ backgroundColor: 'var(--ksg-light-gray)' }}>
      <div className="container-ksg-max">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div 
              className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, var(--ksg-primary), var(--ksg-primary-light))' 
              }}
            >
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Share Your Impact Story
            </h1>
            <div className="text-ksg-gradient text-xl font-semibold mb-4">
              Contribute to Kenya's Knowledge Network
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Share your transformational experiences and insights that are making a difference across Kenya
            </p>
          </div>

          {/* Status Messages */}
          {status?.type === 'success' && (
            <div className="alert-ksg-success mb-8">
              <div className="flex items-start space-x-3">
                <svg 
                  className="h-6 w-6 flex-shrink-0 mt-0.5" 
                  style={{ color: 'var(--ksg-success)' }} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Story Submitted Successfully!</h3>
                  <p className="mt-1">
                    Your story "{submittedStory?.title || formData?.title || 'Untitled'}" has been submitted for review.
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <button onClick={resetForm} className="btn-ksg-outline">
                      Submit Another Story
                    </button>
                    <Link to="/search" className="btn-ksg-primary">
                      Browse Stories
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status?.type === 'error' && (
            <div className="alert-ksg-error mb-8">
              <div className="flex items-start space-x-3">
                <svg 
                  className="h-6 w-6 flex-shrink-0 mt-0.5" 
                  style={{ color: 'var(--ksg-error)' }} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Submission Failed</h3>
                  <p className="mt-1">{status.message || 'Please try again or contact support.'}</p>
                  <button 
                    onClick={() => setStatus(null)} 
                    className="mt-3 text-sm font-medium" 
                    style={{ color: 'var(--ksg-error)' }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {status?.type === 'pending' && (
            <div className="alert-ksg-info mb-8">
              <div className="flex items-center space-x-3">
                <div 
                  className="animate-spin rounded-full h-6 w-6 border-b-2" 
                  style={{ borderColor: 'var(--ksg-info)' }}
                ></div>
                <div>
                  <h3 className="font-semibold">Submitting Your Story...</h3>
                  <p className="mt-1">Please wait while we process your submission.</p>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          {status?.type !== 'success' && (
            <>
              <div className="card-ksg mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Submission Guidelines</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">What Makes a Great Story:</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start space-x-2">
                        <svg className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: 'var(--ksg-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Clear impact on communities or governance</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <svg className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: 'var(--ksg-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Specific examples and measurable outcomes</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <svg className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: 'var(--ksg-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Connection to KSG training or programs</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Technical Requirements:</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start space-x-2">
                        <svg className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: 'var(--ksg-info)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Video files: MP4, max 100MB</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <svg className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: 'var(--ksg-info)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Audio files: MP3, WAV, max 50MB</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <svg className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: 'var(--ksg-info)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Review within 48 hours</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Story Form */}
              <div className="card-ksg-featured">
                <StoryForm onSubmit={handleSubmit} loading={status?.type === 'pending'} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitStory;