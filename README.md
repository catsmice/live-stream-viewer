# YouTube Live Stream Viewer

A React application for watching YouTube live streams with enhanced user interaction features, including the ability to like and dislike videos.

## Features

- Browse trending YouTube live streams
- Watch live streams directly in the app
- Like and dislike videos (requires YouTube authentication)
- Responsive design for all device sizes
- Infinite scrolling to discover more streams

## Technologies Used

- React
- Vite
- Tailwind CSS
- YouTube IFrame Player API
- YouTube Data API v3
- Google Identity Services for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Google Cloud Platform account with YouTube Data API v3 enabled
- OAuth 2.0 credentials for the YouTube API

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/youtube-live-stream-viewer.git
   cd youtube-live-stream-viewer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your API keys:
   ```
   VITE_YOUTUBE_API_KEY=your_api_key
   VITE_GOOGLE_CLIENT_ID=your_client_id
   ```
   
   > **Important**: Never commit your `.env` file to version control. The repository includes a `.env.example` file as a template. Your actual API keys should only exist in your local `.env` file.

4. Start the development server:
   ```
   npm run dev
   ```

### OAuth Configuration

For the like/dislike functionality to work, you need to configure OAuth in the Google Cloud Console:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project
3. Go to "Credentials" → "OAuth 2.0 Client IDs"
4. Edit your OAuth client
5. Add your app's origin (e.g., `http://localhost:5173` for development) to "Authorized JavaScript origins"
6. Save the changes

## Usage

- Scroll through the list of live streams
- Click on a stream to watch it
- Sign in with your YouTube account to like or dislike videos
- Use the navigation buttons to move between streams

## License

MIT

## Acknowledgments

- YouTube API for providing access to live streams
- Google Identity Services for authentication
- The React and Vite communities for excellent documentation
