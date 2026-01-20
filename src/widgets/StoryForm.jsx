import React, { useState } from 'react';

const StoryForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    county: '',
    contentType: '',
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

  const kenyanCounties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
    'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
    'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos',
    'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a',
    'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
    'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia',
    'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  const contentTypes = [
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio/Podcast' },
    { value: 'document', label: 'Document/PDF' },
    { value: 'image', label: 'Image' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      
      if (!formData.contentType) {
        const fileType = file.type.split('/')[0];
        const extension = file.name.split('.').pop().toLowerCase();
        
        let detectedType = 'document';
        if (fileType === 'video' || ['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
          detectedType = 'video';
        } else if (fileType === 'audio' || ['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(extension)) {
          detectedType = 'audio';
        } else if (fileType === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
          detectedType = 'image';
        } else if (['pdf', 'doc', 'docx'].includes(extension)) {
          detectedType = 'document';
        }
        
        setFormData(prev => ({ ...prev, contentType: detectedType }));
      }
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-[#7F622C] mb-2">Category *</label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-md border-2 border-[#7F622C]/30 bg-white text-gray-800 focus:border-[#CBD300] focus:ring-1 focus:ring-[#CBD300]/20 focus:outline-none transition-all duration-200 hover:border-[#7F622C]/50"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-[#7F622C] mb-2">County *</label>
          <select
            name="county"
            required
            value={formData.county}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-md border-2 border-[#7F622C]/30 bg-white text-gray-800 focus:border-[#CBD300] focus:ring-1 focus:ring-[#CBD300]/20 focus:outline-none transition-all duration-200 hover:border-[#7F622C]/50"
          >
            <option value="">Select county</option>
            {kenyanCounties.map(county => (
              <option key={county} value={county}>{county}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-[#7F622C] mb-2">Story Description *</label>
        <textarea
          name="description"
          required
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-md border-2 border-[#7F622C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#CBD300] focus:ring-1 focus:ring-[#CBD300]/20 focus:outline-none transition-all duration-200 hover:border-[#7F622C]/50"
          placeholder="Describe your story's impact and key outcomes"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-[#7F622C] mb-2">Your Name *</label>
          <input
            type="text"
            name="authorName"
            required
            value={formData.authorName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-md border-2 border-[#7F622C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#CBD300] focus:ring-1 focus:ring-[#CBD300]/20 focus:outline-none transition-all duration-200 hover:border-[#7F622C]/50"
            placeholder="Your full name"
          />
        </div>
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-[#7F622C] mb-2">Email *</label>
          <input
            type="email"
            name="authorEmail"
            required
            value={formData.authorEmail}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-md border-2 border-[#7F622C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#CBD300] focus:ring-1 focus:ring-[#CBD300]/20 focus:outline-none transition-all duration-200 hover:border-[#7F622C]/50"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-[#7F622C] mb-2">Content Type *</label>
        <select
          name="contentType"
          required
          value={formData.contentType}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-md border-2 border-[#7F622C]/30 bg-white text-gray-800 focus:border-[#CBD300] focus:ring-1 focus:ring-[#CBD300]/20 focus:outline-none transition-all duration-200 hover:border-[#7F622C]/50"
        >
          <option value="">Select content type</option>
          {contentTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <div className="mt-2 text-sm text-[#7F622C]/70">
          This will be auto-detected when you upload a file
        </div>
      </div>

      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-[#7F622C] mb-2">Upload Media *</label>
        <input
          type="file"
          accept="video/*,audio/*,.pdf,.doc,.docx,image/*"
          onChange={handleFileChange}
          required
          className="w-full px-4 py-3 rounded-md border-2 border-[#7F622C]/30 bg-white text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#7F622C] file:text-white hover:file:bg-[#9A774A] text-sm text-gray-500 focus:border-[#CBD300] focus:ring-1 focus:ring-[#CBD300]/20 focus:outline-none transition-all duration-200"
        />
        <div className="mt-2 text-sm text-[#7F622C]/70">
          Video, Audio, Image, PDF, or Document files (max 50MB)
        </div>
      </div>

      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-[#7F622C] mb-2">Transcript (Optional)</label>
        <textarea
          name="transcript"
          rows={6}
          value={formData.transcript}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-md border-2 border-[#7F622C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#CBD300] focus:ring-1 focus:ring-[#CBD300]/20 focus:outline-none transition-all duration-200 hover:border-[#7F622C]/50"
          placeholder="If you have audio/video, include a transcript for accessibility"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#CBD300] text-[#7F622C] rounded-md font-medium hover:bg-[#CBD300]/90 transform transition-all duration-300 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#CBD300] focus:ring-offset-2"
        >
          {loading ? 'Submitting...' : 'Submit Story'}
        </button>
      </div>
    </form>
  );
};

export default StoryForm;