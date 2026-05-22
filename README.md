# LapStore 💻 Workstation Catalog & Showcase

Welcome to **LapStore**, a premium, high-end catalog website inspired by the design languages of Apple, Razer, and ASUS ROG. 

This website serves as a luxury showroom for laptops, completely skipping the shopping cart and checkout mechanisms. Customers can search, browse, and compare detailed laptop specifications, and inquire about purchasing any machine with a single click that redirects them to **WhatsApp** with a pre-filled product inquiry message.

Admins can log in securely via **Google OAuth** to manage the catalog dynamically using a beautiful, interactive CMS console that supports real-time live previewing and direct image uploads to **Supabase Storage**.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS v4
* **Animations**: Framer Motion + CSS Neon Glow transitions
* **Icons**: Lucide React
* **Backend Database**: Supabase PostgreSQL
* **Authentication**: Supabase Auth (Google OAuth)
* **Image Hosting**: Supabase Storage Buckets
* **Hosting/Deployment**: Vercel & GitHub

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Variables
Duplicate `.env.example` to `.env` and fill in your Supabase project endpoints and WhatsApp number:
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The app will automatically run using high-fidelity **mock fallback data** so you can test all visual pages, searches, filters, uploader UI, and previews immediately, even before setting up Supabase!

---

## 💾 Supabase Backend Configuration (CRITICAL)

To wire up the live cloud database, log in to your [Supabase Dashboard](https://supabase.com) and follow these three steps:

### STEP 1: Execute SQL Schema
Navigate to the **SQL Editor** in your Supabase Project dashboard and run the following script to create the products catalog table, admin whitelist, and establish Row Level Security (RLS) constraints:

```sql
-- 1. Create the admins whitelist table
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'editor')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 2. Create the products catalog table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    laptop_model TEXT NOT NULL,
    processor TEXT NOT NULL,
    ram TEXT NOT NULL,
    storage TEXT NOT NULL,
    graphics TEXT NOT NULL,
    display TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ======================================================
-- STEP 2: Security Definer Function & Policies
-- ======================================================

-- Create a security definer function to check admin status without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = user_email
    );
END;
$$ LANGUAGE plpgsql;

-- Allow anyone to search and read products catalog
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT 
USING (true);

-- Allow authenticated users to perform CRUD only if their email is whitelisted in public.admins
CREATE POLICY "Allow admin write access to products" 
ON public.products FOR ALL 
USING (
    auth.uid() IS NOT NULL AND public.is_admin(auth.jwt()->>'email')
);

-- Allow whitelisted admins to select from admins list
CREATE POLICY "Allow admin read access to admins list" 
ON public.admins FOR SELECT 
USING (
    email = auth.jwt()->>'email' OR public.is_admin(auth.jwt()->>'email')
);

-- Allow super_admins to add/remove administrators
CREATE POLICY "Allow super_admin write access to admins list" 
ON public.admins FOR ALL 
USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE email = auth.jwt()->>'email' AND role = 'super_admin'
    )
);

-- ======================================================
-- STEP 3: Register Initial Admin Account
-- ======================================================
-- REPLACE this with your actual Google login email address to grant yourself initial access
INSERT INTO public.admins (email, role)
VALUES ('mx.ms.0120@gmail.com', 'super_admin');
```

---

### STEP 2: Setup Storage Bucket
1. Go to the **Storage** section in Supabase.
2. Click **Create Bucket**.
3. Name the bucket exactly: `laptop-images`.
4. Ensure the bucket toggle is set to **Public** (so product image URLs serve correctly).
5. Add the following **RLS Policies** for the `laptop-images` bucket:
   * **Select/Read Policy**: Allow public access (anyone can view images).
   * **Insert/Update/Delete Policy**: Allow authenticated users whose email exists in the `admins` table.

---

### STEP 3: Configure Google OAuth Auth Provider
1. Go to **Authentication** -> **Providers** -> **Google** in the Supabase Dashboard.
2. Toggle Google Auth **ON**.
3. Provide your Google OAuth Client ID and Secret (obtainable via [Google Cloud Console](https://console.cloud.google.com)).
4. Copy the **Redirect URI** provided by Supabase and save it in your Google Cloud OAuth Consent configurations.

---

## ⚡ WhatsApp Purchase Redirection

The "Inquire via WhatsApp" button on each laptop details page dynamically formats the query text so that customers can query sales in one click.

### Example Message:
```text
Hello, I want to buy this laptop:
*Product:* Razer Blade 16 (2026) - Ultimate Gaming Beast
*Price:* $4,199.99
*Link:* https://lapstore.vercel.app/product/razer-blade-16-rtx-4090
```

* **Target URI**: `https://wa.me/[NEXT_PUBLIC_WHATSAPP_NUMBER]?text=[encoded_text]`
* **Number Format**: Put the international dialing code without leading zeros, spaces, or plus symbols (e.g. `15550199` for US, `201012345678` for Egypt).

---

## ☁️ Deployment (GitHub & Vercel)

### Deploying to Vercel:
1. Push your workspace files to a new repository on your **GitHub** account.
2. Connect your GitHub account to **Vercel** ([vercel.com](https://vercel.com)).
3. Import the `LapStore` repository.
4. Add the following **Environment Variables** in the Vercel Project Settings:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_WHATSAPP_NUMBER`
   * `NEXT_PUBLIC_APP_URL` (Set this to your live production Vercel URL, e.g. `https://lapstore.vercel.app`)
5. Click **Deploy**. Vercel will automatically compile, optimize, and serve your premium showroom globally!
