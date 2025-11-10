import { useState, useEffect } from 'react';
import { supabase, Order, OrderItem } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';

export function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', orderId);

    if (!error && data) {
      setOrderItems(data as OrderItem[]);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    setSelectedOrder(orderId);
    await fetchOrderItems(orderId);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (selectedOrder) {
    const order = orders.find(o => o.id === selectedOrder);
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => setSelectedOrder(null)}
          className="mb-6 text-blue-600 hover:underline font-semibold"
        >
          Back to Orders
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Order #{order?.id.substring(0, 8)}</h1>

          <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(order?.created_at || '').toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                {order?.status}
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Items</h2>
          <div className="space-y-4 mb-8 pb-8 border-b">
            {orderItems.map(item => (
              <div key={item.id} className="flex justify-between items-center py-4">
                <div>
                  <p className="font-semibold text-gray-900">{item.products.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span>${(order?.total_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 pb-4 border-b">
                <span className="text-gray-600">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${(order?.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order.id.substring(0, 8)}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                  {order.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  ${order.total_amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleViewOrder(order.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
