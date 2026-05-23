import { supabase } from './supabaseClient';
import { LaptopProduct, NewLaptopProduct } from './types';
import { MOCK_LAPTOPS } from './mockData';

export const productService = {
  /**
   * Fetch all products from Supabase. Falls back to mock data on error.
   */
  async getProducts(): Promise<LaptopProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase products fetch error:', error.message);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data as LaptopProduct[];
    } catch (e) {
      console.warn('Failed to connect to Supabase:', e);
      return [];
    }
  },

  /**
   * Fetch featured products.
   */
  async getFeaturedProducts(): Promise<LaptopProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase featured fetch error:', error.message);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data as LaptopProduct[];
    } catch (e) {
      return [];
    }
  },

  /**
   * Get single product by slug.
   */
  async getProductBySlug(slug: string): Promise<LaptopProduct | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.warn(`Product slug "${slug}" not found in Supabase.`);
        return null;
      }

      return data as LaptopProduct;
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if a logged in user email exists in the admins table.
   */
  async isAdmin(email: string): Promise<{ authorized: boolean; role?: string }> {
    try {
      // Use RPC to check admin status securely to bypass RLS timing/headers issues
      const { data, error } = await supabase.rpc('is_admin', { user_email: email });

      if (error) {
        console.warn(`Auth check RPC failed, trying fallback table check:`, error.message);
        // Fallback to table check if RPC fails for some reason
        const { data: tableData, error: tableError } = await supabase
          .from('admins')
          .select('role')
          .eq('email', email)
          .single();
        
        if (tableError) {
          console.warn(`Auth check fallback table query failed:`, tableError.message);
          return { authorized: false };
        }
        return { authorized: !!tableData, role: tableData?.role };
      }

      return { authorized: !!data, role: data ? 'super_admin' : undefined };
    } catch (e) {
      console.error('Failed to perform admin database validation:', e);
      return { authorized: false };
    }
  },

  /**
   * Create a new product. (Requires session token to bypass RLS)
   */
  async createProduct(product: NewLaptopProduct): Promise<LaptopProduct> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return data as LaptopProduct;
  },

  /**
   * Update a product. (Requires session token to bypass RLS)
   */
  async updateProduct(id: string, product: Partial<LaptopProduct>): Promise<LaptopProduct> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return data as LaptopProduct;
  },

  /**
   * Delete a list of image URLs from the Supabase Storage bucket.
   */
  async deleteProductImages(urls: string[]): Promise<void> {
    try {
      const filePathsToDelete: string[] = [];
      
      urls.forEach((url) => {
        if (url.includes('/laptop-images/')) {
          const pathParts = url.split('/laptop-images/');
          if (pathParts.length > 1) {
            filePathsToDelete.push(pathParts[1]);
          }
        }
      });

      if (filePathsToDelete.length > 0) {
        console.log('Deleting images from storage:', filePathsToDelete);
        const { error } = await supabase.storage
          .from('laptop-images')
          .remove(filePathsToDelete);
        if (error) {
          console.warn('Supabase storage remove returned error:', error.message);
        }
      }
    } catch (err) {
      console.warn('Failed to delete images from storage bucket:', err);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    // 1. Fetch the product first to clean up its images from storage
    try {
      const { data: product } = await supabase
        .from('products')
        .select('images')
        .eq('id', id)
        .single();

      if (product && product.images && product.images.length > 0) {
        await productService.deleteProductImages(product.images);
      }
    } catch (cleanupErr) {
      console.warn('Failed to delete associated product images from storage bucket:', cleanupErr);
    }

    // 2. Perform database delete
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },

  /**
   * Upload an image to Supabase Storage. Returns the public URL.
   */
  async uploadProductImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `laptops/${fileName}`;

    // Upload files to 'laptop-images' bucket
    const { error: uploadError } = await supabase.storage
      .from('laptop-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('laptop-images')
      .getPublicUrl(filePath);

    if (!data || !data.publicUrl) {
      throw new Error('Failed to retrieve the public URL of the uploaded image.');
    }

    return data.publicUrl;
  }
};
