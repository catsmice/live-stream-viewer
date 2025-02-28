import { useState, useEffect, useRef } from 'react';

const YouTubeAuth = ({ onAuthChange }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Load the Google Identity Services script
    const loadGoogleIdentityServices = () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if the script is already loaded
        if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = initGoogleIdentity;
          document.body.appendChild(script);
        } else {
          initGoogleIdentity();
        }
      } catch (err) {
        console.error('Error loading Google Identity Services:', err);
        setError('Failed to load authentication services');
        setIsLoading(false);
      }
    };

    const initGoogleIdentity = () => {
      try {
        // Initialize the tokenClient for OAuth flow
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: '850869125034-eose2lvtvhioj3i000cu8llpsfs18f7l.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
            callback: handleTokenResponse,
            error_callback: handleTokenError
          });
          
          setTokenClient(client);
          
          // Also load the YouTube API client
          loadYouTubeApiClient();
        } else {
          console.error('Google Identity Services not available');
          setError('Google authentication services not available');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing Google Identity:', err);
        setError('Failed to initialize authentication');
        setIsLoading(false);
      }
    };
    
    const loadYouTubeApiClient = () => {
      // Load the GAPI client for YouTube API (not for auth)
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          window.gapi.load('client', async () => {
            try {
              await window.gapi.client.init({
                apiKey: 'AIzaSyBgpKHsO_xDO1PD8D2AmV2f_uCf12lbnXQ',
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
              });
              
              // Check if we have a token in session storage
              const token = sessionStorage.getItem('youtube_access_token');
              if (token) {
                // Set the token for API requests
                window.gapi.client.setToken({ access_token: token });
                setIsSignedIn(true);
                if (onAuthChange) onAuthChange(true);
              }
              
              setIsLoading(false);
            } catch (err) {
              console.error('Error initializing YouTube API client:', err);
              setError('Failed to initialize YouTube API');
              setIsLoading(false);
            }
          });
        };
        document.body.appendChild(script);
      } else {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: 'AIzaSyBgpKHsO_xDO1PD8D2AmV2f_uCf12lbnXQ',
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
            });
            
            // Check if we have a token in session storage
            const token = sessionStorage.getItem('youtube_access_token');
            if (token) {
              // Set the token for API requests
              window.gapi.client.setToken({ access_token: token });
              setIsSignedIn(true);
              if (onAuthChange) onAuthChange(true);
            }
            
            setIsLoading(false);
          } catch (err) {
            console.error('Error initializing YouTube API client:', err);
            setError('Failed to initialize YouTube API');
            setIsLoading(false);
          }
        });
      }
    };

    loadGoogleIdentityServices();
    
    // Cleanup function
    return () => {
      // Clean up if needed
    };
  }, [onAuthChange]);

  const handleTokenResponse = (response) => {
    if (response && response.access_token) {
      // Store the token in session storage
      sessionStorage.setItem('youtube_access_token', response.access_token);
      
      // Set the token for API requests
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken({ access_token: response.access_token });
      }
      
      setIsSignedIn(true);
      setError(null);
      if (onAuthChange) onAuthChange(true);
    }
  };

  const handleTokenError = (error) => {
    console.error('Token error:', error);
    setError(`Authentication error: ${error.type || 'Unknown error'}`);
    setIsSignedIn(false);
    if (onAuthChange) onAuthChange(false);
  };

  const handleSignIn = () => {
    try {
      setError(null);
      
      if (tokenClient) {
        // Request a token
        tokenClient.requestAccessToken();
      } else {
        setError('Authentication service not ready yet. Please try again in a moment.');
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      setError('Sign-in process failed');
    }
  };

  const handleSignOut = () => {
    try {
      // Clear the token
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        window.google.accounts.oauth2.revoke(sessionStorage.getItem('youtube_access_token'), () => {
          console.log('Token revoked');
        });
      }
      
      // Remove token from session storage
      sessionStorage.removeItem('youtube_access_token');
      
      // Clear the token from gapi client
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken('');
      }
      
      setIsSignedIn(false);
      if (onAuthChange) onAuthChange(false);
    } catch (error) {
      console.error('Error during sign out:', error);
      setError('Sign-out process failed');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-400 text-xs py-1">
        Loading authentication...
      </div>
    );
  }

  // Show error but still provide sign-in option if possible
  if (error) {
    return (
      <div className="text-center py-1 bg-gray-800">
        <div className="text-red-400 text-xs mb-1">
          {error}
        </div>
        <button 
          onClick={handleSignIn}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Try signing in again
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-1 bg-gray-800">
      {isSignedIn ? (
        <div>
          <div className="text-xs text-green-400 mb-1">✓ Signed in to YouTube</div>
          <button 
            onClick={handleSignOut}
            className="text-xs text-gray-300 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button 
          onClick={handleSignIn}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Sign In to YouTube to enable likes/dislikes
        </button>
      )}
    </div>
  );
};

export default YouTubeAuth; 