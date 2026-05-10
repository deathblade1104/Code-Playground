# Troubleshooting Network Errors

## Network Error: Unable to Connect to Backend

If you see a "Network Error" in the console, it means the frontend cannot reach the backend API server.

## Common Causes & Solutions

### 1. Backend Server Not Running

**Symptoms:**
- Network Error in browser console
- `ERR_NETWORK` error code
- Frontend shows "Unable to Connect to Backend" message

**Solution:**
1. Navigate to the backend directory:
   ```bash
   cd java-springboot/bookstore
   ```

2. Start the Spring Boot backend:
   ```bash
   ./mvnw spring-boot:run
   # or
   mvn spring-boot:run
   ```

3. Verify the backend is running:
   - Check console for "Started BookstoreApplication" message
   - Backend should be running on `http://localhost:8080`
   - Visit `http://localhost:8080/api/books` in browser to test

### 2. Wrong API URL Configuration

**Symptoms:**
- Network Error persists even when backend is running
- Different port being used

**Solution:**
1. Check your `.env.local` file:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

2. If backend is on a different port, update accordingly:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:YOUR_PORT
   ```

3. Restart the Next.js dev server after changing `.env.local`:
   ```bash
   npm run dev
   ```

### 3. CORS Configuration Issues

**Symptoms:**
- Network Error in browser
- CORS error in browser console
- OPTIONS request fails

**Solution:**
1. Verify backend CORS configuration in `SecurityConfig.java`:
   ```java
   configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://localhost:3001"));
   ```

2. Ensure frontend is running on one of the allowed origins (default: `http://localhost:3000`)

3. Restart backend after CORS changes

### 4. Port Conflicts

**Symptoms:**
- Backend fails to start
- "Address already in use" error

**Solution:**
1. Check if port 8080 is already in use:
   ```bash
   lsof -i :8080  # macOS/Linux
   netstat -ano | findstr :8080  # Windows
   ```

2. Either:
   - Stop the process using port 8080, OR
   - Change backend port in `application.properties`:
     ```properties
     server.port=8081
     ```
   - Update frontend `.env.local` to match new port

### 5. Firewall/Security Software Blocking

**Symptoms:**
- Network Error
- Backend running but unreachable

**Solution:**
1. Check firewall settings
2. Ensure localhost connections are allowed
3. Temporarily disable antivirus/firewall to test

## Quick Diagnostic Steps

1. **Check Backend Status:**
   ```bash
   curl http://localhost:8080/api/books
   ```
   Should return JSON response (or error message if no books)

2. **Check Frontend API URL:**
   - Open browser console
   - Look for "API Base URL: http://localhost:8080" log
   - Verify it matches your backend URL

3. **Check Network Tab:**
   - Open browser DevTools → Network tab
   - Look for failed requests to `/api/books`
   - Check status code and error message

4. **Verify CORS:**
   - Check Network tab for OPTIONS request
   - Should return 200 OK with CORS headers

## Expected Behavior

### When Backend is Running:
- ✅ API requests succeed
- ✅ Books load on homepage
- ✅ No console errors

### When Backend is Not Running:
- ❌ Network Error in console
- ❌ "Unable to Connect to Backend" message displayed
- ❌ No books shown

## Environment Variables

Make sure `.env.local` exists and contains:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

If using a different backend URL, update accordingly.

## Additional Resources

- Check backend logs for detailed error messages
- Verify database connection (PostgreSQL)
- Ensure all required services are running (Redis, Kafka, etc.)
- Check backend `application.properties` for correct configuration

