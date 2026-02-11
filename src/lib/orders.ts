import { createClient } from "@/lib/supabase";
import { OrderPayloadSchema, OrderPayload } from "@/lib/schemas/order";

export interface OrderData extends OrderPayload { }

export const OrderService = {
    async createOrder(data: OrderData) {
        // 1. Zod Validation Gate
        // This will throw a ZodError if the data is invalid (e.g., bad pincode)
        const validatedData = OrderPayloadSchema.parse(data);

        const supabase = createClient();

        // 1. Validate Prices & Calculate Server-Side Total
        // Extract product IDs
        const productIds = data.items.map(item => item.id);

        // Fetch actual product details from DB
        const { data: dbProducts, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, stock')
            .in('id', productIds);

        if (productsError) throw new Error("Failed to validate product prices: " + productsError.message);
        if (!dbProducts || dbProducts.length !== productIds.length) {
            // Note: This might happen if a product was deleted but is still in cart.
            // For now, we strict fail.
            throw new Error("One or more items in your cart are no longer available.");
        }

        // Map DB products for easy lookup
        const productMap = new Map(dbProducts.map(p => [p.id, p]));

        let calculatedTotal = 0;
        const validatedItems = data.items.map(clientItem => {
            const dbProduct = productMap.get(clientItem.id);
            if (!dbProduct) throw new Error(`Product ${clientItem.name} not found.`);

            // Stock Validation
            if (dbProduct.stock < clientItem.quantity) {
                throw new Error(`Insufficient stock for ${dbProduct.name}. Only ${dbProduct.stock} left.`);
            }

            // Use DB price. If DB price is null/undefined, handle gracefully (assume 0 or error)
            const realPrice = dbProduct.price || 0;

            calculatedTotal += realPrice * clientItem.quantity;

            return {
                product_id: clientItem.id,
                product_name: dbProduct.name, // Use DB name to be safe too
                quantity: clientItem.quantity,
                price_at_purchase: realPrice
            };
        });

        // 2. Insert Order (With Validated Total)
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: data.user_id,
                customer_email: data.customer_email,
                customer_name: data.customer_name,
                customer_phone: data.customer_phone,
                shipping_address: data.shipping_address,
                total_amount: calculatedTotal, // <--- TRUSTED VALUE
                payment_method: validatedData.payment_method,
                payment_status: validatedData.payment_status,
                payment_id: validatedData.payment_id,
                status: 'pending'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 3. Insert Order Items (With Validated Prices)
        const orderItemsToInsert = validatedItems.map(item => ({
            order_id: order.id,
            ...item
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsError) throw itemsError;

        // 4. Decerement Stock
        // Note: In a high-concurrency partial failure scenario, this could ideally be an RPC or transaction.
        // For MVP, we iterate. If this fails, stock count might be off, but order exists.
        // We could wrap in try/catch but let's let it bubble for now so we see errors.
        for (const item of validatedItems) {
            const currentStock = productMap.get(item.product_id)!.stock;
            const newStock = Math.max(0, currentStock - item.quantity);

            await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.product_id);
        }

        // Return the full order object with the CORRECT total
        return { ...order, items: orderItemsToInsert };
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
                // If paid, we might want to update the main status too?
                // For now, let's keep main status as 'pending' (fulfillment status) and payment_status separate.
                // Or maybe set status='processing' if paid?
                // Let's stick to updating payment columns.
            })
            .eq('id', orderId);

        if (error) throw error;
    }
};
