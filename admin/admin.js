document.addEventListener('DOMContentLoaded', () => {
  // Global storage for data
  window.APP_DATA = {
    userData: { admin: [], customers: [], sellers: [] },
    productsData: [],
    ordersData: [],
    adminMessages: []
  };

  const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
  const statusChangeModal = new bootstrap.Modal(document.getElementById('confirmStatusChangeModal'));
  const addSellerBModal = new bootstrap.Modal(document.getElementById('addSellerModal'));

  // --- DATA INITIALIZATION ---
  function initializeData() {
    APP_DATA.userData = JSON.parse(localStorage.getItem('userData')) || { admin: [], customers: [], sellers: [] };
    APP_DATA.productsData = JSON.parse(localStorage.getItem('products')) || [];
    APP_DATA.ordersData = JSON.parse(localStorage.getItem('orders')) || [];
    APP_DATA.adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];

    // Ensure users have a 'status' field, default to 'enabled' if missing
    // New sellers from signup should already have 'disabled'
    ['customers', 'sellers'].forEach(roleType => {
      if (APP_DATA.userData[roleType]) {
        APP_DATA.userData[roleType].forEach(user => {
          if (user.status === undefined) {
            // For sellers, if they are new and somehow missed status, assume disabled
            // For customers, assume enabled
            user.status = (roleType === 'sellers' && !user.registeredAt) ? 'disabled' : 'enabled';
          }
        });
      }
    });
    // No immediate save needed, changes are saved on action
  }

  // --- DASHBOARD ---
  function populateDashboard() {
    const activeSellers = APP_DATA.userData.sellers ? APP_DATA.userData.sellers.filter(s => s.status === 'enabled').length : 0;
    const totalCustomers = APP_DATA.userData.customers ? APP_DATA.userData.customers.length : 0;

    document.getElementById('total-users-count').textContent = totalCustomers + activeSellers + (APP_DATA.userData.admin ? APP_DATA.userData.admin.length : 0);
    document.getElementById('total-products-count').textContent = APP_DATA.productsData.length;
    document.getElementById('total-sellers-count').textContent = activeSellers; // Only active sellers

    // Populate Recent Orders (simplified example)
    const recentOrdersList = document.getElementById('recent-orders-list');
    recentOrdersList.innerHTML = ''; // Clear loading
    const sortedOrders = [...APP_DATA.ordersData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    if (sortedOrders.length === 0) {
      recentOrdersList.innerHTML = '<tr><td colspan="6" class="text-center text-body-secondary py-3">No recent orders.</td></tr>';
      return;
    }
    sortedOrders.forEach(order => {
      const customer = APP_DATA.userData.customers.find(c => c.id === order.userId);
      const row = recentOrdersList.insertRow();
      row.innerHTML = `
                <td>${order.id}</td>
                <td>${customer ? customer.name : 'N/A'}</td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>EGP ${order.totalAmount.toFixed(2)}</td>
                <td><span class="badge bg-${order.status === 'Pending' ? 'warning text-dark' : 'success'}">${order.status}</span></td>
                <td><button class="btn btn-sm btn-outline-primary btn-view-details" data-id="${order.id}" data-type="order">View</button></td>
            `;
    });
    // Pending orders count
    const pendingOrders = APP_DATA.ordersData.filter(order => order.status === 'Pending').length;
    document.getElementById('pending-orders-count').textContent = pendingOrders;
  }

  // --- CUSTOMER MANAGEMENT ---
  function populateCustomerList() {
    const listElement = document.getElementById('customer-list');
    listElement.innerHTML = ''; // Clear existing
    const customers = APP_DATA.userData.customers || [];

    if (customers.length === 0) {
      listElement.innerHTML = '<tr><td colspan="6" class="text-center text-body-secondary py-3">No customers found.</td></tr>';
      return;
    }

    customers.forEach(customer => {
      const row = listElement.insertRow();
      row.className = customer.status === 'disabled' ? 'user-disabled' : '';
      const statusBadge = customer.status === 'enabled' ? `<span class="badge bg-success">Enabled</span>` : `<span class="badge bg-secondary">Disabled</span>`;
      const actionBtnText = customer.status === 'disabled' ? 'Enable' : 'Disable';
      const actionBtnClass = customer.status === 'disabled' ? 'btn-success' : 'btn-warning';
      const newState = customer.status === 'disabled' ? 'enabled' : 'disabled';

      row.innerHTML = `
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.registeredAt ? new Date(customer.registeredAt).toLocaleDateString() : 'N/A'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1 btn-view-details" data-id="${customer.id}" data-type="customer">Details</button>
                    <button class="btn btn-sm ${actionBtnClass} btn-toggle-status" data-user-id="${customer.id}" data-user-role="customer" data-new-state="${newState}">${actionBtnText}</button>
                </td>
            `;
    });
  }

  // --- SELLER MANAGEMENT ---
  function populateSellerList() {
    const listElement = document.getElementById('seller-list');
    listElement.innerHTML = '';
    const sellers = APP_DATA.userData.sellers || [];

    if (sellers.length === 0) {
      listElement.innerHTML = '<tr><td colspan="6" class="text-center text-body-secondary py-3">No sellers found.</td></tr>';
      return;
    }
    // Sort by status: disabled (pending approval) first, then by registration date or name
    sellers.sort((a, b) => {
      if (a.status === 'disabled' && b.status !== 'disabled') return -1;
      if (a.status !== 'disabled' && b.status === 'disabled') return 1;
      return new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0); // Newest first among same status
    });


    sellers.forEach(seller => {
      const row = listElement.insertRow();
      row.className = seller.status === 'disabled' ? 'user-disabled' : '';
      const statusBadge = seller.status === 'enabled' ? `<span class="badge bg-success">Enabled</span>` : `<span class="badge bg-warning text-dark">Disabled (Pending)</span>`;
      const actionBtnText = seller.status === 'disabled' ? 'Enable' : 'Disable';
      const actionBtnClass = seller.status === 'disabled' ? 'btn-success' : 'btn-warning';
      const newState = seller.status === 'disabled' ? 'enabled' : 'disabled';

      row.innerHTML = `
                <td>${seller.id}</td>
                <td>${seller.name} (Business: ${seller.businessname || 'N/A'})</td>
                <td>${seller.email}</td>
                <td>${seller.registeredAt ? new Date(seller.registeredAt).toLocaleDateString() : 'N/A'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1 btn-view-details" data-id="${seller.id}" data-type="seller">Details</button>
                    <button class="btn btn-sm ${actionBtnClass} btn-toggle-status" data-user-id="${seller.id}" data-user-role="seller" data-new-state="${newState}">${actionBtnText}</button>
                </td>
            `;
    });
  }

  // --- PRODUCT MANAGEMENT ---
  function populateProductList() {
    const listElement = document.getElementById('product-list');
    listElement.innerHTML = '';
    const products = APP_DATA.productsData || [];

    if (products.length === 0) {
      listElement.innerHTML = '<tr><td colspan="8" class="text-center text-body-secondary py-3">No products found.</td></tr>';
      return;
    }

    products.forEach(product => {
      if (!product || !product.id) return;

      const placeholderImg = "../imgs/placeholder.png";
      const imagePath = product.img
        ? `../${product.img.replace(/^\.?\//, "")}`
        : placeholderImg;

      const row = listElement.insertRow();
      row.innerHTML = `
    <td>${product.id}</td>
    <td><img src="${imagePath}" alt="${product.name}" style="width: 50px; height: auto;"></td>
    <td>${product.name}</td>
    <td>${product.category}</td>
    <td>EGP ${product.price.toFixed(2)}</td>
    <td>${product.sellerId}</td>
    <td>${product.available}</td>
    <td>
      <button class="btn btn-sm btn-info me-1 btn-view-details" data-id="${product.id}" data-type="product">Details</button>
    </td>
  `;
    });
  }

  // --- USER STATUS TOGGLE ---
  function confirmToggleUserStatus(userId, userRole, newState) {
    const modalBody = document.getElementById('confirmStatusChangeModalBody');
    const confirmBtn = document.getElementById('confirmStatusChangeBtn');
    const modalLabel = document.getElementById('confirmStatusChangeModalLabel');

    const actionText = newState === 'enabled' ? 'enable' : 'disable';
    modalBody.textContent = `Are you sure you want to ${actionText} this ${userRole}?`;
    modalLabel.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>Confirm ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`;

    confirmBtn.textContent = actionText.charAt(0).toUpperCase() + actionText.slice(1);
    confirmBtn.className = `btn ${newState === 'enabled' ? 'btn-success' : 'btn-danger'}`; // danger for disable, success for enable

    confirmBtn.dataset.userId = userId;
    confirmBtn.dataset.userRole = userRole;
    confirmBtn.dataset.newState = newState;
    statusChangeModal.show();
  }

  document.getElementById('confirmStatusChangeBtn').addEventListener('click', (event) => {
    const { userId, userRole, newState } = event.target.dataset;
    toggleUserStatus(userId, userRole, newState);
  });

  function toggleUserStatus(userId, userRole, newState) {
    let usersArray;
    if (userRole === 'customer') usersArray = APP_DATA.userData.customers;
    else if (userRole === 'seller') usersArray = APP_DATA.userData.sellers;
    else return;

    const user = usersArray.find(u => u.id == userId);
    if (user) {
      user.status = newState;
      localStorage.setItem('userData', JSON.stringify(APP_DATA.userData));
      showBootstrapAlert(`User ${user.name} status changed to ${newState}.`, 'success');

      if (userRole === 'customer') populateCustomerList();
      if (userRole === 'seller') populateSellerList();
      populateDashboard(); // Update counts if necessary (e.g. active sellers)
    }
    statusChangeModal.hide();
  }

  // --- ADD SELLER ---
  document.getElementById('addSellerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorDiv = document.getElementById('addSellerError');
    errorDiv.classList.add('d-none');

    const name = document.getElementById('newSellerFullName').value.trim();
    const email = document.getElementById('newSellerEmail').value.trim();
    const password = document.getElementById('newSellerPassword').value;
    const phone = document.getElementById('newSellerPhone').value.trim();
    const businessName = document.getElementById('newSellerBusinessName').value.trim();
    const address = document.getElementById('newSellerAddress').value.trim();

    if (!name || !email || !password || !businessName) {
      errorDiv.textContent = 'Full Name, Email, Password, and Business Name are required.';
      errorDiv.classList.remove('d-none');
      return;
    }
    if (password.length < 8) {
      errorDiv.textContent = 'Password must be at least 8 characters.';
      errorDiv.classList.remove('d-none');
      return;
    }
    // Check if email exists
    const allUsers = [...APP_DATA.userData.admin, ...APP_DATA.userData.customers, ...APP_DATA.userData.sellers];
    if (allUsers.some(user => user.email === email)) {
      errorDiv.textContent = 'This email is already registered.';
      errorDiv.classList.remove('d-none');
      return;
    }


    const hashedPassword = await hashPasswordAdmin(password);
    const newSeller = {
      id: generateUniqueIdForRole(APP_DATA.userData.sellers, 100), // Sellers start from 100
      name,
      email,
      password: hashedPassword,
      phonenum: phone,
      businessname: businessName,
      address,
      role: 'seller',
      status: 'enabled', // Admin adds active sellers
      registeredAt: new Date().toISOString(),
      // Add other fields from your seller structure if needed (businesstype, taxid, etc.)
      businesstype: '',
      taxid: '',
      products: [], // e.g. ['laptops', 'phones'] based on form if you add those fields
      inventory: '',
      experience: ''
    };

    APP_DATA.userData.sellers.push(newSeller);
    localStorage.setItem('userData', JSON.stringify(APP_DATA.userData));

    showBootstrapAlert(`Seller ${name} added successfully and is active.`, 'success');
    populateSellerList();
    populateDashboard();
    addSellerBModal.hide();
    event.target.reset();
  });

  async function hashPasswordAdmin(password) {
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    console.warn("Crypto API not fully available for password hashing. Using plaintext (not recommended for production).");
    return password; // Fallback, less secure
  }

  function generateUniqueIdForRole(itemsArray, minId = 1) {
    const ids = itemsArray.map(item => item.id);
    let newId = Math.max(minId - 1, ...ids.filter(id => typeof id === 'number' && !isNaN(id))) + 1;
    if (newId < minId) newId = minId;
    while (ids.includes(newId)) {
      newId++;
    }
    return newId;
  }

  // --- CUSTOMER SERVICE / MESSAGING ---
  let currentOpenConversationUserId = null;

  function initializeCustomerService() {
    loadConversationsList();
    document.getElementById('conversationsList').addEventListener('click', (e) => {
      const conversationItem = e.target.closest('.conversation-item');
      if (conversationItem) {
        const userId = conversationItem.dataset.userId;
        currentOpenConversationUserId = userId;
        displayConversation(userId);
        document.getElementById('conversationView').classList.remove('d-none');
        document.getElementById('noConversationSelectedView').classList.add('d-none');
      }
    });

    document.getElementById('sendAdminReplyBtn').addEventListener('click', () => {
      const messageText = document.getElementById('adminReplyText').value.trim();
      if (messageText && currentOpenConversationUserId) {
        sendAdminReply(currentOpenConversationUserId, messageText);
      } else if (!currentOpenConversationUserId) {
        showBootstrapAlert('No conversation selected to reply to.', 'warning');
      } else if (!messageText) {
        showBootstrapAlert('Cannot send an empty message.', 'warning');
      }
    });

    // Refresh conversations every 30 seconds (optional)
    // setInterval(loadConversationsList, 30000);
  }

  function loadConversationsList() {
    const conversationsListEl = document.getElementById('conversationsList');
    const loadingEl = document.getElementById('loading-conversations');
    conversationsListEl.innerHTML = ''; // Clear previous list but keep loadingEl if needed initially

    const messages = APP_DATA.adminMessages;
    // Group messages by userId and get the latest message for each
    const conversations = {};
    messages.forEach(msg => {
      if (!conversations[msg.userId] || new Date(msg.timestamp) > new Date(conversations[msg.userId].timestamp)) {
        conversations[msg.userId] = msg;
      }
    });

    const sortedUserIds = Object.keys(conversations).sort((a, b) => {
      return new Date(conversations[b].timestamp) - new Date(conversations[a].timestamp);
    });

    if (loadingEl) loadingEl.remove(); // Remove "Loading..."

    if (sortedUserIds.length === 0) {
      conversationsListEl.innerHTML = '<li class="list-group-item text-muted text-center">No messages yet.</li>';
      return;
    }

    sortedUserIds.forEach(userId => {
      const user = findUserById(userId);
      const userName = user ? `${user.name} (${user.role})` : `User ID: ${userId}`;
      const lastMessage = conversations[userId];

      const listItem = document.createElement('a'); // Use <a> or <div> with list-group-item-action
      listItem.href = "#";
      listItem.className = 'list-group-item list-group-item-action conversation-item';
      listItem.dataset.userId = userId;
      if (userId == currentOpenConversationUserId) {
        listItem.classList.add('active');
      }
      listItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1 text-truncate" style="max-width: 70%;">${userName}</h6>
                    <small class="text-muted">${new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
                <p class="mb-1 text-muted text-truncate small">${lastMessage.sender === 'admin' ? 'You: ' : ''}${lastMessage.message}</p>
            `;
      conversationsListEl.appendChild(listItem);
    });
  }

  function findUserById(userId) {
    userId = parseInt(userId); // Ensure numeric comparison if IDs are numbers
    return APP_DATA.userData.customers.find(c => c.id === userId) ||
      APP_DATA.userData.sellers.find(s => s.id === userId) ||
      APP_DATA.userData.admin.find(a => a.id === userId); // Less likely but for completeness
  }

  function displayConversation(userId) {
    // Highlight active conversation in list
    document.querySelectorAll('#conversationsList .conversation-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.userId == userId) {
        item.classList.add('active');
      }
    });

    const conversationThreadEl = document.getElementById('conversationThreadAdmin');
    conversationThreadEl.innerHTML = '';

    const user = findUserById(userId);
    const userNameForThread = user ? user.name : `User ${userId}`;
    document.getElementById('conversationWithUser').textContent = `Chat with: ${userNameForThread}`;

    const userMessages = APP_DATA.adminMessages
      .filter(msg => msg.userId == userId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (userMessages.length === 0) {
      conversationThreadEl.innerHTML = '<p class="text-center text-muted p-3">No messages in this conversation yet.</p>';
      return;
    }

    userMessages.forEach(msg => {
      const messageEl = document.createElement('div');
      messageEl.classList.add('mb-2', 'p-2', 'rounded', 'col-9'); // Max width for messages

      const senderDisplayName = msg.sender === 'admin' ? 'You (Admin)' : userNameForThread;
      const timestamp = new Date(msg.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

      if (msg.sender === 'admin') {
        messageEl.classList.add('bg-primary', 'text-white', 'ms-auto'); // Admin messages on right
        messageEl.style.textAlign = 'left'; // Text align left within the right-aligned bubble
      } else {
        messageEl.classList.add('bg-white', 'border', 'me-auto'); // User messages on left
      }
      messageEl.innerHTML = `
                <div class="d-flex justify-content-between">
                    <small class="fw-bold">${senderDisplayName}</small>
                    <small class="text-muted opacity-75">${timestamp}</small>
                </div>
                <p class="mb-0 mt-1">${msg.message.replace(/\n/g, '<br>')}</p>
            `;
      conversationThreadEl.appendChild(messageEl);
    });
    conversationThreadEl.scrollTop = conversationThreadEl.scrollHeight; // Scroll to bottom
    document.getElementById('adminReplyText').dataset.activeConversationUserId = userId;
    document.getElementById('adminReplyText').focus();
  }

  function sendAdminReply(userId, messageText) {
    const newMessage = {
      userId: parseInt(userId),
      sender: 'admin',
      message: messageText,
      timestamp: new Date().toISOString()
    };
    APP_DATA.adminMessages.push(newMessage);
    localStorage.setItem('adminMessages', JSON.stringify(APP_DATA.adminMessages));

    document.getElementById('adminReplyText').value = ''; // Clear input
    displayConversation(userId); // Refresh current conversation
    loadConversationsList(); // Refresh list to show new last message & order
  }

  // --- EVENT LISTENERS & UTILS ---
  document.getElementById('v-pills-tabContent').addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('btn-view-details')) {
      const id = target.dataset.id;
      const type = target.dataset.type;
      displayDetails(id, type);
    } else if (target.classList.contains('btn-toggle-status')) {
      const userId = target.dataset.userId;
      const userRole = target.dataset.userRole;
      const newState = target.dataset.newState;
      confirmToggleUserStatus(userId, userRole, newState);
    }
  });

  // Tab change listener to refresh customer service if it becomes active
  const customerServiceTab = document.getElementById('customer-service-tab');
  if (customerServiceTab) {
    customerServiceTab.addEventListener('shown.bs.tab', function () {
      initializeCustomerService(); // Reload/refresh messages when tab is shown
    });
  }


  function displayDetails(id, type) {
    const modalTitle = document.getElementById('detailsModalLabel');
    const modalBody = document.getElementById('detailsModalBody');
    let item;
    modalBody.innerHTML = ''; // Clear previous

    switch (type) {
      case 'customer':
        item = APP_DATA.userData.customers.find(c => c.id == id);
        modalTitle.textContent = 'Customer Details';
        break;
      case 'seller':
        item = APP_DATA.userData.sellers.find(s => s.id == id);
        modalTitle.textContent = 'Seller Details';
        break;
      case 'product':
        item = APP_DATA.productsData.find(p => p.id == id);
        modalTitle.textContent = 'Product Details';
        break;
      case 'order':
        item = APP_DATA.ordersData.find(o => o.id == id);
        modalTitle.textContent = 'Order Details';
        break;
    }

    if (item) {
      // Create a formatted display of the item's properties
      const dl = document.createElement('dl');
      dl.className = 'row';
      for (const key in item) {
        if (Object.hasOwnProperty.call(item, key) && key !== 'password') { // Don't show password
          const dt = document.createElement('dt');
          dt.className = 'col-sm-4 text-capitalize';
          dt.textContent = key.replace(/([A-Z])/g, ' $1'); // Add space before caps

          const dd = document.createElement('dd');
          dd.className = 'col-sm-8';
          if (typeof item[key] === 'object' && item[key] !== null) {
            dd.innerHTML = `<pre>${JSON.stringify(item[key], null, 2)}</pre>`;
          } else {
            dd.textContent = item[key];
          }
          dl.appendChild(dt);
          dl.appendChild(dd);
        }
      }
      modalBody.appendChild(dl);
    } else {
      modalBody.textContent = `${type} with ID ${id} not found.`;
    }
    detailsModal.show();
  }

  function showBootstrapAlert(message, type = 'info', duration = 4000) {
    const alertPlaceholder = document.createElement('div');
    alertPlaceholder.style.position = 'fixed';
    alertPlaceholder.style.top = '20px';
    alertPlaceholder.style.right = '20px';
    alertPlaceholder.style.zIndex = '1055'; // Above modals
    document.body.appendChild(alertPlaceholder);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      '</div>'
    ].join('');
    alertPlaceholder.append(wrapper);

    setTimeout(() => {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(wrapper.firstChild);
      if (bsAlert) {
        bsAlert.close();
      }
      // wrapper.remove(); // Bootstrap handles removal on close
      // If alertPlaceholder only held one alert, it could be removed too after a delay
      // Or manage multiple alerts in placeholder
    }, duration);
    // Clean up placeholder if it's empty after a while
    setTimeout(() => {
      if (!alertPlaceholder.hasChildNodes()) {
        alertPlaceholder.remove();
      }
    }, duration + 500);
  }


  // --- INITIAL PAGE LOAD ---
  initializeData();
  populateDashboard();
  populateCustomerList();
  populateSellerList();
  populateProductList();
  initializeCustomerService(); // Initial call for customer service tab data

  // Handle specific tab activation to refresh data if needed
  const tabs = document.querySelectorAll('#v-pills-tab button[data-bs-toggle="pill"]');
  tabs.forEach(tab => {
    tab.addEventListener('shown.bs.tab', event => {
      const targetTabId = event.target.getAttribute('data-bs-target');
      if (targetTabId === '#customers') populateCustomerList();
      else if (targetTabId === '#sellers') populateSellerList();
      else if (targetTabId === '#products') populateProductList();
      else if (targetTabId === '#customer-service') {
        currentOpenConversationUserId = null; // Reset open conversation
        document.getElementById('conversationView').classList.add('d-none');
        document.getElementById('noConversationSelectedView').classList.remove('d-none');
        loadConversationsList(); // Always reload conversations when tab is shown
      }
      else if (targetTabId === '#home') populateDashboard();
    });
  });
});