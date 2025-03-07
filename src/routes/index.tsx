import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import API from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ThemeSwapper from '../components/themeSwapper';

export const Route = createFileRoute('/')({
  loader: async () => {
    const fetchInfo = await API.fetchInfo();
    return {
      info: fetchInfo.data,
    };
  },
  component: Index,
});

function Index() {
  const { info } = Route.useLoaderData();
  const router = useRouter();
  const auth = useAuth();

  const logout = () => {
    auth.logout();
    router.invalidate().catch((error) => {
      console.error('Failed to navigate', error);
    });
  };

  return (
    // <div className="m-8 flex min-w-xs flex-col items-center justify-center bg-base-100">
    <div className="flex max-w-md flex-col content-center items-center justify-center">
      <section className="mb-4 grid w-full grid-cols-5 gap-4">
        <div className="col-span-1 col-start-1 flex-none"></div>
        <h1 className="col-start-2 col-end-5 grow text-center text-4xl font-bold text-base-content">
          Chai Chat
        </h1>
        <div className="col-span-1 col-start-5 flex-none">
          <ThemeSwapper />
        </div>
      </section>

      <section className="w-full">
        <div className="m-4 flex flex-row flex-wrap justify-center gap-4 rounded-lg bg-secondary p-4 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-secondary-content">Users</p>
            <p className="text-secondary-content/80">{info?.numOfUsers}</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-secondary-content">Conversations</p>
            <p className="text-secondary-content/80">
              {info?.numOfConversations}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-secondary-content">Messages</p>
            <p className="text-secondary-content/80">{info?.numOfMessages}</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-secondary-content">Last Message</p>
            <p className="text-secondary-content/80">
              {info?.lastMessageAt
                ? new Intl.DateTimeFormat('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  })
                    .format(new Date(info.lastMessageAt))
                    .replace(',', ' at')
                : '-'}
            </p>
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="m-4 flex flex-col items-center justify-center gap-4 rounded-lg bg-primary p-4">
          {auth.isAuthenticated ? (
            <>
              <div className="text-center text-2xl font-bold text-primary-content">
                Hello,{' '}
                <p className="inline text-primary-content">
                  {auth.user?.username}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-4">
                <Link className="btn w-24 btn-secondary" to="/conversations">
                  Messages
                </Link>
                <Link className="btn w-24 btn-info" to="/profile">
                  Profile
                </Link>
                <button
                  className="btn w-24 btn-outline btn-secondary"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <Link className="btn btn-secondary" to="/signup">
                Sign up
              </Link>
              <Link className="btn btn-outline btn-secondary" to="/login">
                Login
              </Link>
            </div>
          )}
          <Link className="btn btn-accent" to="/about">
            About
          </Link>
        </div>
      </section>

      <section className="w-full">
        <div className="m-4 flex flex-col items-center justify-center gap-4 rounded-lg bg-info p-4">
          <h1 className="text-center text-2xl font-bold text-info-content">
            Info
          </h1>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-lg font-bold text-info-content">Title</p>
              <p className="text-sm text-info-content">{info?.title}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-lg font-bold text-info-content">Description</p>
              <p className="max-w-xs text-center text-sm text-info-content">
                {info?.description}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-lg font-bold text-info-content">Version</p>
              <p className="text-sm text-info-content">{info?.version}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-lg font-bold text-info-content">License</p>
              <p className="text-sm text-info-content">{info?.license.name}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
    // </div>
  );
}
