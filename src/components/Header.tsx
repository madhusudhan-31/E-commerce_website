import { ShoppingCart, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export function Header({ onCartClick }: { onCartClick: () => void }) {
  const { user, signOut } = useAuth();
  const { cartItems } = useCart();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Store</h1>
        </Link>

        <div className="flex items-center gap-6">
          <button
            onClick={onCartClick}
            className="relative p-2 text-gray-600 hover:text-blue-600 transition"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/orders"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">{user.email}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/signin"
                className="px-4 py-2 text-gray-600 hover:text-blue-600 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
