import { Link, createFileRoute } from '@tanstack/react-router';
import API from '../services/api';
import { useAuth } from '../hooks/useAuth';

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
  const auth = useAuth();

  const logout = () => {
    auth.logout();
  };

  return (
    <>
      <section>
        <h1>Welcome to the chat</h1>
      </section>
      <section>
        {auth.isAuthenticated ? (
          <>
            <div>Welcome {auth.user?.username}</div>
            <div>Show message button</div>
            <button className="btn btn-outline btn-secondary" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <div>
            <Link className="btn btn-primary" to="/signup">
              Sign up
            </Link>
            <Link className="btn btn-secondary" to="/login">
              Login
            </Link>
          </div>
        )}
      </section>
      <section>
        <p>
          <strong>Number of Users:</strong> {info?.numOfUsers}
        </p>
        <p>
          <strong>Number of Conversations:</strong> {info?.numOfConversations}
        </p>
        <p>
          <strong>Number of Messages:</strong> {info?.numOfMessages}
        </p>
        <p>
          <strong>Last Message At:</strong> {info?.lastMessageAt}
        </p>
      </section>
      <section>
        <h1>Info</h1>
        <p>
          <strong>Title:</strong> {info?.title}
        </p>
        <p>
          <strong>Description:</strong> {info?.description}
        </p>
        <p>
          <strong>Version:</strong> {info?.version}
        </p>
        <p>
          <strong>License:</strong> {info?.license.name}
        </p>
      </section>
    </>
  );
}
