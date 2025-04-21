document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar-custom');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.padding = '15px 0';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // Form validation
    const form = document.getElementById('form');
    const firstname_input = document.getElementById('firstname-input');
    const email_input = document.getElementById('email-input');
    const password_input = document.getElementById('password-input');
    const repeat_password_input = document.getElementById('repeat-password-input');
    const error_message = document.getElementById('error-message');
    const terms_checkbox = document.getElementById('terms-checkbox');
    
    // Initialize password strength meter if on signup page
    if (password_input && repeat_password_input) {
        const passwordStrengthDiv = document.querySelector('.password-strength');
        const progressBar = document.querySelector('.progress-bar');
        const strengthText = document.querySelector('.strength-text');
        
        password_input.addEventListener('input', function() {
            const password = password_input.value;
            
            if (password.length > 0) {
                passwordStrengthDiv.classList.remove('d-none');
                
                // Calculate password strength
                const strength = calculatePasswordStrength(password);
                
                // Update progress bar
                progressBar.style.width = `${strength.score * 25}%`;
                progressBar.className = 'progress-bar';
                
                if (strength.score <= 1) {
                    progressBar.classList.add('weak');
                    strengthText.textContent = 'Weak password';
                } else if (strength.score <= 3) {
                    progressBar.classList.add('medium');
                    strengthText.textContent = 'Medium password';
                } else {
                    progressBar.classList.add('strong');
                    strengthText.textContent = 'Strong password';
                }
            } else {
                passwordStrengthDiv.classList.add('d-none');
            }
        });
    }
    
    // Real-time validation for email
    if (email_input) {
        email_input.addEventListener('blur', function() {
            validateEmail(email_input);
        });
    }
    
    // Real-time validation for password match
    if (repeat_password_input) {
        repeat_password_input.addEventListener('input', function() {
            if (password_input.value !== repeat_password_input.value) {
                repeat_password_input.classList.add('is-invalid');
            } else {
                repeat_password_input.classList.remove('is-invalid');
            }
        });
    }
    
    // Form submission handler
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset validation state
            resetValidationState();
            
            let errors = [];
            
            // Check if we're on signup or login page
            if (firstname_input) {
                errors = getSignupFormErrors(
                    firstname_input.value,
                    email_input.value,
                    password_input.value,
                    repeat_password_input.value,
                    terms_checkbox ? terms_checkbox.checked : true
                );
            } else {
                errors = getLoginFormErrors(
                    email_input.value,
                    password_input.value
                );
            }
            
            if (errors.length > 0) {
                // Show error message
                error_message.classList.remove('d-none');
                error_message.innerText = errors.join(". ");
            } else {
                // Hide error message and submit form
                error_message.classList.add('d-none');
                
                // Here you would typically submit the form or handle AJAX submission
                // For this example, we'll just log success
                console.log('Form submitted successfully');
                
                // Simulating form submission
                alert('Form validated successfully! Ready to submit.');
                // form.submit(); // Uncomment this line to actually submit the form
            }
        });
    }
    
    // Reset validation state on input
    const allInputs = [firstname_input, email_input, password_input, repeat_password_input].filter(input => input != null);
    allInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                input.classList.remove('is-invalid');
                if (error_message) {
                    error_message.classList.add('d-none');
                }
            });
        }
    });
    
    // Terms checkbox validation
    if (terms_checkbox) {
        terms_checkbox.addEventListener('change', function() {
            if (terms_checkbox.checked) {
                terms_checkbox.classList.remove('is-invalid');
            } else {
                terms_checkbox.classList.add('is-invalid');
            }
        });
    }
    
    // Validation functions
    function getSignupFormErrors(firstname, email, password, repeatPassword, termsAccepted) {
        let errors = [];
        
        // Validate name
        if (!firstname || !firstname.trim()) {
            errors.push('Name is required');
            firstname_input.classList.add('is-invalid');
        } else if (firstname.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
            firstname_input.classList.add('is-invalid');
        }
        
        // Validate email
        const emailErrors = validateEmail(email_input);
        if (emailErrors) {
            errors.push(emailErrors);
        }
        
        // Validate password
        if (!password) {
            errors.push('Password is required');
            password_input.classList.add('is-invalid');
        } else if (password.length < 8) {
            errors.push('Password must be at least 8 characters');
            password_input.classList.add('is-invalid');
        } else {
            const strength = calculatePasswordStrength(password);
            if (strength.score < 2) {
                errors.push('Password is too weak. Include uppercase, lowercase, numbers, and special characters');
                password_input.classList.add('is-invalid');
            }
        }
        
        // Validate password confirmation
        if (!repeatPassword) {
            errors.push('Password confirmation is required');
            repeat_password_input.classList.add('is-invalid');
        } else if (password !== repeatPassword) {
            errors.push('Passwords do not match');
            repeat_password_input.classList.add('is-invalid');
        }
        
        // Validate terms acceptance
        if (!termsAccepted) {
            errors.push('You must accept the Terms of Service and Privacy Policy');
            terms_checkbox.classList.add('is-invalid');
        }
        
        return errors;
    }
    
    function getLoginFormErrors(email, password) {
        let errors = [];
        
        // Validate email
        const emailErrors = validateEmail(email_input);
        if (emailErrors) {
            errors.push(emailErrors);
        }
        
        // Validate password
        if (!password) {
            errors.push('Password is required');
            password_input.classList.add('is-invalid');
        }
        
        return errors;
    }
    
    function validateEmail(emailInput) {
        const email = emailInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            emailInput.classList.add('is-invalid');
            return 'Email is required';
        } else if (!emailRegex.test(email)) {
            emailInput.classList.add('is-invalid');
            return 'Please enter a valid email address';
        }
        
        return null;
    }
    
    function calculatePasswordStrength(password) {
        let score = 0;
        
        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Complexity checks
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        // Return score out of 5
        return {
            score: Math.min(score, 4)
        };
    }
    
    function resetValidationState() {
        if (allInputs.length > 0) {
            allInputs.forEach(input => {
                if (input) {
                    input.classList.remove('is-invalid');
                }
            });
        }
        
        if (terms_checkbox) {
            terms_checkbox.classList.remove('is-invalid');
        }
        
        if (error_message) {
            error_message.classList.add('d-none');
        }
    }
});