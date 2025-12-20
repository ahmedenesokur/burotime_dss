// Dashboard JavaScript
const API_BASE_URL = 'http://localhost:3000/api';

let currentProduct = null;
let salesChart = null;
let campaignChart = null;
let currentForecast = null;
let currentSalesData = null;
let currentSummary = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    await loadAllProductsSummary();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('urunSelect').addEventListener('change', handleProductChange);
    document.getElementById('tahminUretBtn').addEventListener('click', generateForecast);
    document.getElementById('topluTahminBtn').addEventListener('click', generateBulkForecast);
    document.getElementById('kaydetBtn').addEventListener('click', saveForecast);
}

// Load all products into dropdown
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/urunler`);
        const products = await response.json();
        
        const select = document.getElementById('urunSelect');
        select.innerHTML = '<option value="">-- Tüm Ürünler (Özet) --</option>';
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.urun_kodu} - ${product.urun_adi}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Ürünler yüklenirken hata oluştu');
    }
}

// Handle product selection change
async function handleProductChange(e) {
    const productId = e.target.value;
    
    if (!productId) {
        // Show all products summary
        showAllProductsView();
        await loadAllProductsSummary();
    } else {
        // Show single product view
        currentProduct = productId;
        showSingleProductView();
        await loadProductSummary(productId);
    }
}

// Show all products view
function showAllProductsView() {
    document.getElementById('allProductsView').classList.remove('d-none');
    document.getElementById('singleProductView').classList.add('d-none');
    document.getElementById('loadingSpinner').classList.add('d-none');
}

// Show single product view
function showSingleProductView() {
    document.getElementById('allProductsView').classList.add('d-none');
    document.getElementById('singleProductView').classList.remove('d-none');
    document.getElementById('loadingSpinner').classList.add('d-none');
}

// Load all products summary
async function loadAllProductsSummary() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/ozet`);
        const data = await response.json();
        
        // Update KPIs
        document.getElementById('toplamUrun').textContent = data.genel.toplam_urun;
        document.getElementById('toplamSatis').textContent = data.genel.toplam_satis.toLocaleString('tr-TR');
        document.getElementById('ortalamaSatis').textContent = Math.round(data.genel.ortalama_satis).toLocaleString('tr-TR');
        document.getElementById('enCokSatan').textContent = data.en_cok_satan.urun_adi;
        
        // Update top products table
        const tbody = document.getElementById('topProductsTable');
        tbody.innerHTML = '';
        
        data.top_urunler.forEach(product => {
            const row = `
                <tr>
                    <td><strong>${product.urun_kodu}</strong></td>
                    <td>${product.urun_adi}</td>
                    <td class="text-end">${product.toplam_satis.toLocaleString('tr-TR')}</td>
                    <td class="text-end">${Math.round(product.ortalama_satis).toLocaleString('tr-TR')}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
        
    } catch (error) {
        console.error('Error loading summary:', error);
        showError('Özet veriler yüklenirken hata oluştu');
    }
}

// Load single product summary
async function loadProductSummary(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/ozet?urun_id=${productId}`);
        const data = await response.json();
        
        // Store for decision insights
        currentSummary = data;
        
        // Update KPIs
        document.getElementById('aylikOrtalama').textContent = Math.round(data.aylik_ortalama_satis).toLocaleString('tr-TR');
        document.getElementById('kampanyaOrtalama').textContent = data.kampanya_ortalama.toLocaleString('tr-TR');
        document.getElementById('normalOrtalama').textContent = data.normal_ortalama.toLocaleString('tr-TR');
        document.getElementById('toplamSatisUrun').textContent = data.toplam_satis.toLocaleString('tr-TR');
        
        // Update trend badge
        const trendBadge = document.getElementById('trendBadge');
        let trendClass = 'trend-stable';
        let trendText = 'Stabil';
        let trendIcon = '→';
        
        if (data.trend === 'growing') {
            trendClass = 'trend-growing';
            trendText = `Büyüyor (+${data.trend_yuzde}%)`;
            trendIcon = '↑';
        } else if (data.trend === 'declining') {
            trendClass = 'trend-declining';
            trendText = `Düşüyor (${data.trend_yuzde}%)`;
            trendIcon = '↓';
        }
        
        trendBadge.className = trendClass;
        trendBadge.textContent = `${trendIcon} ${trendText}`;
        
        // Load sales data and create charts
        await loadSalesData(productId);
        
    } catch (error) {
        console.error('Error loading product summary:', error);
        showError('Ürün özeti yüklenirken hata oluştu');
    }
}

// Load sales data and create charts
async function loadSalesData(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/satis?urun_id=${productId}`);
        const salesData = await response.json();
        
        // Store for decision insights
        currentSalesData = salesData;
        
        // Create sales history chart
        createSalesChart(salesData);
        
        // Create campaign comparison chart
        createCampaignChart(salesData);
        
    } catch (error) {
        console.error('Error loading sales data:', error);
        showError('Satış verileri yüklenirken hata oluştu');
    }
}

// Create sales history chart
function createSalesChart(salesData) {
    const ctx = document.getElementById('salesForecastChart');
    
    // Destroy existing chart
    if (salesChart) {
        salesChart.destroy();
    }
    
    const labels = salesData.map(d => d.ay);
    const data = salesData.map(d => d.satis_adedi);
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Geçmiş Satışlar',
                data: data,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Satış Adedi'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Ay'
                    }
                }
            }
        }
    });
}

// Create campaign comparison chart
function createCampaignChart(salesData) {
    const ctx = document.getElementById('campaignChart');
    
    // Destroy existing chart
    if (campaignChart) {
        campaignChart.destroy();
    }
    
    const kampanyaData = salesData.filter(d => d.kampanya_var_mi === 1);
    const normalData = salesData.filter(d => d.kampanya_var_mi === 0);
    
    const kampanyaAvg = kampanyaData.length > 0 
        ? Math.round(kampanyaData.reduce((sum, d) => sum + d.satis_adedi, 0) / kampanyaData.length)
        : 0;
    
    const normalAvg = normalData.length > 0
        ? Math.round(normalData.reduce((sum, d) => sum + d.satis_adedi, 0) / normalData.length)
        : 0;
    
    campaignChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Normal', 'Kampanya'],
            datasets: [{
                label: 'Ortalama Satış',
                data: [normalAvg, kampanyaAvg],
                backgroundColor: ['#6c757d', '#ffc107'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ortalama Satış'
                    }
                }
            }
        }
    });
}

// Generate forecast for current product
async function generateForecast() {
    if (!currentProduct) {
        showError('Lütfen bir ürün seçin');
        return;
    }
    
    const aySayisi = document.getElementById('aySayisi').value;
    const guvenlikOrani = document.getElementById('guvenlikOrani').value;
    const mevsimsellik = document.getElementById('mevsimsellik').value;
    
    try {
        const btn = document.getElementById('tahminUretBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Hesaplanıyor...';
        
        const url = `${API_BASE_URL}/tahmin?urun_id=${currentProduct}&ay_sayisi=${aySayisi}&guvenlik_orani=${guvenlikOrani}&mevsimsellik_aktif=${mevsimsellik}`;
        const response = await fetch(url);
        const data = await response.json();
        
        currentForecast = data;
        displayForecastResults(data);
        updateChartWithForecast(data);
        
        // Generate and display decision insights
        displayDecisionInsights(data);
        
        // Enable save button
        document.getElementById('kaydetBtn').disabled = false;
        
        showSuccess('Tahmin başarıyla oluşturuldu');
        
    } catch (error) {
        console.error('Error generating forecast:', error);
        showError('Tahmin oluştururken hata oluştu');
    } finally {
        const btn = document.getElementById('tahminUretBtn');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-calculator"></i> Tahmin Üret';
    }
}

// Display forecast results in table
function displayForecastResults(data) {
    const tbody = document.getElementById('forecastTable');
    tbody.innerHTML = '';
    
    data.sonuclar.forEach(item => {
        const guvenlikStok = item.onerilen_uretim - item.tahmini_satis;
        const row = `
            <tr>
                <td><strong>${item.ay}</strong></td>
                <td class="text-end">${item.tahmini_satis.toLocaleString('tr-TR')}</td>
                <td class="text-end"><strong>${item.onerilen_uretim.toLocaleString('tr-TR')}</strong></td>
                <td class="text-end text-muted">${guvenlikStok.toLocaleString('tr-TR')}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Update chart with forecast data
function updateChartWithForecast(data) {
    if (!salesChart) return;
    
    const forecastLabels = data.sonuclar.map(d => d.ay);
    const forecastData = data.sonuclar.map(d => d.tahmini_satis);
    
    // Get original historical data (before any forecast additions)
    const historicalLabels = currentSalesData.map(d => d.ay);
    const historicalData = currentSalesData.map(d => d.satis_adedi);
    
    // Get the last historical value to create a smooth connection
    const lastHistoricalValue = historicalData[historicalData.length - 1];
    
    // Remove existing forecast dataset if present
    if (salesChart.data.datasets.length > 1) {
        salesChart.data.datasets.pop();
    }
    
    // Reset to original historical data
    salesChart.data.labels = [...historicalLabels, ...forecastLabels];
    salesChart.data.datasets[0].data = [...historicalData, ...Array(forecastLabels.length).fill(null)];
    
    // Add forecast dataset with connection point
    salesChart.data.datasets.push({
        label: 'Tahmin',
        data: [
            ...Array(historicalLabels.length - 1).fill(null), // Fill with nulls until last historical point
            lastHistoricalValue, // Connect to last historical value
            ...forecastData // Add forecast values
        ],
        borderColor: '#198754',
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        borderDash: [5, 5],
        tension: 0.3,
        fill: false
    });
    
    salesChart.update();
}

// Generate bulk forecast
async function generateBulkForecast() {
    if (!confirm('Tüm ürünler için tahmin oluşturulsun mu? Bu işlem birkaç saniye sürebilir.')) {
        return;
    }
    
    try {
        const btn = document.getElementById('topluTahminBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Tüm ürünler hesaplanıyor...';
        
        const response = await fetch(`${API_BASE_URL}/tahmin/toplu?ay_sayisi=6`);
        const data = await response.json();
        
        showSuccess(`Tahmin tamamlandı! ${data.basarili}/${data.toplam_urun} ürün için tahmin oluşturuldu.`);
        
    } catch (error) {
        console.error('Error generating bulk forecast:', error);
        showError('Toplu tahmin oluştururken hata oluştu');
    } finally {
        const btn = document.getElementById('topluTahminBtn');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-lightning-charge-fill"></i> Tüm Ürünler İçin Tahmin Üret';
    }
}

// Save forecast to database
async function saveForecast() {
    if (!currentForecast) {
        showError('Kaydedilecek tahmin bulunamadı');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/tahmin/kaydet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                urun_id: currentProduct,
                forecasts: currentForecast.sonuclar,
                model_versiyonu: currentForecast.model
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Tahmin veritabanına kaydedildi');
            document.getElementById('kaydetBtn').disabled = true;
        } else {
            showError('Tahmin kaydedilirken hata oluştu');
        }
        
    } catch (error) {
        console.error('Error saving forecast:', error);
        showError('Tahmin kaydedilirken hata oluştu');
    }
}

// Generate and display decision insights based on forecast and historical data
function displayDecisionInsights(forecastData) {
    const insightsContainer = document.getElementById('decisionInsights');
    
    if (!insightsContainer || !currentSummary || !currentSalesData) {
        return;
    }
    
    const insights = [];
    
    // Analyze forecast pattern
    const forecastValues = forecastData.sonuclar.map(f => f.tahmini_satis);
    const forecastAvg = forecastValues.reduce((a, b) => a + b, 0) / forecastValues.length;
    const forecastVariance = forecastValues.reduce((sum, val) => sum + Math.pow(val - forecastAvg, 2), 0) / forecastValues.length;
    const forecastCV = (Math.sqrt(forecastVariance) / forecastAvg) * 100;
    
    // Calculate FORECAST TREND (future-looking)
    const firstForecast = forecastValues[0];
    const lastForecast = forecastValues[forecastValues.length - 1];
    const forecastTrendPercent = ((lastForecast - firstForecast) / firstForecast * 100);
    const forecastTrendAbs = Math.abs(forecastTrendPercent).toFixed(1);
    
    // Historical trend (for context only)
    const historicalTrendPercent = currentSummary.trend_yuzde || 0;
    const historicalTrend = currentSummary.trend;
    
    // Debug logging for verification
    console.log('🔍 Decision Support Analysis:', {
        historical: { trend: historicalTrend, percent: `${historicalTrendPercent}%` },
        forecast: { 
            trend: forecastTrendPercent > 5 ? 'growing' : forecastTrendPercent < -5 ? 'declining' : 'stable',
            percent: `${forecastTrendPercent.toFixed(1)}%`,
            range: `${firstForecast} → ${lastForecast}`
        },
        fluctuation: `CV: ${forecastCV.toFixed(1)}%`,
        decisionBasis: 'FORECAST (forward-looking)'
    });
    
    // 1. Production recommendation based on FORECAST TREND (forward-looking)
    let forecastDirection = 'stable';
    if (forecastTrendPercent > 5) {
        forecastDirection = 'growing';
    } else if (forecastTrendPercent < -5) {
        forecastDirection = 'declining';
    }
    
    if (forecastDirection === 'growing') {
        let contextNote = '';
        if (historicalTrend === 'declining') {
            contextNote = ` Geçmiş düşüş eğilimine rağmen (${historicalTrendPercent}%), gelecek tahminler iyileşme göstermektedir.`;
        } else if (historicalTrend === 'stable') {
            contextNote = ' Geçmiş dönem stabil seyrederken, gelecek tahminler artış göstermektedir.';
        }
        
        insights.push({
            icon: '📈',
            type: 'success',
            title: 'Üretim Artırılmalı',
            text: `Tahmin edilen talep artış eğilimindedir (+${forecastTrendAbs}%). Gelecek ${forecastData.girdiler.ay_sayisi} ayda satışların ${firstForecast}'dan ${lastForecast}'a yükselmesi beklenmektedir.${contextNote} Üretim kapasitesinin kademeli artırılması önerilmektedir.`
        });
    } else if (forecastDirection === 'declining') {
        let contextNote = '';
        if (historicalTrend === 'growing') {
            contextNote = ` Geçmiş artış eğilimine rağmen (+${Math.abs(historicalTrendPercent)}%), gelecek tahminler düşüş göstermektedir.`;
        } else if (historicalTrend === 'stable') {
            contextNote = ' Geçmiş dönem stabil seyrederken, gelecek tahminler azalma göstermektedir.';
        }
        
        insights.push({
            icon: '📉',
            type: 'warning',
            title: 'Üretim Azaltılabilir',
            text: `Tahmin edilen talep düşüş eğilimindedir (-${forecastTrendAbs}%). Gelecek ${forecastData.girdiler.ay_sayisi} ayda satışların ${firstForecast}'dan ${lastForecast}'a düşmesi beklenmektedir.${contextNote} Üretim planları gözden geçirilmeli ve fazla stok riski yönetilmelidir.`
        });
    } else {
        // Stable forecast
        let contextText = `Tahmin edilen talep dengeli seyredecektir (ilk ay: ${firstForecast}, son ay: ${lastForecast}). `;
        
        if (historicalTrend === 'growing') {
            contextText += `Geçmiş artış eğilimi (+${Math.abs(historicalTrendPercent)}%) devam etmese de, talep istikrarlıdır. `;
        } else if (historicalTrend === 'declining') {
            contextText += `Geçmiş düşüş eğilimi (${historicalTrendPercent}%) durmuş görünmektedir. `;
        }
        
        if (forecastCV > 10) {
            contextText += 'Aylık tahminler mevsimsellik nedeniyle dalgalanmaktadır. Esnek üretim planlaması önerilir.';
        } else {
            contextText += 'Mevcut üretim kapasitesi sürdürülebilir.';
        }
        
        insights.push({
            icon: '📊',
            type: 'info',
            title: 'Üretim Sabit Tutulabilir',
            text: contextText
        });
    }
    
    // 2. Stock risk assessment based on variance (updated thresholds)
    const salesValues = currentSalesData.map(d => d.satis_adedi);
    const avgSales = salesValues.reduce((a, b) => a + b, 0) / salesValues.length;
    const variance = salesValues.reduce((sum, val) => sum + Math.pow(val - avgSales, 2), 0) / salesValues.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / avgSales) * 100;
    
    if (coefficientOfVariation < 10) {
        insights.push({
            icon: '✅',
            type: 'success',
            title: 'Stok Riski Düşük',
            text: `Talep çok istikrarlı olduğu için stok kırılma riski düşüktür (değişkenlik katsayısı: %${coefficientOfVariation.toFixed(1)}). Güvenlik stoku minimum tutulabilir.`
        });
    } else if (coefficientOfVariation < 20) {
        insights.push({
            icon: '⚠️',
            type: 'warning',
            title: 'Orta Seviye Stok Riski',
            text: `Talep değişkenliği orta seviyededir (değişkenlik katsayısı: %${coefficientOfVariation.toFixed(1)}). Mevcut güvenlik stoku oranı (%${forecastData.girdiler.guvenlik_orani}) dengeli bir yaklaşım sunmaktadır.`
        });
    } else {
        insights.push({
            icon: '🔴',
            type: 'danger',
            title: 'Yüksek Stok Riski',
            text: `Talep yüksek değişkenlik göstermektedir (değişkenlik katsayısı: %${coefficientOfVariation.toFixed(1)}). Güvenlik stoku artırılmalı (%20+ önerilir) veya esnek üretim planlaması uygulanmalıdır.`
        });
    }
    
    // 3. Campaign impact analysis (with planning clarification)
    if (currentSummary.kampanya_ortalama > 0 && currentSummary.normal_ortalama > 0) {
        const campaignImpact = ((currentSummary.kampanya_ortalama - currentSummary.normal_ortalama) / currentSummary.normal_ortalama * 100);
        if (campaignImpact > 10) {
            insights.push({
                icon: '🎯',
                type: 'info',
                title: 'Kampanya Etkisi Yüksek',
                text: `Kampanya dönemleri satışları ortalama %${campaignImpact.toFixed(0)} artırmaktadır. Gelecek dönem kampanya planı bilinmediği için kampanya etkisi tahminlere doğrudan uygulanmamıştır. Kampanya planlanıyorsa tahminler buna göre ayarlanmalıdır.`
            });
        } else if (campaignImpact > 5) {
            insights.push({
                icon: '📌',
                type: 'info',
                title: 'Kampanya Etkisi Mevcut',
                text: `Kampanyalar satışları %${campaignImpact.toFixed(0)} artırmaktadır. Not: Tahminler normal (kampanyasız) dönem varsayımıyla hesaplanmıştır. Kampanya planlanıyorsa ilgili aylar için ek kapasite düşünülmelidir.`
            });
        } else {
            insights.push({
                icon: '📌',
                type: 'secondary',
                title: 'Kampanya Etkisi Sınırlı',
                text: `Geçmiş kampanyaların satış artırıcı etkisi sınırlıdır (%${campaignImpact.toFixed(0)}). Tahminler normal talep üzerinden hesaplanmıştır.`
            });
        }
    }
    
    // 4. Forecast model explanation
    if (forecastData.metadata && forecastData.metadata.aciklama) {
        insights.push({
            icon: '💡',
            type: 'secondary',
            title: 'Model Açıklaması',
            text: forecastData.metadata.aciklama
        });
    }
    
    // Render insights
    let html = '<div class="row">';
    insights.forEach(insight => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="alert alert-${insight.type} d-flex align-items-start" role="alert">
                    <div class="me-3 fs-4">${insight.icon}</div>
                    <div>
                        <h6 class="alert-heading mb-1">${insight.title}</h6>
                        <p class="mb-0 small">${insight.text}</p>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    insightsContainer.innerHTML = html;
    insightsContainer.style.display = 'block';
    
    // Hide the "no insights" message
    const noInsights = document.getElementById('noInsights');
    if (noInsights) {
        noInsights.style.display = 'none';
    }
}

// Show success message
function showSuccess(message) {
    // Simple alert for now - can be improved with toast notifications
    alert('✅ ' + message);
}

// Show error message
function showError(message) {
    alert('❌ ' + message);
}
