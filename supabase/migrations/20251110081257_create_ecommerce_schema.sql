/*
  # E-commerce Database Schema

  1. New Tables
    - `products` - Store product information
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `stock` (integer)
      - `category` (text)
      - `created_at` (timestamp)
    
    - `carts` - Shopping cart items
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `created_at` (timestamp)
    
    - `orders` - Customer orders
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `total_amount` (numeric)
      - `status` (text)
      - `created_at` (timestamp)
    
    - `order_items` - Items in each order
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `price` (numeric)

  2. Security
    - Enable RLS on all tables
    - Users can only see their own cart and orders
    - Products are readable by all authenticated users
    - Sample data inserted for demonstration
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  stock integer DEFAULT 0,
  category text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL,
  price numeric NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are readable by all authenticated users"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own cart"
  ON carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their cart"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cart"
  ON carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their cart"
  ON carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

INSERT INTO products (name, description, price, image_url, stock, category) VALUES
  ('Wireless Headphones', 'Premium noise-canceling headphones with 30-hour battery', 199.99, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400', 50, 'Electronics'),
  ('Laptop Backpack', 'Durable and stylish backpack with laptop compartment', 79.99, 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=400', 30, 'Accessories'),
  ('Smart Watch', 'Advanced fitness tracking and notifications', 299.99, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400', 25, 'Electronics'),
  ('USB-C Cable', 'Fast charging and data transfer cable', 19.99, 'https://images.pexels.com/photos/4252151/pexels-photo-4252151.jpeg?auto=compress&cs=tinysrgb&w=400', 100, 'Accessories'),
  ('Webcam 4K', 'Professional quality 4K webcam for streaming', 149.99, 'https://images.pexels.com/photos/612198/pexels-photo-612198.jpeg?auto=compress&cs=tinysrgb&w=400', 40, 'Electronics'),
  ('Phone Stand', 'Adjustable phone stand for desk', 29.99, 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400', 60, 'Accessories');
