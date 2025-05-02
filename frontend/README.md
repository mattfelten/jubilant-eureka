# Take home exercise

This take home exercise provides a frontend starter kit with a preconfigured setup for consuming gRPC requests.
It has some opinionated styling system setup, with a few components already provided to get you started.

## Features

- Only client-side rendering for now
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization with Rsbuild plugin
- 🔄 Data fetching solution via gRPC/Connect with optional setup for TanStack/Connect Query also available
- 🔒 TypeScript v5 by default
- 🎉 TailwindCSS v4 for styling
- 📖 [React Router docs](https://reactrouter.com/)
- 📖 [TanStack Query docs](https://tanstack.com/query/latest/docs/framework/react/overview) 
- 📖 [Connect Query docs](https://connectrpc.com/docs/web/query/getting-started/)


## Getting Started

### Installation

Install the dependencies (can also use another package manager like `npm` if you wish):

```bash
bun install
```

### Development
Once you have the Go-based backend running, set up `REACT_APP_API_URL` by creating a `.env` file based on `.env.sample`, the backend API is pointing at port `8080` by default.

Start the development server with HMR:

```bash
bun run start
```

Your application will be available at `http://localhost:3000`.

### Testing (Integration)
Integration testing is done via `bun` as well, it is using `happy-dom` for mocking DOM and `@testing-library/react` for assertions.

### Testing (E2E)
E2E testing is not set up, feel free to use `playwright` if you choose to add any tests.

## Building for Production

Create a production build:

```bash
bun run build
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/) already configured for a simple default experience. You can use whatever CSS framework you prefer, but this should help you get started.
