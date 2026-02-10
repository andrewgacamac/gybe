# YardGuard Backend

Automated lead processing system for artificial turf installation.

## Project Structure

- `supabase/migrations/`: Database schema (Tables, Triggers, RLS)
- `supabase/functions/`: Edge Functions (AI, Email, Jobs)
- `test-form/`: Standalone lead submission form for testing
- `admin-portal/`: static HTML/JS admin dashboard

## Setup Instructions

1. **Install Prerequisites**
   - [Supabase CLI](https://supabase.com/docs/guides/cli)
   - [Deno](https://deno.land/)

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start Local Development**
   ```bash
   supabase start
   ```

4. **Serve Admin Portal & Test Form**
   You can use any static file server, e.g., Python:
   ```bash
   python3 -m http.server 8000
   ```
   - Test Form: http://localhost:8000/test-form/
   - Admin Portal: http://localhost:8000/admin-portal/

## Deployment

1. **Link to Supabase Project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

2. **Push Database Schema**
   ```bash
   supabase db push
   ```

3. **Deploy Functions**
   ```bash
   supabase functions deploy --no-verify-jwt
   ```

4. **Set Secrets**
   ```bash
   supabase secrets set --env-file .env
   ```

## Documentation

See [`docs/`](docs/) for detailed guides:
- [Auth Setup](docs/auth-setup.md)
- [Deployment Guide](../deployment.html)
