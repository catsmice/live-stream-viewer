import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import YouTubePlayer from './YouTubePlayer';
import StreamCard from './StreamCard';
import LoadingSpinner from './LoadingSpinner';
import { fetchLiveStreams } from '../services/youtubeApi';

const LiveStreamViewer = () => {
  const [streams, setStreams] = useState([]);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState('');
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Set up intersection observers for top and bottom of the page
  const { ref: topRef, inView: topInView } = useInView({
    threshold: 0.1,
  });
  
  const { ref: bottomRef, inView: bottomInView } = useInView({
    threshold: 0.1,
  });

  // Load initial streams
  useEffect(() => {
    loadStreams();
  }, []);

  // Load more streams when user scrolls to bottom
  useEffect(() => {
    if (bottomInView && streams.length > 0 && !loading) {
      loadMoreStreams();
    }
  }, [bottomInView]);

  // Handle scrolling up to previous streams
  useEffect(() => {
    if (topInView && currentStreamIndex > 0 && !loading) {
      setCurrentStreamIndex(prevIndex => Math.max(0, prevIndex - 1));
    }
  }, [topInView]);

  // Load initial streams
  const loadStreams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchLiveStreams();
      
      if (data && data.items && data.items.length > 0) {
        setStreams(data.items);
        setNextPageToken(data.nextPageToken || '');
        setInitialLoad(false);
      } else {
        setError('No live streams found. Please try again later.');
      }
    } catch (err) {
      console.error('Error loading live streams:', err);
      setError('Error loading live streams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Load more streams when scrolling down
  const loadMoreStreams = async () => {
    if (!nextPageToken || loading) return;
    
    try {
      setLoading(true);
      
      const data = await fetchLiveStreams(nextPageToken);
      
      if (data && data.items && data.items.length > 0) {
        setStreams(prevStreams => [...prevStreams, ...data.items]);
        setNextPageToken(data.nextPageToken || '');
      }
    } catch (err) {
      console.error('Error loading more streams:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll events to change current stream
  const handleScroll = useCallback((e) => {
    if (streams.length === 0) return;
    
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    
    // Calculate which stream should be visible based on scroll position
    const streamHeight = windowHeight * 0.8; // Approximate height of each stream section
    const newIndex = Math.min(
      Math.floor(scrollPosition / streamHeight),
      streams.length - 1
    );
    
    if (newIndex !== currentStreamIndex) {
      setCurrentStreamIndex(newIndex);
    }
  }, [streams.length, currentStreamIndex]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Get current stream video ID
  const getCurrentVideoId = () => {
    if (streams.length === 0 || currentStreamIndex >= streams.length) {
      return null;
    }
    return streams[currentStreamIndex].id.videoId;
  };

  // Handle manual stream change
  const changeStream = (direction) => {
    if (direction === 'next' && currentStreamIndex < streams.length - 1) {
      setCurrentStreamIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentStreamIndex > 0) {
      setCurrentStreamIndex(prev => prev - 1);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button 
          onClick={loadStreams}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (initialLoad && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
        <LoadingSpinner />
        <p className="text-white mt-4">Loading live streams...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top observer for detecting upward scrolling */}
      <div ref={topRef} className="h-4" />
      
      {/* Fixed player that stays on screen */}
      <div className="sticky top-0 z-10 w-full bg-black">
        <YouTubePlayer videoId={getCurrentVideoId()} />
        
        {/* Navigation controls */}
        <div className="flex justify-between px-4 py-2 bg-gray-800">
          <button 
            onClick={() => changeStream('prev')} 
            disabled={currentStreamIndex === 0}
            className={`px-3 py-1 rounded ${
              currentStreamIndex === 0 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Previous
          </button>
          <span className="text-white">
            Stream {currentStreamIndex + 1} of {streams.length}
          </span>
          <button 
            onClick={() => changeStream('next')} 
            disabled={currentStreamIndex === streams.length - 1}
            className={`px-3 py-1 rounded ${
              currentStreamIndex === streams.length - 1 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Next
          </button>
        </div>
      </div>
      
      {/* Stream information */}
      <div className="container mx-auto px-4 py-6">
        {streams.map((stream, index) => (
          <div 
            key={stream.id.videoId} 
            className={`transition-opacity duration-300 ${
              index === currentStreamIndex ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <StreamCard stream={stream} />
          </div>
        ))}
        
        {/* Loading indicator at bottom */}
        {loading && <LoadingSpinner />}
        
        {/* Bottom observer for infinite scrolling */}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};

export default LiveStreamViewer; 