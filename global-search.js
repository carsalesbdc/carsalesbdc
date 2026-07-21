(function() {
    // 1. Build the Widget HTML Structure (Compact ~30% Bottom Sheet)
    const widgetHTML = `
        <div id="cb-bottom-search" class="fixed bottom-6 left-4 right-4 max-w-md mx-auto bg-white border-2 border-blue-500 shadow-2xl shadow-blue-900/20 rounded-full px-4 py-3.5 flex items-center gap-3 z-[50] transition-transform duration-300 ease-in-out cursor-pointer select-none">
            <i class="fa-solid fa-magnifying-glass text-blue-600"></i>
            <span class="text-slate-400 font-medium text-sm">Search vehicles...</span>
        </div>

        <div id="cb-search-modal" class="fixed inset-x-0 bottom-0 h-[32vh] bg-slate-100 rounded-t-2xl shadow-2xl z-[9999] flex flex-col transition-all duration-300 transform translate-y-full opacity-0 pointer-events-none">
            
            <div class="bg-white px-4 pt-3 pb-3 rounded-t-2xl shadow-sm flex items-center gap-3">
                <div class="flex-grow relative flex items-center bg-slate-100 rounded-xl px-3 py-2">
                    <i class="fa-solid fa-magnifying-glass text-slate-400 text-sm mr-2"></i>
                    <input type="text" id="cb-modal-input" placeholder="Search make, model, style..." class="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-base font-medium">
                </div>
                <button id="cb-cancel-btn" class="text-blue-600 font-bold text-sm px-2 active:text-blue-800 transition">Close</button>
            </div>

            <div class="p-3 flex-grow overflow-y-auto">
                <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Trending Searches</h3>
                <div class="flex flex-wrap gap-1.5">
                    <button class="trend-pill bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm active:bg-slate-50 transition">Fast Red Cars</button>
                    <button class="trend-pill bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm active:bg-slate-50 transition">SUVs under $30k</button>
                    <button class="trend-pill bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm active:bg-slate-50 transition">Honda Accord</button>
                    <button class="trend-pill bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm active:bg-slate-50 transition">3rd Row Seating</button>
                </div>
            </div>
        </div>
    `;

    // 2. Inject into DOM
    const wrapper = document.createElement('div');
    wrapper.innerHTML = widgetHTML;
    document.body.appendChild(wrapper);

    // 3. Cache Elements
    const bottomSearch = document.getElementById('cb-bottom-search');
    const searchModal = document.getElementById('cb-search-modal');
    const modalInput = document.getElementById('cb-modal-input');
    const cancelBtn = document.getElementById('cb-cancel-btn');
    const trendPills = document.querySelectorAll('.trend-pill');

    // 4. Scroll-Aware Logic with zero-lag tap safety
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY + 15) {
            bottomSearch.style.transform = 'translateY(150%)';
        } else if (currentScrollY < lastScrollY - 15) {
            bottomSearch.style.transform = 'translateY(0)';
        }
        lastScrollY = currentScrollY;
    }, { passive: true });

    // 5. Open Modal Sheet instantly on a single click without blocking scroll interruption
    bottomSearch.addEventListener('click', (e) => {
        e.stopPropagation();
        searchModal.classList.remove('translate-y-full', 'opacity-0', 'pointer-events-none');
        searchModal.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
        setTimeout(() => { modalInput.focus(); }, 100);
    });

    // 6. Close Modal Function (Auto-dismisses and applies search filter)
    function closeModal() {
        searchModal.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
        searchModal.classList.add('translate-y-full', 'opacity-0', 'pointer-events-none');
        modalInput.blur();
    }

    cancelBtn.addEventListener('click', closeModal);

    // Close automatically when hitting Enter in search
    modalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            closeModal();
        }
    });

    // Close automatically when clicking a trending pill
    trendPills.forEach(pill => {
        pill.addEventListener('click', () => {
            modalInput.value = pill.innerText;
            closeModal();
        });
    });
})();
