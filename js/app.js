/**
 * TechStock Pro WMS — Main Application Controller
 * บริหารจัดการสต็อกสินค้าคอมพิวเตอร์ 50 รายการ พร้อมระบบรับเข้า-เบิกออก บาร์โค้ด วิเคราะห์คลัง และส่งออกรายงาน
 */

const STORAGE_KEY_PRODUCTS = 'techstock_pro_products_v2';
const STORAGE_KEY_LOGS = 'techstock_pro_logs_v2';
const STORAGE_KEY_THEME = 'techstock_pro_theme_v1';

let state = {
  products: [],
  logs: [],
  activeTab: 'catalog',
  selectedCategory: 'ALL',
  searchQuery: '',
  statusFilter: 'ALL',
  brandFilter: 'ALL',
  sortBy: 'SKU_ASC',
  viewMode: 'grid', // 'grid' or 'table'
  uploadedImageBase64: ''
};

// ======================= INITIALIZATION =======================
document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();
  initTheme();
  populateBrandDropdown();
  renderAll();

  // Close modal when clicking on backdrop or pressing Escape
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach((m) => m.classList.remove('open'));
    }
  });
});

function loadStateFromStorage() {
  try {
    const savedProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);

    if (savedProducts) {
      const parsed = JSON.parse(savedProducts);
      state.products = Array.isArray(parsed) && parsed.length > 0 ? parsed : structuredClone(window.INITIAL_PRODUCTS);
    } else {
      state.products = structuredClone(window.INITIAL_PRODUCTS);
    }

    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs);
      state.logs = Array.isArray(parsedLogs) ? parsedLogs : structuredClone(window.INITIAL_STOCK_LOGS);
    } else {
      state.logs = structuredClone(window.INITIAL_STOCK_LOGS);
    }
  } catch (err) {
    console.error('Error loading storage:', err);
    state.products = structuredClone(window.INITIAL_PRODUCTS);
    state.logs = structuredClone(window.INITIAL_STOCK_LOGS);
  }
}

function saveStateToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(state.products));
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(state.logs));
  } catch (err) {
    console.error('Error saving storage:', err);
  }
}

// ======================= UTILITIES =======================
function formatCurrency(num) {
  return '฿' + Number(num || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 });
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString('th-TH');
}

function getNowTimestamp() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function getStockStatus(product) {
  if (product.stock <= 0) {
    return { code: 'OUT', label: 'สินค้าหมด', badgeClass: 'badge-outstock', dotColor: 'bg-rose-500' };
  }
  if (product.stock <= product.minStock) {
    return { code: 'LOW', label: 'ใกล้หมด', badgeClass: 'badge-lowstock', dotColor: 'bg-amber-400' };
  }
  return { code: 'INSTOCK', label: 'พร้อมขาย', badgeClass: 'badge-instock', dotColor: 'bg-emerald-400' };
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const borderColors = {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  };

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.style.borderLeftColor = borderColors[type] || borderColors.info;
  toast.innerHTML = `
    <span class="font-medium">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 220);
  }, 3200);
}

// ======================= THEME CONTROLLER =======================
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-mode');
  } else {
    document.documentElement.classList.remove('light-mode');
  }
}

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light-mode');
  localStorage.setItem(STORAGE_KEY_THEME, isLight ? 'light' : 'dark');
  showToast(isLight ? 'เปลี่ยนเป็นโหมดสว่าง (Light Mode)' : 'เปลี่ยนเป็นโหมดมืด (Dark Mode)', 'info');
}

// ======================= MASTER RENDER =======================
function renderAll() {
  renderKPISummary();
  renderCategoryPills();
  renderProductsCatalog();
  renderAnalyticsAndReorder();
  renderStockHistory();
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ======================= 1. KPI DASHBOARD =======================
function renderKPISummary() {
  const totalSkus = state.products.length;
  let totalUnits = 0;
  let totalCostValue = 0;
  let totalRetailValue = 0;
  let inStockCount = 0;
  let lowStockCount = 0;
  let outStockCount = 0;

  state.products.forEach((p) => {
    totalUnits += p.stock;
    totalCostValue += p.costPrice * p.stock;
    totalRetailValue += p.sellPrice * p.stock;

    const st = getStockStatus(p).code;
    if (st === 'OUT') outStockCount++;
    else if (st === 'LOW') lowStockCount++;
    else inStockCount++;
  });

  const estProfit = totalRetailValue - totalCostValue;
  const avgCost = totalUnits > 0 ? Math.round(totalCostValue / totalUnits) : 0;

  document.getElementById('nav-sku-count').textContent = totalSkus;
  document.getElementById('nav-alert-badge').textContent = lowStockCount + outStockCount;

  document.getElementById('kpi-total-skus').textContent = formatNumber(totalSkus);
  document.getElementById('kpi-total-units').textContent = formatNumber(totalUnits);
  document.getElementById('kpi-cost-value').textContent = formatCurrency(totalCostValue);
  document.getElementById('kpi-avg-cost').textContent = formatCurrency(avgCost);
  document.getElementById('kpi-retail-value').textContent = formatCurrency(totalRetailValue);
  document.getElementById('kpi-est-profit').textContent = '+' + formatCurrency(estProfit);
  document.getElementById('kpi-instock-count').textContent = formatNumber(inStockCount);
  document.getElementById('kpi-lowstock-count').textContent = formatNumber(lowStockCount);
  document.getElementById('kpi-outstock-count').textContent = formatNumber(outStockCount);
}

// ======================= 2. CATEGORY PILLS & BRANDS =======================
function renderCategoryPills() {
  const container = document.getElementById('category-pills-container');
  if (!container) return;

  const counts = { ALL: state.products.length };
  state.products.forEach((p) => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });

  container.innerHTML = window.CATEGORIES.map((cat) => {
    const count = counts[cat.id] || 0;
    const isActive = state.selectedCategory === cat.id;
    return `
      <button onclick="selectCategory('${cat.id}')" class="category-pill ${isActive ? 'active' : ''}">
        <span>${escapeHtml(cat.name)}</span>
        <span class="px-1.5 py-0.5 text-[11px] rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'} font-mono-code">${count}</span>
      </button>
    `;
  }).join('');
}

function populateBrandDropdown() {
  const select = document.getElementById('brand-filter');
  if (!select) return;

  const currentVal = select.value || 'ALL';
  const brands = Array.from(new Set(state.products.map((p) => p.brand))).sort();

  select.innerHTML = `<option value="ALL">แบรนด์: ทั้งหมด (${brands.length})</option>` +
    brands.map((b) => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
  select.value = brands.includes(currentVal) ? currentVal : 'ALL';
}

function selectCategory(catId) {
  state.selectedCategory = catId;
  renderCategoryPills();
  renderProductsCatalog();
  if (window.lucide) window.lucide.createIcons();
}

function filterByStatus(statusCode) {
  switchMainTab('catalog');
  state.statusFilter = statusCode;
  const statusSelect = document.getElementById('status-filter');
  if (statusSelect) statusSelect.value = statusCode;
  renderProductsCatalog();
  if (window.lucide) window.lucide.createIcons();
}

function handleFilterChange() {
  const qInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  state.searchQuery = (qInput ? qInput.value : '').trim();

  if (clearBtn) {
    clearBtn.classList.toggle('hidden', state.searchQuery.length === 0);
  }

  state.statusFilter = document.getElementById('status-filter').value;
  state.brandFilter = document.getElementById('brand-filter').value;
  state.sortBy = document.getElementById('sort-select').value;

  renderProductsCatalog();
  if (window.lucide) window.lucide.createIcons();
}

function clearSearchInput() {
  const qInput = document.getElementById('search-input');
  if (qInput) qInput.value = '';
  handleFilterChange();
}

function resetFilters() {
  state.selectedCategory = 'ALL';
  state.searchQuery = '';
  state.statusFilter = 'ALL';
  state.brandFilter = 'ALL';
  state.sortBy = 'SKU_ASC';

  document.getElementById('search-input').value = '';
  document.getElementById('clear-search-btn').classList.add('hidden');
  document.getElementById('status-filter').value = 'ALL';
  document.getElementById('brand-filter').value = 'ALL';
  document.getElementById('sort-select').value = 'SKU_ASC';

  renderCategoryPills();
  renderProductsCatalog();
  if (window.lucide) window.lucide.createIcons();
}

function setViewMode(mode) {
  state.viewMode = mode;
  const gridBtn = document.getElementById('view-btn-grid');
  const tableBtn = document.getElementById('view-btn-table');
  const gridView = document.getElementById('products-grid-view');
  const tableView = document.getElementById('products-table-view');

  if (mode === 'grid') {
    gridBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition bg-blue-600 text-white';
    tableBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition text-slate-400 hover:text-white';
    gridView.classList.remove('hidden');
    tableView.classList.add('hidden');
  } else {
    tableBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition bg-blue-600 text-white';
    gridBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition text-slate-400 hover:text-white';
    tableView.classList.remove('hidden');
    gridView.classList.add('hidden');
  }
  renderProductsCatalog();
  if (window.lucide) window.lucide.createIcons();
}

// ======================= 3. PRODUCT CATALOG RENDERING =======================
function getFilteredAndSortedProducts() {
  const q = state.searchQuery.toLowerCase();

  let list = state.products.filter((p) => {
    if (state.selectedCategory !== 'ALL' && p.category !== state.selectedCategory) return false;
    if (state.brandFilter !== 'ALL' && p.brand !== state.brandFilter) return false;

    if (state.statusFilter !== 'ALL') {
      const st = getStockStatus(p).code;
      if (st !== state.statusFilter) return false;
    }

    if (q) {
      const haystack = `${p.id} ${p.name} ${p.brand} ${p.category} ${p.specs} ${p.location} ${p.barcode} ${p.supplier}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  list.sort((a, b) => {
    switch (state.sortBy) {
      case 'STOCK_ASC': return a.stock - b.stock;
      case 'STOCK_DESC': return b.stock - a.stock;
      case 'PRICE_DESC': return b.sellPrice - a.sellPrice;
      case 'PRICE_ASC': return a.sellPrice - b.sellPrice;
      case 'VALUE_DESC': return (b.costPrice * b.stock) - (a.costPrice * a.stock);
      case 'NAME_ASC': return a.name.localeCompare(b.name, 'th');
      case 'SKU_ASC':
      default:
        return a.id.localeCompare(b.id, undefined, { numeric: true });
    }
  });

  return list;
}

function renderProductsCatalog() {
  const filtered = getFilteredAndSortedProducts();
  const gridContainer = document.getElementById('products-grid-view');
  const tableBody = document.getElementById('products-table-body');
  const emptyState = document.getElementById('empty-state');

  const filteredCostVal = filtered.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
  document.getElementById('showing-count').textContent = filtered.length;
  document.getElementById('total-count').textContent = state.products.length;
  document.getElementById('filtered-value').textContent = formatCurrency(filteredCostVal);

  if (filtered.length === 0) {
    gridContainer.classList.add('hidden');
    document.getElementById('products-table-view').classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  if (state.viewMode === 'grid') {
    gridContainer.classList.remove('hidden');
    document.getElementById('products-table-view').classList.add('hidden');
  } else {
    gridContainer.classList.add('hidden');
    document.getElementById('products-table-view').classList.remove('hidden');
  }

  // Render Grid Cards
  gridContainer.innerHTML = filtered.map((p) => {
    const status = getStockStatus(p);
    const imgSrc = window.generateProductImageDataUri(p);
    const profit = p.sellPrice - p.costPrice;
    const stockPct = Math.min(100, Math.round((p.stock / Math.max(p.minStock * 3, 15)) * 100));
    const barColor = status.code === 'OUT' ? 'bg-rose-500' : (status.code === 'LOW' ? 'bg-amber-400' : 'bg-emerald-500');

    return `
      <article class="product-grid-card">
        <!-- Product Image Header -->
        <div class="product-img-wrapper cursor-pointer" onclick="openDetailModal('${p.id}')">
          <img src="${imgSrc}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="window.handleProductImageError(this, '${p.id}')" />
          <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span class="badge-status ${status.badgeClass} shadow-md backdrop-blur-md">
              <span class="w-1.5 h-1.5 rounded-full ${status.dotColor}"></span>
              ${status.label}
            </span>
          </div>
          <div class="absolute top-2.5 right-2.5">
            <span class="px-2 py-0.5 rounded-md bg-slate-950/85 text-cyan-300 border border-slate-700 text-[11px] font-mono-code font-semibold">
              📍 ${escapeHtml(p.location)}
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span class="font-mono-code font-semibold text-blue-400">${escapeHtml(p.id)}</span>
              <span>${escapeHtml(p.category)}</span>
            </div>
            <h3 onclick="openDetailModal('${p.id}')" class="font-semibold text-sm leading-snug line-clamp-2 hover:text-blue-400 cursor-pointer transition" title="${escapeHtml(p.name)}">
              ${escapeHtml(p.name)}
            </h3>
            <p class="text-xs text-slate-400 line-clamp-1 mt-1" title="${escapeHtml(p.specs)}">
              ${escapeHtml(p.specs)}
            </p>
          </div>

          <div class="space-y-2.5 pt-2 border-t border-slate-800/80">
            <!-- Price Row -->
            <div class="flex items-baseline justify-between">
              <div>
                <span class="text-[11px] text-slate-400 block">ราคาขายหน้าร้าน</span>
                <span class="text-base font-bold font-mono-code text-cyan-400">${formatCurrency(p.sellPrice)}</span>
              </div>
              <div class="text-right">
                <span class="text-[11px] text-slate-400 block">ทุน ${formatCurrency(p.costPrice)}</span>
                <span class="text-[11px] font-mono-code text-emerald-400">+${formatCurrency(profit)}/ชิ้น</span>
              </div>
            </div>

            <!-- Stock Bar & Quick Stepper -->
            <div class="p-2.5 rounded-xl surface-elevated space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400">คงเหลือ (ขั้นต่ำ ${p.minStock}):</span>
                <strong class="font-mono-code text-sm ${status.code === 'OUT' ? 'text-rose-400' : (status.code === 'LOW' ? 'text-amber-400' : 'text-white')}">
                  ${p.stock} ชิ้น
                </strong>
              </div>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full ${barColor} transition-all duration-300" style="width: ${stockPct}%"></div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between gap-1.5 pt-1 no-print">
              <div class="inline-flex items-center rounded-lg border border-slate-700 overflow-hidden">
                <button onclick="quickAdjustStock('${p.id}', -1)" title="เบิกออกด่วน 1 ชิ้น" class="px-2.5 py-1.5 bg-slate-800/90 hover:bg-rose-600/30 text-slate-200 text-xs font-bold transition">
                  -1
                </button>
                <button onclick="openStockMovementModal('${p.id}', 'IN')" title="ทำรายการรับเข้า/เบิกออก" class="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-emerald-400 border-x border-slate-700 transition">
                  รับ/เบิก
                </button>
                <button onclick="quickAdjustStock('${p.id}', 1)" title="รับเข้าด่วน 1 ชิ้น" class="px-2.5 py-1.5 bg-slate-800/90 hover:bg-emerald-600/30 text-slate-200 text-xs font-bold transition">
                  +1
                </button>
              </div>

              <div class="flex items-center gap-1">
                <button onclick="openDetailModal('${p.id}')" title="ดูรายละเอียด & พิมพ์บาร์โค้ด" class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 transition">
                  <i data-lucide="qr-code" class="w-4 h-4"></i>
                </button>
                <button onclick="openProductModal('${p.id}')" title="แก้ไขข้อมูลสินค้า" class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 transition">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button onclick="deleteProduct('${p.id}')" title="ลบสินค้า" class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 transition">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Render Table Rows
  tableBody.innerHTML = filtered.map((p) => {
    const status = getStockStatus(p);
    const imgSrc = window.generateProductImageDataUri(p);
    const profit = p.sellPrice - p.costPrice;
    const totalVal = p.costPrice * p.stock;

    return `
      <tr>
        <td>
          <div class="flex items-center gap-3">
            <img onclick="openDetailModal('${p.id}')" src="${imgSrc}" alt="${escapeHtml(p.name)}" onerror="window.handleProductImageError(this, '${p.id}')" class="w-16 h-12 rounded-lg object-contain bg-white p-1 border border-slate-700 cursor-pointer shrink-0" />
            <div class="min-w-0 max-w-md">
              <div onclick="openDetailModal('${p.id}')" class="font-semibold text-sm hover:text-blue-400 cursor-pointer truncate" title="${escapeHtml(p.name)}">
                ${escapeHtml(p.name)}
              </div>
              <div class="text-xs text-slate-400 truncate mt-0.5">
                แบรนด์: <span class="text-slate-300 font-medium">${escapeHtml(p.brand)}</span> • ประกัน: ${escapeHtml(p.warranty)}
              </div>
            </div>
          </div>
        </td>
        <td>
          <div class="font-mono-code font-bold text-xs text-blue-400">${escapeHtml(p.id)}</div>
          <div class="text-xs text-slate-400 font-mono-code mt-0.5">📍 ชั้นวาง: ${escapeHtml(p.location)}</div>
        </td>
        <td>
          <span class="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">${escapeHtml(p.category)}</span>
        </td>
        <td class="text-right font-mono-code text-slate-300">${formatCurrency(p.costPrice)}</td>
        <td class="text-right">
          <div class="font-mono-code font-bold text-cyan-400">${formatCurrency(p.sellPrice)}</div>
          <div class="text-[11px] font-mono-code text-emerald-400">+${formatCurrency(profit)}</div>
        </td>
        <td class="text-center">
          <div class="font-mono-code text-base font-bold ${status.code === 'OUT' ? 'text-rose-400' : (status.code === 'LOW' ? 'text-amber-400' : 'text-white')}">${p.stock}</div>
          <div class="text-[11px] text-slate-400">ขั้นต่ำ ${p.minStock}</div>
        </td>
        <td class="text-center">
          <span class="badge-status ${status.badgeClass}">
            <span class="w-1.5 h-1.5 rounded-full ${status.dotColor}"></span>
            ${status.label}
          </span>
        </td>
        <td class="text-right font-mono-code font-semibold">${formatCurrency(totalVal)}</td>
        <td class="text-center no-print">
          <div class="inline-flex items-center gap-1">
            <button onclick="quickAdjustStock('${p.id}', -1)" class="px-2 py-1 rounded bg-slate-800 hover:bg-rose-600/30 text-xs font-bold">-1</button>
            <button onclick="openStockMovementModal('${p.id}', 'IN')" class="px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold">รับ/เบิก</button>
            <button onclick="quickAdjustStock('${p.id}', 1)" class="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600/30 text-xs font-bold">+1</button>
            <button onclick="openDetailModal('${p.id}')" title="บาร์โค้ด/รายละเอียด" class="p-1.5 rounded bg-slate-800 hover:bg-blue-600/30 text-slate-300"><i data-lucide="qr-code" class="w-3.5 h-3.5"></i></button>
            <button onclick="openProductModal('${p.id}')" title="แก้ไข" class="p-1.5 rounded bg-slate-800 hover:bg-amber-600/30 text-slate-300"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ======================= 4. STOCK MOVEMENT & QUICK ADJUST =======================
function quickAdjustStock(sku, delta) {
  const product = state.products.find((p) => p.id === sku);
  if (!product) return;

  if (product.stock + delta < 0) {
    showToast(`ไม่สามารถเบิกออกได้ เนื่องจาก ${product.id} สินค้าหมดสต็อกแล้ว`, 'danger');
    return;
  }

  const prevStock = product.stock;
  product.stock += delta;
  product.updatedAt = getNowTimestamp();

  const logEntry = {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    timestamp: product.updatedAt,
    sku: product.id,
    productName: product.name,
    type: delta > 0 ? 'IN' : 'OUT',
    reason: delta > 0 ? 'รับสินค้าเข้าด่วน (+1 Quick Stock In)' : 'เบิกขายด่วน (-1 Quick Stock Out)',
    qtyChange: delta,
    prevStock,
    newStock: product.stock,
    reference: 'QUICK-ADJ',
    operator: 'สมชาย (ฝ่ายคลัง)'
  };

  state.logs.unshift(logEntry);
  saveStateToStorage();
  renderAll();

  showToast(
    `${delta > 0 ? 'รับเข้า' : 'เบิกออก'} ${product.id} จำนวน 1 ชิ้น (คงเหลือ ${product.stock} ชิ้น)`,
    delta > 0 ? 'success' : 'warning'
  );
}

function openStockMovementModal(sku = null, defaultType = 'IN') {
  const select = document.getElementById('move-product-select');
  select.innerHTML = state.products.map((p) =>
    `<option value="${p.id}">[${p.id}] ${escapeHtml(p.name)} (คงเหลือ: ${p.stock})</option>`
  ).join('');

  if (sku && state.products.some((p) => p.id === sku)) {
    select.value = sku;
  }

  const radios = document.querySelectorAll('input[name="moveType"]');
  radios.forEach((r) => {
    r.checked = r.value === defaultType;
  });

  document.getElementById('move-qty-input').value = 1;
  document.getElementById('move-ref-input').value = '';
  updateMovementPreview();
  openModal('stockModal');
}

function updateMovementPreview() {
  const sku = document.getElementById('move-product-select').value;
  const product = state.products.find((p) => p.id === sku);
  if (!product) return;

  const moveType = document.querySelector('input[name="moveType"]:checked')?.value || 'IN';
  const qty = Math.max(0, parseInt(document.getElementById('move-qty-input').value, 10) || 0);

  const prevImg = document.getElementById('move-preview-img');
  prevImg.dataset.fallbackApplied = 'false';
  prevImg.onerror = function() { window.handleProductImageError(this, product.id); };
  prevImg.src = window.generateProductImageDataUri(product);
  document.getElementById('move-preview-name').textContent = product.name;
  document.getElementById('move-preview-loc').textContent = product.location;
  document.getElementById('move-preview-stock').textContent = product.stock;

  const qtyLabel = document.getElementById('move-qty-label');
  const afterEl = document.getElementById('move-after-stock');

  let resultingStock = product.stock;
  if (moveType === 'IN') {
    qtyLabel.textContent = 'จำนวนที่รับเข้า (ชิ้น) *';
    resultingStock = product.stock + qty;
    afterEl.className = 'text-xl font-bold font-mono-code text-emerald-400';
  } else if (moveType === 'OUT') {
    qtyLabel.textContent = 'จำนวนที่เบิกออก (ชิ้น) *';
    resultingStock = product.stock - qty;
    afterEl.className = resultingStock < 0
      ? 'text-xl font-bold font-mono-code text-rose-500'
      : 'text-xl font-bold font-mono-code text-amber-400';
  } else {
    qtyLabel.textContent = 'ระบุยอดคงเหลือจริงที่ตรวจนับได้ *';
    resultingStock = qty;
    afterEl.className = 'text-xl font-bold font-mono-code text-blue-400';
  }

  afterEl.textContent = `${resultingStock} ชิ้น`;
}

function submitStockMovement(e) {
  e.preventDefault();
  const sku = document.getElementById('move-product-select').value;
  const product = state.products.find((p) => p.id === sku);
  if (!product) return;

  const moveType = document.querySelector('input[name="moveType"]:checked')?.value || 'IN';
  const qty = parseInt(document.getElementById('move-qty-input').value, 10) || 0;
  const reason = document.getElementById('move-reason-select').value;
  const reference = document.getElementById('move-ref-input').value.trim() || 'MANUAL-DOC';
  const operator = document.getElementById('move-operator-input').value.trim() || 'เจ้าหน้าที่คลัง';

  const prevStock = product.stock;
  let newStock = prevStock;
  let qtyChange = 0;
  let logType = 'IN';

  if (moveType === 'IN') {
    if (qty <= 0) return showToast('กรุณาระบุจำนวนที่รับเข้ามากกว่า 0', 'danger');
    newStock = prevStock + qty;
    qtyChange = qty;
    logType = 'IN';
  } else if (moveType === 'OUT') {
    if (qty <= 0) return showToast('กรุณาระบุจำนวนที่เบิกออกมากกว่า 0', 'danger');
    if (prevStock - qty < 0) {
      return showToast(`ยอดคงเหลือไม่พอเบิก! ปัจจุบันมีเพียง ${prevStock} ชิ้น`, 'danger');
    }
    newStock = prevStock - qty;
    qtyChange = -qty;
    logType = 'OUT';
  } else {
    if (qty < 0) return showToast('ยอดคงเหลือต้องไม่ติดลบ', 'danger');
    newStock = qty;
    qtyChange = newStock - prevStock;
    logType = 'ADJUST';
  }

  product.stock = newStock;
  product.updatedAt = getNowTimestamp();

  state.logs.unshift({
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    timestamp: product.updatedAt,
    sku: product.id,
    productName: product.name,
    type: logType,
    reason,
    qtyChange,
    prevStock,
    newStock,
    reference,
    operator
  });

  saveStateToStorage();
  closeModal('stockModal');
  renderAll();
  showToast(`อัปเดตสต็อก ${product.id} สำเร็จ (คงเหลือใหม่: ${newStock} ชิ้น)`, 'success');
}

// ======================= 5. ADD / EDIT / DELETE PRODUCT =======================
function getNextAvailableSku() {
  let maxNum = 50;
  state.products.forEach((p) => {
    const m = p.id.match(/(\d+)/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });
  return 'SKU-' + String(maxNum + 1).padStart(3, '0');
}

function openProductModal(sku = null) {
  state.uploadedImageBase64 = '';
  const fileInput = document.getElementById('prod-image-file');
  if (fileInput) fileInput.value = '';

  if (sku) {
    const p = state.products.find((item) => item.id === sku);
    if (!p) return;

    document.getElementById('product-modal-title').innerHTML = `
      <i data-lucide="edit" class="w-5 h-5 text-amber-400"></i>
      <span>แก้ไขข้อมูลสินค้า (${escapeHtml(p.id)})</span>
    `;
    document.getElementById('edit-mode-flag').value = p.id;
    document.getElementById('prod-sku').value = p.id;
    document.getElementById('prod-sku').readOnly = true;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-brand').value = p.brand;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-short').value = p.shortModel || '';
    document.getElementById('prod-specs').value = p.specs || '';
    document.getElementById('prod-cost').value = p.costPrice;
    document.getElementById('prod-sell').value = p.sellPrice;
    document.getElementById('prod-stock').value = p.stock;
    document.getElementById('prod-min').value = p.minStock;
    document.getElementById('prod-location').value = p.location || 'A1-01';
    document.getElementById('prod-barcode').value = p.barcode || '';
    document.getElementById('prod-supplier').value = p.supplier || 'Synnex Thailand';
    document.getElementById('prod-warranty').value = p.warranty || '3 ปี';
    document.getElementById('prod-custom-image').value = p.customImage || '';
  } else {
    document.getElementById('product-modal-title').innerHTML = `
      <i data-lucide="package-plus" class="w-5 h-5 text-blue-400"></i>
      <span>เพิ่มสินค้าคอมพิวเตอร์ใหม่เข้าคลัง</span>
    `;
    document.getElementById('edit-mode-flag').value = 'false';
    document.getElementById('prod-sku').value = getNextAvailableSku();
    document.getElementById('prod-sku').readOnly = false;
    document.getElementById('prod-category').value = 'CPU';
    document.getElementById('prod-brand').value = 'ASUS ROG';
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-short').value = '';
    document.getElementById('prod-specs').value = '';
    document.getElementById('prod-cost').value = 5000;
    document.getElementById('prod-sell').value = 5990;
    document.getElementById('prod-stock').value = 10;
    document.getElementById('prod-min').value = 4;
    document.getElementById('prod-location').value = 'A2-01';
    document.getElementById('prod-barcode').value = '885900' + Math.floor(1000000 + Math.random() * 8999999);
    document.getElementById('prod-supplier').value = 'Synnex Thailand';
    document.getElementById('prod-warranty').value = '3 ปี (Synnex)';
    document.getElementById('prod-custom-image').value = '';
  }

  updateMarginPreview();
  openModal('productModal');
  if (window.lucide) window.lucide.createIcons();
}

function updateMarginPreview() {
  const cost = parseFloat(document.getElementById('prod-cost').value) || 0;
  const sell = parseFloat(document.getElementById('prod-sell').value) || 0;
  const profit = sell - cost;
  const pct = sell > 0 ? ((profit / sell) * 100).toFixed(1) : '0.0';

  const el = document.getElementById('margin-preview-text');
  el.textContent = `${profit >= 0 ? '+' : ''}${formatCurrency(profit)} (${pct}%)`;
  el.className = profit >= 0 ? 'font-mono-code text-emerald-400' : 'font-mono-code text-rose-400';
}

function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.uploadedImageBase64 = e.target.result;
    document.getElementById('prod-custom-image').value = state.uploadedImageBase64;
    showToast('อัปโหลดรูปภาพสินค้าเรียบร้อยแล้ว', 'success');
  };
  reader.readAsDataURL(file);
}

function saveProductForm(e) {
  e.preventDefault();
  const editSku = document.getElementById('edit-mode-flag').value;
  const sku = document.getElementById('prod-sku').value.trim().toUpperCase();
  const category = document.getElementById('prod-category').value;
  const brand = document.getElementById('prod-brand').value.trim();
  const name = document.getElementById('prod-name').value.trim();
  const shortModel = document.getElementById('prod-short').value.trim() || name.slice(0, 22);
  const specs = document.getElementById('prod-specs').value.trim() || 'อุปกรณ์คอมพิวเตอร์มาตรฐานศูนย์ไทย';
  const costPrice = Math.max(0, Number(document.getElementById('prod-cost').value) || 0);
  const sellPrice = Math.max(0, Number(document.getElementById('prod-sell').value) || 0);
  const stock = Math.max(0, parseInt(document.getElementById('prod-stock').value, 10) || 0);
  const minStock = Math.max(0, parseInt(document.getElementById('prod-min').value, 10) || 0);
  const location = document.getElementById('prod-location').value.trim() || 'A1-01';
  const barcode = document.getElementById('prod-barcode').value.trim() || '8859001000001';
  const supplier = document.getElementById('prod-supplier').value.trim() || 'Synnex Thailand';
  const warranty = document.getElementById('prod-warranty').value.trim() || '3 ปี';
  const customImage = document.getElementById('prod-custom-image').value.trim();

  if (editSku !== 'false') {
    const existing = state.products.find((p) => p.id === editSku);
    if (!existing) return;
    const prevStock = existing.stock;

    Object.assign(existing, {
      category,
      brand,
      name,
      shortModel,
      specs,
      costPrice,
      sellPrice,
      stock,
      minStock,
      location,
      barcode,
      supplier,
      warranty,
      customImage,
      updatedAt: getNowTimestamp()
    });

    if (prevStock !== stock) {
      state.logs.unshift({
        id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
        timestamp: existing.updatedAt,
        sku: existing.id,
        productName: existing.name,
        type: 'ADJUST',
        reason: 'แก้ไขข้อมูลและปรับยอดคงเหลือจากหน้าตั้งค่าสินค้า',
        qtyChange: stock - prevStock,
        prevStock,
        newStock: stock,
        reference: 'EDIT-PROD',
        operator: 'ผู้ดูแลระบบ'
      });
    }
    showToast(`บันทึกการแก้ไขสินค้า ${existing.id} เรียบร้อยแล้ว`, 'success');
  } else {
    if (state.products.some((p) => p.id === sku)) {
      return showToast(`รหัสสินค้า ${sku} มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`, 'danger');
    }

    const newProd = {
      id: sku,
      barcode,
      name,
      shortModel,
      chipLabel: shortModel.slice(0, 14),
      category,
      brand,
      specs,
      costPrice,
      sellPrice,
      stock,
      minStock,
      location,
      supplier,
      warranty,
      customImage,
      updatedAt: getNowTimestamp()
    };

    state.products.unshift(newProd);
    state.logs.unshift({
      id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: newProd.updatedAt,
      sku: newProd.id,
      productName: newProd.name,
      type: 'IN',
      reason: 'เพิ่มสินค้าใหม่เข้าสู่ระบบคลังสินค้า',
      qtyChange: stock,
      prevStock: 0,
      newStock: stock,
      reference: 'NEW-SKU',
      operator: 'ผู้ดูแลระบบ'
    });
    showToast(`เพิ่มสินค้าใหม่ ${sku} เข้าสู่คลังเรียบร้อยแล้ว`, 'success');
  }

  saveStateToStorage();
  populateBrandDropdown();
  closeModal('productModal');
  renderAll();
}

function deleteProduct(sku) {
  const product = state.products.find((p) => p.id === sku);
  if (!product) return;

  if (!confirm(`ยืนยันการลบสินค้า [${product.id}] ${product.name} ออกจากคลังสินค้าหรือไม่?`)) {
    return;
  }

  state.products = state.products.filter((p) => p.id !== sku);
  saveStateToStorage();
  populateBrandDropdown();
  renderAll();
  showToast(`ลบสินค้า ${sku} ออกจากระบบแล้ว`, 'warning');
}

// ======================= 6. PRODUCT DETAIL & BARCODE GENERATOR =======================
function generateBarcodeSvg(codeStr) {
  const clean = String(codeStr || '8859001234567').replace(/[^0-9]/g, '').padEnd(13, '0').slice(0, 13);
  let bars = '';
  let x = 14;

  for (let i = 0; i < clean.length; i++) {
    const digit = parseInt(clean[i], 10);
    const w1 = (digit % 3) + 1.5;
    const gap = ((digit + 1) % 2) + 1.5;
    const w2 = ((digit + 2) % 3) + 1.2;

    bars += `<rect x="${x}" y="8" width="${w1}" height="44" fill="#0f172a"/>`;
    x += w1 + gap;
    bars += `<rect x="${x}" y="8" width="${w2}" height="44" fill="#0f172a"/>`;
    x += w2 + 2.2;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.max(180, x + 14)} 68" class="w-full h-16 bg-white rounded-lg p-1">
      ${bars}
      <text x="${(x + 14) / 2}" y="63" text-anchor="middle" fill="#0f172a" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10" letter-spacing="2.5">${clean}</text>
    </svg>
  `;
}

function openDetailModal(sku) {
  const p = state.products.find((item) => item.id === sku);
  if (!p) return;

  const status = getStockStatus(p);
  const imgSrc = window.generateProductImageDataUri(p);
  const profit = p.sellPrice - p.costPrice;
  const marginPct = p.sellPrice > 0 ? ((profit / p.sellPrice) * 100).toFixed(1) : '0.0';
  const productLogs = state.logs.filter((l) => l.sku === p.id).slice(0, 5);

  document.getElementById('detail-sku-badge').textContent = p.id;
  document.getElementById('detail-title').textContent = p.name;

  document.getElementById('detail-modal-content').innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
      <!-- Image & Shelf Barcode Label -->
      <div class="md:col-span-5 space-y-3">
        <div class="rounded-xl overflow-hidden border border-slate-700 bg-white p-3 flex items-center justify-center min-h-[220px]">
          <img src="${imgSrc}" alt="${escapeHtml(p.name)}" onerror="window.handleProductImageError(this, '${p.id}')" class="w-full max-h-[260px] object-contain" />
        </div>

        <!-- Printable Shelf Barcode Tag -->
        <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-slate-300">🏷️ ป้ายบาร์โค้ดติดชั้นวาง (Shelf Label)</span>
            <span class="font-mono-code text-cyan-400">BIN: ${escapeHtml(p.location)}</span>
          </div>
          ${generateBarcodeSvg(p.barcode)}
          <div class="flex items-center justify-between text-xs pt-1">
            <span class="font-bold text-white truncate max-w-[160px]">${escapeHtml(p.shortModel || p.name)}</span>
            <span class="font-mono-code font-bold text-emerald-400 text-sm">${formatCurrency(p.sellPrice)}</span>
          </div>
        </div>
      </div>

      <!-- Technical Specs & Stock Valuation -->
      <div class="md:col-span-7 space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="badge-status ${status.badgeClass}">${status.label} (คงเหลือ ${p.stock} ชิ้น)</span>
          <span class="px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-300">หมวดหมู่: ${escapeHtml(p.category)}</span>
          <span class="px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-300">แบรนด์: ${escapeHtml(p.brand)}</span>
        </div>

        <div class="p-3.5 rounded-xl surface-elevated space-y-1.5">
          <div class="text-xs font-semibold text-slate-400">สเปกและรายละเอียดสินค้า (Specifications)</div>
          <p class="text-sm text-slate-200 leading-relaxed">${escapeHtml(p.specs)}</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="p-3 rounded-xl surface-elevated">
            <span class="text-[11px] text-slate-400 block">ราคาทุนต่อชิ้น</span>
            <strong class="text-base font-bold font-mono-code text-slate-200">${formatCurrency(p.costPrice)}</strong>
          </div>
          <div class="p-3 rounded-xl surface-elevated">
            <span class="text-[11px] text-slate-400 block">ราคาขายหน้าร้าน</span>
            <strong class="text-base font-bold font-mono-code text-cyan-400">${formatCurrency(p.sellPrice)}</strong>
          </div>
          <div class="p-3 rounded-xl surface-elevated">
            <span class="text-[11px] text-slate-400 block">กำไรต่อชิ้น (Margin)</span>
            <strong class="text-base font-bold font-mono-code text-emerald-400">+${formatCurrency(profit)} (${marginPct}%)</strong>
          </div>
          <div class="p-3 rounded-xl surface-elevated">
            <span class="text-[11px] text-slate-400 block">มูลค่าสต็อกรวม (ทุน)</span>
            <strong class="text-sm font-bold font-mono-code text-indigo-400">${formatCurrency(p.costPrice * p.stock)}</strong>
          </div>
          <div class="p-3 rounded-xl surface-elevated">
            <span class="text-[11px] text-slate-400 block">ซัพพลายเออร์</span>
            <strong class="text-xs font-semibold text-slate-200 truncate block">${escapeHtml(p.supplier)}</strong>
          </div>
          <div class="p-3 rounded-xl surface-elevated">
            <span class="text-[11px] text-slate-400 block">การรับประกัน</span>
            <strong class="text-xs font-semibold text-slate-200">${escapeHtml(p.warranty)}</strong>
          </div>
        </div>

        <!-- Recent History for this SKU -->
        <div class="space-y-2">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">ประวัติความเคลื่อนไหวล่าสุดของ ${escapeHtml(p.id)}</h4>
          ${productLogs.length === 0 ? `
            <p class="text-xs text-slate-500 italic">ยังไม่มีประวัติการเคลื่อนไหวเพิ่มเติม</p>
          ` : `
            <div class="space-y-1.5">
              ${productLogs.map((l) => `
                <div class="px-3 py-2 rounded-lg surface-elevated flex items-center justify-between text-xs">
                  <div>
                    <span class="font-mono-code text-slate-400">${escapeHtml(l.timestamp)}</span>
                    <span class="ml-2 text-slate-200">${escapeHtml(l.reason)}</span>
                  </div>
                  <span class="font-mono-code font-bold ${l.qtyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                    ${l.qtyChange >= 0 ? '+' + l.qtyChange : l.qtyChange} ชิ้น (→ ${l.newStock})
                  </span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800 no-print">
          <button onclick="closeModal('detailModal'); openStockMovementModal('${p.id}', 'IN');" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5">
            <i data-lucide="arrow-left-right" class="w-4 h-4"></i>
            <span>รับเข้า / เบิกออกสินค้านี้</span>
          </button>
          <button onclick="closeModal('detailModal'); openProductModal('${p.id}');" class="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
            <span>แก้ไขข้อมูล</span>
          </button>
          <button onclick="window.print()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5">
            <i data-lucide="printer" class="w-4 h-4"></i>
            <span>พิมพ์ป้ายบาร์โค้ด</span>
          </button>
        </div>
      </div>
    </div>
  `;

  openModal('detailModal');
  if (window.lucide) window.lucide.createIcons();
}

// ======================= 7. ANALYTICS & AUTO REORDER PO =======================
function renderAnalyticsAndReorder() {
  const catContainer = document.getElementById('category-analytics-list');
  const watchContainer = document.getElementById('reorder-watchlist-container');
  if (!catContainer || !watchContainer) return;

  const totalCostAll = state.products.reduce((s, p) => s + (p.costPrice * p.stock), 0) || 1;

  // Group by category
  const catStats = window.CATEGORIES.filter((c) => c.id !== 'ALL').map((cat) => {
    const items = state.products.filter((p) => p.category === cat.id);
    const units = items.reduce((s, p) => s + p.stock, 0);
    const costVal = items.reduce((s, p) => s + (p.costPrice * p.stock), 0);
    const pct = ((costVal / totalCostAll) * 100).toFixed(1);
    return { ...cat, skuCount: items.length, units, costVal, pct };
  }).sort((a, b) => b.costVal - a.costVal);

  catContainer.innerHTML = catStats.map((c) => `
    <div class="p-3 rounded-xl surface-elevated space-y-1.5">
      <div class="flex items-center justify-between text-xs">
        <div class="font-semibold text-slate-200 flex items-center gap-2">
          <span>${escapeHtml(c.name)}</span>
          <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono-code">${c.skuCount} รุ่น • ${c.units} ชิ้น</span>
        </div>
        <div class="font-mono-code font-bold text-cyan-400">
          ${formatCurrency(c.costVal)} <span class="text-slate-400 font-normal">(${c.pct}%)</span>
        </div>
      </div>
      <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" style="width: ${Math.max(3, c.pct)}%"></div>
      </div>
    </div>
  `).join('');

  // Urgent Reorder Watchlist
  const alertItems = state.products
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock);

  let totalBudget = 0;

  if (alertItems.length === 0) {
    watchContainer.innerHTML = `
      <div class="p-8 text-center text-slate-400">
        <p class="text-sm font-semibold text-emerald-400">🎉 สินค้าทุกรายการมีสต็อกอยู่ในเกณฑ์ปลอดภัย</p>
      </div>
    `;
  } else {
    watchContainer.innerHTML = alertItems.map((p) => {
      const targetStock = Math.max(p.minStock * 2, p.minStock + 5);
      const orderQty = Math.max(1, targetStock - p.stock);
      const estCost = orderQty * p.costPrice;
      totalBudget += estCost;

      return `
        <div class="p-3 rounded-xl surface-elevated flex items-center justify-between gap-3 border-l-4 ${p.stock === 0 ? 'border-l-rose-500' : 'border-l-amber-400'}">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-mono-code text-xs font-bold text-blue-400">${escapeHtml(p.id)}</span>
              <span class="text-xs px-2 py-0.2 rounded-full ${p.stock === 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'} font-semibold">
                เหลือ ${p.stock} / ขั้นต่ำ ${p.minStock}
              </span>
            </div>
            <p class="text-xs font-semibold truncate mt-1">${escapeHtml(p.name)}</p>
            <p class="text-[11px] text-slate-400">ซัพพลายเออร์: ${escapeHtml(p.supplier)} • แนะนำสั่งเพิ่ม <strong class="text-emerald-400">+${orderQty} ชิ้น</strong></p>
          </div>
          <button onclick="openStockMovementModal('${p.id}', 'IN')" class="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold shrink-0 transition">
            + รับเข้า
          </button>
        </div>
      `;
    }).join('');
  }

  document.getElementById('reorder-total-budget').textContent = formatCurrency(totalBudget);
}

function openReorderPOModal() {
  const alertItems = state.products
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock);

  const body = document.getElementById('po-modal-body');
  let grandTotal = 0;

  if (alertItems.length === 0) {
    body.innerHTML = `<div class="p-8 text-center text-emerald-400 font-semibold">ไม่มีสินค้าที่ต่ำกว่าจุดสั่งซื้อขั้นต่ำในขณะนี้</div>`;
  } else {
    const rows = alertItems.map((p, idx) => {
      const targetStock = Math.max(p.minStock * 2, p.minStock + 5);
      const orderQty = Math.max(1, targetStock - p.stock);
      const lineTotal = orderQty * p.costPrice;
      grandTotal += lineTotal;

      return `
        <tr>
          <td class="text-center font-mono-code">${idx + 1}</td>
          <td class="font-mono-code font-bold text-blue-400">${escapeHtml(p.id)}</td>
          <td>
            <div class="font-semibold text-xs">${escapeHtml(p.name)}</div>
            <div class="text-[11px] text-slate-400">ตัวแทนจำหน่าย: ${escapeHtml(p.supplier)}</div>
          </td>
          <td class="text-center font-mono-code text-rose-400 font-bold">${p.stock} / ${p.minStock}</td>
          <td class="text-center font-mono-code text-emerald-400 font-bold">+${orderQty} ชิ้น</td>
          <td class="text-right font-mono-code">${formatCurrency(p.costPrice)}</td>
          <td class="text-right font-mono-code font-bold text-cyan-400">${formatCurrency(lineTotal)}</td>
        </tr>
      `;
    }).join('');

    body.innerHTML = `
      <div class="p-3.5 rounded-xl surface-elevated flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>เลขที่ใบขอซื้อ: <strong class="font-mono-code text-white">PO-AUTO-${new Date().toISOString().slice(0,10).replace(/-/g,'')}</strong></div>
        <div>จำนวนรายการที่ต้องสั่งซื้อ: <strong class="text-amber-400">${alertItems.length} รายการ</strong></div>
        <div>ยอดรวมงบประมาณสั่งซื้อ: <strong class="text-base font-mono-code text-emerald-400">${formatCurrency(grandTotal)}</strong></div>
      </div>
      <div class="overflow-x-auto border border-slate-800 rounded-xl">
        <table class="stock-table">
          <thead>
            <tr>
              <th class="text-center">#</th>
              <th>รหัส SKU</th>
              <th>รายการสินค้า / ซัพพลายเออร์</th>
              <th class="text-center">คงเหลือ/ขั้นต่ำ</th>
              <th class="text-center">จำนวนสั่งซื้อ</th>
              <th class="text-right">ราคาทุน/ชิ้น</th>
              <th class="text-right">รวมเป็นเงิน</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  openModal('poModal');
}

function restockAllLowItems() {
  const alertItems = state.products.filter((p) => p.stock <= p.minStock);
  if (alertItems.length === 0) {
    showToast('ไม่มีสินค้าที่ต้องเติมสต็อก', 'info');
    return;
  }

  const now = getNowTimestamp();
  alertItems.forEach((p) => {
    const prevStock = p.stock;
    const targetStock = Math.max(p.minStock * 2, p.minStock + 5);
    const addQty = Math.max(1, targetStock - p.stock);
    p.stock += addQty;
    p.updatedAt = now;

    state.logs.unshift({
      id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: now,
      sku: p.id,
      productName: p.name,
      type: 'IN',
      reason: 'รับสินค้าเข้าคลังอัตโนมัติตามใบสั่งซื้อ Auto-Reorder PO',
      qtyChange: addQty,
      prevStock,
      newStock: p.stock,
      reference: 'PO-AUTO-RESTOCK',
      operator: 'ระบบสั่งซื้ออัตโนมัติ'
    });
  });

  saveStateToStorage();
  closeModal('poModal');
  renderAll();
  showToast(`รับสินค้าเติมสต็อกครบทั้ง ${alertItems.length} รายการเรียบร้อยแล้ว!`, 'success');
}

// ======================= 8. STOCK MOVEMENT HISTORY TAB =======================
function renderStockHistory() {
  const tbody = document.getElementById('stock-history-tbody');
  if (!tbody) return;

  const filterType = document.getElementById('history-type-filter')?.value || 'ALL';
  const filteredLogs = state.logs.filter((l) => filterType === 'ALL' || l.type === filterType);

  if (filteredLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400">ไม่พบประวัติการทำรายการสต็อก</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredLogs.map((l) => {
    let typeBadge = '';
    if (l.type === 'IN') {
      typeBadge = `<span class="badge-status badge-instock">📥 รับเข้า (IN)</span>`;
    } else if (l.type === 'OUT') {
      typeBadge = `<span class="badge-status badge-outstock">📤 เบิกออก (OUT)</span>`;
    } else {
      typeBadge = `<span class="badge-status badge-lowstock">⚖️ ปรับยอด (ADJ)</span>`;
    }

    const changeSign = l.qtyChange > 0 ? `+${l.qtyChange}` : `${l.qtyChange}`;
    const changeColor = l.qtyChange > 0 ? 'text-emerald-400' : (l.qtyChange < 0 ? 'text-rose-400' : 'text-slate-300');

    return `
      <tr>
        <td>
          <div class="font-mono-code font-bold text-xs text-slate-200">${escapeHtml(l.id)}</div>
          <div class="font-mono-code text-[11px] text-slate-400">${escapeHtml(l.timestamp)}</div>
        </td>
        <td>${typeBadge}</td>
        <td>
          <div class="font-mono-code text-xs text-blue-400 font-bold">${escapeHtml(l.sku)}</div>
          <div class="text-xs font-medium truncate max-w-xs">${escapeHtml(l.productName)}</div>
        </td>
        <td class="text-center font-mono-code text-slate-400">${l.prevStock}</td>
        <td class="text-center font-mono-code font-bold ${changeColor}">${changeSign}</td>
        <td class="text-center font-mono-code font-bold text-white">${l.newStock}</td>
        <td>
          <div class="text-xs text-slate-200">${escapeHtml(l.reason)}</div>
          <div class="text-[11px] font-mono-code text-cyan-400">Ref: ${escapeHtml(l.reference)}</div>
        </td>
        <td class="text-xs text-slate-300">${escapeHtml(l.operator)}</td>
      </tr>
    `;
  }).join('');
}

// ======================= 9. NAVIGATION, MODALS & EXPORT =======================
function switchMainTab(tabName) {
  state.activeTab = tabName;
  const tabs = ['catalog', 'analytics', 'history'];

  tabs.forEach((t) => {
    const section = document.getElementById(`main-tab-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (t === tabName) {
      section.classList.remove('hidden');
      btn.className = 'main-tab-btn px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all bg-blue-600 text-white shadow';
    } else {
      section.classList.add('hidden');
      btn.className = 'main-tab-btn px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all text-slate-400 hover:text-white';
    }
  });

  if (window.lucide) window.lucide.createIcons();
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

function exportToCSV() {
  const headers = [
    'รหัสสินค้า (SKU)',
    'บาร์โค้ด (Barcode)',
    'ชื่อสินค้า',
    'หมวดหมู่',
    'แบรนด์',
    'ราคาทุน (บาท)',
    'ราคาขาย (บาท)',
    'กำไรต่อชิ้น (บาท)',
    'จำนวนคงเหลือ',
    'จุดเตือนขั้นต่ำ',
    'สถานะสต็อก',
    'มูลค่าคงเหลือราคาทุน (บาท)',
    'ตำแหน่งจัดเก็บ (Bin)',
    'ซัพพลายเออร์',
    'การรับประกัน'
  ];

  const rows = state.products.map((p) => {
    const st = getStockStatus(p).label;
    const profit = p.sellPrice - p.costPrice;
    const totalVal = p.costPrice * p.stock;
    return [
      p.id,
      `'${p.barcode}`,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.brand,
      p.costPrice,
      p.sellPrice,
      profit,
      p.stock,
      p.minStock,
      st,
      totalVal,
      p.location,
      `"${p.supplier}"`,
      `"${p.warranty}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `Nachapol_Shop_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showToast('ส่งออกรายงานสต็อกเป็นไฟล์ CSV (เปิดใน Excel ได้ทันที) สำเร็จ', 'success');
}

function resetToDefaultData() {
  if (!confirm('ต้องการรีเซ็ตข้อมูลสต็อกสินค้าทั้งหมดกลับเป็นค่าเริ่มต้น 50 รายการหรือไม่?')) {
    return;
  }
  state.products = structuredClone(window.INITIAL_PRODUCTS);
  state.logs = structuredClone(window.INITIAL_STOCK_LOGS);
  saveStateToStorage();
  populateBrandDropdown();
  resetFilters();
  renderAll();
  showToast('รีเซ็ตข้อมูลสต็อกสินค้าเริ่มต้นครบ 50 รายการเรียบร้อยแล้ว', 'info');
}
