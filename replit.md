# New Era Herbals E-commerce Platform

## Overview

New Era Herbals is a comprehensive e-commerce platform built for selling premium organic herbal products and natural wellness solutions. The application is built with React, TypeScript, and Vite, using Supabase as the backend database and authentication provider. The platform features a full-featured admin dashboard, product catalog management, cart/checkout functionality, blog system, and integrated analytics through Google Tag Manager.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (November 22, 2025)

### Analytics Simplification & Mobile Optimization
- **Migrated to GTM**: Replaced complex multi-platform pixel management with centralized Google Tag Manager (VITE_GTM_ID required)
- **Mobile-Friendly Improvements**: Enhanced all components for responsive design with touch-friendly interfaces
  - Header: Responsive heights (h-16 sm:h-20), touch targets min 44x44px
  - Hero Slider: Responsive text scaling with line clamping for mobile
  - Product Sections: Responsive padding (py-12 sm:py-16 md:py-20), text sizes scale by breakpoint
  - Categories & Shop: Mobile-optimized grid gaps and filter UI
  - Footer: Responsive spacing with scaled icons and text
  - ProductDetail: Responsive container padding and loading states
- **Accessibility**: All interactive elements meet WCAG 2.2 touch target requirements

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool for fast development and optimized production builds
- **React Router v6** for client-side routing and navigation
- **TanStack Query (React Query)** for server state management, caching, and data synchronization

**UI Component Library**
- **Shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- Natural/eco-friendly color palette (forest greens, sage, herbal accents)
- Responsive design with mobile-first approach

**State Management**
- React Context API for authentication state (`AuthContext`)
- TanStack Query for server state (products, categories, orders, etc.)
- Local component state with React hooks for UI interactions
- Session storage for guest cart and session tracking

**Key Features**
- Product catalog with variants, images, and ratings
- Shopping cart (guest and authenticated users)
- Multi-step checkout with address management
- Product recommendations (related products, cart suggestions)
- Blog system with rich text content
- Admin dashboard for complete store management
- Accessibility-focused components (WCAG 2.2 compliant alternatives)
- SEO optimization with proper heading hierarchy and meta tags

### Backend Architecture

**Database & Authentication**
- **Supabase (PostgreSQL)** for relational data storage
- **Supabase Auth** for user authentication and authorization
- Row-Level Security (RLS) policies for data access control
- Database functions for complex queries (recommendations, analytics)

**Data Models**
- `products` - Product catalog with inventory, pricing, variants
- `categories` - Hierarchical product categorization
- `product_variants` - Size/color/quantity variations with unique constraints
- `orders` - Order management with items and status tracking
- `cart_items` - Shopping cart persistence
- `users` - Extended user profiles beyond Supabase auth
- `addresses` - Customer shipping/billing addresses
- `coupons` - Discount codes with validation rules
- `reviews` - Product reviews and ratings
- `blog_posts` - Content management for blog
- `hero_slides` - Homepage carousel content
- `catalog_feeds` - Product feed generation for advertising platforms

**Business Logic**
- Product recommendation engine using scoring algorithms (category match, price similarity, tags)
- Coupon validation with usage limits, expiration, and minimum purchase requirements
- Inventory management with stock tracking
- Order processing with status workflow
- Product variant deduplication with database constraints

### External Dependencies

**Analytics & Advertising**
- **Google Tag Manager (GTM)** - Centralized tag management for all tracking pixels
  - Configured via `VITE_GTM_ID` environment variable
  - Handles event tracking: page views, product views, add to cart, purchases, search
  - Supports Meta Pixel, Google Ads, TikTok, Pinterest, Snapchat, LinkedIn, Twitter, Microsoft Ads
- Custom analytics utilities for tracking user behavior and conversions
- Product catalog sync for dynamic advertising campaigns

**Third-Party Services**
- **Supabase** - Backend-as-a-Service
  - Authentication (email/password, social logins)
  - PostgreSQL database with real-time subscriptions
  - Edge functions for serverless operations (newsletter signup, catalog feeds)
  - Storage for product images and media files
- **Supabase Edge Functions**
  - `newsletter-signup` - Email subscription handling
  - `catalog-feed` - Dynamic product feed generation (XML, CSV, JSON formats)

**UI Libraries**
- Radix UI primitives (@radix-ui/react-*)
- Embla Carousel for image galleries and product carousels
- React Hook Form with Zod for form validation
- Quill for rich text editing (blog posts)
- Lucide React for icons
- date-fns for date formatting

**Development Tools**
- ESLint with TypeScript support
- PostCSS with Tailwind CSS
- Service Worker for tracking script optimization

**Key Integrations**
- WhatsApp Business integration for customer support
- Social media links (Facebook, Instagram, TikTok)
- Newsletter subscription system
- Product recommendation tracking (views and conversions)
- Catalog feed exports for advertising platforms (Google Shopping, Meta, etc.)

**Environment Variables Required**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous API key
- `VITE_GTM_ID` - Google Tag Manager container ID

**Notable Architectural Decisions**
- Progressive enhancement for accessibility (carousels work without JavaScript)
- Guest checkout flow to reduce friction
- Deduplication systems for product variants and purchase events
- Auto-scroll carousels that respect `prefers-reduced-motion`
- **Mobile-first responsive design** with:
  - Touch-friendly buttons and inputs (min-height 44px on mobile)
  - Responsive padding system (px-3 sm:px-4 md:px-6 lg:px-8)
  - Text scaling across breakpoints (text-sm sm:text-base md:text-lg)
  - Adaptive gap spacing (gap-2 sm:gap-4 md:gap-6)
  - Line clamping for mobile text overflow prevention
- Service worker excludes tracking scripts from caching for proper pixel operation
- Centralized GTM for all advertising platform tracking (Meta Pixel, Google Ads, TikTok, etc.)