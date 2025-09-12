// Set up environment variables for both local and production
(function() {
    // Initialize window._env_ if it doesn't exist
    window._env_ = window._env_ || {};

    // For production, window._env_ is set by env.js
    // For local development, you can set window._env_ here
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Merge with any existing environment variables
        window._env_ = {
            // Add your local development environment variables here
            // Example: GOOGLE_SHEETS_API_KEY: 'your_local_api_key',
            ...window._env_
        };
        
        console.log('Development environment variables:', window._env_);
    }
})();
