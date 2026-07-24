// Pagination Config
const ITEMS_PER_PAGE = 24;
let filteredVehicles = []; 
let currentPage = 1;

// Master Filter State
let searchTerm = '';
let currentSort = 'default';

// Quick Filters State
let activeQuickFilters = { suv: false, truck: false, lowmiles: false, under25k: false, newarrival: false, under500mo: false };

// Drawer Filters State
let activeDrawerType = 'All';
let activeMaxPrice = null;
let activeMaxMiles = null;
let activeMinYear = null;

// URL Param State (Passed from Home Page)
let isSurpriseMode = false;
let forceCondition = null; 
let forcedModel = null;

// DOM Handles
const scrollContainer = document.getElementById('scroll-main');
const globalHeader = document.getElementById('global-header');
const grid = document.getElementById('vehicle-grid');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const quickButtons = document.querySelectorAll('.quick-btn');
const clearQuickBtn = document.getElementById('clear-quick-btn');
const sortSelect = document.getElementById('sort-select');
const counter = document.getElementById('vehicle-counter');
const sentinel = document.getElementById('scroll-sentinel');
const spinner = document.getElementById('spinner');
const stickyBar = document.getElementById('sticky-search-bar');
const filterIconBtn = document.getElementById('filter-icon-btn');
const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
const drawerBackdrop = document.getElementById('filter-drawer-backdrop');
const drawer = document.getElementById('filter-drawer');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const doneDrawerBtn = document.getElementById('done-drawer-btn');
const resetAllBtn = document.getElementById('reset-all-filters-btn');
const drawerFilterBtns = document.querySelectorAll('.drawer-filter-btn');
const activeChipsContainer = document.getElementById('active-chips-container');
const continueShoppingContainer = document.getElementById('continue-shopping-container');
const viewedCarsScroll = document.getElementById('viewed-cars-scroll');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// Surprise Me Handles
const surpriseControls = document.getElementById('surprise-controls');
const surpriseAgainBtn = document.getElementById('surprise-again-btn');
const showAllSurpriseBtn = document.getElementById('show-all-surprise-btn');

// CTA Modal Handles
const ctaModalBackdrop = document.getElementById('cta-modal-backdrop');
const ctaModalBox = document.getElementById('cta-modal-box');
const ctaCloseBtn = document.getElementById('cta-close-btn');
const ctaReturnBtn = document.getElementById('cta-return-btn');
const ctaFormStep = document.getElementById('cta-form-step');
const ctaSuccessStep = document.getElementById('cta-success-step');
const ctaLeadForm = document.getElementById('cta-lead-form');

// Slang Dictionary
const slangDictionary = {
    'chevy': 'chevrolet', 'vw': 'volkswagen', 'bimmer': 'bmw', 'suby': 'subaru', 'soob': 'subaru', 
    'yota': 'toyota', 'lex': 'lexus', 'merc': 'mercedes', 'caddy': 'cadillac', 'acord': 'accord', 
    'forerunner': '4runner', 'sintra': 'sentra', 'awd': 'all wheel drive', '4x4': 'four wheel drive'
};

function cleanSearchString(str) {
    let cleaned = str.toLowerCase().replace(/[-_ \/\\]/g, '');
    let rawLower = str.toLowerCase().trim();
    if (slangDictionary[rawLower]) return slangDictionary[rawLower].replace(/[-_ \/\\]/g, '');
    if (slangDictionary[cleaned]) return slangDictionary[cleaned].replace(/[-_ \/\\]/g, '');
    return cleaned;
}

// ------------------------------------------------------------------------
// CONTINUED SHOPPING LOGIC
// ------------------------------------------------------------------------
function renderViewedCars() {
    let viewedIds = [];
    try { viewedIds = JSON.parse(localStorage.getItem('viewedCars')) || []; } catch(e) {}
    
    if (viewedIds.length === 0) {
        continueShoppingContainer.classList.add('hidden');
        return;
    }

    const viewedCarsData = allVehicles.filter(c => viewedIds.includes(String(c.id)));
    if (viewedCarsData.length === 0) {
        continueShoppingContainer.classList.add('hidden');
        return;
    }

    continueShoppingContainer.classList.remove('hidden');
    let htmlString = '';
    
    [...viewedCarsData].reverse().forEach(car => {
        const milesNum = Number(String(car.miles).replace(/,/g, ''));
        const formattedMiles = Math.round(milesNum / 1000) + 'k mi';
        
        htmlString += `
            <a href="vdp.html?id=${car.id}" class="w-[140px] snap-start shrink-0 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm transition active:scale-95 block">
                <div class="relative aspect-[4/3] bg-slate-700 w-full overflow-hidden">
                    <img src="${car.img}" alt="Vehicle" class="w-full h-full object-cover" loading="lazy">
                </div>
                <div class="p-2.5">
                    <h2 class="text-[11px] font-black text-white tracking-tight truncate">${car.year} ${car.make}</h2>
                    <h3 class="text-[10px] font-bold text-slate-400 truncate">${car.model}</h3>
                    <div class="flex flex-wrap items-center gap-x-1 mt-1 text-[9px] font-bold text-slate-500">
                        <span>${formattedMiles}</span><span>•</span><span class="truncate max-w-[50px] capitalize">${car.color}</span>
                    </div>
                    <div class="mt-2 text-sm font-normal text-white leading-none">$${car.price.toLocaleString()}</div>
                </div>
            </a>
        `;
    });
    viewedCarsScroll.innerHTML = htmlString;
}

if(clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('viewedCars');
        continueShoppingContainer.classList.add('hidden');
    });
}

// ------------------------------------------------------------------------
// INVENTORY RENDERING & FILTERING
// ------------------------------------------------------------------------
function renderNextBatch() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const batch = filteredVehicles.slice(start, end);

    if (batch.length === 0 && currentPage === 1) {
        grid.innerHTML = `<div class="col-span-2 text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300"><p class="text-base font-bold">No vehicles found matching filters.</p></div>`;
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
                            <img src="${car.img}" alt="Vehicle" class="w-full h-full object-cover rounded-xl" loading="lazy">
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
                    <button class="cta-trigger-btn w-full bg-blue-600 active:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-md transition tracking-wide shadow-sm truncate">Is It Here?</button>
                </div>
            </article>
        `;
    });

    grid.insertAdjacentHTML('beforeend', htmlString);
    currentPage++;
}

function processInventory() {
    grid.innerHTML = ''; 
    currentPage = 1;

    // 1. Grab parameters passed from Home Page doors
    const urlParams = new URLSearchParams(window.location.search);
    const urlSearch = urlParams.get('search');
    const urlType = urlParams.get('type');
    const urlCondition = urlParams.get('condition');
    const urlMaxPrice = urlParams.get('maxPrice');
    const urlModel = urlParams.get('model');
    const urlMode = urlParams.get('mode');

    // 2. Set State based on URL
    if (urlMode === 'surprise') isSurpriseMode = true;
    if (urlCondition) forceCondition = urlCondition.toLowerCase();
    if (urlModel) forcedModel = urlModel.toLowerCase();
    if (urlSearch && searchTerm === '') searchTerm = urlSearch.toLowerCase().trim();
    if (urlType) {
        if (urlType.toLowerCase() === 'suv') activeQuickFilters.suv = true;
        if (urlType.toLowerCase() === 'truck') activeQuickFilters.truck = true;
    }
    if (urlMaxPrice && !activeMaxPrice) activeMaxPrice = Number(urlMaxPrice);

    if (searchTerm.length > 0) {
        searchInput.value = searchTerm;
        clearSearchBtn.classList.remove('hidden');
    }

    const cleanedSearchTerm = cleanSearchString(searchTerm);

    // 3. Filter Dataset
    filteredVehicles = allVehicles.filter(car => {
        const carMilesNum = Number(String(car.miles).replace(/,/g, ''));
        const carDaysOnLot = Number(car.daysOnLot || 0);
        
        // Proxy for New vs Used if condition flag doesn't exist
        const isCarNew = carMilesNum < 500; 

        if (forceCondition === 'new' && !isCarNew) return false;
        if (forceCondition === 'used' && isCarNew) return false;
        if (forcedModel && car.model.toLowerCase() !== forcedModel) return false;

        if (activeDrawerType !== 'All' && car.type !== activeDrawerType) return false;
        if (activeMaxPrice && car.price > activeMaxPrice) return false;
        if (activeMaxMiles && carMilesNum > activeMaxMiles) return false;
        if (activeMinYear && car.year < activeMinYear) return false;

        if (activeQuickFilters.suv && car.type !== 'SUV') return false;
        if (activeQuickFilters.truck && car.type !== 'Truck') return false;
        if (activeQuickFilters.lowmiles && carMilesNum >= 60000) return false;
        if (activeQuickFilters.under25k && car.price > 25000) return false;
        if (activeQuickFilters.newarrival && carDaysOnLot > 30) return false;
        if (activeQuickFilters.under500mo && car.payment > 500) return false;

        const rawString = `${car.year} ${car.make} ${car.model} ${car.type} ${car.color} ${car.price} ${car.miles}`;
        if (!cleanSearchString(rawString).includes(cleanedSearchTerm)) return false;

        return true;
    });

    // 4. Sort or Randomize Logic
    if (isSurpriseMode) {
        // Shuffle the array randomly
        filteredVehicles = filteredVehicles.sort(() => 0.5 - Math.random());
        // Cap exactly at 8 cars
        filteredVehicles = filteredVehicles.slice(0, 8);
        
        counter.innerText = `8 Surprise Matches`;
        sentinel.classList.add('hidden'); // Disable infinite scroll
        if(surpriseControls) surpriseControls.classList.remove('hidden');
    } else {
        // Standard sort logic
        if (currentSort === 'price-low') filteredVehicles.sort((a, b) => a.price - b.price);
        else if (currentSort === 'price-high') filteredVehicles.sort((a, b) => b.price - a.price);
        else if (currentSort === 'miles-low') filteredVehicles.sort((a, b) => Number(String(a.miles).replace(/,/g,'')) - Number(String(b.miles).replace(/,/g,'')));
        else if (currentSort === 'miles-high') filteredVehicles.sort((a, b) => Number(String(b.miles).replace(/,/g,'')) - Number(String(a.miles).replace(/,/g,'')));
        else if (currentSort === 'year-new') filteredVehicles.sort((a, b) => b.year - a.year);
        else if (currentSort === 'year-old') filteredVehicles.sort((a, b) => a.year - b.year);

        counter.innerText = `${filteredVehicles.length} ${filteredVehicles.length === 1 ? 'Vehicle' : 'Vehicles'}`;
        sentinel.classList.remove('hidden'); // Re-enable scroll
        if(surpriseControls) surpriseControls.classList.add('hidden');
    }
    
    renderNextBatch();
    updateUIStates();
}

function updateUIStates() {
    let anyQuickActive = false;
    quickButtons.forEach(btn => {
        const key = btn.getAttribute('data-quick');
        if (activeQuickFilters[key]) {
            anyQuickActive = true;
            btn.className = "quick-btn shrink-0 border-2 border-slate-900 bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-md transition shadow-xs";
        } else {
            btn.className = "quick-btn shrink-0 bg-white border border-slate-300 text-slate-700 font-bold text-xs px-3 py-2 rounded-md transition shadow-xs";
        }
    });
    if (anyQuickActive) clearQuickBtn.classList.remove('hidden');
    else clearQuickBtn.classList.add('hidden');

    drawerFilterBtns.forEach(btn => {
        const type = btn.getAttribute('data-filter-type');
        const val = btn.getAttribute('data-value');
        let isActive = false;

        if (type === 'type' && activeDrawerType === val) isActive = true;
        if (type === 'price' && activeMaxPrice === Number(val)) isActive = true;
        if (type === 'miles' && activeMaxMiles === Number(val)) isActive = true;
        if (type === 'year' && activeMinYear === Number(val)) isActive = true;

        if (isActive) btn.className = "drawer-filter-btn border-2 border-amber-400 bg-amber-400 text-slate-950 py-2 px-2.5 rounded-md font-black text-xs transition text-center shadow-sm";
        else btn.className = "drawer-filter-btn border border-slate-700 bg-slate-800 text-slate-200 py-2 px-2.5 rounded-md font-bold text-xs transition text-center";
    });

    activeChipsContainer.innerHTML = '';
    let activeDrawerCount = 0;
    if (activeDrawerType !== 'All') { activeDrawerCount++; activeChipsContainer.innerHTML += `<button onclick="clearDrawerFilter('type')" class="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-md shadow-sm active:scale-95 transition cursor-pointer w-auto">${activeDrawerType} <i class="fa-solid fa-xmark ml-1 opacity-70"></i></button>`; }
    if (activeMaxPrice) { activeDrawerCount++; activeChipsContainer.innerHTML += `<button onclick="clearDrawerFilter('price')" class="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-md shadow-sm active:scale-95 transition cursor-pointer w-auto">Under $${(activeMaxPrice/1000).toFixed(0)}k <i class="fa-solid fa-xmark ml-1 opacity-70"></i></button>`; }
    if (activeMaxMiles) { activeDrawerCount++; activeChipsContainer.innerHTML += `<button onclick="clearDrawerFilter('miles')" class="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-md shadow-sm active:scale-95 transition cursor-pointer w-auto">&lt; ${(activeMaxMiles/1000).toFixed(0)}k mi <i class="fa-solid fa-xmark ml-1 opacity-70"></i></button>`; }
    if (activeMinYear) { activeDrawerCount++; activeChipsContainer.innerHTML += `<button onclick="clearDrawerFilter('year')" class="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-md shadow-sm active:scale-95 transition cursor-pointer w-auto">${activeMinYear}+ <i class="fa-solid fa-xmark ml-1 opacity-70"></i></button>`; }

    if (activeDrawerCount > 0) activeChipsContainer.classList.remove('hidden');
    else activeChipsContainer.classList.add('hidden');
}

window.clearDrawerFilter = function(filterKey) {
    if (filterKey === 'type') activeDrawerType = 'All';
    if (filterKey === 'price') activeMaxPrice = null;
    if (filterKey === 'miles') activeMaxMiles = null;
    if (filterKey === 'year') activeMinYear = null;
    processInventory(); 
};

// ------------------------------------------------------------------------
// EVENT LISTENERS
// ------------------------------------------------------------------------
quickButtons.forEach(btn => { btn.addEventListener('click', () => { activeQuickFilters[btn.getAttribute('data-quick')] = !activeQuickFilters[btn.getAttribute('data-quick')]; processInventory(); }); });
clearQuickBtn.addEventListener('click', () => { Object.keys(activeQuickFilters).forEach(k => activeQuickFilters[k] = false); processInventory(); });

drawerFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-filter-type'); const val = btn.getAttribute('data-value');
        if (type === 'type') activeDrawerType = (activeDrawerType === val) ? 'All' : val;
        if (type === 'price') activeMaxPrice = (activeMaxPrice === Number(val)) ? null : Number(val);
        if (type === 'miles') activeMaxMiles = (activeMaxMiles === Number(val)) ? null : Number(val);
        if (type === 'year') activeMinYear = (activeMinYear === Number(val)) ? null : Number(val);
        processInventory();
    });
});
resetAllBtn.addEventListener('click', () => { activeDrawerType = 'All'; activeMaxPrice = null; activeMaxMiles = null; activeMinYear = null; Object.keys(activeQuickFilters).forEach(k => activeQuickFilters[k] = false); processInventory(); });

searchInput.addEventListener('input', (e) => { 
    searchTerm = e.target.value.toLowerCase().trim(); 
    if (searchTerm.length > 0) clearSearchBtn.classList.remove('hidden');
    else clearSearchBtn.classList.add('hidden');
    processInventory(); 
});
clearSearchBtn.addEventListener('click', () => { searchInput.value = ''; searchTerm = ''; clearSearchBtn.classList.add('hidden'); processInventory(); searchInput.focus(); });
sortSelect.addEventListener('change', (e) => { currentSort = e.target.value; processInventory(); });

// Scroll behaviors
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isSurpriseMode && currentPage <= Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE)) {
        spinner.classList.remove('hidden');
        setTimeout(() => { renderNextBatch(); spinner.classList.add('hidden'); }, 250);
    }
}, { root: scrollContainer, rootMargin: '150px' });
observer.observe(sentinel);

scrollContainer.addEventListener('scroll', () => {
    // Hide global header on scroll down to save space
    if (scrollContainer.scrollTop > 50) {
        globalHeader.classList.add('-translate-y-full');
    } else {
        globalHeader.classList.remove('-translate-y-full');
    }

    if (scrollContainer.scrollTop > 120) {
        stickyBar.classList.remove('bg-white/80', 'backdrop-blur-sm'); stickyBar.classList.add('bg-slate-900', 'shadow-lg');
        filterIconBtn.className = "shrink-0 bg-white/10 hover:bg-white/20 text-white w-[46px] h-[46px] flex items-center justify-center rounded-lg transition border border-white/20 active:scale-95";
        scrollToTopBtn.classList.remove('hidden');
    } else {
        stickyBar.classList.remove('bg-slate-900', 'shadow-lg'); stickyBar.classList.add('bg-white/80', 'backdrop-blur-sm');
        filterIconBtn.className = "shrink-0 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 w-[46px] h-[46px] flex items-center justify-center rounded-lg transition shadow-sm active:scale-95";
        scrollToTopBtn.classList.add('hidden');
    }
}, { passive: true });

scrollToTopBtn.addEventListener('click', () => { scrollContainer.scrollTo({ top: 0, behavior: 'smooth' }); });

// Drawer Logic
function openDrawer() { drawerBackdrop.classList.remove('hidden'); drawer.classList.remove('translate-x-full'); }
function closeDrawer() { drawer.classList.add('translate-x-full'); drawerBackdrop.classList.add('hidden'); }
filterIconBtn.addEventListener('click', openDrawer); closeDrawerBtn.addEventListener('click', closeDrawer); doneDrawerBtn.addEventListener('click', closeDrawer); drawerBackdrop.addEventListener('click', closeDrawer);

// Surprise Me Controls Logic
if (surpriseAgainBtn) {
    surpriseAgainBtn.addEventListener('click', () => {
        processInventory(); 
        scrollContainer.scrollTo({top: 0, behavior: 'smooth'});
    });
}
if (showAllSurpriseBtn) {
    showAllSurpriseBtn.addEventListener('click', () => {
        isSurpriseMode = false;
        const url = new URL(window.location);
        url.searchParams.delete('mode');
        window.history.replaceState({}, '', url);
        processInventory();
    });
}

// ------------------------------------------------------------------------
// CTA MODAL LOGIC (Is It Here?)
// ------------------------------------------------------------------------
function openCtaModal() {
    ctaModalBackdrop.classList.remove('hidden');
    setTimeout(() => {
        ctaModalBackdrop.classList.remove('opacity-0');
        ctaModalBox.classList.remove('scale-95');
    }, 10);
}

function closeCtaModal() {
    ctaModalBackdrop.classList.add('opacity-0');
    ctaModalBox.classList.add('scale-95');
    setTimeout(() => {
        ctaModalBackdrop.classList.add('hidden');
        ctaFormStep.classList.remove('hidden');
        ctaSuccessStep.classList.add('hidden');
        ctaLeadForm.reset();
    }, 300);
}

document.addEventListener('click', (e) => {
    if (e.target.closest('.cta-trigger-btn')) openCtaModal();
});
ctaCloseBtn.addEventListener('click', closeCtaModal);
ctaReturnBtn.addEventListener('click', closeCtaModal);
ctaModalBackdrop.addEventListener('click', (e) => { if(e.target === ctaModalBackdrop) closeCtaModal(); });
ctaLeadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    ctaFormStep.classList.add('hidden');
    ctaSuccessStep.classList.remove('hidden');
});

// Init
function initApp() {
    if (typeof allVehicles !== 'undefined' && Array.isArray(allVehicles)) {
        renderViewedCars(); 
        processInventory();
    } else { setTimeout(initApp, 100); }
}
initApp();
