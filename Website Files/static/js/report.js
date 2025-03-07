document.addEventListener('DOMContentLoaded', () => {
    // Initialize Mapbox
    mapboxgl.accessToken = 'pk.eyJ1IjoicHVzaHRpdXd1IiwiYSI6ImNtNXBkbjNsNTAwMW0ycG9lYWprZWdnNHQifQ.N3zCDGKkcQBKEaMkfbFqOg'; // Replace with your token
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [78.9629, 20.5937], // India center coordinates
        zoom: 4
    });

    // Add map controls
    map.addControl(new mapboxgl.NavigationControl());
    
    let marker;
    let selectedLocation = null;

    // Handle map clicks
    map.on('click', (e) => {
        if (marker) marker.remove();
        marker = new mapboxgl.Marker()
            .setLngLat(e.lngLat)
            .addTo(map);
        selectedLocation = e.lngLat;
    });

    // Current location button
    document.getElementById('useCurrentLocation').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                if (marker) marker.remove();
                marker = new mapboxgl.Marker()
                    .setLngLat([longitude, latitude])
                    .addTo(map);
                map.flyTo({
                    center: [longitude, latitude],
                    zoom: 14
                });
                selectedLocation = { lat: latitude, lng: longitude };
            }, () => {
                alert('Error getting your location. Please enable location services.');
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });

    // Media upload handling
    const mediaUpload = document.getElementById('mediaUpload');
    const mediaInput = document.getElementById('mediaInput');
    const mediaPreview = document.getElementById('mediaPreview');
    let uploadedFiles = [];

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        mediaUpload.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        mediaUpload.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        mediaUpload.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        mediaUpload.classList.add('drag-over');
    }

    function unhighlight() {
        mediaUpload.classList.remove('drag-over');
    }

    mediaUpload.addEventListener('drop', handleDrop);
    mediaUpload.addEventListener('click', () => mediaInput.click());
    mediaInput.addEventListener('change', (e) => handleFiles(e.target.files));

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
            const maxSize = 20 * 1024 * 1024; // 20MB
            if (!validTypes.includes(file.type)) {
                alert('Please upload only JPG, PNG, or MP4 files.');
                return false;
            }
            if (file.size > maxSize) {
                alert('File size should not exceed 20MB.');
                return false;
            }
            return true;
        });

        validFiles.forEach(file => {
            uploadedFiles.push(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'col-auto media-item';
                if (file.type.startsWith('image/')) {
                    div.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="remove-btn" onclick="removeMedia(this)">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                } else {
                    div.innerHTML = `
                        <video src="${e.target.result}" controls></video>
                        <button type="button" class="remove-btn" onclick="removeMedia(this)">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                }
                mediaPreview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }

    // Remove media item
    window.removeMedia = function(button) {
        const item = button.parentElement;
        const index = Array.from(mediaPreview.children).indexOf(item);
        uploadedFiles.splice(index, 1);
        item.remove();
    };

    // Form submission
    const form = document.getElementById('hazardReportForm');
    const submitBtn = form.querySelector('.btn-submit');
    const submitText = submitBtn.querySelector('.submit-text');
    const submitLoader = submitBtn.querySelector('.submit-loader');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!selectedLocation) {
            alert('Please select a location on the map.');
            return;
        }

        // Show loading state
        submitText.classList.add('d-none');
        submitLoader.classList.remove('d-none');
        submitBtn.disabled = true;

        // Prepare form data
        const formData = new FormData();
        formData.append('location', JSON.stringify(selectedLocation));
        formData.append('hazardType', document.getElementById('hazardType').value);
        formData.append('severity', document.querySelector('input[name="severity"]:checked').value);
        formData.append('description', document.getElementById('description').value);
        uploadedFiles.forEach(file => formData.append('media[]', file));

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            successModal.show();
            
            // Reset form
            form.reset();
            if (marker) marker.remove();
            selectedLocation = null;
            uploadedFiles = [];
            mediaPreview.innerHTML = '';
            
        } catch (error) {
            alert('Error submitting report. Please try again.');
        } finally {
            // Reset button state
            submitText.classList.remove('d-none');
            submitLoader.classList.add('d-none');
            submitBtn.disabled = false;
        }
    });
});
