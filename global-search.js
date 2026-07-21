(function() {
    // 1. Create the Widget HTML Structure
    const widgetHTML = `
        <div id="cb-bottom-search" class="fixed bottom-6 left-4 right-4 max-w-md mx-auto bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-full px-4 py-3.5 flex items-center gap-3 z-[50] transition-transform duration-300 ease-in-out cursor-pointer active:scale-[0.98]">
            <i class="fa-solid fa-magnifying-glass text-blue-600"></i>
            <span class="text-slate-400 font-medium text-sm">Search 1,000+ vehicles...</span>
        </div>

        <div id="cb-search-modal" class="fixed inset-0 bg-slate-100 z-[9999] flex flex-col transition-opacity duration-200 opacity-0 pointer-events-none">
            
            <div class="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center gap-3">
                <div class="flex-grow relative flex items-center bg-slate-100 rounded-xl px-3 py-2.5">
                    <i class="fa-solid fa-magnifying-glass text-slate-400 text-sm mr-2"></i>
                    <input type="text" id="cb-modal-input" placeholder="Search make, model, style..." class="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-base font-medium">
                </div>
                <button id="cb-cancel-btn" class="text-blue-600 font-bold text-sm px-2 active:text-blue-800 transition">Close</button>
            </div>

            <div class="p-4 flex-grow overflow-y-auto">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Trending Searches</h3>
                <div class="flex flex-wrap gap-2">
                    <button class="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg shadow-sm active:bg-slate-50 transition">Fast Red Cars</button>
                    <button class="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg shadow-sm active:bg-slate-50 transition">SUVs under $30k</button>
                    <button class="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg shadow-sm active:bg-slate-50 transition">Honda Accord</button>
                    <button class="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg shadow-sm active:bg-slate-50 transition">3rd Row Seating</button>
                    <button class="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg shadow-sm active:bg-slate-50 transition">Ford F-150</button>
                </div>
            </div>
        </div>
    `;

    // 2. Inject Widget into the DOM
    const wrapper = document.createElement('div');
    wrapper.innerHTML = widgetHTML;
    document.body.appendChild(wrapper);

    // 3. Cache DOM Elements
    const bottomSearch = document.getElementById('cb-bottom-search');
    const searchModal = document.getElementById('cb-search-modal');
    const modalInput = document.getElementById('cb-modal-input');
    const cancelBtn = document.getElementById('cb-cancel-btn');

    // 4. Scroll-Aware Logic for Widget (Hide on scroll down, Reveal on scroll up)
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY + 10) {
            bottomSearch.style.transform = 'translateY(150%)'; // Hide
        } else if (currentScrollY < lastScrollY - 10) {
            bottomSearch.style.transform = 'translateY(0)'; // Reveal
        }
        lastScrollY = currentScrollY;
    }, { passive: true });

    // 5. Full-Screen Modal Mechanics
    bottomSearch.addEventListener('click', () => {
        searchModal.classList.remove('opacity-0', 'pointer-events-none');
        searchModal.classList.add('opacity-100', 'pointer-events-auto');
        setTimeout(() => { modalInput.focus(); }, 200);
    });

    cancelBtn.addEventListener('click', () => {
        searchModal.classList.remove('opacity-100', 'pointer-events-auto');
        searchModal.classList.add('opacity-0', 'pointer-events-none');
        modalInput.blur();
    });

    // We will wire the actual search filtering/redirect logic in Step 3!
})();
