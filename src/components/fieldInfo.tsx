import type { AnyFieldApi } from '@tanstack/react-form';

export function FieldInfo({
  field,
  className,
}: {
  field: AnyFieldApi;
  className?: string;
}) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em className={className}>{field.state.meta.errors.join(',')}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  );
}
