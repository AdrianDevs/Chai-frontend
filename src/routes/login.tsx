/* eslint-disable react/no-children-prop */
import { useForm } from '@tanstack/react-form';
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import type { AnyFieldApi } from '@tanstack/react-form';

const fallbacke = '/';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth?.isAuthenticated) {
      console.log('Login.beforeload: Redirecting to fallback');
      redirect({ to: fallbacke, throw: true });
    }
  },
  component: LoginComponent,
});

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors.join(',')}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  );
}

function LoginComponent() {
  const auth = useAuth();
  const router = useRouter();
  const navigate = useNavigate({ from: '/signup' });

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async (values) => {
      console.log('Form submitting', values);

      try {
        await auth.login(values.value.username, values.value.password);
        await router.invalidate({ sync: true });
        await navigate({ to: fallbacke });
      } catch (error) {
        console.error('Login error', error);
      }
    },
  });

  const onCancel = () => {
    navigate({ to: fallbacke, replace: true }).catch((error) => {
      console.error('Failed to navigate', error);
    });
  };

  return (
    <>
      <div>Login</div>
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
            name="username"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Username is required'
                  : value.length < 3
                    ? 'Username must be at least 3 characters'
                    : undefined,
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                if (value.includes('error')) {
                  return 'No "error" allowed in username';
                }
                if (value === 'test') {
                  return 'Username is taken';
                }
              },
            }}
            children={(field) => {
              return (
                <>
                  <label htmlFor={field.name}>Username</label>
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

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Password is required'
                  : value.length < 3
                    ? 'Password must be at least 3 characters'
                    : undefined,
            }}
            children={(field) => {
              return (
                <>
                  <label htmlFor={field.name}>Password</label>
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

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <>
                <button type="button" onClick={onCancel}>
                  Cancel
                </button>
                <button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <button type="reset" onClick={() => form.reset()}>
                  Reset
                </button>
              </>
            )}
          />
        </div>
      </form>
    </>
  );
}
