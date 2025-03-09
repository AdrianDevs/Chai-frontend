import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useState } from 'react';
import Title from '../components/title';
import API from '../services/api';
import { useAuth } from '../hooks/useAuth';

const fallback = '/';

export const Route = createFileRoute('/_auth/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: '/profile' });
  const router = useRouter();
  const auth = useAuth();
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const [isDeletingProfileDialogOpen, setIsDeletingProfileDialogOpen] =
    useState(false);

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

  const handleDeleteProfile = () => {
    setIsDeletingProfileDialogOpen(true);
  };

  const handleDeleteProfileCancel = () => {
    setIsDeletingProfileDialogOpen(false);
  };

  const handleDeleteProfileConfirm = () => {
    setIsDeletingProfile(true);

    API.deleteProfile()
      .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
      .then(() => API.invalidateRefreshToken())
      .then(() => router.invalidate())
      .then(() => auth.logout())
      .catch((err) => {
        console.error('Failed to delete profile', err);
      })
      .finally(() => {
        setIsDeletingProfile(false);
        setIsDeletingProfileDialogOpen(false);
        navigate({ to: fallback, replace: true }).catch((err) => {
          console.error('Failed to navigate', err);
        });
      });
  };

  const renderDeleteProfileDialog = () => {
    return (
      <dialog id="delete-profile-dialog" className="modal">
        <div className="modal-box">
          <h3 className="font-bold">
            Are you sure you want to delete your profile and all data?
          </h3>
          <p className="py-4">This action cannot be undone.</p>
          <div className="modal-action">
            <button
              className="btn btn-secondary"
              onClick={handleDeleteProfileCancel}
            >
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={handleDeleteProfileConfirm}
              disabled={isDeletingProfile}
            >
              {isDeletingProfile ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    );
  };

  if (isDeletingProfileDialogOpen) {
    const dialog = document.getElementById('delete-profile-dialog');
    if (dialog) {
      const dialogElement = dialog as HTMLDialogElement;
      dialogElement.showModal();
    }
  } else {
    const dialog = document.getElementById('delete-profile-dialog');
    if (dialog) {
      const dialogElement = dialog as HTMLDialogElement;
      dialogElement.close();
    }
  }

  return (
    <div className="flex max-w-md min-w-xs flex-col content-center items-center justify-center gap-4 p-4">
      <Title onClick={navigateToFallback}>Profile</Title>
      <section className="m-4 flex flex-row items-baseline gap-4">
        <p className="text-lg">Delete profile and all data</p>
        <button className="btn btn-error" onClick={handleDeleteProfile}>
          Delete
        </button>
      </section>
      {renderDeleteProfileDialog()}
    </div>
  );
}
