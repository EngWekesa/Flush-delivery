import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { items, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();

  const [deliveryAddress, setDeliveryAddress] = useState(user?.location || '');
  const [doorNumber, setDoorNumber] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [distance, setDistance] = useState(2);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setDeliveryAddress(user.location || '');
    }
  }, [user]);

  const subtotal = getTotal();
  const deliveryFee = distance <= 1 ? 75 : 75 + (Math.ceil(distance - 1) * 25);
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user || items.length === 0) return;
    if (!deliveryAddress || !phone) {
      setError('Please fill in delivery address and phone number');
      return;
    }

    setLoading(true);
    setError(null);
    
    const result = await placeOrder({
      customer_id: user.id,
      customer_name: user.full_name,
      items: items,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      delivery_address: deliveryAddress,
      door_number: doorNumber || undefined,
      phone,
      customer_latitude: coordinates?.lat,
      customer_longitude: coordinates?.lng,
      distance_km: distance,
    });

    setLoading(false);

    if (result.success) {
      setOrderTotal(total);
      setShowSuccess(true);
      clearCart();
    } else {
      setError(result.error || 'Failed to place order. Please try again.');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
    onOrderSuccess();
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setCoordinates({ lat, lng });
        
        // Calculate distance from Ruiru center
        const ruiruLat = -1.1496;
        const ruiruLng = 36.9610;
        
        const R = 6371;
        const dLat = (ruiruLat - lat) * Math.PI / 180;
        const dLon = (ruiruLng - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(ruiruLat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;
        
        const calculatedDistance = Math.max(1, Math.round(d * 10) / 10);
        setDistance(calculatedDistance);
        setDeliveryAddress(`Ruiru Area (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setFetchingLocation(false);
      },
      () => {
        setDeliveryAddress('Ruiru, Kenya');
        setDistance(2);
        setFetchingLocation(false);
        setError('Could not get location. Enter address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (!isOpen) return null;

  // Success Modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Order Placed!</h2>
          <p className="text-gray-600 text-sm mb-4">
            Hi <span className="font-semibold text-green-600">{user?.full_name}</span>, your order is confirmed! 
            <br /><br />
            Have <span className="font-bold text-green-600 text-lg">KSH {orderTotal.toLocaleString()}</span> ready!
          </p>
          <button
            onClick={handleSuccessClose}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg"
          >
            Track My Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 border-b flex items-center justify-between bg-green-600 text-white">
          <h2 className="text-lg font-bold">Your Cart</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-green-700 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-3 mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 text-sm">Your cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Add items from restaurants</p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.restaurantId}`} className="bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h4>
                        <p className="text-[10px] text-green-600">{item.restaurantName}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.restaurantId)}
                        className="p-1 text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-white rounded-lg border">
                        <button
                          onClick={() => updateQuantity(item.id, item.restaurantId, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded-l-lg"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-5 text-center font-semibold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.restaurantId, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded-r-lg"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <span className="font-bold text-green-600 text-sm">KSH {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Details */}
              <div className="space-y-3 mb-4">
                <h3 className="font-semibold text-gray-800 text-sm">Delivery Details</h3>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Delivery Address *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                      placeholder="Your address"
                    />
                    <button
                      onClick={getLocation}
                      disabled={fetchingLocation}
                      className="px-3 py-2 bg-green-100 text-green-600 rounded-lg disabled:opacity-50"
                    >
                      {fetchingLocation ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Door Number</label>
                    <input
                      type="text"
                      value={doorNumber}
                      onChange={(e) => setDoorNumber(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                      placeholder="0712345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Distance: <span className="font-semibold text-green-600">{distance}km</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={distance}
                    onChange={(e) => setDistance(parseFloat(e.target.value))}
                    className="w-full accent-green-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>1km</span>
                    <span>20km</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-green-50 rounded-lg p-3 space-y-1 border border-green-200">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>KSH {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Delivery ({distance}km)</span>
                  <span>KSH {deliveryFee}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-green-300">
                  <span>Total</span>
                  <span className="text-green-600">KSH {total.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            {!user && (
              <p className="text-center text-gray-500 text-xs mb-2">Sign in to place order</p>
            )}
            <button
              onClick={handlePlaceOrder}
              disabled={loading || !user || !deliveryAddress || !phone}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {!user ? 'Sign In to Order' : loading ? 'Placing Order...' : `Confirm Order - KSH ${total.toLocaleString()}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
