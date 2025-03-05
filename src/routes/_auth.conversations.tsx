import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import API from '../services/api';

export const Route = createFileRoute('/_auth/conversations')({
  loader: async () => {
    const convoResponse = await API.fetchConversations();
    return {
      conversations: convoResponse.data,
    };
  },
  component: ConversationComponent,
});

function ConversationComponent() {
  return (
    <>
      <div>Conversations</div>
      <Link
        className="btn btn-secondary"
        to="/conversations/$conversationId"
        params={{ conversationId: '1' }}
      >
        Convo 1
      </Link>
      <Link className="btn btn-primary" to="/conversations/new">
        New Conversation
      </Link>
      <Outlet />
    </>
  );
}
