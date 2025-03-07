/* eslint-disable react/no-children-prop */
import { useForm } from '@tanstack/react-form';
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import API from '../services/api';
import { FieldError } from '../components/fieldError';
import Title from '../components/title';
import type { CustomError } from '../types/error';

const fallback = '/';

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ context }) => {
    // console.log('Before load', { context });
    if (context.auth?.isAuthenticated) {
      // TODO update navigate to accept a redirect option from search
      // redirect({ to: search.redirect || fallback, throw: true });
      console.log('SignUp.beforeload: Redirecting to fallback');
      redirect({ to: fallback, throw: true });
    }
  },
  component: SignUpComponent,
});

function SignUpComponent() {
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
      console.log('Form submitting', values);

      try {
        await API.signUp(values.value.username, values.value.password);
        await auth.login(values.value.username, values.value.password);
        await router.invalidate({ sync: true });
        // TODO update navigate to accept a redirect option from search
        // await navigate({ to: search.redirect || fallback })
        await navigate({ to: fallback });
      } catch (err) {
        console.error('Failed to sign up', err);
        const _error = err as CustomError;
        setError(_error);
      }
    },
  });

  const navigateToFallback = () => {
    // TODO update navigate to accept a redirect option from search
    // await navigate({ to: search.redirect || fallback }).catch((err) => {
    //   console.error('Failed to navigate', err);
    // });
    navigate({ to: fallback, replace: true }).catch((err) => {
      console.error('Failed to navigate', err);
    });
    return;
  };

  return (
    // <div className="m-8 flex min-w-xs flex-col items-center justify-center bg-base-100">
    <div className="flex max-w-md min-w-xs flex-col content-center items-center justify-center gap-4 p-4">
      <Title onClick={navigateToFallback}>Sign up</Title>
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
        <div className="mt-4 flex flex-col items-center justify-center gap-4">
          <form.Field
            name="username"
            listeners={{
              onChange: () => {
                setError(null);
              },
            }}
            validators={{
              onChange: ({ value }) => {
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
                console.log('Username validation response', response);
                if (
                  response.status === 200 &&
                  response.data?.status === 'taken'
                ) {
                  return 'Username is taken';
                }
                return undefined;
              },
            }}
            children={(field) => {
              return (
                <div className="flex flex-col items-center gap-2">
                  <label className="floating-label w-3xs" htmlFor={field.name}>
                    <span className="label-text">Username</span>
                    <input
                      className="input-bordered input input-lg input-primary"
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
            listeners={{
              onChange: () => {
                setError(null);
              },
            }}
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
                <div className="flex flex-col items-center gap-2">
                  <label className="floating-label w-3xs" htmlFor={field.name}>
                    <span className="label-text">Password</span>
                    <input
                      className="input-bordered input input-lg input-primary"
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
              );
            }}
          />

          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.errors,
              state.submissionAttempts,
            ]}
            children={([canSubmit, isSubmitting]) => (
              <>
                {error && (
                  <div className="text-error-content">
                    Error: {error.message}
                  </div>
                )}
                <div className="mt-4 flex w-full flex-row justify-center gap-4">
                  <button
                    className="btn w-24 btn-secondary"
                    type="button"
                    onClick={navigateToFallback}
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
              </>
            )}
          />
        </div>
      </form>
    </div>
    // </div>
  );
}
