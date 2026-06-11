# 🏗️ Product Engineering Approach

When building from scratch, we follow this framework:

1. **Identify the Core Constraint:** Define the "Atomic Unit of Value" for the user.
2. **Model the Truth:** Design a clean data schema before touching the UI.
3. **Delivery Strategy:** Choose the rendering method (SSG, SSR, ISR, or CSR) that best fits the data's lifecycle.
4. **Architecture for Change:** Decouple business logic from framework-specific code.
5. **Design for Failure:** Use Next.js boundaries (`error.js`, `loading.js`) to handle the "unhappy paths" gracefully.

---

# 🚀 Next.js First Principles & Key Concepts

<details>
<summary><b>1. Library vs. Framework (The Inversion of Control)</b></summary>

- **Library (React):** A set of tools where _you_ control the application flow. You import React to render UI, but you decide folder structures, routing, build steps, and bundling.
- **Framework (Next.js):** A skeleton structure that _controls you_. It defines conventions (e.g., folder-based routing) and calls your code at specific lifecycle moments.
- **Next.js is a Meta-framework:** It runs on top of React. React provides the component model, state management, and reconciliation; Next.js adds routing, compilation, optimization, and server runtime environments.
</details>

<details>
<summary><b>2. Rendering Techniques in Next.js</b></summary>

We choose rendering strategies page-by-page or component-by-component based on data freshness and delivery constraints:

- **Static Site Generation (SSG):** HTML is generated once at build time. Super fast (CDN cached), perfect for public static content (blogs, marketing pages).
- **Incremental Static Regeneration (ISR):** Generates static pages but regenerates them in the background after a specified revalidation timeout. Best for large catalogs.
- **Server-Side Rendering (SSR):** HTML is generated on-demand for every request. Essential for real-time, highly personalized data (dashboards).
- **Client-Side Rendering (CSR):** Traditional SPA style. Bare shell with full client-side JS executing interactive behaviors.
- **React Server Components (RSC):** The modern paradigm allowing component-level rendering decisions. Server components run exclusively on the server, sending zero JS to the browser. Client components (`'use client'`) add interactivity.
</details>

<details>
<summary><b>3. Router Architecture: Pages Router vs. App Router</b></summary>

- **Pages Router (Legacy):** Route matching based on files in `/pages`. Lacks native nested layouts, meaning page transitions unmount/remount layouts.
- **App Router (Modern):** Route matching based on folder structure in `/app/` with special file conventions (`page.js`, `layout.js`, `loading.js`, `error.js`, `route.js`). \* **Nested Layouts:** Shared layout states are preserved when navigating between sub-pages, enhancing performance and UX.
</details>

<details>
<summary><b>4. Async Params & SearchParams (Promises)</b></summary>

In modern Next.js (15+), route `params` and `searchParams` are asynchronous Promises.

- **The Principle:** Decouples static shell loading from dynamic URL parameters.
- **Product Impact:** Enables **Partial Prerendering (PPR)**. The static shell (e.g., navigation, sidebar) can be generated and served instantly, while the component waiting on dynamic URL parameters suspends and streams in once the promise resolves.
</details>

<details>
<summary><b>5. Server Components vs. Client Components</b></summary>

A Server Component does **not** need to be an `async` function. Any component inside the `/app` directory without the `'use client'` directive is a Server Component by default — whether it is sync or async.

- **`async` is only required** when the component needs to `await` an operation (e.g., fetching data from a database or reading async `params`).
- **Client Components** (marked with `'use client'`) **cannot** be `async` functions.

| Feature                         | Server Component (Default) | Client Component (`'use client'`) |
| :------------------------------ | :------------------------- | :-------------------------------- |
| Needs `async`?                  | Only if using `await`      | ❌ Never                          |
| Execution Location              | Server only                | Server (initial render) + Browser |
| JS sent to browser              | 0 KB                       | Yes (for interactivity)           |
| Can use `useState`/`useEffect`? | ❌ No                      | ✅ Yes                            |
| Can fetch DB directly?          | ✅ Yes (secure)            | ❌ No                             |

</details>

<details>
<summary><b>6. Dynamic Routing: Single, Nested, Catch-All & Optional Catch-All</b></summary>

Next.js uses folder naming conventions to create dynamic routes:

#### Single Dynamic Segment: `[param]`

- Folder: `app/user/[userId]/page.js`
- Matches: `/user/john`, `/user/123`
- In code: `const { userId } = await params;`

#### Nested Dynamic Routes

- Folder: `app/user/[userId]/posts/[postId]/page.js`
- Matches: `/user/john/posts/45`
- In code: `const { userId, postId } = await params;`
- **Limitation:** Fragile URL structure. Deep nesting causes dependency cascades (waterfall requests) and tightly couples your data model to your URL structure.

#### Catch-All Segment: `[...slug]`

- Folder: `app/docs/[...slug]/page.js`
- Matches any depth: `/docs/a`, `/docs/a/b/c`
- The `slug` parameter is resolved as an **array** of strings: `["a", "b", "c"]`
- Does **NOT** match the root `/docs` — returns a 404.
- **Best Used For:** CMS pages, documentation portals, e-commerce category trees where path depth is user/database-driven.

#### Optional Catch-All Segment: `[[...slug]]`

- Folder: `app/docs/[[...slug]]/page.js`
- Same as Catch-All, but **also matches the root** `/docs` (with `slug` being `undefined`).
- Eliminates the need for a separate `docs/page.js` root landing file.
- **Best Used For:** Any pattern where the same page template handles both the index view and the detail view.

| Folder                 | Matches `/docs`? | Matches `/docs/a/b`? | `slug` value               |
| :--------------------- | :--------------- | :------------------- | :------------------------- |
| `app/docs/[...slug]`   | ❌ 404           | ✅                   | `["a", "b"]`               |
| `app/docs/[[...slug]]` | ✅               | ✅                   | `undefined` / `["a", "b"]` |

</details>

<details>
<summary><b>7. Intercepting Routes</b></summary>

Intercepting routes allows you to load a route from another part of your application within the current layout. This routing paradigm is useful when you want to display the content of a route without the user switching to a different context.

#### What is "Context"?

- **Technical Context (React State & DOM):** Standard navigation unmounts the current page, destroying its local state (inputs, filters, video playback status). With intercepting routes, the current page remains mounted in the background, fully preserving its React state and DOM nodes.
- **UX Context (User Flow & Scroll Position):** Standard navigation changes the whole screen canvas and resets scroll positions. Intercepting routes preserves the scroll position of the background feed (e.g. infinite scroll) and overlays the target route (typically inside a modal or slide-over panel).

#### Convention Syntax

Next.js resolves relative levels based on **URL segments** (not physical directories; Route Groups like `(admin)` are ignored):

- **`(.)`** matches segments on the **same level**
- **`(..)`** matches segments **one level above**
- **`(..)(..)`** matches segments **two levels above**
- **`(...)`** matches segments from the **root** `app` directory

#### Navigation Behavior

- **Soft Navigation (Client-Side Link):** Triggered when clicking a `<Link>` component. Next.js intercepts the route and displays the intercepted layout/component (e.g., inside a modal). The URL is updated.
- **Hard Navigation (Direct Access/Refresh):** Triggered when a user refreshes the page or accesses the URL directly. Next.js bypasses the interceptor and serves the full, standalone destination page.
</details>

<details>
<summary><b>8. Parallel Routes</b></summary>

Parallel Routes allow you to simultaneously or conditionally render one or more pages in the same layout. They act as independent slots that can have their own sub-folders, loading states, error states, and route segments.

#### Folder Convention: Slots (`@`)

Parallel Routes are created using named **slots** marked with the `@` prefix (e.g., `@analytics`, `@team`).

- Slots are **not** URL route segments. They do not affect the URL path.
- They are passed to the parent layout as named props rather than being grouped inside `{children}`.

```jsx
// app/layout.js
export default function Layout({ children, analytics, team }) {
  return (
    <div>
      {children}
      <div>{analytics}</div>
      <div>{team}</div>
    </div>
  );
}
```

#### Why Use Parallel Routes?

1.  **Independent Streaming & Skeleton Loading:** Wrap slow widgets in their own `loading.js` so they load independently without blocking the rest of the layout.
2.  **Isolated Error Boundaries:** Wrap widgets in their own `error.js` so a failure in one section (e.g., database timeout) doesn't crash the entire dashboard.
3.  **Independent Sub-Routing:** Each slot can navigate independently (e.g. `/dashboard/settings` loads `@analytics/settings/page.js` while keeping the `@team` slot on its active or default view).
4.  **Conditional Rendering:** Show slots dynamically based on user role (e.g., rendering `@admin` vs. `@user` in `layout.js`).

#### The Crucial Fallback: `default.js`

- **The Consequence:** If any slot lacks a match and lacks a `default.js` file, Next.js will throw a **404 error** for the entire layout.
- **The Solution:** You **must** define a `default.js` file (often returning `null` or a fallback component) inside every slot to serve as a fallback.
</details>

<details>
<summary><b>9. React Server Components (RSC) vs. Client Components</b></summary>

In the Next.js App Router, components are divided into two main categories: **Server Components** (default) and **Client Components** (declared with `"use client"`).

| Feature                                     | Server Component (Default) | Client Component (`'use client'`)                       |
| :------------------------------------------ | :------------------------- | :------------------------------------------------------ |
| **Execution Location**                      | Server only                | Server (initial HTML) $\rightarrow$ Browser (hydration) |
| **Client JS Sent**                          | ❌ **0 KB**                | ✅ **Included in bundle**                               |
| **Interactivity (onClick, etc.)**           | ❌ No                      | ✅ Yes                                                  |
| **Hooks (`useState`, `useEffect`)**         | ❌ No                      | ✅ Yes                                                  |
| **Browser APIs (`window`, `localStorage`)** | ❌ No                      | ✅ Yes                                                  |
| **Direct DB Connection**                    | ✅ Yes                     | ❌ No (requires public API endpoint)                    |

#### Composition Rules

1.  **Server Component imports Client Component:** Fully supported. Recommended for passing fetched server data to interactive client boundaries.
2.  **Client Component imports Server Component:** ❌ **Forbidden**. Direct imports will force the Server Component to compile as a Client Component, crashing if it contains server-only code.
3.  **The children Slot Pattern:** To render a Server Component inside a Client Component, pass it as a `children` prop (or any layout slot) from a parent Server Component:
    ```jsx
    // ClientComponent.jsx ('use client')
    export default function ClientComponent({ children }) {
    return <div className="client-wrapper">{children}</div>;
    }

            // Page.jsx (Server Component)
            import ClientComponent from './ClientComponent';
            import ServerChild from './ServerChild';
            export default function Page() {
              return <ClientComponent><ServerChild /></ClientComponent>;
            }
            ```

</details>

<details>
<summary><b>10. Server-Side Rendering (SSR) vs. React Server Components (RSC)</b></summary>

While both execute code on the server, they address completely different concerns:

- **RSC is an Architecture (Component Type):** It determines **where** code runs. RSCs run exclusively on the server, allowing direct database queries and keeping heavy dependencies off the client bundle (Zero Bundle Size).
- **SSR is a Rendering Process (Technique):** It determines **how** the initial page is loaded. It takes a React component tree (consisting of both RSCs and Client Components) and compiles it into a static **HTML string** on the initial page load so the browser displays content immediately (FCP/LCP optimization).

#### How They Work Together

1.  On **Initial Page Load / Refresh**, the server renders the RSC tree to produce a description (RSC Payload), and then SSR converts that description into raw **HTML**. The browser receives **both** the HTML and the RSC Payload.
2.  On **Client-Side (Soft) Navigation**, the server renders _only_ the new RSC tree, generating and sending **only the RSC Payload**. The client React router diffs and updates the DOM in-place without triggering a full page reload.
</details>

<details>
<summary><b>11. The Hydration Process</b></summary>

**Hydration** is the process where client-side JavaScript attaches event listeners, state, and reactivity to the static HTML pre-rendered by the server, turning a "dry/static" page into a "live" interactive React application.

#### The Technical Flow

1.  **Server:** Pre-renders layouts and components into static HTML. Sends the HTML along with the RSC Payload and JS chunks to the browser.
2.  **Browser (Painting):** Parses the HTML and immediately paints the UI (FCP). At this stage, text and buttons are visible, but clicking them does nothing.
3.  **Browser (Execution):** Loads and runs the Client Component JavaScript bundles.
4.  **Hydration:** React reads the RSC Payload, walks the DOM, and binds event listeners and React state directly to the existing HTML elements without re-rendering the layout.

#### Hydration Mismatch Error

This error occurs when the initial HTML rendered on the server differs from the initial component tree React expects in the browser. Common causes include:

- Using dynamic client data on the server (e.g. `new Date()` showing server time vs client time).
- Using random values (`Math.random()`).
- Invalid HTML structures (e.g., nesting a `<div>` inside a `<p>` tag), which the browser's parser automatically corrects, causing a mismatch with React's expectation.
</details>

---

# 🔌 Module 5: Backend Route Handlers

<details>
<summary><b>12. What are Route Handlers?</b></summary>

**Route Handlers** are backend API endpoints built directly into your Next.js application. They allow you to create custom request handlers for any route, using the standard Web `Request` and `Response` APIs. Instead of serving HTML to a browser, they serve raw data (JSON), file downloads, webhooks, or any other HTTP response.

#### They are NOT the same as Server Components

- **Server Components** run on the server to fetch data and render **HTML** for your own Next.js UI.
- **Route Handlers** run on the server to handle HTTP requests and return **data or non-HTML responses** for any consumer (browser client, mobile app, third-party service).

#### The Key Anti-Pattern to Avoid

Do **NOT** create a Route Handler just to fetch data inside a Server Component:

```javascript
// ❌ WRONG: Server Component calling your own API
const res = await fetch("http://localhost:3000/api/products");

// ✅ CORRECT: Server Component queries DB directly
const products = await db.query("SELECT * FROM products");
```

</details>

<details>
<summary><b>13. Route Handler File Conventions</b></summary>

Route Handlers are **only available in the App Router** (`app/` directory). They use a `route.js` file (not `page.js`).

#### File Naming & URL Mapping

- The file must be named exactly **`route.js`** (or `route.ts`).
- The URL corresponds to the folder structure:

| File Path                             | URL                        |
| :------------------------------------ | :------------------------- |
| `app/api/hello/route.js`              | `/api/hello`               |
| `app/api/users/[id]/route.js`         | `/api/users/15`            |
| `app/api/products/[...slug]/route.js` | `/api/products/shoes/nike` |

#### HTTP Method Exports

Export named async functions matching the HTTP verb:

```javascript
// app/api/posts/route.js
export async function GET(request) { ... }     // Fetch data
export async function POST(request) { ... }    // Create resource
export async function PUT(request) { ... }     // Update resource
export async function DELETE(request) { ... }  // Delete resource
```

Unimplemented methods return `405 Method Not Allowed` automatically.

#### Critical Rule: No `page.js` and `route.js` in the Same Folder

They both resolve the same URL path and will conflict. Always place API routes under `app/api/`.

</details>

<details>
<summary><b>14. The Web Request & Response APIs</b></summary>

Next.js Route Handlers use **standardized Web APIs** for handling HTTP communication. These are platform-agnostic interfaces defined by the WHATWG standard — they work identically in the browser, Node.js, Deno, and Cloudflare Workers.

#### The `Request` Object

The standardized incoming package containing everything about the HTTP call:

```javascript
export async function GET(request) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page"); // Query params
  const auth = request.headers.get("Authorization"); // Headers
}
export async function POST(request) {
  const body = await request.json(); // Parse JSON body
}
```

#### The `Response` Object

The standardized outgoing package sent back to the caller:

```javascript
return Response.json({ data }); // JSON (most common)
return Response.json({ error: "Not Found" }, { status: 404 }); // Custom status
return new Response("<h1>Hi</h1>", {
  headers: { "Content-Type": "text/html" },
});
return Response.redirect("http://localhost:3000/login", 307); // Redirect
```

#### Next.js Extensions (`NextRequest` / `NextResponse`)

Next.js wraps the standard APIs with convenience helpers:

| Feature          | Standard API                    | NextRequest/NextResponse               |
| :--------------- | :------------------------------ | :------------------------------------- |
| Query params     | `new URL(req.url).searchParams` | `request.nextUrl.searchParams`         |
| Read cookies     | Manual header string parsing    | `request.cookies.get('token')`         |
| Set cookies      | Manual `Set-Cookie` headers     | `response.cookies.set('token', value)` |
| Internal rewrite | ❌                              | `NextResponse.rewrite(url)`            |

</details>

<details>
<summary><b>15. When to Use Route Handlers (vs. Server Components)</b></summary>

| Scenario                                            | Use Server Component | Use Route Handler |
| :-------------------------------------------------- | :------------------: | :---------------: |
| Fetch data to render your own Next.js UI            |          ✅          |        ❌         |
| Client Component user interaction (POST/DELETE/PUT) |          ❌          |        ✅         |
| Third-party webhook (Stripe, Auth0, GitHub)         |          ❌          |        ✅         |
| Mobile app / external consumer needs a JSON API     |          ❌          |        ✅         |
| Non-HTML response (CSV, PDF, generated image)       |          ❌          |        ✅         |
| Proxy call with secret API keys (OpenAI, etc.)      |          ❌          |        ✅         |

#### Caching Behavior

By default, **`GET` Route Handlers are cached** at build time (static). To make them dynamic (re-run on every request):

1.  Use the `request` parameter (e.g., read query params).
2.  Access `cookies()` or `headers()` from `next/headers`.
3.  Export `export const dynamic = 'force-dynamic'`.
4.  Use any non-GET method (`POST`, `DELETE`, etc.) — these are never cached.
</details>

<details>
<summary><b>16. Product Engineering: The API-First Mindset</b></summary>

Route Handlers are more than just "API routes"; they represent the **Open Interface** of your product system.

#### The "Engine" vs. The "Dashboard"

- **The Dashboard (UI):** Your `page.js` files. They change frequently based on design trends and user feedback.
- **The Engine (Core Logic):** Your `route.js` files. These define the "Truth" of your product (e.g., how an order is processed).
- **Principle:** By keeping the Engine decoupled from the Dashboard, you ensure that a UI redesign never breaks your core business logic.

#### Standardization as Insurance

Next.js Route Handlers use the **Standard Web Request/Response APIs**.

- **Impact:** Your logic isn't "Next.js code"—it's "Web standard code." This makes your backend logic portable and robust, preventing vendor lock-in and allowing your logic to run on the Edge or in separate microservices with minimal refactoring.

#### The Consumer Spectrum

A robust product has multiple "customers." While your Next.js frontend is the primary consumer, Route Handlers prepare your system to serve **External Customers** (mobile apps, partners, or webhooks) using the same RESTful interface.

</details>

<details>
<summary><b>17. Data as a Stream: Why we <code>await</code> the Body</b></summary>

When a client sends a `POST` request, the data doesn't arrive instantly. It arrives as a **Stream of Bytes** over the network.

#### The Principle of Asynchronous I/O

- **Non-Blocking:** Reading the body is an I/O operation. We `await request.json()` so the server can handle other requests while waiting for the network packets to arrive and be parsed.
- **Data Integrity:** Awaiting ensures we work with the _complete_ payload. If we didn't wait, we might try to process a partial, corrupted version of the data.
- **Standardization:** Next.js uses the standard Web `Request` API, making your data-handling logic portable across modern JavaScript runtimes (Deno, Bun, Cloudflare Workers).
</details>

<details>
<summary><b>18. The URL as a State Container (Search Parameters)</b></summary>

**Query Parameters** and **Search Parameters** are the same thing. They represent the **UI State** serialized into the URL.

#### Product Impact: The "Sharable Truth"

- **Deep Linking:** By storing filters or search terms in the URL (`?q=shoes&sort=price`), users can share exact views with others.
- **Browser Durability:** Using Search Params ensures the "Back" button works as expected and the page state survives a refresh.

#### Implementation Distinction

- **In Route Handlers:** Extracted via the Web API: `const { searchParams } = new URL(request.url)`.
- **In Pages:** Received as an **Async Promise** (Next.js 15+). This allows the static shell of the page to load instantly while the parameters are resolved for dynamic content (Partial Prerendering).
</details>

<details>
<summary><b>19. Headers: The Protocol of the Engine</b></summary>

Headers are the **Metadata** (the envelope) that describes the Request or Response.

#### The Metadata Principle

- **Separation of Concerns:** Keep "What to do" in the Body and "Who/How/When" in the Headers.
- **Security:** Always use the `Authorization` header for identity. Avoid passing sensitive tokens in the URL or Body.

#### Performance & Caching

- **Cache-Control:** Use headers to tell browsers and CDNs how long to store your API responses. This is the first line of defense against database overload.
- **Dynamic Opt-in:** Accessing headers (via `headers()` or `request.headers`) tells Next.js the route is **Dynamic**. It cannot be pre-calculated because it depends on the specific requester.

#### Reliability: The "Immutability" Rule

- Incoming headers cannot be changed. This preserves the **Audit Trail** of exactly what the client sent. To modify headers for an outgoing response, you must construct a new `Headers` object.
</details>

<details>
<summary><b>20. Cookies: The Persistent Memory of the Web</b></summary>

Cookies are specialized headers used to solve the "Statelessness" of HTTP. They allow the server to store "State" (like a session ID) on the client's browser.

#### The First Principle: State over Statelessness

- **The Handshake:** The server sends `Set-Cookie`. The browser stores it and automatically sends `Cookie` back on every subsequent request to that domain.
- **Server-Side Awareness:** Unlike LocalStorage, cookies are sent to the server with the very first byte of the request. This enables personalized SSR and secure authentication.

#### Product Robustness: The Security Trinity

To build a secure product, cookies must be configured with:

- **HttpOnly:** Prevents JavaScript from accessing the cookie (Defense against XSS).
- **Secure:** Ensures the cookie is only transmitted over HTTPS.
- **SameSite (Strict/Lax):** Prevents the browser from sending cookies on cross-site requests (Defense against CSRF).

#### Lifecycle and Scope

- **Session Cookies:** Deleted when the browser closes.
- **Persistent Cookies:** Have an `Expires` or `Max-Age` attribute.
</details>

<details>
<summary><b>21. The Three Pillars of Cookie Usage</b></summary>

From a product standpoint, cookies serve three distinct strategic purposes:

#### 1. Session Management (Identity)

- **Goal:** Maintain a "logged-in" state.
- **Engineering Note:** Must use `HttpOnly` and `Secure` flags to protect the session token from theft.

#### 2. Personalization (UX)

- **Goal:** Remember user preferences (Theme, Language, Region).
- **Advantage:** Allows Server Components to render the "correct" version of the UI immediately, preventing layout shifts or "flashes" of unstyled content.

#### 3. Tracking (Analytics)

- **Goal:** Understand user behavior and ad attribution.
- **Compliance:** Requires careful handling of user consent (GDPR/CCPA) as these often stay on the device for long periods.
</details>


