import { Outlet, createFileRoute } from '@tanstack/react-router';
import API from '../services/api';

export const Route = createFileRoute('/_auth/conversations')({
  loader: async () => {
    const convoResponse = await API.fetchConversations();
    return {
      conversations: convoResponse.data,
    };
  },
  component: ConversatiosnComponent,
});

function ConversatiosnComponent() {
  const { conversations } = Route.useLoaderData();

  console.log('ConversatiosnComponent - conversations', conversations);

  return <Outlet />;
}
