/* eslint-disable react/no-children-prop */
import { useForm } from '@tanstack/react-form';
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useState } from 'react';
import { FaTrash } from 'react-icons/fa6';
import { useAuth } from '../hooks/useAuth';
import { FieldError } from '../components/fieldError';
import API from '../services/api';
import Title from '../components/title';
import FieldTextBox from '../components/fieldTextBox';
import type { AnyFieldApi } from '@tanstack/react-form';
import type { CustomError } from '../types/error';

const fallback = '/conversations';

export const Route = createFileRoute('/_auth/conversations/new')({
  component: NewConversationComponent,
});

function NewConversationComponent() {
  const auth = useAuth();
  const router = useRouter();
  const navigate = useNavigate({ from: '/signup' });
  const [error, setError] = useState<CustomError | null>(null);

  const form = useForm({
    defaultValues: {
      conversationName: '',
      invitees: [] as Array<{
        id: number;
        username: string;
      }>,
    },
    validators: {
      onChange: ({ value }) => {
        if (!value.invitees.length) {
          return {
            form: 'At least one invitee is required',
            fields: {
              invitees: 'At least one invitee is required',
            },
          };
        }
      },
    },
    onSubmit: async (values) => {
      console.log('Form submitting new conversation', values);
      try {
        const usersResponse = await API.fetchUsersByUsernames(
          values.value.invitees.map((invitee) => invitee.username)
        );
        console.log('users', usersResponse.data);
        if (!usersResponse.data || usersResponse.data.length === 0) {
          throw new Error('No users found');
        }

        const conversationResponse = await API.createConversation(
          values.value.conversationName,
          usersResponse.data
        );
        console.log('conversation', conversationResponse.data);

        await router.invalidate({ sync: true });
        await navigate({ to: fallback });
      } catch (err) {
        console.error('Failed to create conversation', err);
      }
    },
  });

  const navigateToFallback = () => {
    navigate({ to: fallback, replace: true }).catch((err) => {
      console.error('Failed to navigate', err);
    });
    return;
  };

  const handleRemoveInvitee = (index: number, field: AnyFieldApi) => {
    field.removeValue(index).catch((err) => {
      console.error('Failed to remove invitee', err);
    });
  };

  return (
    <div className="m-8 flex min-w-xs flex-col items-center justify-center bg-base-100">
      <div className="flex max-w-md flex-col content-center items-center justify-center gap-4">
        <Title cols={5} onClick={navigateToFallback}>
          New Convo
        </Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit().catch((err) => {
              console.error('Failed to submit form', err);
            });
          }}
        >
          <div className="mt-4 mb-2 flex flex-col items-center gap-2">
            <form.Field
              name="conversationName"
              listeners={{
                onChange: () => {
                  setError(null);
                },
              }}
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? 'Conversation name is required'
                    : value.length < 3
                      ? 'Conversation name must be at least 3 characters'
                      : null,
              }}
              children={(field) => {
                return (
                  <div className="flex flex-col items-center gap-2">
                    <FieldTextBox
                      field={field}
                      label="Conversation name"
                      value={field.state.value}
                    />
                    <FieldError className="text-error-content" field={field} />
                  </div>
                );
              }}
            />

            <div className="mt-4">
              <p className="text-lg font-bold">Invitees:</p>
            </div>
            <form.Field
              name="invitees"
              mode="array"
              listeners={{
                onChange: () => {
                  setError(null);
                },
              }}
            >
              {(field) => {
                return (
                  <div className="flex flex-col items-center gap-2">
                    {field.state.value.map((_, i) => {
                      return (
                        <form.Field
                          key={i}
                          name={`invitees[${i}].username`}
                          listeners={{
                            onChange: () => {
                              setError(null);
                            },
                          }}
                          validators={{
                            onChange: ({ value }) => {
                              if (value === auth.user?.username) {
                                return 'Cannot invite yourself';
                              }
                              return !value
                                ? 'Username is required'
                                : undefined;
                            },
                            onChangeAsyncDebounceMs: 500,
                            onChangeAsync: async ({ value }) => {
                              const response =
                                await API.validateUsername(value);
                              if (
                                response.status === 200 &&
                                response.data?.status === 'available'
                              ) {
                                return 'User does not exist';
                              }
                            },
                          }}
                        >
                          {(subField) => {
                            return (
                              <div className="mt-2 mb-2 flex flex-col items-center gap-2">
                                <div className="flex w-3xs flex-row items-center gap-2">
                                  <FieldTextBox
                                    field={subField}
                                    label="Invitee username"
                                    value={subField.state.value}
                                  />
                                  <button
                                    className="btn btn-outline btn-secondary"
                                    type="button"
                                    onClick={() =>
                                      handleRemoveInvitee(i, field)
                                    }
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                                <FieldError field={subField} />
                              </div>
                            );
                          }}
                        </form.Field>
                      );
                    })}
                    <button
                      className="btn btn-primary"
                      type="button"
                      disabled={field.state.value.length >= 10}
                      onClick={() => field.pushValue({ username: '', id: 0 })}
                    >
                      Add person
                    </button>
                  </div>
                );
              }}
            </form.Field>

            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.errorMap,
              ]}
              children={([canSubmit, isSubmitting, errorMap]) => {
                return (
                  <>
                    {errorMap &&
                    typeof errorMap !== 'boolean' &&
                    errorMap.onChange ? (
                      <div className="text-error-content">
                        <em className="text-error-content">
                          {errorMap.onChange as unknown as string}
                        </em>
                      </div>
                    ) : (
                      error && (
                        <div className="text-error-content">
                          Error: {error.message}
                        </div>
                      )
                    )}
                    <div className="mt-4 flex flex-row justify-center gap-4">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={navigateToFallback}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-outline btn-secondary"
                        type="reset"
                        onClick={() => form.reset()}
                      >
                        Reset
                      </button>
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={!canSubmit}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </>
                );
              }}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
