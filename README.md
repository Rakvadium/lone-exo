# Lone Exo Apparel

A full-stack fashion e-commerce platform with real-time updates, built with Next.js (web), React Native Expo (mobile), and Convex as the backend.

## Tech Stack

- **Web**: Next.js 15 with App Router
- **Mobile**: React Native with Expo Router
- **Backend**: Convex (real-time database)
- **Authentication**: Convex Auth (Email/Password, Google, Apple OAuth)
- **Payments**: Stripe via @convex-dev/stripe
- **Styling**: Tailwind CSS + ShadCN UI (web), Custom design system (mobile)
- **Hosting**: Vercel (recommended)

## Project Structure

```
lone-exo-apparel/
├── convex/                 # Shared Convex backend
│   ├── schema.ts           # Database schema with indexes
│   ├── auth.ts             # Convex Auth configuration
│   ├── lib/
│   │   └── authorization.ts # Auth helpers
│   ├── products.ts         # Product queries/mutations
│   ├── cart.ts             # Shopping cart (ownership-protected)
│   ├── orders.ts           # Order management (ownership-protected)
│   ├── reviews.ts          # Product reviews
│   ├── wishlist.ts         # User wishlists
│   ├── users.ts            # User profiles
│   └── admin.ts            # Admin functions
├── web/                    # Next.js web app
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities
│   └── ...
├── mobile/                 # Expo React Native app
│   ├── app/                # Expo Router screens
│   ├── src/
│   │   ├── components/     # RN components
│   │   └── lib/            # Utilities
│   └── ...
└── package.json            # Workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Convex account (https://convex.dev)
- Stripe account (for payments)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up Convex:

```bash
npx convex dev
```

This will prompt you to log in and create a new Convex project.

3. Configure environment variables:

**Root `.env.local`:**
```
CONVEX_DEPLOYMENT=<your-convex-deployment>
```

**`web/.env.local`:**
```
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
NEXT_PUBLIC_URL=http://localhost:3000
```

**`mobile/.env.local`:**
```
EXPO_PUBLIC_CONVEX_URL=<your-convex-url>
```

4. Set up Convex environment variables (in Convex dashboard):
```
AUTH_GOOGLE_ID=<google-client-id>
AUTH_GOOGLE_SECRET=<google-client-secret>
AUTH_APPLE_ID=<apple-client-id>
AUTH_APPLE_SECRET=<apple-client-secret>
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
```

5. Seed the database:

```bash
npx convex run seed:seedDatabase
```

### Running the Apps

**Start Convex (keep running):**
```bash
npm run dev:convex
```

**Start web app:**
```bash
npm run dev:web
```

**Start mobile app:**
```bash
npm run dev:mobile
```

## Features

### Customer Features

- **Authentication**: Email/password, Google, and Apple sign-in
- **Product Browsing**: Browse by category, search, and filter
- **Product Details**: Images, descriptions, reviews, and real-time stock
- **Shopping Cart**: Add, update, and remove items
- **Checkout**: Secure payment via Stripe
- **User Profile**: Order history, wishlist, and account settings
- **Real-time Updates**: Stock changes and flash sales update instantly

### Admin Features

- **Dashboard**: Sales stats, recent orders, low stock alerts
- **Product Management**: Create, update, and manage products
- **Order Management**: View and update order status
- **Inventory Management**: Update stock levels
- **Flash Sales**: Create time-limited sales

## Database Schema

The platform uses Convex with the following tables:

- `users` - Extended user profiles with addresses
- `products` - Product catalog with variants
- `categories` - Product categories with hierarchy
- `cart` - User shopping carts (ownership-protected)
- `orders` - Order history and status
- `reviews` - Product reviews and ratings
- `wishlist` - User wishlists
- `inventory` - Real-time stock tracking
- `flashSales` - Time-limited sale events
- `heroSlides` - Landing page hero carousel
- `newsletter` - Email subscriptions

## Authorization

All user-specific data is protected with ownership checks:

- Users can only view/modify their own cart, orders, reviews, and wishlist
- Admin actions (product/order management) require admin role
- All mutations verify authentication and ownership before modifications

## Design System

**Brand Colors:**
- Primary: #1a1a1a (Deep Charcoal)
- Secondary: #f5f0eb (Warm Ivory)
- Accent: #b76e79 (Rose Gold)

**Typography:**
- Headings: Cormorant Garamond
- Body: DM Sans

## Deployment

### Web (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy

### Mobile (Expo)

```bash
cd mobile
eas build --platform all
```

## License

MIT
