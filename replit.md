# New Era Herbals E-commerce Platform

## Overview

New Era Herbals is an e-commerce platform designed for selling organic herbal products and natural wellness solutions. It features a product catalog, shopping cart, checkout, blog, and an admin dashboard for comprehensive store management. The platform aims to provide a seamless shopping experience for customers and efficient management tools for administrators, leveraging modern web technologies to ensure performance, scalability, and an intuitive user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with **React 18** and **TypeScript**, using **Vite** for development and optimized builds. **React Router v6** handles client-side navigation, and **TanStack Query** manages server state, caching, and data synchronization.

**UI/UX Decisions:**
- **Shadcn/ui** components, based on Radix UI primitives, are used for a consistent and accessible UI.
- **Tailwind CSS** provides utility-first styling with a custom natural/eco-friendly color palette (forest greens, sage).
- The design employs a **mobile-first, responsive approach** with adaptive padding, text scaling, and touch-friendly components, ensuring WCAG 2.2 compliance.
- Modern design elements like glassmorphism effects, subtle shadows, and smooth animations are used throughout, including the header, product cards, and product detail pages.
- Accessibility is a priority, with features like keyboard navigation for search autocomplete and progressive enhancement for components like carousels.

**Key Features & Technical Implementations:**
- **Product Management**: Catalog with variants, images, ratings, and a modern product detail page design featuring enhanced typography, dedicated information sections, and clear call-to-action buttons.
- **Shopping Cart & Checkout**: Supports both guest and authenticated users with a multi-step checkout and address management.
- **Search Functionality**: Modern product search with real-time autocomplete, displaying product images, names, and prices, and supporting keyboard navigation.
- **Content Management**: Blog system with rich text, and hero slider management.
- **Admin Dashboard**: Comprehensive tools for product, order, user, and content management.
- **Performance Optimization**: Route-based code splitting (lazy loading for 40+ pages), bundle optimization (manual chunking), optimized TanStack Query settings, and image loading optimization (responsive `srcSet`, preloading, blur placeholders).
- **Header Design**: Features a modern glassmorphism effect, premium logo styling, improved navigation with visual feedback, and an enhanced search bar.

### Backend Architecture

**Supabase** serves as the Backend-as-a-Service, providing a **PostgreSQL** database and **Supabase Auth** for user authentication and authorization. Row-Level Security (RLS) is implemented for data access control.

**Data Models:**
Core data models include `products`, `categories`, `product_variants`, `orders`, `cart_items`, `users`, `addresses`, `coupons`, `reviews`, `blog_posts`, `hero_slides`, and `catalog_feeds`.

**Business Logic:**
- A product recommendation engine utilizes scoring algorithms.
- Coupon validation includes usage limits, expiration, and minimum purchase requirements.
- Inventory management with stock tracking.
- Order processing with status workflows.
- Product variant deduplication with database constraints.

## External Dependencies

**Analytics & Advertising:**
- **Google Tag Manager (GTM)**: Centralized tag management for all tracking, including page views, product views, add-to-cart, purchases, and searches. Configured via `VITE_GTM_ID`. Supports various advertising platforms like Meta Pixel, Google Ads, TikTok, etc.

**Third-Party Services:**
- **Supabase**: Provides authentication (email/password, social logins), PostgreSQL database with real-time capabilities, Edge Functions, and storage for media files.
  - **Supabase Edge Functions**: Used for `newsletter-signup` and `catalog-feed` generation.

**UI Libraries:**
- **Radix UI primitives**: Foundation for UI components.
- **Embla Carousel**: For image galleries and product carousels.
- **React Hook Form with Zod**: For robust form validation.
- **Lucide React**: For icons.
- **date-fns**: For date formatting.

**Integrations:**
- WhatsApp Business integration for customer support.
- Social media links (Facebook, Instagram, TikTok).
- Newsletter subscription system.
- Product recommendation tracking.
- Catalog feed exports for advertising platforms (Google Shopping, Meta, etc.).

**Environment Variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GTM_ID`