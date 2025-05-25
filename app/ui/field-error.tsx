interface FieldErrorProps {
  id: string;
  errors: string[] | undefined;
}

/**
 * FieldError component to display error messages for a form field.
 *
 * @param props - The properties for the FieldError component.
 * @param props.id - The ID of the error container.
 * @param props.errors - An array of error messages or undefined.
 * @returns A JSX element containing error messages or null if no errors exist.
 */
const FieldError = ({ id, errors }: FieldErrorProps) => {
  // If there are no errors or the errors array is empty, render nothing
  if (!errors || errors.length === 0) {
    return null;
  }

  // Otherwise, render the error container and map over the errors
  return (
    <div id={id} aria-live="polite" aria-atomic="true">
      {errors.map((error: string) => (
        <p className="errorMessages" key={error}>
          {error}
        </p>
      ))}
    </div>
  );
};

export default FieldError;
