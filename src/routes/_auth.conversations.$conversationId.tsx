import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/conversations/$conversationId')({
  component: ConversationSelectedComponent,
});

function ConversationSelectedComponent() {
  return (
    <>
      <div>Selected Conversation 1</div>
    </>
  );
}
