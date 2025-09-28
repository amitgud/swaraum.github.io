# SwarAum Band Website

A responsive single-page website for the band SwarAum, featuring an about section, upcoming concerts powered by Google Sheets, and social media feeds.

## Features

- **Responsive Design**: Works on all device sizes
- **Upcoming Concerts**: Powered by Google Sheets for easy updates
- **Social Media Integration**: Display feeds from Instagram and YouTube
- **Contact Form**: For fan inquiries and booking
- **Modern UI/UX**: Clean, modern design with smooth animations

## Setup Instructions

### Prerequisites

- A web server to host the website (or use GitHub Pages)
- A Google Cloud Platform account for Google Sheets API
- Social media developer accounts for Instagram and YouTube APIs

### Google Sheets Setup

1. Create a new Google Sheet with the following columns:
   - Date (format: YYYY-MM-DD)
   - Title (concert title)
   - Location (venue and city)
   - Image URL (optional, for concert image)

2. Publish the sheet to the web:
   - Go to File > Share > Publish to web
   - Select the sheet and click "Publish"
   - Copy the spreadsheet ID from the URL (the long string between /d/ and /edit)

3. Enable Google Sheets API:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Sheets API
   - Create API credentials (API key)
   - Restrict the API key to your domain for security

### Configuration

1. Open `js/main.js` and update the following variables:
   - `spreadsheetId`: Your Google Sheet ID
   - `apiKey`: Your Google Cloud API key

2. For social media feeds, update the placeholders in the `initializeSocialFeeds()` function with your actual API keys and account information.

### Social Media Integration

#### Instagram
1. Create a Facebook Developer account
2. Create a new app and get Instagram Basic Display API credentials
3. Update the Instagram feed section in `js/main.js`

#### YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Create API credentials
4. Update the YouTube feed section in `js/main.js`

### Deployment

#### GitHub Pages
1. Push the code to a GitHub repository
2. Go to Settings > Pages
3. Select the main branch and click "Save"
4. Your site will be live at `https://<username>.github.io/<repository-name>/`

#### Custom Domain
1. Update the CNAME file with your domain
2. Configure your DNS settings to point to GitHub Pages
3. Enable HTTPS in the repository settings

## Project Structure

```
swaraum.github.io/
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   └── main.js            # Main JavaScript file
├── images/                # Website images (create this directory)
├── index.html             # Main HTML file
└── README.md              # This file
```

## Customization

- Update the color scheme in `css/styles.css` by modifying the CSS variables at the top of the file
- Add your own images to the `images` directory
- Customize the band member information in `index.html`
- Update the contact information in the footer

## License

This project is open source and available under the [MIT License](LICENSE).

---

Created with ❤️ for SwarAum
