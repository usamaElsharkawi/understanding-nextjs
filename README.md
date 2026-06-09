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

<details>
<summary><b>7. Intercepting Routes</b></summary>

Intercepting routes allows you to load a route from another part of your application within the current layout. This routing paradigm is useful when you want to display the content of a route without the user switching to a different context.

#### What is "Context"?
*   **Technical Context (React State & DOM):** Standard navigation unmounts the current page, destroying its local state (inputs, filters, video playback status). With intercepting routes, the current page remains mounted in the background, fully preserving its React state and DOM nodes.
*   **UX Context (User Flow & Scroll Position):** Standard navigation changes the whole screen canvas and resets scroll positions. Intercepting routes preserves the scroll position of the background feed (e.g. infinite scroll) and overlays the target route (typically inside a modal or slide-over panel).

#### Convention Syntax
Next.js resolves relative levels based on **URL segments** (not physical directories; Route Groups like `(admin)` are ignored):
*   **`(.)`** matches segments on the **same level**
*   **`(..)`** matches segments **one level above**
*   **`(..)(..)`** matches segments **two levels above**
*   **`(...)`** matches segments from the **root** `app` directory

#### Navigation Behavior
*   **Soft Navigation (Client-Side Link):** Triggered when clicking a `<Link>` component. Next.js intercepts the route and displays the intercepted layout/component (e.g., inside a modal). The URL is updated.
*   **Hard Navigation (Direct Access/Refresh):** Triggered when a user refreshes the page or accesses the URL directly. Next.js bypasses the interceptor and serves the full, standalone destination page.
</details>

<details>
<summary><b>8. Parallel Routes</b></summary>

Parallel Routes allow you to simultaneously or conditionally render one or more pages in the same layout. They act as independent slots that can have their own sub-folders, loading states, error states, and route segments.

#### Folder Convention: Slots (`@`)
Parallel Routes are created using named **slots** marked with the `@` prefix (e.g., `@analytics`, `@team`).
*   Slots are **not** URL route segments. They do not affect the URL path.
*   They are passed to the parent layout as named props rather than being grouped inside `{children}`.

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
*   **The Issue:** On hard navigation (page refresh or direct URL entry), Next.js matches all slots against the current URL. If a slot doesn't have a folder matching the new path, Next.js does not know what to render.
*   **The Consequence:** If any slot lacks a match and lacks a `default.js` file, Next.js will throw a **404 error** for the entire layout.
*   **The Solution:** You **must** define a `default.js` file (often returning `null` or a fallback component) inside every slot to serve as a fallback.
</details>


