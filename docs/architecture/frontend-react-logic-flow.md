# Flora Frontend: React Overview

## What React Is

- React is a JavaScript library for building UIs from small, reusable pieces called components.
- A component is just a function that returns HTML-like markup (JSX). React turns that into real browser DOM.
- When data a component depends on changes (its “state” or “props”), React re-renders only what’s necessary. This keeps apps fast.
- Hooks (like `useState`, `useEffect`) are built-in helpers for storing state and running side effects (like fetching data).

## Key Ideas You’re Using

- Components: Small building blocks for pages (e.g., product cards, headers).
- State: Data that changes over time (e.g., loading flags, products).
- Context: A shared “app-wide” state you can read anywhere (e.g., auth user, cart).
- Routing: Client-side navigation so changing pages doesn’t reload the browser.

## How React Works In Your Frontend

### App Mounting And Providers

- React attaches to the page at `#root` and renders your app: `apps/frontend/src/main.tsx:23`.
- The tree is wrapped with providers so anything inside can access shared features:
  - `Auth0Provider` (Auth0 login)
  - `AuthProvider` (your app’s auth glue)
  - `CartProvider` (cart state)

### App Shell And Routing

- App does a quick backend health check, then sets up client-side routing: `apps/frontend/src/App.tsx:39`, `apps/frontend/src/App.tsx:70`.
- `AppContent` defines all routes (`/`, `/products`, `/products/:id`, `/cart`, `/checkout`, etc.) and conditionally shows header/footer: `apps/frontend/src/App.tsx:112`.

### Authentication

- `AuthProvider` exposes `useAuth()` so any component can check `user`, `login`, `logout`, and read an access token: `apps/frontend/src/contexts/AuthContext.tsx:29`.
- After login, it syncs the user to your backend once per session: `apps/frontend/src/contexts/AuthContext.tsx:52`.

### Cart And Shared State

- `CartProvider` exposes `useCart()` with actions like `addItem`, `updateQuantity`, `clearCart`. It persists to `localStorage` and auto‑recalculates totals: `apps/frontend/src/contexts/CartContext.tsx:201`.

### Pages And Components

- Listing pages fetch products and store them in component state; React re-renders the grid when the data arrives: `apps/frontend/src/pages/ProductsPage.tsx:66`, `apps/frontend/src/components/ProductGrid.tsx:17`.
- Product details let the user pick options and add items to the cart via context: `apps/frontend/src/pages/ProductDetail.tsx:118`.
- The header shows the current cart count and a login button based on auth context: `apps/frontend/src/components/Header.tsx:9`.

### Data Fetching

- Centralized in `apiService` using Axios (base URL from env). Components call these helpers in `useEffect` and update state with results: `apps/frontend/src/services/api.ts:29`.

## In Short

Your UI is a tree of small components. Providers at the top give the tree shared powers (auth, cart). Pages fetch data into state, and when state changes, React efficiently updates the DOM. Navigation is handled fully in the browser via routes—no full reloads.
