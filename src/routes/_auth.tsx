import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    // console.groupCollapsed('Route._auth.beforeLoad');
    // console.log('context', context);
    // console.log('location', location);
    // console.groupEnd();
    if (!context.auth?.isAuthenticated) {
      // console.log('Route._auth.beforeLoad: Redirecting to /login');
      redirect({
        to: '/login',
        search: { redirect: location.href },
        throw: true,
      });
    }
  },
});
