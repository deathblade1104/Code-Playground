# BookStore Frontend

A modern Next.js frontend for the BookStore application.

## Features

- 🔐 Authentication (Login/Signup)
- 📚 Book browsing and search
- 🛒 Shopping cart
- 📦 Order management
- 👨‍💼 Admin dashboard
- 🎨 Modern UI with TailwindCSS

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file (or copy `.env.example`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
bookstore-frontend/
├── app/                  # Next.js app directory
│   ├── admin/           # Admin dashboard pages
│   ├── books/           # Book listing and detail pages
│   ├── cart/            # Shopping cart page
│   ├── login/           # Login page
│   ├── orders/          # Order pages
│   └── signup/          # Signup page
├── components/          # React components
├── contexts/            # React contexts (Auth)
├── lib/                 # API client and utilities
└── types/               # TypeScript types
```

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- TailwindCSS
- Axios (API client)

## API Integration

The frontend communicates with the Spring Boot backend API. Make sure the backend is running on `http://localhost:8080` (or update `.env.local` with your backend URL).

### Backend Requirements

Before running the frontend, ensure:
1. ✅ Spring Boot backend is running on port 8080
2. ✅ Backend CORS is configured to allow `http://localhost:3000`
3. ✅ Database and required services (Redis, Kafka, etc.) are running

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for help with network errors.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
