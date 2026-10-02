import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import Fuse from "fuse.js";
import { FiSearch, FiX } from "react-icons/fi";

const SearchBar = () => {
  const [searchText, setSearchText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef(null);

  // =========================
  // GET ALL PRODUCTS
  // =========================

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/products`,
      );

      return data;
    },
  });

  // =========================
  // DEBOUNCE SEARCH TEXT
  // (300ms পর search চলবে, প্রতি অক্ষরে না)
  // =========================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // =========================
  // FUSE.JS INSTANCE
  // (typo-tolerant, Bengali/English দুটোতেই কাজ করবে)
  // keywords যোগ করা আছে যাতে Banglish spelling দিয়েও
  // বাংলা product খুঁজে পাওয়া যায়
  // =========================

  const fuse = new Fuse(products, {
    keys: ["name", "category", "mainCategory", "keywords"],
    threshold: 0.4, // বেশি হলে বেশি ভুল বানান allow করবে (0 = exact match, 1 = সব match)
    ignoreLocation: true, // word এর যেকোনো জায়গায় match খুঁজবে
    minMatchCharLength: 2,
  });

  // =========================
  // SEARCH RESULTS
  // =========================

  const results = debouncedText.trim()
    ? fuse
        .search(debouncedText)
        .slice(0, 6)
        .map((result) => result.item)
    : [];

  // =========================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // =========================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================
  // CLEAR SEARCH
  // =========================

  const handleClear = () => {
    setSearchText("");
    setDebouncedText("");
  };

  // =========================
  // ON RESULT CLICK
  // =========================

  const handleResultClick = () => {
    setShowDropdown(false);
    setSearchText("");
    setDebouncedText("");
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* ================= SEARCH INPUT ================= */}

      <div className="relative">
        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />

        <input
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search products... (বাংলা বা English এ লিখুন)"
          className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-yellow-500 transition"
        />

        {searchText && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* ================= DROPDOWN RESULTS ================= */}

      {showDropdown && debouncedText.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-md shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
          {results.length > 0 ? (
            results.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                onClick={handleResultClick}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0 transition"
              >
                {/* Image */}

                <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-50 border">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {product.name}
                  </p>

                  <p className="text-xs text-gray-400">
                    {product.mainCategory}
                    {product.category && ` › ${product.category}`}
                  </p>
                </div>

                {/* Price */}

                <span className="text-sm font-semibold text-yellow-600 flex-shrink-0">
                  ৳{Number(product.price).toLocaleString()}
                </span>
              </Link>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              কোনো product পাওয়া যায়নি {`"${debouncedText}"`} এর জন্য
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
