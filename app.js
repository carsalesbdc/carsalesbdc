// Pagination Config
const ITEMS_PER_PAGE = 24;
let filteredVehicles = []; 
let currentPage = 1;

// Filter Variables State
let searchTerm = '', currentSort = 'default';
let activeQuickFilters = {
    suv: false,
    truck: false,
    lowmiles: false,
    under25k: false,
    newarrival: false,
    under500mo: false
};
let activeMaxPrice = null;
let activeMaxMiles = null;
let activeMinYear = null;

// DOM Handles
const scrollContainer = document.getElementById('scroll-main');
const grid = document.getElementById('vehicle-grid');
const searchInput = document.getElementById('search-input');
const quickButtons = document.querySelectorAll('.quick-btn');
const clearQuickBtn = document.getElementById('clear-quick-btn');
const sortSelect = document.getElementById('sort-select');
const counter = document.getElementById('vehicle-counter');
const sentinel = document.getElementById('scroll-sentinel');
const spinner = document.getElementById('spinner');
const stickyBar = document.getElementById('sticky-search-bar');
const callIconBtn = document.getElementById('call-icon-btn');
const filterIconBtn = document.getElementById('filter-icon-btn');
const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
const drawerBackdrop = document.getElementById('filter-drawer-backdrop');
const drawer = document.getElementById('filter-drawer');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const doneDrawerBtn = document.getElementById('done-drawer-btn');
const resetAllBtn = document.getElementById('reset-all-filters-btn');
const activeChipsContainer = document.getElementById('active-chips-container');
const drawerFilterBtns = document.querySelectorAll('.drawer-filter-btn');

// Automotive Slang Dictionary
const slangDictionary = {
    'chevy': 'chevrolet',
    'vw': 'volkswagen',
    'bimmer': 'bmw',
    'suby': 'subaru',
    'soob': 'subaru',
    'yota': 'toyota',
    'lex': 'lexus',
    'merc': 'mercedes',
    'caddy': 'cadillac',
    'acord': 'accord',       
    'forerunner': '4runner', 
    'sintra': 'sentra',      
    'awd': 'all wheel drive',
    '4x4': 'four wheel drive',
    'nav': 'navigation',
    'leather': 'leather seats'
};

// Search Normalization & Slang Engine
function cleanSearchString(str) {
    let cleaned = str.toLowerCase().replace(/[-_ \/\\]/g, '');
    let rawLower = str.toLowerCase().trim();
    if (slangDictionary[rawLower]) return slangDictionary[rawLower].replace(/[-_ \/\\]/g, '');
    if (slangDictionary[cleaned]) return slangDictionary[cleaned].replace(/[-_ \/\\]/g, '');
    return cleaned;
}

// Render Vehicle Cards
function renderNextBatch() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const batch = filteredVehicles.slice(start, end);

    if (batch.length === 0 && currentPage === 1) {
        grid.innerHTML = `<div class="col-span-2 text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300"><p class="text-base font-bold">No vehicles found.</p></div>`;
        return;
    }

    let htmlString = '';
    batch.forEach(car => {
        const milesNum = Number(String(car.miles).replace(/,/g, ''));
        const formattedMiles = Math.round(milesNum / 1000) + 'k miles';

        htmlString += `
            <article class="bg-white border border-slate-300/80 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm transition transform active:scale-[0.99]">
                <a href="vdp.html?id=${car.id}" class="block cursor-pointer flex-grow">
                    <div class="p-2 pb-0">
                        <div class="relative aspect-[4/3] bg-slate-100 w-[104%] -ml-[2%] rounded-xl overflow-hidden shadow-sm border border-slate-300/30">
                            <img src="${car.img}" width="500" height="375" alt="${car.year} ${car.make} ${car.model}" class="w-full h-full object-cover rounded-xl" loading="lazy">
                        </div>
                    </div>
                    <div class="p-3 flex flex-col justify-between">
                        <div>
                            <h2 class="text-base font-black text-slate-900 tracking-tight truncate leading-tight">${car.year} ${car.make} ${car.model}</h2>
                            <div class="flex flex-wrap items-center gap-x-1.5 mt-1.5 text-xs font-bold text-slate-600">
                                <span>${formattedMiles}</span><span>•</span><span class="${car.colorClass} truncate max-w-[85px]">${car.color}</span>
                            </div>
                        </div>
                        <div class="mt-3">
                            <div class="flex items-center justify-between gap-1">
                                <div class="text-xl font-normal text-slate-900 leading-none">$${car.price.toLocaleString()}</div>
                                <span class="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-[2px] rounded uppercase tracking-wide">${car.type}</span>
                            </div>
                            <div class="text-xs text-slate-500 mt-1.5 font-medium">Est. $${car.payment}/mo</div>
                        </div>
                    </div>
                </a>
                
                <div class="p-2.5 pt-0">
                    <button class="w-full bg-blue-600 active:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-md transition tracking-wide shadow-sm truncate">Is It Here?</button>
                </div>
            </article>
        `;
    });

    grid.insertAdjacentHTML('beforeend', htmlString);
    currentPage++;
}

// Process Inventory & Stackable Quick Filters Logic
function processInventory() {
    grid.innerHTML = ''; 
    currentPage = 1;

    const cleanedSearchTerm = cleanSearchString(searchTerm);

    filteredVehicles = allVehicles.filter(car => {
        const carMilesNum = Number(String(car.miles).replace(/,/g, ''));
        const carDaysOnLot = Number(car.daysOnLot || 0); // vAuto age field fallback

        // Stackable Quick Filter checks
        if (activeQuickFilters.suv && car.type !== 'SUV') return false;
        if (activeQuickFilters.truck && car.type !== 'Truck') return false;
        if (activeQuickFilters.lowmiles && carMilesNum >= 60000) return false;
        if (activeQuickFilters.under25k && car.price > 25000) return false;
        if (activeQuickFilters.newarrival && carDaysOnLot > 30) return false; // New arrival threshold: <= 30 days
        if (activeQuickFilters.under500mo && car.payment > 500) return false;

        const rawString = `${car.year} ${car.make} ${car.model} ${car.type} ${car.color} ${car.price} ${car.miles}`;
        const cleanedCarString = cleanSearchString(rawString);
        const matchesSearch = cleanedCarString.includes(cleanedSearchTerm);

        const matchesPrice = !activeMaxPrice || (car.price <= activeMaxPrice);
        const matchesMiles = !activeMaxMiles || (carMilesNum <= activeMaxMiles);
        const matchesYear = !activeMinYear || (car.year >= activeMinYear);

        return matchesSearch && matchesPrice && matchesMiles && matchesYear;
    });

    if (currentSort === 'price-low') filteredVehicles.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price-high') filteredVehicles.sort((a, b) => b.price - a.price);
    else if (currentSort === 'year-new') filteredVehicles.sort((a, b) => b.year - a.year);

    counter.innerText = `${filteredVehicles.length} ${filteredVehicles.length === 1 ? 'Vehicle' : 'Vehicles'}`;
    
    renderNextBatch();
    updateQuickFilterUI();
}

// Update Quick Filter UI Highlights & Clear Button Visibility
function updateQuickFilterUI() {
    let anyActive = false;

    quickButtons.forEach(btn => {
        const key = btn.getAttribute('data-quick');
        if (activeQuickFilters[key]) {
            anyActive = true;
            btn.className = "quick-btn shrink-0 border-2 border-slate-900 bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-md transition shadow-xs";
        } else {
            btn.className = "quick-btn shrink-0 bg-white border border-slate-300 text-slate-700 font-bold text-xs px-3 py-2 rounded-md transition shadow-xs";
        }
    });

    if (anyActive) {
        clearQuickBtn.classList.remove('hidden');
    } else {
        clearQuickBtn.classList.add('hidden');
    }
}

// Quick Filter Button Click Listeners (Stackable)
quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-quick');
        activeQuickFilters[key] = !activeQuickFilters[key];
        processInventory();
    });
});

// Clear Quick Filters Button
clearQuickBtn.addEventListener('click', () => {
    Object.keys(activeQuickFilters).forEach(k => activeQuickFilters[k] = false);
    processInventory();
});

// Infinite Scroll Observer
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        const maxPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
        if (currentPage <= maxPages) {
            spinner.classList.remove('hidden');
            setTimeout(() => {
                renderNextBatch();
                spinner.classList.add('hidden');
            }, 250);
        }
    }
}, { root: scrollContainer, rootMargin: '150px' });
observer.observe(sentinel);

// Input Listeners for Search & Sort
searchInput.addEventListener('input', (e) => { searchTerm = e.target.value.toLowerCase().trim(); processInventory(); });
sortSelect.addEventListener('change', (e) => { currentSort = e.target.value; processInventory(); });

// SCROLL LOGIC
scrollContainer.addEventListener('scroll', () => {
    if (scrollContainer.scrollTop > 70) {
        stickyBar.classList.remove('bg-white/80', 'backdrop-blur-sm');
        stickyBar.classList.add('bg-slate-900', 'shadow-lg');
        filterIconBtn.classList.remove('hidden');
        callIconBtn.classList.remove('hidden');
        scrollToTopBtn.classList.remove('hidden');
    } else {
        stickyBar.classList.remove('bg-slate-900', 'shadow-lg');
        stickyBar.classList.add('bg-white/80', 'backdrop-blur-sm');
        filterIconBtn.classList.add('hidden');
        callIconBtn.classList.add('hidden');
        scrollToTopBtn.classList.add('hidden');
    }
}, { passive: true });

scrollToTopBtn.addEventListener('click', () => {
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
});

// Drawer Open / Close Logic
function openDrawer() {
    drawerBackdrop.classList.remove('hidden');
    drawer.classList.remove('translate-x-full');
}

function closeDrawer() {
    drawer.classList.add('translate-x-full');
    drawerBackdrop.classList.add('hidden');
}

filterIconBtn.addEventListener('click', openDrawer);
closeDrawerBtn.addEventListener('click', closeDrawer);
doneDrawerBtn.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

resetAllBtn.addEventListener('click', () => {
    activeMaxPrice = null;
    activeMaxMiles = null;
    activeMinYear = null;
    Object.keys(activeQuickFilters).forEach(k => activeQuickFilters[k] = false);
    processInventory();
});

// Safe Initial Load
function initApp() {
    if (typeof allVehicles !== 'undefined' && Array.isArray(allVehicles)) {
        filteredVehicles = [...allVehicles];
        processInventory();
    } else {
        setTimeout(initApp, 100);
    }
}

initApp();
