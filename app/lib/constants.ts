import { InputFormError } from "./zod-schema";

// SideBar Constants
export const INDEX_NOT_APPLICABLE = -1;
export const INITIAL_LOOP_INDEX = -1;

// Items per page for the sidebar
export const ITEMS_PER_PAGE = 5;

// Process id for idle process
export const IDLE_PROCESS_ID = -1;

// Initial state for the form action, handling errors, success messages, and returned data.
export const initialActionState: InputFormError = {
  message: null,
  errors: {},
  success: null,
  data: null,
};

