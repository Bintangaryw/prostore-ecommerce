/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Convert prisma object into a regular JS object
export function convertToPlainObject<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
    const [int, decimal] = num.toString().split(".");
    return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

// Format errors
export function formatError(error: any) {
    if (error.name === "ZodError") {
        // Handle zod error
        const fieldErrors = Object.keys(error.errors).map((field) => error.errors[field].message); // recognize the error
        return fieldErrors.join(". "); // Get all the error messages and join them
    } else if (error.name === "PrismaClientKnownRequestError" && error.code === "P20002") {
        // Handle prisma error
        const field = error.meta?.target ? error.meta.target[0] : "Field"; // recognize the error

        return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`; // Write error messages
    } else {
        // Handle others errors
        return typeof error.message === "string" ? error.message : JSON.stringify(error.message);
    }
}

// Round number to 2 decimal places
export function round2(value: number | string) {
    if (typeof value === "number") {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    } else if (typeof value === "string") {
        return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
    } else {
        throw new Error("Value is not a number or a string");
    }
}
