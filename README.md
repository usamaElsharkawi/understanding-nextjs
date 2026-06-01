# 🏗️ Product Engineering Approach

When building from scratch, we follow this framework:

1. **Identify the Core Constraint:** Define the "Atomic Unit of Value" for the user.
2. **Model the Truth:** Design a clean data schema before touching the UI.
3. **Delivery Strategy:** Choose the rendering method (SSG, SSR, ISR, or CSR) that best fits the data's lifecycle.
4. **Architecture for Change:** Decouple business logic from framework-specific code.
5. **Design for Failure:** Use Next.js boundaries (`error.js`, `loading.js`) to handle the "unhappy paths" gracefully.

---

# 🚀 Next.js First Principles & Key Concepts

## 1. Library vs. Framework (The Inversion of Control)
*   **Library (React):** A set of tools where *you* control the application flow. You import React to render UI, but you decide folder structures, routing, build steps, and bundling.
*   **Framework (Next.js):** A skeleton structure that *controls you*. It defines conventions (e.g., folder-based routing) and calls your code at specific lifecycle moments.
*   **Next.js is a Meta-framework:** It runs on top of React. React provides the component model, state management, and reconciliation; Next.js adds routing, compilation, optimization, and server runtime environments.

## 2. Rendering Techniques in Next.js
We choose rendering strategies page-by-page or component-by-component based on data freshness and delivery constraints:

*   **Static Site Generation (SSG):** HTML is generated once at build time. Super fast (CDN cached), perfect for public static content (blogs, marketing pages).
*   **Incremental Static Regeneration (ISR):** Generates static pages but regenerates them in the background after a specified revalidation timeout. Best for large catalogs.
*   **Server-Side Rendering (SSR):** HTML is generated on-demand for every request. Essential for real-time, highly personalized data (dashboards).
*   **Client-Side Rendering (CSR):** Traditional SPA style. Bare shell with full client-side JS executing interactive behaviors.
*   **React Server Components (RSC):** The modern paradigm allowing component-level rendering decisions. Server components run exclusively on the server, sending zero JS to the browser. Client components (`'use client'`) add interactivity.

## 3. Router Architecture: Pages Router vs. App Router
*   **Pages Router (Legacy):** Route matching based on files in `/pages`. Lacks native nested layouts, meaning page transitions unmount/remount layouts.
*   **App Router (Modern):** Route matching based on folder structure in `/app/` with special file conventions (`page.js`, `layout.js`, `loading.js`, `error.js`, `route.js`).
    *   **Nested Layouts:** Shared layout states are preserved when navigating between sub-pages, enhancing performance and UX.

## 4. Async Params & SearchParams (Promises)
In modern Next.js (15+), route `params` and `searchParams` are asynchronous Promises.
*   **The Principle:** Decouples static shell loading from dynamic URL parameters.
*   **Product Impact:** Enables **Partial Prerendering (PPR)**. The static shell (e.g., navigation, sidebar) can be generated and served instantly, while the component waiting on dynamic URL parameters suspends and streams in once the promise resolves.
