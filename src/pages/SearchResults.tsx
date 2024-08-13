import React, { useEffect, useRef, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAPI } from "../apiContext";
import Card from "../components/Card";
import Spinner from "../components/Spinner";
import Fuse from "fuse.js";

// Define types for attributes and search results
type CustomAttribute = {
  attribute_code: string;
  value: string | number;
};

type Product = {
  id: number;
  name: string;
  price_eth: number;
  price_usd: number;
  custom_attributes: CustomAttribute[];
  media_gallery_entries: { file: string }[];
  conversionRate: number;
};

type SearchResultsResponse = {
  items: Product[];
};

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResults: React.FC = () => {
  const { searchResults, performSearch, categories } = useAPI();
  const query = useQuery();
  const navigate = useNavigate();
  const searchQuery = query.get("query") || "";
  const hasSearched = useRef(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery && !hasSearched.current) {
        setLoading(true);
        await performSearch(searchQuery, 16, 1); // Example: pageSize=16, currentPage=1
        hasSearched.current = true;
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, performSearch]);

  useEffect(() => {
    if (searchResults.length === 0 && searchQuery) {
      suggestTerms(searchQuery);
    }
  }, [searchResults, searchQuery]);

  const suggestTerms = (query: string) => {
    const fuse = new Fuse(categories, {
      keys: ["name"],
      threshold: 0.3,
    });
    const result = fuse.search(query);
    const suggestedTerms = result.map((item) => item.item.name);
    setSuggestions(suggestedTerms);
  };

  const extractAttribute = (
    attributes: CustomAttribute[],
    attributeCode: string
  ): string | number => {
    const attribute = attributes.find(
      (attr) => attr.attribute_code === attributeCode
    );
    return attribute ? attribute.value : "N/A";
  };

  const handleSearch = (term: string) => {
    navigate(`/search?query=${term}`);
    hasSearched.current = false; // Reset the search state to allow the search to trigger
    setLoading(true);
    performSearch(term, 16, 1).then(() => setLoading(false)); // Trigger search and set loading
  };
  console.log(searchResults);
  return (
    <div className="container mx-auto p-6">
      {loading && <Spinner />}
      {!loading && searchResults.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchResults.map((product) => {
              const imgSrc = product.media_gallery_entries?.[0]?.file
                ? `https://cryptrovia.com/pub/media/catalog/product${product.media_gallery_entries[0].file}`
                : "https://via.placeholder.com/400";
              let usdValue = extractAttribute(product.custom_attributes, "usd");
              usdValue =
                typeof usdValue === "string" ? parseFloat(usdValue) : usdValue;
              return (
                <Card
                  id={product.id}
                  imgSrc={imgSrc}
                  title={product.name}
                  price_eth={product.price_eth}
                  key={product.id}
                  price_usd={product.price_usd}
                  sku={product.sku}
                />
              );
            })}
          </div>
        </div>
      )}
      {!loading && searchResults.length === 0 && (
        <div>
          <p>No results found for "{searchQuery}"</p>
          {suggestions.length > 0 && (
            <div>
              <h3>Did you mean:</h3>
              <ul>
                {suggestions.map((term, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSearch(term)}
                      className="text-blue-500 hover:underline"
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
