"use client";

import React from "react";
import { Field, Label, Description, Input } from "@headlessui/react";
import clsx from "clsx";
import { PropsScheduleInputTypes } from "../lib/definitions";
import FieldError from "./field-error";

/**
 * Generates the dynamic class string for the <Field> component.
 * @param hasError Boolean indicating if the field has an error.
 * @returns A string of Tailwind CSS classes.
 */
const getFieldClasses = (hasError: boolean | undefined): string =>
  clsx(
    // Base structure: padding, rounding, background, transition
    "pt-2.5 pb-1.5 px-3 rounded-md bg-white dark:bg-gray-900 transition-all duration-150 ease-in-out",
    // Conditional styling for rings
    hasError
      ? [
          // --- ERROR STATE ---
          "ring-2 ring-inset ring-offset-0",
          "ring-red-700 dark:ring-red-600", // Default error ring color
          // Focused error ring color
          "focus-within:ring-red-500 dark:focus-within:ring-red-500",
        ]
      : [
          // --- NON-ERROR STATE ---
          // Unfocused "double ring-3" (1px inner light + 1px outer dark = 2px total visual width)
          "ring-1 ring-inset", // Base ring: 1px, inset.
          "ring-white dark:ring-gray-800", // inner ring color
          "ring-offset-1", // outer ring via offset: 1px.
          "ring-offset-gray-300 dark:ring-offset-gray-950",
          "group-hover:dark:ring-gray-600", // Apply hover styling only when not active

          // Focused state (overrides unfocused styles)
          "focus-within:ring-2", // On focus, ring becomes 2px.
          "focus-within:ring-indigo-500 dark:focus-within:ring-indigo-500", // Ring color becomes indigo.
          "focus-within:ring-offset-0", // Offset is removed on focus for a solid ring.
        ]
  );

interface FormFieldProps {
  id: string;
  name: keyof PropsScheduleInputTypes;
  label: string;
  srOnlyDescription: string; // Description for screen readers
  placeholder: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    inputKey: keyof PropsScheduleInputTypes
  ) => void;
  errors?: string[];
  inputClassName?: string; // Optional specific classes for the <Input> element (e.g., text-center)
  fieldContainerClassName: string; // Unique styling of the div wrapping this field
  required?: boolean;
}

/**
 * FormField is a reusable component for rendering a labeled input field
 * with validation error display and specific styling.
 */
const FormField = ({
  id,
  name,
  label,
  srOnlyDescription,
  placeholder,
  value,
  onChange,
  errors,
  inputClassName,
  fieldContainerClassName,
  required = true,
}: FormFieldProps) => {
  const fieldDynamicClasses = getFieldClasses(!!errors && errors.length > 0);

  return (
    // This div receives the unique styling passed from the parent.
    <div className={clsx("group", fieldContainerClassName)}>
      <Field className={fieldDynamicClasses}>
        <Label
          htmlFor={id}
          className="text-sm tracking-wide font-medium text-gray-800 dark:text-gray-300 block"
        >
          {label}
        </Label>
        <Description className="sr-only">{srOnlyDescription}</Description>
        <Input
          id={id}
          name={name}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e, name)} // Pass the 'name' (key) back to the handler
          aria-describedby={`${id}-error`}
          className={clsx(
            "bg-transparent input-style block w-full border-none p-0 text-base",
            "text-gray-900 dark:text-gray-400 dark:focus:text-gray-300 placeholder:text-sm focus:outline-hidden focus:ring-0",
            inputClassName // Apply any specific input classes (e.g., text-center)
          )}
        />
      </Field>
      <FieldError id={`${id}-error`} errors={errors} />
    </div>
  );
};

export default FormField;
