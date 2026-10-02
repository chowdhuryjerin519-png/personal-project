import Card from "./Card";
import Container from "../Shared/Container";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { useState } from "react";

const Products = () => {
  const [visibleCount, setVisibleCount] = useState({});

  // ==========================================
  // GET ALL PRODUCTS
  // ==========================================

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios(`${import.meta.env.VITE_API_URL}/products`);

      return data;
    },
  });

  // ==========================================
  // LOADING
  // ==========================================

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (isError) {
    return (
      <Container>
        <div className="py-10 text-center text-red-500">
          Failed to load products.
        </div>
      </Container>
    );
  }

  // ==========================================
  // NO PRODUCTS
  // ==========================================

  if (!products || products.length === 0) {
    return (
      <Container>
        <div className="py-10 text-center text-gray-500">No Data Available</div>
      </Container>
    );
  }

  // ==========================================
  // GET UNIQUE MAIN CATEGORIES
  // ==========================================

  const mainCategories = [
    ...new Set(products.map((product) => product.mainCategory).filter(Boolean)),
  ];

  // ==========================================
  // DEFAULT VISIBLE PRODUCTS
  //
  // Desktop:
  // 5 products × 2 rows = 10
  //
  // Mobile:
  // 2 products × 3 rows = 6
  //
  // We initially show 10.
  // CSS grid will automatically make it:
  // Mobile → 2 columns
  // Desktop → 5 columns
  // ==========================================

  const initialProducts = 8;

  // ==========================================
  // SEE MORE
  // ==========================================

  const handleSeeMore = (category) => {
    setVisibleCount((prev) => ({
      ...prev,
      [category]: (prev[category] || initialProducts) + initialProducts,
    }));
  };

  return (
    <Container>
      <div className="pt-8 md:py-8">
        {/* ==========================================
            ALL MAIN CATEGORIES
        ========================================== */}

        {mainCategories.map((mainCategory) => {
          // ------------------------------------------
          // Products of this MAIN CATEGORY
          //
          // This includes ALL subcategories.
          // ------------------------------------------

          const categoryProducts = products.filter(
            (product) => product.mainCategory === mainCategory,
          );

          // ------------------------------------------
          // How many products to show
          // ------------------------------------------

          const currentVisible = visibleCount[mainCategory] || initialProducts;

          const displayedProducts = categoryProducts.slice(0, currentVisible);

          // ------------------------------------------
          // Is there more?
          // ------------------------------------------

          const hasMore = currentVisible < categoryProducts.length;

          return (
            <section
              key={mainCategory}
              className="mb-10 bg-[#FCFAF6] rounded-xl p-2  md:p-6 py-5 md:py-10 "
            >
              {/* ======================================
                  CATEGORY TITLE
              ====================================== */}

              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {mainCategory}
                </h2>

                <span className="text-sm text-gray-500">
                  {categoryProducts.length} Products
                </span>
              </div>

              {/* ======================================
                  PRODUCTS GRID
              ====================================== */}

              <div
                className="
                  grid
                  grid-cols-2
                  lg:grid-cols-4
                  gap-3
                  md:gap-4
                "
              >
                {displayedProducts.map((product) => (
                  <Card key={product._id} product={product} />
                ))}
              </div>

              {/* ======================================
                  SEE MORE
              ====================================== */}

              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={() => handleSeeMore(mainCategory)}
                    className="
                      px-6
                      py-2.5
                      rounded-md
                      bg-lime-500
                      hover:bg-lime-600
                      text-white
                      font-semibold
                      transition
                    "
                  >
                    See More
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </Container>
  );
};

export default Products;
