import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders, Order } from '@/contexts/OrderContext';

interface RiderDashboardProps {
  onBack: () => void;
}

const RiderDashboard: React.FC<RiderDashboardProps> = ({ onBack }) => {
  const { user, refreshUser } = useAuth();
  const { orders, fetchPendingOrders, fetchOrders, updateOrderStatus } = useOrders();
  const [activeTab, setActiveTab] = useState<'available' | 'my_orders' | 'stats'>('available');
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Refresh user to check approval status
    refreshUser();
  }, []);

  useEffect(() => {
    if (user?.is_approved) {
      fetchPendingOrders();
      if (user) {
        fetchOrders(user.id, 'rider');
      }

      // Poll for updates every 2 seconds
      const interval = setInterval(() => {
        fetchPendingOrders();
        if (user) {
          fetchOrders(user.id, 'rider');
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setMyOrders(orders.filter(o => o.rider_id === user.id));
    }
  }, [orders, user]);

  // Show pending approval screen if not approved
  if (user && !user.is_approved) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-orange-500 text-white">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-orange-600 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold">Rider Dashboard</h1>
                <p className="text-sm text-orange-200">Account Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approval Content */}
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Account Pending Approval</h2>
            <p className="text-gray-600 mb-4">
              Your rider account is currently being reviewed by our admin team. 
              You will be able to start accepting orders once your account is approved.
            </p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-orange-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-orange-700 text-left space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Admin will review your application</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>You'll be notified once approved</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Start earning by delivering orders!</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => refreshUser()}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Check Status
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-3">
              If you have questions about your application, contact our support team.
            </p>
            <a
              href="tel:0708770746"
              className="flex items-center justify-center gap-2 py-2 bg-green-50 text-green-600 font-medium rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  const availableOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = myOrders.filter(o => o.status === 'delivered');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.delivery_fee, 0);
  const riderEarnings = Math.round(totalEarnings * 0.65);

  const handleGrabOrder = async (orderId: string) => {
    if (!user) return;
    setLoading(orderId);
    const success = await updateOrderStatus(orderId, 'processing', user.id, user.full_name);
    if (success) {
      setActiveTab('my_orders');
      setSelectedOrder(null);
    }
    setLoading(null);
    fetchPendingOrders();
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    setLoading(orderId);
    await updateOrderStatus(orderId, status);
    setLoading(null);
    fetchPendingOrders();
    if (user) {
      fetchOrders(user.id, 'rider');
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

  const activeMyOrders = myOrders.filter(o => ['processing', 'in_transit'].includes(o.status));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white">
        <div className="px-3 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onBack} className="p-1.5 hover:bg-green-700 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold">Rider Dashboard</h1>
              <p className="text-xs text-green-100">Hi, {user?.full_name}</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <p className="text-lg font-bold">{completedOrders.length}</p>
              <p className="text-[10px] text-white/80">Completed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <p className="text-lg font-bold">KSH {totalEarnings}</p>
              <p className="text-[10px] text-white/80">Transport</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <p className="text-lg font-bold">KSH {riderEarnings}</p>
              <p className="text-[10px] text-white/80">Earnings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Always visible */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="grid grid-cols-3">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-3 text-center text-xs font-medium transition-colors ${
              activeTab === 'available'
                ? 'text-green-600 bg-green-50 border-b-2 border-green-600'
                : 'text-gray-500'
            }`}
          >
            Available
            {availableOrders.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full text-[10px]">
                {availableOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('my_orders')}
            className={`py-3 text-center text-xs font-medium transition-colors ${
              activeTab === 'my_orders'
                ? 'text-green-600 bg-green-50 border-b-2 border-green-600'
                : 'text-gray-500'
            }`}
          >
            My Orders
            {activeMyOrders.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px]">
                {activeMyOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 text-center text-xs font-medium transition-colors ${
              activeTab === 'stats'
                ? 'text-green-600 bg-green-50 border-b-2 border-green-600'
                : 'text-gray-500'
            }`}
          >
            Stats
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-3">
        {activeTab === 'available' && (
          <div className="space-y-3">
            {/* Selected Order Details */}
            {selectedOrder && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-orange-800 text-sm">Selected Order</h4>
                  <button onClick={() => setSelectedOrder(null)} className="p-1 text-orange-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-[10px] text-gray-500">Customer</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedOrder.customer_name || 'Customer'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-[10px] text-gray-500">Phone</p>
                    <a href={`tel:${selectedOrder.phone}`} className="font-semibold text-green-600 text-sm">{selectedOrder.phone}</a>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-[10px] text-gray-500">Distance</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedOrder.distance_km || 2}km</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-[10px] text-gray-500">Your Earnings</p>
                    <p className="font-semibold text-green-600 text-sm">KSH {Math.round(selectedOrder.delivery_fee * 0.65)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-2 mb-3">
                  <p className="text-[10px] text-gray-500">Delivery Address</p>
                  <p className="font-semibold text-gray-800 text-sm">{selectedOrder.delivery_address}</p>
                </div>

                <div className="bg-white rounded-lg p-2 mb-3">
                  <p className="text-[10px] text-gray-500 mb-1">Order Items ({selectedOrder.items?.length || 0})</p>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-1 border-b last:border-0">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="text-gray-500">{item.restaurantName}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleGrabOrder(selectedOrder.id)}
                  disabled={loading === selectedOrder.id}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {loading === selectedOrder.id ? 'Grabbing...' : `Grab Order - Earn KSH ${Math.round(selectedOrder.delivery_fee * 0.65)}`}
                </button>
              </div>
            )}

            {/* Orders List */}
            <h3 className="font-semibold text-gray-700 text-sm">
              {availableOrders.length > 0 ? `${availableOrders.length} Orders Available` : 'No Orders Available'}
            </h3>
            
            {availableOrders.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 font-medium text-sm">No available orders</p>
                <p className="text-xs text-gray-400 mt-1">New orders will appear here</p>
              </div>
            ) : (
              availableOrders.map((order) => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                    selectedOrder?.id === order.id ? 'ring-2 ring-orange-500' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{order.customer_name || 'Customer'}</p>
                          <p className="text-xs text-gray-500">{order.delivery_address.slice(0, 20)}...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-green-600">KSH {order.delivery_fee}</p>
                        <p className="text-[10px] text-gray-500">{order.distance_km || 2}km</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                      </span>
                      <span className="text-xs font-medium text-orange-600">Tap to view</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'my_orders' && (
          <div className="space-y-3">
            {activeMyOrders.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 font-medium text-sm">No active orders</p>
                <p className="text-xs text-gray-400 mt-1">Grab an order from Available tab</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                >
                  View Available Orders
                </button>
              </div>
            ) : (
              activeMyOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-3">
                    {/* Status Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-800 text-base">{order.customer_name || 'Customer'}</p>
                        <p className="text-xs text-gray-500">#{order.id.slice(0, 8)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status === 'processing' ? 'PROCESSING' : 'IN TRANSIT'}
                      </span>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <h4 className="font-semibold text-green-800 mb-2 text-sm">Customer Details</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] text-gray-500">Phone</p>
                          <a href={`tel:${order.phone}`} className="font-bold text-green-600 text-sm">
                            {order.phone}
                          </a>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500">Distance</p>
                          <p className="font-semibold text-sm">{order.distance_km || 2}km</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-500">Address</p>
                          <p className="font-semibold text-sm">{order.delivery_address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Restaurants */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <h4 className="font-semibold text-blue-800 mb-2 text-sm">Pickup From</h4>
                      {[...new Set(order.items?.map(i => i.restaurantName) || [])].map((restaurant, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs py-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">{restaurant}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Items */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <h4 className="font-semibold text-gray-700 mb-2 text-sm">Order Items</h4>
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between text-xs py-1 border-b border-gray-200 last:border-0">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-gray-500">{item.restaurantName}</span>
                        </div>
                      ))}
                    </div>

                    {/* Payment Info */}
                    <div className="flex items-center justify-between mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div>
                        <p className="text-xs text-yellow-700">Collect:</p>
                        <p className="text-xl font-bold text-yellow-800">KSH {order.total.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600">Your earnings:</p>
                        <p className="text-lg font-bold text-green-600">KSH {Math.round(order.delivery_fee * 0.65)}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {order.status === 'processing' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'in_transit')}
                            disabled={loading === order.id}
                            className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm"
                          >
                            {loading === order.id ? 'Updating...' : 'Start Delivery (In Transit)'}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'failed')}
                            disabled={loading === order.id}
                            className="w-full py-2 bg-red-100 text-red-600 font-semibold rounded-lg text-xs"
                          >
                            Mark as Failed
                          </button>
                        </>
                      )}
                      {order.status === 'in_transit' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            disabled={loading === order.id}
                            className="w-full py-3 bg-green-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm"
                          >
                            {loading === order.id ? 'Completing...' : 'Complete Delivery'}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'failed')}
                            disabled={loading === order.id}
                            className="w-full py-2 bg-red-100 text-red-600 font-semibold rounded-lg text-xs"
                          >
                            Mark as Failed
                          </button>
                        </>
                      )}
                    </div>

                    {/* Call Customer */}
                    <a
                      href={`tel:${order.phone}`}
                      className="mt-2 w-full py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call: {order.phone}
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-3">
            {/* Earnings Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3">Earnings Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-green-600">KSH {riderEarnings}</p>
                  <p className="text-xs text-gray-600">Total Earnings</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-blue-600">{completedOrders.length}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-purple-600">KSH {totalEarnings}</p>
                  <p className="text-xs text-gray-600">Total Transport</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-orange-600">
                    {completedOrders.length > 0 ? Math.round(riderEarnings / completedOrders.length) : 0}
                  </p>
                  <p className="text-xs text-gray-600">Avg/Order</p>
                </div>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-3 border-b">
                <h3 className="font-bold text-gray-800 text-sm">Completed Orders</h3>
              </div>
              {completedOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No completed orders yet
                </div>
              ) : (
                <div className="divide-y">
                  {completedOrders.slice(0, 10).map((order) => (
                    <div key={order.id} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{order.customer_name || 'Customer'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-KE', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-sm">+KSH {Math.round(order.delivery_fee * 0.65)}</p>
                        <p className="text-[10px] text-gray-500">{order.distance_km || 1.5}km</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDashboard;
