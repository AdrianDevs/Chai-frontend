import type { AnyFieldApi } from '@tanstack/react-form';

type FieldTextBoxProps = {
  className?: string;
  field: AnyFieldApi;
  label: string;
  value: string;
};

const FieldTextBox = ({
  field,
  label,
  value,
  className,
}: FieldTextBoxProps) => {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <label className="floating-label w-3xs" htmlFor={field.name}>
        <span className="label-text">{label}</span>
        <input
          className="input-bordered validator input input-lg input-primary"
          id={field.name}
          name={field.name}
          type="text"
          placeholder={label}
          value={value}
          autoComplete="off"
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </label>
    </div>
  );
};

export default FieldTextBox;
