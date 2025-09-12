document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');
    
    hamburger.addEventListener('click', () => {
        // Animate Links
        navLinks.classList.toggle('active');
        
        // Hamburger Animation
        hamburger.classList.toggle('toggle');
    });
    
    // Close mobile menu when clicking on a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('toggle');
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.padding = '15px 0';
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
    
    // Set active link on scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Initialize Google Sheets for concerts
    loadConcerts();
    
    // Initialize social media feeds
    initializeSocialFeeds();
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Here you would typically send the form data to a server
            console.log('Form submitted:', formObject);
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
});

// Load concerts from Google Sheets
function loadConcerts() {
    // Check if config is loaded
    if (typeof CONFIG === 'undefined') {
        console.error('Configuration not loaded');
        document.getElementById('concerts-container').innerHTML = 
            '<p>Configuration error. Please try again later.</p>';
        return;
    }
    
    const { API_KEY: apiKey, SHEET_ID: spreadsheetId, SHEET_RANGE: range } = CONFIG;
    
    if (!apiKey || !spreadsheetId) {
        console.error('Missing required configuration');
        document.getElementById('concerts-container').innerHTML = 
            '<p>Configuration error. Missing required parameters.</p>';
        return;
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const concertsContainer = document.getElementById('concerts-container');
            if (!data.values || data.values.length === 0) {
                concertsContainer.innerHTML = '<p>No upcoming shows scheduled. Check back soon!</p>';
                return;
            }
            
            // Clear loading message
            concertsContainer.innerHTML = '';
            
            // Process each concert and create cards
            data.values.forEach(concertData => {
                // Assuming the columns are: Date, Time, Title, Description, Venue, City, Ticket Link, Poster URL
                const [date, time, title, description, venue, city, ticketLink, posterId] = concertData;
                
                const concert = {
                    date,
                    time,
                    title: title || 'Untitled Event',
                    description: description || '',
                    venue: venue || '',
                    city: city || '',
                    ticketLink: ticketLink || '#',
                    posterUrl: posterId || ''
                };
                
                // Create and append concert card
                const card = createConcertCard(concert);
                concertsContainer.appendChild(card);
            });
            
            // Add modal for poster display if it doesn't exist
            let modal = document.getElementById('posterModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'posterModal';
                modal.className = 'modal';
                modal.innerHTML = `
                    <span class="close">&times;</span>
                    <img class="modal-content" id="modalImage">
                `;
                document.body.appendChild(modal);
                
                // Function to close the modal
                const closeModal = () => {
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                    document.body.style.overflow = ''; // Restore body scroll
                };
                
                // Close modal when clicking the X
                modal.querySelector('.close').addEventListener('click', closeModal);
                
                // Close modal when clicking outside the image
                modal.addEventListener('click', function(event) {
                    if (event.target === modal) {
                        closeModal();
                    }
                });
                
                // Close with Escape key
                document.addEventListener('keydown', function(event) {
                    if (event.key === 'Escape' && modal.classList.contains('show')) {
                        closeModal();
                    }
                });
            };
        })
        .catch(error => {
            console.error('Error loading concerts:', error);
            document.getElementById('concerts-container').innerHTML = 
                '<p>Unable to load upcoming shows. Please check back later.</p>';
        });
}

// Create concert card element
function createConcertCard(concert) {
    const card = document.createElement('div');
    card.className = 'concert-card';

    // Create poster element
    if (concert.posterUrl && concert.posterUrl.trim() !== '') {
        const poster = document.createElement('img');
        poster.className = 'concert-poster';
        poster.loading = 'lazy';
        
        // Create the image URL with the Google Drive file ID and API key
        const imageUrl = `https://www.googleapis.com/drive/v3/files/${concert.posterUrl.trim()}?alt=media&key=${CONFIG.API_KEY}`;
        poster.src = imageUrl;
        poster.alt = `${concert.title} Concert Poster`;
        
        // Add click event for modal
        poster.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = document.getElementById('posterModal');
            const modalImg = document.getElementById('modalImage');
            if (modal && modalImg) {
                modal.style.display = 'flex';
                modal.classList.add('show');
                modalImg.src = poster.src;
                modalImg.alt = poster.alt;
                
                // Prevent body scroll when modal is open
                document.body.style.overflow = 'hidden';
            }
        });

        poster.onerror = () => {
            console.error('Failed to load image:', concert.posterUrl);
            const placeholder = document.createElement('div');
            placeholder.className = 'concert-poster placeholder';
            placeholder.innerHTML = '<i class="fas fa-music"></i>';
            card.replaceChild(placeholder, poster);
        };
        card.appendChild(poster);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'concert-poster placeholder';
        placeholder.innerHTML = '<i class="fas fa-music"></i>';
        card.appendChild(placeholder);
    }

    const details = document.createElement('div');
    details.className = 'concert-details';
    details.innerHTML = `
        <div class="concert-date">${formatDate(concert.date)} ${concert.time || ''}</div>
        <h3 class="concert-title">${concert.title}</h3>
        ${concert.description ? `<div class="concert-description">${concert.description}</div>` : ''}
        ${concert.venue ? `<div class="concert-venue">${concert.venue}</div>` : ''}
        ${concert.city ? `<div class="concert-location"><i class="fas fa-map-marker-alt"></i> ${concert.city}</div>` : ''}
        ${concert.ticketLink && concert.ticketLink !== '#' ? 
            `<a href="${concert.ticketLink}" class="btn ticket-link" target="_blank" rel="noopener noreferrer">Get Tickets</a>` : ''}
    `;
    card.appendChild(details);

    return card;
}

// Format date to a more readable format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Initialize social media feeds
function initializeSocialFeeds() {
    // Instagram Feed
    // Note: Instagram requires an access token and special API setup
    // This is a placeholder that you'll need to replace with actual API calls
    const instagramFeed = document.getElementById('instagram-feed');
    if (instagramFeed) {
        // Example of how you might load Instagram posts
        // Replace with actual Instagram API implementation
        instagramFeed.innerHTML = `
            <div class="social-post">
                <p>Follow us on <a href="https://www.instagram.com/swaraum" target="_blank">Instagram</a> to see our latest updates!</p>
                <!-- Instagram posts will be loaded here via JavaScript -->
            </div>
        `;
        
        // Load Instagram posts here using Instagram Basic Display API
        // You'll need to register your app at https://developers.facebook.com/
    }
    
    // YouTube Feed
    const youtubeFeed = document.getElementById('youtube-feed');
    if (youtubeFeed) {
        // Example of how you might load YouTube videos
        // Replace with actual YouTube API implementation
        youtubeFeed.innerHTML = `
            <div class="youtube-video">
                <div class="video-container">
                    <iframe width="100%" height="200" src="https://www.youtube.com/embed/VIDEO_ID" 
                            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>
                </div>
                <p>Check out our latest performance!</p>
            </div>
            <p>Subscribe to our <a href="https://www.youtube.com/channel/CHANNEL_ID" target="_blank">YouTube channel</a> for more videos.</p>
        `;
        
        // Load YouTube videos here using YouTube Data API
        // You'll need to get an API key from Google Cloud Console
    }
    
    // TikTok Feed
    const tiktokFeed = document.getElementById('tiktok-feed');
    if (tiktokFeed) {
        // TikTok embed example
        // Note: TikTok requires special embedding or API access
        tiktokFeed.innerHTML = `
            <div class="tiktok-embed" style="max-width: 300px; margin: 0 auto;" 
                 data-video-id="VIDEO_ID" 
                 data-embed-from="embed" 
                 data-embed-type="video">
                <section>
                    <a href="https://www.tiktok.com/@swaraum/video/VIDEO_ID" target="_blank">
                        Watch on TikTok</a>
                </section>
            </div>
            <p>Follow us on <a href="https://www.tiktok.com/@swaraum" target="_blank">TikTok</a> for short clips and behind-the-scenes!</p>
        `;
        
        // Load TikTok script if not already loaded
        if (!document.getElementById('tiktok-script')) {
            const script = document.createElement('script');
            script.id = 'tiktok-script';
            script.src = 'https://www.tiktok.com/embed.js';
            document.body.appendChild(script);
        }
    }
}

// Lazy load images
function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading when the page loads
window.addEventListener('load', lazyLoadImages);
