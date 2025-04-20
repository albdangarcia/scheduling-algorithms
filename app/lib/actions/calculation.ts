"use server";
import { CreateFormSchema, InputFormError } from "../zodSchema/zod-schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { ScheduleKeysTypes } from "../definitions";

const createFormInput = async (
  // algorithmSelected: ScheduleKeysTypes,
  prevState: InputFormError,
  formData: FormData
) => {
  // // Get the user session
  // const session = await auth();

  // // If the user is not authenticated, throw an error
  // if (!session || !session.user) {
  //     throw new Error("Not authenticated");
  // }

  // // Extract and return the user ID from the session
  // return session.user.id as string;

  // Validate form fields using Zod
  const validatedFields = CreateFormSchema.safeParse({
    arrivalTimeValues: formData.get("arrivalTimeValues"),
    burstTimeValues: formData.get("burstTimeValues"),
    priorityValues: formData.get("priorityValues"),
    timeSlice: formData.get("timeSlice"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create calculation.",
    };
  }

  // // Extract validated fields
  const { arrivalTimeValues, burstTimeValues, priorityValues, timeSlice } =
    validatedFields.data;

  // Revalidate the cache
  revalidatePath("/");
  // Redirect the user
  redirect("/");
};

export { createFormInput };
