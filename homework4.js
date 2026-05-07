

// Initialize Homework 4 on page load
window.onload = function() {
    initHomework4();
    updateDate();
};

function initHomework4() {
    // 1. Fetch States list (Fetch API Requirement)
    fetchStates();

    // 2. Handle Cookies & Greetings (Cookie Requirement)
    handleReturningUser();

    // 3. Set up Local Storage listeners (Local Storage Requirement)
    setupLocalStorageListeners();
}

// ============================================================
// FETCH API: Load States dynamically
// ============================================================
function fetchStates() {
    const stateSelect = document.getElementById('state');
    fetch('states.html')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            stateSelect.innerHTML = data;
            // After loading states, try to load from local storage
            loadFromLocalStorage();
        })
        .catch(error => {
            console.error('Fetch error:', error);
            stateSelect.innerHTML = '<option value="">Error loading states</option>';
        });
}

// ============================================================
// COOKIE MANAGEMENT: Tracking First Name
// ============================================================
function setCookie(cname, cvalue, hours) {
    const d = new Date();
    d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function handleReturningUser() {
    const firstName = getCookie("firstName");
    const greetingMsg = document.getElementById('greeting-msg');
    const notUserContainer = document.getElementById('not-user-container');
    const cookieNameSpan = document.getElementById('cookie-name-span');
    const notUserCheck = document.getElementById('not-user-check');

    if (firstName != "") {
        greetingMsg.innerText = "Welcome back, " + firstName;
        cookieNameSpan.innerText = firstName;
        notUserContainer.style.display = "block";
        
        // Fill first name box if cookie exists (Requirement)
        document.getElementById('fname').value = firstName;
    } else {
        greetingMsg.innerText = "Welcome New user";
        notUserContainer.style.display = "none";
    }

    // Listener for "Not you?" start over logic
    notUserCheck.addEventListener('change', function() {
        if (this.checked) {
            if (confirm("Would you like to start over as a new user? This will clear all saved data.")) {
                deleteCookie("firstName");
                clearLocalStorage();
                document.getElementById('patient-form').reset();
                location.reload(); // Refresh to reset state
            } else {
                this.checked = false;
            }
        }
    });
}

// ============================================================
// LOCAL STORAGE: Saving form state
// ============================================================
function setupLocalStorageListeners() {
    const fields = document.querySelectorAll('.save-local');
    fields.forEach(field => {
        // Save on blur or change
        field.addEventListener('blur', () => saveFieldToLocal(field));
        field.addEventListener('change', () => saveFieldToLocal(field));
    });

    // Check "Remember Me" status
    const rememberMe = document.getElementById('remember_me');
    rememberMe.addEventListener('change', function() {
        if (!this.checked) {
            deleteCookie("firstName");
            clearLocalStorage();
        }
    });
}

function saveFieldToLocal(field) {
    const rememberMe = document.getElementById('remember_me').checked;
    if (!rememberMe) return;

    if (field.type === 'checkbox') {
        const checked = Array.from(document.querySelectorAll(`input[name="${field.name}"]:checked`)).map(cb => cb.value);
        localStorage.setItem(field.name, JSON.stringify(checked));
    } else if (field.type === 'radio') {
        if (field.checked) {
            localStorage.setItem(field.name, field.value);
        }
    } else {
        localStorage.setItem(field.id, field.value);
    }
}

function loadFromLocalStorage() {
    const rememberMe = document.getElementById('remember_me').checked;
    if (!rememberMe) return;

    const fields = document.querySelectorAll('.save-local');
    fields.forEach(field => {
        const savedValue = localStorage.getItem(field.type === 'checkbox' || field.type === 'radio' ? field.name : field.id);
        
        if (savedValue !== null) {
            if (field.type === 'checkbox') {
                const values = JSON.parse(savedValue);
                if (values.includes(field.value)) field.checked = true;
            } else if (field.type === 'radio') {
                if (field.value === savedValue) field.checked = true;
            } else {
                field.value = savedValue;
            }
        }
    });
}

function clearLocalStorage() {
    localStorage.clear();
}

// ============================================================
// VALIDATION LOGIC
// ============================================================

function validateField(id) {
    const el = document.getElementById(id);
    const errorEl = document.getElementById(id + '-error');
    if (!el && id !== 'gender' && id !== 'vaccinated' && id !== 'tenure') return "";

    let error = "";
    
    switch(id) {
        case 'fname':
        case 'lname':
            if (!/^[a-zA-Z'-]{1,30}$/.test(el.value)) {
                error = "Letters, apostrophes, and dashes only (1-30 chars).";
            }
            break;
        case 'mi':
            if (el.value && !/^[a-zA-Z]$/.test(el.value)) {
                error = "1 character max, letters only.";
            }
            break;
        case 'ssn':
            const cleanSSN = el.value.replace(/-/g, '');
            if (!/^\d{9}$/.test(cleanSSN)) {
                error = "Must be exactly 9 digits.";
            }
            break;
        case 'email':
            el.value = el.value.toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
                error = "Format: name@domain.tld";
            }
            break;
        case 'zip':
            if (!/^\d{5}$/.test(el.value)) {
                error = "Must be exactly 5 digits.";
            }
            break;
        case 'userid':
            if (/^\d/.test(el.value)) error = "Cannot start with a number.";
            else if (!/^[a-zA-Z0-9-_]{5,20}$/.test(el.value)) error = "5-20 chars. Letters, numbers, - and _ only.";
            break;
        case 'password':
            const uid = document.getElementById('userid').value;
            if (el.value.length < 8) error = "At least 8 characters.";
            else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(el.value)) error = "Must include 1 uppercase, 1 lowercase, and 1 digit.";
            else if (el.value === uid) error = "Password cannot match User ID.";
            break;
        case 'password_confirm':
            if (el.value !== document.getElementById('password').value) error = "Passwords do not match.";
            break;
        case 'gender':
        case 'vaccinated':
        case 'tenure':
            const selected = document.querySelector(`input[name="${id}"]:checked`);
            if (!selected) error = "Selection is required.";
            break;
        case 'state':
            if (el.value === "") error = "Please select a state.";
            break;
        case 'addr1':
        case 'city':
            if (el.value.length < 2) error = "Too short (min 2 chars).";
            break;
    }

    showError(id, error);
    return error;
}

function validateDOB() {
    const m = document.getElementById('dob-month').value;
    const d = document.getElementById('dob-day').value;
    const y = document.getElementById('dob-year').value;
    const errorEl = document.getElementById('dob-error');
    
    let error = "";
    if (!m || !d || !y) {
        error = "All DOB fields are required.";
    } else {
        const birthDate = new Date(y, m - 1, d);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (birthDate > today) error = "Date cannot be in the future.";
        else if (age > 120) error = "Age cannot exceed 120 years.";
        else if (birthDate.getMonth() + 1 != m || birthDate.getDate() != d) error = "Invalid date.";
    }

    errorEl.innerText = error;
    return error;
}

function showError(id, msg) {
    const errorEl = document.getElementById(id + '-error');
    if (errorEl) errorEl.innerText = msg;
}

function formatSSN(el) {
    let val = el.value.replace(/\D/g, '');
    if (val.length > 3 && val.length <= 5) val = val.slice(0,3) + '-' + val.slice(3);
    else if (val.length > 5) val = val.slice(0,3) + '-' + val.slice(3,5) + '-' + val.slice(5,9);
    el.value = val;
}

function updateSliderLabel(val) {
    document.getElementById('salary-value').innerText = '$' + parseInt(val).toLocaleString() + ' / year';
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date-display').innerText = now.toLocaleDateString('en-US', options);
}

function performFullValidation() {
    const ids = ['fname', 'mi', 'lname', 'gender', 'ssn', 'email', 'addr1', 'city', 'state', 'zip', 'userid', 'password', 'password_confirm', 'vaccinated', 'tenure'];
    let hasErrors = false;
    
    ids.forEach(id => {
        if (validateField(id)) hasErrors = true;
    });
    
    if (validateDOB()) hasErrors = true;

    if (!hasErrors) {
        alert("Validation successful! You can now submit.");
        document.getElementById('validate-btn').style.display = 'none';
        document.getElementById('submit-btn').style.display = 'inline-block';
    } else {
        alert("Please correct the errors before submitting.");
    }
}

function handleFinalSubmit(e) {
    const rememberMe = document.getElementById('remember_me').checked;
    if (rememberMe) {
        const fname = document.getElementById('fname').value;
        setCookie("firstName", fname, 48); // 48 hours expiry
    }
    return true;
}

function resetForm() {
    if (confirm("Are you sure you want to clear the form? Saved data in local storage will also be cleared.")) {
        clearLocalStorage();
        return true;
    }
    return false;
}
