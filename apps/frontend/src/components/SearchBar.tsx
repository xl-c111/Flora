import React, { useState, useEffect, useRef } from 'react';

/**
 * SearchBar Component
 *
 * This component provides search functionality with autocomplete suggestions.
 * It connects to the backend's search suggestions endpoint to provide
 * real-time search suggestions as the user types.
 *
 * Props:
 * - onSearchChange: Function called when user selects a search term
 * - currentSearch: Currently active search term (for controlled input)
 */
interface SearchBarProps {
  onSearchChange: (searchTerm: string) => void;
  currentSearch: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  currentSearch,
}) => {
  // State for the text the user is currently typing (different from selected search)
  const [inputValue, setInputValue] = useState<string>(currentSearch);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // State for storing autocomplete suggestions from backend
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // State to control whether suggestions dropdown is visible
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // State to track if we're currently fetching suggestions
  const [isLoadingSuggestions, setIsLoadingSuggestions] =
    useState<boolean>(false);

  // State for keyboard navigation in suggestions dropdown
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Update input value when currentSearch prop changes
   * This keeps the input in sync with the parent component's search state
   */
  useEffect(() => {
    setInputValue(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /**
   * Fetch search suggestions from backend
   * This function calls the backend API to get autocomplete suggestions
   */
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      // Don't search for very short queries to avoid too many requests
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoadingSuggestions(true);
      setSelectedIndex(-1); // Reset keyboard navigation selection

      // Call the backend search suggestions endpoint
      // This maps to: GET /api/products/search/suggestions?q=query
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
        }/products/search/suggestions?q=${encodeURIComponent(query)}`
      );

      if (response.ok) {
        const data = await response.json();
        // Backend returns { suggestions: string[] }
        setSuggestions(data.suggestions || []);
        setShowSuggestions(data.suggestions && data.suggestions.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  /**
   * Handle keyboard navigation in suggestions dropdown
   * Supports arrow keys, Enter, and Escape
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          setShowSuggestions(false);
          onSearchChange(inputValue.trim());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  /**
   * Handle input change (user typing)
   * Updates the input value and triggers suggestion fetching
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Debounce the suggestion fetching to avoid too many API calls
    // Clear any existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Set a new timeout to fetch suggestions after user stops typing
    window.searchTimeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // Wait 300ms after user stops typing
  };

  /**
   * Handle when user clicks on a suggestion
   * This selects the suggestion and triggers the search
   */
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setIsEditing(false);
    onSearchChange(suggestion); // Trigger the actual search
  };

  /**
   * Handle form submission (user presses Enter)
   * This triggers search with the current input value
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setIsEditing(false);
    onSearchChange(inputValue.trim());
  };

  /**
   * Handle input focus - show suggestions if we have any
   */
  const handleFocus = () => {
    if (suggestions.length > 0 && inputValue.length >= 2) {
      setShowSuggestions(true);
    }
  };

  /**
   * Handle input blur - hide suggestions after a delay
   * The delay allows clicks on suggestions to register before hiding
   */
  const handleBlur = () => {
    // Delay hiding suggestions to allow clicks on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      setIsEditing(false);
    }, 200);
  };

  /**
   * Clear the search
   */
  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsEditing(false);
    onSearchChange(''); // Clear the search in parent component
  };

  const handleActivateSearch = () => {
    setIsEditing(true);
  };

  const containerClassName = `search-input-container${isEditing ? ' active' : ''}`;
  const displayValue = inputValue.trim() ? inputValue : 'Search';

  return (
    <div className="search-bar">
      {/* Screen reader instructions */}
      <div
        id="search-instructions"
        className="sr-only"
      >
        Type to search for flowers. Use arrow keys to navigate suggestions,
        Enter to select.
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="search-form"
      >
        <div className={containerClassName}>
          {isEditing ? (
            <>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Search for flowers, occasions, colors..."
                className="search-input"
                autoComplete="off"
                aria-label="Search for flowers"
                aria-describedby="search-instructions"
                role="searchbox"
                aria-expanded={showSuggestions}
                aria-haspopup="listbox"
              />

              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="search-clear-button"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}

              <button
                type="submit"
                className="search-button"
                aria-label="Search"
              >
                🔍
              </button>
            </>
          ) : (
            <button
              type="button"
              className="search-toggle"
              onClick={handleActivateSearch}
              aria-label="Activate search"
              aria-describedby="search-instructions"
            >
              {displayValue}
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div
            className="suggestions-dropdown"
            role="listbox"
            aria-label="Search suggestions"
          >
            {isLoadingSuggestions ? (
              <div className="suggestion-item loading">Searching...</div>
            ) : suggestions.length > 0 ? (
              <>
                {/* Show suggestions */}
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`suggestion-item ${
                      index === selectedIndex ? 'selected' : ''
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    role="option"
                    aria-selected={index === selectedIndex}
                    tabIndex={-1}
                  >
                    {suggestion}
                  </div>
                ))}

                {/* Show option to search for exact input if it's different from suggestions */}
                {!suggestions.includes(inputValue) && inputValue.trim() && (
                  <div
                    className="suggestion-item search-exact"
                    onClick={() => handleSuggestionClick(inputValue.trim())}
                  >
                    Search for "{inputValue.trim()}"
                  </div>
                )}
              </>
            ) : (
              <div className="suggestion-item no-results">
                No suggestions found
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    searchTimeout?: ReturnType<typeof setTimeout>;
  }
}

export default SearchBar;
