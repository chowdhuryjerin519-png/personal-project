/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiMinus, FiPlus, FiFilter, FiX } from "react-icons/fi";
import Card from "../../../components/Home/Card";

// =====================================================
// CUSTOM DUAL-THUMB PRICE RANGE SLIDER
// =====================================================

const PriceRangeSlider = ({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  disabled,
}) => {
  const trackRef = useRef(null);
  const draggingRef = useRef(null); // "min" | "max" | null

  const liveValuesRef = useRef({ min: valueMin, max: valueMax });

  useEffect(() => {
    if (!draggingRef.current) {
      liveValuesRef.current = { min: valueMin, max: valueMax };
    }
  }, [valueMin, valueMax]);

  const getPercent = (value) => {
    if (max === min) return 0;
    return ((value - min) / (max - min)) * 100;
  };

  const getValueFromClientX = (clientX) => {
    const track = trackRef.current;

    if (!track) return min;

    const rect = track.getBoundingClientRect();

    let percent = (clientX - rect.left) / rect.width;
    percent = Math.min(1, Math.max(0, percent));

    const rawValue = min + percent * (max - min);

    return Math.round(rawValue);
  };

  const handleMove = (e) => {
    if (!draggingRef.current) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const value = getValueFromClientX(clientX);

    const current = liveValuesRef.current;

    if (draggingRef.current === "min") {
      const newMin = Math.min(value, current.max);
      liveValuesRef.current = { min: newMin, max: current.max };
      onChange({ min: newMin, max: current.max });
    } else {
      const newMax = Math.max(value, current.min);
      liveValuesRef.current = { min: current.min, max: newMax };
      onChange({ min: current.min, max: newMax });
    }
  };

  const stopDragging = () => {
    draggingRef.current = null;

    document.removeEventListener("mousemove", handleMove);
    document.removeEventListener("mouseup", stopDragging);
    document.removeEventListener("touchmove", handleMove);
    document.removeEventListener("touchend", stopDragging);
  };

  const startDragging = (thumb) => (e) => {
    if (disabled) return;

    e.preventDefault();
    draggingRef.current = thumb;

    liveValuesRef.current = { min: valueMin, max: valueMax };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", stopDragging);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", stopDragging);
  };

  const handleTrackClick = (e) => {
    if (disabled) return;
    if (e.target !== trackRef.current) return;

    const value = getValueFromClientX(e.clientX);

    const distToMin = Math.abs(value - valueMin);
    const distToMax = Math.abs(value - valueMax);

    if (distToMin <= distToMax) {
      const newMin = Math.min(value, valueMax);
      liveValuesRef.current = { min: newMin, max: valueMax };
      onChange({ min: newMin, max: valueMax });
    } else {
      const newMax = Math.max(value, valueMin);
      liveValuesRef.current = { min: valueMin, max: newMax };
      onChange({ min: valueMin, max: newMax });
    }
  };

  const minPercent = getPercent(valueMin);
  const maxPercent = getPercent(valueMax);

  return (
    <div className="relative mt-6 mb-3 h-6 select-none">
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className={`absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-200 rounded-full ${
          disabled ? "" : "cursor-pointer"
        }`}
      />

      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-yellow-500 rounded-full pointer-events-none"
        style={{
          left: `${minPercent}%`,
          right: `${100 - maxPercent}%`,
        }}
      />

      <div
        onMouseDown={startDragging("min")}
        onTouchStart={startDragging("min")}
        style={{ left: `${minPercent}%` }}
        className={`
          absolute top-1/2 -translate-y-1/2 -translate-x-1/2
          w-5 h-5 rounded-full bg-yellow-500 border-4 border-white shadow
          touch-none
          ${disabled ? "opacity-60" : "cursor-grab active:cursor-grabbing"}
        `}
      />

      <div
        onMouseDown={startDragging("max")}
        onTouchStart={startDragging("max")}
        style={{ left: `${maxPercent}%` }}
        className={`
          absolute top-1/2 -translate-y-1/2 -translate-x-1/2
          w-5 h-5 rounded-full bg-yellow-500 border-4 border-white shadow
          touch-none
          ${disabled ? "opacity-60" : "cursor-grab active:cursor-grabbing"}
        `}
      />
    </div>
  );
};

// =====================================================
// PriceSlider — Min/Max input box + drag slider
// =====================================================

const PriceSlider = ({
  priceRange,
  minPrice,
  maxPrice,
  isLoading,
  productsLength,
  onChange,
}) => {
  const isDisabled = priceRange.min === priceRange.max || productsLength === 0;

  // ================= INPUT BOX HANDLERS =================
  const handleMinInputChange = (e) => {
    const raw = e.target.value;

    if (raw === "") return; // typing er shomoy khali thakle kichu korbo na

    let value = Number(raw);

    if (isNaN(value)) return;

    // range-er bairer value dile clamp kore dibe
    value = Math.max(priceRange.min, Math.min(value, maxPrice));

    onChange({ min: value, max: maxPrice });
  };

  const handleMaxInputChange = (e) => {
    const raw = e.target.value;

    if (raw === "") return;

    let value = Number(raw);

    if (isNaN(value)) return;

    value = Math.min(priceRange.max, Math.max(value, minPrice));

    onChange({ min: minPrice, max: value });
  };

  return (
    <>
      {/* ================= MIN / MAX INPUT BOX ================= */}
      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Min</label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 focus-within:border-yellow-500">
            <span className="text-xs text-gray-500">৳</span>
            <input
              type="number"
              value={minPrice}
              onChange={handleMinInputChange}
              disabled={isDisabled}
              min={priceRange.min}
              max={priceRange.max}
              className="w-full px-1 py-2 text-sm outline-none bg-transparent disabled:text-gray-400"
            />
          </div>
        </div>

        <span className="text-gray-300 mt-5">—</span>

        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Max</label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 focus-within:border-yellow-500">
            <span className="text-xs text-gray-500">৳</span>
            <input
              type="number"
              value={maxPrice}
              onChange={handleMaxInputChange}
              disabled={isDisabled}
              min={priceRange.min}
              max={priceRange.max}
              className="w-full px-1 py-2 text-sm outline-none bg-transparent disabled:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* ================= SLIDER (thumb tene o kaj korbe) ================= */}
      {!isLoading && productsLength > 0 && (
        <PriceRangeSlider
          min={priceRange.min}
          max={priceRange.max}
          valueMin={minPrice}
          valueMax={maxPrice}
          disabled={isDisabled}
          onChange={onChange}
        />
      )}

      {!isLoading && productsLength === 0 && (
        <p className="text-sm text-gray-400 mt-4">No price range available</p>
      )}

      <p className="text-xs text-gray-400 mt-1 text-center">
        Available: ৳{priceRange.min.toLocaleString()} – ৳
        {priceRange.max.toLocaleString()}
      </p>
    </>
  );
};

// =====================================================
// CategoryList — module-level e
// =====================================================

const CategoryList = ({
  mainCategory,
  category,
  subCategories,
  onItemClick,
}) => (
  <div className="space-y-2">
    <Link
      to={`/products/category/${encodeURIComponent(mainCategory)}`}
      onClick={onItemClick}
      className={`flex items-center gap-2 text-sm py-1.5 transition ${
        !category
          ? "text-yellow-600 font-semibold"
          : "text-gray-700 hover:text-yellow-600"
      }`}
    >
      <span
        className={`w-4 h-4 border rounded-sm flex-shrink-0 ${
          !category ? "bg-yellow-500 border-yellow-500" : "border-gray-300"
        }`}
      />
      All {mainCategory}
    </Link>

    {subCategories.map((subCategory) => (
      <Link
        key={subCategory._id}
        to={`/products/category/${encodeURIComponent(
          mainCategory,
        )}/${encodeURIComponent(subCategory.name)}`}
        onClick={onItemClick}
        className={`flex items-center gap-2 text-sm py-1.5 transition ${
          category === subCategory.name
            ? "text-yellow-600 font-semibold"
            : "text-gray-700 hover:text-yellow-600"
        }`}
      >
        <span
          className={`w-4 h-4 border rounded-sm flex-shrink-0 ${
            category === subCategory.name
              ? "bg-yellow-500 border-yellow-500"
              : "border-gray-300"
          }`}
        />
        {subCategory.name}
      </Link>
    ))}
  </div>
);

const CategoryProducts = () => {
  const { mainCategory, category } = useParams();

  const [filterOpen, setFilterOpen] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const [sortOption, setSortOption] = useState("default");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/categories`,
      );

      return data;
    },
  });

  const currentMainCategory = categories.find(
    (item) => item.name === mainCategory,
  );

  const subCategories = currentMainCategory?.subcategories || [];

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["category-products", mainCategory, category],

    queryFn: async () => {
      let url;

      if (category) {
        url = `${
          import.meta.env.VITE_API_URL
        }/products/category/${encodeURIComponent(
          mainCategory,
        )}/${encodeURIComponent(category)}`;
      } else {
        url = `${
          import.meta.env.VITE_API_URL
        }/products/category/${encodeURIComponent(mainCategory)}`;
      }

      const { data } = await axios.get(url);

      return data;
    },

    enabled: !!mainCategory,
  });

  const priceRange = useMemo(() => {
    if (!products.length) {
      return { min: 0, max: 0 };
    }

    const prices = products
      .map((product) => Number(product.price))
      .filter((price) => !isNaN(price));

    if (!prices.length) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  useEffect(() => {
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
  }, [priceRange.min, priceRange.max]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const price = Number(product.price);
      return price >= minPrice && price <= maxPrice;
    });
  }, [products, minPrice, maxPrice]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];

    switch (sortOption) {
      case "price-low-high":
        return list.sort((a, b) => Number(a.price) - Number(b.price));

      case "price-high-low":
        return list.sort((a, b) => Number(b.price) - Number(a.price));

      case "newest":
        return list.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

      default:
        return list;
    }
  }, [filteredProducts, sortOption]);

  const handlePriceChange = ({ min, max }) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ================= BREADCRUMB ================= */}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {category || mainCategory}
          </h1>

          <div className="text-sm text-gray-500">
            <Link to="/" className="hover:text-yellow-500 transition">
              Home
            </Link>

            <span className="mx-2">›</span>

            <span>{mainCategory}</span>

            {category && (
              <>
                <span className="mx-2">›</span>
                <span>{category}</span>
              </>
            )}
          </div>
        </div>

        {/* ================= MOBILE FILTER MODAL ================= */}

        {mobileFilterOpen && (
          <div className="fixed inset-0 z-[99999] lg:hidden flex items-start justify-center pt-14 px-4">
            <div
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/60"
            />

            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="absolute top-4 right-5 text-white text-2xl z-10"
            >
              <FiX />
            </button>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto">
              <div className="p-5">
                <div className="pb-3 border-b flex items-center justify-between">
                  <h2 className="font-bold text-sm tracking-wide">
                    FILTER BY CATEGORY
                  </h2>
                </div>

                <div className="pt-3">
                  <CategoryList
                    mainCategory={mainCategory}
                    category={category}
                    subCategories={subCategories}
                    onItemClick={() => setMobileFilterOpen(false)}
                  />
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <h2 className="font-bold text-sm tracking-wide">
                      PRICE RANGE
                    </h2>
                  </div>

                  <PriceSlider
                    priceRange={priceRange}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    isLoading={isLoading}
                    productsLength={products.length}
                    onChange={handlePriceChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MAIN CONTENT ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-5">
          <aside className="hidden lg:block">
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between pb-3 border-b">
                <h2 className="font-bold text-sm tracking-wide">
                  FILTER BY CATEGORY
                </h2>

                <button
                  type="button"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="text-gray-500 hover:text-yellow-500 transition"
                >
                  {filterOpen ? <FiMinus /> : <FiPlus />}
                </button>
              </div>

              {filterOpen && (
                <div className="pt-3">
                  <CategoryList
                    mainCategory={mainCategory}
                    category={category}
                    subCategories={subCategories}
                  />
                </div>
              )}
            </div>

            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-5 mt-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <h2 className="font-bold text-sm tracking-wide">PRICE RANGE</h2>
                <FiMinus className="text-gray-500" />
              </div>

              <PriceSlider
                priceRange={priceRange}
                minPrice={minPrice}
                maxPrice={maxPrice}
                isLoading={isLoading}
                productsLength={products.length}
                onChange={handlePriceChange}
              />
            </div>
          </aside>

          {/* ================= PRODUCTS ================= */}

          <main>
            <div className="bg-white border border-gray-100 rounded-md shadow-sm p-3 md:p-4 mb-5">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center justify-center gap-2 border border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  <FiFilter size={16} />
                  <span>FILTERS</span>
                </button>

                <div className="text-sm text-gray-700 hidden sm:block">
                  <span className="font-semibold">{sortedProducts.length}</span>{" "}
                  Products
                </div>

                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="ml-auto w-48 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-yellow-500"
                >
                  <option value="default">Default Sorting</option>
                  <option value="price-low-high">Price Low to High</option>
                  <option value="price-high-low">Price High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              <div className="text-sm text-gray-700 mt-3 sm:hidden">
                <span className="font-semibold">{sortedProducts.length}</span>{" "}
                Products
              </div>
            </div>

            {isLoading && (
              <div className="py-20 text-center">
                <span className="loading loading-spinner loading-lg text-yellow-500" />
              </div>
            )}

            {isError && (
              <div className="bg-red-50 text-red-500 p-5 rounded-md">
                Failed to load products.
              </div>
            )}

            {!isLoading && !isError && sortedProducts.length === 0 && (
              <div className="bg-white rounded-md p-10 text-center">
                <h2 className="text-xl font-semibold text-gray-700">
                  No products found
                </h2>

                <p className="text-gray-500 mt-2">
                  No products found within this price range.
                </p>
              </div>
            )}

            {!isLoading && sortedProducts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-4-2">
                {sortedProducts.map((product) => (
                  <Card key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;
