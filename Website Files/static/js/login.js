document.addEventListener('DOMContentLoaded', () => {
    // Form switching
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    });

    // Password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Input animation
    document.querySelectorAll('.floating-input input').forEach(input => {
        // Set initial state
        if (input.value) {
            input.classList.add('has-value');
        }

        // Add focus animation
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        // Remove focus animation if empty
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            if (!input.value) {
                input.classList.remove('has-value');
            }
        });

        // Handle input changes
        input.addEventListener('input', () => {
            if (input.value) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
    });

    // Form validation
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    // Login form submission
    document.querySelector('#login-form form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        let isValid = true;
        
        if (!validateEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!validatePassword(password)) {
            showError('password', 'Password must be at least 8 characters long');
            isValid = false;
        }
        
        if (isValid) {
            // Here you would typically make an API call to your backend
            console.log('Login form submitted:', { email, password });
            showSuccess('Successfully logged in!');
        }
    });

    // Signup form submission
    document.querySelector('#signup-form form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        let isValid = true;
        
        if (!fullname) {
            showError('fullname', 'Please enter your full name');
            isValid = false;
        }
        
        if (!validateEmail(email)) {
            showError('signup-email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!validatePassword(password)) {
            showError('signup-password', 'Password must be at least 8 characters long');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            showError('confirm-password', 'Passwords do not match');
            isValid = false;
        }
        
        if (isValid) {
            // Here you would typically make an API call to your backend
            console.log('Signup form submitted:', { fullname, email, password });
            showSuccess('Account created successfully!');
        }
    });

    // Error handling
    const showError = (inputId, message) => {
        const input = document.getElementById(inputId);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Remove any existing error message
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        input.parentElement.appendChild(errorDiv);
        input.classList.add('error');
        
        // Remove error after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
            input.classList.remove('error');
        }, 3000);
    };

    // Success message
    const showSuccess = (message) => {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        document.querySelector('.form-wrapper.active').appendChild(successDiv);
        
        // Remove success message after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    };

    // Social login handlers
    document.querySelectorAll('.social-button').forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.classList[1];
            console.log(`Initiating ${provider} login...`);
            // Here you would implement the social login logic
        });
    });
});
