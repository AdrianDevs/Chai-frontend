import React, { Suspense } from 'react';
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import type { AuthContextType } from '../types/auth';

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

export type RouterContext = {
  auth?: AuthContextType | null;
  defaultNotFoundComponent?: React.ReactNode;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <div className="m-8 flex min-w-xs flex-col items-center justify-center bg-base-100">
        <Outlet />
      </div>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  ),
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-2xl">You are lost</p>
        <Link className="btn btn-primary" to="/">
          Go home
        </Link>
      </div>
    );
  },
});
