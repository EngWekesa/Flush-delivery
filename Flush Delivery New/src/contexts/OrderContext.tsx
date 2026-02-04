import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { CartItem } from './CartContext';

export interface Order {
    id: string;
    customer_id: string;
    customer_name?: string;
    rider_id?: string;
    rider_name?: string;
    items: CartItem[];
    subtotal: number;
    delivery_fee: number;
    total: number;
    delivery_address: string;
    door_number?: string;
    phone: string;
    customer_latitude?: number;
    customer_longitude?: number;
    distance_km?: number;
    status: 'pending' | 'processing' | 'in_transit' | 'delivered' | 'failed';
    created_at: string;
}

interface OrderContextType {
    orders: Order[];
    currentOrder: Order | null;
    placeOrder: (orderData: Omit<Order, 'id' | 'status' | 'created_at'>) => Promise<{ success: boolean; order?: Order; error?: string }>;
    updateOrderStatus: (orderId: string, status: Order['status'], riderId?: string, riderName?: string) => Promise<boolean>;
    fetchOrders: (userId: string, userType: 'customer' | 'rider') => Promise<void>;
    fetchPendingOrders: () => Promise<void>;
    setCurrentOrder: (order: Order | null) => void;
    refreshCurrentOrder: () => Promise<void>;
    getLocation: () => Promise<void>; // Exposed for the customer button
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};

// Helper function to safely parse items from items_json TEXT field
const parseItems = (itemsJson: any): CartItem[] => {
    if (!itemsJson) return [];
    if (Array.isArray(itemsJson)) return itemsJson;
    if (typeof itemsJson === 'string') {
        try {
            const parsed = JSON.parse(itemsJson);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [customerLocation, setCustomerLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // Function to get the current location using the Geolocation API
    const getLocation = async (): Promise<void> => {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                } else {
                    reject(new Error("Geolocation is not supported by this browser."));
                }
            });

            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
            setCustomerLocation(location); // Update customer location
            alert(`Location updated: ${location.latitude}, ${location.longitude}`);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to get location.");
        }
    };

    const placeOrder = async (orderData: Omit<Order, 'id' | 'status' | 'created_at'>): Promise<{ success: boolean; order?: Order; error?: string }> => {
        try {
            const cleanItems = orderData.items.map(item => ({
                id: String(item.id || ''),
                name: String(item.name || ''),
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
                restaurantId: String(item.restaurantId || ''),
                restaurantName: String(item.restaurantName || '')
            }));

            const itemsJsonString = JSON.stringify(cleanItems);
            const currentLocation = customerLocation; // Use fetched location

            const insertData = {
                customer_id: orderData.customer_id,
                customer_name: orderData.customer_name || null,
                items_json: itemsJsonString,
                subtotal: Number(orderData.subtotal),
                delivery_fee: Number(orderData.delivery_fee),
                total: Number(orderData.total),
                delivery_address: String(orderData.delivery_address),
                door_number: orderData.door_number ? String(orderData.door_number) : null,
                phone: String(orderData.phone),
                customer_latitude: currentLocation?.latitude, // Use fetched location
                customer_longitude: currentLocation?.longitude, // Use fetched location
                distance_km: Number(orderData.distance_km) || 1.5,
                status: 'pending'
            };

            const { data, error } = await supabase
                .from('orders')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                console.error('Order insert error:', error);
                return { success: false, error: `Failed to place order: ${error.message}` };
            }

            const newOrder: Order = rowToOrder(data); // Convert inserted data to Order object
            setOrders(prev => [newOrder, ...prev]);
            setCurrentOrder(newOrder);
            return { success: true, order: newOrder };
        } catch (err: any) {
            console.error('Order placement exception:', err);
            return { success: false, error: err.message || 'Failed to place order' };
        }
    };

    const updateOrderStatus = async (orderId: string, status: Order['status'], riderId?: string, riderName?: string): Promise<boolean> => {
        try {
            const updateData: Record<string, any> = { 
                status, 
                updated_at: new Date().toISOString() 
            };
            if (riderId) updateData.rider_id = riderId;
            if (riderName) updateData.rider_name = riderName;

            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId);

            if (error) {
                console.error('Update order error:', error);
                return false;
            }

            setOrders(prev => prev.map(order =>
                order.id === orderId
                    ? { ...order, status, rider_id: riderId || order.rider_id, rider_name: riderName || order.rider_name }
                    : order
            ));

            if (currentOrder?.id === orderId) {
                setCurrentOrder(prev => prev ? { ...prev, status, rider_id: riderId || prev.rider_id, rider_name: riderName || prev.rider_name } : null);
            }

            return true;
        } catch {
            return false;
        }
    };

    // Helper to convert database row to Order object
    const rowToOrder = (row: any): Order => ({
        id: row.id,
        customer_id: row.customer_id,
        customer_name: row.customer_name,
        rider_id: row.rider_id,
        rider_name: row.rider_name,
        items: parseItems(row.items_json),
        subtotal: Number(row.subtotal),
        delivery_fee: Number(row.delivery_fee),
        total: Number(row.total),
        delivery_address: row.delivery_address,
        door_number: row.door_number,
        phone: row.phone,
        customer_latitude: row.customer_latitude,
        customer_longitude: row.customer_longitude,
        distance_km: row.distance_km ? Number(row.distance_km) : undefined,
        status: row.status,
        created_at: row.created_at,
    });

    const fetchOrders = async (userId: string, userType: 'customer' | 'rider') => {
        try {
            const column = userType === 'customer' ? 'customer_id' : 'rider_id';
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq(column, userId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                const processedOrders = data.map(rowToOrder);
                setOrders(processedOrders);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };

    const fetchPendingOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .in('status', ['pending', 'processing', 'in_transit'])
                .order('created_at', { ascending: false });

            if (!error && data) {
                const ordersWithoutNames = data.filter(d => !d.customer_name);
                const customerIds = [...new Set(ordersWithoutNames.map(d => d.customer_id))];
                let customerMap = new Map();

                if (customerIds.length > 0) {
                    const { data: customers } = await supabase
                        .from('users')
                        .select('id, full_name')
                        .in('id', customerIds);
                    customerMap = new Map(customers?.map(c => [c.id, c.full_name]) || []);
                }

                const processedOrders = data.map(d => ({
                    ...rowToOrder(d),
                    customer_name: d.customer_name || customerMap.get(d.customer_id) || 'Customer',
                }));

                setOrders(processedOrders);
            }
        } catch (err) {
            console.error('Failed to fetch pending orders:', err);
        }
    };

    const refreshCurrentOrder = async () => {
        if (!currentOrder) return;

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', currentOrder.id)
                .single();

            if (!error && data) {
                const updatedOrder = rowToOrder(data);
                setCurrentOrder(updatedOrder);
            }
        } catch (err) {
            console.error('Failed to refresh order:', err);
        }
    };

    return (
        <OrderContext.Provider value={{
            orders,
            currentOrder,
            placeOrder,
            updateOrderStatus,
            fetchOrders,
            fetchPendingOrders,
            setCurrentOrder,
            refreshCurrentOrder,
            getLocation, // Expose getLocation for customer button
        }}>
            {children}
        </OrderContext.Provider>
    );
};

// Customer Component
const CustomerOrderForm = () => {
    const { placeOrder, getLocation } = useOrders();

    const handlePlaceOrder = async () => {
        // Example order data
        const orderData = {
            customer_id: 'test_customer_id',
            customer_name: 'Daniel wekesa',
            items: [], // Add items here
            subtotal: 100,
            delivery_fee: 5,
            total: 105,
            delivery_address: '123 Main St',
            door_number: '1A',
            phone: '070-877-0746'
        };
        const { success, error } = await placeOrder(orderData);
        if (!success) alert(error);
    };

    const handleGetLocation = async () => {
        await getLocation();
    };

    return (
        <div>
            <h2>Place Your Order</h2>
            <button onClick={handleGetLocation}>Get My Location</button>
            <button onClick={handlePlaceOrder}>Place Order</button>
            {/* Further order input details can go here */}
        </div>
    );
};

// Rider View Component Example
export const RiderOrderDetail: React.FC<{ order: Order }> = ({ order }) => {
    const openGoogleMaps = () => {
        const { customer_latitude, customer_longitude } = order;
        const url = `https://www.google.com/maps?q=${customer_latitude},${customer_longitude}`;
        window.open(url, '_blank'); // Open in new tab
    };

    return (
        <div>
            <h2>Order for {order.customer_name}</h2>
            <button onClick={openGoogleMaps}>View Location on Google Maps</button>
        </div>
    );
};