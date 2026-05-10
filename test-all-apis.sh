#!/bin/bash

# Comprehensive API Test Script
# Tests all endpoints with provided credentials

API_BASE_URL="${API_URL:-http://localhost:8080}"
EMAIL="shahbazhraja@gmail.com"
PASSWORD="password"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

WORKING=()
NOT_WORKING=()
SKIPPED=()

log() {
    echo -e "${1}"
}

log_test() {
    local name=$1
    local status=$2
    local details=$3

    if [ "$status" = "PASS" ]; then
        log "${GREEN}✓${NC} ${name}: ${GREEN}${status}${NC}"
        WORKING+=("$name")
    elif [ "$status" = "FAIL" ]; then
        log "${RED}✗${NC} ${name}: ${RED}${status}${NC}"
        NOT_WORKING+=("$name")
        if [ -n "$details" ]; then
            log "  ${CYAN}${details}${NC}"
        fi
    else
        log "${YELLOW}⊘${NC} ${name}: ${YELLOW}${status}${NC}"
        SKIPPED+=("$name")
    fi
}

make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4

    if [ -z "$headers" ]; then
        headers="Content-Type: application/json"
    fi

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET \
            -H "$headers" \
            "${API_BASE_URL}${endpoint}" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "$headers" \
            -d "$data" \
            "${API_BASE_URL}${endpoint}" 2>&1)
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    echo "$body|$http_code"
}

test_auth() {
    log "\n${BLUE}=== AUTHENTICATION APIs ===${NC}\n"

    # Login
    log "${CYAN}1. Testing Login...${NC}"
    result=$(make_request "POST" "/api/auth/login" "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    body=$(echo "$result" | cut -d'|' -f1)
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        TOKEN=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        USER_ID=$(echo "$body" | grep -o '"userId":[0-9]*' | cut -d':' -f2)
        log_test "POST /api/auth/login" "PASS" "Token received, User ID: $USER_ID"
    else
        log_test "POST /api/auth/login" "FAIL" "HTTP $code: $body"
        return 1
    fi

    # Signup
    log "\n${CYAN}2. Testing Signup...${NC}"
    test_email="test$(date +%s)@example.com"
    result=$(make_request "POST" "/api/auth/signup" "{\"name\":\"Test User\",\"email\":\"$test_email\",\"password\":\"testpass123\"}")
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        log_test "POST /api/auth/signup" "PASS"
    else
        log_test "POST /api/auth/signup" "FAIL" "HTTP $code"
    fi

    # Logout
    log "\n${CYAN}3. Testing Logout...${NC}"
    result=$(make_request "POST" "/api/auth/logout" "" "Authorization: Bearer $TOKEN")
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        log_test "POST /api/auth/logout" "PASS"
    else
        log_test "POST /api/auth/logout" "FAIL" "HTTP $code"
    fi

    # Re-login for subsequent tests
    result=$(make_request "POST" "/api/auth/login" "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    TOKEN=$(echo "$result" | cut -d'|' -f1 | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

    return 0
}

test_books() {
    log "\n${BLUE}=== BOOK APIs ===${NC}\n"

    # Get all books
    log "${CYAN}1. Testing Get All Books...${NC}"
    result=$(make_request "GET" "/api/books?page=0&size=20")
    body=$(echo "$result" | cut -d'|' -f1)
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        count=$(echo "$body" | grep -o '"content":\[.*\]' | grep -o '","id"' | wc -l | tr -d ' ')
        log_test "GET /api/books" "PASS" "Found books"
    else
        log_test "GET /api/books" "FAIL" "HTTP $code"
    fi

    # Search books
    log "\n${CYAN}2. Testing Search Books...${NC}"
    result=$(make_request "GET" "/api/books/search?query=test")
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        log_test "GET /api/books/search" "PASS"
    else
        log_test "GET /api/books/search" "FAIL" "HTTP $code"
    fi

    # Create book
    log "\n${CYAN}3. Testing Create Book...${NC}"
    isbn="978$(date +%s | tail -c 10)"
    result=$(make_request "POST" "/api/books" "{\"title\":\"Test Book\",\"description\":\"Test\",\"price\":29.99,\"stock\":10,\"authorId\":1,\"genre\":\"FICTION\",\"isbn\":\"$isbn\",\"s3Path\":\"covers/test.jpg\"}" "Authorization: Bearer $TOKEN")
    body=$(echo "$result" | cut -d'|' -f1)
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        BOOK_ID=$(echo "$body" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        log_test "POST /api/books" "PASS" "Book ID: $BOOK_ID"
    else
        log_test "POST /api/books" "FAIL" "HTTP $code: $body"
    fi

    # Update stock
    if [ -n "$BOOK_ID" ]; then
        log "\n${CYAN}4. Testing Update Stock...${NC}"
        result=$(make_request "PATCH" "/api/books/$BOOK_ID/stock?delta=5" "" "Authorization: Bearer $TOKEN")
        code=$(echo "$result" | cut -d'|' -f2)

        if [ "$code" = "200" ]; then
            log_test "PATCH /api/books/{id}/stock" "PASS"
        else
            log_test "PATCH /api/books/{id}/stock" "FAIL" "HTTP $code"
        fi
    else
        log_test "PATCH /api/books/{id}/stock" "SKIP" "No book ID"
    fi

    # Get presigned URL
    log "\n${CYAN}5. Testing Get Presigned URL...${NC}"
    result=$(make_request "POST" "/api/books/covers/upload" "{\"fileName\":\"test.jpg\"}" "Authorization: Bearer $TOKEN")
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        log_test "POST /api/books/covers/upload" "PASS"
    else
        log_test "POST /api/books/covers/upload" "FAIL" "HTTP $code"
    fi

    # Check ISBN
    log "\n${CYAN}6. Testing Check ISBN...${NC}"
    result=$(make_request "GET" "/api/books/isbn/check?isbn=1234567890" "" "Authorization: Bearer $TOKEN")
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        log_test "GET /api/books/isbn/check" "PASS"
    else
        log_test "GET /api/books/isbn/check" "FAIL" "HTTP $code"
    fi
}

test_authors() {
    log "\n${BLUE}=== AUTHOR APIs ===${NC}\n"

    # Get all authors
    log "${CYAN}1. Testing Get All Authors...${NC}"
    result=$(make_request "GET" "/api/authors")
    body=$(echo "$result" | cut -d'|' -f1)
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        AUTHOR_ID=$(echo "$body" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        log_test "GET /api/authors" "PASS"
    else
        log_test "GET /api/authors" "FAIL" "HTTP $code"
    fi

    # Search authors
    log "\n${CYAN}2. Testing Search Authors...${NC}"
    result=$(make_request "GET" "/api/authors/search?name=test")
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        log_test "GET /api/authors/search" "PASS"
    else
        log_test "GET /api/authors/search" "FAIL" "HTTP $code"
    fi

    # Create author
    log "\n${CYAN}3. Testing Create Author...${NC}"
    result=$(make_request "POST" "/api/authors" "{\"name\":\"Test Author $(date +%s)\",\"bio\":\"Test bio\"}" "Authorization: Bearer $TOKEN")
    body=$(echo "$result" | cut -d'|' -f1)
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        NEW_AUTHOR_ID=$(echo "$body" | grep -o '"id":[0-9]*' | cut -d':' -f2)
        log_test "POST /api/authors" "PASS" "Author ID: $NEW_AUTHOR_ID"
    else
        log_test "POST /api/authors" "FAIL" "HTTP $code: $body"
    fi

    # Get author by ID
    if [ -n "$AUTHOR_ID" ]; then
        log "\n${CYAN}4. Testing Get Author by ID...${NC}"
        result=$(make_request "GET" "/api/authors/$AUTHOR_ID")
        code=$(echo "$result" | cut -d'|' -f2)

        if [ "$code" = "200" ]; then
            log_test "GET /api/authors/{id}" "PASS"
        else
            log_test "GET /api/authors/{id}" "FAIL" "HTTP $code"
        fi
    else
        log_test "GET /api/authors/{id}" "SKIP" "No author ID"
    fi
}

test_cart() {
    log "\n${BLUE}=== CART APIs ===${NC}\n"

    # Get cart
    log "${CYAN}1. Testing Get Cart...${NC}"
    result=$(make_request "GET" "/api/cart" "" "Authorization: Bearer $TOKEN")
    body=$(echo "$result" | cut -d'|' -f1)
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        CART_ID=$(echo "$body" | grep -o '"cartId":[0-9]*' | cut -d':' -f2)
        log_test "GET /api/cart" "PASS" "Cart ID: $CART_ID"
    else
        log_test "GET /api/cart" "FAIL" "HTTP $code"
    fi

    # Edit cart
    log "\n${CYAN}2. Testing Edit Cart...${NC}"
    result=$(make_request "POST" "/api/cart/edit" "{\"items\":[{\"bookId\":1,\"quantity\":1}]}" "Authorization: Bearer $TOKEN")
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        log_test "POST /api/cart/edit" "PASS"
    else
        log_test "POST /api/cart/edit" "FAIL" "HTTP $code"
    fi

    # Remove from cart
    log "\n${CYAN}3. Testing Remove from Cart...${NC}"
    result=$(make_request "GET" "/api/cart" "" "Authorization: Bearer $TOKEN")
    body=$(echo "$result" | cut -d'|' -f1)
    ITEM_ID=$(echo "$body" | grep -o '"itemId":[0-9]*' | head -1 | cut -d':' -f2)

    if [ -n "$ITEM_ID" ]; then
        result=$(make_request "DELETE" "/api/cart/items/$ITEM_ID" "" "Authorization: Bearer $TOKEN")
        code=$(echo "$result" | cut -d'|' -f2)

        if [ "$code" = "200" ]; then
            log_test "DELETE /api/cart/items/{id}" "PASS"
        else
            log_test "DELETE /api/cart/items/{id}" "FAIL" "HTTP $code"
        fi
    else
        log_test "DELETE /api/cart/items/{id}" "SKIP" "No items in cart"
    fi

    # Clear cart
    log "\n${CYAN}4. Testing Clear Cart...${NC}"
    result=$(make_request "DELETE" "/api/cart" "" "Authorization: Bearer $TOKEN")
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ] || [ "$code" = "204" ]; then
        log_test "DELETE /api/cart" "PASS"
    else
        log_test "DELETE /api/cart" "FAIL" "HTTP $code"
    fi
}

test_orders() {
    log "\n${BLUE}=== ORDER APIs ===${NC}\n"

    # Get orders
    log "${CYAN}1. Testing Get Orders...${NC}"
    result=$(make_request "GET" "/api/orders" "" "Authorization: Bearer $TOKEN")
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        log_test "GET /api/orders" "PASS"
    else
        log_test "GET /api/orders" "FAIL" "HTTP $code"
    fi

    # Checkout
    log "\n${CYAN}2. Testing Checkout...${NC}"
    # Add item to cart first
    make_request "POST" "/api/cart/edit" "{\"items\":[{\"bookId\":1,\"quantity\":1}]}" "Authorization: Bearer $TOKEN" > /dev/null 2>&1

    result=$(make_request "POST" "/api/checkout" "" "Authorization: Bearer $TOKEN")
    body=$(echo "$result" | cut -d'|' -f1)
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        ORDER_NUMBER=$(echo "$body" | grep -o '"orderNumber":"[^"]*"' | cut -d'"' -f4)
        log_test "POST /api/checkout" "PASS" "Order: $ORDER_NUMBER"

        # Get order by number
        log "\n${CYAN}3. Testing Get Order by Order Number...${NC}"
        result=$(make_request "GET" "/api/orders/$ORDER_NUMBER" "" "Authorization: Bearer $TOKEN")
        code=$(echo "$result" | cut -d'|' -f2)

        if [ "$code" = "200" ]; then
            log_test "GET /api/orders/{orderNumber}" "PASS"
        else
            log_test "GET /api/orders/{orderNumber}" "FAIL" "HTTP $code"
        fi
    else
        log_test "POST /api/checkout" "FAIL" "HTTP $code: $body"
        log_test "GET /api/orders/{orderNumber}" "SKIP" "No order created"
    fi
}

test_admin() {
    log "\n${BLUE}=== ADMIN APIs ===${NC}\n"

    # Get admin dashboard
    log "${CYAN}1. Testing Get Admin Dashboard...${NC}"
    result=$(make_request "GET" "/api/admin/dashboard" "" "Authorization: Bearer $TOKEN")
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        log_test "GET /api/admin/dashboard" "PASS"
    else
        log_test "GET /api/admin/dashboard" "FAIL" "HTTP $code"
    fi

    # Get low stock books
    log "\n${CYAN}2. Testing Get Low Stock Books...${NC}"
    result=$(make_request "GET" "/api/admin/dashboard/low-stock?threshold=10&limit=20" "" "Authorization: Bearer $TOKEN")
    code=$(echo "$result" | cut -d'|' -f2)

    if [ "$code" = "200" ]; then
        log_test "GET /api/admin/dashboard/low-stock" "PASS"
    else
        log_test "GET /api/admin/dashboard/low-stock" "FAIL" "HTTP $code"
    fi
}

print_summary() {
    log "\n${BLUE}============================================================${NC}"
    log "${BLUE}TEST SUMMARY${NC}"
    log "${BLUE}============================================================${NC}\n"

    log "${GREEN}✓ WORKING APIs (${#WORKING[@]}):${NC}"
    for api in "${WORKING[@]}"; do
        log "  • $api"
    done

    log "\n${RED}✗ NOT WORKING APIs (${#NOT_WORKING[@]}):${NC}"
    for api in "${NOT_WORKING[@]}"; do
        log "  • $api"
    done

    if [ ${#SKIPPED[@]} -gt 0 ]; then
        log "\n${YELLOW}⊘ SKIPPED APIs (${#SKIPPED[@]}):${NC}"
        for api in "${SKIPPED[@]}"; do
            log "  • $api"
        done
    fi

    total=$((${#WORKING[@]} + ${#NOT_WORKING[@]} + ${#SKIPPED[@]}))
    if [ $total -gt 0 ]; then
        success_rate=$(echo "scale=1; ${#WORKING[@]} * 100 / $total" | bc)
        log "\n${CYAN}Success Rate: ${success_rate}% (${#WORKING[@]}/$total)${NC}\n"
    fi
}

# Main execution
log "\n${BLUE}============================================================${NC}"
log "${BLUE}API TESTING SUITE${NC}"
log "${BLUE}============================================================${NC}"
log "\n${CYAN}API Base URL: $API_BASE_URL${NC}"
log "${CYAN}Email: $EMAIL${NC}"
log "${CYAN}Password: ${PASSWORD//?/*}${NC}\n"

if test_auth; then
    test_books
    test_authors
    test_cart
    test_orders
    test_admin
fi

print_summary

