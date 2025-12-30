# XenFi Expense Tracker

A production-ready internal expense and accounting management platform built with Next.js 14, TypeScript, and PostgreSQL. Designed for XenFi Systems to demonstrate full-stack engineering capabilities with modern best practices.

# 🚀 Live Demo

Vercel Deployment: [https://xenfi-expense-tracker.vercel.app](https://expense-tracker-gw3s.vercel.app/auth/login)

# Demo Credentials:

Admin User: admin@xenfi.com / password123

Manager User: manager@xenfi.com / password123

Staff User: staff@xenfi.com / password123

Viewer User: viewer@xenfi.com / password123

# ✨ Features

✅ Core Requirements
🔐 Authentication - Secure login with NextAuth.js (Credentials provider)

🛡️ Protected Routes - Dashboard accessible only to authenticated users

📝 Full CRUD Operations - Expenses, Categories, Departments & Users with validation

📊 Dashboard Analytics - Monthly totals, category breakdown, recent expenses, department budgets

🗃️ Database - PostgreSQL with Prisma ORM, migrations, and comprehensive seeding

⚡ Deployment - Fully deployed on Vercel with proper environment variables

🎯 Bonus Features Implemented
👥 Role-based Access Control (RBAC) - ADMIN, MANAGER, STAFF, VIEWER roles with different permissions

📁 Receipt Upload - Cloudinary integration for receipt image/PDF storage with preview

📝 Complete Audit Trail - createdBy, updatedBy, timestamps on all models with self-referential relationships

🏢 Department Management - Budget tracking, color-coded departments, expense allocation

📱 Fully Responsive Design - Mobile-first UI with collapsible sidebar

⚡ Performance Optimized - React cache, loading states, optimized queries with proper indexing

🎨 Modern UI - Custom HeroUI styled components with dark/light theme support

🔒 Security - Password hashing with bcrypt, protected routes, role-based API endpoints

📊 Data Visualization - Interactive charts with Recharts for expense analytics

# 📋 Tech Stack

Frontend
Next.js 14 - React framework with App Router

TypeScript - Type safety and better developer experience

Tailwind CSS - Utility-first CSS framework

HeroUI - Reusable, accessible UI components

@tanstack/react-form - Performant form handling

Recharts - Interactive data visualization

Tabler Icons - Beautiful icon library

Backend
Next.js API Routes - Serverless backend endpoints

Prisma - Type-safe ORM for PostgreSQL

NextAuth.js (Auth.js) - Authentication & authorization with JWT

PostgreSQL - Primary database (Neon.tech recommended)

Bcryptjs - Password hashing and verification

# Storage & Services

Cloudinary - Receipt image/PDF upload and storage

Neon.tech - Serverless PostgreSQL database (free tier available)

Vercel - Deployment and hosting platform

# 🏗️ Architecture

Database Schema Overview
The application uses a comprehensive database schema with the following key models:

User Model: Full user management with roles, departments, and audit trail

Expense Model: Core expense tracking with status, payment methods, and attachments

Category Model: Expense categorization with color coding

Department Model: Department management with budget tracking

Audit Trail: Complete tracking of createdBy, updatedBy, deletedBy across all models

Role-Based Access Control (RBAC)
ADMIN: Full system access (users, departments, categories, expenses)

MANAGER: Can manage expenses and categories, view departments

STAFF: Can create and manage own expenses, view categories

VIEWER: Read-only access to expenses and dashboards

# 🚀 Getting Started

Prerequisites
Node.js 18 or later

PostgreSQL database (or use Neon.tech free tier)

npm, yarn or similar package manager

Cloudinary account (for receipt uploads - optional but recommended)

# Installation

Clone the repository

bash
git clone https://github.com/yourusername/xenfi-expense-tracker.git
cd xenfi-expense-tracker
Install dependencies

bash
npm install

# or

yarn install

# or

pnpm install
Set up environment variables

Create a .env.local file in the root directory and add the following variables:

env

# Database

DATABASE_URL="postgresql://username:password@localhost:5432/xenfi_expense_tracker"

# NextAuth

NEXTAUTH_SECRET="your-secret-key-for-nextauth-32-chars-min"
NEXTAUTH_URL="http://localhost:3000"

# App URLs

NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_BASE_URL="http://localhost:3000"

# Cloudinary (Optional - for receipt uploads)

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
Note: For production, use Neon.tech or another PostgreSQL provider and update the DATABASE_URL accordingly.

Set up the database

bash

# Generate Prisma client

npm run prisma:generate

# Run database migrations

npm run prisma:migrate

# Seed the database with sample data

npm run seed
Start the development server

bash
npm run dev

# or

yarn dev
The application will be available at http://localhost:3000

📁 Project Structure

xenfi-expense-tracker/
├── app/
│ ├── api/ # API routes
│ │ ├── auth/
│ │ ├── categories/
│ │ ├── departments/
│ │ ├── expenses/
│ │ └── users/
│ ├── auth/ # Authentication pages
│ └── dashboard/ # Dashboard pages
├── components/ # React components
│ ├── dashboard/ # Dashboard-specific components
│ └── expenses/ # Expense components
├── generated/prisma/ # Generated Prisma client
├── hooks/ # Custom React hooks
├── lib/ # Utility functions and configurations
│ ├── prisma.ts # Prisma client instance
│ ├── auth.ts # NextAuth configuration
│ ├── utils.ts # Utility functions
│ └── scripts/
│ └── seed.ts # Database seeding script
├── prisma/
│ └── schema.prisma # Database schema
└── types/ # TypeScript type definitions

# 🗃️ Database Management

Available Scripts

## Generate Prisma client

npm run prisma:generate

## Open Prisma Studio (database GUI)

npm run prisma:studio

## Create and apply migrations

npm run prisma:migrate

## Apply migrations in production

npm run prisma:migrate:deploy

## Reset database (development only)

npm run prisma:reset

## Seed database with sample data

npm run seed
Seeding the Database
The seed script (lib/scripts/seed.ts) creates:

5 departments with budgets and color coding

4 users with different roles (ADMIN, MANAGER, STAFF, VIEWER)

5 expense categories

6 sample expenses with different statuses and departments

To run the seed script:

npm run seed
After seeding, use the demo credentials listed above to log in.

# 🔧 Environment Variables

Required Variables
Variable Description Example
DATABASE_URL PostgreSQL connection string postgresql://user:pass@localhost:5432/db
NEXTAUTH_SECRET Secret for NextAuth.js sessions your-32-character-secret
NEXTAUTH_URL Base URL for NextAuth http://localhost:3000
NEXT_PUBLIC_APP_URL Public app URL http://localhost:3000
Optional Variables
Variable Description Purpose
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME Cloudinary cloud name Receipt uploads
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET Cloudinary upload preset Receipt uploads

# 📱 Features in Detail

# 1. Dashboard

Monthly expense summary with trend analysis

Category-wise expense breakdown (chart & table)

Department budget utilization

Recent expenses with quick actions

Responsive design for all screen sizes

# 2. Expense Management

Create, read, update, and delete expenses

Receipt upload with preview (images and PDF)

Multiple payment methods (Cash, Card, Bank Transfer, etc.)

Expense status tracking (Draft → Pending → Approved → Paid)

Department assignment for expense tracking

# 3. User Management

Role-based access control (ADMIN, MANAGER, STAFF, VIEWER)

Department assignment for users

User status management (Active/Inactive, Verified, Locked)

Profile image upload with Cloudinary

# 4. Category & Department Management

Color-coded categories for visual distinction

Department budgets with tracking

Hierarchical expense organization

# 5. Authentication & Security

Secure login with email/password

Protected routes based on user roles

JWT-based session management

Password hashing with bcrypt

# Build the project

npm run build

📄 License
This project is free . All rights reserved.

🆘 Support
For support, email rogerrisha@gmail.com or create an issue in the GitHub repository.

🎯 Project Status
✅ Complete & Production Ready

Built with ❤️ for XenFi Systems Engineering Assessment
