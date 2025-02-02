# MyWeather App

Weather app with LLM integration built with Next.js, Tailwind, Shadcn, and Supabase.

## Prerequisites

- Node.js 18.17 or later
- Git
- A Supabase account
- An OpenWeatherMap API key
- An OpenAI API key

## Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/OBress/MyWeather
   cd myweather
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy the example environment file:
     ```bash
     cp example-.env.local .env.local
     ```
   - Fill in your environment variables in `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
     OPENAI_API_KEY=your_openai_api_key
     ```

4. Set up Supabase:

   - Install Supabase CLI
   - Run migrations:
     ```bash
     supabase init
     run this SQL command:
        create table public.user_settings (
        id bigint generated by default as identity primary key,
        user_id uuid references auth.users not null unique,
        locations jsonb default '[]'::jsonb,
        default_location_id text,
        openai_api_key text,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
        alter table public.user_settings enable row level security;
        create policy "Users can view their own settings"
        on public.user_settings for select
        using (auth.uid() = user_id);
        create policy "Users can insert their own settings"
        on public.user_settings for insert
        with check (auth.uid() = user_id);
        create policy "Users can update their own settings"
        on public.user_settings for update
        using (auth.uid() = user_id);
     ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase
- **Authentication**: Supabase Auth
- **APIs**: OpenWeatherMap API, OpenAI API, Google Maps API
