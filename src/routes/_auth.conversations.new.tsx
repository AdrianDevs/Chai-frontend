/* eslint-disable react/no-children-prop */
import { useForm } from '@tanstack/react-form';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { FieldInfo } from '../components/fieldInfo';
import API from '../services/api';
import type { AnyFieldApi } from '@tanstack/react-form';

export const Route = createFileRoute('/_auth/conversations/new')({
  component: NewConversationComponent,
});

function NewConversationComponent() {
  const auth = useAuth();
  // const router = useRouter();
  const navigate = useNavigate({ from: '/signup' });

  const form = useForm({
    defaultValues: {
      conversationName: '',
      invitees: [] as Array<{
        id: number;
        username: string;
      }>,
    },
    validators: {
      onSubmit: ({ value }) => {
        console.log('validators.onSubmit', value);
        // const errors: Array<string> = [];

        if (!value.conversationName) {
          return 'Conversation name is required';
          // errors.push('Conversation name is required');
        }
        if (value.conversationName.length < 5) {
          return 'Conversation name must be at least 3 characters';
          // errors.push('Conversation name must be at least 5 characters');
        }
        if (!value.invitees.length) {
          return 'At least one invitee is required';
          // errors.push('At least one invitee is required');
        }
        if (value.invitees.length > 5) {
          return 'No more than 5 invitees allowed';
          // errors.push('No more than 5 invitees allowed');
        }
        if (value.invitees.some((invitee) => !invitee.username)) {
          return 'Invitee username is required';
          // errors.push('Invitee username is required');
        }
        if (value.invitees.some((invitee) => invitee.username.length < 3)) {
          return 'Invitee username must be at least 3 characters';
          // errors.push('Invitee username must be at least 3 characters');
        }

        return false;
        // return errors.length ? errors : undefined;
      },
    },
    onSubmit: async (values) => {
      console.log('Form submitting new conversation', values);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        // await auth.createConversation(values.value.conversationName);
        // await router.invalidate({ sync: true });
        await navigate({ to: '/conversations' });
      } catch (error) {
        console.error('Failed to create conversation', error);
      }
    },
  });

  const onCancel = () => {
    navigate({ to: '/conversations', replace: true }).catch((error) => {
      console.error('Failed to navigate', error);
    });
  };

  const handleRemoveInvitee = (index: number, field: AnyFieldApi) => {
    field.removeValue(index).catch((error) => {
      console.error('Failed to remove invitee', error);
    });
  };

  return (
    <>
      <div>New Conversation</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit().catch((err) => {
            console.error('Failed to submit form', err);
          });
        }}
      >
        <div>
          <form.Field
            name="conversationName"
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
                <>
                  <label htmlFor={field.name}>Conversation Name</label>
                  <input
                    className="input-bordered input w-full max-w-xs input-primary"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    autoComplete="off"
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              );
            }}
          />

          <form.Field name="invitees" mode="array">
            {(field) => {
              return (
                <div>
                  {field.state.value.map((invitee, i) => {
                    console.log('invitee', invitee);
                    return (
                      <form.Field
                        key={i}
                        name={`invitees[${i}].username`}
                        // name={`invitees[${i}]`}
                        validators={{
                          onChange: ({ value }) => {
                            console.log('subField.validators.onChange', value);
                            if (value === auth.user?.username) {
                              return 'Cannot invite yourself';
                            }
                            if (value.includes('error')) {
                              return 'No "error" allowed in username';
                            }
                            if (value === 'test') {
                              return 'Username is taken';
                            }
                            return !value
                              ? 'Username is required'
                              : value.length < 3
                                ? 'Username must be at least 3 characters'
                                : undefined;
                          },
                          onChangeAsyncDebounceMs: 500,
                          onChangeAsync: async ({ value }) => {
                            const response = await API.validateUsername(value);
                            console.log('API.validateUsername', response);
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
                            <div>
                              <label>
                                <div>Name of person {i}</div>
                                <input
                                  className="input-bordered input w-full max-w-xs input-primary"
                                  id={subField.name}
                                  name={subField.name}
                                  value={subField.state.value}
                                  autoComplete="off"
                                  onBlur={subField.handleBlur}
                                  onChange={(e) => {
                                    console.group(
                                      'subField.input.handleChange'
                                    );
                                    console.log(
                                      'input value',
                                      subField.state.value
                                    );
                                    console.log(
                                      'e.target.value',
                                      e.target.value
                                    );
                                    console.groupEnd();

                                    subField.handleChange(e.target.value);
                                  }}
                                />
                              </label>
                              <button
                                className="btn btn-outline btn-secondary"
                                type="button"
                                onClick={() => handleRemoveInvitee(i, field)}
                              >
                                Remove
                              </button>
                              <FieldInfo field={subField} />
                            </div>
                          );
                        }}
                      </form.Field>
                    );
                  })}
                  <button
                    className="btn btn-outline btn-primary"
                    type="button"
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
              state.errors,
            ]}
            children={([canSubmit, isSubmitting, errors]) => (
              <>
                {errors && <div>ERRORRS: {errors}</div>}
                {errors && Array.isArray(errors) && errors.length > 0 ? (
                  <div>
                    <strong>Errors:</strong>
                    <ul>
                      {errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={onCancel}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={!canSubmit}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                    <button
                      className="btn btn-outline btn-secondary"
                      type="reset"
                      onClick={() => form.reset()}
                    >
                      Reset
                    </button>
                  </>
                )}
              </>
            )}
          />
        </div>
      </form>
    </>
  );
}
