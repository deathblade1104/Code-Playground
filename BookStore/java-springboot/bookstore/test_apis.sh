#!/bin/bash

echo "=== Bookstore API Test Suite ==="
echo ""

# Login and get token
echo "1. Logging in..."
TOKEN=$(curl -s -X POST 'http://localhost:8080/api/auth/login' \
  -H 'Content-Type: application/json' \
  --data '{"email":"shahbazhraja@gmail.com","password":"password"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "✅ Login successful"
echo ""

# Test public endpoints
echo "=== Public Endpoints (No Auth Required) ==="
echo ""
echo "2. GET /api/authors:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" 'http://localhost:8080/api/authors')
if [ "$STATUS" = "200" ]; then
  echo "✅ Status: $STATUS"
else
  echo "❌ Status: $STATUS"
fi

echo "3. GET /api/authors/search?name=J:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" 'http://localhost:8080/api/authors/search?name=J')
if [ "$STATUS" = "200" ]; then
  echo "✅ Status: $STATUS"
else
  echo "❌ Status: $STATUS"
fi

echo "4. GET /api/books:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" 'http://localhost:8080/api/books')
if [ "$STATUS" = "200" ]; then
  echo "✅ Status: $STATUS"
else
  echo "❌ Status: $STATUS"
fi

echo "5. GET /api/books/search?query=test:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" 'http://localhost:8080/api/books/search?query=test')
if [ "$STATUS" = "200" ]; then
  echo "✅ Status: $STATUS"
else
  echo "❌ Status: $STATUS"
fi

echo ""
echo "=== Authenticated Endpoints (Auth Required) ==="
echo ""

echo "6. GET /api/cart:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" 'http://localhost:8080/api/cart' -H "Authorization: Bearer $TOKEN")
if [ "$STATUS" = "200" ]; then
  echo "✅ Status: $STATUS"
else
  echo "❌ Status: $STATUS"
fi

echo "7. GET /api/orders:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" 'http://localhost:8080/api/orders' -H "Authorization: Bearer $TOKEN")
if [ "$STATUS" = "200" ]; then
  echo "✅ Status: $STATUS"
else
  echo "❌ Status: $STATUS"
fi

echo ""
echo "=== Admin Endpoints (Admin Auth Required) ==="
echo ""

echo "8. POST /api/authors (create author):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST 'http://localhost:8080/api/authors' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"name":"API Test Author","bio":"Test bio"}')
if [ "$STATUS" = "200" ]; then
  echo "✅ Status: $STATUS"
else
  echo "❌ Status: $STATUS"
fi

echo "9. POST /api/books/covers/upload:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST 'http://localhost:8080/api/books/covers/upload' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"fileName":"test.jpg"}')
if [ "$STATUS" = "200" ]; then
  echo "✅ Status: $STATUS"
else
  echo "❌ Status: $STATUS"
fi

echo ""
echo "=== Test Complete ==="

