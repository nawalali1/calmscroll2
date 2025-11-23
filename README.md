# CalmScroll

CalmScroll is a mobile first mindfulness app built with Next.js, React and Supabase. It helps users step away from doom scrolling with one minute breathing sessions, simple journaling and a clean, mobile friendly layout.

Live demo: https://main.d1c5qnh13swymm.amplifyapp.com/

---

## Overview

CalmScroll is built for phones first. After signing in, users land on a home screen that shows a short greeting, a quick breathing entry point, daily stats and recent notes.

The app uses Supabase for authentication and data storage with Row Level Security so each user only sees their own data. The front end is built with the Next.js App Router and client components where needed.

---

## Features

### Home dashboard

* Greeting with the user display name taken from the profile
* One minute breathing entry card that opens a full screen breathing sheet
* Quick stats showing:
  * Refocus count for today
  * Mindful minutes for today
* Weekly bar chart that shows activity across the current week
* List of the three most recent notes with title and snippet
* Floating button to add a new note

Daily stats and the weekly chart are powered by Supabase views that aggregate completed breathing sessions and refocus activity for the current user.

### Guided breathing

* Breathing sheet with a circular countdown and progress ring
* One minute session length with start, pause, resume, cancel and complete actions
* Progress value exposed to the UI so the ring fills as the timer runs
* On completion the app logs a breathing session in the `breath_sessions` table in Supabase

These records are then used in the daily mindful minutes view.

### Notes and journaling

* Create new notes from the home screen
* Optional title field and required content field
* Notes are stored in the `notes` table with:
  * `id`
  * `user_id`
  * `title`
  * `content`
  * `mood`
  * `due_at`
  * `created_at`
  * `updated_at`
* Home screen shows the three latest notes for quick access

### Calendar view

* Calendar page that loads all notes for the signed in user
* Monthly grid built in the client using date helpers
* Selecting a day filters the notes list to that date
* Notes can be marked as completed in the calendar view if the `completed` column exists in the `notes` table

If the `completed` column is not present the page still works as a calendar view for browsing notes.

### Onboarding and interests

* Onboarding page shown for new users who have not completed onboarding
* The page:
  * Loads the current user from Supabase auth
  * Lets the user choose tags in categories such as Focus and Work or Calm and Recovery
  * Saves selected tags into the `interests` table
  * Marks `onboarding_complete` on the profile and then routes to the home page

Interests are stored for personalisation and can be reused for future features.

### Profile and settings

* Settings page that:
  * Loads and updates the user display name in the `profiles` table
  * Offers toggles for three notification preferences:
    * Daily reminder
    * Streak alerts
    * Weekly summary
  * Saves these toggles into the `reminder_settings` table with:
    * `daily_reminder`
    * `streak_alerts`
    * `weekly_summary`
* Sign out button that clears the session and redirects to the login page

These preferences are stored now and can be wired to actual notification delivery later.

### Authentication

* Email and password signup and login with Supabase Auth
* Google OAuth callback route that handles the provider redirect
* Middleware that:
  * Protects the main app routes
  * Redirects unauthenticated users to `/login`
  * Routes authenticated users away from the login pages

---

## Tech stack

### Front end

* Next.js 16 with the App Router
* React 19
* TypeScript
* Tailwind CSS
* Framer Motion for light animation
* Lucide React icons

### Back end and data

* Supabase Auth for email and Google sign in
* Supabase PostgreSQL for data storage
* Row Level Security policies on all user tables
* SQL views for daily stats and weekly activity

### Deployment

* AWS Amplify for hosting
* CI and CD from the `main` branch
* Build configuration in `amplify.yml`
* Environment variables managed through the Amplify console

---

## Project structure

Based on your current repository:

```txt
calmscroll2/
├── app/
│   ├── (auth)/
│   │   ├── callback/route.ts      # Google OAuth callback
│   │   ├── login/page.tsx         # Email and password login
│   │   └── signup/page.tsx        # User registration
│   ├── api/
│   │   ├── health/route.ts        # Simple health check endpoint
│   │   ├── reminders/route.ts     # Placeholder reminders endpoint
│   │   ├── search/route.ts        # Note search endpoint
│   │   └── stats/route.ts         # Placeholder stats endpoint
│   ├── calendar/page.tsx          # Calendar view for notes
│   ├── home/page.tsx              # Main dashboard and breathing entry point
│   ├── onboarding/page.tsx        # Interest based onboarding
│   ├── settings/page.tsx          # Profile and reminder preferences
│   ├── layout.tsx                 # Root layout and providers
│   ├── providers.tsx              # Toast and Supabase provider setup
│   ├── globals.css                # Global styles
│   └── page.tsx                   # Landing route redirect logic
├── components/
│   ├── AuthForm.tsx               # Reusable auth form component
│   ├── BottomNav.tsx              # Mobile bottom navigation
│   ├── BreatherSheet.tsx          # Breathing modal with timer and progress ring
│   ├── CalendarMonth.tsx          # Calendar grid building block
│   ├── ConditionalBottomNav.tsx   # Shows nav only on specific routes
│   ├── GlassyCard.tsx             # Glass style card wrapper
│   ├── NoteCard.tsx               # Note display card
│   ├── SearchBar.tsx              # Search input with icon
│   ├── Toasts.tsx                 # Toast notification container
│   └── ui/sparkles.tsx            # Sparkle background effect
├── hooks/
│   ├── useAuth.ts                 # Supabase auth hook
│   ├── useBreather.ts             # Breathing timer and logging hook
│   ├── useNotes.ts                # Note CRUD helpers
│   └── useReminders.ts            # Reminder list and scheduling helpers (for future UI)
├── lib/
│   ├── db.ts                      # Supabase data helpers for profiles, notes, interests and sessions
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   └── server.ts              # Server side Supabase client
│   ├── utils.ts                   # Utility helpers such as time formatting
│   └── validations.ts             # Zod schemas and TypeScript types
├── public/                        # Static assets
├── amplify.yml                    # AWS Amplify build configuration
├── tailwind.config.ts             # Tailwind configuration
├── next.config.ts                 # Next.js configuration
├── middleware.ts                  # Route protection logic
├── package.json
└── tsconfig.json
The src folder from the starter has been removed and the App Router lives under app.

Database overview
The app expects the following Supabase tables and RLS rules, which you already have in your schema scripts:

profiles for user profile and onboarding state

notes for all user notes with title, content, mood and optional due date

interests for onboarding tags

breath_sessions for completed breathing sessions

intentions for refocus actions used in weekly stats

notifications for nudges that have been sent

metrics for streaks

reminders for future reminder rows

reminder_settings for daily reminder, streak alerts and weekly summary toggles

Row Level Security is enabled on all these tables and each policy checks auth.uid() so each user only reads and writes their own records.

Your schema script also creates:

Trigger functions to keep updated_at in sync

A trigger on auth.users to auto create profiles rows

Views that provide:

Refocus count for today

Mindful minutes for today

Weekly bar data for the chart on the home screen

Installation and local development
Clone the repository

bash
Copy code
git clone https://github.com/nawalali1/calmscroll2.git
cd calmscroll2
Install dependencies

bash
Copy code
npm install
Create environment file

Create .env.local in the project root with your Supabase values:

env
Copy code
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
Set up the database

In the Supabase SQL editor run your CalmScroll schema script that creates:

profiles, notes, interests, breath_sessions, intentions, notifications, metrics, reminders, reminder_settings

RLS policies for each table

Triggers and views for daily and weekly stats

Start the dev server

bash
Copy code
npm run dev
Then open:

text
Copy code
http://localhost:3000
You can sign up with email and password or use Google if you have the provider enabled in Supabase.

Deployment
The live app is deployed on AWS Amplify.

Basic steps to deploy a fork:

Connect the GitHub repository in the Amplify console

Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY as environment variables

Keep the default build settings from amplify.yml

Push to main to trigger a new build and deploy

Production URL for this project:

text
Copy code
https://main.d1c5qnh13swymm.amplifyapp.com/
Author
CalmScroll is built and maintained by Nawal Ali.

GitHub: https://github.com/nawalali1

LinkedIn: https://www.linkedin.com/in/nawal-ali-871a09332
