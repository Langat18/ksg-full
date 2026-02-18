import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const formatDate = (dateObj) => {
  const days = Math.ceil(Math.abs(new Date() - dateObj) / 864e5);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const VIDEO_EXTS    = new Set(['mp4', 'webm', 'mov']);
const AUDIO_EXTS    = new Set(['mp3', 'wav', 'm4a', 'ogg']);
const DOC_EXTS      = new Set(['pdf', 'doc', 'docx']);
const IMAGE_EXTS    = new Set(['jpg', 'jpeg', 'png', 'gif']);

const getExt = (url) => url?.split('.').pop().toLowerCase() ?? '';

const getMediaType = (contentType, mediaUrl) => {
  const t = (contentType || '').toLowerCase();
  const ext = getExt(mediaUrl);
  if (t === 'video'    || VIDEO_EXTS.has(ext))  return 'video';
  if (t === 'audio'    || AUDIO_EXTS.has(ext))  return 'audio';
  if (t === 'document' || t === 'pdf' || DOC_EXTS.has(ext))   return 'document';
  if (t === 'image'    || IMAGE_EXTS.has(ext))  return 'image';
  return t || 'file';
};

const MEDIA_ICONS = {
  video: (
    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  audio: (
    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  document: (
    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  image: (
    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const StoryCard = memo(({ story }) => {
  const date = new Date(story.published_at || story.created_at || Date.now());
  const authorName = story.author?.full_name || story.author?.username || 'KSG Community';
  const mediaType = getMediaType(story.content_type, story.media_url);

  return (
    <article className="card-ksg group relative">
      <div className="flex items-start space-x-3 mb-4">
        <div className="h-10 w-10 bg-gradient-to-br from-[#235D4C] to-[#B5955B] rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-[#1A1A1A] group-hover:text-[#7F622C] transition-colors leading-tight mb-2 line-clamp-2">
            <Link to={`/story/${story.id}`} className="hover:underline">{story.title}</Link>
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">{authorName}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">{story.description}</p>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {story.category && <span className="tag-ksg">{story.category}</span>}
          {story.county && story.county !== 'undefined' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {story.county}
            </span>
          )}
          {story.media_url && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              {MEDIA_ICONS[mediaType] ?? DEFAULT_ICON}
              {mediaType}
            </span>
          )}
        </div>
        <Link to={`/story/${story.id}`} className="inline-flex items-center text-[#7F622C] hover:text-[#CBD300] font-medium transform transition-all group-hover:translate-x-1">
          Read Story
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {(story.views > 0 || story.likes > 0 || story.shares > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-4 text-xs text-gray-500">
          {story.views > 0 && (
            <div className="flex items-center space-x-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{story.views}</span>
            </div>
          )}
          {story.likes > 0 && (
            <div className="flex items-center space-x-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{story.likes}</span>
            </div>
          )}
          {story.shares > 0 && (
            <div className="flex items-center space-x-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>{story.shares}</span>
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#235D4C] to-[#B5955B] rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </article>
  );
});

StoryCard.displayName = 'StoryCard';
export default StoryCard;