import { ShoppingCart } from 'lucide-react';
import { Product } from '../services/supabase';
import { useState } from 'react';

type ProductCardProps = {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => Promise<void>;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await onAddToCart(product.id, quantity);
      setQuantity(1);
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col h-full">
      <div className="h-48 overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>

        <p className="text-sm text-gray-600 mb-4 flex-1">{product.description}</p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        {product.stock > 0 && (
          <div className="flex gap-2">
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {[1, 2, 3, 4, 5].map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
