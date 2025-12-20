// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const btnText = document.getElementById('btnText');
    
    // Load saved email if exists
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
    
    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous error
        errorAlert.style.display = 'none';
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validation
        if (!email || !password) {
            showError('E-posta ve şifre boş olamaz');
            return;
        }
        
        if (!isValidEmail(email)) {
            showError('Geçerli bir e-posta adresi giriniz');
            return;
        }
        
        // Show loading state
        loadingSpinner.style.display = 'inline-block';
        btnText.textContent = 'Kontrol ediliyor...';
        loginForm.querySelector('button').disabled = true;
        
        try {
            // Call login API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            // Check if response is ok before parsing JSON
            if (!response.ok && response.status === 404) {
                throw new Error('Sunucu API endpoint bulunamadı');
            }
            
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                throw new Error('Sunucudan geçersiz yanıt alındı');
            }
            
            if (response.ok) {
                // Save email if remember me is checked
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('savedEmail', email);
                } else {
                    localStorage.removeItem('savedEmail');
                }
                
                // Save token
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect to dashboard
                window.location.href = 'index.html';
            } else {
                showError(data.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol ediniz.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Sunucu bağlantı hatası: ' + error.message);
        } finally {
            // Hide loading state
            loadingSpinner.style.display = 'none';
            btnText.textContent = 'Giriş Yap';
            loginForm.querySelector('button').disabled = false;
        }
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorAlert.style.display = 'block';
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
