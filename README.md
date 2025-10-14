# Smart Recipe Generator

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.14-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.75.0-3ECF8E)](https://supabase.com/)

A modern, AI-powered web application that helps users discover and create recipes based on ingredients they have at home. Upload photos of your pantry items or manually select ingredients to find matching recipes or generate new ones using artificial intelligence.

## 🌟 Features

- **Ingredient Recognition**: Upload images of your ingredients and let Google Cloud Vision API automatically identify them
- **Recipe Discovery**: Search through a database of recipes filtered by ingredients, dietary preferences, cooking time, and difficulty
- **AI Recipe Generation**: Use Google Gemini AI to create custom recipes from your available ingredients
- **User Authentication**: Secure sign-up and login with OTP verification via Supabase Auth
- **Personalized Suggestions**: Get recipe recommendations based on your ratings and saved favorites
- **Favorites & Ratings**: Save recipes and rate them to build your personal cookbook
- **Responsive Design**: Optimized for desktop and mobile devices with beautiful UI animations
- **Recipe Scaling**: Dynamically adjust ingredient quantities and nutritional info for different serving sizes

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework

### Backend & APIs
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - Authentication, database, and file storage
- **Google Cloud Vision API** - Image recognition
- **Google Gemini AI** - Recipe generation
- **Unsplash API** - Recipe images

### Database
- **PostgreSQL** (via Supabase) with custom functions for recipe filtering

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project
- Google Cloud Platform account with Vision API and Gemini API enabled
- Unsplash API access (optional, for recipe images)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smart-recipe-generator.git
   cd smart-recipe-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Google Cloud
   GOOGLE_CLIENT_EMAIL=your_google_service_account_email
   GOOGLE_PRIVATE_KEY=your_google_private_key
   GOOGLE_PROJECT_ID=your_google_project_id
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key

   # Unsplash (optional)
   UNSPLASH_ACCESS_KEY=your_unsplash_access_key
   ```

4. **Set up Supabase Database**

   Run the following SQL in your Supabase SQL editor to create the necessary tables and functions:

   ```sql
   -- Recipes table
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

   -- User preferences
   CREATE TABLE user_preferences (
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
     preferred_cuisines TEXT[],
     preferred_difficulties TEXT[]
   );

   -- Favorite recipes
   CREATE TABLE favorite_recipes (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
     UNIQUE(user_id, recipe_id)
   );

   -- Saved AI recipes
   CREATE TABLE saved_ai_recipes (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     recipe_data JSONB NOT NULL
   );

   -- Recipe ratings
   CREATE TABLE recipe_ratings (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     recipe_id INTEGER NOT NULL,
     type TEXT CHECK (type IN ('normal', 'ai')),
     rating INTEGER CHECK (rating >= 1 AND rating <= 5),
     UNIQUE(user_id, recipe_id, type)
   );

   -- Ingredients table
   CREATE TABLE ingredients (
     id SERIAL PRIMARY KEY,
     name TEXT UNIQUE NOT NULL
   );

   -- Recipe ingredients junction
   CREATE TABLE recipe_ingredients (
     recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
     ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
     quantity TEXT,
     PRIMARY KEY (recipe_id, ingredient_id)
   );

   -- Custom function for recipe filtering
   CREATE OR REPLACE FUNCTION filter_recipes(
     p_ingredients TEXT[],
     p_dietary TEXT DEFAULT NULL,
     p_max_time INTEGER DEFAULT NULL,
     p_difficulty TEXT DEFAULT NULL
   )
   RETURNS TABLE (
     id INTEGER,
     title TEXT,
     cuisine TEXT,
     difficulty TEXT,
     cooking_time_minutes INTEGER,
     servings INTEGER,
     image_url TEXT,
     ingredients JSONB,
     nutrition JSONB,
     instructions TEXT[],
     score REAL
   )
   LANGUAGE plpgsql
   AS $$
   BEGIN
     RETURN QUERY
     SELECT
       r.id,
       r.title,
       r.cuisine,
       r.difficulty,
       r.cooking_time_minutes,
       r.servings,
       r.image_url,
       r.ingredients,
       r.nutrition,
       r.instructions,
       -- Calculate match score based on ingredient overlap
       (SELECT COUNT(*)::REAL / array_length(p_ingredients, 1)
        FROM unnest(p_ingredients) AS ing
        WHERE EXISTS (
          SELECT 1 FROM recipe_ingredients ri
          JOIN ingredients i ON ri.ingredient_id = i.id
          WHERE ri.recipe_id = r.id AND i.name ILIKE '%' || ing || '%'
        )) AS score
     FROM recipes r
     WHERE
       (p_dietary IS NULL OR r.cuisine ILIKE '%' || p_dietary || '%') AND
       (p_max_time IS NULL OR r.cooking_time_minutes <= p_max_time) AND
       (p_difficulty IS NULL OR r.difficulty = p_difficulty) AND
       EXISTS (
         SELECT 1 FROM unnest(p_ingredients) AS ing
         WHERE EXISTS (
           SELECT 1 FROM recipe_ingredients ri
           JOIN ingredients i ON ri.ingredient_id = i.id
           WHERE ri.recipe_id = r.id AND i.name ILIKE '%' || ing || '%'
         )
       )
     ORDER BY score DESC, r.cooking_time_minutes ASC
     LIMIT 20;
   END;
   $$;
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

1. **Sign Up/Login**: Create an account or sign in to access all features
2. **Find Recipes**:
   - Upload an image of your ingredients for automatic recognition
   - Or manually select from the ingredient list
   - Apply filters for dietary preferences, cooking time, and difficulty
3. **Generate AI Recipes**: Use AI to create completely new recipes from your ingredients
4. **View Recipes**: Click on any recipe to see detailed instructions, nutrition info, and scaling options
5. **Save & Rate**: Save your favorite recipes and rate them to improve suggestions
6. **Get Suggestions**: Visit the suggestions page for personalized recommendations

## 🔌 API Endpoints

The application includes several API routes:

- `POST /api/recognize-ingredients` - Recognize ingredients from uploaded images
- `POST /api/get-recipes` - Fetch recipes based on ingredients and filters
- `POST /api/generate-ai-recipes` - Generate AI-powered recipes
- `GET/POST /api/favorites` - Manage user's saved recipes
- `POST /api/favorites/toggle` - Add/remove recipes from favorites
- `GET/POST /api/rate-recipe` - Get and submit recipe ratings
- `GET /api/suggestions` - Get personalized recipe suggestions
- `GET /api/get-all-ingredients` - Fetch all available ingredients

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for backend services
- [Google Cloud](https://cloud.google.com/) for AI and vision APIs
- [Unsplash](https://unsplash.com/) for beautiful food images
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

Made with ❤️ for food lovers everywhere!
