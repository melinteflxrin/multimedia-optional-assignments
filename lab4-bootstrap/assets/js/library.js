// Exercise 1: Load and display albums dynamically
let albums = [];
let filteredAlbums = [];

// Load albums from JSON
async function loadAlbums() {
    try {
        const response = await fetch('assets/data/library.json');
        albums = await response.json();
        filteredAlbums = [...albums];
        displayAlbums(filteredAlbums);
    } catch (error) {
        console.error('Error loading albums:', error);
        document.getElementById('albumsRow').innerHTML = 
            '<div class="col-12"><div class="alert alert-danger">Error loading albums. Please try again.</div></div>';
    }
}

// Exercise 1: Display albums dynamically
function displayAlbums(albumsToDisplay) {
    const albumsRow = document.getElementById('albumsRow');
    albumsRow.innerHTML = '';

    if (albumsToDisplay.length === 0) {
        albumsRow.innerHTML = '<div class="col-12"><div class="alert alert-info text-center">No albums found matching your search.</div></div>';
        return;
    }

    albumsToDisplay.forEach(album => {
        const col = document.createElement('div');
        col.className = 'col-xl-2 col-md-3 col-sm-6 col-12 mb-4';
        
        col.innerHTML = `
            <div class="card album-card h-100">
                <div class="card-img-container">
                    <img src="assets/img/${album.thumbnail}" class="card-img-top" alt="${album.album}">
                    <div class="card-img-overlay">
                        <h6>${album.album}</h6>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${album.artist}</h5>
                    <p class="card-text">${album.album}</p>
                </div>
                <div class="card-footer">
                    <button type="button" class="btn btn-primary btn-view-tracklist" 
                            data-album-id="${album.id}">
                        View Tracklist
                    </button>
                </div>
            </div>
        `;
        
        albumsRow.appendChild(col);
    });

    // Exercise 2: Make all cards open the modal
    attachModalEventListeners();
}

// Exercise 2: Attach event listeners to all buttons
function attachModalEventListeners() {
    const buttons = document.querySelectorAll('.btn-view-tracklist');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const albumId = parseInt(this.getAttribute('data-album-id'));
            const album = albums.find(a => a.id === albumId);
            if (album) {
                displayAlbumInModal(album);
            }
        });
    });
}

// Exercise 9: Helper function to convert time string to seconds
function timeToSeconds(timeStr) {
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// Exercise 9: Helper function to convert seconds to time string
function secondsToTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Exercise 9: Calculate track statistics
function calculateStatistics(tracklist) {
    const totalTracks = tracklist.length;
    const totalSeconds = tracklist.reduce((sum, track) => sum + timeToSeconds(track.trackLength), 0);
    const averageSeconds = Math.round(totalSeconds / totalTracks);
    
    const trackLengths = tracklist.map(track => ({
        title: track.title,
        seconds: timeToSeconds(track.trackLength)
    }));
    
    const longest = trackLengths.reduce((max, track) => track.seconds > max.seconds ? track : max);
    const shortest = trackLengths.reduce((min, track) => track.seconds < min.seconds ? track : min);
    
    return {
        totalTracks,
        totalDuration: secondsToTime(totalSeconds),
        averageDuration: secondsToTime(averageSeconds),
        longestTrack: longest,
        shortestTrack: shortest
    };
}

// Exercise 3, 4, 9: Display album-specific content in modal
function displayAlbumInModal(album) {
    // Set modal title
    document.getElementById('modalTitle').textContent = `${album.artist} - ${album.album}`;
    
    // Calculate statistics
    const stats = calculateStatistics(album.tracklist);
    
    // Build modal body with statistics and tracklist
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="track-statistics">
            <h6><i class="bi bi-bar-chart-fill"></i> Album Statistics</h6>
            <div class="stat-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Tracks</span>
                    <span class="stat-value">${stats.totalTracks}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Duration</span>
                    <span class="stat-value">${stats.totalDuration}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Average Length</span>
                    <span class="stat-value">${stats.averageDuration}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Tracks</span>
                    <span class="stat-value">${stats.totalTracks}</span>
                </div>
            </div>
            <div class="mt-3">
                <small class="text-muted">
                    <strong>Longest:</strong> ${stats.longestTrack.title} (${secondsToTime(stats.longestTrack.seconds)})<br>
                    <strong>Shortest:</strong> ${stats.shortestTrack.title} (${secondsToTime(stats.shortestTrack.seconds)})
                </small>
            </div>
        </div>
        
        <table class="table table-hover tracklist-table">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Track Title</th>
                    <th scope="col">Length</th>
                </tr>
            </thead>
            <tbody>
                ${album.tracklist.map(track => `
                    <tr>
                        <td>${track.number}</td>
                        <td>
                            <a href="${track.url}" target="_blank" class="track-link" rel="noopener noreferrer">
                                <i class="bi bi-spotify spotify-icon"></i>${track.title}
                            </a>
                        </td>
                        <td>${track.trackLength}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    // Exercise 5: Update footer with first track link
    const playOnSpotifyBtn = document.getElementById('playOnSpotify');
    playOnSpotifyBtn.onclick = () => {
        window.open(album.tracklist[0].url, '_blank');
    };
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('albumModal'));
    modal.show();
}

// Exercise 6: Search/filter feature
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredAlbums = [...albums];
        } else {
            filteredAlbums = albums.filter(album => 
                album.artist.toLowerCase().includes(searchTerm) ||
                album.album.toLowerCase().includes(searchTerm)
            );
        }
        
        displayAlbums(filteredAlbums);
    });
}

// Exercise 8: Sort albums functionality
function setupSort() {
    document.getElementById('sortArtist').addEventListener('click', function() {
        filteredAlbums.sort((a, b) => a.artist.localeCompare(b.artist));
        displayAlbums(filteredAlbums);
        updateActiveSort(this);
    });
    
    document.getElementById('sortAlbum').addEventListener('click', function() {
        filteredAlbums.sort((a, b) => a.album.localeCompare(b.album));
        displayAlbums(filteredAlbums);
        updateActiveSort(this);
    });
    
    document.getElementById('sortTracks').addEventListener('click', function() {
        filteredAlbums.sort((a, b) => a.tracklist.length - b.tracklist.length);
        displayAlbums(filteredAlbums);
        updateActiveSort(this);
    });
    
    document.getElementById('sortTracksDesc').addEventListener('click', function() {
        filteredAlbums.sort((a, b) => b.tracklist.length - a.tracklist.length);
        displayAlbums(filteredAlbums);
        updateActiveSort(this);
    });
}

function updateActiveSort(activeButton) {
    document.querySelectorAll('.sort-section .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeButton.classList.add('active');
}

// Exercise 10: Back to top button
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadAlbums();
    setupSearch();
    setupSort();
    setupBackToTop();
});
