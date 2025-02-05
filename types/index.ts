import { z } from "zod";
import { insertProductSchema, cartItemSchema, insertCartSchema } from "@/lib/validators";

export type Product = z.infer<typeof insertProductSchema> & {
    id: string;
    rating: string;
    createdAt: Date;
};

export type Cart = z.infer<typeof cartItemSchema>;
export type CartItem = z.infer<typeof insertCartSchema>;
