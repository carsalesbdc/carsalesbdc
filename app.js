// Pagination Config
const ITEMS_PER_PAGE = 24;
let filteredVehicles = []; 
let currentPage = 1;

// Filter Variables State
let activeType = 'All', searchTerm = '', currentSort = 'default';
let activeMaxPrice = null;
let activeMaxMiles = null;
let activeMinYear = null;

// DOM Handles
const scrollContainer = document.getElementById('scroll-main');
const grid = document.getElementById('vehicle-grid');
const searchInput = document.getElementById('search-input');
const typeButtons = document.querySelectorAll('.type-btn');
const sortSelect = document.getElementById('sort-select');
const counter = document.getElementById('vehicle-counter');
const sentinel = document.getElementById('scroll-sentinel');
const spinner = document.getElementById('spinner');

// Nav / Drawer Handles
const stickyBar = document.getElementById('sticky-search-bar');
const filterIconBtn = document.getElementById('filter-icon-btn');
const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

const drawerBackdrop = document.getElementById('filter-drawer-backdrop');
const drawer = document.getElementById('filter-drawer');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const doneDrawerBtn = document.getElementById('done-drawer-btn');
const resetAllBtn = document.getElementById('reset-all-filters-btn');
const activeChipsContainer = document.getElementById('active-chips-container');
const drawerFilterBtns = document.querySelectorAll('.drawer-filter-btn');

// Render Vehicle Cards
function renderNextBatch() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const batch = filteredVehicles.slice(start, end);

    if (batch.length === 0 && currentPage === 1) {
        grid.innerHTML = `<div class="col-span-2 text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300"><p>No vehicles found.</p></div>`;
        return;
    }

    let htmlString = '';
    batch.forEach(car => {
        htmlString += `
            <article class="bg-white border border-slate-300/80 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm transition transform active:scale-[0.99]">
                <a href="vdp.html?id=${car.id}" class="block cursor-pointer flex-grow">
                    <div class="p-2 pb-0">
                        <div class="relative aspect-[4/3] bg-slate-100 w-[104%] -ml-[2%] rounded-xl overflow-hidden shadow-sm border border-slate-300/30">
                            <img src="${car.img}" alt="${car.year} ${car.make} ${car.model}" class="w-full h-full object-cover rounded-xl" loading="lazy">
                        </div>
                    </div>
                    <div class="p-2.5 flex flex-col justify-between">
                        <div>
                            <h2 class="text-base font-bold text-slate-800 tracking-tight truncate leading-tight">${car.year} ${car.make} ${car.model}</h2>
                            <div class="flex flex-wrap items-center gap-x-1.5 mt-1 text-xs text-slate-500">
                                <span>${car.miles} mi</span><span>•</span><span class="${car.colorClass} font-semibold truncate max-w-[85px]">${car.color}</span>
                            </div>
                        </div>
                        <div class="mt-3">
                            <div class="flex items-center justify-between gap-1">
                                <div class="text-base font-black text-emerald-600 leading-none">$${car.price.toLocaleString()}</div>
                                <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider">${car.type}</span>
                            </div>
                            <div class="text-[11px] text-slate-500 mt-1 font-medium">Est. $${car.payment}/mo</div>
                        </div>
                    </div>
                </a>
                <div class="p-2 pt-0 grid grid-cols-5 gap-1">
                    <button class="col-span-4 bg-blue-600 active:bg-blue-700 text-white font-bold text-[10px] py-2 rounded-md transition tracking-wide shadow-sm truncate">Check Availability</button>
                    <a href="tel:5733564614" class="col-span-1 border border-slate-200 active:bg-slate-50 flex items-center justify-center rounded-md text-blue-600"><i class="fa-solid fa-phone text-xs"></i></a>
                </div>
            </article>
        `;
    });

    grid.insertAdjacentHTML('beforeend', htmlString);
    currentPage++;
}

// Process Inventory Logic
function processInventory() {
    grid.innerHTML = ''; 
    currentPage = 1;

    filteredVehicles = allVehicles.filter(car => {
        const matchesType = (activeType === 'All' || car.type === activeType);
        const masterSearchString = `${car.year} ${car.make} ${car.model} ${car.type} ${car.color} ${car.price} ${car.miles}`.toLowerCase();
        const matchesSearch = masterSearchString.includes(searchTerm);

        const carMilesNum = Number(car.miles.replace(/,/g, ''));

        const matchesPrice = !activeMaxPrice || (car.price <= activeMaxPrice);
        const matchesMiles = !activeMaxMiles || (carMilesNum <= activeMaxMiles);
        const matchesYear = !activeMinYear || (car.year >= activeMinYear);

        return matchesType && matchesSearch && matchesPrice && matchesMiles && matchesYear;
    });

    if (currentSort === 'price-low') filteredVehicles.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price-high') filteredVehicles.sort((a, b) => b.price - a.price);
    else if (currentSort === 'year-new') filteredVehicles.sort((a, b) => b.year - a.year);

    counter.innerText = `${filteredVehicles.length} ${filteredVehicles.length === 1 ? 'Vehicle' : 'Vehicles'}`;
    
    renderNextBatch();
}

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

typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        activeType = btn.getAttribute('data-type');
        updateUIStates();
        processInventory();
    });
});

// SCROLL LOGIC: Navy Shift, Filter Reveal, and Scroll-To-Top Arrow
scrollContainer.addEventListener('scroll', () => {
    if (scrollContainer.scrollTop > 70) {
        stickyBar.classList.remove('bg-white/80', 'backdrop-blur-sm');
        stickyBar.classList.add('bg-slate-900', 'shadow-lg');
        filterIconBtn.classList.remove('hidden');
        scrollToTopBtn.classList.remove('hidden');
    } else {
        stickyBar.classList.remove('bg-slate-900', 'shadow-lg');
        stickyBar.classList.add('bg-white/80', 'backdrop-blur-sm');
        filterIconBtn.classList.add('hidden');
        scrollToTopBtn.classList.add('hidden');
    }
}, { passive: true });

// Scroll-to-Top Button Click Handler
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

// Update Yellow Highlight States & Render Yellow Tiles
function updateUIStates() {
    drawerFilterBtns.forEach(btn => {
        const type = btn.getAttribute('data-filter-type');
        const val = btn.getAttribute('data-value');
        let isActive = false;

        if (type === 'type' && activeType === val) isActive = true;
        if (type === 'price' && activeMaxPrice === Number(val)) isActive = true;
        if (type === 'miles' && activeMaxMiles === Number(val)) isActive = true;
        if (type === 'year' && activeMinYear === Number(val)) isActive = true;

        if (isActive) {
            btn.className = "drawer-filter-btn border-2 border-amber-400 bg-amber-400 text-slate-950 py-1.5 px-2 rounded-md font-black text-xs transition text-center shadow-sm";
        } else {
            btn.className = "drawer-filter-btn border border-slate-700 bg-slate-800 text-slate-200 py-1.5 px-2 rounded-md font-bold text-xs transition text-center";
        }
    });

    typeButtons.forEach(b => {
        if(b.getAttribute('data-type') === activeType) {
            b.className = "type-btn shrink-0 bg-slate-900 text-white font-semibold text-xs px-3.5 py-1.5 rounded-md transition shadow-sm";
        } else {
            b.className = "type-btn shrink-0 bg-white border border-slate-300 text-slate-700 font-semibold text-xs px-3.5 py-1.5 rounded-md transition";
        }
    });

    activeChipsContainer.innerHTML = '';
    let activeCount = 0;

    if (activeType !== 'All') {
        activeCount++;
        activeChipsContainer.innerHTML += `<button onclick="clearSingleFilter('type')" class="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded-md shadow-xs active:scale-95 transition cursor-pointer">${activeType} <span class="font-black opacity-70">✕</span></button>`;
    }
    if (activeMaxPrice) {
        activeCount++;
        activeChipsContainer.innerHTML += `<button onclick="clearSingleFilter('price')" class="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded-md shadow-xs active:scale-95 transition cursor-pointer">Under $${(activeMaxPrice/1000).toFixed(0)}k <span class="font-black opacity-70">✕</span></button>`;
    }
    if (activeMaxMiles) {
        activeCount++;
        activeChipsContainer.innerHTML += `<button onclick="clearSingleFilter('miles')" class="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded-md shadow-xs active:scale-95 transition cursor-pointer">&lt; ${(activeMaxMiles/1000).toFixed(0)}k mi <span class="font-black opacity-70">✕</span></button>`;
    }
    if (activeMinYear) {
        activeCount++;
        activeChipsContainer.innerHTML += `<button onclick="clearSingleFilter('year')" class="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded-md shadow-xs active:scale-95 transition cursor-pointer">${activeMinYear}+ <span class="font-black opacity-70">✕</span></button>`;
    }

    if (activeCount > 0) {
        activeChipsContainer.classList.remove('hidden');
    } else {
        activeChipsContainer.classList.add('hidden');
    }
}

window.clearSingleFilter = function(type) {
    if (type === 'type') activeType = 'All';
    if (type === 'price') activeMaxPrice = null;
    if (type === 'miles') activeMaxMiles = null;
    if (type === 'year') activeMinYear = null;
    updateUIStates();
    processInventory();
};

drawerFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-filter-type');
        const val = btn.getAttribute('data-value');

        if (type === 'type') activeType = (activeType === val) ? 'All' : val;
        if (type === 'price') activeMaxPrice = (activeMaxPrice === Number(val)) ? null : Number(val);
        if (type === 'miles') activeMaxMiles = (activeMaxMiles === Number(val)) ? null : Number(val);
        if (type === 'year') activeMinYear = (activeMinYear === Number(val)) ? null : Number(val);

        updateUIStates();
        processInventory();
    });
});

resetAllBtn.addEventListener('click', () => {
    activeType = 'All';
    activeMaxPrice = null;
    activeMaxMiles = null;
    activeMinYear = null;
    updateUIStates();
    processInventory();
});

// Initial Load
filteredVehicles = [...allVehicles];
updateUIStates();
processInventory();
