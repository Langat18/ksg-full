import React, { useState, useRef, useEffect } from 'react';

const ImmersivePlayer = ({ story, onBookmark, onShare }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [pdfError, setPdfError] = useState(false);
  const mediaRef = useRef(null);

  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const mediaUrl = getMediaUrl(story.media_url);
  const thumbnailUrl = getMediaUrl(story.thumbnail_url);
  
  const contentType = (story.content_type || '').toLowerCase().trim();
  const fileExtension = mediaUrl ? mediaUrl.split('.').pop().toLowerCase() : '';
  
  const isDocument = contentType === 'document' || 
                     contentType === 'pdf' || 
                     fileExtension === 'pdf' ||
                     fileExtension === 'docx';
  
  const isVideo = contentType === 'video' || 
                  ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(fileExtension);
  
  const isAudio = contentType === 'audio' || 
                  contentType === 'podcast' || 
                  ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(fileExtension);
  
  const isImage = contentType === 'image' || 
                  contentType === 'photo' || 
                  ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(fileExtension);

  const transcriptSegments = story.transcript ? 
    story.transcript.split('\n').filter(line => line.trim()).map((line, index) => ({
      startTime: index * 30,
      endTime: (index + 1) * 30,
      text: line.trim()
    })) : [];

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || isDocument || isImage) return;

    const updateTime = () => setCurrentTime(media.currentTime);
    const updateDuration = () => setDuration(media.duration);
    const updatePlayState = () => setIsPlaying(!media.paused);

    media.addEventListener('timeupdate', updateTime);
    media.addEventListener('loadedmetadata', updateDuration);
    media.addEventListener('play', updatePlayState);
    media.addEventListener('pause', updatePlayState);

    return () => {
      media.removeEventListener('timeupdate', updateTime);
      media.removeEventListener('loadedmetadata', updateDuration);
      media.removeEventListener('play', updatePlayState);
      media.removeEventListener('pause', updatePlayState);
    };
  }, [isDocument, isImage]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    const media = mediaRef.current;
    if (!media) return;
    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
  };

  const seekTo = (time) => {
    const media = mediaRef.current;
    if (!media) return;
    media.currentTime = time;
  };

  const handleTranscriptClick = (segment) => {
    seekTo(segment.startTime);
  };

  const addBookmark = () => {
    const newBookmark = {
      id: Date.now(),
      time: currentTime,
      title: `Bookmark at ${formatTime(currentTime)}`,
      description: getActiveTranscriptText()
    };
    setBookmarks([...bookmarks, newBookmark]);
    if (onBookmark) onBookmark(newBookmark);
  };

  const getActiveTranscriptText = () => {
    const activeSegment = transcriptSegments.find(
      segment => currentTime >= segment.startTime && currentTime < segment.endTime
    );
    return activeSegment ? activeSegment.text : '';
  };

  const shareCurrentTime = () => {
    const shareData = {
      title: story.title,
      time: currentTime,
      formattedTime: formatTime(currentTime),
      text: getActiveTranscriptText()
    };
    if (onShare) onShare(shareData);
  };

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

  if (isDocument) {
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
          <a
            href={mediaUrl}
            download
            className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </a>
        </div>
        
        {!pdfError ? (
          <div className="relative" style={{ height: '800px' }}>
            <iframe
              src={`${mediaUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full"
              title="PDF Document Viewer"
              onError={() => setPdfError(true)}
            />
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Unable to display PDF</h4>
            <p className="text-gray-600 mb-4">Your browser may not support inline PDF viewing.</p>
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Open in New Tab</span>
            </a>
          </div>
        )}

        {story.transcript && (
          <div className="p-6 bg-white border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Document Transcript</h3>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </button>
            </div>
            {showTranscript && (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {story.transcript}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
        <img
          src={mediaUrl}
          alt={story.title}
          className="w-full h-auto"
          style={{ maxHeight: '700px', objectFit: 'contain' }}
        />
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t">
          <div className="flex items-center space-x-3">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-700 text-sm font-medium">{story.title}</span>
          </div>
          <a
            href={mediaUrl}
            download
            className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Image</span>
          </a>
        </div>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative bg-black">
          <video
            ref={mediaRef}
            className="w-full"
            style={{ maxHeight: '600px' }}
            src={mediaUrl}
            poster={thumbnailUrl}
            controls
            onError={(e) => {
              console.error('Video load error:', e);
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {story.transcript && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Interactive Transcript</h3>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </button>
            </div>

            {showTranscript && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {transcriptSegments.length > 0 ? (
                  transcriptSegments.map((segment, index) => {
                    const isActive = currentTime >= segment.startTime && currentTime < segment.endTime;
                    return (
                      <div
                        key={index}
                        onClick={() => handleTranscriptClick(segment)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          isActive
                            ? 'bg-blue-100 border-l-4 border-blue-600 text-blue-900'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm leading-relaxed flex-1">{segment.text}</p>
                          <span className="text-xs text-gray-500 ml-3 flex-shrink-0">
                            {formatTime(segment.startTime)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="whitespace-pre-wrap">{story.transcript}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {bookmarks.length > 0 && (
          <div className="border-t p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Bookmarks</h3>
            <div className="space-y-2">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  onClick={() => seekTo(bookmark.time)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">{bookmark.title}</div>
                    <div className="text-xs text-gray-600 truncate">{bookmark.description}</div>
                  </div>
                  <div className="text-xs text-gray-500 ml-3">{formatTime(bookmark.time)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
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

          <audio
            ref={mediaRef}
            src={mediaUrl}
            className="w-full"
            controls
            onError={(e) => {
              console.error('Audio load error:', e);
            }}
            style={{
              borderRadius: '8px',
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))'
            }}
          >
            Your browser does not support the audio tag.
          </audio>

          <div className="mt-6 text-center">
            <a
              href={mediaUrl}
              download
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium border border-white/30"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Audio</span>
            </a>
          </div>
        </div>
      </div>

      {story.transcript && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Interactive Transcript</h3>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </button>
          </div>

          {showTranscript && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transcriptSegments.length > 0 ? (
                transcriptSegments.map((segment, index) => {
                  const isActive = currentTime >= segment.startTime && currentTime < segment.endTime;
                  return (
                    <div
                      key={index}
                      onClick={() => handleTranscriptClick(segment)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isActive
                          ? 'bg-purple-100 border-l-4 border-purple-600 text-purple-900'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm leading-relaxed flex-1">{segment.text}</p>
                        <span className="text-xs text-gray-500 ml-3 flex-shrink-0">
                          {formatTime(segment.startTime)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="whitespace-pre-wrap">{story.transcript}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {bookmarks.length > 0 && (
        <div className="border-t p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Bookmarks</h3>
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                onClick={() => seekTo(bookmark.time)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">{bookmark.title}</div>
                  <div className="text-xs text-gray-600 truncate">{bookmark.description}</div>
                </div>
                <div className="text-xs text-gray-500 ml-3">{formatTime(bookmark.time)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImmersivePlayer;