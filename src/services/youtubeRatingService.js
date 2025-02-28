// YouTube Rating Service
// This service handles interactions with the YouTube API for rating videos (like/dislike)

// Get the current rating for a video
export const getRating = async (videoId) => {
  try {
    // Check if API is ready
    if (!isApiReady()) {
      console.warn('YouTube API client not loaded');
      return null;
    }
    
    // Check if user is authenticated
    if (!isUserSignedIn()) {
      console.warn('User not signed in to YouTube');
      return null;
    }
    
    // Make API request to get rating
    const response = await window.gapi.client.youtube.videos.getRating({
      id: videoId
    });
    
    if (response.result && response.result.items && response.result.items.length > 0) {
      return response.result.items[0].rating;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting video rating:', error);
    
    // Check if the error is due to authentication
    if (isAuthError(error)) {
      // Clear the token as it might be invalid
      clearToken();
    }
    
    return null;
  }
};

// Rate a video (like or dislike)
export const rateVideo = async (videoId, rating) => {
  try {
    // Check if API is ready
    if (!isApiReady()) {
      console.warn('YouTube API client not loaded');
      return false;
    }
    
    // Check if user is authenticated
    if (!isUserSignedIn()) {
      console.warn('User not signed in to YouTube');
      return false;
    }
    
    // Valid rating values: 'like', 'dislike', 'none'
    if (!['like', 'dislike', 'none'].includes(rating)) {
      console.error('Invalid rating value. Must be "like", "dislike", or "none"');
      return false;
    }
    
    // Make API request to rate the video
    await window.gapi.client.youtube.videos.rate({
      id: videoId,
      rating: rating
    });
    
    return true;
  } catch (error) {
    console.error('Error rating video:', error);
    
    // Check if the error is due to authentication
    if (isAuthError(error)) {
      // Clear the token as it might be invalid
      clearToken();
    }
    
    return false;
  }
};

// Check if the YouTube API client is ready
export const isApiReady = () => {
  return !!(window.gapi && 
            window.gapi.client && 
            window.gapi.client.youtube);
};

// Check if the user is signed in to YouTube
export const isUserSignedIn = () => {
  try {
    // Check if we have a token in session storage
    const token = sessionStorage.getItem('youtube_access_token');
    
    // Check if the token is set in the gapi client
    const gapiToken = window.gapi?.client?.getToken();
    
    return !!(token && gapiToken && gapiToken.access_token);
  } catch (error) {
    console.error('Error checking if user is signed in:', error);
    return false;
  }
};

// Check if an error is an authentication error
const isAuthError = (error) => {
  if (error.result && error.result.error) {
    const apiError = error.result.error;
    return apiError.code === 401 || apiError.code === 403;
  }
  return false;
};

// Clear the authentication token
const clearToken = () => {
  try {
    // Remove token from session storage
    sessionStorage.removeItem('youtube_access_token');
    
    // Clear the token from gapi client
    if (window.gapi && window.gapi.client) {
      window.gapi.client.setToken('');
    }
    
    // Notify any listeners that might be registered
    window.dispatchEvent(new CustomEvent('youtube-auth-changed', { detail: { isSignedIn: false } }));
  } catch (error) {
    console.error('Error clearing token:', error);
  }
}; 