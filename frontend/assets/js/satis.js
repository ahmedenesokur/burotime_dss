// Sales Data Management JavaScript
const API_BASE_URL = 'http://localhost:3000/api';

let allSalesData = [];

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Setup user info and logout
function setupAuthUI() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameElement = document.getElementById('userName');
    if (userNameElement && user.name) {
        userNameElement.textContent = user.name;
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    setupAuthUI();
    await loadProducts();
    await loadSalesData();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('salesForm').addEventListener('submit', handleSubmit);
    document.getElementById('filterUrun').addEventListener('change', filterSalesData);
}

// Load products into dropdowns
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/urunler`);
        const products = await response.json();
        
        // Populate form select
        const formSelect = document.getElementById('urunSelect');
        formSelect.innerHTML = '<option value="">Ürün Seçin...</option>';
        
        // Populate filter select
        const filterSelect = document.getElementById('filterUrun');
        filterSelect.innerHTML = '<option value="">Tüm Ürünler</option>';
        
        products.forEach(product => {
            const option1 = document.createElement('option');
            option1.value = product.id;
            option1.textContent = `${product.urun_kodu} - ${product.urun_adi}`;
            formSelect.appendChild(option1);
            
            const option2 = option1.cloneNode(true);
            filterSelect.appendChild(option2);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Ürünler yüklenirken hata oluştu');
    }
}

// Load all sales data
async function loadSalesData() {
    try {
        const response = await fetch(`${API_BASE_URL}/satis`);
        allSalesData = await response.json();
        displaySalesData(allSalesData);
    } catch (error) {
        console.error('Error loading sales data:', error);
        showError('Satış verileri yüklenirken hata oluştu');
    }
}

// Display sales data in table
function displaySalesData(data) {
    const tbody = document.getElementById('salesTable');
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Kayıt bulunamadı</td></tr>';
        document.getElementById('recordCount').textContent = 'Toplam: 0 kayıt';
        return;
    }
    
    tbody.innerHTML = '';
    
    data.forEach(sale => {
        const kampanyaBadge = sale.kampanya_var_mi === 1
            ? '<span class="badge badge-kampanya">Evet</span>'
            : '<span class="badge badge-normal">Hayır</span>';
        
        const row = `
            <tr>
                <td><strong>${sale.urun_kodu}</strong></td>
                <td>${sale.urun_adi}</td>
                <td>${sale.ay}</td>
                <td class="text-end">${sale.satis_adedi.toLocaleString('tr-TR')}</td>
                <td class="text-center">${kampanyaBadge}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    document.getElementById('recordCount').textContent = `Toplam: ${data.length} kayıt`;
}

// Filter sales data by product
function filterSalesData() {
    const selectedProduct = document.getElementById('filterUrun').value;
    
    if (!selectedProduct) {
        displaySalesData(allSalesData);
        return;
    }
    
    const filtered = allSalesData.filter(sale => sale.urun_id == selectedProduct);
    displaySalesData(filtered);
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const urun_id = document.getElementById('urunSelect').value;
    const ayInput = document.getElementById('ayInput').value; // Format: YYYY-MM
    const satis_adedi = parseInt(document.getElementById('satisAdedi').value);
    const kampanya_var_mi = parseInt(document.getElementById('kampanyaSelect').value);
    
    if (!urun_id || !ayInput || !satis_adedi) {
        showError('Lütfen tüm zorunlu alanları doldurun');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/satis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                urun_id: parseInt(urun_id),
                ay: ayInput,
                satis_adedi,
                kampanya_var_mi
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Satış kaydı başarıyla eklendi');
            document.getElementById('salesForm').reset();
            await loadSalesData(); // Refresh table
        } else {
            if (result.error.includes('already exists')) {
                showError('Bu ürün ve ay için zaten kayıt mevcut');
            } else {
                showError('Kayıt eklenirken hata oluştu: ' + result.error);
            }
        }
    } catch (error) {
        console.error('Error adding sales:', error);
        showError('Kayıt eklenirken hata oluştu');
    }
}

// Show success message
function showSuccess(message) {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

// Show error message
function showError(message) {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}
