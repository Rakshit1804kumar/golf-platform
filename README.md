# GolfGives — Full-Stack MERN Platform

> Golf Charity Subscription Platform built for the Digital Heroes trainee selection process.

---
## 🌐 Live Demo

🔗 Frontend: https://golf-platform-opal-nine.vercel.app/
## 🗂 Project Structure

```
golf-platform/
├── server/     Node.js + Express API
└── client/     React (Vite) frontend
```

---

## ⚡ Quick Setup (Step-by-Step)

### STEP 1 — Prerequisites

Install these if you don't have them:
- [Node.js 18+](https://nodejs.org)
- [Git](https://git-scm.com)

---

### STEP 2 — MongoDB Atlas (Database)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and **create a free account**
2. Click **"Build a Database"** → choose **M0 Free** → region: nearest to you
3. Create a username + password (save these!)
4. Under "Network Access" → click **"Add IP Address"** → **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. Go to **"Database"** → click **"Connect"** → **"Connect your application"**
6. Copy the connection string. It looks like:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Add your database name to it:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/golf-charity?retryWrites=true&w=majority
   ```

---

### STEP 3 — Stripe (Payments)

1. Go to [https://stripe.com](https://stripe.com) → create a **new account**
2. Stay in **Test mode** (toggle in top-left)
3. Go to **Developers → API Keys** → copy your `Publishable key` and `Secret key`
4. Go to **Products → Add product**:
   - Product name: `GolfGives Monthly`
   - Price: £9.99 / month (recurring)
   - Click **Save** → copy the **Price ID** (starts with `price_`)
5. Add another product:
   - `GolfGives Yearly` — £95.88 / year (recurring)
   - Copy that **Price ID** too
6. For webhooks (local dev):
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Run: `stripe listen --forward-to localhost:5000/api/subscriptions/webhook`
   - Copy the webhook signing secret printed (starts with `whsec_`)

---

### STEP 4 — Cloudinary (File Uploads)

1. Go to [https://cloudinary.com](https://cloudinary.com) → create a free account
2. From the dashboard copy:
   - Cloud name
   - API Key
   - API Secret

---

### STEP 5 — Gmail App Password (Emails)

1. In your Google account → Security → 2-Step Verification → App passwords
2. Generate a password for "Mail"
3. Copy the 16-character password

---

### STEP 6 — Configure Environment Variables

```bash
cd server
cp .env.example .env
```

Open `.env` and fill in all values from the steps above.

---

### STEP 7 — Install & Run

#### Terminal 1 — Backend
```bash
cd server
npm install
node seed.js       # ← seeds the database with test data
npm run dev        # ← starts server on port 5000
```

#### Terminal 2 — Frontend
```bash
cd client
npm install
npm run dev        # ← starts React on port 5173
```

Open: **http://localhost:5173**

---

## 🔑 Test Credentials (after seeding)

| Role  | Email                     | Password    |
|-------|---------------------------|-------------|
| Admin | admin@golfgives.com       | admin123    |
| User  | john@example.com          | password123 |
| User  | sarah@example.com         | password123 |

---

## 🚀 Deployment

### Deploy Backend → Railway

1. Go to [https://railway.app](https://railway.app) → create account → **New Project**
2. **"Deploy from GitHub repo"** → connect your repo → select the `server` folder
3. Add all environment variables from your `.env` in Railway's Variables tab
4. Update `CLIENT_URL` to your Vercel frontend URL (after frontend deploy)
5. Copy your Railway backend URL (e.g. `https://golf-charity-api.up.railway.app`)

### Deploy Frontend → Vercel

1. Go to [https://vercel.com](https://vercel.com) → create a **new account** (not personal)
2. **"Add New Project"** → import your GitHub repo → set **Root Directory** to `client`
3. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL
4. Update `vite.config.js` proxy OR update `api/axios.js` baseURL to Railway URL for production
5. Deploy!

### Update CORS

In `server/.env`, set:
```
CLIENT_URL=https://your-vercel-app.vercel.app
```
Redeploy the server.

### Stripe Webhook (Production)

1. In Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. URL: `https://your-railway-url.up.railway.app/api/subscriptions/webhook`
3. Events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`
4. Copy the new webhook secret → update `STRIPE_WEBHOOK_SECRET` in Railway

---

## ✅ PRD Checklist

- [x] User signup & login (JWT)
- [x] Subscription flow (monthly + yearly via Stripe)
- [x] Score entry — 5-score rolling logic
- [x] Draw system (random + algorithmic) with simulation
- [x] Charity selection and contribution calculation
- [x] Winner verification + proof upload (Cloudinary)
- [x] User Dashboard — all modules
- [x] Admin Panel — users, draws, charities, winners
- [x] Data accuracy across all modules
- [x] Responsive design (mobile-first Tailwind)
- [x] Error handling and edge cases
- [x] Stripe webhook lifecycle (renewal, cancellation, lapsed)
- [x] Prize pool: 40% jackpot / 35% 4-match / 25% 3-match
- [x] Jackpot rollover logic
- [x] Charity directory with search + featured section
- [x] Admin analytics dashboard
- [x] JWT auth with subscription guard middleware
- [x] Non-golf UI aesthetic (dark, luxury, charity-first)

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend     | Node.js, Express 4                  |
| Database    | MongoDB Atlas (Mongoose)            |
| Auth        | JWT + bcryptjs                      |
| Payments    | Stripe Subscriptions + Webhooks     |
| File upload | Cloudinary + Multer                 |
| Email       | Nodemailer (Gmail SMTP)             |
| Deploy      | Vercel (client) + Railway (server)  |

---

*Built by [Your Name] for Digital Heroes Full-Stack Trainee Selection — March 2026*
