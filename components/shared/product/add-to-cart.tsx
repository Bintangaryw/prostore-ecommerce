"use client";

import { Cart, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCard, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
    const router = useRouter();
    const { toast } = useToast();

    const [isPending, startTransition] = useTransition();

    // Handle add to cart
    const handleAddToCart = async () => {
        startTransition(async () => {
            const res = await addItemToCard(item);

            if (!res?.success) {
                toast({
                    variant: "destructive",
                    description: res?.message,
                });
                return;
            }

            // Handle success add to cart
            toast({
                description: `${item.name} added to cart.`,
                action: (
                    <ToastAction className="bg-primary text-white hover:bg-gray-800" altText="Go to Cart" onClick={() => router.push("/cart")}>
                        Go to Cart
                    </ToastAction>
                ),
            });
        });
    };

    // Handle remove from cart
    const handleRemoveFromCart = async () => {
        startTransition(async () => {
            const res = await removeItemFromCart(item.productId);

            toast({
                variant: res.success ? "default" : "destructive",
                description: res.message,
            });
        });
    };

    // Check if items already in the cart
    const existItem = cart && cart.items.find((x) => x.productId === item.productId);

    return existItem ? (
        <div>
            <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
                {isPending ? <Loader className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            </Button>
            <span className="px-2">{existItem.qty}</span>
            <Button type="button" variant="outline" onClick={handleAddToCart}>
                {isPending ? <Loader className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
        </div>
    ) : (
        <div>
            <Button className="w-full" type="button" onClick={handleAddToCart}>
                {isPending ? <Loader className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                Add to Cart
            </Button>
        </div>
    );
};

export default AddToCart;
