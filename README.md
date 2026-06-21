# YouTube Content Generator

An AI-powered web application that helps YouTube creators generate optimized content ideas, titles, descriptions, tags, and thumbnails. Built with modern web technologies, it leverages AI models for content creation and image generation to supercharge channel growth.

## Description

This project is a full-stack Next.js application designed to assist YouTube creators in producing high-quality, SEO-optimized content. Users can input video ideas or topics, and the AI generates:
- SEO-optimized titles with scores
- Engaging descriptions
- Relevant tags
- Thumbnail prompts and AI-generated thumbnails

The app includes user authentication, a dashboard, billing integration, and background processing for AI tasks. It uses serverless functions for efficient AI workflows and integrates with cloud services for image handling.

## Features

- **AI Content Generator**: Input a topic to generate titles, descriptions, tags, and thumbnail prompts.
- **AI Thumbnail Generator**: Generate custom thumbnails based on user input, reference images, or user photos.
- **Dashboard**: Overview of features and welcome banner.
- **Billing & Checkout**: Subscription plans with Stripe integration (via Clerk).
- **Authentication**: Secure sign-in/sign-up using Clerk.
- **Outlier Detection**: Analyze video performance outliers.
- **Trending Keywords**: Rank trend signals inferred from the current YouTube
  popular-video chart by region and category, with source-video evidence.
- **Thumbnail Search**: Search YouTube thumbnails by topic or visual similarity.
- **Responsive Design**: Mobile-friendly UI with dark mode support.
- **Background Processing**: Uses Inngest for asynchronous AI tasks like content and image generation.

## Tech Stack

### Frontend
- **Next.js**: React framework for server-side rendering and API routes.
- **React**: UI library for building interactive components.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Shadcn UI**: Reusable UI components (e.g., buttons, cards, tooltips).
- **Framer Motion**: For animations and transitions.
- **Lucide React**: Icon library.

### Backend & Database
- **Next.js API Routes**: Handles API endpoints for AI generation and user data.
- **Drizzle ORM**: Type-safe ORM for PostgreSQL queries.
- **Neon Database**: Serverless PostgreSQL database.
- **Inngest**: Serverless event-driven workflows for background jobs (e.g., AI processing).

### AI & Integrations
- **OpenRouter (OpenAI-compatible)**: For generating content (titles, descriptions, tags) using models like Mistral.
- **Cloudflare AI Workers**: Image generation using Flux-1 model.
- **ImageKit**: Image upload, storage, and optimization.
- **Replicate**: Optional AI model integration (e.g., Stable Diffusion for thumbnails).
- **Axios**: For HTTP requests.

### Authentication & Others
- **Clerk**: User authentication and management.
- **Stripe**: Billing and subscriptions (integrated via Clerk).
- **Moment.js**: Date handling.
- **Sharp**: Image processing (e.g., resizing thumbnails).

### Development Tools
- **TypeScript**: For type safety.
- **ESLint & Prettier**: Code linting and formatting.
- **Vercel**: Recommended for deployment.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/manavsaini124/youtube-content-generator.git
   cd youtube-content-generator
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables: Create a `.env` file in the root directory and add the following (replace with your own keys):
   ```
   NEON_DB_CONNECTION_STRING=your-neon-db-url
   CLERK_SECRET_KEY=your-clerk-secret
   OPEN_ROUTER_API_KEY=your-openrouter-key
   CLOUDFLARE_API_KEY=your-cloudflare-key
   CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
   CLOUDFLARE_IMAGE_MODEL=@cf/black-forest-labs/flux-2-klein-4b (optional)
   IMAGEKIT_PUBLIC_KEY=your-imagekit-public
   IMAGEKIT_PRIVATE_KEY=your-imagekit-private
   IMAGEKIT_URL_ENDPOINT=your-imagekit-url
   REPLICATE_API_KEY=your-replicate-key
   YOUTUBE_API_KEY=your-youtube-data-api-key
   INNGEST_SIGNING_KEY=your-inngest-key
   INNGEST_SERVER_URL=https://api.inngest.com/v1/events
   GEMINI_API_KEY=your-gemini-key (optional)
   ```

4. Set up the database:
   ```
   npm run db:push
   npx drizzle-kit studio  # Optional: Open Drizzle Studio for DB management
   ```

   For an existing database that already has the original application tables,
   apply the additive trending-history migration with:

   ```bash
   npm run db:migrate
   ```

5. Run the development server in one terminal:
   ```
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. Run the local Inngest Dev Server in a second terminal:
   ```
   npm run inngest
   ```
   In development, the Inngest SDK automatically uses the local Dev Server
   when it is available and falls back to the configured cloud environment
   when it is not. The local dashboard is available at
   [http://localhost:8288](http://localhost:8288).

   Set `INNGEST_DEV=1` only when local mode must be required instead of
   automatically detected. Set `INNGEST_DEV=0` to force cloud mode.

   To use a different local Inngest address, set:
   ```
   INNGEST_DEVSERVER_URL=http://127.0.0.1:8288
   ```

## Usage

1. **Sign Up/In**: Use Clerk authentication to create an account.
2. **Dashboard**: Navigate to features like AI Content Generator or Thumbnail Generator.
3. **Generate Content**: Enter a video topic in the AI Content Generator page to get titles, descriptions, tags, and a thumbnail.
4. **Generate Thumbnail**: Provide input, optional reference/user images, and generate AI thumbnails.
5. **Research Trends**: Choose a region and category to inspect cached trend
   signals inferred from popular-video metadata. Scores are not search volume.
6. **Billing**: Subscribe to premium plans for advanced features.

## Trending Keywords Data

The `/trending-keywords` page uses the official YouTube Data API v3
`videos.list` most-popular chart. Results are cached server-side for one hour,
category names are cached for 24 hours, and stale results are returned when an
upstream refresh fails. The API key remains server-only.

When the `trending_video_snapshots` migration is applied, every chart refresh
stores a short-lived statistics snapshot in Neon. Later refreshes calculate
measured views per hour, compare velocity with the previous interval, and show
24-hour and 7-day mini charts. Snapshots older than 30 days are deleted during
refresh. Until enough snapshots exist, the page labels momentum as collecting
and temporarily uses lifetime video velocity.

Run the deterministic extraction and scoring tests with:

```bash
npm test
```

## Screenshots

### Home Page
![Home Page](./public/HomePage.png)
*Landing page with hero section and features overview.*

### Dashboard
![Dashboard](./public/Dashboard.png)
*User dashboard showing welcome banner and feature list.*

### AI Content Generator
![AI Content Generator](./public/AiContentGenerator.png)
*Interface for generating video titles, descriptions, tags, and thumbnails.*

### AI Thumbnail Generator
![AI Thumbnail Generator](./public/AiThumbnailGenrator.png)
*Tool for creating custom thumbnails with AI, including upload previews and generated results.*

### Billing Page
![Billing Page](./public/Billing.png)
*Subscription plans with features and pricing.*

*(Note: Replace the screenshot paths with actual images from your project. You can add them to a `screenshots/` folder in the repo.)*

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Built with [Next.js](https://nextjs.org/)
- AI powered by [OpenRouter](https://openrouter.ai/) and [Cloudflare AI](https://developers.cloudflare.com/workers-ai/)
- Thanks to the open-source community for libraries like Shadcn UI and Drizzle ORM.

For any issues or questions, open an [issue](https://github.com/manavsaini124/youtube-content-generator/issues) on GitHub.
