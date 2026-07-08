# 📂 Track Vault: Complete Revision & Interview Preparation Guide

Welcome to the master revision guide for **Track Vault**. This document serves as a comprehensive, structured self-study and revision resource for web development interviews. It covers the project's architecture, flow, files, tech stack, database schema, design decisions, security vulnerabilities, and detailed model answers to potential interview questions.

---

## 1. Project Overview

### What Project Track Vault Does (Plain Language)
**Track Vault** is a secure, self-destructing file-sharing application. It allows users to upload files of various formats (images, PDFs, text, etc.) to a private cloud bucket, set custom access control rules (such as expiration dates, download/view limits, or passwords), and track file-access statistics (total views, total downloads, and last accessed timestamp) in real-time. 

### What Problem It Solves, and For Whom
Traditional cloud sharing services (like Google Drive, Dropbox, or WeTransfer) suffer from **poor post-sharing control**. Once a link is shared:
1. **Access Cannot Be Dynamic**: It is difficult to restrict a file to exactly one download or a few views.
2. **Self-Destruction is Lacking**: Files linger in the cloud indefinitely unless manually deleted.
3. **No Granular Real-Time Auditing**: Tracking exact views/downloads without enterprise-level logs is impossible.
4. **Security vs Convenience**: Locking links behind shared organizational logins forces recipients to register accounts.

**Track Vault** solves these problems for **privacy-conscious individuals, freelancers, and businesses** sharing sensitive information (e.g., contracts, financial statements, or temporary draft designs). It ensures files are automatically destroyed from both the database and physical cloud storage when criteria are met, without requiring the recipient to create an account.

### What Makes This Project Non-Trivial
Unlike a basic "File Upload" tutorial, Track Vault implements several complex, real-world engineering concepts:
1. **Multi-Tier Storage Separation**: Rather than storing heavy binary files in a relational database or tracking fast-changing analytics counters in SQL, Track Vault splits storage:
   - **AWS S3** handles high-durability binary blob storage.
   - **Supabase PostgreSQL** manages structured relational metadata (rules, ownerships, file keys).
   - **Upstash Redis** processes high-throughput, transient, atomic analytics writes (views, downloads).
2. **Dynamic Self-Destruct Deletion Pipeline**: It features an automatic deletion cascade (`src/app/api/deletepipeline/route.js`) that physically purges S3 objects and marks metadata inactive in the DB. This is triggered dynamically in real-time by a recipient's access checks on the server during page rendering.
3. **Hybrid Routing Model**: The application merges the Next.js **App Router** (for authenticated, layout-heavy dashboards: `/dashboard`, `/uploadedfiles`) with the **Pages Router** (for dynamic, Server-Side Rendered (SSR) public share gateways: `/public/[id]`), exploiting the specific benefits of both paradigms.

---

## 2. Tech Stack Summary

The following table summarizes the dependencies declared in [package.json](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/package.json):

| Technology/Library | Version | Why It Was Chosen (Based on Code Implementation) |
| :--- | :--- | :--- |
| **Next.js** | `15.4.7` | Provides the foundational hybrid routing (App + Pages Router) and handles server-side execution (`getServerSideProps`) for live security checks. |
| **React** | `19.1.0` | UI library used to build interactive layouts, client-side state hooks (`useState`), and handle hydration. |
| **Kinde Auth** | `^2.8.6` | Managed OAuth 2.0 / OIDC provider used for secure uploader sessions, verified via JWT cookies on the server (`getKindeServerSession`) and client hooks (`useKindeAuth`). |
| **Supabase JS** | `^2.55.0` | Client library for PostgreSQL. Used to persist file rules and uploader accounts, running SQL operations like `insert`, `upsert`, and `update`. |
| **Upstash Redis** | `^1.35.3` | Serverless HTTP-based Redis client. Used for lightning-fast atomic operations (`incr`) on view/download metrics, avoiding DB locks. |
| **AWS S3 Client** | `^3.873.0` | Official AWS SDK v3 client used to upload (`PutObjectCommand`) and delete (`DeleteObjectCommand`) file binaries from the S3 bucket. |
| **Axios** | `^1.11.0` | Client-side HTTP wrapper configured globally with a fallback API base URL and `withCredentials: true` to forward session cookies to API handlers. |
| **Lucide React** | `^0.540.0` | Vector icon library used for responsive, type-specific file-card icons. |
| **Tailwind CSS / PostCSS**| `^4.1.12` | Styling system used for rapid, utility-first layout composition. |
| **Radix UI Primitives** | Various | Headless accessible primitives (Tabs, Checkbox, Dropdown-Menu, Avatar) used to construct standard UI components. |
| **Sonner** | `^2.0.7` | Lightweight toast notification engine used to dispatch asynchronous state confirmations (e.g., "Link copied", "File uploaded"). |
| **Bcrypt / Bcryptjs** *(Dangling)* | `^6.0.0` | Declared and imported in `/api/file/route.js` (lines 6, 38) but commented out. It represents a planned but unimplemented feature for password hashing. |
| **TSParticles** *(Dangling)* | `^3.9.1` | Installed dependency for firefly particles, but not referenced or used in any source files under `/src`. |

---

## 3. Project Structure Walkthrough

### Folder and File Tree
```
track-vault/
├── src/
│   ├── app/                      # Next.js App Router (Authenticated Dashboard & APIs)
│   │   ├── about/                # Static "About" page (SSG)
│   │   │   └── page.jsx          # Static marketing/informational content
│   │   ├── api/                  # Next.js Route Handlers (Backend API endpoints)
│   │   │   ├── analytics/
│   │   │   │   ├── get/          # GET: Polls Redis analytics (views, downloads, lastAccess)
│   │   │   │   │   └── route.js
│   │   │   │   ├── set/          # POST: Updates file metadata rules in Supabase
│   │   │   │   │   └── route.js
│   │   │   │   └── track/        # POST: Atomically increments view/download metrics in Redis
│   │   │   │       └── route.js
│   │   │   ├── auth/             # Wildcard endpoint routing Kinde Auth callbacks
│   │   │   │   └── [kindeAuth]/
│   │   │   │       └── route.js
│   │   │   ├── deletepipeline/   # DELETE: Triggers S3 deletion & sets is_active = false in DB
│   │   │   │   └── route.js
│   │   │   ├── file/             # POST: Handles S3 upload & DB insert; DELETE: Removes file
│   │   │   │   └── route.js
│   │   │   └── register/         # POST: Synchronizes authenticated Kinde user with DB users table
│   │   │       └── route.js
│   │   ├── dashboard/            # Uploader workspace (Client Component)
│   │   │   └── page.jsx          # File upload area, calls API and triggers user registration sync
│   │   ├── uploadedfiles/        # User's file vault management panel
│   │   │   ├── [id]/             # Dynamic route for file analytics (ISR: revalidate = 10)
│   │   │   │   └── page.jsx      # Consolidates Preview, Analytics, and Editanalytics components
│   │   │   └── page.jsx          # Displays user's active/inactive files (Dynamic server component)
│   │   ├── layout.jsx            # Global Next.js App Router layout wrapping Providers & styling
│   │   └── page.jsx              # Landing page (Welcome screen, Features, Login links)
│   ├── pages/                    # Next.js Pages Router (Public Dynamic File Sharing)
│   │   └── public/
│   │       └── [id].jsx          # Dynamic public sharing gateway (SSR: getServerSideProps)
│   ├── components/               # Reusable UI & Layout Components
│   │   ├── analyticsContol/      # Components for file monitoring & control
│   │   │   ├── Analytics.jsx     # Live analytical cards with 5s short-polling interval
│   │   │   ├── Editanalytics.jsx # Form updating access rules (password, limits, expiry)
│   │   │   └── Preview.jsx       # Custom iframe/image viewer based on MIME type
│   │   ├── filecard/             # Card representations of user assets
│   │   │   ├── Filecard.jsx      # Handles active file representation (image preview or icon helper)
│   │   │   ├── InactiveFileCard.jsx # Renders inactive files with historical Redis stats (SSR)
│   │   │   └── Options.jsx       # Quick controls: Copy URL, Download, Delete, and Edit link
│   │   ├── ui/                   # Shadcn UI primitives
│   │   ├── Footer.jsx            # Static bottom layout
│   │   ├── Navbar.jsx            # Top layout displaying user profile and Kinde Auth toggles
│   │   └── Provider.jsx          # Client-side Kinde Auth wrapper
│   ├── lib/                      # Core initialization and configuration clients
│   │   ├── axios.js              # Custom Axios instance pointing to base API url
│   │   ├── redis.js              # Instantiates Upstash Serverless Redis client
│   │   ├── s3.js                 # Instantiates AWS SDK v3 S3 client
│   │   ├── supabase.js           # Instantiates Supabase Postgres client
│   │   └── utils.js              # Tailwind class merging utility (clsx + tailwind-merge)
│   └── styles/
│       └── globals.css           # Tailwind v4 directives and animations
├── package.json                  # Dependencies, scripts, and build metadata
└── README.md                     # Core project instructions
```

### Major Directory Responsibilities
- **`src/app/`**: Next.js App Router root. Handles static rendering (e.g. `about/page.jsx`), authenticated dashboard modules (`dashboard/page.jsx` & `uploadedfiles/page.jsx`), and backend API endpoint routes (`/api/...`).
- **`src/pages/`**: Next.js Pages Router root. Reserved strictly for public-facing, dynamic pages requiring Server-Side Rendering (`getServerSideProps`) like `public/[id].jsx` to validate access parameters on every request.
- **`src/components/`**: House of React components. Subdivided into generic layout blocks (Navbar, Footer), Shadcn primitive components (`ui/`), and specific features (`filecard/` for dashboard cards, `analyticsContol/` for monitoring).
- **`src/lib/`**: SDK configurations. Isolates environment variables and clients (AWS S3, Supabase, Upstash Redis, Axios) to promote singletons and prevent connection bloat during Next.js hot reloads.

---

### Step-by-Step Data and Request Flows

#### 1. Authentication and Registration Sync Flow
```
[User Clicks "Get Started"] ──> Triggers Kinde OAuth Login Redirect ──> User Authenticates on Kinde Server
                                                                                  │
                                                                                  ▼
[App /dashboard loads] <── Kinde returns encrypted session cookies <── Redirects back to Application
         │
         ├──> useKindeAuth() hook parses user credentials in client state
         │
         └──> useEffect triggers client POST request to /api/register
                                   │
                                   ▼
                       [Route Handler: /api/register]
                                   │
                                   ├──> getKindeServerSession() reads cookies, extracts user ID and email
                                   │
                                   ├──> supabase.from("users").upsert(...) locks record in database
                                   │
                                   └──> Returns JSON response indicating registration sync success
```

#### 2. Secure File Upload Pipeline Flow
```
[dashboard/page.jsx] ──> User drops file ──> handleFileSubmit() triggers
                                                    │
                                                    ▼
Client creates FormData object ──> Appends file binary, user.id, and file.name
                                                    │
                                                    ▼
Sends POST request to /api/file ──> Parsed by Next.js via req.formData()
                                                    │
                                                    ▼
Generates random S3 Key: `${uuidv4()}.${extension}` ──> arrayBuffer() reads file binary
                                                    │
                                                    ▼
Converts ArrayBuffer to Node.js Buffer ──> Invokes s3.send(new PutObjectCommand(...))
                                                    │
                                                    ▼
Upload completes ──> Inserts file metadata row into Supabase Postgres 'files' table
                                                    │
                                                    ▼
Supabase returns record ──> Route handler responds with status 200 and file metadata
```

#### 3. Shared Access Verification and Download Tracking Flow
```
[User visits /public/[id]] ──> Server executes getServerSideProps(params.id)
                                                    │
                                                    ▼
Queries Supabase 'files' table for record matching ID ──> If null, return 404
                                                    │
                                                    ▼
Validates Expiry: Is current time > expires_at? 
      ├──> Yes: If delete_on_expire is active, calls deletepipeline (DELETE S3 + mark inactive in DB) -> return expired: true
      └──> No: Proceed to Redis updates
                                                    │
                                                    ▼
Atomically increments view counter: redis.incr(file:id:views)
Updates last access timestamp: redis.set(file:id:lastAccess, Date.now())
                                                    │
                                                    ▼
Validates Limit: Is current views > max_views?
      ├──> Yes: If delete_on_limit is active, calls deletepipeline -> return expired: true
      └──> No: Returns props: { fileMeta } to page component
                                                    │
                                                    ▼
[Client Page Renders]
      ├──> If file.file_password exists, prompts for password input
      │     └──> Client compares password against file.file_password ( Plaintext security flaw! )
      └──> If unlocked, renders file preview (image / iframe PDF) and "Download File" button
                                                    │
                                                    ▼
[User Clicks "Download"] ──> handleDownload() triggers
                                                    │
                                                    ▼
POSTs to /api/analytics/track ──> Increments redis.incr(file:id:downloads) and updates lastAccess
                                                    │
                                                    ▼
Client fetches file from S3 URL ──> Converts response to Blob ──> Triggers programatic browser download
```

---

## 4. Concept-by-Concept Deep Dive

### 1. OAuth 2.0 & OpenID Connect (OIDC) via Kinde Auth
* **What it is**: OAuth 2.0 is an authorization framework that enables third-party applications to obtain limited access to user accounts on an HTTP service. OpenID Connect (OIDC) is an identity layer built on top of OAuth 2.0, adding user profile info (name, email, profile picture) using JSON Web Tokens (JWTs).
* **How it's implemented here**:
  - Auth setup resides in [src/components/Provider.jsx](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/components/Provider.jsx#L5-L15) where `KindeProvider` configures client details.
  - Wildcard route [src/app/api/auth/[kindeAuth]/route.js](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/app/api/auth/%5BkindeAuth%5D/route.js#L1-L3) acts as the redirect URI endpoint, handling authentication callbacks automatically.
  - Server validation uses `getKindeServerSession()` in [src/app/api/register/route.js](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/app/api/register/route.js#L6) and client hooks use `useKindeAuth()` in [src/app/dashboard/page.jsx](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/app/dashboard/page.jsx#L20).
* **Why it was needed**: Without an identity provider, Track Vault would have to store passwords, hash them, handle password resets, manage sessions, and handle cookie expiration. Utilizing Kinde delegates security compliance (e.g. MFA, session theft prevention) to an external service.
* **Common Interview Questions**:
  1. *Q: What is the difference between OAuth 2.0 and OIDC?*  
     *A*: OAuth 2.0 handles authorization (obtaining access tokens). OIDC is built on top of OAuth 2.0 to handle authentication (providing an identity token like a JWT to verify who the user is).
  2. *Q: How does the application verify that a user is authenticated in a Next.js Server Component?*  
     *A*: By invoking `getKindeServerSession()` from `@kinde-oss/kinde-auth-nextjs/server`. This method reads and verifies the encrypted session cookies containing JWTs sent by the browser.
  3. *Q: How do we sync user identities from Kinde Auth to our own database?*  
     *A*: In `dashboard/page.jsx`, a `useEffect` triggers a POST request to `/api/register` when the `user` object is populated. The route handler extracts the server-side session and performs an `upsert` on conflict with the user's email inside the Supabase `users` table.
* **Trade-offs / Alternatives**:
  - *Alternative*: Clerk, Supabase Auth, or next-auth (Auth.js).
  - *Comparison*: Next-auth is self-hosted and gives full database control, but requires complex database adapter configurations. Clerk and Kinde are hosted SAAS providers with low setup friction but introduce a dependency on external APIs. Kinde was chosen for its clean, seamless Next.js SDK.

---

### 2. Next.js Routing Architecture (App Router vs Pages Router)
* **What it is**: Next.js 15 supports two routing systems. The **App Router** (`/src/app`) uses React Server Components (RSC) by default, facilitating layouts, loading boundaries, and server-first components. The **Pages Router** (`/src/pages`) is the older, page-centric system that relies on page-level data-fetching functions like `getServerSideProps` for SSR.
* **How it's implemented here**:
  - The authenticated dashboard, layout, and API routes reside in the App Router: `/src/app/dashboard/page.jsx`, `/src/app/uploadedfiles/page.jsx`, and `/src/app/api/file/route.js`.
  - The public file access portal is implemented using the Pages Router in [src/pages/public/[id].jsx](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/pages/public/%5Bid%5D.jsx#L197).
* **Why it was needed**: The developer needed page-level SSR with `getServerSideProps` to validate passwords and check download ceilings on *every* request. In the App Router, this requires custom middleware or server actions, whereas the Pages Router handles this page-level interception cleanly.
* **Common Interview Questions**:
  1. *Q: Why did you mix both the App Router and Pages Router in this project?*  
     *A*: The App Router was selected to leverage React Server Components and nested layouts for the uploader's dashboard. The Pages Router was selected specifically for the public file-sharing route because `getServerSideProps` provides a simple, well-defined Server-Side Rendering lifecycle to intercept requests, check limits, write to Redis, and handle redirects.
  2. *Q: Can a single Next.js project run both routers concurrently?*  
     *A*: Yes. Next.js natively supports co-existence. App Router paths take precedence over Pages Router paths if there is a naming collision.
  3. *Q: How would you migrate the Pages Router route (`/public/[id].jsx`) to the App Router?*  
     *A*: I would create `src/app/public/[id]/page.jsx`. I would make it a dynamic Server Component, read the route parameters directly from the component props (`async ({ params })`), perform the Supabase and Redis checks inside the component body, and use `redirect()` or `notFound()` from `next/navigation` to handle expired states.
* **Trade-offs / Alternatives**:
  - *Trade-offs*: Mixing routers is generally considered an architectural anti-pattern. It duplicates bundle sizes (loading both router runtimes), fragments folder structures, and complicates global layouts, as styles from `src/styles/globals.css` must be manually imported in Pages Router files (`import "@/styles/globals.css"`).

---

### 3. Ephemeral Cache & Counter Management via Upstash Redis
* **What it is**: Redis (Remote Dictionary Server) is an in-memory key-value data store. Upstash Redis provides a serverless Redis database accessible over a REST API (using HTTP instead of persistent TCP sockets).
* **How it's implemented here**:
  - Initialized in [src/lib/redis.js](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/lib/redis.js#L3).
  - Used in `/api/analytics/track/route.js` (lines 10, 13) and `/pages/public/[id].jsx` (lines 219, 220) to track views and downloads:
    ```javascript
    const views = await redis.incr(`file:${id}:views`);
    await redis.set(`file:${id}:lastAccess`, Date.now());
    ```
* **Why it was needed**: Storing analytical counters in PostgreSQL would require updating a database row (`UPDATE files SET views = views + 1`) on every page load. This causes **write amplification** and transaction locks on the `files` table under high traffic. Offloading counters to an in-memory Redis instance with O(1) atomic increments ensures fast tracking and protects the primary DB.
* **Common Interview Questions**:
  1. *Q: Why choose Upstash Redis over a local Dockerized Redis instance?*  
     *A*: Upstash Redis exposes a REST API over HTTP. Traditional Redis clients keep persistent TCP connections open, which can exhaust connection pools in stateless serverless environments. Upstash handles connection pooling internally, making it ideal for Serverless Route Handlers.
  2. *Q: What is an atomic operation, and how does `redis.incr` prevent race conditions?*  
     *A*: An atomic operation is one that runs completely or not at all. Because Redis is single-threaded, it processes incoming commands sequentially. If two requests increment a counter concurrently, Redis serializes them, ensuring the counter is incremented by exactly 2. In a relational database, concurrent reads/writes can overwrite each other, causing a race condition.
  3. *Q: How do we synchronize Redis data back to Supabase?*  
     *A*: Currently, we do not sync it back. Supabase stores the configuration rules, and Redis acts as the source of truth for the transient analytics. To sync them, we could run a cron job to batch-write counts to PostgreSQL, or write to PostgreSQL during the self-destruct delete pipeline.
* **Trade-offs / Alternatives**:
  - *Alternative*: Node-cache (in-memory variable), or directly updating PostgreSQL.
  - *Comparison*: Node-cache is local to the server process, so it cannot sync counts across multiple EC2 instances. PostgreSQL updates are persistent but slow and prone to lock contention. Redis is the industry standard for shared, high-throughput counters.

---

### 4. Relational Database Design (Supabase Postgres)
* **What it is**: PostgreSQL is an open-source object-relational database. Supabase hosts PostgreSQL and provides a RESTful client SDK that maps database operations directly to JavaScript methods.
* **How it's implemented here**:
  - Configured in [src/lib/supabase.js](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/lib/supabase.js#L3).
  - Queries are written using the Supabase client wrapper, such as retrieving a file metadata row in [src/pages/public/[id].jsx](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/pages/public/%5Bid%5D.jsx#L200-L204):
    ```javascript
    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .single();
    ```
* **Why it was needed**: Next.js requires a persistent, relational database to store file ownerships, passwords, and file access settings. Supabase provides PostgreSQL tables with foreign key constraints, guaranteeing data integrity between `users` and `files`.
* **Common Interview Questions**:
  1. *Q: Why use UUIDs for file IDs instead of auto-incrementing integers?*  
     *A*: Auto-incrementing IDs (e.g. `/public/1`, `/public/2`) are guessable. Attackers could scan public URLs sequentially to scrape files. UUIDs are globally unique and practically unguessable, securing public sharing links.
  2. *Q: How is the relation between the `users` and `files` tables defined in this project?*  
     *A*: The `files` table contains a foreign key `user_id` which references the `auth_user_id` (Kinde ID) in the `users` table. This establishes a **one-to-many relationship**, where one user can own many files.
  3. *Q: What SQL normalization rules does this database layout satisfy?*  
     *A*: It satisfies the Third Normal Form (3NF). Entities (`users` and `files`) are split into separate tables, primary keys uniquely identify each row, and there are no transitive dependencies.
* **Trade-offs / Alternatives**:
  - *Alternative*: MongoDB (NoSQL) or Prisma ORM.
  - *Comparison*: MongoDB lacks strict relational foreign key constraints out-of-the-box. Prisma is an ORM wrapper that requires an extra compilation step. Using the direct Supabase SDK avoids extra dependencies and provides real-time subscription capabilities if needed.

---

### 5. Object Storage (AWS S3) & Buffer-Based Uploads
* **What it is**: Amazon Simple Storage Service (S3) is an object storage service designed for storing and retrieving flat files. Rather than keeping files in a local file system, S3 stores them as objects in virtual buckets, accessible over HTTP.
* **How it's implemented here**:
  - Configured in [src/lib/s3.js](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/lib/s3.js#L4) using `@aws-sdk/client-s3`.
  - In [src/app/api/file/route.js](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/app/api/file/route.js#L24-L34), uploads are processed by reading the request stream into an ArrayBuffer, converting it to a Node.js Buffer, and sending it to S3:
    ```javascript
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );
    ```
* **Why it was needed**: Web servers are stateless and have limited disk space. Files uploaded to a server's local storage would disappear when the server restarts or scales. AWS S3 provides highly durable, permanent object storage that offloads file serving bandwidth from the application servers.
* **Common Interview Questions**:
  1. *Q: What is a major performance bottleneck of the current file upload implementation?*  
     *A*: Inside `api/file/route.js`, the code uses `await file.arrayBuffer()` to read the entire file into server memory as a buffer. If a user uploads a large file (e.g. 500MB), the serverless function will run out of memory (OOM) and crash the execution container.
  2. *Q: How would you optimize the upload process to handle large files (e.g., >1GB)?*  
     *A*: By generating **S3 Presigned Post/PUT URLs**. Instead of uploading the file to the Next.js server, the client requests a temporary upload URL from S3 via an API endpoint. The client then uploads the file binary directly from the browser to AWS S3, bypassing the Next.js server entirely.
  3. *Q: How do we delete an object from S3 when a file is deleted?*  
     *A*: We call `s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: fileMeta.file_key }))` using the unique file key stored in our database.
* **Trade-offs / Alternatives**:
  - *Alternative*: Supabase Storage.
  - *Comparison*: Supabase Storage is a wrapper around S3. Using AWS S3 directly is cloud-native, cheaper at scale, and provides fine-grained IAM configuration for bucket security.

---

### 6. Client-Side Short Polling vs. Real-Time Alternatives
* **What it is**: Short polling is a client-side strategy where the browser repeatedly sends HTTP requests to the server at fixed intervals to fetch updated data.
* **How it's implemented here**:
  - Implemented in [src/components/analyticsContol/Analytics.jsx](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/components/analyticsContol/Analytics.jsx#L20-L27) using `setInterval`:
    ```javascript
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/analytics/get?id=${file.id}`);
        setData(res.data);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);
    ```
* **Why it was needed**: The dashboard needs to show real-time views and downloads as they occur. Short polling is a simple way to fetch these updates without keeping persistent connections open.
* **Common Interview Questions**:
  1. *Q: What are the drawbacks of short polling every 5 seconds?*  
     *A*: It generates significant HTTP header overhead, consumes client bandwidth, and creates redundant load on the server (even when the data has not changed). It also introduces up to a 5-second delay before analytics updates are visible on the dashboard.
  2. *Q: How does Long Polling differ from Short Polling?*  
     *A*: In short polling, the server responds immediately (even if there is no new data). In long polling, the server holds the request open until a data update occurs or a timeout is reached, which reduces redundant network requests.
  3. *Q: What is a more scalable real-time alternative to polling?*  
     *A*: **Server-Sent Events (SSE)** or **WebSockets**. SSE establishes a persistent, unidirectional HTTP connection where the server pushes updates to the client as they happen. WebSockets provide a bidirectional TCP connection, which is ideal for real-time applications but requires managing socket connections.
* **Trade-offs / Alternatives**:
  - *Comparison*: Short polling is easy to implement and fits stateless serverless architectures because it uses standard HTTP requests. WebSockets require dedicated server resources to maintain persistent connections, which is difficult to manage on serverless platforms like Vercel without a third-party gateway (e.g., Socket.io server).

---

### 7. Next.js Page Generation & Rendering Strategies
* **What it is**: Next.js supports four rendering strategies:
  - **Server-Side Rendering (SSR)**: The HTML is generated on the server for *every* request.
  - **Incremental Static Regeneration (ISR)**: The page is built statically once but regenerated in the background after a set revalidation interval.
  - **Dynamic Rendering**: Pages are rendered on the server at request time if they use dynamic methods (e.g., cookies or headers).
  - **Static Site Generation (SSG)**: The HTML is built once at build time and cached.
* **How it's implemented here**:
  - **SSR**: Used on the public sharing page `/pages/public/[id].jsx` via `getServerSideProps` to run access checks on every request.
  - **ISR**: Used on the analytics page `/src/app/uploadedfiles/[id]/page.jsx` using `export const revalidate = 10` (line 13) to cache the owner's analytics dashboard for 10 seconds.
  - **Dynamic Rendering**: Enforced on `/src/app/uploadedfiles/page.jsx` using `export const dynamic = "force-dynamic"` (line 10) to render the list of uploaded files dynamically for each logged-in user.
  - **SSG**: Used on `/about/page.jsx`, which compiles to static HTML at build time.
* **Why it was needed**: Public access control requires immediate, request-time evaluation to block unauthorized users or expired links. Dashboard analytics are less critical and can be cached for 10 seconds using ISR to reduce database load.
* **Common Interview Questions**:
  1. *Q: Why use SSR for the public sharing page instead of ISR?*  
     *A*: ISR caches pages on the CDN. If we used ISR for `/public/[id]`, an expired or password-locked file page might still be served from the cache to public users. SSR ensures that every page load executes our validation rules against the database and Redis in real-time.
  2. *Q: What happens during the 10-second revalidation period of an ISR page?*  
     *A*: Users are served the cached static page instantly. When a request comes in after the 10-second window, Next.js serves the cached page but triggers a background regeneration. Once the new page is built, the CDN cache is updated.
  3. *Q: How does `force-dynamic` work in Next.js?*  
     *A*: It bypasses static export optimization during build time, forcing Next.js to render the page on the server at request time. This is necessary when reading dynamic user sessions from cookies or headers.
* **Trade-offs / Alternatives**:
  - SSR has higher initial page load latency (TTFB) compared to ISR/SSG, but it guarantees up-to-date, secure content delivery.

---

### 8. API Design, CORS, and HTTP Lifecycle
* **What it is**: Cross-Origin Resource Sharing (CORS) is a browser security mechanism that restricts web pages from making requests to a different domain than the one that served the web page.
* **How it's implemented here**:
  - The custom Axios instance in [src/lib/axios.js](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/lib/axios.js#L3-L6) is configured with a base URL and credentials:
    ```javascript
    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
      withCredentials: true,
    });
    ```
* **Why it was needed**: Setting `withCredentials: true` is necessary to ensure the browser forwards authentication cookies (such as Kinde session tokens) along with API requests.
* **Common Interview Questions**:
  1. *Q: What is CORS, and why does the browser enforce it?*  
     *A*: CORS is a browser security mechanism that prevents malicious scripts on one website from making unauthorized API requests to another domain. Browsers enforce it by sending an HTTP preflight request (`OPTIONS`) to verify that the target domain permits cross-origin requests.
  2. *Q: Why is `withCredentials: true` required in our Axios configuration?*  
     *A*: By default, browsers do not send credentials (like cookies or authorization headers) with cross-origin requests. Setting `withCredentials: true` forces Axios to include these cookies, allowing our API endpoints to authenticate requests.
  3. *Q: How does the HTTP Preflight request work?*  
     *A*: The browser sends an `OPTIONS` request to the API endpoint with headers like `Access-Control-Request-Method`. The server responds with `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials` to confirm the request is allowed.
* **Trade-offs / Alternatives**:
  - If the frontend and backend are hosted on the same domain, CORS preflight checks are bypassed, which improves API latency.

---

### 9. Security Vulnerabilities and Code Critiques

During code review, three security vulnerabilities were identified in the codebase:

#### 🚨 Vulnerability 1: Plaintext Password Exposure on the Client
* **The Flaw**: When a user locks a file with a password, the plaintext password is stored in the `file_password` database column. In [src/pages/public/[id].jsx](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/pages/public/%5Bid%5D.jsx#L236), `getServerSideProps` fetches the file record using `.select("*")` and returns the entire object—including the plaintext password—to the client as a page prop:
  ```javascript
  return { props: { fileMeta: file } };
  ```
  The React component then performs a client-side check to verify the password:
  ```javascript
  if (password === file.file_password) { ... }
  ```
* **The Exploit**: The plaintext password is sent to the client browser before they enter it. Anyone can open the browser devtools, view the Next.js `__NEXT_DATA__` script tag, or check the React props to find the password and unlock the file.
* **The Fix**: 
  1. **Do not send the password to the client**: In `getServerSideProps`, remove the password field from the metadata object and send a boolean indicator instead:
     ```javascript
     const fileMeta = { ...file, password_required: !!file.file_password };
     delete fileMeta.file_password;
     ```
  2. **Server-Side Validation**: Create an API endpoint (e.g. `/api/file/unlock`) that accepts the file ID and the user's password. The server hashes and compares the password, and if correct, returns a temporary signed session cookie or token that authorizes the file download.

#### 🚨 Vulnerability 2: Insecure Direct Object Reference (IDOR) on Deletion Routes
* **The Flaw**: The delete routes in [src/app/api/file/route.js](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/app/api/file/route.js#L66) and [src/app/api/deletepipeline/route.js](file:///c:/Users/sumed/code/web%20dev/projects/track-vault/src/app/api/deletepipeline/route.js#L10) are unauthenticated. They do not verify if the requesting user owns the file.
* **The Exploit**: Anyone can send an HTTP DELETE request to `/api/file` or `/api/deletepipeline` containing another user's `file_id` to delete their files from S3 and Supabase.
* **The Fix**: Retrieve the uploader's session inside the delete handlers using `getKindeServerSession()` and verify that the file's `user_id` matches the authenticated user's ID before performing the deletion:
  ```javascript
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  // Query DB to verify: file.user_id === user.id
  ```

#### 🚨 Vulnerability 3: Memory Exhaustion via Buffer Uploads
* **The Flaw**: Inside `/api/file/route.js`, files are read into memory using `await file.arrayBuffer()` and converted into a Buffer.
* **The Exploit**: Large concurrent file uploads can easily exhaust the server's memory, leading to Out of Memory (OOM) crashes and service downtime.
* **The Fix**: Stream the upload payload directly to S3 or generate S3 Presigned URLs so the client uploads the file directly to S3 from the browser, bypassing the application server.

---

## 5. Key Logic: Access Check and Self-Destruct Cascade

The core feature of Track Vault is the **Access Verification and Self-Destruct Deletion Pipeline**. It evaluates access criteria in real-time and triggers physical file deletion if limits are exceeded.

### Conceptual Flowchart
```
                [ Public Request to /public/[id] ]
                                │
                                ▼
                   [ Query Supabase for Metadata ]
                                │
                                ▼
                  { Is expires_at <= Date.now()? }
                     ├── Yes ──> [ Check delete_on_expire ]
                     │                 ├── Yes ──> [ Trigger Delete Pipeline ] ──> [ Return Expired UI ]
                     │                 └── No  ──> [ Return Expired UI ]
                     └── No  ──> [ Proceed to Redis Counters ]
                                │
                                ▼
            [ Atomic Increment: views = redis.incr() ]
            [ Set timestamp: redis.set(lastAccess) ]
                                │
                                ▼
                    { Is views > max_views? }
                     ├── Yes ──> [ redis.decr() ]
                     │           [ Check delete_on_limit ]
                     │                 ├── Yes ──> [ Trigger Delete Pipeline ] ──> [ Return Expired UI ]
                     │                 └── No  ──> [ Return Expired UI ]
                     └── No  ──> [ Render unlocked page / Password gate ]
```

### Self-Destruct Delete Pipeline Logic
The deletion logic is split across the check stage in `getServerSideProps` and the execution route handler in `/api/deletepipeline/route.js`:

```javascript
// Excerpt from src/pages/public/[id].jsx (getServerSideProps)
if (file.expires_at && new Date(file.expires_at).getTime() <= Date.now()) {
  if (file.delete_on_expire) {
    try {
      await api.delete("/deletepipeline", { data: { file_id: file.id } });
    } catch (err) {
      console.error("Delete pipeline (expire) failed:", err.message);
    }
  }
  return { props: { fileMeta: { ...file, expired: true } } };
}
```

```javascript
// Excerpt from src/app/api/deletepipeline/route.js (DELETE)
export async function DELETE(req) {
  const { file_id } = await req.json();
  const { data: fileMeta } = await supabase.from("files").select("*").eq("id", file_id).single();

  // 1. Physically delete the object from AWS S3
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileMeta.file_key,
  }));

  // 2. Mark the record as inactive and update its expiration timestamp in Supabase
  await supabase.from("files").update({
    is_active: false,
    expires_at: new Date().toISOString(),
  }).eq("id", file_id);

  return NextResponse.json({ success: true });
}
```

### Complexity Analysis
* **Time Complexity**: **O(1)**. Primary database lookups and updates in PostgreSQL use indexed primary keys. Upstash Redis increments (`INCR`) and sets (`SET`) are memory-bound and run in constant time.
* **Space Complexity**: **O(1)**. The server does not store file binaries or growing arrays during access verification.
* **Network Overhead Latency**: **O(N)**. Since `getServerSideProps` triggers a loopback HTTP DELETE request to `/api/deletepipeline` via Axios, the server must open an external HTTP loopback connection to itself. This increases network latency and wastes socket connections. It should be refactored to call the database/S3 deletion logic directly as an internal function.

---

## 6. Challenges & Design Decisions

### 1. Ephemeral vs. Relational Storage Split
* **The Decision**: Splitting file counters (views, downloads) into Redis while keeping file configuration rules in PostgreSQL.
* **Reasoning**: Real-time counter updates generate high write loads on database tables. In PostgreSQL, this causes write amplification and row lock contention. Offloading these increments to Redis protects the primary database.
* **Trade-off**: This split introduces eventual consistency challenges. If a file is deleted, we must also clean up the Redis keys (`file:id:views`, `file:id:downloads`) to prevent memory leaks in our Redis instance.

### 2. Active vs. Inactive State Partitioning
* **The Decision**: Retaining files in the database with `is_active: false` when they expire or hit download limits, rather than deleting the rows.
* **Reasoning**: Uploader accounts need to see historic analytics (total views and downloads) for past files. By setting `is_active: false` and deleting only the physical binary from S3, the user can still view their historical sharing records.
* **Trade-off**: The database size will grow over time as expired rows accumulate. This can be resolved by archiving inactive records to an analytics warehouse or enforcing a hard retention limit (e.g., 30 days) before purging the rows.

### 3. Server-Side Execution Gate vs. Client-Side Middleware
* **The Decision**: Performing access validation inside `getServerSideProps` (SSR) instead of using Next.js client-side hooks.
* **Reasoning**: Client-side checks are insecure because the browser has already downloaded the page data. Running validation on the server ensures that if a file is expired, the file binary URL is never sent to the client browser.
* **Trade-off**: SSR increases Page load latency (Time to First Byte) because the server must query Supabase and Redis before rendering the HTML. This latency is a necessary trade-off for security.

---

## 7. Quick Revision Sheet

### Concept-by-Concept Interview Cheat Sheet
- **OIDC/OAuth (Kinde)**: Delegation of authentication via secure, JWT-based cookies, checked on the server with `getKindeServerSession()`.
- **Hybrid Routing**: Mixing App Router (dashboard layouts) and Pages Router (SSR sharing page) in Next.js to leverage both systems.
- **Serverless Redis (Upstash)**: Ephemeral memory cache offering atomic operations (`INCR`) over HTTP to track file analytics without database write-amplification.
- **Object Storage (AWS S3)**: Scalable, flat object store for file binaries, accessed via SDK Commands (`PutObjectCommand`, `DeleteObjectCommand`).
- **Postgres (Supabase)**: Transactional relational database using SQL queries (`upsert`, `select`, `update`) to manage file metadata.
- **Short Polling**: A simple real-time updates strategy where the client sends requests at set intervals (5s). It is easy to configure but generates network overhead.
- **Next.js Rendering**: SSR (`getServerSideProps`) for real-time security checking; ISR (`revalidate = 10`) for cached dashboard rendering; Dynamic (`force-dynamic`) for request-time rendering.
- **Preflight CORS Checks**: Browser security mechanism checking permissions via an HTTP `OPTIONS` handshake; enabled credentials sharing using `withCredentials: true`.
- **Plaintext Password Exposure**: A security flaw where the password is sent to the client browser inside React props (`__NEXT_DATA__`) before being verified.
- **Insecure Direct Object Reference (IDOR)**: A vulnerability where an API route (e.g. `/api/file`) performs database operations without verifying user ownership.
- **Buffer Memory Blowup**: Uploading files by reading the entire binary into a Node.js Buffer in-memory, which crashes the serverless runtime for large files.

### 30-Second Elevator Pitch
> "**Track Vault** is a secure, self-destructing file-sharing application built on Next.js. It allows users to upload files to AWS S3, set custom access rules (expiry times, password locks, and view/download limits), and track usage statistics in real-time using Upstash Redis. When access criteria are breached, it automatically deletes files from S3 and marks them inactive in Supabase to protect privacy. The application is deployed horizontally across EC2 instances behind a Caddy reverse proxy using DuckDNS."

### High-Yield Interview Warnings & Traps
1. **"Is your password locking secure?"**
   * *Trap*: Answering "Yes, it requests a password before showing the download button."
   * *Correct Response*: "No, the current implementation has a security vulnerability where `getServerSideProps` sends the plaintext password to the client inside the Next.js page props before verification. An attacker can inspect the page source to find the password. To secure this, I would perform password checks on the server-side and authorize downloads using signed session cookies."
2. **"Does this scale to 5GB video files?"**
   * *Trap*: "Yes, S3 is highly scalable and handles large files easily."
   * *Correct Response*: "S3 scales, but our upload handler reads the entire file into server memory as a buffer. This will fail with Out of Memory errors for files larger than a few megabytes. To scale this, I would refactor the upload process to use S3 Presigned URLs so the browser uploads files directly to S3."
3. **"Why use Redis instead of PostgreSQL for views?"**
   * *Trap*: "Because Redis is faster and easier to set up."
   * *Correct Response*: "Updating view counters in PostgreSQL generates frequent write operations (`UPDATE` transactions) that lock rows and cause write amplification under high traffic. Redis is an in-memory database that handles increments atomically in RAM, which avoids database locks."
