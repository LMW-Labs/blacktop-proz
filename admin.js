// ============================================
// BlacktopProz Admin Dashboard
// Mobile-First Backend System
// ============================================

const DEFAULT_PASSWORD = 'blacktop2024';
const TAX_RATE = 0.07; // 7% MS Sales Tax

// ============================================
// PRICING DATA - Editable
// ============================================
const DEFAULT_PRICING = [
    {
        id: 'new_asphalt',
        name: 'New Asphalt Install',
        ourPriceLow: 8,
        ourPriceHigh: 12,
        marketLow: 7,
        marketHigh: 15,
        unit: 'sq ft',
        warranty: '1-year workmanship warranty',
        warrantyPeriod: '1 year'
    },
    {
        id: 'resurfacing',
        name: 'Asphalt Resurfacing',
        ourPriceLow: 3,
        ourPriceHigh: 6,
        marketLow: 3,
        marketHigh: 8,
        unit: 'sq ft',
        warranty: '1-year workmanship warranty',
        warrantyPeriod: '1 year'
    },
    {
        id: 'sealcoating',
        name: 'Sealcoating',
        ourPriceLow: 0.20,
        ourPriceHigh: 0.35,
        marketLow: 0.15,
        marketHigh: 0.50,
        unit: 'sq ft',
        warranty: '90-day warranty',
        warrantyPeriod: '90 days'
    },
    {
        id: 'crack_sealing',
        name: 'Crack Sealing',
        ourPriceLow: 1,
        ourPriceHigh: 3,
        marketLow: 1,
        marketHigh: 4,
        unit: 'linear ft',
        warranty: '90-day warranty',
        warrantyPeriod: '90 days'
    },
    {
        id: 'pothole_repair',
        name: 'Pothole Repair',
        ourPriceLow: 50,
        ourPriceHigh: 150,
        marketLow: 50,
        marketHigh: 200,
        unit: 'each',
        warranty: '1-year workmanship warranty',
        warrantyPeriod: '1 year'
    },
    {
        id: 'gravel_driveway',
        name: 'Gravel Driveway',
        ourPriceLow: 1.25,
        ourPriceHigh: 2.50,
        marketLow: 1,
        marketHigh: 3,
        unit: 'sq ft',
        warranty: '30-day satisfaction guarantee',
        warrantyPeriod: '30 days'
    },
    {
        id: 'line_striping',
        name: 'Line Striping',
        ourPriceLow: 0.20,
        ourPriceHigh: 0.50,
        marketLow: 0.25,
        marketHigh: 0.75,
        unit: 'linear ft',
        warranty: '90-day warranty',
        warrantyPeriod: '90 days'
    },
    {
        id: 'curb_gutter',
        name: 'Curb & Gutter',
        ourPriceLow: 15,
        ourPriceHigh: 25,
        marketLow: 18,
        marketHigh: 35,
        unit: 'linear ft',
        warranty: '1-year workmanship warranty',
        warrantyPeriod: '1 year'
    }
];

const TYPICAL_JOBS = [
    { label: '2-Car Driveway (400 sq ft)', low: 3200, high: 4800 },
    { label: 'Large Driveway (600 sq ft)', low: 4800, high: 7200 },
    { label: 'Small Parking Lot (2,500 sq ft)', low: 20000, high: 30000 },
    { label: 'Sealcoat Residential', low: 150, high: 250 },
    { label: 'Commercial Sealcoat (10,000 sq ft)', low: 2000, high: 3500 }
];

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Check login status
    if (localStorage.getItem('btpLoggedIn') === 'true') {
        showDashboard();
    } else {
        showLogin();
    }

    // Initialize all components
    initLogin();
    initMobileMenu();
    initNavigation();
    initServiceSelector();
    initPricingTable();
    initInvoiceForm();
    initSettings();
    initFilterTabs();
    initCustomerSearch();

    // Load data
    loadDashboardData();
    loadQuotesList();
    loadInvoicesList();
    loadCustomersList();
}

// ============================================
// Authentication
// ============================================
function initLogin() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const storedPassword = localStorage.getItem('btpPassword') || DEFAULT_PASSWORD;

        if (password === storedPassword) {
            localStorage.setItem('btpLoggedIn', 'true');
            showDashboard();
            showToast('Welcome back!', 'success');
        } else {
            document.getElementById('loginError').textContent = 'Invalid password';
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('btpLoggedIn');
        showLogin();
    });
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadDashboardData();
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// ============================================
// Navigation
// ============================================
function initNavigation() {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            goToSection(section);

            // Close mobile menu
            document.getElementById('sidebar').classList.remove('active');
            document.getElementById('sidebarOverlay').classList.remove('active');
        });
    });
}

function goToSection(sectionName) {
    // Update nav
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (navItem) navItem.classList.add('active');

    // Show section
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionName + 'Section').classList.add('active');

    // Scroll to top
    window.scrollTo(0, 0);
}

// ============================================
// Dashboard Data
// ============================================
function loadDashboardData() {
    const quotes = getQuotes();
    const invoices = getInvoices();

    // Stats
    document.getElementById('pendingQuotes').textContent = quotes.filter(q => q.status === 'sent' || q.status === 'draft').length;
    document.getElementById('unpaidInvoices').textContent = invoices.filter(i => i.status === 'unpaid' || i.status === 'partial').length;

    // Monthly revenue
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyRevenue = invoices
        .filter(i => {
            if (i.status !== 'paid') return false;
            const d = new Date(i.paidDate || i.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        })
        .reduce((sum, i) => sum + (i.total || 0), 0);
    document.getElementById('monthlyRevenue').textContent = formatCurrency(monthlyRevenue);

    // Overdue
    const today = new Date();
    const overdueCount = invoices.filter(i => {
        if (i.status === 'paid') return false;
        const due = new Date(i.dueDate);
        const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
        return diff >= 30;
    }).length;
    document.getElementById('overdueInvoices').textContent = overdueCount;

    // Aging
    calculateAging(invoices);

    // Recent activity
    loadRecentActivity(quotes, invoices);
}

function calculateAging(invoices) {
    const today = new Date();
    let current = 0, days30 = 0, days60 = 0, days90 = 0;

    invoices.filter(i => i.status !== 'paid').forEach(inv => {
        const due = new Date(inv.dueDate);
        const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
        const amount = inv.total - (inv.paidAmount || 0);

        if (diff < 0) current += amount;
        else if (diff < 30) current += amount;
        else if (diff < 60) days30 += amount;
        else if (diff < 90) days60 += amount;
        else days90 += amount;
    });

    document.getElementById('agingCurrent').textContent = formatCurrency(current);
    document.getElementById('aging30').textContent = formatCurrency(days30);
    document.getElementById('aging60').textContent = formatCurrency(days60);
    document.getElementById('aging90').textContent = formatCurrency(days90);
}

function loadRecentActivity(quotes, invoices) {
    const activities = [];

    quotes.slice(-5).forEach(q => {
        activities.push({
            text: `Quote ${q.quoteNumber} - ${q.customerName}`,
            date: q.createdAt,
            amount: q.total
        });
    });

    invoices.slice(-5).forEach(i => {
        activities.push({
            text: `Invoice ${i.invoiceNumber} - ${i.customerName} (${i.status})`,
            date: i.createdAt,
            amount: i.total
        });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = document.getElementById('recentActivity');
    if (activities.length === 0) {
        container.innerHTML = '<p class="no-data">No recent activity</p>';
    } else {
        container.innerHTML = activities.slice(0, 8).map(a => `
            <div class="activity-item">
                <span>${a.text}</span>
                <span>${formatCurrency(a.amount)}</span>
            </div>
        `).join('');
    }
}

// ============================================
// Service Selector (Quick Quote)
// ============================================
function initServiceSelector() {
    const pricing = getPricing();
    const container = document.getElementById('serviceSelector');

    container.innerHTML = pricing.map(service => `
        <div class="service-item" data-service-id="${service.id}">
            <div class="service-item-header">
                <input type="checkbox" class="service-checkbox" id="svc_${service.id}" onchange="toggleService('${service.id}')">
                <label for="svc_${service.id}" class="service-name">${service.name}</label>
            </div>
            <div class="service-price-range">$${service.ourPriceLow} - $${service.ourPriceHigh} per ${service.unit}</div>
            <div class="service-inputs">
                <div>
                    <label>${service.unit === 'each' ? 'Quantity' : 'Amount'}</label>
                    <input type="number" id="qty_${service.id}" placeholder="${service.unit}" min="0" step="1" onchange="updateQuoteSummary()">
                </div>
                <div>
                    <label>Price per ${service.unit}</label>
                    <input type="number" id="price_${service.id}" value="${((service.ourPriceLow + service.ourPriceHigh) / 2).toFixed(2)}" step="0.01" onchange="updateQuoteSummary()">
                </div>
            </div>
            <span class="warranty-badge">${service.warrantyPeriod} warranty</span>
        </div>
    `).join('');
}

function toggleService(serviceId) {
    const item = document.querySelector(`[data-service-id="${serviceId}"]`);
    const checkbox = document.getElementById(`svc_${serviceId}`);

    if (checkbox.checked) {
        item.classList.add('selected');
    } else {
        item.classList.remove('selected');
        document.getElementById(`qty_${serviceId}`).value = '';
    }

    updateQuoteSummary();
}

function updateQuoteSummary() {
    const pricing = getPricing();
    const selectedServices = [];
    let subtotal = 0;
    const warranties = new Set();

    pricing.forEach(service => {
        const checkbox = document.getElementById(`svc_${service.id}`);
        if (checkbox && checkbox.checked) {
            const qty = parseFloat(document.getElementById(`qty_${service.id}`).value) || 0;
            const price = parseFloat(document.getElementById(`price_${service.id}`).value) || 0;
            const total = qty * price;

            if (qty > 0) {
                selectedServices.push({
                    ...service,
                    quantity: qty,
                    unitPrice: price,
                    lineTotal: total
                });
                subtotal += total;
                warranties.add(`${service.name}: ${service.warranty}`);
            }
        }
    });

    // Update summary
    const summaryContainer = document.getElementById('selectedServices');
    if (selectedServices.length === 0) {
        summaryContainer.innerHTML = '<p class="no-data">No services selected</p>';
    } else {
        summaryContainer.innerHTML = selectedServices.map(s => `
            <div class="selected-service-item">
                <span>${s.name} (${s.quantity} ${s.unit})</span>
                <span>${formatCurrency(s.lineTotal)}</span>
            </div>
        `).join('');
    }

    // Calculate totals
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    document.getElementById('qqSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('qqTax').textContent = formatCurrency(tax);
    document.getElementById('qqTotal').textContent = formatCurrency(total);

    // Warranty info
    const warrantyContainer = document.getElementById('warrantyInfo');
    const warrantyList = document.getElementById('warrantyList');
    if (warranties.size > 0) {
        warrantyContainer.style.display = 'block';
        warrantyList.innerHTML = Array.from(warranties).map(w => `<li>${w}</li>`).join('');
    } else {
        warrantyContainer.style.display = 'none';
    }

    // Check minimum
    const customerType = document.getElementById('qqCustomerType').value;
    const minimum = customerType === 'commercial' ? 250 : 150;
    if (subtotal > 0 && subtotal < minimum) {
        showToast(`Minimum service fee is $${minimum} for ${customerType} jobs`, 'warning');
    }
}

// ============================================
// Quote Functions
// ============================================
function saveQuoteDraft() {
    const quote = buildQuoteFromForm();
    if (!quote) return;

    quote.status = 'draft';
    saveQuote(quote);
    showToast('Quote saved as draft', 'success');
    resetQuoteForm();
    goToSection('quotes');
}

function previewQuote() {
    const quote = buildQuoteFromForm();
    if (!quote) return;

    // Store temp quote for preview
    window.tempQuote = quote;

    // Build preview
    const preview = document.getElementById('quotePreviewContent');
    preview.innerHTML = generateQuoteHTML(quote);

    document.getElementById('quotePreviewModal').style.display = 'flex';
}

function buildQuoteFromForm() {
    const customerName = document.getElementById('qqCustomerName').value.trim();
    const customerPhone = document.getElementById('qqCustomerPhone').value.trim();

    if (!customerName || !customerPhone) {
        showToast('Please fill in customer name and phone', 'error');
        return null;
    }

    const jobAddress = document.getElementById('qqJobAddress').value.trim();
    const jobCity = document.getElementById('qqJobCity').value.trim();

    if (!jobAddress || !jobCity) {
        showToast('Please fill in job site address', 'error');
        return null;
    }

    // Build line items
    const pricing = getPricing();
    const lineItems = [];

    pricing.forEach(service => {
        const checkbox = document.getElementById(`svc_${service.id}`);
        if (checkbox && checkbox.checked) {
            const qty = parseFloat(document.getElementById(`qty_${service.id}`).value) || 0;
            const price = parseFloat(document.getElementById(`price_${service.id}`).value) || 0;

            if (qty > 0) {
                lineItems.push({
                    serviceId: service.id,
                    description: service.name,
                    quantity: qty,
                    unit: service.unit,
                    unitPrice: price,
                    lineTotal: qty * price,
                    warranty: service.warranty
                });
            }
        }
    });

    if (lineItems.length === 0) {
        showToast('Please select at least one service', 'error');
        return null;
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return {
        quoteNumber: generateQuoteNumber(),
        customerName,
        customerPhone,
        customerEmail: document.getElementById('qqCustomerEmail').value.trim(),
        customerType: document.getElementById('qqCustomerType').value,
        jobAddress,
        jobCity,
        jobZip: document.getElementById('qqJobZip').value.trim(),
        jobState: 'MS',
        lineItems,
        subtotal,
        taxRate: TAX_RATE * 100,
        tax,
        total,
        notes: document.getElementById('qqNotes').value.trim(),
        validUntil: getDatePlusDays(30),
        status: 'draft',
        createdAt: new Date().toISOString()
    };
}

function generateQuoteHTML(quote) {
    const settings = getSettings();
    return `
        <div class="preview-header">
            <img src="assets/blacktopproz_logo.svg" alt="BlacktopProz" class="preview-logo">
            <p>${settings.businessPhone || '(601) 813-2533'}</p>
            <p>${settings.businessAddress || 'Jackson, MS'}</p>
        </div>

        <h2 class="preview-title">QUOTE / ESTIMATE</h2>

        <div class="preview-meta">
            <div class="preview-section">
                <h4>Quote Number</h4>
                <p><strong>${quote.quoteNumber}</strong></p>
                <p>Date: ${formatDate(quote.createdAt)}</p>
                <p>Valid Until: ${formatDate(quote.validUntil)}</p>
            </div>
            <div class="preview-section">
                <h4>Prepared For</h4>
                <p><strong>${quote.customerName}</strong></p>
                <p>${quote.customerPhone}</p>
                ${quote.customerEmail ? `<p>${quote.customerEmail}</p>` : ''}
            </div>
        </div>

        <div class="preview-section">
            <h4>Job Site</h4>
            <p>${quote.jobAddress}</p>
            <p>${quote.jobCity}, ${quote.jobState} ${quote.jobZip}</p>
        </div>

        <table class="preview-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Rate</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${quote.lineItems.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${item.unit}</td>
                        <td>${formatCurrency(item.unitPrice)}</td>
                        <td>${formatCurrency(item.lineTotal)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="preview-totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(quote.subtotal)}</span>
            </div>
            <div class="total-row">
                <span>Tax (${quote.taxRate}%):</span>
                <span>${formatCurrency(quote.tax)}</span>
            </div>
            <div class="total-row grand-total">
                <span>Total:</span>
                <span>${formatCurrency(quote.total)}</span>
            </div>
        </div>

        ${quote.notes ? `
            <div class="preview-section">
                <h4>Notes</h4>
                <p>${quote.notes}</p>
            </div>
        ` : ''}

        <div class="preview-section">
            <h4>Warranty Coverage</h4>
            <ul>
                ${quote.lineItems.map(item => `<li>${item.description}: ${item.warranty}</li>`).join('')}
            </ul>
        </div>

        <div class="preview-footer">
            <p><strong>Thank you for considering BlacktopProz!</strong></p>
            <p>"My word is my bond, and the job is not complete until you are fully satisfied."</p>
            <p class="preview-signature">Christopher O'Briant</p>
            <p>Owner, BlacktopProz</p>
        </div>
    `;
}

function closeQuotePreview() {
    document.getElementById('quotePreviewModal').style.display = 'none';
}

function saveAndEmailQuote() {
    const quote = window.tempQuote;
    quote.status = 'sent';
    quote.sentAt = new Date().toISOString();
    saveQuote(quote);
    saveCustomerFromQuote(quote);

    // Email
    if (quote.customerEmail) {
        sendQuoteEmail(quote);
    } else {
        showToast('Quote saved! No email address provided.', 'warning');
    }

    closeQuotePreview();
    resetQuoteForm();
    goToSection('quotes');
}

function saveAndPrintQuote() {
    const quote = window.tempQuote;
    quote.status = 'sent';
    quote.sentAt = new Date().toISOString();
    saveQuote(quote);
    saveCustomerFromQuote(quote);

    // Print
    printDocument(generateQuoteHTML(quote));

    closeQuotePreview();
    resetQuoteForm();
}

function sendQuoteEmail(quote) {
    const subject = encodeURIComponent(`Quote ${quote.quoteNumber} from BlacktopProz`);
    const body = encodeURIComponent(`
Dear ${quote.customerName},

Thank you for your interest in BlacktopProz! Please find your quote below.

Quote Number: ${quote.quoteNumber}
Total: ${formatCurrency(quote.total)}
Valid Until: ${formatDate(quote.validUntil)}

To accept this quote, simply reply to this email or call us at (601) 813-2533.

Thank you for your business!

Christopher O'Briant
Owner, BlacktopProz
"PAVING THE WAY"
    `);

    window.open(`mailto:${quote.customerEmail}?subject=${subject}&body=${body}`);
    showToast('Quote saved! Email client opened.', 'success');
}

function resetQuoteForm() {
    document.getElementById('quickQuoteForm').reset();
    document.querySelectorAll('.service-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelectorAll('.service-checkbox').forEach(cb => {
        cb.checked = false;
    });
    updateQuoteSummary();
}

// ============================================
// Quotes List
// ============================================
function loadQuotesList(filter = 'all') {
    const quotes = getQuotes();
    const container = document.getElementById('quotesListCards');

    let filtered = quotes;
    if (filter !== 'all') {
        filtered = quotes.filter(q => q.status === filter);
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No quotes found</p>';
        return;
    }

    container.innerHTML = filtered.map(quote => `
        <div class="list-card">
            <div class="list-card-header">
                <span class="list-card-id">${quote.quoteNumber}</span>
                <span class="status-badge status-${quote.status}">${quote.status}</span>
            </div>
            <div class="list-card-customer">${quote.customerName}</div>
            <div class="list-card-service">${quote.lineItems.map(i => i.description).join(', ')}</div>
            <div class="list-card-date">${formatDate(quote.createdAt)}</div>
            <div class="list-card-footer">
                <span class="list-card-amount">${formatCurrency(quote.total)}</span>
                <div class="list-card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="viewQuote('${quote.quoteNumber}')">View</button>
                    <button class="btn btn-sm btn-success" onclick="convertQuoteToInvoice('${quote.quoteNumber}')">Invoice</button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewQuote(quoteNumber) {
    const quotes = getQuotes();
    const quote = quotes.find(q => q.quoteNumber === quoteNumber);
    if (!quote) return;

    window.tempQuote = quote;
    document.getElementById('quotePreviewContent').innerHTML = generateQuoteHTML(quote);
    document.getElementById('quotePreviewModal').style.display = 'flex';
}

function convertQuoteToInvoice(quoteNumber) {
    const quotes = getQuotes();
    const quote = quotes.find(q => q.quoteNumber === quoteNumber);
    if (!quote) return;

    // Pre-fill invoice form
    document.getElementById('invCustomerName').value = quote.customerName;
    document.getElementById('invCustomerPhone').value = quote.customerPhone;
    document.getElementById('invCustomerEmail').value = quote.customerEmail || '';
    document.getElementById('invJobAddress').value = quote.jobAddress;
    document.getElementById('invJobCity').value = quote.jobCity;
    document.getElementById('invJobZip').value = quote.jobZip || '';

    // Add line items
    const container = document.getElementById('invLineItems');
    container.innerHTML = '';
    quote.lineItems.forEach(item => {
        addInvoiceLineItem(item);
    });

    calculateInvoiceTotals();

    // Update quote status
    quote.status = 'accepted';
    const idx = quotes.findIndex(q => q.quoteNumber === quoteNumber);
    quotes[idx] = quote;
    localStorage.setItem('btp_quotes', JSON.stringify(quotes));

    goToSection('invoices');
    document.getElementById('invoiceFormContainer').style.display = 'flex';
}

// ============================================
// Invoice Functions
// ============================================
function initInvoiceForm() {
    document.getElementById('newInvoiceBtn').addEventListener('click', function() {
        document.getElementById('invoiceFormContainer').style.display = 'flex';
        populateQuoteDropdown();
        addInvoiceLineItem();
    });

    document.getElementById('invoiceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveInvoice();
    });

    document.getElementById('invoiceFromQuote').addEventListener('change', function() {
        if (this.value) {
            const quotes = getQuotes();
            const quote = quotes.find(q => q.quoteNumber === this.value);
            if (quote) {
                document.getElementById('invCustomerName').value = quote.customerName;
                document.getElementById('invCustomerPhone').value = quote.customerPhone;
                document.getElementById('invCustomerEmail').value = quote.customerEmail || '';
                document.getElementById('invJobAddress').value = quote.jobAddress;
                document.getElementById('invJobCity').value = quote.jobCity;
                document.getElementById('invJobZip').value = quote.jobZip || '';

                const container = document.getElementById('invLineItems');
                container.innerHTML = '';
                quote.lineItems.forEach(item => addInvoiceLineItem(item));
                calculateInvoiceTotals();
            }
        }
    });
}

function closeInvoiceForm() {
    document.getElementById('invoiceFormContainer').style.display = 'none';
    document.getElementById('invoiceForm').reset();
    document.getElementById('invLineItems').innerHTML = '';
}

function populateQuoteDropdown() {
    const quotes = getQuotes().filter(q => q.status === 'sent' || q.status === 'accepted');
    const select = document.getElementById('invoiceFromQuote');
    select.innerHTML = '<option value="">-- Start Fresh --</option>';
    quotes.forEach(q => {
        select.innerHTML += `<option value="${q.quoteNumber}">${q.quoteNumber} - ${q.customerName} (${formatCurrency(q.total)})</option>`;
    });
}

function addInvoiceLineItem(item = null) {
    const container = document.getElementById('invLineItems');
    const index = container.children.length;

    const html = `
        <div class="line-item-mobile" data-index="${index}">
            <button type="button" class="line-item-remove" onclick="this.parentElement.remove(); calculateInvoiceTotals();">&times;</button>
            <div class="form-group">
                <label>Description</label>
                <input type="text" name="desc_${index}" value="${item?.description || ''}" placeholder="Service description" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Qty</label>
                    <input type="number" name="qty_${index}" value="${item?.quantity || 1}" min="1" onchange="calculateInvoiceTotals()">
                </div>
                <div class="form-group">
                    <label>Rate</label>
                    <input type="number" name="rate_${index}" value="${item?.unitPrice || ''}" step="0.01" placeholder="$" onchange="calculateInvoiceTotals()">
                </div>
                <div class="form-group">
                    <label>Total</label>
                    <input type="text" name="total_${index}" value="${item ? formatCurrency(item.lineTotal) : '$0.00'}" readonly>
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
}

function calculateInvoiceTotals() {
    const container = document.getElementById('invLineItems');
    const items = container.querySelectorAll('.line-item-mobile');
    let subtotal = 0;

    items.forEach((item, i) => {
        const qty = parseFloat(item.querySelector(`[name="qty_${i}"]`)?.value) || 0;
        const rate = parseFloat(item.querySelector(`[name="rate_${i}"]`)?.value) || 0;
        const total = qty * rate;
        const totalField = item.querySelector(`[name="total_${i}"]`);
        if (totalField) totalField.value = formatCurrency(total);
        subtotal += total;
    });

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    document.getElementById('invSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('invTax').textContent = formatCurrency(tax);
    document.getElementById('invTotal').textContent = formatCurrency(total);
}

function saveInvoice() {
    const customerName = document.getElementById('invCustomerName').value.trim();
    if (!customerName) {
        showToast('Please enter customer name', 'error');
        return;
    }

    const lineItems = [];
    const container = document.getElementById('invLineItems');
    const items = container.querySelectorAll('.line-item-mobile');

    items.forEach((item, i) => {
        const desc = item.querySelector(`[name="desc_${i}"]`)?.value;
        const qty = parseFloat(item.querySelector(`[name="qty_${i}"]`)?.value) || 0;
        const rate = parseFloat(item.querySelector(`[name="rate_${i}"]`)?.value) || 0;

        if (desc && qty && rate) {
            lineItems.push({
                description: desc,
                quantity: qty,
                unitPrice: rate,
                lineTotal: qty * rate
            });
        }
    });

    if (lineItems.length === 0) {
        showToast('Please add at least one line item', 'error');
        return;
    }

    const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const depositPct = parseInt(document.getElementById('invDeposit').value) || 0;
    const depositAmount = total * (depositPct / 100);

    const paymentTerms = document.getElementById('invPaymentTerms').value;
    let dueDate;
    if (paymentTerms === 'due_receipt') {
        dueDate = new Date().toISOString();
    } else if (paymentTerms === 'net_15') {
        dueDate = getDatePlusDays(15);
    } else {
        dueDate = getDatePlusDays(30);
    }

    const invoice = {
        invoiceNumber: generateInvoiceNumber(),
        customerName,
        customerPhone: document.getElementById('invCustomerPhone').value,
        customerEmail: document.getElementById('invCustomerEmail').value,
        jobAddress: document.getElementById('invJobAddress').value,
        jobCity: document.getElementById('invJobCity').value,
        jobZip: document.getElementById('invJobZip').value,
        jobState: 'MS',
        lineItems,
        subtotal,
        taxRate: TAX_RATE * 100,
        tax,
        total,
        depositRequired: depositAmount,
        depositPaid: 0,
        paidAmount: 0,
        paymentTerms,
        dueDate,
        notes: document.getElementById('invNotes').value,
        status: 'unpaid',
        payments: [],
        createdAt: new Date().toISOString()
    };

    const invoices = getInvoices();
    invoices.push(invoice);
    localStorage.setItem('btp_invoices', JSON.stringify(invoices));

    saveCustomerFromInvoice(invoice);

    showToast('Invoice created!', 'success');
    closeInvoiceForm();
    loadInvoicesList();
    loadDashboardData();

    // Show preview
    window.tempInvoice = invoice;
    document.getElementById('invoicePreviewContent').innerHTML = generateInvoiceHTML(invoice);
    document.getElementById('invoicePreviewModal').style.display = 'flex';
}

function generateInvoiceHTML(invoice) {
    const settings = getSettings();
    const paymentInfo = getPaymentInfo();

    return `
        <div class="preview-header">
            <img src="assets/blacktopproz_logo.svg" alt="BlacktopProz" class="preview-logo">
            <p>${settings.businessPhone || '(601) 813-2533'}</p>
            <p>${settings.businessAddress || 'Jackson, MS'}</p>
        </div>

        <h2 class="preview-title">INVOICE</h2>

        <div class="preview-meta">
            <div class="preview-section">
                <h4>Invoice Number</h4>
                <p><strong>${invoice.invoiceNumber}</strong></p>
                <p>Date: ${formatDate(invoice.createdAt)}</p>
                <p>Due: ${formatDate(invoice.dueDate)}</p>
            </div>
            <div class="preview-section">
                <h4>Bill To</h4>
                <p><strong>${invoice.customerName}</strong></p>
                <p>${invoice.customerPhone}</p>
                ${invoice.customerEmail ? `<p>${invoice.customerEmail}</p>` : ''}
            </div>
        </div>

        <div class="preview-section">
            <h4>Job Site</h4>
            <p>${invoice.jobAddress}</p>
            <p>${invoice.jobCity}, ${invoice.jobState} ${invoice.jobZip}</p>
        </div>

        <table class="preview-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.lineItems.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unitPrice)}</td>
                        <td>${formatCurrency(item.lineTotal)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="preview-totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(invoice.subtotal)}</span>
            </div>
            <div class="total-row">
                <span>Tax (${invoice.taxRate}%):</span>
                <span>${formatCurrency(invoice.tax)}</span>
            </div>
            <div class="total-row grand-total">
                <span>Total Due:</span>
                <span>${formatCurrency(invoice.total - invoice.paidAmount)}</span>
            </div>
            ${invoice.depositRequired > 0 ? `
                <div class="total-row">
                    <span>Deposit Required:</span>
                    <span>${formatCurrency(invoice.depositRequired)}</span>
                </div>
            ` : ''}
        </div>

        <div class="preview-section" style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h4>Payment Methods</h4>
            <p><strong>Venmo:</strong> ${paymentInfo.venmo || '@BlacktopProz'}</p>
            <p><strong>Zelle:</strong> ${paymentInfo.zelle || '(601) 813-2533'}</p>
            <p><strong>Check:</strong> Make payable to ${paymentInfo.checkPayable || 'BlacktopProz'}</p>
            <p><strong>Cash:</strong> Accepted on site</p>
        </div>

        ${invoice.notes ? `
            <div class="preview-section">
                <h4>Notes</h4>
                <p>${invoice.notes}</p>
            </div>
        ` : ''}

        <div class="preview-footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>"My word is my bond, and the job is not complete until you are fully satisfied."</p>
            <p class="preview-signature">Christopher O'Briant</p>
            <p>Owner, BlacktopProz</p>
        </div>
    `;
}

function closeInvoicePreview() {
    document.getElementById('invoicePreviewModal').style.display = 'none';
}

function emailInvoice() {
    const invoice = window.tempInvoice;
    if (!invoice.customerEmail) {
        showToast('No email address on file', 'warning');
        return;
    }

    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from BlacktopProz`);
    const body = encodeURIComponent(`
Dear ${invoice.customerName},

Please find your invoice attached.

Invoice Number: ${invoice.invoiceNumber}
Amount Due: ${formatCurrency(invoice.total - invoice.paidAmount)}
Due Date: ${formatDate(invoice.dueDate)}

Payment Methods:
- Venmo: @BlacktopProz
- Zelle: (601) 813-2533
- Check: Make payable to BlacktopProz

Thank you for your business!

Christopher O'Briant
Owner, BlacktopProz
    `);

    window.open(`mailto:${invoice.customerEmail}?subject=${subject}&body=${body}`);
    showToast('Email client opened', 'success');
}

function printInvoice() {
    const invoice = window.tempInvoice;
    printDocument(generateInvoiceHTML(invoice));
}

// ============================================
// Invoices List
// ============================================
function loadInvoicesList(filter = 'all') {
    const invoices = getInvoices();
    const container = document.getElementById('invoicesListCards');

    let filtered = invoices;
    if (filter !== 'all') {
        if (filter === 'overdue') {
            const today = new Date();
            filtered = invoices.filter(i => {
                if (i.status === 'paid') return false;
                return new Date(i.dueDate) < today;
            });
        } else {
            filtered = invoices.filter(i => i.status === filter);
        }
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No invoices found</p>';
        return;
    }

    container.innerHTML = filtered.map(inv => `
        <div class="list-card">
            <div class="list-card-header">
                <span class="list-card-id">${inv.invoiceNumber}</span>
                <span class="status-badge status-${inv.status}">${inv.status}</span>
            </div>
            <div class="list-card-customer">${inv.customerName}</div>
            <div class="list-card-date">Due: ${formatDate(inv.dueDate)}</div>
            <div class="list-card-footer">
                <span class="list-card-amount">${formatCurrency(inv.total - (inv.paidAmount || 0))}</span>
                <div class="list-card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="viewInvoice('${inv.invoiceNumber}')">View</button>
                    ${inv.status !== 'paid' ? `<button class="btn btn-sm btn-success" onclick="markInvoicePaid('${inv.invoiceNumber}')">Paid</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function viewInvoice(invoiceNumber) {
    const invoices = getInvoices();
    const invoice = invoices.find(i => i.invoiceNumber === invoiceNumber);
    if (!invoice) return;

    window.tempInvoice = invoice;
    document.getElementById('invoicePreviewContent').innerHTML = generateInvoiceHTML(invoice);
    document.getElementById('invoicePreviewModal').style.display = 'flex';
}

function markInvoicePaid(invoiceNumber) {
    const invoices = getInvoices();
    const idx = invoices.findIndex(i => i.invoiceNumber === invoiceNumber);
    if (idx === -1) return;

    invoices[idx].status = 'paid';
    invoices[idx].paidAmount = invoices[idx].total;
    invoices[idx].paidDate = new Date().toISOString();

    localStorage.setItem('btp_invoices', JSON.stringify(invoices));
    showToast('Invoice marked as paid!', 'success');
    loadInvoicesList();
    loadDashboardData();
}

// ============================================
// Pricing Guide
// ============================================
function initPricingTable() {
    const pricing = getPricing();

    // Main table
    const tbody = document.getElementById('pricingTableBody');
    tbody.innerHTML = pricing.map(p => `
        <tr>
            <td><strong>${p.name}</strong></td>
            <td class="our-price">$${p.ourPriceLow} - $${p.ourPriceHigh}</td>
            <td class="market-price">$${p.marketLow} - $${p.marketHigh}</td>
            <td>${p.unit}</td>
        </tr>
    `).join('');

    // Quick reference
    const quickRef = document.getElementById('quickRefGrid');
    quickRef.innerHTML = TYPICAL_JOBS.map(job => `
        <div class="quick-ref-item">
            <span class="quick-ref-label">${job.label}</span>
            <span class="quick-ref-value">${formatCurrency(job.low)} - ${formatCurrency(job.high)}</span>
        </div>
    `).join('');
}

// ============================================
// Customers
// ============================================
function loadCustomersList(filter = 'all', search = '') {
    const customers = getCustomers();
    const container = document.getElementById('customersListCards');

    let filtered = customers;

    if (filter !== 'all') {
        filtered = filtered.filter(c => c.type === filter);
    }

    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(s) ||
            c.phone.includes(s) ||
            (c.address && c.address.toLowerCase().includes(s))
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No customers found</p>';
        return;
    }

    container.innerHTML = filtered.map(c => `
        <div class="list-card">
            <div class="list-card-header">
                <span class="list-card-customer">${c.name}</span>
                <span class="status-badge status-${c.type === 'commercial' ? 'sent' : 'draft'}">${c.type}</span>
            </div>
            <div class="list-card-service">${c.phone}</div>
            <div class="list-card-date">${c.address || ''}, ${c.city || ''}</div>
            <div class="list-card-footer">
                <span>${c.jobCount || 1} job(s)</span>
                <div class="list-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="createQuoteForCustomer('${c.phone}')">New Quote</button>
                </div>
            </div>
        </div>
    `).join('');
}

function initCustomerSearch() {
    document.getElementById('customerSearch').addEventListener('input', function(e) {
        loadCustomersList('all', e.target.value);
    });
}

function createQuoteForCustomer(phone) {
    const customers = getCustomers();
    const customer = customers.find(c => c.phone === phone);
    if (!customer) return;

    goToSection('quickQuote');
    document.getElementById('qqCustomerName').value = customer.name;
    document.getElementById('qqCustomerPhone').value = customer.phone;
    document.getElementById('qqCustomerEmail').value = customer.email || '';
    document.getElementById('qqCustomerType').value = customer.type || 'residential';
    document.getElementById('qqJobAddress').value = customer.address || '';
    document.getElementById('qqJobCity').value = customer.city || '';
}

function saveCustomerFromQuote(quote) {
    const customers = getCustomers();
    const existing = customers.findIndex(c => c.phone === quote.customerPhone);

    const customerData = {
        name: quote.customerName,
        phone: quote.customerPhone,
        email: quote.customerEmail,
        type: quote.customerType,
        address: quote.jobAddress,
        city: quote.jobCity,
        jobCount: 1,
        lastContact: new Date().toISOString()
    };

    if (existing !== -1) {
        customers[existing].jobCount = (customers[existing].jobCount || 1) + 1;
        customers[existing].lastContact = new Date().toISOString();
    } else {
        customers.push(customerData);
    }

    localStorage.setItem('btp_customers', JSON.stringify(customers));
}

function saveCustomerFromInvoice(invoice) {
    const customers = getCustomers();
    const existing = customers.findIndex(c => c.phone === invoice.customerPhone);

    if (existing !== -1) {
        customers[existing].jobCount = (customers[existing].jobCount || 1) + 1;
    } else {
        customers.push({
            name: invoice.customerName,
            phone: invoice.customerPhone,
            email: invoice.customerEmail,
            type: 'residential',
            address: invoice.jobAddress,
            city: invoice.jobCity,
            jobCount: 1,
            lastContact: new Date().toISOString()
        });
    }

    localStorage.setItem('btp_customers', JSON.stringify(customers));
}

// ============================================
// Filter Tabs
// ============================================
function initFilterTabs() {
    document.querySelectorAll('.filter-tabs').forEach(tabGroup => {
        tabGroup.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                tabGroup.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                const filter = this.dataset.filter;
                const section = tabGroup.closest('.content-section').id;

                if (section === 'quotesSection') {
                    loadQuotesList(filter);
                } else if (section === 'invoicesSection') {
                    loadInvoicesList(filter);
                } else if (section === 'customersSection') {
                    loadCustomersList(filter);
                }
            });
        });
    });
}

// ============================================
// Settings
// ============================================
function initSettings() {
    // Load settings
    const settings = getSettings();
    document.getElementById('businessName').value = settings.businessName || 'BlacktopProz';
    document.getElementById('businessPhone').value = settings.businessPhone || '(601) 813-2533';
    document.getElementById('businessEmail').value = settings.businessEmail || '';
    document.getElementById('businessAddress').value = settings.businessAddress || 'Jackson, MS';

    const paymentInfo = getPaymentInfo();
    document.getElementById('venmoHandle').value = paymentInfo.venmo || '';
    document.getElementById('zelleInfo').value = paymentInfo.zelle || '';
    document.getElementById('checkPayable').value = paymentInfo.checkPayable || 'BlacktopProz';

    // Save settings
    document.getElementById('settingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const newSettings = {
            businessName: document.getElementById('businessName').value,
            businessPhone: document.getElementById('businessPhone').value,
            businessEmail: document.getElementById('businessEmail').value,
            businessAddress: document.getElementById('businessAddress').value
        };
        localStorage.setItem('btp_settings', JSON.stringify(newSettings));
        showToast('Settings saved!', 'success');
    });

    // Save payment info
    document.getElementById('paymentInfoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const paymentInfo = {
            venmo: document.getElementById('venmoHandle').value,
            zelle: document.getElementById('zelleInfo').value,
            checkPayable: document.getElementById('checkPayable').value
        };
        localStorage.setItem('btp_payment', JSON.stringify(paymentInfo));
        showToast('Payment info saved!', 'success');
    });

    // Change password
    document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;

        const storedPassword = localStorage.getItem('btpPassword') || DEFAULT_PASSWORD;

        if (current !== storedPassword) {
            showToast('Current password is incorrect', 'error');
            return;
        }

        if (newPass !== confirm) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (newPass.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        localStorage.setItem('btpPassword', newPass);
        showToast('Password updated!', 'success');
        document.getElementById('passwordForm').reset();
    });
}

// ============================================
// Utility Functions
// ============================================
function getQuotes() {
    return JSON.parse(localStorage.getItem('btp_quotes') || '[]');
}

function saveQuote(quote) {
    const quotes = getQuotes();
    quotes.push(quote);
    localStorage.setItem('btp_quotes', JSON.stringify(quotes));
    loadQuotesList();
}

function getInvoices() {
    return JSON.parse(localStorage.getItem('btp_invoices') || '[]');
}

function getCustomers() {
    return JSON.parse(localStorage.getItem('btp_customers') || '[]');
}

function getPricing() {
    return JSON.parse(localStorage.getItem('btp_pricing')) || DEFAULT_PRICING;
}

function getSettings() {
    return JSON.parse(localStorage.getItem('btp_settings') || '{}');
}

function getPaymentInfo() {
    return JSON.parse(localStorage.getItem('btp_payment') || '{}');
}

function generateQuoteNumber() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `Q-${y}${m}${d}-${rand}`;
}

function generateInvoiceNumber() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const count = getInvoices().length + 1;
    return `INV-${y}${m}${d}-${String(count).padStart(3, '0')}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getDatePlusDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function printDocument(html) {
    const printContainer = document.getElementById('printContainer');
    printContainer.innerHTML = html;
    window.print();
}
