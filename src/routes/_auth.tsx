import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth?.isAuthenticated) {
      console.error(
        '_auth beforeLoad not authenticated - redirecting to /login'
      );
      redirect({
        to: '/login',
        search: { redirect: location.href },
        throw: true,
      });
    }
  },
});
