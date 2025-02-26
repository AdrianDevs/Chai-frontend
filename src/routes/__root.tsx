import React, { Suspense } from 'react';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router';

// import { TanStackRouterDevtools } from '@tanstack/router-devtools';
const TanStackRouterDevtools =
  import.meta.env.VITE_REACT_ENV === 'PROD'
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel,
        }))
      );

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="flex gap-2 p-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
      </div>
      <hr />
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  ),
});
