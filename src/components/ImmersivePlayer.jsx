import React, { useState, useRef, useEffect } from 'react';

const ImmersivePlayer = ({ story, onBookmark, onShare }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const mediaRef = useRef(null);

  // CRITICAL: Get full media URL
  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const mediaUrl = getMediaUrl(story.media_url);
  const thumbnailUrl = getMediaUrl(story.thumbnail_url);
  const isMediaVideo = story.content_type === 'video';

  // Parse transcript into segments (if available)
  const transcriptSegments = story.transcript ? 
    story.transcript.split('\n').filter(line => line.trim()).map((line, index) => ({
      startTime: index * 30,
      endTime: (index + 1) * 30,
      text: line.trim()
    })) : [];

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

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
  }, []);

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

  // Show message if no media available
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

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Media Player */}
      <div className="relative bg-black">
        {isMediaVideo ? (
          <video
            ref={mediaRef}
            className="w-full h-64 md:h-96"
            src={mediaUrl}
            poster={thumbnailUrl}
            controls
            onError={(e) => {
              console.error('Video load error:', e);
              e.target.style.display = 'none';
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-64 md:h-96 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
            <div className="w-full px-8">
              <audio
                ref={mediaRef}
                src={mediaUrl}
                controls
                className="w-full"
                onError={(e) => {
                  console.error('Audio load error:', e);
                }}
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
            <div className="absolute top-1/4 text-center text-white px-4">
              <div className="h-20 w-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <h3 className="text-xl font-medium">{story.title}</h3>
              <p className="text-blue-200 mt-2">Audio Story</p>
            </div>
          </div>
        )}

        {/* Player Controls Overlay - Only show for custom controls */}
        {!isMediaVideo && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="w-full bg-white/30 rounded-full h-2 mb-4 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                seekTo(percent * duration);
              }}
            >
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                <button
                  onClick={addBookmark}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  title="Bookmark this moment"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>

                <button
                  onClick={shareCurrentTime}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  title="Share this moment"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>

              <div className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Transcript */}
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

      {/* Bookmarks */}
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