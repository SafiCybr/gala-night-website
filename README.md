
# Event Registration System

This is a modern event registration system built with React, TypeScript, and Supabase. The application allows users to register for events, make payments, and receive tickets.

## Features

- User authentication (register, login, logout)
- Payment tracking system
- Receipt upload functionality
- Ticket generation with QR codes
- Admin panel for payment approval and seat assignment

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/event-registration.git
cd event-registration
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up Supabase**

- Create a new Supabase project
- Run the SQL initialization script from `supabase-init.sql` in the Supabase SQL Editor
- Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Creating an admin user**

After registering a new user:
- Go to your Supabase dashboard
- Navigate to the SQL Editor
- Run the following query (replace `user_email@example.com` with the email of the user you want to make an admin):

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'user_email@example.com';
```

## Database Schema

The application uses three main tables:

1. **users** - Stores user information
2. **payments** - Tracks payment status and receipt URLs
3. **tickets** - Stores ticket and seating information

## Storage

The application uses Supabase Storage to store payment receipts in the `event-receipts` bucket.

## Security

- Row-Level Security (RLS) policies are implemented for all tables
- Users can only access their own data
- Admin users have access to all data

## Deployment

1. Build the application:

```bash
npm run build
# or
yarn build
```

2. Deploy the `dist` directory to your hosting provider of choice.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
