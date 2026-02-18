import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import API_URL from '../config/api';

const formatTime = (s) => {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

const getMediaUrl = (url) => {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_URL}${url}`;
};

const VIDEO_EXTS = new Set(['mp4', 'webm', 'ogg', 'mov', 'avi']);
const AUDIO_EXTS = new Set(['mp3', 'wav', 'm4a', 'aac', 'flac']);
const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']);
const DOC_EXTS   = new Set(['pdf', 'docx']);

const getExt = (url) => url?.split('.').pop().toLowerCase() ?? '';

const classifyMedia = (story) => {
  const t   = (story.content_type || '').toLowerCase().trim();
  const ext = getExt(story.media_url);
  if (t === 'document' || t === 'pdf' || DOC_EXTS.has(ext))   return 'document';
  if (t === 'video'    || VIDEO_EXTS.has(ext))                 return 'video';
  if (t === 'audio'    || t === 'podcast' || AUDIO_EXTS.has(ext)) return 'audio';
  if (t === 'image'    || t === 'photo'   || IMAGE_EXTS.has(ext)) return 'image';
  return 'audio';
};

const TranscriptPanel = memo(({ segments, currentTime, onSegmentClick, transcript }) => {
  const [show, setShow] = useState(true);
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Interactive Transcript</h3>
        <button onClick={() => setShow(v => !v)} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          {show ? 'Hide' : 'Show'} Transcript
        </button>
      </div>
      {show && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {segments.length > 0 ? segments.map((seg, i) => {
            const active = currentTime >= seg.startTime && currentTime < seg.endTime;
            return (
              <div key={i} onClick={() => onSegmentClick(seg)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-blue-100 border-l-4 border-blue-600 text-blue-900' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                <div className="flex items-start justify-between">
                  <p className="text-sm leading-relaxed flex-1">{seg.text}</p>
                  <span className="text-xs text-gray-500 ml-3 flex-shrink-0">{formatTime(seg.startTime)}</span>
                </div>
              </div>
            );
          }) : (
            <p className="whitespace-pre-wrap text-gray-500 text-sm">{transcript}</p>
          )}
        </div>
      )}
    </div>
  );
});
TranscriptPanel.displayName = 'TranscriptPanel';

const BookmarkList = memo(({ bookmarks, onSeek }) => {
  if (!bookmarks.length) return null;
  return (
    <div className="border-t p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Bookmarks</h3>
      <div className="space-y-2">
        {bookmarks.map(bm => (
          <div key={bm.id} onClick={() => onSeek(bm.time)}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900">{bm.title}</div>
              <div className="text-xs text-gray-600 truncate">{bm.description}</div>
            </div>
            <div className="text-xs text-gray-500 ml-3">{formatTime(bm.time)}</div>
          </div>
        ))}
      </div>
    </div>
  );
});
BookmarkList.displayName = 'BookmarkList';

const ImmersivePlayer = ({ story, onBookmark, onShare }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [bookmarks, setBookmarks]     = useState([]);
  const [pdfError, setPdfError]       = useState(false);
  const mediaRef = useRef(null);

  const mediaUrl    = useMemo(() => getMediaUrl(story.media_url),    [story.media_url]);
  const thumbnailUrl= useMemo(() => getMediaUrl(story.thumbnail_url),[story.thumbnail_url]);
  const mediaKind   = useMemo(() => classifyMedia(story),            [story]);

  const transcriptSegments = useMemo(() => {
    if (!story.transcript) return [];
    return story.transcript.split('\n').filter(l => l.trim()).map((line, i) => ({
      startTime: i * 30,
      endTime: (i + 1) * 30,
      text: line.trim(),
    }));
  }, [story.transcript]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || mediaKind === 'document' || mediaKind === 'image') return;
    const onTime    = () => setCurrentTime(el.currentTime);
    const onMeta    = () => setDuration(el.duration);
    const onPlaying = () => setIsPlaying(true);
    const onPause   = () => setIsPlaying(false);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('play', onPlaying);
    el.addEventListener('pause', onPause);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('play', onPlaying);
      el.removeEventListener('pause', onPause);
    };
  }, [mediaKind]);

  const seekTo = useCallback((t) => {
    if (mediaRef.current) mediaRef.current.currentTime = t;
  }, []);

  const getActiveText = useCallback(() => {
    return transcriptSegments.find(s => currentTime >= s.startTime && currentTime < s.endTime)?.text ?? '';
  }, [currentTime, transcriptSegments]);

  const addBookmark = useCallback(() => {
    const bm = { id: Date.now(), time: currentTime, title: `Bookmark at ${formatTime(currentTime)}`, description: getActiveText() };
    setBookmarks(prev => [...prev, bm]);
    onBookmark?.(bm);
  }, [currentTime, getActiveText, onBookmark]);

  if (!mediaUrl) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden p-8 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600">No media file available for this story</p>
      </div>
    );
  }

  if (mediaKind === 'document') {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h3 className="text-white font-semibold">{story.title}</h3>
              <p className="text-blue-100 text-xs">PDF Document</p>
            </div>
          </div>
          <a href={mediaUrl} download className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </a>
        </div>
        {!pdfError ? (
          <div className="relative" style={{ height: 800 }}>
            <iframe src={`${mediaUrl}#toolbar=1&navpanes=1&scrollbar=1`} className="w-full h-full" title="PDF Document Viewer" onError={() => setPdfError(true)} />
          </div>
        ) : (
          <div className="p-12 text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Unable to display PDF</h4>
            <p className="text-gray-600 mb-4">Your browser may not support inline PDF viewing.</p>
            <a href={mediaUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <span>Open in New Tab</span>
            </a>
          </div>
        )}
        {story.transcript && (
          <div className="p-6 bg-white border-t">
            <TranscriptPanel segments={[]} currentTime={0} onSegmentClick={() => {}} transcript={story.transcript} />
          </div>
        )}
      </div>
    );
  }

  if (mediaKind === 'image') {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
        <img src={mediaUrl} alt={story.title} className="w-full h-auto" style={{ maxHeight: 700, objectFit: 'contain' }} />
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t">
          <span className="text-gray-700 text-sm font-medium">{story.title}</span>
          <a href={mediaUrl} download
            className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Image</span>
          </a>
        </div>
      </div>
    );
  }

  if (mediaKind === 'video') {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative bg-black">
          <video ref={mediaRef} className="w-full" style={{ maxHeight: 600 }} src={mediaUrl} poster={thumbnailUrl} controls>
            Your browser does not support the video tag.
          </video>
        </div>
        {story.transcript && (
          <TranscriptPanel segments={transcriptSegments} currentTime={currentTime} onSegmentClick={s => seekTo(s.startTime)} transcript={story.transcript} />
        )}
        <BookmarkList bookmarks={bookmarks} onSeek={seekTo} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div className="w-full px-8 py-16">
          <div className="text-center mb-8">
            <div className="h-24 w-24 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{story.title}</h3>
            <p className="text-purple-100">Audio Story</p>
          </div>
          <audio ref={mediaRef} src={mediaUrl} className="w-full" controls style={{ borderRadius: 8, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
            Your browser does not support the audio tag.
          </audio>
          <div className="mt-6 text-center">
            <a href={mediaUrl} download
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium border border-white/30">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Audio</span>
            </a>
          </div>
        </div>
      </div>
      {story.transcript && (
        <TranscriptPanel segments={transcriptSegments} currentTime={currentTime} onSegmentClick={s => seekTo(s.startTime)} transcript={story.transcript} />
      )}
      <BookmarkList bookmarks={bookmarks} onSeek={seekTo} />
    </div>
  );
};

export default memo(ImmersivePlayer);