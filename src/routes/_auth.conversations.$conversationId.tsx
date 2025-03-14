/* eslint-disable react/no-children-prop */
import {
  Link,
  Outlet,
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useEffect, useRef, useState } from 'react';
import { FaTrash } from 'react-icons/fa6';
import API from '../services/api';
import Title from '../components/title';
import { useAuth } from '../hooks/useAuth';
import FieldTextBox from '../components/fieldTextBox';
import { convertDateStringToLocaleString, getUserFromId } from '../utils/user';
import useWebSocket from '../hooks/webSocketHook';
import type { Message } from '../services/api/types';

const fallback = '/conversations';
const pageDefault = 0;
const limitDefault = 10;

export const Route = createFileRoute('/_auth/conversations/$conversationId')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth?.isAuthenticated) {
      redirect({
        to: '/login',
        search: { redirect: location.href },
        throw: true,
      });
    }
  },
  loader: async ({ params }) => {
    try {
      const conversationResponse = await API.fetchConversationById(
        Number(params.conversationId)
      );

      const messagesResponse = await API.fetchConversationMessages(
        Number(params.conversationId),
        pageDefault,
        limitDefault
      );

      const usersResponse = await API.fetchConversationUsers(
        Number(params.conversationId)
      );

      return {
        conversation: conversationResponse.data,
        messages: messagesResponse.data,
        users: usersResponse.data,
      };
    } catch (err) {
      console.error('Failed to fetch conversation', err);
      throw notFound() as Error;
    }
  },
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-2xl">Conversation not found</p>
        <Link className="btn btn-primary" to="/conversations">
          Go back
        </Link>
      </div>
    );
  },
  component: ConversationSelectedComponent,
});

function ConversationSelectedComponent() {
  const { conversation, messages, users } = Route.useLoaderData();
  const auth = useAuth();
  const router = useRouter();
  const navigate = useNavigate({ from: '/conversations/$conversationId' });
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState<boolean>(false);
  const ws = useWebSocket({
    url: 'ws://localhost:8080',
    retryAttempts: 3,
    retryInterval: 1000,
  });
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const navigateToFallback = () => {
    navigate({ to: fallback, replace: true }).catch((err) => {
      console.error('Failed to navigate', err);
    });
    return;
  };

  useEffect(() => {
    console.log('useEffect init');
  }, []);

  useEffect(() => {
    console.log('useEffect ws.connected', ws.isConnected);
    if (ws.isConnected && ws.send) {
      ws.send(`Hello from ${auth.user?.username}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws.isConnected, auth.user?.username]);

  useEffect(() => {
    console.log('useEffect ws.data', ws.data);
  }, [ws.data]);

  useEffect(() => {
    console.log('scroll to bottom');
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    console.log('scrollToBottom');
    if (messagesContainerRef.current) {
      console.log('- have ref');
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    } else {
      console.log('- do not have ref');
    }
  };

  const form = useForm({
    defaultValues: {
      userId: auth.user?.id,
      conversationId: conversation?.id ?? 0,
      content: '',
    },
    onSubmit: async (values) => {
      try {
        if (!values.value.userId || !values.value.conversationId) {
          throw new Error('User ID and conversation ID are required');
        }

        if (ws.send) {
          ws.send(
            `[webSocket client ${auth.user?.username}] ${values.value.content}`
          );
        }

        await API.createConversationMessage(values.value.conversationId, {
          content: values.value.content,
          userId: values.value.userId,
          conversationId: values.value.conversationId,
        });
        form.reset();
        await router.invalidate({ sync: true });
        // Scroll to bottom after message is sent
        scrollToBottom();
      } catch (err) {
        console.error('Failed to create message', err);
      }
    },
  });

  if (!conversation) {
    return <div>Conversation not found</div>;
  }

  const handleDeleteUser = (userId: number) => {
    setUserToDelete(userId);
  };

  const handleDeleteUserConfirm = () => {
    if (!userToDelete) {
      return;
    }
    setIsDeletingUser(true);

    API.deleteConversationUser(conversation.id, userToDelete)
      .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
      .then(() => router.invalidate())
      .catch((err) => {
        console.error('Failed to delete user', err);
      })
      .finally(() => {
        setUserToDelete(null);
        setIsDeletingUser(false);
      });
  };

  const handleDeleteUserCancel = () => {
    setUserToDelete(null);
  };

  const renderDeleteUserDialog = () => {
    return (
      <dialog id="delete-user-dialog" className="modal">
        <div className="modal-box">
          <h3 className="font-bold">
            Are you sure you want to remove{' '}
            {users?.find((user) => user.id === userToDelete)?.username} from
            this conversation?
          </h3>
          <p className="py-4">This action cannot be undone.</p>
          <div className="modal-action">
            <button
              className="btn btn-secondary"
              onClick={handleDeleteUserCancel}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={isDeletingUser}
              onClick={handleDeleteUserConfirm}
            >
              {isDeletingUser ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    );
  };

  const handleAddUser = () => {
    navigate({
      to: '/conversations/$conversationId/users/new',
      params: {
        conversationId: conversation.id.toString(),
      },
    }).catch((err) => {
      console.error('Failed to navigate', err);
    });
  };

  const renderUsers = () => {
    if (!users || users.length === 0) {
      return null;
    }

    const usersElements = (
      <>
        {users.map((user) => {
          if (user.id === auth.user?.id) {
            return (
              <div className="badge badge-primary" key={user.id}>
                {user.username}
              </div>
            );
          }

          return (
            <div
              className="badge cursor-pointer badge-secondary hover:bg-secondary-content/50"
              key={user.id}
              onClick={() => handleDeleteUser(user.id)}
            >
              {user.username}
              <FaTrash />
            </div>
          );
        })}
      </>
    );

    const addUserButton = (
      <button
        className="btn-accent-content btn btn-xs btn-outline"
        onClick={handleAddUser}
      >
        Add User
      </button>
    );

    return (
      <div className="flex flex-row flex-wrap justify-center gap-2">
        {usersElements}
        {addUserButton}
      </div>
    );
  };

  const renderMessages = () => {
    if (!messages || messages.length === 0) {
      return <div>No messages</div>;
    }

    const reversedMessages = messages.reduceRight((acc, item) => {
      acc.push(item);
      return acc;
    }, [] as Array<Message>);

    return (
      <div
        className="mt-4 flex h-full w-full grow flex-col overflow-y-auto"
        ref={messagesContainerRef}
      >
        <div className="flex h-auto grow flex-col place-items-end justify-end">
          {reversedMessages.map((message) => {
            const username = users
              ? (getUserFromId(users, message.userId)?.username ?? 'Unknown')
              : 'Unknown';

            const createdAt = convertDateStringToLocaleString(
              message.createdAt.toString()
            );

            if (message.userId === auth.user?.id) {
              return (
                <div className={`chat-end chat`} key={message.id}>
                  <div className={`chat-bubble chat-bubble-primary`}>
                    {message.content}
                    <p className="text-xs text-primary-content/50">
                      From {username} at {createdAt}
                    </p>
                  </div>
                </div>
              );
            } else {
              return (
                <div className={`chat-start chat`} key={message.id}>
                  <div className={`chat-bubble chat-bubble-secondary`}>
                    {message.content}
                    <p className="text-xs text-primary-content/50">
                      From {username} at {createdAt}
                    </p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  const createMessage = () => {
    return (
      <div className="grow-0 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit().catch((err) => {
              console.error('Failed to submit form', err);
            });
          }}
        >
          <div className="flex flex-row items-baseline gap-4">
            <form.Field
              name="content"
              validators={{
                onChange: ({ value }) => (!value ? false : null),
              }}
              children={(field) => {
                return (
                  <div>
                    <FieldTextBox
                      field={field}
                      label="Content"
                      value={field.state.value}
                    />
                  </div>
                );
              }}
            />
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => {
                return (
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={!canSubmit}
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </button>
                );
              }}
            />
          </div>
        </form>
      </div>
    );
  };

  if (userToDelete) {
    const dialog = document.getElementById('delete-user-dialog');
    if (dialog) {
      const dialogElement = dialog as HTMLDialogElement;
      dialogElement.showModal();
    }
  } else {
    const dialog = document.getElementById('delete-user-dialog');
    if (dialog) {
      const dialogElement = dialog as HTMLDialogElement;
      dialogElement.close();
    }
  }

  return (
    // <div className="m-4 flex min-w-xs flex-col items-center justify-center bg-base-100">
    <div className="flex h-[calc(100vh-4rem)] max-w-md flex-col content-center items-center justify-start gap-4 p-4">
      {/* <div className="flex flex-col items-center gap-4 pr-8 pl-8"> */}
      <Title onClick={navigateToFallback}>{conversation.name}</Title>
      <div className="flex w-full flex-row flex-wrap justify-center gap-2 rounded-lg bg-accent pt-4 pb-4">
        {renderUsers()}
        <Outlet />
      </div>

      <div className="flex h-[300px] w-full grow flex-col items-center gap-4 rounded-lg bg-info">
        {renderMessages()}
        {createMessage()}
      </div>
      {/* </div> */}
      {renderDeleteUserDialog()}
    </div>
    // </div>
  );
}
