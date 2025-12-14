# Flex Living Reviews Dashboard

## Live Demo

You can try the Flex Living Reviews Dashboard live here:

- **Manager Dashboard:** [https://flex-delta-orcin.vercel.app/](https://flex-delta-orcin.vercel.app/)

**How to use:**

- The app opens directly to the Manager Dashboard, where you can view all property listings (the ones retrieved from the hostaway API) and their review stats.
- To view the full property review display page for a specific listing, click **View Full Property Details** on any listing report.
- Only reviews approved by the manager are shown on the public page.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript
- **Backend:** Next.js API routes, Node.js, Supabase
- **APIs:**
  - Hostaway Reviews API (mocked)
  - Google Places API (if feasible)
- **AI Tool Used:** GitHub Copilot (GPT-4.1, Claude Sonnet 4.5), Perplexity

## Key Features & Design Decisions

- **Hostaway Integration:**
  - Mocked Hostaway API using provided JSON data.
- **Google Reviews Integration:**
  - Integrated via Google Places API where possible.
  - Attempting to fetch reviews from the listings mentioned in the sandbox environment, however no reviews are found for these listings
    ![alt text](image.png)
- **Manager Dashboard:**
  - Displays property listings provided by the sandboxed Hostaway API.
  - Managers can approve reviews for public display.
- **API Normalization:**
  - `/api/reviews/hostaway` returns normalized, structured review data for frontend use.

## API Behaviors

- **GET `/api/reviews/hostaway`**
  - Returns normalized reviews from the Hostaway (mocked) API.

## Google Reviews Findings

- The Google Places API can be used to fetch public reviews for properties if the place can be matched by name and address.
- Integration is implemented where feasible. If a property cannot be matched, the dashboard gracefully handles the absence of Google reviews.
- API keys and quotas may limit the number of requests; ensure your API key is set in the environment.

## Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd flex
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set environment variables:**
   - Create a `.env.local` file with your API keys:
     ```env
     HOSTAWAY_ACCOUNT_ID=61148
     HOSTAWAY_API_KEY=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
     GOOGLE_PLACES_API_KEY=your_google_api_key
     ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **Open the app:**
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.
