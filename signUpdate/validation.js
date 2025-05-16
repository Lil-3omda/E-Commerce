document.addEventListener('DOMContentLoaded', function() {
    
    const form = document.getElementById('form');
    const firstname_input = document.getElementById('firstname-input');
    const email_input = document.getElementById('email-input');
    const password_input = document.getElementById('password-input');
    const repeat_password_input = document.getElementById('repeat-password-input');
    const error_message = document.getElementById('error-message');
    const terms_checkbox = document.getElementById('terms-checkbox');
    
    if (password_input && repeat_password_input) {
        const passwordStrengthDiv = document.querySelector('.password-strength');
        const progressBar = document.querySelector('.progress-bar');
        const strengthText = document.querySelector('.strength-text');
        
        password_input.addEventListener('input', function() {
            const password = password_input.value;
            
            if (password.length > 0) {
                passwordStrengthDiv.classList.remove('d-none');
                
                const strength = calculatePasswordStrength(password);
                
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

    if (email_input) {
        email_input.addEventListener('blur', function() {
            validateEmail(email_input);
        });
    }
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            resetValidationState();
            
            let errors = [];
            
            if (firstname_input) {
                errors = getSignupFormErrors(
                    firstname_input.value,
                    email_input.value,
                    password_input.value,
                    repeat_password_input.value,
                    terms_checkbox ? terms_checkbox.checked : true
                );
                if (errors.length > 0) {
                    error_message.classList.remove('d-none');
                    error_message.innerText = errors.join(". ");
                } else {
                    error_message.classList.add('d-none');
                    addUser(sanitizeInput(firstname_input.value),sanitizeInput(email_input.value), password_input.value);
                }
            } else {
                errors = getLoginFormErrors(
                    email_input.value,
                    password_input.value
                );
                if (errors.length > 0) {
                    error_message.classList.remove('d-none');
                    error_message.innerText = errors.join(". ");
                } else {
                    error_message.classList.add('d-none');
                    checkUserRole(email_input.value,password_input.value);
                }            
            }
        });
    }
    
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
    
    if (terms_checkbox) {
        terms_checkbox.addEventListener('change', function() {
            if (terms_checkbox.checked) {
                terms_checkbox.classList.remove('is-invalid');
            } else {
                terms_checkbox.classList.add('is-invalid');
            }
        });
    }
    
    function getSignupFormErrors(firstname, email, password, repeatPassword, termsAccepted) {
        let errors = [];
        
        if (!firstname || !firstname.trim()) {
            errors.push('Name is required');
            firstname_input.classList.add('is-invalid');
        } else if (firstname.trim().length < 3) {
            errors.push('Name must be at least 3 characters');
            firstname_input.classList.add('is-invalid');
        }
        
        const emailErrors = validateEmail(email_input);
        if (emailErrors) {
            errors.push(emailErrors);
        }
        
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
        
        if (!repeatPassword) {
            errors.push('Password confirmation is required');
            repeat_password_input.classList.add('is-invalid');
        } else if (password !== repeatPassword) {
            errors.push('Passwords do not match');
            repeat_password_input.classList.add('is-invalid');
        }
        
        if (!termsAccepted) {
            errors.push('You must accept the Terms of Service and Privacy Policy');
            terms_checkbox.classList.add('is-invalid');
        }
        
        return errors;
    }
    
    function getLoginFormErrors(email, password) {
        let errors = [];
        
        const emailErrors = validateEmail(email_input);
        if (emailErrors) {
            errors.push(emailErrors);
        }
        
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
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
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
    async function checkUserRole(email, password) {
        const users = JSON.parse(localStorage.getItem('userData'));
        if (!users.admin || !Array.isArray(users.admin) || !users.sellers || !Array.isArray(users.sellers) || !users.customers || !Array.isArray(users.customers)) {
            error_message.classList.remove('d-none');
            error_message.innerText = 'Invalid user data format.';
            return;
        }
        const allUsers = [...users.admin, ...users.sellers, ...users.customers];
        const user = allUsers.find(u => u.email === email);
        if (!user) {
            error_message.classList.remove('d-none');
            error_message.innerText = 'Email or Password is Wrong';
            return;
        }    
        const hashedInputPassword = await hashPassword(password);
        if (user.password !== hashedInputPassword) {
            error_message.classList.remove('d-none');
            error_message.innerText = 'Email Or Password is Wrong';
            return;
        }
        sessionStorage.setItem('loggedInUserId', user.id);
        sessionStorage.setItem('loggedInUserRole', user.role);
        sessionStorage.setItem('loggedInUserStatus', user.status);
        const baseUrl = window.location.origin;

        if (user.role === 'admin') {
            window.location.href = `${baseUrl}/admin/admin.html`;
        } else if (user.role === 'seller') {
            window.location.href = `${baseUrl}/seller/homePage.html`;
        } else {
            window.location.href = `${baseUrl}/homePage.html`;
        }

    }
    async function addUser(fullname, email, password) {
        let userData = JSON.parse(localStorage.getItem('userData')) || {admin: [], customers: [], sellers: []};
        const allUsers = [...userData.admin, ...userData.customers, ...userData.sellers];

        const existingUser = allUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            error_message.classList.remove('d-none');
            error_message.innerText = 'Email already exists. Please use a different email.';
            return;
        }
        let customers = userData.customers || [];
        const hashedPassword = await hashPassword(password);
        let newCustomer = {
            id: customers.length > 0 ? customers[customers.length - 1].id + 1 : 1,
            name: fullname,
            email: email,
            password: hashedPassword,
            role: "customer",
            address: "",
            status: "disabled",          
            order_history: [],
        };
    
        customers.push(newCustomer);
        userData.customers = customers;
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log("User added successfully!");
        window.location.href = "login.html";
    }
    function sanitizeInput(str) {
        return str.replace(/[&<>"'`=\/]/g, function (s) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '`': '&#x60;',
                '=': '&#x3D;',
                '/': '&#x2F;'
            })[s];
        });
    }
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

});