# Emergency Medical Service App - Deployment Guide

This document provides instructions for deploying the Emergency Medical Service App using Cloudflare Workers.

## Prerequisites

- Node.js and npm installed
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare account

## Deployment Steps

1. **Enable Database in wrangler.toml**

   Uncomment the database configuration in `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "emergency-medical-app"
   database_id = "local"
   ```

2. **Initialize the Database**

   Run the SQL migration to set up the database:
   ```bash
   wrangler d1 execute DB --local --file=migrations/0001_initial.sql
   ```

3. **Build the Application**

   Build the Next.js application:
   ```bash
   npm run build
   ```

4. **Deploy to Cloudflare Workers**

   Deploy the application:
   ```bash
   npm run deploy
   ```

5. **Create Production Database**

   Create a D1 database in Cloudflare:
   ```bash
   wrangler d1 create emergency-medical-app
   ```

   Update the `wrangler.toml` file with the production database ID.

6. **Apply Migrations to Production**

   Apply the SQL migrations to the production database:
   ```bash
   wrangler d1 execute emergency-medical-app --file=migrations/0001_initial.sql
   ```

7. **Deploy to Production**

   Deploy the application to production:
   ```bash
   npm run deploy
   ```

## Accessing the Application

After deployment, the application will be available at the URL provided in the deployment output. This URL can be shared with users to access the Emergency Medical Service App.

## Updating the Application

To update the application after making changes:

1. Make your changes to the code
2. Build the application: `npm run build`
3. Deploy the changes: `npm run deploy`

## Troubleshooting

- If you encounter database connection issues, ensure the database binding is correctly configured in `wrangler.toml`
- For deployment errors, check the Cloudflare Workers logs in the Cloudflare dashboard
- If the application is not working as expected, run the test script: `./test.sh`
