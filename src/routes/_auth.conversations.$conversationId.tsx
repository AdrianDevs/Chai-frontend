/* eslint-disable react/no-children-prop */
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import API from '../services/api';
import Title from '../components/title';
import { useAuth } from '../hooks/useAuth';
import FieldTextBox from '../components/fieldTextBox';
import type { Message } from '../services/api/types';

const fallback = '/conversations';

export const Route = createFileRoute('/_auth/conversations/$conversationId')({
  beforeLoad: ({ context, location }) => {
    console.groupCollapsed('Route._auth.beforeLoad');
    console.log('context', context);
    console.log('location', location);
    console.groupEnd();
    if (!context.auth?.isAuthenticated) {
      console.log(
        'Route._auth.conversations.$conversationId.beforeLoad: Redirecting to /login'
      );
      redirect({
        to: '/login',
        search: { redirect: location.href },
        throw: true,
      });
    }
  },
  loader: async ({ params }) => {
    const conversationResponse = await API.fetchConversationById(
      Number(params.conversationId)
    );
    console.log('conversationResponse', conversationResponse);

    const messagesResponse = await API.fetchConversationMessages(
      Number(params.conversationId),
      0,
      10
    );
    console.log('messagesResponse', messagesResponse);

    return {
      conversation: conversationResponse.data,
      messages: messagesResponse.data,
    };
  },
  component: ConversationSelectedComponent,
});

function ConversationSelectedComponent() {
  const { conversation, messages } = Route.useLoaderData();
  const auth = useAuth();
  const router = useRouter();
  const navigate = useNavigate({ from: '/conversations/$conversationId' });
  console.log('ConversationSelectedComponent - conversation', conversation);
  console.log('ConversationSelectedComponent - messages', messages);

  const navigateToFallback = () => {
    navigate({ to: fallback, replace: true }).catch((err) => {
      console.error('Failed to navigate', err);
    });
    return;
  };

  const form = useForm({
    defaultValues: {
      userId: auth.user?.id,
      conversationId: conversation?.id ?? 0,
      content: '',
    },
    onSubmit: async (values) => {
      console.log('Form submitting new message', values);

      try {
        if (!values.value.userId || !values.value.conversationId) {
          throw new Error('User ID and conversation ID are required');
        }

        const messageResponse = await API.createConversationMessage(
          values.value.conversationId,
          {
            content: values.value.content,
            userId: values.value.userId,
            conversationId: values.value.conversationId,
          }
        );
        console.log('messageResponse', messageResponse);
        form.reset();
        await router.invalidate({ sync: true });
      } catch (err) {
        console.error('Failed to create message', err);
      }
    },
  });

  if (!conversation) {
    return <div>Conversation not found</div>;
  }

  const renderMessages = () => {
    if (!messages || messages.length === 0) {
      return <div>No messages</div>;
    }
    console.log('messages', messages);
    // const reversedMessages = messages.reverse();
    const reversedMessages = messages.reduceRight((acc, item) => {
      acc.push(item);
      return acc;
    }, [] as Array<Message>);

    console.log('reversedMessages', reversedMessages);

    return (
      <div className="mt-4 w-full pr-4 pl-4">
        {reversedMessages.map((message) => {
          if (message.userId === auth.user?.id) {
            return (
              <div className={`chat-end chat`} key={message.id}>
                <div className={`chat-bubble chat-bubble-primary`}>
                  {message.content}
                </div>
              </div>
            );
          } else {
            return (
              <div className={`chat-start chat`} key={message.id}>
                <div className={`chat-bubble chat-bubble-secondary`}>
                  {message.content}
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const createMessage = () => {
    return (
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit().catch((err) => {
              console.error('Failed to submit form', err);
            });
          }}
        >
          <div className="mt-8 flex flex-row items-baseline gap-4">
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

  return (
    <div className="m-8 flex min-w-xs flex-col items-center justify-center bg-base-100">
      <div className="flex max-w-md flex-col content-center items-center justify-center gap-4">
        <Title cols={5} onClick={navigateToFallback}>
          {conversation.name}
        </Title>
        {renderMessages()}
        {createMessage()}
      </div>
    </div>
  );
}
