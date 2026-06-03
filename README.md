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

*   **Library (React):** A set of tools where *you* control the application flow. You import React to render UI, but you decide folder structures, routing, build steps, and bundling.
*   **Framework (Next.js):** A skeleton structure that *controls you*. It defines conventions (e.g., folder-based routing) and calls your code at specific lifecycle moments.
*   **Next.js is a Meta-framework:** It runs on top of React. React provides the component model, state management, and reconciliation; Next.js adds routing, compilation, optimization, and server runtime environments.
</details>

<details>
<summary><b>2. Rendering Techniques in Next.js</b></summary>

We choose rendering strategies page-by-page or component-by-component based on data freshness and delivery constraints:

*   **Static Site Generation (SSG):** HTML is generated once at build time. Super fast (CDN cached), perfect for public static content (blogs, marketing pages).
*   **Incremental Static Regeneration (ISR):** Generates static pages but regenerates them in the background after a specified revalidation timeout. Best for large catalogs.
*   **Server-Side Rendering (SSR):** HTML is generated on-demand for every request. Essential for real-time, highly personalized data (dashboards).
*   **Client-Side Rendering (CSR):** Traditional SPA style. Bare shell with full client-side JS executing interactive behaviors.
*   **React Server Components (RSC):** The modern paradigm allowing component-level rendering decisions. Server components run exclusively on the server, sending zero JS to the browser. Client components (`'use client'`) add interactivity.
</details>

<details>
<summary><b>3. Router Architecture: Pages Router vs. App Router</b></summary>

*   **Pages Router (Legacy):** Route matching based on files in `/pages`. Lacks native nested layouts, meaning page transitions unmount/remount layouts.
*   **App Router (Modern):** Route matching based on folder structure in `/app/` with special file conventions (`page.js`, `layout.js`, `loading.js`, `error.js`, `route.js`).
    *   **Nested Layouts:** Shared layout states are preserved when navigating between sub-pages, enhancing performance and UX.
</details>

<details>
<summary><b>4. Async Params & SearchParams (Promises)</b></summary>

In modern Next.js (15+), route `params` and `searchParams` are asynchronous Promises.
*   **The Principle:** Decouples static shell loading from dynamic URL parameters.
*   **Product Impact:** Enables **Partial Prerendering (PPR)**. The static shell (e.g., navigation, sidebar) can be generated and served instantly, while the component waiting on dynamic URL parameters suspends and streams in once the promise resolves.
</details>

<details>
<summary><b>5. Server Components vs. Client Components</b></summary>

A Server Component does **not** need to be an `async` function. Any component inside the `/app` directory without the `'use client'` directive is a Server Component by default — whether it is sync or async.

*   **`async` is only required** when the component needs to `await` an operation (e.g., fetching data from a database or reading async `params`).
*   **Client Components** (marked with `'use client'`) **cannot** be `async` functions.

| Feature | Server Component (Default) | Client Component (`'use client'`) |
| :--- | :--- | :--- |
| Needs `async`? | Only if using `await` | ❌ Never |
| Execution Location | Server only | Server (initial render) + Browser |
| JS sent to browser | 0 KB | Yes (for interactivity) |
| Can use `useState`/`useEffect`? | ❌ No | ✅ Yes |
| Can fetch DB directly? | ✅ Yes (secure) | ❌ No |
</details>

<details>
<summary><b>6. Dynamic Routing: Single, Nested, Catch-All & Optional Catch-All</b></summary>

Next.js uses folder naming conventions to create dynamic routes:

#### Single Dynamic Segment: `[param]`
*   Folder: `app/user/[userId]/page.js`
*   Matches: `/user/john`, `/user/123`
*   In code: `const { userId } = await params;`

#### Nested Dynamic Routes
*   Folder: `app/user/[userId]/posts/[postId]/page.js`
*   Matches: `/user/john/posts/45`
*   In code: `const { userId, postId } = await params;`
*   **Limitation:** Fragile URL structure. Deep nesting causes dependency cascades (waterfall requests) and tightly couples your data model to your URL structure.

#### Catch-All Segment: `[...slug]`
*   Folder: `app/docs/[...slug]/page.js`
*   Matches any depth: `/docs/a`, `/docs/a/b/c`
*   The `slug` parameter is resolved as an **array** of strings: `["a", "b", "c"]`
*   Does **NOT** match the root `/docs` — returns a 404.
*   **Best Used For:** CMS pages, documentation portals, e-commerce category trees where path depth is user/database-driven.

#### Optional Catch-All Segment: `[[...slug]]`
*   Folder: `app/docs/[[...slug]]/page.js`
*   Same as Catch-All, but **also matches the root** `/docs` (with `slug` being `undefined`).
*   Eliminates the need for a separate `docs/page.js` root landing file.
*   **Best Used For:** Any pattern where the same page template handles both the index view and the detail view.

| Folder | Matches `/docs`? | Matches `/docs/a/b`? | `slug` value |
| :--- | :--- | :--- | :--- |
| `app/docs/[...slug]` | ❌ 404 | ✅ | `["a", "b"]` |
| `app/docs/[[...slug]]` | ✅ | ✅ | `undefined` / `["a", "b"]` |
</details>
