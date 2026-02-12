import { createClient } from "@/lib/supabase";
import { OrderPayloadSchema, OrderPayload } from "@/lib/schemas/order";

export interface OrderData extends OrderPayload { }

export const OrderService = {
    async createOrder(data: OrderData) {
        // 1. Zod Validation Gate
        const validatedData = OrderPayloadSchema.parse(data);
        const supabase = createClient();

        // 2. Prepare items for RPC (mapping to database types)
        const orderItems = validatedData.items.map(item => {
            const priceStr = String(item.price || "0");
            const priceValue = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));

            return {
                product_id: item.id,
                product_name: item.name || "Unknown Product",
                quantity: item.quantity,
                price_at_purchase: isNaN(priceValue) ? 0 : priceValue
            };
        });

        // 3. Call Atomic RPC
        // This handles stock validation, stock decrement, order insertion, and item insertion in ONE transaction.
        const { data: order, error: rpcError } = await supabase.rpc('create_order_v1', {
            p_user_id: validatedData.user_id,
            p_customer_email: validatedData.customer_email,
            p_customer_name: validatedData.customer_name,
            p_customer_phone: validatedData.customer_phone,
            p_shipping_address: validatedData.shipping_address,
            p_payment_method: validatedData.payment_method,
            p_payment_status: validatedData.payment_status,
            p_payment_id: validatedData.payment_id || null,
            p_items: orderItems
        });

        if (rpcError) {
            console.error("Order RPC Error:", rpcError);
            throw new Error(rpcError.message || "Failed to process order transaction.");
        }

        // Return the created order object returned by the RPC
        return order;
    },

    async saveAddress(userId: string, addressData: any) {
        const supabase = createClient();

        // Basic check to see if this exact address exists to avoid duplicates? 
        // For MVP, just insert.
        const { error } = await supabase
            .from('addresses')
            .insert({
                user_id: userId,
                name: `${addressData.firstName} ${addressData.lastName}`,
                phone: addressData.phone,
                street: addressData.street,
                city: addressData.city,
                district: addressData.district,
                state: addressData.state,
                pincode: addressData.pincode,
                is_default: false // Logic to make default can be added later
            });

        if (error) throw error;
    },

    async getOrders() {
        // This is a client-side fetch wrapper, usually for Admin.
        // It relies on RLS to allow viewing all orders (if admin).
        const supabase = createClient();

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items (
                    id,
                    product_id,
                    product_name,
                    quantity,
                    price_at_purchase
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async updateOrderPayment(orderId: string, paymentId: string, status: 'paid' | 'failed' = 'paid') {
        const supabase = createClient();
        const { error } = await supabase
            .from('orders')
            .update({
                payment_id: paymentId,
                payment_status: status,
            })
            .eq('id', orderId);

        if (error) throw error;
    },

    async updateOrderStatus(orderId: string, status: string, note?: string) {
        const supabase = createClient();

        // The database trigger will automatically create an order_history record
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) throw error;
    }
};
