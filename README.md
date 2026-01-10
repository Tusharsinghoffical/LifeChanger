
# Life Changer AI Tracker

A habit tracking application with AI-powered insights and celebrations for daily, weekly, monthly, and yearly achievements.

## Features

- Track daily habits with visual calendar view
- AI-powered insights using Google Gemini
- Celebrations for 100% completion:
  - Daily: "Daily Master! 🌟 - Perfect day!"
  - Weekly: "Weekly Goal Complete! 🎉 - Great week!"
  - Monthly: "Monthly Master! 🌟 - Amazing month!"
  - Yearly: "Yearly Champion! 🏆 - Incredible year!"
- Theme customization
- Responsive design

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Render

### Prerequisites

- A [Render](https://render.com) account
- Your Google Gemini API key

### Steps

1. **Prepare the repository**:
   - Push this code to a GitHub repository

2. **Create a new Web Service on Render**:
   - Go to your Render dashboard
   - Click "New +" → "Web Service"
   - Connect to your GitHub repository

3. **Configure the deployment**:
   - Environment: `Docker`
   - Branch: `main`
   - Root Directory: `.` (root)

4. **Set Environment Variables**:
   - Add `GEMINI_API_KEY` with your actual API key
   - Add `NODE_ENV` with value `production`

5. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

### Alternative: Using Render Blueprint

If you prefer to use the `render.yaml` blueprint included in this repository:

1. When creating the service, Render will automatically detect the `render.yaml` file
2. The service will be configured according to the specifications in the file

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `PORT`: Port to run the server on (defaults to 3000)
- `NODE_ENV`: Environment mode (defaults to production)

## Tech Stack

- React 19
- TypeScript
- Vite
- Google GenAI
- Recharts
- Tailwind CSS