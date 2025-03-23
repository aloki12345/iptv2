let player = videojs('my-video');
let savedSettings = JSON.parse(localStorage.getItem('xtreamSettings'));

// تحميل الإعدادات عند بدء التشغيل
window.onload = () => {
    if (savedSettings) {
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('settingsBox').style.display = 'none';
        loadCategories();
    }
};

// حفظ الإعدادات
function saveSettings() {
    const settings = {
        serverUrl: document.getElementById('serverUrl').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };
    
    localStorage.setItem('xtreamSettings', JSON.stringify(settings));
    location.reload();
}

// جلب البيانات من السيرفر
async function fetchData(action, extraParams = '') {
    try {
        const response = await fetch(
            `${savedSettings.serverUrl}/player_api.php?` +
            `username=${savedSettings.username}&` +
            `password=${savedSettings.password}&` +
            `action=${action}${extraParams}`
        );
        return await response.json();
    } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
    }
}

// تحميل التصنيفات
async function loadCategories() {
    const categories = await fetchData('get_live_categories');
    const buttonsContainer = document.getElementById('categoryButtons');
    
    // أزرار التصنيفات
    buttonsContainer.innerHTML = categories.map(cat => `
        <button class="category-btn" onclick="loadCategory('${cat.category_id}', 'live')">
            ${cat.category_name}
        </button>
    `).join('');
    
    // إضافة تصنيف الأفلام
    buttonsContainer.innerHTML += `
        <button class="category-btn" onclick="loadVodCategories()">
            الأفلام
        </button>
    `;
    
    // إضافة تصنيف المسلسلات
    buttonsContainer.innerHTML += `
        <button class="category-btn" onclick="loadSeriesCategories()">
            المسلسلات
        </button>
    `;
}

// تحميل محتوى التصنيف
async function loadCategory(categoryId, type = 'live') {
    const data = await fetchData(`get_${type}_streams`, `&category_id=${categoryId}`);
    const itemsList = document.getElementById('itemsList');
    
    itemsList.innerHTML = data.map(item => `
        <div class="item-card" onclick="playStream('${item.stream_url}')">
            <h3>${item.name}</h3>
            ${item.cover ? `<img src="${item.cover}" alt="${item.name}" class="item-image">` : ''}
        </div>
    `).join('');
}

// تحميل تصنيفات الأفلام
async function loadVodCategories() {
    const categories = await fetchData('get_vod_categories');
    const buttonsContainer = document.getElementById('categoryButtons');
    
    buttonsContainer.innerHTML = categories.map(cat => `
        <button class="category-btn" onclick="loadCategory('${cat.category_id}', 'vod')">
            ${cat.category_name}
        </button>
    `).join('');
}

// تحميل تصنيفات المسلسلات
async function loadSeriesCategories() {
    const categories = await fetchData('get_series_categories');
    const buttonsContainer = document.getElementById('categoryButtons');
    
    buttonsContainer.innerHTML = categories.map(cat => `
        <button class="category-btn" onclick="loadSeries('${cat.category_id}')">
            ${cat.category_name}
        </button>
    `).join('');
}

// تحميل حلقات المسلسل
async function loadSeries(categoryId) {
    const series = await fetchData('get_series', `&category_id=${categoryId}`);
    const itemsList = document.getElementById('itemsList');
    
    itemsList.innerHTML = series.map(s => `
        <div class="item-card" onclick="loadSeasons(${s.series_id})">
            <h3>${s.name}</h3>
            <img src="${s.cover}" alt="${s.name}" class="item-image">
        </div>
    `).join('');
}

// تشغيل المحتوى
function playStream(streamUrl) {
    player.src({ src: streamUrl, type: 'application/x-mpegURL' });
    player.play();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}