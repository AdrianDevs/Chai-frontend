import {
  Link,
  createFileRoute,
  getRouteApi,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { FaTrash } from 'react-icons/fa6';
import { useState } from 'react';
import Title from '../components/title';
import API from '../services/api';

export const Route = createFileRoute('/_auth/conversations/')({
  component: ConversationUnselectedComponent,
});

const fallback = '/';

function ConversationUnselectedComponent() {
  const routeApi = getRouteApi('/_auth/conversations');
  const router = useRouter();
  const { conversations } = routeApi.useLoaderData();
  const navigate = useNavigate({ from: '/conversations' });
  const [isDeletingConversationLoading, setIsDeletingConversationLoading] =
    useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState<
    number | null
  >(null);

  const navigateToFallback = () => {
    navigate({ to: fallback, replace: true }).catch((err) => {
      console.error('Failed to navigate', err);
    });
    return;
  };

  const handleDeleteConversation = (conversationId: number | null) => {
    if (!conversationId) {
      return;
    }

    setIsDeletingConversationLoading(true);
    API.deleteConversation(conversationId)
      .then(() => router.invalidate())
      .catch((err) => {
        console.error('Failed to delete conversation', err);
      })
      .finally(() => {
        setIsDeletingConversationLoading(false);
        setIsDeletingConversation(null);
      });
  };

  const renderDeleteConversationDialog = () => {
    return (
      <dialog id="delete-conversation-dialog" className="modal">
        <div className="modal-box">
          <h3 className="font-bold">
            Are you sure you want to delete this conversation?
          </h3>
          <p className="py-4">This action cannot be undone.</p>
          <div className="modal-action">
            <button
              className="btn btn-secondary"
              onClick={() => setIsDeletingConversation(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={() => handleDeleteConversation(isDeletingConversation)}
            >
              {isDeletingConversationLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </dialog>
    );
  };

  if (isDeletingConversation) {
    const dialog = document.getElementById('delete-conversation-dialog');
    if (dialog) {
      const dialogElement = dialog as HTMLDialogElement;
      dialogElement.showModal();
    }
  } else {
    const dialog = document.getElementById('delete-conversation-dialog');
    if (dialog) {
      const dialogElement = dialog as HTMLDialogElement;
      dialogElement.close();
    }
  }

  return (
    <div className="flex max-w-md flex-col content-center items-center justify-center gap-4 p-4">
      <Title onClick={navigateToFallback}>Messages</Title>

      <main className="flex w-full flex-col items-center justify-center gap-8 rounded-lg bg-info p-4">
        <section>
          <p className="text-center text-xl text-info-content">
            {conversations?.length && conversations.length > 0
              ? 'Select or start a conversation'
              : 'Start a conversation'}
          </p>
        </section>

        <section className="flex w-full flex-col items-center justify-center gap-4">
          {conversations?.length && conversations.length > 0 ? (
            <>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="grid w-full grid-cols-5 items-center gap-2"
                >
                  <div className="col-span-1 col-start-1" />
                  <Link
                    className="btn col-start-2 col-end-5 h-full btn-secondary"
                    to="/conversations/$conversationId"
                    params={{ conversationId: conversation.id.toString() }}
                  >
                    {conversation.name}
                  </Link>
                  <button
                    className="btn col-span-1 col-start-5 btn-outline btn-error"
                    onClick={() => setIsDeletingConversation(conversation.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </>
          ) : null}
        </section>

        <Link className="btn btn-primary" to="/conversations/new">
          New message
        </Link>
      </main>
      {renderDeleteConversationDialog()}
    </div>
  );
}
