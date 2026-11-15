# AI Resume Builder

A full-stack web app for creating, editing and sharing resumes, with AI-generated summary suggestions.

**Tech stack**

| Part | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, shadcn/ui |
| Authentication | Clerk |
| Backend / CMS | Strapi (REST API) |
| Database | SQLite for local development (PostgreSQL in production) |
| AI | Google Gemini API |

## Features

- Sign in and sign up with Clerk
- Create, edit and delete multiple resumes
- Sections: Personal Details, Summary, Professional Experience, Education, Skills
- AI-generated summary suggestions (Google Gemini)
- Theme colour picker with a live preview
- Download the resume as a PDF and share it

## Prerequisites

- **Node.js 20.9 or newer** (Node 20 or 22 LTS recommended). Check with `node -v`
- **npm** (comes with Node.js) and **Git**
- A free **Clerk** account, for the publishable key
- A free **Google AI Studio** account, for a Gemini API key

## Project structure

```
aiResumeBuilder/
├── ai_resume_admin/   # Strapi backend (CMS + REST API)
├── service/           # API clients: GlobalApi.js (Strapi) and AIModel.js (Gemini)
├── src/               # React frontend
├── public/            # Static assets
├── .env               # Frontend environment variables (you create this)
└── package.json       # Frontend dependencies and scripts
```

> The `my-react-router-app` folder, if present, is a separate experiment and is **not** part of this app.

You need to run **two servers**: the Strapi backend and the React frontend.

---

## Step 1: Get the code

```bash
git clone <your-repository-url>
cd aiResumeBuilder
```

---

## Step 2: Set up and run the backend (Strapi)

All commands in this step run inside the `ai_resume_admin` folder.

### 2.1 Install dependencies

```bash
cd ai_resume_admin
npm install
```

### 2.2 Create the environment file

macOS / Linux:

```bash
cp .env.example .env
```

Windows (PowerShell or Command Prompt):

```bash
copy .env.example .env
```

### 2.3 Generate secret keys

Strapi will not start without them. Run this command, which prints a full set of random values:

```bash
node -e "const c=require('crypto');const g=()=>c.randomBytes(16).toString('base64');console.log('APP_KEYS='+[g(),g(),g(),g()].join(','));console.log('API_TOKEN_SALT='+g());console.log('ADMIN_JWT_SECRET='+g());console.log('TRANSFER_TOKEN_SALT='+g());console.log('JWT_SECRET='+g());console.log('ENCRYPTION_KEY='+g())"
```

Open `ai_resume_admin/.env` and **replace** the matching lines with the printed ones. Rules:

- No quotes and no spaces around `=`
- `APP_KEYS` is a single line with four comma-separated values
- Leave `HOST`, `PORT` and the database lines as they are (the default is SQLite)
- If `ENCRYPTION_KEY` is not in the file, add it

### 2.4 Start Strapi in development mode

```bash
npm run develop
```

Wait until the terminal shows that the server has started. Use `develop`, not `start`, because the content-type editor only works in development mode.

### 2.5 Create the admin account

Open **http://localhost:1337/admin** and register the first administrator (any email and password). This is stored only in your local database.

### 2.6 Create an API token

1. In the Strapi admin go to **Settings → API Tokens → Create new API Token**
2. Name: `frontend`. Token duration: **Unlimited**
3. Token type: **Full access** (fine for local development). For a stricter setup, choose **Custom** and enable `find`, `findOne`, `create`, `update` and `delete` for **User-resume**
4. Click **Save** and **copy the token immediately**. Strapi shows it in full only once

### 2.7 Check the API (optional)

```bash
curl -i -H "Authorization: Bearer YOUR_TOKEN" http://localhost:1337/api/user-resumes
```

(On Windows PowerShell use `curl.exe` instead of `curl`.) `HTTP/1.1 200 OK` with `"data":[]` is the correct result for a fresh database.

The **User Resume** content type already ships with the project in `ai_resume_admin/src/api/user-resume/`, so you do not need to create any fields by hand.

---

## Step 3: Set up and run the frontend (React)

Open a **second terminal** in the project root (`aiResumeBuilder`, not `ai_resume_admin`).

### 3.1 Install dependencies

```bash
npm install
```

### 3.2 Create the environment file

Create a file named `.env` in the project root with:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_STRAPI_URL=http://localhost:1337
VITE_STRAPI_API_KEY=your_strapi_api_token_here
VITE_GOOGLE_AI_API_KEY=your_gemini_api_key_here
VITE_BASE_URL=http://localhost:5173
```

| Variable | Where to get it |
| --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | [Clerk dashboard](https://dashboard.clerk.com) → your application → **API keys** → Publishable key |
| `VITE_STRAPI_URL` | The Strapi address, `http://localhost:1337` locally |
| `VITE_STRAPI_API_KEY` | The token you created in step 2.6 |
| `VITE_GOOGLE_AI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) → **Create API key** |
| `VITE_BASE_URL` | The address of the frontend, `http://localhost:5173` locally |

No quotes and no spaces around `=`. **Vite reads `.env` only at startup**, so restart the dev server after any change.

### 3.3 Start the frontend

```bash
npm run dev
```

Open **http://localhost:5173**.

---

## Step 4: Try it

1. Sign up or sign in with Clerk
2. On the dashboard click the **+** card and create a resume
3. Fill in Personal Details, Summary, Experience, Education and Skills, saving each step
4. Change the colour from the **Theme** button
5. Click **Generate from AI** in the Summary step
6. Open the resume view page and try **Download** and **Share**

Both servers must be running at the same time:

| Terminal | Folder | Command | Address |
| --- | --- | --- | --- |
| 1 (backend) | `ai_resume_admin` | `npm run develop` | http://localhost:1337/admin |
| 2 (frontend) | project root | `npm run dev` | http://localhost:5173 |

---

## Troubleshooting

| Problem | Cause and fix |
| --- | --- |
| Blank page, console says `Missing Publishable Key` | `VITE_CLERK_PUBLISHABLE_KEY` is missing or misspelled in the root `.env`. Fix it and restart `npm run dev` |
| `'strapi' is not recognized` | Dependencies are not installed. Run `npm install` inside `ai_resume_admin` |
| `Middleware "strapi::session": App keys are required` | `APP_KEYS` is missing or empty in `ai_resume_admin/.env` |
| `ERR_CONNECTION_REFUSED` on `localhost:1337` | The backend is not running. Start it with `npm run develop` |
| `401 Unauthorized` when creating or loading resumes | The Strapi token is missing, wrong or cut off. Check `VITE_STRAPI_API_KEY`, then restart the frontend |
| `403 Forbidden` | The token does not have permission for **User-resume**. Create a token with Full access, or enable the actions for that content type |
| `400 Bad Request` with `Invalid key ...` | The field does not exist in the Strapi content type. Check `ai_resume_admin/src/api/user-resume/content-types/user-resume/schema.json` |
| The theme colour does not stick | The `themeColor` field must exist in the schema file above, and Strapi must have restarted after the change |
| AI generation fails | Open the browser console. A `404` means the Gemini model name in `service/AIModel.js` has been retired, so use a current one such as `gemini-flash-latest`. A `400` or `403` means a bad API key |
| Strapi's survey page does nothing, `ERR_BLOCKED_BY_CLIENT` for `analytics.strapi.io` | An ad blocker (for example Brave Shields) is blocking Strapi's usage tracking. Open `http://localhost:1337/admin` directly, pause the blocker for localhost, or add `STRAPI_TELEMETRY_DISABLED=true` to `ai_resume_admin/.env` |
| Page is blank after a `.env` change | Stop and restart `npm run dev` |

## Useful commands

**Frontend (project root)**

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist` |
| `npm run preview` | Preview the production build locally |

**Backend (`ai_resume_admin`)**

| Command | Purpose |
| --- | --- |
| `npm run develop` | Start Strapi with auto-reload (use this locally) |
| `npm run build` | Build the Strapi admin panel |
| `npm start` | Start Strapi in production mode |

## Security notes

- Never commit `.env` files. Both `.env` files must be listed in `.gitignore`
- Every variable starting with `VITE_` is bundled into the browser code, so anyone using the site can read it. Use an API token with limited permissions, and restrict the Gemini key to your domain in the Google console before deploying publicly
- Generate new secrets for production. Do not reuse the local ones