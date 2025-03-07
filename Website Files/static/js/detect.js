document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    const uploadBox = document.getElementById('uploadBox');
    const videoInput = document.getElementById('videoInput');
    const videoPreview = document.getElementById('videoPreview');
    const previewPlayer = document.getElementById('previewPlayer');
    const removeVideo = document.getElementById('removeVideo');
    const startDetection = document.getElementById('startDetection');
    const detectionProgress = document.getElementById('detectionProgress');
    const detectionResults = document.getElementById('detectionResults');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('progressText');
    const currentTask = document.getElementById('currentTask');
    const dragOverlay = document.querySelector('.drag-overlay');
    
    let dragCounter = 0;

    // Drag and drop functionality
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDragEnter(e) {
        preventDefaults(e);
        dragCounter++;
        if (dragCounter === 1) {
            dragOverlay.classList.add('active');
            uploadBox.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        preventDefaults(e);
        dragCounter--;
        if (dragCounter === 0) {
            dragOverlay.classList.remove('active');
            uploadBox.classList.remove('drag-over');
        }
    }

    function handleDragOver(e) {
        preventDefaults(e);
        if (!uploadBox.classList.contains('drag-over')) {
            uploadBox.classList.add('drag-over');
        }
    }

    function handleDrop(e) {
        preventDefaults(e);
        dragCounter = 0;
        dragOverlay.classList.remove('active');
        uploadBox.classList.remove('drag-over');
        
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Add event listeners for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    document.body.addEventListener('dragenter', handleDragEnter, false);
    document.body.addEventListener('dragleave', handleDragLeave, false);
    uploadBox.addEventListener('dragover', handleDragOver, false);
    uploadBox.addEventListener('drop', handleDrop, false);

    // Click to upload
    uploadBox.addEventListener('click', () => {
        videoInput.click();
    });

    videoInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        if (!file.type.startsWith('video/')) {
            showError('Please upload a video file');
            return;
        }

        // Check file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
            showError('Please upload a video smaller than 100MB');
            return;
        }

        const url = URL.createObjectURL(file);
        previewPlayer.src = url;
        
        // Show loading state
        const progressBar = document.createElement('div');
        progressBar.className = 'upload-progress';
        uploadBox.appendChild(progressBar);

        previewPlayer.onloadedmetadata = () => {
            // Check video duration (max 5 minutes)
            if (previewPlayer.duration > 300) {
                showError('Please upload a video shorter than 5 minutes');
                previewPlayer.src = '';
                progressBar.remove();
                return;
            }
            
            // Animate progress bar
            progressBar.style.width = '100%';
            setTimeout(() => {
                uploadBox.style.display = 'none';
                videoPreview.style.display = 'block';
                progressBar.remove();
            }, 500);
        };

        previewPlayer.onerror = () => {
            showError('Error loading video. Please try another file.');
            previewPlayer.src = '';
            progressBar.remove();
        };
    }

    function showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();

        const error = document.createElement('div');
        error.className = 'error-message';
        error.style.cssText = `
            color: #dc3545;
            margin-top: 1rem;
            font-size: 0.9rem;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        `;
        error.textContent = message;
        uploadBox.appendChild(error);

        // Trigger animation
        setTimeout(() => {
            error.style.opacity = '1';
            error.style.transform = 'translateY(0)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            error.style.opacity = '0';
            error.style.transform = 'translateY(-10px)';
            setTimeout(() => error.remove(), 300);
        }, 3000);
    }

    // Remove video
    removeVideo.addEventListener('click', () => {
        previewPlayer.src = '';
        uploadBox.style.display = 'block';
        videoPreview.style.display = 'none';
        detectionProgress.style.display = 'none';
        detectionResults.style.display = 'none';
    });

    // Start detection
    startDetection.addEventListener('click', () => {
        videoPreview.style.display = 'none';
        detectionProgress.style.display = 'block';
        simulateDetection();
    });

    // Simulate detection process
    function simulateDetection() {
        let progress = 0;
        const tasks = [
            'Initializing AI model...',
            'Analyzing video frames...',
            'Detecting potential accidents...',
            'Processing results...',
            'Generating report...'
        ];
        
        const interval = setInterval(() => {
            progress += 1;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
            
            const taskIndex = Math.floor((progress / 100) * tasks.length);
            if (taskIndex < tasks.length) {
                currentTask.textContent = tasks[taskIndex];
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    detectionProgress.style.display = 'none';
                    detectionResults.style.display = 'block';
                    updateAnalytics();
                }, 500);
            }
        }, 50);
    }

    // Update analytics
    function updateAnalytics() {
        // Update confidence meter
        const meterValue = document.querySelector('.meter-value');
        const confidenceValue = document.querySelector('.confidence-value');
        const confidence = 87; // Example value
        
        meterValue.style.strokeDashoffset = 283 - (283 * confidence / 100);
        confidenceValue.textContent = `${confidence}%`;
        
        // Update stats
        document.querySelectorAll('.stat-value').forEach((stat, index) => {
            const values = ['3', '1.2s', '1500', '87%'];
            stat.textContent = values[index];
        });
        
        // Initialize trends chart
        const ctx = document.getElementById('trendsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Detection Accuracy',
                    data: [85, 88, 87, 90, 87, 92],
                    borderColor: '#4CAF50',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

    }
});
