"use server";

import { signInFormSchema, signUpFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";

// User sign in action
export async function signInWithCredentials(prevState: unknown, formData: FormData) {
    try {
        const user = signInFormSchema.parse({
            email: formData.get("email"),
            password: formData.get("password"),
        });
        await signIn("credentials", user);
        return { success: true, message: "Sign in successfully" };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return { success: false, message: "Invalid email or password" };
    }
}

// User sign out action
export async function signOutUser() {
    await signOut();
}

// User sign up action
export async function signUpUser(prevState: unknown, formData: FormData) {
    try {
        const user = signUpFormSchema.parse({
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
        });

        const plainPassword = user.password; // get the password before hashed to automatically sign in the user after signing up
        user.password = hashSync(user.password);

        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.password,
            },
        });

        await signIn("credentials", {
            email: user.email,
            password: plainPassword,
        });

        return {
            success: true,
            message: "User registered successfully.",
        };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return { success: false, message: "User is not registered" };
    }
}
