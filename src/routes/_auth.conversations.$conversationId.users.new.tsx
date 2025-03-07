/* eslint-disable react/no-children-prop */
import { useForm } from '@tanstack/react-form';
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import FieldTextBox from '../components/fieldTextBox';
import { FieldError } from '../components/fieldError';
import { useAuth } from '../hooks/useAuth';
import API from '../services/api';

export const Route = createFileRoute(
  '/_auth/conversations/$conversationId/users/new'
)({
  component: UserComponent,
});

function UserComponent() {
  const auth = useAuth();
  const router = useRouter();
  const { conversationId } = Route.useParams();
  const navigate = useNavigate({
    from: '/conversations/$conversationId/users/new',
  });
  const form = useForm({
    defaultValues: {
      username: '',
    },
    onSubmit: async (values) => {
      console.log('Form submitting new user', values);
      try {
        const usersResponse = await API.fetchUsersByUsernames([
          values.value.username,
        ]);
        console.log('users', usersResponse.data);
        if (
          usersResponse.status !== 200 ||
          !usersResponse.data ||
          usersResponse.data.length === 0 ||
          usersResponse.data.length > 1 ||
          usersResponse.data[0]?.id === auth.user?.id
        ) {
          throw new Error('User does not exist');
        }
        const user = usersResponse.data[0];
        const conversationResponse = await API.addConversationUser(
          Number(conversationId),
          user.id
        );
        console.log('conversationResponse', conversationResponse.data);

        if (conversationResponse.status !== 201) {
          throw new Error('Failed to invite user');
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        await router.invalidate();
        await navigate({ to: '/conversations/$conversationId', replace: true });
      } catch (err) {
        console.error('Failed to invite user', err);
      }
    },
  });

  const navigateToFallback = () => {
    navigate({ to: '/conversations/$conversationId', replace: true }).catch(
      (err) => {
        console.error('Failed to navigate', err);
      }
    );
    return;
  };

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
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) => {
              if (value === auth.user?.username) {
                return 'Cannot invite yourself';
              }
              return !value ? 'Username is required' : undefined;
            },
            onChangeAsyncDebounceMs: 500,
            onChangeAsync: async ({ value }) => {
              const response = await API.validateUsername(value);
              if (
                response.status === 200 &&
                response.data?.status === 'available'
              ) {
                return 'User does not exist';
              }
            },
          }}
          children={(field) => {
            return (
              <div className="flex flex-col items-center gap-2">
                <FieldTextBox
                  field={field}
                  label="Username"
                  value={field.state.value}
                />
                <FieldError field={field} />
              </div>
            );
          }}
        />
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => {
            return (
              <>
                <div className="mt-4 flex flex-row justify-center gap-4">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={navigateToFallback}
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
                </div>
              </>
            );
          }}
        />
      </form>
    </div>
  );
}
