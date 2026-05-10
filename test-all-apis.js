#!/usr/bin/env node

/**
 * Comprehensive API Test Script
 * Tests all endpoints with provided credentials
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'http://localhost:8080';
const EMAIL = 'shahbazhraja@gmail.com';
const PASSWORD = 'password';

let token = '';
let userId = null;
let testResults = {
  working: [],
  notWorking: [],
  skipped: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
  const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  const statusText = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⊘';
  log(`  ${statusText} ${name}: ${status}`, statusColor);
  if (details) {
    log(`    ${details}`, 'cyan');
  }

  if (status === 'PASS') {
    testResults.working.push(name);
  } else if (status === 'FAIL') {
    testResults.notWorking.push(name);
  } else {
    testResults.skipped.push(name);
  }
}

async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 'NETWORK_ERROR',
      message: error.message
    };
  }
}

async function testAuth() {
  log('\n=== AUTHENTICATION APIs ===', 'blue');

  // 1. Login
  log('\n1. Testing Login...', 'cyan');
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: EMAIL,
    password: PASSWORD
  });

  if (loginResult.success && loginResult.data.token) {
    token = loginResult.data.token;
    userId = loginResult.data.userId;
    logTest('POST /api/auth/login', 'PASS', `Token received, User ID: ${userId}`);
  } else {
    logTest('POST /api/auth/login', 'FAIL', loginResult.error?.message || loginResult.message);
    log('\n⚠ Cannot proceed without authentication token. Please check login credentials.', 'yellow');
    return false;
  }

  // 2. Signup (test with new user)
  log('\n2. Testing Signup...', 'cyan');
  const signupResult = await makeRequest('POST', '/api/auth/signup', {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'testpass123'
  });

  if (signupResult.success) {
    logTest('POST /api/auth/signup', 'PASS');
  } else {
    logTest('POST /api/auth/signup', 'FAIL', signupResult.error?.message || signupResult.message);
  }

  // 3. Logout
  log('\n3. Testing Logout...', 'cyan');
  const logoutResult = await makeRequest('POST', '/api/auth/logout', null, {
    Authorization: `Bearer ${token}`
  });

  if (logoutResult.success || logoutResult.status === 200) {
    logTest('POST /api/auth/logout', 'PASS');
  } else {
    logTest('POST /api/auth/logout', 'FAIL', logoutResult.error?.message || logoutResult.message);
  }

  // Re-login for subsequent tests
  const reloginResult = await makeRequest('POST', '/api/auth/login', {
    email: EMAIL,
    password: PASSWORD
  });
  if (reloginResult.success) {
    token = reloginResult.data.token;
    userId = reloginResult.data.userId;
  }

  return true;
}

async function testBooks() {
  log('\n=== BOOK APIs ===', 'blue');
  let bookId = null;

  // 1. Get all books
  log('\n1. Testing Get All Books...', 'cyan');
  const getBooksResult = await makeRequest('GET', '/api/books?page=0&size=20');
  if (getBooksResult.success) {
    logTest('GET /api/books', 'PASS', `Found ${getBooksResult.data.content?.length || 0} books`);
    if (getBooksResult.data.content?.length > 0) {
      bookId = getBooksResult.data.content[0].id;
    }
  } else {
    logTest('GET /api/books', 'FAIL', getBooksResult.error?.message || getBooksResult.message);
  }

  // 2. Search books
  log('\n2. Testing Search Books...', 'cyan');
  const searchResult = await makeRequest('GET', '/api/books/search?query=test');
  if (searchResult.success) {
    logTest('GET /api/books/search', 'PASS', `Found ${searchResult.data?.length || 0} results`);
  } else {
    logTest('GET /api/books/search', 'FAIL', searchResult.error?.message || searchResult.message);
  }

  // 3. Create book (Admin only)
  log('\n3. Testing Create Book...', 'cyan');
  const createBookResult = await makeRequest('POST', '/api/books', {
    title: 'Test Book',
    description: 'Test Description',
    price: 29.99,
    stock: 10,
    authorId: 1,
    genre: 'FICTION',
    isbn: `978${Date.now().toString().slice(-10)}`,
    s3Path: 'covers/test.jpg'
  }, {
    Authorization: `Bearer ${token}`
  });

  if (createBookResult.success) {
    logTest('POST /api/books', 'PASS', `Book ID: ${createBookResult.data.id}`);
    bookId = createBookResult.data.id;
  } else {
    logTest('POST /api/books', 'FAIL', createBookResult.error?.message || createBookResult.message);
  }

  // 4. Update stock (Admin only, requires bookId)
  if (bookId) {
    log('\n4. Testing Update Stock...', 'cyan');
    const updateStockResult = await makeRequest('PATCH', `/api/books/${bookId}/stock?delta=5`, null, {
      Authorization: `Bearer ${token}`
    });

    if (updateStockResult.success) {
      logTest('PATCH /api/books/{id}/stock', 'PASS');
    } else {
      logTest('PATCH /api/books/{id}/stock', 'FAIL', updateStockResult.error?.message || updateStockResult.message);
    }
  } else {
    logTest('PATCH /api/books/{id}/stock', 'SKIP', 'No book ID available');
  }

  // 5. Get presigned URL (Admin only)
  log('\n5. Testing Get Presigned URL...', 'cyan');
  const presignedResult = await makeRequest('POST', '/api/books/covers/upload', {
    fileName: 'test-book.jpg'
  }, {
    Authorization: `Bearer ${token}`
  });

  if (presignedResult.success) {
    logTest('POST /api/books/covers/upload', 'PASS');
  } else {
    logTest('POST /api/books/covers/upload', 'FAIL', presignedResult.error?.message || presignedResult.message);
  }

  // 6. Check ISBN (Admin only)
  log('\n6. Testing Check ISBN...', 'cyan');
  const isbnResult = await makeRequest('GET', '/api/books/isbn/check?isbn=1234567890', null, {
    Authorization: `Bearer ${token}`
  });

  if (isbnResult.success) {
    logTest('GET /api/books/isbn/check', 'PASS');
  } else {
    logTest('GET /api/books/isbn/check', 'FAIL', isbnResult.error?.message || isbnResult.message);
  }

  return bookId;
}

async function testAuthors() {
  log('\n=== AUTHOR APIs ===', 'blue');
  let authorId = null;

  // 1. Get all authors
  log('\n1. Testing Get All Authors...', 'cyan');
  const getAuthorsResult = await makeRequest('GET', '/api/authors');
  if (getAuthorsResult.success) {
    logTest('GET /api/authors', 'PASS', `Found ${getAuthorsResult.data?.length || 0} authors`);
    if (getAuthorsResult.data?.length > 0) {
      authorId = getAuthorsResult.data[0].id;
    }
  } else {
    logTest('GET /api/authors', 'FAIL', getAuthorsResult.error?.message || getAuthorsResult.message);
  }

  // 2. Search authors
  log('\n2. Testing Search Authors...', 'cyan');
  const searchResult = await makeRequest('GET', '/api/authors/search?name=test');
  if (searchResult.success) {
    logTest('GET /api/authors/search', 'PASS', `Found ${searchResult.data?.length || 0} results`);
  } else {
    logTest('GET /api/authors/search', 'FAIL', searchResult.error?.message || searchResult.message);
  }

  // 3. Create author (Admin only)
  log('\n3. Testing Create Author...', 'cyan');
  const createResult = await makeRequest('POST', '/api/authors', {
    name: `Test Author ${Date.now()}`,
    bio: 'Test biography'
  }, {
    Authorization: `Bearer ${token}`
  });

  if (createResult.success) {
    logTest('POST /api/authors', 'PASS', `Author ID: ${createResult.data.id}`);
    authorId = createResult.data.id;
  } else {
    logTest('POST /api/authors', 'FAIL', createResult.error?.message || createResult.message);
  }

  // 4. Get author by ID
  if (authorId) {
    log('\n4. Testing Get Author by ID...', 'cyan');
    const getByIdResult = await makeRequest('GET', `/api/authors/${authorId}`);
    if (getByIdResult.success) {
      logTest('GET /api/authors/{id}', 'PASS');
    } else {
      logTest('GET /api/authors/{id}', 'FAIL', getByIdResult.error?.message || getByIdResult.message);
    }
  } else {
    logTest('GET /api/authors/{id}', 'SKIP', 'No author ID available');
  }
}

async function testCart() {
  log('\n=== CART APIs ===', 'blue');

  // 1. Get cart
  log('\n1. Testing Get Cart...', 'cyan');
  const getCartResult = await makeRequest('GET', '/api/cart', null, {
    Authorization: `Bearer ${token}`
  });

  if (getCartResult.success) {
    logTest('GET /api/cart', 'PASS', `Cart ID: ${getCartResult.data.cartId}`);
  } else {
    logTest('GET /api/cart', 'FAIL', getCartResult.error?.message || getCartResult.message);
  }

  // 2. Edit cart (add item)
  log('\n2. Testing Edit Cart...', 'cyan');
  const editCartResult = await makeRequest('POST', '/api/cart/edit', {
    items: [{ bookId: 1, quantity: 1 }]
  }, {
    Authorization: `Bearer ${token}`
  });

  if (editCartResult.success) {
    logTest('POST /api/cart/edit', 'PASS');
  } else {
    logTest('POST /api/cart/edit', 'FAIL', editCartResult.error?.message || editCartResult.message);
  }

  // 3. Remove from cart (requires itemId)
  log('\n3. Testing Remove from Cart...', 'cyan');
  const cartResult = await makeRequest('GET', '/api/cart', null, {
    Authorization: `Bearer ${token}`
  });

  if (cartResult.success && cartResult.data.items?.length > 0) {
    const itemId = cartResult.data.items[0].itemId;
    const removeResult = await makeRequest('DELETE', `/api/cart/items/${itemId}`, null, {
      Authorization: `Bearer ${token}`
    });

    if (removeResult.success) {
      logTest('DELETE /api/cart/items/{id}', 'PASS');
    } else {
      logTest('DELETE /api/cart/items/{id}', 'FAIL', removeResult.error?.message || removeResult.message);
    }
  } else {
    logTest('DELETE /api/cart/items/{id}', 'SKIP', 'No items in cart');
  }

  // 4. Clear cart
  log('\n4. Testing Clear Cart...', 'cyan');
  const clearResult = await makeRequest('DELETE', '/api/cart', null, {
    Authorization: `Bearer ${token}`
  });

  if (clearResult.success || clearResult.status === 204) {
    logTest('DELETE /api/cart', 'PASS');
  } else {
    logTest('DELETE /api/cart', 'FAIL', clearResult.error?.message || clearResult.message);
  }
}

async function testOrders() {
  log('\n=== ORDER APIs ===', 'blue');

  // 1. Get orders
  log('\n1. Testing Get Orders...', 'cyan');
  const getOrdersResult = await makeRequest('GET', '/api/orders', null, {
    Authorization: `Bearer ${token}`
  });

  if (getOrdersResult.success) {
    logTest('GET /api/orders', 'PASS', `Found ${getOrdersResult.data?.length || 0} orders`);
  } else {
    logTest('GET /api/orders', 'FAIL', getOrdersResult.error?.message || getOrdersResult.message);
  }

  // 2. Checkout (requires items in cart)
  log('\n2. Testing Checkout...', 'cyan');
  // First add item to cart
  await makeRequest('POST', '/api/cart/edit', {
    items: [{ bookId: 1, quantity: 1 }]
  }, {
    Authorization: `Bearer ${token}`
  });

  const checkoutResult = await makeRequest('POST', '/api/checkout', null, {
    Authorization: `Bearer ${token}`
  });

  if (checkoutResult.success) {
    logTest('POST /api/checkout', 'PASS', `Order Number: ${checkoutResult.data.orderNumber}`);

    // 3. Get order by order number
    log('\n3. Testing Get Order by Order Number...', 'cyan');
    const orderNumber = checkoutResult.data.orderNumber;
    const getOrderResult = await makeRequest('GET', `/api/orders/${orderNumber}`, null, {
      Authorization: `Bearer ${token}`
    });

    if (getOrderResult.success) {
      logTest('GET /api/orders/{orderNumber}', 'PASS');
    } else {
      logTest('GET /api/orders/{orderNumber}', 'FAIL', getOrderResult.error?.message || getOrderResult.message);
    }
  } else {
    logTest('POST /api/checkout', 'FAIL', checkoutResult.error?.message || checkoutResult.message);
    logTest('GET /api/orders/{orderNumber}', 'SKIP', 'No order created');
  }
}

async function testAdmin() {
  log('\n=== ADMIN APIs ===', 'blue');

  // 1. Get admin dashboard
  log('\n1. Testing Get Admin Dashboard...', 'cyan');
  const dashboardResult = await makeRequest('GET', '/api/admin/dashboard', null, {
    Authorization: `Bearer ${token}`
  });

  if (dashboardResult.success) {
    logTest('GET /api/admin/dashboard', 'PASS');
  } else {
    logTest('GET /api/admin/dashboard', 'FAIL', dashboardResult.error?.message || dashboardResult.message);
  }

  // 2. Get low stock books
  log('\n2. Testing Get Low Stock Books...', 'cyan');
  const lowStockResult = await makeRequest('GET', '/api/admin/dashboard/low-stock?threshold=10&limit=20', null, {
    Authorization: `Bearer ${token}`
  });

  if (lowStockResult.success) {
    logTest('GET /api/admin/dashboard/low-stock', 'PASS', `Found ${lowStockResult.data?.length || 0} books`);
  } else {
    logTest('GET /api/admin/dashboard/low-stock', 'FAIL', lowStockResult.error?.message || lowStockResult.message);
  }
}

async function printSummary() {
  log('\n' + '='.repeat(60), 'blue');
  log('TEST SUMMARY', 'blue');
  log('='.repeat(60), 'blue');

  log(`\n${colors.green}✓ WORKING APIs (${testResults.working.length}):${colors.reset}`);
  testResults.working.forEach(api => log(`  • ${api}`, 'green'));

  log(`\n${colors.red}✗ NOT WORKING APIs (${testResults.notWorking.length}):${colors.reset}`);
  testResults.notWorking.forEach(api => log(`  • ${api}`, 'red'));

  if (testResults.skipped.length > 0) {
    log(`\n${colors.yellow}⊘ SKIPPED APIs (${testResults.skipped.length}):${colors.reset}`);
    testResults.skipped.forEach(api => log(`  • ${api}`, 'yellow'));
  }

  const total = testResults.working.length + testResults.notWorking.length + testResults.skipped.length;
  const successRate = total > 0 ? ((testResults.working.length / total) * 100).toFixed(1) : 0;

  log(`\n${colors.cyan}Success Rate: ${successRate}% (${testResults.working.length}/${total})${colors.reset}\n`);
}

async function main() {
  log('\n' + '='.repeat(60), 'blue');
  log('API TESTING SUITE', 'blue');
  log('='.repeat(60), 'blue');
  log(`\nAPI Base URL: ${API_BASE_URL}`, 'cyan');
  log(`Email: ${EMAIL}`, 'cyan');
  log(`Password: ${'*'.repeat(PASSWORD.length)}`, 'cyan');

  // Test authentication first
  const authSuccess = await testAuth();
  if (!authSuccess) {
    log('\n❌ Authentication failed. Cannot proceed with other tests.', 'red');
    return;
  }

  // Test all other APIs
  await testBooks();
  await testAuthors();
  await testCart();
  await testOrders();
  await testAdmin();

  // Print summary
  await printSummary();
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

