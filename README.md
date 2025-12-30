# XenFi Expense Tracker

A production-ready internal expense and accounting management platform built with Next.js 14, TypeScript, and PostgreSQL. Designed for XenFi Systems to demonstrate full-stack engineering capabilities with modern best practices.

## 🚀 Live Demo

**Live Application:** https://expense-tracker-gw3s.vercel.app

**GitHub Repository:** https://github.com/Rogers-Wandera/Expense-Tracker

## 👤 Demo Credentials

| Role        | Email             | Password    |
| ----------- | ----------------- | ----------- |
| **Admin**   | admin@xenfi.com   | password123 |
| **Manager** | manager@xenfi.com | password123 |
| **Staff**   | staff@xenfi.com   | password123 |
| **Viewer**  | viewer@xenfi.com  | password123 |

## ✨ Features

### ✅ Core Requirements Met

- **Authentication** - Secure login with NextAuth.js (Credentials provider)
- **Protected Routes** - Dashboard accessible only to authenticated users
- **Full CRUD Operations** - Expenses, Categories, Departments & Users with validation
- **Dashboard Analytics** - Monthly totals, category breakdown, recent expenses, department budgets
- **Database** - PostgreSQL with Prisma ORM, migrations, and comprehensive seeding
- **Deployment** - Fully deployed on Vercel with proper environment variables

### 🎯 Bonus Features Implemented

- **Role-based Access Control (RBAC)** - ADMIN, MANAGER, STAFF, VIEWER roles with different permissions
- **Receipt Upload** - Cloudinary integration for receipt image/PDF storage with preview
- **Complete Audit Trail** - `createdBy`, `updatedBy`, timestamps on all models
- **Department Management** - Budget tracking, color-coded departments, expense allocation
- **Responsive Design** - Mobile-first UI with collapsible sidebar
- **Modern UI/UX** - Dark/light theme support, intuitive navigation

## 🏗️ Tech Stack & Architecture

### Frontend

- **Next.js 14 (App Router)** - For server-side rendering, API routes, and optimal performance
- **TypeScript** - Type safety and enhanced developer experience
- **Tailwind CSS** - Utility-first CSS for rapid UI development
- **HeroUI** - Accessible, customizable React components
- **Recharts** - Interactive data visualizations for analytics

### Backend

- **Next.js API Routes** - Serverless backend with built-in routing
- **Prisma ORM** - Type-safe database operations and migrations
- **NextAuth.js** - Authentication with JWT sessions and role-based protection
- **PostgreSQL** - Relational database with Neon.tech for production

### Services & Storage

- **Cloudinary** - Cloud-based image/PDF storage for receipts
- **Vercel** - Deployment and hosting platform with edge functions
- **Bcryptjs** - Secure password hashing and verification

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (local or Neon.tech or any provider)
- Cloudinary account (optional, for receipt uploads)

### Installation

1. **Clone and install:**

   ```bash
   git clone https://github.com/Rogers-Wandera/Expense-Tracker.git
   cd Expense-Tracker
   npm install
   ```

2. **Environment Setup:**
   Create .env.local file:

   # Database

   DATABASE_URL="postgresql://username:password@localhost:5432/xenfi_expense"

   # NextAuth

   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # App URLs

   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Cloudinary (Optional)

   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"

3. **Database Setup:** # Generate Prisma client
   npm run prisma:generate

   # Run migrations

   npm run prisma:migrate

   # Seed with sample data

   npm run seed

4. **Start Development Server:**
   npm run dev

## ⚙️ Database Management Commands

### Generate Prisma client

npm run prisma:generate

### Run migrations

npm run prisma:migrate

### Seed database

npm run seed

### Open Prisma Studio (GUI)

npm run prisma:studio

### Reset database (dev only)

npm run prisma:reset

## 🔧 Technical Decisions & Tradeoffs

### Technology Choices

Next.js 14 App Router

Why: Built-in API routes, server components, and simplified routing

Benefit: Reduced boilerplate, better performance with React Server Components

Prisma ORM

Why: Type-safe queries, intuitive schema, and automatic migrations

Benefit: TypeScript integration reduces runtime errors

Cloudinary over S3

Why: Simpler implementation with built-in image transformations

Benefit: No need for presigned URLs or complex bucket policies

Tradeoff: Less control over storage costs at large scale

HeroUI Component Library

Why: Built on Tailwind CSS with dark mode support

Benefit: Consistent design system with minimal custom CSS

JWT-based Sessions

Why: Stateless authentication, works well with serverless deployment

Benefit: Scalable and compatible with Vercel's edge functions

### Tradeoffs & Limitations

#### File Storage

Choice: Used Cloudinary instead of S3

Reason: S3 account access issues during development

Impact: Easier to implement but less enterprise-grade than S3

Migration Path: Can switch to S3 with minimal code changes

#### Authentication Scope

Choice: Email/password only, no social login

Reason: Focus on core functionality within time constraints

Impact: Simpler user management but fewer login options

Extensibility: NextAuth.js ready for OAuth providers if needed

#### Real-time Updates

Limitation: No WebSocket/Socket.io for real-time updates

Workaround: Manual refresh or periodic polling

Future Enhancement: Can add Server-Sent Events or WebSockets

#### Offline Support

Limitation: Limited offline capabilities

Current: Basic form persistence with localStorage

Future Enhancement: Service Worker for PWA features

#### Internationalization

Limitation: Single currency (UGX) support

Reason: Simplified for demo purposes

Extensibility: Currency field can be added to expenses model

#### Email Notifications

Limitation: No email verification or notification system

Reason: Focus on core expense tracking features

Future Enhancement: Integration with SendGrid or Resend

## 🎯 Features in Detail

### Dashboard

Monthly expense summaries with visual trends

Category breakdown using interactive charts

Department budget utilization tracking

Recent expenses with quick-action buttons

### Expense Management

Create expenses with receipt upload (image/PDF)

Status tracking: Draft → Pending → Approved → Paid

Multiple payment methods support

Department and category assignment

Search and filter capabilities

### User Management

Four distinct roles with granular permissions

Department-based user organization

Profile image upload with Cloudinary

Account status controls (active/locked/verified)

### Security Features

Password hashing with bcrypt

Protected API routes by user role

Input validation on all forms

Secure session management with JWT

## 🔍 Code Quality & Best Practices

Type Safety: Full TypeScript implementation with strict mode

Error Handling: Comprehensive error handling and user-friendly messages

Performance: Optimized database queries with proper indexing

Accessibility: Semantic HTML and ARIA labels where needed

Responsive Design: Mobile-first approach with breakpoints

## 📞 Support & Contact

For issues or questions:

Email: rogerrisha@gmail.com

GitHub Issues: https://github.com/Rogers-Wandera/Expense-Tracker/issues

📄 License
This project is proprietary and confidential. All rights reserved.

Built with ❤️ for XenFi Systems Engineering Assessment
Rogers Wandera - Software Engineer Candidate
