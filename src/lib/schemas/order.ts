import { z } from "zod";

// --- Schema Definitions ---

export const ShippingAddressSchema = z.object({
    street: z.string().min(5, "Street address must be at least 5 characters"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Must be a 6-digit Pincode"),
    country: z.string().default("India"),
    district: z.string().optional(),
    // Sometimes address snapshots include contact info, allowing it but not requiring strict format if not present
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional()
});

export const OrderItemSchema = z.object({
    id: z.string().uuid("Invalid Product ID"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    // Allow other properties to pass through but don't validate them strictly as we only need ID and Qty for logic
    name: z.string().optional(),
    price: z.union([z.string(), z.number()]).optional()
});

export const OrderPayloadSchema = z.object({
    user_id: z.string().uuid("Invalid User ID"),
    customer_email: z.string().email("Invalid email address"),
    customer_name: z.string().min(1, "Customer Name is required"),
    customer_phone: z.string().min(10, "Phone number is too short"),
    shipping_address: ShippingAddressSchema,
    items: z.array(OrderItemSchema).min(1, "Cart cannot be empty"),
    total_amount: z.number().nonnegative(),
    payment_method: z.enum(['cod', 'upi', 'razorpay']).default('cod'),
    payment_status: z.enum(['pending', 'paid', 'failed']).default('pending'),
    payment_id: z.string().optional(),
    // Allow extra fields
}).passthrough();

// Infer Types
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type OrderPayload = z.infer<typeof OrderPayloadSchema>;
