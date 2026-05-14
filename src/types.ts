export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderRecord {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  product_id: number;
  quantity: number;
  created_at: string;
}
