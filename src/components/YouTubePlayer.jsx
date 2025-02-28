import { useEffect, useRef, useState } from 'react';
import { getRating, rateVideo, isUserSignedIn } from '../services/youtubeRatingService';
import YouTubeAuth from './YouTubeAuth';

const YouTubePlayer = ({ videoId, onReady }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [playerError, setPlayerError] = useState(null);
  const [likeStatus, setLikeStatus] = useState('none'); // 'none', 'like', 'dislike'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRating, setIsRating] = useState(false);

  // Handle authentication change
  const handleAuthChange = (isSignedIn) => {
    setIsLoggedIn(isSignedIn);
    if (isSignedIn && videoId) {
      fetchCurrentRating(videoId);
    }
  };

  // Fetch the current rating for the video
  const fetchCurrentRating = async (videoId) => {
    try {
      const rating = await getRating(videoId);
      if (rating) {
        setLikeStatus(rating);
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  useEffect(() => {
    // Reset error state when videoId changes
    setPlayerError(null);
    setLikeStatus('none');
    
    // Don't try to load if no videoId is provided
    if (!videoId) return;
    
    // Check if user is logged in
    setIsLoggedIn(isUserSignedIn());
    
    // If logged in, fetch current rating
    if (isUserSignedIn()) {
      fetchCurrentRating(videoId);
    }
    
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      try {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = () => {
          try {
            initPlayer();
          } catch (error) {
            console.error('Error in onYouTubeIframeAPIReady:', error);
            setPlayerError('Failed to initialize YouTube player');
          }
        };
      } catch (error) {
        console.error('Error loading YouTube API:', error);
        setPlayerError('Failed to load YouTube player API');
      }
    } else {
      // If API is already loaded, initialize player directly
      try {
        initPlayer();
      } catch (error) {
        console.error('Error initializing player:', error);
        setPlayerError('Failed to initialize YouTube player');
      }
    }

    function initPlayer() {
      if (!videoId) return;
      
      if (playerRef.current) {
        // If player exists, just load new video
        try {
          playerRef.current.loadVideoById(videoId);
          // Reset like status for new video
          setLikeStatus('none');
          // If logged in, fetch current rating
          if (isUserSignedIn()) {
            fetchCurrentRating(videoId);
          }
        } catch (error) {
          console.error('Error loading video:', error);
          setPlayerError('Failed to load video');
        }
        return;
      }

      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => {
              if (onReady) onReady(event);
            },
            onStateChange: (event) => {
              // Handle state changes if needed
            },
            onError: (event) => {
              console.error('YouTube Player Error:', event.data);
              let errorMessage = 'An error occurred with the YouTube player';
              
              // Map YouTube error codes to more specific messages
              switch(event.data) {
                case 2:
                  errorMessage = 'Invalid video ID';
                  break;
                case 5:
                  errorMessage = 'HTML5 player error';
                  break;
                case 100:
                  errorMessage = 'Video not found or removed';
                  break;
                case 101:
                case 150:
                  errorMessage = 'Video cannot be played in embedded players';
                  break;
              }
              
              setPlayerError(errorMessage);
            },
          },
        });
      } catch (error) {
        console.error('Error creating YouTube player:', error);
        setPlayerError('Failed to create YouTube player');
      }
    }

    // Cleanup function
    return () => {
      // Don't destroy the player on videoId change, just let it be reused
      // This provides smoother transitions between videos
    };
  }, [videoId, onReady]);

  // When videoId changes, load the new video
  useEffect(() => {
    if (playerRef.current && videoId) {
      try {
        playerRef.current.loadVideoById(videoId);
        // Reset like status for new video
        setLikeStatus('none');
        // If logged in, fetch current rating
        if (isUserSignedIn()) {
          fetchCurrentRating(videoId);
        }
      } catch (error) {
        console.error('Error loading video:', error);
        setPlayerError('Failed to load video');
      }
    }
  }, [videoId]);

  // Handle like button click
  const handleLike = async () => {
    if (!videoId || isRating) return;
    
    try {
      setIsRating(true);
      
      if (likeStatus === 'like') {
        // If already liked, remove the like (neutral)
        const success = await rateVideo(videoId, 'none');
        if (success) {
          setLikeStatus('none');
        }
      } else {
        // Like the video
        const success = await rateVideo(videoId, 'like');
        if (success) {
          setLikeStatus('like');
        }
      }
    } catch (error) {
      console.error('Error liking video:', error);
    } finally {
      setIsRating(false);
    }
  };

  // Handle dislike button click
  const handleDislike = async () => {
    if (!videoId || isRating) return;
    
    try {
      setIsRating(true);
      
      if (likeStatus === 'dislike') {
        // If already disliked, remove the dislike (neutral)
        const success = await rateVideo(videoId, 'none');
        if (success) {
          setLikeStatus('none');
        }
      } else {
        // Dislike the video
        const success = await rateVideo(videoId, 'dislike');
        if (success) {
          setLikeStatus('dislike');
        }
      }
    } catch (error) {
      console.error('Error disliking video:', error);
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="w-full bg-black">
      <div className="relative w-full pt-[56.25%] bg-black">
        {playerError ? (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 text-white">
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">{playerError}</p>
              <p className="text-sm">Please try scrolling to another stream</p>
            </div>
          </div>
        ) : (
          <div 
            ref={containerRef} 
            className="absolute top-0 left-0 w-full h-full"
          />
        )}
      </div>
      
      {/* Like/Dislike buttons */}
      <div className="flex items-center justify-center space-x-4 py-2 bg-gray-900">
        <button 
          onClick={handleLike}
          disabled={!isLoggedIn || isRating}
          className={`flex items-center px-4 py-2 rounded-full ${
            !isLoggedIn 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : likeStatus === 'like' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
          aria-label="Like"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          Like
          {isRating && likeStatus !== 'like' && (
            <span className="ml-1 animate-pulse">...</span>
          )}
        </button>
        
        <button 
          onClick={handleDislike}
          disabled={!isLoggedIn || isRating}
          className={`flex items-center px-4 py-2 rounded-full ${
            !isLoggedIn 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : likeStatus === 'dislike' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
          aria-label="Dislike"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
          </svg>
          Dislike
          {isRating && likeStatus !== 'dislike' && (
            <span className="ml-1 animate-pulse">...</span>
          )}
        </button>
      </div>
      
      {/* YouTube Authentication */}
      <YouTubeAuth onAuthChange={handleAuthChange} />
    </div>
  );
};

export default YouTubePlayer; 