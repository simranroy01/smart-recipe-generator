# Smart Recipe Generator - Full Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Component Documentation](#component-documentation)
7. [Setup and Installation](#setup-and-installation)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [Troubleshooting](#troubleshooting)

## Overview

The Smart Recipe Generator is a modern web application that helps users discover and create recipes based on ingredients they have available. The application combines traditional recipe database queries with AI-powered recipe generation to provide a comprehensive cooking assistant.

### Key Features

- **Ingredient Recognition**: Upload photos to automatically identify ingredients using Google Cloud Vision API
- **Recipe Discovery**: Search and filter recipes from a curated database
- **AI Recipe Generation**: Create custom recipes using Google Gemini AI
- **User Authentication**: Secure sign-up and login with OTP verification
- **Personalization**: Save favorites, rate recipes, and receive personalized suggestions
- **Responsive Design**: Optimized for desktop and mobile devices

## Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API   │    │   External APIs │
│   (React/TS)    │◄──►│   Routes        │◄──►│   - Google AI   │
│                 │    │                 │    │   - Vision API  │
└─────────────────┘    └─────────────────┘    │   - Unsplash    │
                                              └─────────────────┘
                                                     │
                                                     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   PostgreSQL    │    │   File Storage  │
│   Auth          │◄──►│   Database      │◄──►│   (Images)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **User Input**: Ingredients via image upload or manual selection
2. **Processing**: Vision API for image recognition, or direct database queries
3. **Recipe Generation**: Either database filtering or AI generation
4. **Display**: Formatted recipes with scaling and nutritional information

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI library with modern hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS 4**: Utility-first CSS framework

### Backend & APIs
- **Next.js API Routes**: Serverless API endpoints
- **Supabase**: Authentication, database, and file storage
- **Google Cloud Vision API**: Image recognition
- **Google Gemini AI**: Recipe generation
- **Unsplash API**: Recipe images

### Database
- **PostgreSQL** (via Supabase)
- **Custom SQL Functions**: Advanced recipe filtering

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript Compiler**: Type checking

## Database Schema

### Core Tables

#### recipes
```sql
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  cuisine TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  cooking_time_minutes INTEGER,
  servings INTEGER DEFAULT 4,
  image_url TEXT,
  ingredients JSONB,
  nutrition JSONB,
  instructions TEXT[]
);
```

#### ingredients
```sql
CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
```

#### recipe_ingredients (junction table)
```sql
CREATE TABLE recipe_ingredients (
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity TEXT,
  PRIMARY KEY (recipe_id, ingredient_id)
);
```

### User-Related Tables

#### favorite_recipes
```sql
CREATE TABLE favorite_recipes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE(user_id, recipe_id)
);
```

#### saved_ai_recipes
```sql
CREATE TABLE saved_ai_recipes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_data JSONB NOT NULL
);
```

#### recipe_ratings
```sql
CREATE TABLE recipe_ratings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL,
  type TEXT CHECK (type IN ('normal', 'ai')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  UNIQUE(user_id, recipe_id, type)
);
```

#### user_preferences
```sql
CREATE TABLE user_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  preferred_cuisines TEXT[],
  preferred_difficulties TEXT[]
);
```

### Custom Functions

#### filter_recipes
A PostgreSQL function that filters recipes based on ingredients and preferences, calculating match scores for optimal results.

## API Reference

### Authentication Endpoints

All user-specific endpoints require authentication via Supabase Auth.

#### POST /api/auth/signin
Sign in with email and password.

#### POST /api/auth/signup
Create new account with email verification.

### Recipe Endpoints

#### POST /api/get-recipes
Retrieve recipes based on ingredients and filters.

**Request Body:**
```json
{
  "ingredients": ["chicken", "rice", "onion"],
  "dietary": "any",
  "maxTime": 30,
  "difficulty": "Easy"
}
```

**Response:**
```json
{
  "recipes": [
    {
      "id": 1,
      "title": "Chicken Fried Rice",
      "cuisine": "Chinese",
      "difficulty": "Easy",
      "cooking_time_minutes": 25,
      "servings": 4,
      "image_url": "https://...",
      "ingredients": [...],
      "nutrition": {...},
      "instructions": [...]
    }
  ]
}
```

#### POST /api/generate-ai-recipes
Generate new recipes using AI.

**Request Body:**
```json
{
  "ingredients": ["chicken", "rice", "vegetables"],
  "dietary": "any",
  "maxTime": 30,
  "difficulty": "any"
}
```

#### POST /api/recognize-ingredients
Identify ingredients from uploaded image.

**Request:** FormData with 'image' file
**Response:** Array of recognized ingredient names

### User Data Endpoints

#### GET /api/favorites
Retrieve user's saved recipes.

**Response:**
```json
{
  "normal": [...],
  "ai": [...]
}
```

#### POST /api/favorites/toggle
Add or remove recipe from favorites.

#### GET/POST /api/rate-recipe
Get or submit recipe ratings.

#### GET /api/suggestions
Get personalized recipe recommendations.

## Component Documentation

### Core Components

#### RecipeFinder
Main component for ingredient input and recipe search.

**Props:** None
**State:**
- inputMode: 'image' | 'text'
- selectedIngredients: string[]
- recipes: Recipe[]

**Key Methods:**
- handleRecognizeIngredients(): Processes uploaded images
- handleFindRecipes(): Searches database recipes
- handleGenerateAIRecipes(): Creates AI recipes

#### RecipeCard
Displays individual recipe information.

**Props:**
```typescript
interface RecipeCardProps {
  recipe: Recipe
  showRating?: boolean
}
```

#### RecipeList
Container for displaying multiple recipe cards.

**Props:**
```typescript
interface RecipeListProps {
  recipes: Recipe[]
  onBack?: () => void
}
```

### Utility Components

#### RatingStars
Interactive star rating component.

#### SaveButton
Toggle favorite status for recipes.

#### TypingSubtitle
Animated subtitle with rotating messages.

### Page Components

#### Home Page (/)
Main landing page with recipe finder.

#### Recipe Detail Pages
- /recipes/[id]: Database recipe details
- /ai-recipes/[id]: AI-generated recipe details

#### Auth Page (/auth)
User authentication interface.

#### Profile Page (/profile)
User's saved recipes and preferences.

#### Suggestions Page (/suggestions)
Personalized recipe recommendations.

## Setup and Installation

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account
- Google Cloud Platform account

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd smart-recipe-generator
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env.local` with required variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   GOOGLE_CLIENT_EMAIL=your_service_account_email
   GOOGLE_PRIVATE_KEY=your_private_key
   GOOGLE_PROJECT_ID=your_project_id
   GOOGLE_GEMINI_API_KEY=your_gemini_key
   UNSPLASH_ACCESS_KEY=your_unsplash_key
   ```

4. **Database Setup**
   Run the SQL schema in Supabase SQL editor.

5. **Development Server**
   ```bash
   npm run dev
   ```

## Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

### Environment Considerations

- Ensure all API keys are properly configured
- Set up proper CORS policies
- Configure database connection limits
- Enable file storage buckets in Supabase

## Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Commit with descriptive messages
5. Push and create pull request

### Code Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Write descriptive commit messages
- Test components and API routes

### Testing Guidelines

- Test all user interactions
- Verify API responses
- Check responsive design
- Validate form inputs

## Troubleshooting

### Common Issues

#### Authentication Problems
- Verify Supabase configuration
- Check OTP email delivery
- Ensure proper redirect URLs

#### API Errors
- Confirm environment variables
- Check API key validity
- Verify request formats

#### Image Upload Issues
- Validate file types and sizes
- Check Supabase storage permissions
- Verify Vision API credentials

#### Performance Issues
- Optimize images and lazy loading
- Check database query performance
- Monitor API rate limits

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

### Support

For issues not covered here:
1. Check existing GitHub issues
2. Create detailed bug report
3. Include error messages and steps to reproduce

---

This documentation is maintained alongside the codebase. Please update it when making significant changes to the application.
