import { LaptopProduct } from './types';

export const MOCK_LAPTOPS: LaptopProduct[] = [
  {
    id: 'mock-razer-blade-16',
    slug: 'razer-blade-16-rtx-4090',
    title: 'Razer Blade 16 (2026) - Ultimate Gaming Beast',
    brand: 'Razer',
    laptop_model: 'Blade 16 Dual-Mode Mini-LED',
    processor: 'Intel Core i9-14900HX (24 Cores, up to 5.8 GHz)',
    ram: '32 GB DDR5 5600MHz',
    storage: '2 TB PCIe 4.0 NVMe M.2 SSD',
    graphics: 'NVIDIA GeForce RTX 4090 (16GB GDDR6 VRAM, 175W)',
    display: '16.0" Dual-Mode Mini-LED (UHD+ 120Hz / FHD+ 240Hz), 1000 nits, 100% DCI-P3',
    price: 4199.99,
    description: 'Experience the pinnacle of portable performance with the Razer Blade 16. Equipped with the jaw-dropping Intel Core i9 processor, an NVIDIA RTX 4090, and the world\'s first dual-mode Mini-LED display, this laptop bridges the gap between cinematic content creation and competitive eSports. Housed in a precision-crafted, CNC-anodized matte black aluminum chassis with signature Razer Chroma RGB keyboard styling.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800'
    ],
    featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-rog-zephyrus-g14',
    slug: 'asus-rog-zephyrus-g14',
    title: 'ASUS ROG Zephyrus G14 (2026) OLED',
    brand: 'ASUS ROG',
    laptop_model: 'Zephyrus G14 GA403',
    processor: 'AMD Ryzen 9 8945HS (8 Cores, up to 5.2 GHz)',
    ram: '32 GB LPDDR5X 6400MHz',
    storage: '1 TB PCIe 4.0 NVMe SSD',
    graphics: 'NVIDIA GeForce RTX 4070 (8GB GDDR6, 90W with Dynamic Boost)',
    display: '14.0" 3K (2880 x 1800) ROG Nebula OLED Display, 120Hz, 0.2ms, G-Sync, HDR500',
    price: 2199.99,
    description: 'Power meets elegance. The ASUS ROG Zephyrus G14 sets a new standard for compact powerhouse laptops. Featuring a gorgeous all-aluminum chassis, the Nebula OLED screen delivers unrivaled visual precision, while the Ryzen 9 and RTX 4070 drive high-end gaming and multi-threaded workflows with ease. Complete with the customizable Slash Lighting array on the lid.',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&q=80&w=800'
    ],
    featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-macbook-pro-16',
    slug: 'apple-macbook-pro-16-m3-max',
    title: 'Apple MacBook Pro 16" - M3 Max Slate Black',
    brand: 'Apple',
    laptop_model: 'MacBook Pro 16-inch (Late 2024)',
    processor: 'Apple M3 Max (16-Core CPU, 40-Core GPU)',
    ram: '48 GB Unified Memory',
    storage: '1 TB Superfast SSD',
    graphics: 'Apple M3 Max 40-Core GPU (Hardware Ray Tracing)',
    display: '16.2" Liquid Retina XDR (3456 x 2234), 120Hz ProMotion, 1600 nits Peak Brightness',
    price: 3999.00,
    description: 'The definitive tool for creative professionals. The Apple MacBook Pro 16" with the M3 Max chip offers unprecedented rendering speeds, extreme battery life of up to 22 hours, and a breathtaking Liquid Retina XDR display. Finished in the fingerprint-resistant Space Black anodized aluminum, it stands as the ultimate symbol of executive luxury and computational efficiency.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800'
    ],
    featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-lenovo-legion-9i',
    slug: 'lenovo-legion-9i-liquid-cooled',
    title: 'Lenovo Legion 9i - Integrated Liquid Cooling',
    brand: 'Lenovo',
    laptop_model: 'Legion 9i 16IRX9',
    processor: 'Intel Core i9-14900HX (24 Cores, up to 5.8 GHz)',
    ram: '64 GB DDR5 5600MHz Dual-Channel',
    storage: '2 TB PCIe 4.0 NVMe SSD (2x 1TB RAID 0)',
    graphics: 'NVIDIA GeForce RTX 4090 (16GB GDDR6, 175W TGP)',
    display: '16.0" 3.2K (3200 x 2000) Mini-LED, 165Hz, 1200 nits, 100% DCI-P3 & Adobe RGB',
    price: 4399.99,
    description: 'Forged in carbon, cooled by water. The Lenovo Legion 9i features a revolutionary integrated liquid-cooling pump that activates when the GPU hits 84°C, giving you sustained peak frame rates. Each top cover features a completely unique forged carbon texture, accented by the beautiful Per-key RGB keyboard and wraparound ambient lighting.',
    images: [
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&q=80&w=800'
    ],
    featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-dell-xps-16',
    slug: 'dell-xps-16-9640',
    title: 'Dell XPS 16 - Premium Modern Masterpiece',
    brand: 'Dell',
    laptop_model: 'XPS 16 9640 Metallic Slate',
    processor: 'Intel Core Ultra 7 155H (16 Cores, up to 4.8 GHz with AI NPU)',
    ram: '32 GB LPDDR5X 7467MHz',
    storage: '1 TB M.2 PCIe 4.0 SSD',
    graphics: 'NVIDIA GeForce RTX 4060 (8GB GDDR6, 50W)',
    display: '16.3" 4K+ (3840 x 2400) InfinityEdge OLED Touch, 90Hz, 500 nits, Gorilla Glass 3',
    price: 2499.00,
    description: 'Welcome to the future of laptop design. The Dell XPS 16 features a seamless glass wrist rest with a haptic touchpad, a zero-lattice keyboard, and a capacitive touch function row. The ultra-vivid InfinityEdge OLED Touch display brings photos and videos to life with cinematic accuracy, supported by high-quality quad speakers with waves MaxxAudio.',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'
    ],
    featured: false,
    created_at: new Date().toISOString()
  }
];

export const BRANDS = ['Razer', 'ASUS ROG', 'Apple', 'Lenovo', 'Dell', 'HP', 'Acer', 'MSI'];
export const RAM_OPTIONS = ['8 GB', '16 GB', '32 GB', '48 GB', '64 GB'];
export const STORAGE_OPTIONS = ['512 GB', '1 TB', '2 TB', '4 TB'];
