import { useState, useEffect } from 'react';
import { supabase, Product } from '../services/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = category === 'All'
    ? products
    : products.filter(p => p.category === category);

  const handleAddToCart = async (productId: string, quantity: number) => {
    if (!user) {
      setNotification('Please sign in to add items to cart');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    await addToCart(productId, quantity);
    setNotification('Added to cart!');
    setTimeout(() => setNotification(''), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {notification && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          {notification}
        </div>
      )}

      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Shop Products</h2>

        <div className="flex gap-3 overflow-x-auto pb-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
