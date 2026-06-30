import { useState, useMemo } from "react";
import products from "./products";
import "./App.css";

const QUICK_SUGGESTIONS = [
  { text: "Best budget phone for daily use", icon: "📱" },
  { text: "Lightweight laptop with good battery life", icon: "🔋" },
  { text: "Premium headphones with noise cancellation", icon: "🎧" },
  { text: "Smartwatch for Android health tracking", icon: "⌚" },
];

function App() {
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchFilter, setSearchFilter] = useState("");

  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(list)];
  }, []);

  const getRecommendations = async (customQuery) => {
    const searchQuery = customQuery || query;
    if (!searchQuery.trim()) {
      setError("Please enter your preferences or click a suggestion.");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);
    setRecommendations([]);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, products }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "API request failed");
      }

      const matched = data.ids
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean);

      setRecommendations(matched);
    } catch (err) {
      let cleanError = err.message || "Something went wrong. Please try again.";
      if (cleanError.includes("GROQ_API_KEY")) {
        cleanError = "The server is missing the GROQ_API_KEY. Please check your .env configuration and restart 'vercel dev'.";
      }
      setError(cleanError);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") getRecommendations();
  };

  const handleSuggestionClick = (suggestionText) => {
    setQuery(suggestionText);
    getRecommendations(suggestionText);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchFilter]);

  return (
    <div className="app-container">
      {/* Background decoration */}
      <div className="glow-sphere-1"></div>
      <div className="glow-sphere-2"></div>

      <header className="hero-header">
        <div className="logo-badge">AI Powered</div>
        <h1>Findly</h1>
        <p className="subtitle">
          Describe what you need in plain English, and our smart LLM will recommend the perfect match instantly.
        </p>
      </header>

      <main className="main-content">
        <section className="search-section">
          <div className="search-box-wrapper">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              className="query-input"
              placeholder='e.g. "I want a reliable laptop for editing video under $900"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button 
              className={`recommend-btn ${loading ? "btn-loading" : ""}`} 
              onClick={() => getRecommendations()} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                "Get Matches"
              )}
            </button>
          </div>

          <div className="suggestions-container">
            <span className="suggestions-label">Try asking:</span>
            <div className="suggestions-list">
              {QUICK_SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-tag"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  disabled={loading}
                >
                  <span className="tag-icon">{suggestion.icon}</span>
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <p className="error-text">{error}</p>
            </div>
          )}
        </section>

        {/* AI Recommendations Results */}
        {hasSearched && (
          <section className="results-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <span className="section-badge">LLM Results</span>
                <h2>Recommended For You</h2>
              </div>
              {recommendations.length > 0 && (
                <span className="results-count">{recommendations.length} items matched</span>
              )}
            </div>

            {loading ? (
              <div className="skeleton-grid">
                {[1, 2, 3].map((n) => (
                  <div className="skeleton-card" key={n}>
                    <div className="skeleton-line skeleton-badge"></div>
                    <div className="skeleton-line skeleton-title"></div>
                    <div className="skeleton-line skeleton-text-short"></div>
                    <div className="skeleton-line skeleton-text"></div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="product-grid recommended-grid">
                {recommendations.map((p, index) => (
                  <div className="product-card recommended-card" key={p.id} style={{ "--index": index }}>
                    <div className="card-top">
                      <span className="match-rank">#{index + 1} Best Match</span>
                      <span className="product-category">{p.category}</span>
                    </div>
                    <h3>{p.name}</h3>
                    <p className="price">${p.price}</p>
                    <p className="description">{p.description}</p>
                    <div className="card-footer">
                      <span className="ai-badge">✨ AI Approved</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !error && (
                <div className="empty-results">
                  <div className="empty-icon">🤷‍♂️</div>
                  <h3>No matches found</h3>
                  <p>Try describing your needs with different terms or check out all products below.</p>
                </div>
              )
            )}
          </section>
        )}

        {/* Catalog Section */}
        <section className="catalog-section">
          <div className="catalog-header">
            <h2>Explore Product Catalog</h2>
            <div className="catalog-search-wrapper">
              <input
                type="text"
                placeholder="Filter catalog by keyword..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="catalog-search"
              />
            </div>
          </div>

          <div className="category-tabs">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {filteredProducts.map((p) => (
              <div className="product-card standard-card" key={p.id}>
                <div className="card-top">
                  <span className="product-category">{p.category}</span>
                </div>
                <h3>{p.name}</h3>
                <p className="price">${p.price}</p>
                <p className="description">{p.description}</p>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-results mini">
              <p>No products in the catalog match your filters.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2026 Findly — Powered by Groq LLM reasoning</p>
      </footer>
    </div>
  );
}

export default App;
