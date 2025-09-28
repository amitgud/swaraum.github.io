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
    
    // Show loading state
    const concertsContainer = document.getElementById('concerts-container');
    concertsContainer.innerHTML = '<div class="loading">Loading upcoming shows...</div>';
    
    // Build the API URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                return response.text().then(() => {
                    throw new Error('Error loading concert data');
                });
            }
            return response.json();
        })
        .then(data => {
            const concertsContainer = document.getElementById('concerts-container');
            
            if (!data.values || data.values.length === 0) {
                concertsContainer.innerHTML = '<p>No upcoming shows scheduled. Check back soon!</p>';
                return;
            }
            
            // Clear loading message
            concertsContainer.innerHTML = '';
            
            // Get current date for comparison
            const now = new Date();
            
            // Separate concerts into upcoming and past
            const upcomingConcerts = [];
            const pastConcerts = [];
            
            data.values.forEach(concertData => {
                const [date, time, title, description, venue, city, ticketLink, posterId] = concertData;
                const concertDate = new Date(`${date} ${time || '00:00'}`);
                
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
                
                if (concertDate >= now) {
                    upcomingConcerts.push(concert);
                } else {
                    pastConcerts.push(concert);
                }
            });
            
            // Sort upcoming concerts (earliest first)
            upcomingConcerts.sort((a, b) => 
                new Date(`${a.date} ${a.time || '00:00'}`) - new Date(`${b.date} ${b.time || '00:00'}`)
            );
            
            // Sort past concerts (most recent first)
            pastConcerts.sort((a, b) => 
                new Date(`${b.date} ${b.time || '00:00'}`) - new Date(`${a.date} ${a.time || '00:00'}`)
            );
            
            // Create sections container
            const sectionsContainer = document.createElement('div');
            sectionsContainer.className = 'concert-sections';
            
            // Add upcoming concerts section
            const upcomingSection = document.createElement('div');
            upcomingSection.className = 'concert-section upcoming-concerts';
            
            if (upcomingConcerts.length === 0) {
                upcomingSection.innerHTML += `
                    <div class="no-concerts">
                        <p>No upcoming concerts scheduled at this time.</p>
                    </div>
                `;
            } else {
                const upcomingList = document.createElement('div');
                upcomingList.className = 'concerts-list';
                upcomingConcerts.forEach(concert => {
                    upcomingList.appendChild(createConcertCard(concert));
                });
                upcomingSection.appendChild(upcomingList);
            }
            
            // Add past concerts section
            const pastSection = document.createElement('div');
            pastSection.className = 'concert-section past-concerts';
            pastSection.innerHTML = '<h2>Past Concerts</h2>';
            
            if (pastConcerts.length === 0) {
                pastSection.innerHTML += `
                    <div class="no-concerts">
                        <p>No past concerts to display.</p>
                    </div>
                `;
            } else {
                const pastList = document.createElement('div');
                pastList.className = 'concerts-list';
                pastConcerts.forEach(concert => {
                    pastList.appendChild(createConcertCard(concert));
                });
                pastSection.appendChild(pastList);
            }
            
            // Add sections to container
            sectionsContainer.appendChild(upcomingSection);
            sectionsContainer.appendChild(pastSection);
            concertsContainer.appendChild(sectionsContainer);
            
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
            }
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

    // Create poster container (top half)
    const posterContainer = document.createElement('div');
    posterContainer.className = 'concert-poster-container';

    // Create poster element
    if (concert.posterUrl && concert.posterUrl.trim() !== '') {
        const poster = document.createElement('img');
        poster.className = 'concert-poster';
        poster.loading = 'lazy';
        
        const fileId = concert.posterUrl.trim();
        const imageUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${CONFIG.API_KEY}`;
        
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
                document.body.style.overflow = 'hidden';
            }
        });

        poster.onerror = () => {
            console.error('Failed to load image:', concert.posterUrl);
            const placeholder = document.createElement('div');
            placeholder.className = 'concert-poster placeholder';
            placeholder.innerHTML = '<i class="fas fa-music"></i>';
            posterContainer.replaceChild(placeholder, poster);
        };
        
        posterContainer.appendChild(poster);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'concert-poster placeholder';
        placeholder.innerHTML = '<i class="fas fa-music"></i>';
        posterContainer.appendChild(placeholder);
    }
    
    // Create details container (bottom half)
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'concert-details-container';
    
    // Add concert details
    detailsContainer.innerHTML = `
        <h3 class="concert-title">${concert.title}</h3>
        <div class="concert-date">${formatDate(concert.date)} ${concert.time || ''}</div>
        ${concert.description ? `<div class="concert-description">${concert.description}</div>` : ''}
        <div class="concert-location">
            <i class="fas fa-map-marker-alt"></i> ${[concert.venue, concert.city].filter(Boolean).join(', ')}
        </div>
        ${concert.ticketLink && concert.ticketLink !== '#' ? 
            `<a href="${concert.ticketLink}" class="btn ticket-btn" target="_blank" rel="noopener">Get Tickets</a>` : ''}
    `;
    
    // Assemble the card
    card.appendChild(posterContainer);
    card.appendChild(detailsContainer);
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
    const instagramFeed = document.getElementById('instagram-feed');
    if (instagramFeed) {
        // Initial loading state
        instagramFeed.innerHTML = `
            <div class="instagram-feed">
                <h3>Instagram Feed</h3>
                <div class="loading">Loading Instagram posts...</div>
            </div>
        `;
        
        // This is a placeholder - replace with actual Instagram API implementation
        // You'll need to:
        // 1. Create a Meta Developer account at https://developers.facebook.com/
        // 2. Create a new app and add Instagram Basic Display
        // 3. Get an access token
        
        // Example of how to fetch Instagram posts (uncomment and replace with your actual implementation)
        /*
        const INSTAGRAM_ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';
        const INSTAGRAM_USER_ID = 'YOUR_USER_ID';
        
        fetch(`https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?fields=id,caption,media_url,permalink,media_type&access_token=${INSTAGRAM_ACCESS_TOKEN}`)
            .then(response => response.json())
            .then(data => {
                if (data.data && data.data.length > 0) {
                    const posts = data.data.slice(0, 6); // Show first 6 posts
                    let html = `
                        <div class="instagram-feed">
                            <h3>Latest from Instagram</h3>
                            <div class="instagram-posts">
                                ${posts.map(post => `
                                    <a href="${post.permalink}" target="_blank" class="instagram-post">
                                        <img src="${post.media_url}" alt="${post.caption || 'Instagram post'}" loading="lazy">
                                    </a>
                                `).join('')}
                            </div>
                            <p class="follow-link">
                                <a href="https://www.instagram.com/swaraum.band/" target="_blank" class="btn">
                                    <i class="fab fa-instagram"></i> Follow Us
                                </a>
                            </p>
                        </div>
                    `;
                    instagramFeed.innerHTML = html;
                } else {
                    showError(instagramFeed, 'No Instagram posts found.');
                }
            })
            .catch(error => {
                console.error('Error loading Instagram feed:', error);
                showError(instagramFeed, 'Unable to load Instagram feed. Please try again later.');
            });
        */
        
        // For now, show a link to the Instagram profile
        instagramFeed.innerHTML = `
            <div class="instagram-feed">
                <h3>Follow Us on Instagram</h3>
                <div class="instagram-placeholder">
                    <i class="fab fa-instagram"></i>
                    <p>Check out our latest posts on Instagram</p>
                    <a href="https://www.instagram.com/swaraum.band/" target="_blank" class="btn">
                        <i class="fab fa-instagram"></i> @swaraum.band
                    </a>
                </div>
            </div>
        `;
    }
    
    // YouTube Feed
    const youtubeFeed = document.getElementById('youtube-feed');
    if (youtubeFeed) {
        // Initial loading state
        youtubeFeed.innerHTML = `
            <div class="youtube-feed">
                <h3>YouTube Channel</h3>
                <div class="loading">Loading latest videos...</div>
            </div>
        `;
        
        // This is a placeholder - replace with actual YouTube Data API implementation
        // You'll need to:
        // 1. Enable YouTube Data API v3 in Google Cloud Console
        // 2. Create API credentials
        // 3. Replace YOUTUBE_API_KEY with your actual API key
        // 4. Replace CHANNEL_ID with your channel ID
        
        /*
        const YOUTUBE_API_KEY = 'YOUR_API_KEY';
        const CHANNEL_ID = 'UCYOUR_CHANNEL_ID'; // Replace with SwarAum's channel ID
        
        // Fetch latest videos from the channel
        fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=3`)
            .then(response => response.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    const videos = data.items.filter(item => item.id.kind === 'youtube#video');
                    let html = `
                        <div class="youtube-feed">
                            <h3>Latest Videos</h3>
                            <div class="youtube-videos">
                                ${videos.map(video => `
                                    <div class="youtube-video">
                                        <div class="video-container">
                                            <iframe 
                                                width="100%" 
                                                height="200" 
                                                src="https://www.youtube.com/embed/${video.id.videoId}" 
                                                frameborder="0" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowfullscreen>
                                            </iframe>
                                        </div>
                                        <h4>${video.snippet.title}</h4>
                                        <p class="video-description">${video.snippet.description.substring(0, 100)}...</p>
                                    </div>
                                `).join('')}
                            </div>
                            <p class="subscribe-link">
                                <a href="https://www.youtube.com/@SwarAum" target="_blank" class="btn">
                                    <i class="fab fa-youtube"></i> Subscribe to Our Channel
                                </a>
                            </p>
                        </div>
                    `;
                    youtubeFeed.innerHTML = html;
                } else {
                    showError(youtubeFeed, 'No videos found on the channel.');
                }
            })
            .catch(error => {
                console.error('Error loading YouTube feed:', error);
                showError(youtubeFeed, 'Unable to load YouTube videos. Please try again later.');
            });
        */
        
        // For now, show a direct link to the YouTube channel
        youtubeFeed.innerHTML = `
            <div class="youtube-feed">
                <h3>Our YouTube Channel</h3>
                <div class="youtube-placeholder">
                    <i class="fab fa-youtube"></i>
                    <p>Check out our latest performances and videos on YouTube</p>
                    <a href="https://www.youtube.com/@SwarAum" target="_blank" class="btn">
                        <i class="fab fa-youtube"></i> @SwarAum
                    </a>
                </div>
            </div>
        `;
    }
}

// Lazy load images
function lazyLoadImages() {
    // Handle both data-src and lazy-loaded images
    const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    
    // For band member avatars, we'll handle them separately since we're already managing their loading
    const bandMemberAvatars = document.querySelectorAll('.band-member img');
    
    // Only observe non-band-member images
    const nonBandMemberImages = Array.from(lazyImages).filter(img => !img.closest('.band-member'));
    
    if (nonBandMemberImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    } else if (img.loading === 'lazy') {
                        img.loading = 'eager';
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px',
            threshold: 0.01
        });
        
        nonBandMemberImages.forEach(img => {
            if (!img.complete && img.src) {
                img.onload = () => imageObserver.unobserve(img);
                img.onerror = () => imageObserver.unobserve(img);
            }
            imageObserver.observe(img);
        });
    }
    
    // For band member avatars, ensure they're visible
    bandMemberAvatars.forEach(img => {
        if (img.loading === 'lazy') {
            img.loading = 'eager';
        }
    });
}

// Load band members from Google Sheets
function loadBandMembers() {
    const membersContainer = document.getElementById('band-members');
    if (!membersContainer) return;

    // Use the same config as concerts for now, but you might want to use a different sheet
    const { API_KEY: apiKey, SHEET_ID: spreadsheetId } = CONFIG;
    const range = 'BandMembers!A2:C'; // Assuming BandMembers sheet with columns: name, skill, profile_pic
    
    if (!apiKey || !spreadsheetId) {
        membersContainer.innerHTML = '<p>Error loading band members. Configuration missing.</p>';
        return;
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.values || data.values.length === 0) {
                membersContainer.innerHTML = '<p>No band members found.</p>';
                return;
            }
            
            membersContainer.innerHTML = ''; // Clear loading message
            
            data.values.forEach(memberData => {
                const [name, skill, profilePic] = memberData;
                
                const memberElement = document.createElement('div');
                memberElement.className = 'band-member';
                
                const avatar = document.createElement('img');
                avatar.className = 'member-avatar';
                avatar.alt = name;
                
                // Set a placeholder initially
                const placeholder = 'images/default-avatar.png';
                
                if (profilePic && profilePic.trim()) {
                    const fileId = profilePic.trim();
                    const imageUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${CONFIG.API_KEY}`;
                    
                    console.log(`Loading profile image for ${name}:`, imageUrl);
                    
                    // Set placeholder first
                    avatar.src = placeholder;
                    
                    // Set the actual image source
                    avatar.src = imageUrl;
                    
                    // Handle image loading errors
                    avatar.onerror = () => {
                        console.error(`Failed to load profile image for ${name}`);
                        avatar.src = placeholder;
                    };
                } else {
                    avatar.src = placeholder;
                }
                
                // Set loading to eager to ensure images load immediately
                avatar.loading = 'eager';
                
                // Create the info overlay
                const info = document.createElement('div');
                info.className = 'member-info';
                info.innerHTML = `
                    <div class="member-name">${name}</div>
                    <div class="member-skill">${skill}</div>
                `;
                
                memberElement.appendChild(avatar);
                memberElement.appendChild(info);
                membersContainer.appendChild(memberElement);
            });
        })
        .catch(error => {
            console.error('Error loading band members:', error);
            membersContainer.innerHTML = '<p>Error loading band members. Please try again later.</p>';
        });
}

// Initialize lazy loading when the page loads
window.addEventListener('load', function() {
    lazyLoadImages();
    loadBandMembers(); // Load band members when page loads
});
