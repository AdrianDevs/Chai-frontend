import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    console.groupCollapsed('Route._auth.beforeLoad');
    console.log('context', context);
    console.log('location', location);
    console.groupEnd();
    if (!context.auth?.isAuthenticated) {
      console.log('Route._auth.beforeLoad: Redirecting to /login');
      redirect({
        to: '/login',
        search: { redirect: location.href },
        throw: true,
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const router = useRouter();
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      auth.logout();
      router
        .invalidate()
        .then(() => {
          return navigate({ to: '/' });
        })
        .catch((error) => {
          console.error('Failed to logout', error);
        });
    }
  };

  return (
    <>
      <h1>Auth Layout</h1>
      <Link className="btn btn-primary" to="/">
        Home
      </Link>
      <button className="btn btn-outline btn-secondary" onClick={handleLogout}>
        Logout
      </button>
      <Outlet />
    </>
  );
}
