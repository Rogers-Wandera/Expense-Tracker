# Expense-Tracker

A production-ready internal expense and accounting management platform built with Next.js 14, TypeScript, and PostgreSQL. Designed for XenFi Systems to demonstrate full-stack engineering capabilities with modern best practices.

## 🚀 Live Demo

**Vercel Deployment:** [https://xenfi-expense-tracker.vercel.app](https://xenfi-expense-tracker.vercel.app)

**Demo Credentials:**

- **Admin User:** `admin@xenfisystems.com` / `Demo@123`
- **Staff User:** `staff@xenfisystems.com` / `Demo@123`
- **Demo User:** `demo@xenfisystems.com` / `Demo@123`

## ✨ Features

### ✅ Core Requirements

- **🔐 Authentication** - Secure login with NextAuth.js (Credentials provider)
- **🛡️ Protected Routes** - Dashboard accessible only to authenticated users
- **📝 Full CRUD Operations** - Expenses & Categories with validation
- **📊 Dashboard Analytics** - Monthly totals, category breakdown, recent expenses
- **🗃️ Database** - PostgreSQL with Prisma ORM, migrations, and seeding
- **⚡ Deployment** - Fully deployed on Vercel with proper environment variables

### 🎯 Bonus Features

- **👥 Role-based Access Control** - Admin vs Staff roles with different permissions
- **📁 Receipt Upload** - Cloudinary integration for receipt image storage
- **📝 Audit Trail** - `createdBy`, `updatedBy`, timestamps on all models
- **📱 Responsive Design** - Mobile-friendly UI with Tailwind CSS
- **⚡ Performance Optimized** - React cache, loading states, optimized queries
- **🎨 Modern UI** - Custom shadcn/ui styled components with consistent design

## 📋 Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable, accessible UI components
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation
- **Recharts** - Data visualization

### Backend

- **Next.js API Routes** - Serverless backend endpoints
- **Prisma** - Type-safe ORM for PostgreSQL
- **NextAuth.js (Auth.js)** - Authentication & authorization
- **PostgreSQL** - Primary database (Neon.tech)

### Storage & Services

- **Cloudinary** - Receipt image upload and storage
- **Neon.tech** - Serverless PostgreSQL database
- **Vercel** - Deployment and hosting platform

## 🏗️ Architecture

### Database Schema

```mermaid
ER Diagram
    User ||--o{ Expense : creates
    User ||--o{ Category : creates
    Category ||--o{ Expense : categorizes

    User {
        string id PK
        string email UK
        string name
        string password
        enum role
        datetime createdAt
        datetime updatedAt
    }

    Expense {
        string id PK
        decimal amount
        string description
        datetime date
        string categoryId FK
        enum paymentMethod
        string attachmentUrl
        string createdById FK
        datetime createdAt
        datetime updatedAt
    }

    Category {
        string id PK
        string name UK
        string description
        string color
        string createdById FK
        datetime createdAt
        datetime updatedAt
    }
```

## 🚀 Getting Started

### Prerequisites

Node.js 18 or later

PostgreSQL database (or Neon.tech)

npm, yarn or similar package manager

Cloudinary account (for receipt uploads - optional)

## Installation

Clone the repository

```typescript
git clone https://github.com/Rogers-Wandera/Expense-Tracker.git
cd xenfi-expense-tracker
```

npm install

# or

yarn install
