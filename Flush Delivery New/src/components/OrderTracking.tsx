import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders, Order } from '@/contexts/OrderContext';

interface OrderTrackingProps {
  onBack: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { orders, fetchOrders, currentOrder, refreshCurrentOrder } = useOrders();
  const [showDelivered, setShowDelivered] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders(user.id, 'customer');
    }
  }, [user]);

  // Poll for order updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCurrentOrder();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentOrder]);

  // Show delivered popup
  useEffect(() => {
    if (currentOrder?.status === 'delivered') {
      setShowDelivered(true);
    }
  }, [currentOrder?.status]);

  const activeOrders = orders.filter(o => ['pending', 'processing', 'in_transit'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'failed'].includes(o.status));

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Delivered Popup
  if (showDelivered && currentOrder?.status === 'delivered') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Order Delivered!</h2>
          <p className="text-gray-600 text-sm mb-4">
            Your order has been delivered. Enjoy your meal!
          </p>
          <button
            onClick={() => setShowDelivered(false)}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white px-3 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-green-700 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">My Orders</h1>
        </div>
      </div>

      <div className="px-3 py-3">
        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-gray-800 text-sm mb-3">Active Orders</h2>
            <div className="space-y-3">
              {activeOrders.map((order) => {
                const step = getStatusStep(order.status);
                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm p-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleTimeString('en-KE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        {['Placed', 'Preparing', 'On Way', 'Done'].map((label, index) => (
                          <div key={label} className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index + 1 <= step
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {index + 1 <= step ? (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                index + 1
                              )}
                            </div>
                            <span className="text-[9px] text-gray-500 mt-1">{label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${((step - 1) / 3) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Rider Info */}
                    {order.rider_name && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Your Rider</p>
                            <p className="font-semibold text-blue-800 text-sm">{order.rider_name}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 mb-2">Order Items</p>
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between text-xs py-1">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-gray-500">KSH {item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-sm pt-2 border-t mt-2">
                        <span>Total</span>
                        <span className="text-green-600">KSH {Number(order.total).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Orders */}
        <div>
          <h2 className="font-bold text-gray-800 text-sm mb-3">Order History</h2>
          {pastOrders.length === 0 && activeOrders.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 font-medium text-sm">No orders yet</p>
              <p className="text-xs text-gray-400 mt-1">Your orders will appear here</p>
            </div>
          ) : pastOrders.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">No past orders</p>
          ) : (
            <div className="space-y-2">
              {pastOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-600">
                      {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                    </p>
                    <p className="font-bold text-green-600 text-sm">KSH {Number(order.total).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
