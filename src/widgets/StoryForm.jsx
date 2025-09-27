import React, { useState } from 'react';

const StoryForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    transcript: '',
    authorName: '',
    authorEmail: '',
    file: null
  });

  const categories = [
    'Alumni Impact',
    'Policy in Action',
    'Research Brief',
    'From the Classroom',
    'Innovation Story',
    'Community Impact'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] || null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-ksg-group">
        <label className="form-ksg-label">Story Title *</label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleInputChange}
          className="input-ksg focus-ksg"
          placeholder="Give your story a compelling title"
        />
      </div>

      <div className="form-ksg-group">
        <label className="form-ksg-label">Category *</label>
        <select
          name="category"
          required
          value={formData.category}
          onChange={handleInputChange}
          className="input-ksg focus-ksg"
        >
          <option value="">Select a category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-ksg-group">
        <label className="form-ksg-label">Story Description *</label>
        <textarea
          name="description"
          required
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          className="input-ksg focus-ksg"
          placeholder="Describe your story's impact and key outcomes"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-ksg-group">
          <label className="form-ksg-label">Your Name *</label>
          <input
            type="text"
            name="authorName"
            required
            value={formData.authorName}
            onChange={handleInputChange}
            className="input-ksg focus-ksg"
            placeholder="Your full name"
          />
        </div>
        <div className="form-ksg-group">
          <label className="form-ksg-label">Email *</label>
          <input
            type="email"
            name="authorEmail"
            required
            value={formData.authorEmail}
            onChange={handleInputChange}
            className="input-ksg focus-ksg"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="form-ksg-group">
        <label className="form-ksg-label">Upload Media (Optional)</label>
        <input
          type="file"
          accept="video/*,audio/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="input-ksg focus-ksg"
        />
        <div className="form-ksg-help">
          Video, Audio, PDF, or Document files (max 100MB)
        </div>
      </div>

      <div className="form-ksg-group">
        <label className="form-ksg-label">Transcript (Optional)</label>
        <textarea
          name="transcript"
          rows={6}
          value={formData.transcript}
          onChange={handleInputChange}
          className="input-ksg focus-ksg"
          placeholder="If you have audio/video, include a transcript for accessibility"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn-ksg-primary"
        >
          {loading ? 'Submitting...' : 'Submit Story for Review'}
        </button>
      </div>
    </form>
  );
};

export default StoryForm;