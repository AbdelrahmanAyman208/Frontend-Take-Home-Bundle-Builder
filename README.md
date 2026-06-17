# Bundle Magic: Frontend Take-Home Assessment

## Overview
This is a full-stack React application designed as a modern e-commerce "Bundle Builder" for home security. Users can manually build their bundle using an interactive cart or use the **AI Security Architect** to get personalized recommendations based on their home layout and needs.

This project implements the core requirements plus the **Backend Bonus** using Node.js, Express, and MongoDB.

## 🏃‍♂️ Run Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a connection string

### 1. Environment Setup
The backend requires environment variables to connect to the database and use the AI features. I have included an `.env` file in the `server/` directory for convenience, but you can also create your own:

**`server/.env`**:
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=anthropic/claude-3.5-haiku-20241022:beta
```

### 2. Install & Start the Backend
Open a terminal and run the following commands:
```bash
cd server
npm install
npm run seed  # Populates the MongoDB database with the catalog data
npm run dev   # Starts the API server on http://localhost:3001
```

### 3. Install & Start the Frontend
Open a *second* terminal in the root directory of the project:
```bash
npm install
npm run dev   # Starts the React app on http://localhost:8080
```
Navigate to `http://localhost:8080` to view the app!

---

## 🤔 Decisions & Tradeoffs

1. **State Management**: I used React's `useReducer` paired with `Context API` rather than Redux or Zustand. The bundle logic (grouping products, calculating discounts, swapping variants) is complex enough to warrant a centralized reducer, but since the scope is limited to the bundle cart, Redux felt like over-engineering.
2. **Local Storage Hydration**: I implemented synchronous hydration from `localStorage` using `useReducer`'s init function. This ensures the cart state persists flawlessly across page reloads and navigating to the checkout screen without suffering from "flash of empty state" or Strict Mode race conditions.
3. **Backend Bonus (MongoDB)**: Instead of just reading from a static JSON file, I built a fully functional backend API that serves the catalog from MongoDB. 
    - The catalog (cameras, sensors, plans) is seeded into the database.
    - An AI endpoint (`/api/ai`) utilizes the `OpenRouter` API to stream dynamic recommendations based on user quiz answers, rather than hardcoding static bundles.
    - A checkout endpoint (`/api/checkout`) processes the order and dynamically decrements inventory.
4. **Pessimistic Locking / Atomic Inventory Control**: To solve the classic e-commerce problem of overselling during high-concurrency checkouts, the checkout endpoint uses MongoDB's atomic `findOneAndUpdate` combined with `$elemMatch` and `$inc`. This allows the server to query for a product *and* verify it has sufficient stock in the same database operation that deducts the stock, ensuring race conditions cannot cause negative inventory.
5. **Data Syncing**: The frontend uses user-friendly "slugs" (e.g. `cam-v4`, `white`) to identify products for better readability in code and URLs, while the backend uses proper MongoDB `ObjectIds`. I built a mapping layer in the backend to translate these seamlessly during saves and checkout.
6. **Styling**: Used Tailwind CSS combined with standard CSS for custom animations. This allowed for rapid prototyping of a "premium" UI with micro-interactions without writing massive CSS files.

## 🚧 What I Didn't Finish / Future Work

- **User Authentication**: Currently, bundles are saved anonymously to local storage and bound to a generated Session ID on the backend. In a real application, I would implement JWT authentication so users could save their bundles to their accounts across devices.
- **Payment Processing**: The checkout flow is fully simulated (including inventory management and order ID generation), but it does not integrate with Stripe or a real payment gateway.
- **Full Test Coverage**: Due to time constraints, I focused heavily on the UX, state architecture, and AI backend integration. I would add Jest/React Testing Library tests for the bundle reducer logic, as calculating monthly vs upfront costs has many edge cases.
