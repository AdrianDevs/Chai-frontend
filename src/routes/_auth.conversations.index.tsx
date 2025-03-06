import {
  Link,
  Outlet,
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router';
import Title from '../components/title';

export const Route = createFileRoute('/_auth/conversations/')({
  component: ConversationUnselectedComponent,
});

const fallback = '/';

function ConversationUnselectedComponent() {
  const routeApi = getRouteApi('/_auth/conversations');
  const { conversations } = routeApi.useLoaderData();
  const navigate = useNavigate({ from: '/conversations' });

  console.log('ConversationUnselectedComponent - conversations', conversations);

  const navigateToFallback = () => {
    navigate({ to: fallback, replace: true }).catch((err) => {
      console.error('Failed to navigate', err);
    });
    return;
  };

  return (
    <div className="m-8 flex min-w-xs flex-col items-center justify-center bg-base-100">
      <div className="flex max-w-md flex-col content-center items-center justify-center gap-4">
        <Title cols={5} onClick={navigateToFallback}>
          Conversations
        </Title>
        <section>
          <p>
            {conversations?.length && conversations.length > 0
              ? 'Select or start a conversation'
              : 'Start a conversation'}
          </p>
        </section>
        <Outlet />

        {conversations?.length && conversations.length > 0 ? (
          <>
            {conversations.map((conversation) => (
              <Link
                className="btn btn-secondary"
                to="/conversations/$conversationId"
                params={{ conversationId: conversation.id.toString() }}
                key={conversation.id}
              >
                {conversation.name}
              </Link>
            ))}
          </>
        ) : null}

        <Link className="btn btn-primary" to="/conversations/new">
          New conversation
        </Link>
      </div>
    </div>
  );
}
