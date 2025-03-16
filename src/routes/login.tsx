/* eslint-disable react/no-children-prop */
import { useForm } from '@tanstack/react-form';
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FieldError } from '../components/fieldError';
import Title from '../components/title';
import type { CustomError } from '../types/error';

const fallback = '/';

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context, search }) => {
    if ('refresh' in search && search.refresh) {
      await context.auth?.logout();
    } else if (context.auth?.isAuthenticated) {
      console.log(
        'Login.beforeload: Redirecting to fallback',
        context.auth.user
      );
    } else {
      console.log('Why are we here?');
    }
  },
  component: LoginComponent,
});

function LoginComponent() {
  const auth = useAuth();
  const router = useRouter();
  const navigate = useNavigate({ from: '/signup' });
  const [error, setError] = useState<CustomError | null>(null);

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async (values) => {
      try {
        await auth.login(values.value.username, values.value.password);
        await router.invalidate({ sync: true });
        await navigate({ to: fallback });
      } catch (err) {
        console.error('Login error', err);
        const _error = err as CustomError;
        setError(_error);
      }
    },
  });

  const onCancel = () => {
    navigate({ to: fallback, replace: true }).catch((err) => {
      console.error('Failed to navigate', err);
    });
  };

  return (
    // <div className="m-8 flex min-w-xs flex-col items-center justify-center bg-base-100">
    <div className="flex max-w-md min-w-xs flex-col content-center items-center justify-center gap-4 p-4">
      <Title onClick={onCancel}>Login</Title>
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit().catch((err) => {
            console.error('Failed to submit form', err);
          });
        }}
      >
        <div className="mt-4 flex min-w-xs flex-col items-center justify-center gap-4">
          <form.Field
            name="username"
            listeners={{
              onChange: () => {
                setError(null);
              },
            }}
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Username is required'
                  : value.length < 3
                    ? 'Username must be at least 3 characters'
                    : undefined,
            }}
            children={(field) => {
              return (
                <div className="flex flex-col items-center gap-2">
                  <label className="floating-label w-3xs" htmlFor={field.name}>
                    <span className="label-text">Username</span>
                    <input
                      className="input-bordered input w-full max-w-xs input-primary"
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Username"
                      value={field.state.value}
                      autoComplete="off"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </label>
                  <FieldError className="text-error-content" field={field} />
                </div>
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
                  {error && (
                    <div className="text-error-content">
                      Error: {error.message}
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <label
                      className="floating-label w-3xs"
                      htmlFor={field.name}
                    >
                      <span className="label-text">Password</span>
                      <input
                        className="input-bordered input w-full max-w-xs input-primary"
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="Password"
                        value={field.state.value}
                        autoComplete="off"
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </label>
                    <FieldError className="text-error-content" field={field} />
                  </div>
                </>
              );
            }}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <div className="mt-4 flex w-full flex-row justify-center gap-4">
                <button
                  className="btn w-24 btn-secondary"
                  type="button"
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button
                  className="btn w-24 btn-outline btn-secondary"
                  type="reset"
                  onClick={() => form.reset()}
                >
                  Reset
                </button>
                <button
                  className="btn w-24 btn-primary"
                  type="submit"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            )}
          />
        </div>
      </form>
    </div>
    // </div>
  );
}
