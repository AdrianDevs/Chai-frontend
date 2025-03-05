import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/conversations/')({
  component: ConversationUnselectedComponent,
});

function ConversationUnselectedComponent() {
  return <div>Select or start a conversation</div>;
}
