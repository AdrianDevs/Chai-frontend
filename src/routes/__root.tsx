import React, { Suspense } from 'react';
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import type { CustomError } from '../types/error';
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
  // defaultNotFoundComponent?: React.ReactNode;
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
  errorComponent: ({ error }) => {
    const customError = error as CustomError;

    return (
      <div className="m-8 flex flex-col items-center justify-center gap-4">
        <p className="text-3xl">An unfortunate error occurred</p>
        <pre className="flex flex-col gap-2 text-xl">
          <div className="flex flex-row flex-wrap gap-2">
            <p className="font-bold">Status:</p>
            <p className="text-xl">{customError.status}</p>
          </div>
          <div className="flex flex-row flex-wrap gap-2">
            <p className="font-bold">Message:</p>
            <p className="text-xl">{customError.message}</p>
          </div>
          <div className="flex flex-row flex-wrap gap-2">
            <p className="font-bold">Details:</p>
            <p className="text-xl">{JSON.stringify(customError.details)}</p>
          </div>
        </pre>

        <Link className="btn btn-primary" to="/">
          Go home
        </Link>
      </div>
    );
  },
});
