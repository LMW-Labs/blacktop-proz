// ============================================
// BlackTop Proz Admin Dashboard
// ============================================

// Default password (change this!)
const DEFAULT_PASSWORD = 'blacktop2024';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Check if logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    } else {
        showLogin();
    }

    // Initialize event listeners
    initLoginForm();
    initNavigation();
    initQuoteForm();
    initInvoiceForm();
    initSettings();
    initLogout();

    // Load data
    loadDashboardStats();
    loadQuotes();
    loadInvoices();
    loadCustomers();

    // Set default dates
    setDefaultDates();
}

// ============================================
// Authentication
// ============================================
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const storedPassword = localStorage.getItem('adminPassword') || DEFAULT_PASSWORD;

        if (password === storedPassword) {
            localStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
        } else {
            document.getElementById('loginError').textContent = 'Invalid password. Please try again.';
        }
    });
}

function initLogout() {
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('adminLoggedIn');
        showLogin();
    });
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('password').value = '';
    document.getElementById('loginError').textContent = '';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadDashboardStats();
}

// ============================================
// Navigation
// ============================================
function initNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;

            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Show section
            document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(section + 'Section').classList.add('active');
        });
    });
}

// ============================================
// Dashboard Stats
// ============================================
function loadDashboardStats() {
    const quotes = getQuotes();
    const invoices = getInvoices();

    document.getElementById('totalQuotes').textContent = quotes.length;
    document.getElementById('totalInvoices').textContent = invoices.length;
    document.getElementById('pendingQuotes').textContent = quotes.filter(q => q.status === 'pending').length;

    const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);

    // Load recent activity
    loadRecentActivity();
}

function loadRecentActivity() {
    const quotes = getQuotes();
    const invoices = getInvoices();
    const activities = [];

    quotes.slice(-5).forEach(q => {
        activities.push({
            type: 'quote',
            text: `Quote #${q.id} created for ${q.customerName}`,
            date: q.date,
            amount: q.total
        });
    });

    invoices.slice(-5).forEach(inv => {
        activities.push({
            type: 'invoice',
            text: `Invoice #${inv.id} ${inv.status} - ${inv.customerName}`,
            date: inv.date,
            amount: inv.total
        });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    const activityList = document.getElementById('recentActivity');
    if (activities.length === 0) {
        activityList.innerHTML = '<p class="no-data">No recent activity</p>';
    } else {
        activityList.innerHTML = activities.slice(0, 10).map(act => `
            <div class="activity-item">
                <span>${act.text}</span>
                <span>${formatCurrency(act.amount)}</span>
            </div>
        `).join('');
    }
}

// ============================================
// Quotes Management
// ============================================
function initQuoteForm() {
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    const closeQuoteForm = document.getElementById('closeQuoteForm');
    const cancelQuote = document.getElementById('cancelQuote');
    const quoteForm = document.getElementById('quoteForm');
    const addLineItemBtn = document.getElementById('addLineItem');

    newQuoteBtn.addEventListener('click', () => openQuoteForm());
    closeQuoteForm.addEventListener('click', () => closeQuoteFormFn());
    cancelQuote.addEventListener('click', () => closeQuoteFormFn());
    addLineItemBtn.addEventListener('click', () => addLineItem('lineItems'));

    quoteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveQuote();
    });

    // Calculate totals on input
    document.getElementById('taxRate').addEventListener('input', () => calculateTotals('quote'));
}

function openQuoteForm(quote = null) {
    document.getElementById('quoteFormContainer').style.display = 'block';
    document.getElementById('quoteFormTitle').textContent = quote ? 'Edit Quote' : 'Create New Quote';

    if (quote) {
        document.getElementById('quoteId').value = quote.id;
        document.getElementById('customerName').value = quote.customerName;
        document.getElementById('customerPhone').value = quote.customerPhone;
        document.getElementById('customerEmail').value = quote.customerEmail || '';
        document.getElementById('quoteDate').value = quote.date;
        document.getElementById('customerAddress').value = quote.address;
        document.getElementById('customerCity').value = quote.city;
        document.getElementById('customerState').value = quote.state;
        document.getElementById('customerZip').value = quote.zip || '';
        document.getElementById('serviceType').value = quote.serviceType;
        document.getElementById('taxRate').value = quote.taxRate || 7;
        document.getElementById('quoteNotes').value = quote.notes || '';
        document.getElementById('validUntil').value = quote.validUntil || '';

        // Load line items
        document.getElementById('lineItems').innerHTML = '';
        if (quote.lineItems) {
            quote.lineItems.forEach(item => addLineItem('lineItems', item));
        }
    } else {
        document.getElementById('quoteForm').reset();
        document.getElementById('quoteId').value = '';
        document.getElementById('lineItems').innerHTML = '';
        addLineItem('lineItems');
        setDefaultDates();
    }

    calculateTotals('quote');
}

function closeQuoteFormFn() {
    document.getElementById('quoteFormContainer').style.display = 'none';
    document.getElementById('quoteForm').reset();
}

function addLineItem(containerId, item = null) {
    const container = document.getElementById(containerId);
    const index = container.children.length;

    const lineItemHtml = `
        <div class="line-item" data-index="${index}">
            <div class="form-group">
                <label>Description</label>
                <input type="text" name="description" value="${item?.description || ''}" placeholder="e.g., Concrete driveway 20x40ft" required>
            </div>
            <div class="form-group">
                <label>Qty</label>
                <input type="number" name="quantity" value="${item?.quantity || 1}" min="1" step="1" required>
            </div>
            <div class="form-group">
                <label>Unit</label>
                <input type="text" name="unit" value="${item?.unit || 'ea'}" placeholder="sq ft, ea, hr">
            </div>
            <div class="form-group">
                <label>Rate ($)</label>
                <input type="number" name="rate" value="${item?.rate || ''}" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="text" name="amount" value="${item ? formatCurrency(item.quantity * item.rate) : '$0.00'}" readonly>
            </div>
            <button type="button" class="btn-remove" onclick="removeLineItem(this, '${containerId}')">&times;</button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', lineItemHtml);

    // Add event listeners for calculations
    const lineItem = container.lastElementChild;
    const qtyInput = lineItem.querySelector('[name="quantity"]');
    const rateInput = lineItem.querySelector('[name="rate"]');

    qtyInput.addEventListener('input', () => updateLineItemAmount(lineItem, containerId));
    rateInput.addEventListener('input', () => updateLineItemAmount(lineItem, containerId));
}

function removeLineItem(btn, containerId) {
    btn.closest('.line-item').remove();
    const type = containerId === 'lineItems' ? 'quote' : 'invoice';
    calculateTotals(type);
}

function updateLineItemAmount(lineItem, containerId) {
    const qty = parseFloat(lineItem.querySelector('[name="quantity"]').value) || 0;
    const rate = parseFloat(lineItem.querySelector('[name="rate"]').value) || 0;
    const amount = qty * rate;
    lineItem.querySelector('[name="amount"]').value = formatCurrency(amount);

    const type = containerId === 'lineItems' ? 'quote' : 'invoice';
    calculateTotals(type);
}

function calculateTotals(type) {
    const containerId = type === 'quote' ? 'lineItems' : 'invoiceLineItems';
    const container = document.getElementById(containerId);
    const lineItems = container.querySelectorAll('.line-item');

    let subtotal = 0;
    lineItems.forEach(item => {
        const qty = parseFloat(item.querySelector('[name="quantity"]').value) || 0;
        const rate = parseFloat(item.querySelector('[name="rate"]').value) || 0;
        subtotal += qty * rate;
    });

    const taxRateId = type === 'quote' ? 'taxRate' : 'invoiceTaxRate';
    const taxRate = parseFloat(document.getElementById(taxRateId).value) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    if (type === 'quote') {
        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('taxAmount').textContent = formatCurrency(tax);
        document.getElementById('grandTotal').textContent = formatCurrency(total);
    } else {
        document.getElementById('invoiceSubtotal').textContent = formatCurrency(subtotal);
        document.getElementById('invoiceTaxAmount').textContent = formatCurrency(tax);
        document.getElementById('invoiceGrandTotal').textContent = formatCurrency(total);
    }
}

function saveQuote() {
    const quotes = getQuotes();
    const quoteId = document.getElementById('quoteId').value;

    const lineItems = [];
    document.querySelectorAll('#lineItems .line-item').forEach(item => {
        lineItems.push({
            description: item.querySelector('[name="description"]').value,
            quantity: parseFloat(item.querySelector('[name="quantity"]').value),
            unit: item.querySelector('[name="unit"]').value,
            rate: parseFloat(item.querySelector('[name="rate"]').value)
        });
    });

    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const quoteData = {
        id: quoteId || generateId('Q'),
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerEmail: document.getElementById('customerEmail').value,
        date: document.getElementById('quoteDate').value,
        address: document.getElementById('customerAddress').value,
        city: document.getElementById('customerCity').value,
        state: document.getElementById('customerState').value,
        zip: document.getElementById('customerZip').value,
        serviceType: document.getElementById('serviceType').value,
        lineItems: lineItems,
        subtotal: subtotal,
        taxRate: taxRate,
        tax: tax,
        total: total,
        notes: document.getElementById('quoteNotes').value,
        validUntil: document.getElementById('validUntil').value,
        status: 'pending',
        createdAt: quoteId ? (quotes.find(q => q.id === quoteId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    if (quoteId) {
        const index = quotes.findIndex(q => q.id === quoteId);
        quotes[index] = quoteData;
    } else {
        quotes.push(quoteData);
    }

    saveQuotes(quotes);
    closeQuoteFormFn();
    loadQuotes();
    loadDashboardStats();
    saveCustomer(quoteData);

    alert(quoteId ? 'Quote updated successfully!' : 'Quote created successfully!');
}

function loadQuotes() {
    const quotes = getQuotes();
    const tbody = document.getElementById('quotesTableBody');

    if (quotes.length === 0) {
        tbody.innerHTML = '<tr class="no-data-row"><td colspan="7">No quotes yet. Create your first quote!</td></tr>';
        return;
    }

    tbody.innerHTML = quotes.map(quote => `
        <tr>
            <td><strong>${quote.id}</strong></td>
            <td>${formatDate(quote.date)}</td>
            <td>${quote.customerName}</td>
            <td>${quote.serviceType}</td>
            <td>${formatCurrency(quote.total)}</td>
            <td><span class="status-badge status-${quote.status}">${quote.status}</span></td>
            <td class="actions">
                <button class="btn btn-sm btn-secondary" onclick="editQuote('${quote.id}')">Edit</button>
                <button class="btn btn-sm btn-primary" onclick="printQuote('${quote.id}')">Print</button>
                <button class="btn btn-sm btn-success" onclick="convertToInvoice('${quote.id}')">Invoice</button>
                <button class="btn btn-sm btn-danger" onclick="deleteQuote('${quote.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function editQuote(id) {
    const quotes = getQuotes();
    const quote = quotes.find(q => q.id === id);
    if (quote) {
        openQuoteForm(quote);
    }
}

function deleteQuote(id) {
    if (confirm('Are you sure you want to delete this quote?')) {
        const quotes = getQuotes().filter(q => q.id !== id);
        saveQuotes(quotes);
        loadQuotes();
        loadDashboardStats();
    }
}

function printQuote(id) {
    const quotes = getQuotes();
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;

    // Populate print template
    document.getElementById('printQuoteNumber').textContent = quote.id;
    document.getElementById('printQuoteDate').textContent = formatDate(quote.date);
    document.getElementById('printValidUntil').textContent = quote.validUntil ? formatDate(quote.validUntil) : 'N/A';
    document.getElementById('printQuoteCustomerName').textContent = quote.customerName;
    document.getElementById('printQuoteCustomerAddress').textContent = quote.address;
    document.getElementById('printQuoteCustomerCityStateZip').textContent = `${quote.city}, ${quote.state} ${quote.zip}`;
    document.getElementById('printQuoteCustomerPhone').textContent = quote.customerPhone;
    document.getElementById('printQuoteCustomerEmail').textContent = quote.customerEmail || '';
    document.getElementById('printQuoteJobAddress').textContent = quote.address;
    document.getElementById('printQuoteJobCityStateZip').textContent = `${quote.city}, ${quote.state} ${quote.zip}`;
    document.getElementById('printQuoteServiceType').textContent = quote.serviceType;

    // Line items
    const lineItemsHtml = quote.lineItems.map(item => `
        <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>${formatCurrency(item.rate)}</td>
            <td>${formatCurrency(item.quantity * item.rate)}</td>
        </tr>
    `).join('');
    document.getElementById('printQuoteLineItems').innerHTML = lineItemsHtml;

    // Totals
    document.getElementById('printQuoteSubtotal').textContent = formatCurrency(quote.subtotal);
    document.getElementById('printQuoteTaxRate').textContent = quote.taxRate;
    document.getElementById('printQuoteTax').textContent = formatCurrency(quote.tax);
    document.getElementById('printQuoteTotal').textContent = formatCurrency(quote.total);
    document.getElementById('printQuoteNotes').textContent = quote.notes || getSettings().quoteTerms || '';

    // Hide invoice, show quote
    document.getElementById('printInvoice').style.display = 'none';
    document.getElementById('printQuote').style.display = 'block';

    window.print();
}

function convertToInvoice(quoteId) {
    const quotes = getQuotes();
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    // Switch to invoices section
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-section="invoices"]').classList.add('active');
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('invoicesSection').classList.add('active');

    // Open invoice form with quote data
    openInvoiceForm(null, quote);
}

// ============================================
// Invoice Management
// ============================================
function initInvoiceForm() {
    const newInvoiceBtn = document.getElementById('newInvoiceBtn');
    const closeInvoiceForm = document.getElementById('closeInvoiceForm');
    const cancelInvoice = document.getElementById('cancelInvoice');
    const invoiceForm = document.getElementById('invoiceForm');
    const addLineItemBtn = document.getElementById('addInvoiceLineItem');
    const invoiceFromQuote = document.getElementById('invoiceFromQuote');

    newInvoiceBtn.addEventListener('click', () => openInvoiceForm());
    closeInvoiceForm.addEventListener('click', () => closeInvoiceFormFn());
    cancelInvoice.addEventListener('click', () => closeInvoiceFormFn());
    addLineItemBtn.addEventListener('click', () => addLineItem('invoiceLineItems'));

    invoiceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveInvoice();
    });

    document.getElementById('invoiceTaxRate').addEventListener('input', () => calculateTotals('invoice'));

    invoiceFromQuote.addEventListener('change', function() {
        if (this.value) {
            const quotes = getQuotes();
            const quote = quotes.find(q => q.id === this.value);
            if (quote) {
                populateInvoiceFromQuote(quote);
            }
        }
    });
}

function openInvoiceForm(invoice = null, fromQuote = null) {
    document.getElementById('invoiceFormContainer').style.display = 'block';
    document.getElementById('invoiceFormTitle').textContent = invoice ? 'Edit Invoice' : 'Create New Invoice';

    // Populate quote dropdown
    populateQuoteDropdown();

    const data = invoice || fromQuote;

    if (data) {
        document.getElementById('invoiceId').value = invoice?.id || '';
        document.getElementById('invoiceCustomerName').value = data.customerName;
        document.getElementById('invoiceCustomerPhone').value = data.customerPhone;
        document.getElementById('invoiceCustomerEmail').value = data.customerEmail || '';
        document.getElementById('invoiceDate').value = invoice?.date || new Date().toISOString().split('T')[0];
        document.getElementById('invoiceCustomerAddress').value = data.address;
        document.getElementById('invoiceCustomerCity').value = data.city;
        document.getElementById('invoiceCustomerState').value = data.state;
        document.getElementById('invoiceCustomerZip').value = data.zip || '';
        document.getElementById('invoiceServiceType').value = data.serviceType;
        document.getElementById('invoiceTaxRate').value = data.taxRate || 7;
        document.getElementById('invoiceNotes').value = data.notes || getSettings().invoiceTerms || '';
        document.getElementById('dueDate').value = invoice?.dueDate || getDefaultDueDate();
        document.getElementById('invoiceStatus').value = invoice?.status || 'pending';

        // Load line items
        document.getElementById('invoiceLineItems').innerHTML = '';
        if (data.lineItems) {
            data.lineItems.forEach(item => addLineItem('invoiceLineItems', item));
        }
    } else {
        document.getElementById('invoiceForm').reset();
        document.getElementById('invoiceId').value = '';
        document.getElementById('invoiceLineItems').innerHTML = '';
        addLineItem('invoiceLineItems');
        document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('dueDate').value = getDefaultDueDate();
    }

    calculateTotals('invoice');
}

function populateQuoteDropdown() {
    const quotes = getQuotes();
    const select = document.getElementById('invoiceFromQuote');
    select.innerHTML = '<option value="">Start fresh...</option>';
    quotes.forEach(q => {
        select.innerHTML += `<option value="${q.id}">${q.id} - ${q.customerName} (${formatCurrency(q.total)})</option>`;
    });
}

function populateInvoiceFromQuote(quote) {
    document.getElementById('invoiceCustomerName').value = quote.customerName;
    document.getElementById('invoiceCustomerPhone').value = quote.customerPhone;
    document.getElementById('invoiceCustomerEmail').value = quote.customerEmail || '';
    document.getElementById('invoiceCustomerAddress').value = quote.address;
    document.getElementById('invoiceCustomerCity').value = quote.city;
    document.getElementById('invoiceCustomerState').value = quote.state;
    document.getElementById('invoiceCustomerZip').value = quote.zip || '';
    document.getElementById('invoiceServiceType').value = quote.serviceType;
    document.getElementById('invoiceTaxRate').value = quote.taxRate || 7;
    document.getElementById('invoiceNotes').value = quote.notes || '';

    document.getElementById('invoiceLineItems').innerHTML = '';
    quote.lineItems.forEach(item => addLineItem('invoiceLineItems', item));

    calculateTotals('invoice');
}

function closeInvoiceFormFn() {
    document.getElementById('invoiceFormContainer').style.display = 'none';
    document.getElementById('invoiceForm').reset();
}

function saveInvoice() {
    const invoices = getInvoices();
    const invoiceId = document.getElementById('invoiceId').value;

    const lineItems = [];
    document.querySelectorAll('#invoiceLineItems .line-item').forEach(item => {
        lineItems.push({
            description: item.querySelector('[name="description"]').value,
            quantity: parseFloat(item.querySelector('[name="quantity"]').value),
            unit: item.querySelector('[name="unit"]').value,
            rate: parseFloat(item.querySelector('[name="rate"]').value)
        });
    });

    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxRate = parseFloat(document.getElementById('invoiceTaxRate').value) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const invoiceData = {
        id: invoiceId || generateId('INV'),
        customerName: document.getElementById('invoiceCustomerName').value,
        customerPhone: document.getElementById('invoiceCustomerPhone').value,
        customerEmail: document.getElementById('invoiceCustomerEmail').value,
        date: document.getElementById('invoiceDate').value,
        address: document.getElementById('invoiceCustomerAddress').value,
        city: document.getElementById('invoiceCustomerCity').value,
        state: document.getElementById('invoiceCustomerState').value,
        zip: document.getElementById('invoiceCustomerZip').value,
        serviceType: document.getElementById('invoiceServiceType').value,
        lineItems: lineItems,
        subtotal: subtotal,
        taxRate: taxRate,
        tax: tax,
        total: total,
        notes: document.getElementById('invoiceNotes').value,
        dueDate: document.getElementById('dueDate').value,
        status: document.getElementById('invoiceStatus').value,
        createdAt: invoiceId ? (invoices.find(inv => inv.id === invoiceId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    if (invoiceId) {
        const index = invoices.findIndex(inv => inv.id === invoiceId);
        invoices[index] = invoiceData;
    } else {
        invoices.push(invoiceData);
    }

    saveInvoices(invoices);
    closeInvoiceFormFn();
    loadInvoices();
    loadDashboardStats();
    saveCustomer(invoiceData);

    alert(invoiceId ? 'Invoice updated successfully!' : 'Invoice created successfully!');
}

function loadInvoices() {
    const invoices = getInvoices();
    const tbody = document.getElementById('invoicesTableBody');

    if (invoices.length === 0) {
        tbody.innerHTML = '<tr class="no-data-row"><td colspan="7">No invoices yet. Create your first invoice!</td></tr>';
        return;
    }

    tbody.innerHTML = invoices.map(invoice => `
        <tr>
            <td><strong>${invoice.id}</strong></td>
            <td>${formatDate(invoice.date)}</td>
            <td>${invoice.customerName}</td>
            <td>${formatCurrency(invoice.total)}</td>
            <td>${formatDate(invoice.dueDate)}</td>
            <td><span class="status-badge status-${invoice.status}">${invoice.status}</span></td>
            <td class="actions">
                <button class="btn btn-sm btn-secondary" onclick="editInvoice('${invoice.id}')">Edit</button>
                <button class="btn btn-sm btn-primary" onclick="printInvoice('${invoice.id}')">Print</button>
                <button class="btn btn-sm btn-success" onclick="markAsPaid('${invoice.id}')">Paid</button>
                <button class="btn btn-sm btn-danger" onclick="deleteInvoice('${invoice.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function editInvoice(id) {
    const invoices = getInvoices();
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
        openInvoiceForm(invoice);
    }
}

function deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        const invoices = getInvoices().filter(inv => inv.id !== id);
        saveInvoices(invoices);
        loadInvoices();
        loadDashboardStats();
    }
}

function markAsPaid(id) {
    const invoices = getInvoices();
    const index = invoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
        invoices[index].status = 'paid';
        invoices[index].paidDate = new Date().toISOString();
        saveInvoices(invoices);
        loadInvoices();
        loadDashboardStats();
        alert('Invoice marked as paid!');
    }
}

function printInvoice(id) {
    const invoices = getInvoices();
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    // Populate print template
    document.getElementById('printInvoiceNumber').textContent = invoice.id;
    document.getElementById('printInvoiceDate').textContent = formatDate(invoice.date);
    document.getElementById('printDueDate').textContent = formatDate(invoice.dueDate);
    document.getElementById('printCustomerName').textContent = invoice.customerName;
    document.getElementById('printCustomerAddress').textContent = invoice.address;
    document.getElementById('printCustomerCityStateZip').textContent = `${invoice.city}, ${invoice.state} ${invoice.zip}`;
    document.getElementById('printCustomerPhone').textContent = invoice.customerPhone;
    document.getElementById('printCustomerEmail').textContent = invoice.customerEmail || '';
    document.getElementById('printJobAddress').textContent = invoice.address;
    document.getElementById('printJobCityStateZip').textContent = `${invoice.city}, ${invoice.state} ${invoice.zip}`;
    document.getElementById('printServiceType').textContent = invoice.serviceType;

    // Line items
    const lineItemsHtml = invoice.lineItems.map(item => `
        <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>${formatCurrency(item.rate)}</td>
            <td>${formatCurrency(item.quantity * item.rate)}</td>
        </tr>
    `).join('');
    document.getElementById('printLineItems').innerHTML = lineItemsHtml;

    // Totals
    document.getElementById('printSubtotal').textContent = formatCurrency(invoice.subtotal);
    document.getElementById('printTaxRate').textContent = invoice.taxRate;
    document.getElementById('printTax').textContent = formatCurrency(invoice.tax);
    document.getElementById('printTotal').textContent = formatCurrency(invoice.total);
    document.getElementById('printNotes').textContent = invoice.notes || getSettings().invoiceTerms || '';

    // Hide quote, show invoice
    document.getElementById('printQuote').style.display = 'none';
    document.getElementById('printInvoice').style.display = 'block';

    window.print();
}

// ============================================
// Customers Management
// ============================================
function loadCustomers() {
    const customers = getCustomers();
    const tbody = document.getElementById('customersTableBody');

    if (customers.length === 0) {
        tbody.innerHTML = '<tr class="no-data-row"><td colspan="6">No customers yet.</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td><strong>${customer.name}</strong></td>
            <td>${customer.phone}</td>
            <td>${customer.email || '-'}</td>
            <td>${customer.address}, ${customer.city}</td>
            <td>${customer.jobCount || 1}</td>
            <td class="actions">
                <button class="btn btn-sm btn-secondary" onclick="viewCustomer('${customer.phone}')">View</button>
            </td>
        </tr>
    `).join('');
}

function saveCustomer(data) {
    const customers = getCustomers();
    const existingIndex = customers.findIndex(c => c.phone === data.customerPhone);

    if (existingIndex !== -1) {
        customers[existingIndex].jobCount = (customers[existingIndex].jobCount || 1) + 1;
        customers[existingIndex].name = data.customerName;
        customers[existingIndex].email = data.customerEmail;
        customers[existingIndex].address = data.address;
        customers[existingIndex].city = data.city;
    } else {
        customers.push({
            name: data.customerName,
            phone: data.customerPhone,
            email: data.customerEmail,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            jobCount: 1
        });
    }

    localStorage.setItem('btp_customers', JSON.stringify(customers));
    loadCustomers();
}

function viewCustomer(phone) {
    // Could expand to show customer history
    alert('Customer details coming soon!');
}

// ============================================
// Settings
// ============================================
function initSettings() {
    const settingsForm = document.getElementById('settingsForm');
    const passwordForm = document.getElementById('passwordForm');

    // Load settings
    const settings = getSettings();
    document.getElementById('businessName').value = settings.businessName || 'BlackTop Proz';
    document.getElementById('businessPhone').value = settings.businessPhone || '(601) 813-2533';
    document.getElementById('businessEmail').value = settings.businessEmail || '';
    document.getElementById('businessAddress').value = settings.businessAddress || 'Jackson, MS';
    document.getElementById('defaultTaxRate').value = settings.defaultTaxRate || 7;
    document.getElementById('invoiceTerms').value = settings.invoiceTerms || '';
    document.getElementById('quoteTerms').value = settings.quoteTerms || '';

    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newSettings = {
            businessName: document.getElementById('businessName').value,
            businessPhone: document.getElementById('businessPhone').value,
            businessEmail: document.getElementById('businessEmail').value,
            businessAddress: document.getElementById('businessAddress').value,
            defaultTaxRate: document.getElementById('defaultTaxRate').value,
            invoiceTerms: document.getElementById('invoiceTerms').value,
            quoteTerms: document.getElementById('quoteTerms').value
        };
        localStorage.setItem('btp_settings', JSON.stringify(newSettings));
        alert('Settings saved successfully!');
    });

    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;

        const storedPassword = localStorage.getItem('adminPassword') || DEFAULT_PASSWORD;

        if (current !== storedPassword) {
            alert('Current password is incorrect.');
            return;
        }

        if (newPass !== confirm) {
            alert('New passwords do not match.');
            return;
        }

        if (newPass.length < 6) {
            alert('Password must be at least 6 characters.');
            return;
        }

        localStorage.setItem('adminPassword', newPass);
        alert('Password updated successfully!');
        passwordForm.reset();
    });
}

// ============================================
// Utility Functions
// ============================================
function getQuotes() {
    return JSON.parse(localStorage.getItem('btp_quotes') || '[]');
}

function saveQuotes(quotes) {
    localStorage.setItem('btp_quotes', JSON.stringify(quotes));
}

function getInvoices() {
    return JSON.parse(localStorage.getItem('btp_invoices') || '[]');
}

function saveInvoices(invoices) {
    localStorage.setItem('btp_invoices', JSON.stringify(invoices));
}

function getCustomers() {
    return JSON.parse(localStorage.getItem('btp_customers') || '[]');
}

function getSettings() {
    return JSON.parse(localStorage.getItem('btp_settings') || '{}');
}

function generateId(prefix) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const quoteDate = document.getElementById('quoteDate');
    const validUntil = document.getElementById('validUntil');
    const invoiceDate = document.getElementById('invoiceDate');
    const dueDate = document.getElementById('dueDate');

    if (quoteDate) quoteDate.value = today;
    if (invoiceDate) invoiceDate.value = today;

    // Valid for 30 days
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    if (validUntil) validUntil.value = thirtyDays.toISOString().split('T')[0];
    if (dueDate) dueDate.value = thirtyDays.toISOString().split('T')[0];
}

function getDefaultDueDate() {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return thirtyDays.toISOString().split('T')[0];
}
