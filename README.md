# OnlyFans Replica

A full-stack replica of OnlyFans built with Next.js 15, Tailwind CSS, and MongoDB.

## Features
- **Creator Profiles:** Unique usernames and gated content.
- **Messaging:** Direct messaging between users and creators.
- **Subscriptions:** Manual payment approval workflow (Cash App/Crypto).
- **Admin Dashboard:** Manage creators, verify accounts, and oversee the platform.

## Setup

1. **Environment Variables:**
   Create a `.env.local` file in the root directory (one has been provided in this repo for your convenience) with the following content:
   ```
   MONGODB_URI=mongodb+srv://josepholanrewaju818_db_user:Iamolanrewaju@onlyfans.frjm5lq.mongodb.net/?appName=Onlyfans
   NEXTAUTH_SECRET=a_random_secure_string_for_onlyfans_replica
   NEXTAUTH_URL=http://localhost:3000
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

4. **Access the App:**
   Open [http://localhost:3000](http://localhost:3000). The first user to register will automatically be assigned the **Admin** role.

## Deployment
This project is ready for deployment on Vercel. Ensure you add the environment variables listed above in your Vercel project settings.
