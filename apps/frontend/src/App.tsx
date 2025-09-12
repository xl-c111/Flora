import { useState, useEffect } from 'react';
import './App.css';

// Simple inline types for now
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceRange: string;
  imageUrl?: string;
  inStock: boolean;
  occasions: string[];
  seasons: string[];
  moods: string[];
  colors: string[];
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Simple fetch without the API service for now since backend isn't running
      setError('Backend API is not running. Start the database and backend to see products.');
      setProducts([]);
    } catch (err) {
      setError('Failed to fetch products. Please make sure the backend is running.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const formatEnumValue = (value: string) => {
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">🌸 Loading Flora marketplace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={fetchProducts}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🌸 Flora</h1>
        <p>Flowers & Plants Marketplace</p>
      </header>

      <main className="main">
        <section className="hero">
          <h2>Welcome to Flora</h2>
          <p>Discover beautiful flowers and plants for every occasion</p>
        </section>

        <section className="products">
          <h3>Our Products ({products.length})</h3>
          
          {products.length === 0 ? (
            <div className="no-products">
              <p>No products found. Make sure to seed the database!</p>
              <p>Run: <code>pnpm db:seed</code></p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="product-image"
                    />
                  )}
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="description">{product.description}</p>
                    <div className="price">{formatPrice(product.price)}</div>
                    <div className="product-meta">
                      <span className="type">{formatEnumValue(product.type)}</span>
                      {!product.inStock && <span className="out-of-stock">Out of Stock</span>}
                    </div>
                    <div className="tags">
                      {product.occasions.slice(0, 2).map(occasion => (
                        <span key={occasion} className="tag occasion">
                          {formatEnumValue(occasion)}
                        </span>
                      ))}
                      {product.colors.slice(0, 2).map(color => (
                        <span key={color} className="tag color">
                          {formatEnumValue(color)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2024 Flora - Holberton Demo Project by Anthony, Bevan, Xiaoling, and Lily</p>
      </footer>
    </div>
  );
}

export default App;
