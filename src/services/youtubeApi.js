import axios from 'axios';

// Replace with your actual YouTube Data API key
const API_KEY = 'AIzaSyBgpKHsO_xDO1PD8D2AmV2f_uCf12lbnXQ';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Fetch trending live streams
export const fetchLiveStreams = async (pageToken = '') => {
  try {
    // Check if API key is valid
    if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY') {
      console.log('No valid API key found, using mock data');
      return getMockLiveStreams(pageToken);
    }
    
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        eventType: 'live',
        maxResults: 10,
        order: 'viewCount',
        type: 'video',
        videoCategoryId: '10', // Music category, can be changed or removed
        key: API_KEY,
        pageToken: pageToken || '',
      },
      timeout: 10000, // 10 second timeout
    });
    
    // Check if we got valid data
    if (!response.data || !response.data.items || response.data.items.length === 0) {
      console.warn('No live streams found from API, falling back to mock data');
      return getMockLiveStreams(pageToken);
    }
    
    return {
      items: response.data.items,
      nextPageToken: response.data.nextPageToken || '',
      prevPageToken: response.data.prevPageToken || '',
    };
  } catch (error) {
    console.error('Error fetching live streams:', error);
    
    // Always fall back to mock data on error
    console.log('Falling back to mock data due to API error');
    return getMockLiveStreams(pageToken);
  }
};

// Mock data for development/demo purposes
const getMockLiveStreams = (pageToken) => {
  // These are example video IDs that might be live streams
  // In a real app, these would come from the API
  const mockVideoIds = [
    '5qap5aO4i9A', // lofi hip hop radio
    'jfKfPfyJRdk', // lofi girl
    'DWcJFNfaw9c', // music live
    'kCHqLMLCDTc', // news live
    'mhJh5_6MuCk', // gaming live
    '21X5lGlDOfg', // NASA live
    'EEIk7gwjgIM', // music live
    'XWq5kBlakcQ', // gaming live
    'wrMcEGKIXKo', // news live
    'QeYSqZPiXnc', // tech live
  ];
  
  // Generate different sets based on page token to simulate pagination
  const startIndex = pageToken === 'next' ? 5 : 0;
  const selectedIds = mockVideoIds.slice(startIndex, startIndex + 5);
  
  return {
    items: selectedIds.map((id, index) => ({
      id: { videoId: id },
      snippet: {
        title: `Mock Live Stream ${startIndex + index + 1}`,
        channelTitle: `Channel ${startIndex + index + 1}`,
        description: 'This is a mock live stream for development purposes',
        thumbnails: {
          high: {
            url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          },
        },
      },
    })),
    nextPageToken: pageToken ? '' : 'next',
    prevPageToken: pageToken === 'next' ? 'prev' : '',
  };
};

// Get video details
export const getVideoDetails = async (videoId) => {
  try {
    if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY') {
      // Return mock data if no API key
      return {
        snippet: {
          title: 'Mock Video Details',
          description: 'This is mock data for development purposes',
          channelTitle: 'Mock Channel',
        },
        statistics: {
          viewCount: '1000',
          likeCount: '100',
        },
      };
    }
    
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics,liveStreamingDetails',
        id: videoId,
        key: API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });
    
    return response.data.items[0];
  } catch (error) {
    console.error('Error fetching video details:', error);
    // Return mock data on error
    return {
      snippet: {
        title: 'Mock Video Details (Fallback)',
        description: 'This is mock data due to an API error',
        channelTitle: 'Mock Channel',
      },
      statistics: {
        viewCount: '1000',
        likeCount: '100',
      },
    };
  }
}; 