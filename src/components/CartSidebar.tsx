import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';

type CartSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems, removeFromCart, updateQuantity, getTotal } = useCart();
  const { user } = useAuth();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleQuantityChange = async (cartId: string, newQuantity: number) => {
    try {
      setUpdating(cartId);
      await updateQuantity(cartId, newQuantity);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (cartId: string) => {
    try {
      setUpdating(cartId);
      await removeFromCart(cartId);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      )}

      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">Shopping Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex gap-3 mb-3">
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.products.name}</h3>
                        <p className="text-sm text-gray-600">${item.products.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={updating === item.id}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updating === item.id}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={updating === item.id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.products.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              {user ? (
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center font-semibold"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <Link
                  to="/signin"
                  onClick={onClose}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center font-semibold"
                >
                  Sign In to Checkout
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
