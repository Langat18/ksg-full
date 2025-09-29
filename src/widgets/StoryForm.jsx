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
      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-[#235D4C] mb-2">Story Title *</label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50"
          placeholder="Give your story a compelling title"
        />
      </div>

      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-[#235D4C] mb-2">Category *</label>
        <select
          name="category"
          required
          value={formData.category}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23235D4C%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:1.5em_1.5em] bg-[right_0.5rem_center]"
        >
          <option value="">Select a category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-[#235D4C] mb-2">Story Description *</label>
        <textarea
          name="description"
          required
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50"
          placeholder="Describe your story's impact and key outcomes"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-[#235D4C] mb-2">Your Name *</label>
          <input
            type="text"
            name="authorName"
            required
            value={formData.authorName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50"
            placeholder="Your full name"
          />
        </div>
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-[#235D4C] mb-2">Email *</label>
          <input
            type="email"
            name="authorEmail"
            required
            value={formData.authorEmail}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-[#235D4C] mb-2">Upload Media (Optional)</label>
        <input
          type="file"
          accept="video/*,audio/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#235D4C] file:text-white hover:file:bg-[#2d7660] text-sm text-gray-500 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200"
        />
        <div className="mt-2 text-sm text-[#235D4C]/70">
          Video, Audio, PDF, or Document files (max 100MB)
        </div>
      </div>

      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-[#235D4C] mb-2">Transcript (Optional)</label>
        <textarea
          name="transcript"
          rows={6}
          value={formData.transcript}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50"
          placeholder="If you have audio/video, include a transcript for accessibility"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#235D4C] text-white rounded-md font-medium hover:bg-[#2d7660] transform transition-all duration-300 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#235D4C] focus:ring-offset-2"
        >
          {loading ? 'Submitting...' : 'Submit Story for Review'}
        </button>
      </div>
    </form>
  );
};

export default StoryForm;