# Campus Market - Supabase Integration Guide

## Quick Start

### 1. Install Node.js
Download and install from: https://nodejs.org/

### 2. Install Dependencies
```bash
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase JavaScript client
- `vite` - Development server

### 3. Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up or log in
4. Click "New Project"
5. Fill in:
   - **Name**: campus-market
   - **Database Password**: (choose a strong password)
   - **Region**: (choose closest to you)
6. Click "Create new project"
7. Wait for project to be ready (~2 minutes)

### 4. Get Your Credentials

1. In your Supabase project dashboard
2. Click "Settings" (gear icon) in sidebar
3. Click "API"
4. Copy:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

### 5. Configure Your App

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and replace with your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Update `supabase-config.js` with the same credentials

### 6. Set Up Database

1. In Supabase dashboard, click "SQL Editor" in sidebar
2. Click "New query"
3. Copy entire contents of `supabase-schema.sql`
4. Paste into SQL editor
5. Click "Run" or press Ctrl+Enter
6. Verify tables created in "Table Editor"

### 7. Enable Email Auth

1. Go to "Authentication" > "Providers"
2. Enable "Email" provider
3. Configure email templates (optional)

### 8. Run Development Server

```bash
npm run dev
```

Your app will be available at http://localhost:5173

## File Structure

```
Market/
├── index.html              # Main page
├── dashboard.html          # Dashboard page
├── privacy.html            # Privacy policy
├── styles.css              # Main styles
├── dashboard.css           # Dashboard styles
├── script.js               # Main JavaScript
├── dashboard.js            # Dashboard logic
├── auth.js                 # Authentication (will be updated)
├── supabase-config.js      # Supabase client setup
├── supabase-schema.sql     # Database schema
├── package.json            # Dependencies
├── .env                    # Your credentials (DO NOT COMMIT)
├── .env.example            # Template for .env
└── .gitignore              # Git ignore rules
```

## Next Steps

Once Node.js is installed and you've run `npm install`:

1. **Test Connection**: Open browser console and check for Supabase warnings
2. **Update Auth**: I'll help migrate auth.js to use Supabase Auth
3. **Update Data Layer**: Migrate from localStorage to Supabase queries
4. **Test Features**: Verify all functionality works
5. **Deploy**: Deploy to Vercel, Netlify, or your preferred host

## Troubleshooting

### npm not found
- Make sure Node.js is installed
- Restart your terminal after installation
- Verify with: `node --version`

### Supabase connection error
- Check your `.env` file has correct credentials
- Verify project URL and anon key are correct
- Make sure Supabase project is active

### Database errors
- Verify SQL schema ran successfully
- Check "Table Editor" in Supabase to see tables
- Review error messages in browser console

## Support

- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Client**: https://supabase.com/docs/reference/javascript
- **Community**: https://github.com/supabase/supabase/discussions

---

**Ready to proceed?** Once you have Node.js installed, run `npm install` and let me know when you're ready to migrate the authentication system!
