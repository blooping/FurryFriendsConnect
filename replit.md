# FurryFriends - AI-Powered Pet Adoption Platform

## Overview
FurryFriends is a modern pet adoption platform that connects loving pets with their forever families through AI-powered matching. Built with React, TypeScript, Express.js, and PostgreSQL, it features intelligent pet matching using Google's Gemini AI, comprehensive pet management, and an intuitive user experience.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom color palette and gradients
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon serverless PostgreSQL
- **AI Integration**: Google Generative AI (Gemini) for pet matching and chat
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple

### Database Schema
The application uses PostgreSQL with the following key tables:
- **users**: User profiles with adoption preferences
- **pets**: Pet information including personality traits and care needs
- **adoption_applications**: Application submissions with JSON form data
- **ai_matches**: AI-generated pet matches with scores and reasoning
- **chat_sessions**: AI chat conversation history

## Key Components

### AI Matching System
- **Service**: GeminiService handles AI-powered pet matching
- **Algorithm**: Analyzes user preferences (living space, activity level, experience) against pet characteristics
- **Output**: Match scores (1-100) with detailed reasoning and care advice
- **Integration**: Real-time chat interface for interactive matching

### Pet Management
- **Search & Filter**: Advanced filtering by type, age, location
- **Detailed Profiles**: Comprehensive pet information with personality traits and care requirements
- **Status Tracking**: Available, pending, adopted status management
- **Image Handling**: Unsplash integration for pet photos with fallback images

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Component Library**: Consistent UI using shadcn/ui components
- **Accessibility**: ARIA labels and keyboard navigation support
- **Performance**: Optimized images and lazy loading

### Admin Dashboard
- **Pet Management**: CRUD operations for pet listings
- **Application Review**: Adoption application processing
- **Analytics**: Basic statistics dashboard
- **AI Match Monitoring**: Review AI-generated matches

## Data Flow

### Pet Discovery Flow
1. User visits homepage or pets listing
2. Optional AI chat for personalized recommendations
3. Filter/search pets based on preferences
4. View detailed pet profiles
5. Submit adoption applications

### AI Matching Flow
1. User provides lifestyle preferences via form or chat
2. Backend queries available pets from database
3. Gemini AI analyzes compatibility
4. Returns ranked matches with explanations
5. User can explore recommended pets

### Application Processing Flow
1. User submits adoption application with personal details
2. Application stored with JSON form data
3. Admin reviews applications in dashboard
4. Status updates (pending → approved/rejected)
5. Pet status changes upon adoption

## External Dependencies

### Core Dependencies
- **@google/generative-ai**: Google Gemini AI integration
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **tailwindcss**: Utility-first CSS framework
- **vite**: Frontend build tool and dev server

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY` or `GOOGLE_API_KEY`: Google AI API key

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push`

### Production Setup
- **Platform**: Replit with autoscale deployment
- **Server**: Node.js running on port 5000
- **Database**: Neon serverless PostgreSQL
- **Static Files**: Served via Express from built frontend

### Development Environment
- **Hot Reload**: Vite dev server with HMR
- **Database**: Local or remote PostgreSQL instance
- **Type Checking**: TypeScript strict mode enabled
- **Code Quality**: ESLint and Prettier (inferred from setup)

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 17, 2025. Initial setup