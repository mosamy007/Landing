export interface LaptopProduct {
  id: string;
  slug: string;
  title: string;
  brand: string;
  laptop_model: string;
  processor: string;
  ram: string;
  storage: string;
  graphics: string;
  display: string;
  price: number;
  description: string;
  images: string[];
  featured: boolean;
  created_at: string;
}

export interface AdminRecord {
  id: string;
  email: string;
  role: 'super_admin' | 'editor';
  created_at: string;
}

export type NewLaptopProduct = Omit<LaptopProduct, 'id' | 'created_at'>;
