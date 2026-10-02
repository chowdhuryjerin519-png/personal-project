import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  AiOutlineEdit,
  AiOutlineSearch,
  AiOutlineArrowUp,
  AiOutlineArrowDown,
} from "react-icons/ai";
import axios from "axios";
import toast from "react-hot-toast";

import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import LoadingSpinner from "../../../../components/Shared/LoadingSpinner";

const UpdateProduct = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [movingId, setMovingId] = useState(null);

  // ==========================================
  // GET PRODUCTS
  // ==========================================

  const {
    data: products = [],
    isLoading: productLoading,
    isError: productError,
  } = useQuery({
    queryKey: ["products"],

    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/products`,
      );

      return Array.isArray(data) ? data : [];
    },
  });

  // ==========================================
  // GET CATEGORIES
  // ==========================================

  const { data: categories = [], isLoading: categoryLoading } = useQuery({
    queryKey: ["categories"],

    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/categories`,
      );

      return Array.isArray(data) ? data : [];
    },
  });

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) return;

    try {
      await axiosSecure.delete(`/products/${id}`);

      toast.success("Product deleted successfully");

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    } catch (error) {
      console.log("Delete product error:", error);

      toast.error(error?.response?.data?.message || "Failed to delete product");
    }
  };

  // ==========================================
  // MOVE PRODUCT UP / DOWN
  // ==========================================

  const handleMove = async (product, direction, categoryProducts) => {
    try {
      const currentIndex = categoryProducts.findIndex(
        (item) => String(item._id) === String(product._id),
      );

      if (currentIndex === -1) {
        toast.error("Product not found");
        return;
      }

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;

      // Cannot move
      if (targetIndex < 0 || targetIndex >= categoryProducts.length) {
        return;
      }

      setMovingId(product._id);

      // Copy category products
      const reorderedProducts = [...categoryProducts];

      // Swap
      [reorderedProducts[currentIndex], reorderedProducts[targetIndex]] = [
        reorderedProducts[targetIndex],
        reorderedProducts[currentIndex],
      ];

      // IMPORTANT:
      // Only send valid MongoDB _id as string
      const productsToUpdate = reorderedProducts.map((item, index) => ({
        _id: String(item._id),
        mainCategory: item.mainCategory,
        position: index + 1,
      }));

      await axiosSecure.patch("/products/reorder", {
        products: productsToUpdate,
      });

      toast.success("Product position updated");

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    } catch (error) {
      console.log("Move product error:", error);
      console.log("Backend error:", error?.response?.data);

      toast.error(
        error?.response?.data?.message || "Failed to change product position",
      );
    } finally {
      setMovingId(null);
    }
  };
  // ==========================================
  // SEARCH + CATEGORY FILTER
  // ==========================================

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      product.name?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.mainCategory?.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "all" || product.mainCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // ==========================================
  // LOADING
  // ==========================================

  if (productLoading || categoryLoading) {
    return <LoadingSpinner />;
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (productError) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load products.
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <Helmet>
        <title>Update Products | Dashboard</title>
      </Helmet>

      <div className="p-4 md:p-6">
        {/* =====================================
            HEADER
        ===================================== */}

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Update Products
          </h1>

          <p className="text-gray-500 mt-1">
            Search, edit, delete and change product position easily.
          </p>
        </div>

        {/* =====================================
            SEARCH + CATEGORY FILTER
        ===================================== */}

        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SEARCH */}

            <div className="relative">
              <AiOutlineSearch
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  text-xl
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product name, category..."
                className="
                  w-full
                  pl-10
                  pr-4
                  py-3
                  border
                  border-gray-200
                  rounded-lg
                  focus:outline-none
                  focus:border-lime-500
                "
              />
            </div>

            {/* CATEGORY */}

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="
                w-full
                px-4
                py-3
                border
                border-gray-200
                rounded-lg
                bg-white
                focus:outline-none
                focus:border-lime-500
              "
            >
              <option value="all">All Main Categories</option>

              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =====================================
            CATEGORY-WISE PRODUCTS
        ===================================== */}

        {categories.map((mainCategory) => {
          const categoryProducts = filteredProducts
            .filter((product) => product.mainCategory === mainCategory.name)
            .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));

          // Selected category check

          if (
            selectedCategory !== "all" &&
            selectedCategory !== mainCategory.name
          ) {
            return null;
          }

          // No products

          if (categoryProducts.length === 0) {
            return null;
          }

          return (
            <section key={mainCategory._id} className="mb-10">
              {/* =================================
                  CATEGORY TITLE
              ================================= */}

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-2
                  mb-4
                "
              >
                <div>
                  <h2
                    className="
                      text-xl
                      md:text-2xl
                      font-bold
                      text-gray-800
                    "
                  >
                    {mainCategory.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {categoryProducts.length} Products
                  </p>
                </div>
              </div>

              {/* =================================
                  DESKTOP: PRODUCT TABLE (md এবং তার উপরে)
              ================================= */}

              <div
                className="
                  hidden
                  md:block
                  bg-white
                  rounded-xl
                  shadow-sm
                  overflow-hidden
                "
              >
                <div className="overflow-x-auto">
                  <table
                    className="
                      w-full
                      min-w-[1000px]
                    "
                  >
                    {/* TABLE HEADER */}

                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left px-4 py-3">Product</th>

                        <th className="text-left px-4 py-3">Sub Category</th>

                        <th className="text-left px-4 py-3">Price</th>

                        <th className="text-left px-4 py-3">Quantity</th>

                        <th className="text-center px-4 py-3">Position</th>

                        <th className="text-center px-4 py-3">Action</th>
                      </tr>
                    </thead>

                    {/* TABLE BODY */}

                    <tbody>
                      {categoryProducts.map((product, index) => (
                        <tr
                          key={product._id}
                          className="
                              border-b
                              last:border-b-0
                              hover:bg-gray-50
                            "
                        >
                          {/* PRODUCT */}

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="
                                    w-14
                                    h-14
                                    rounded-lg
                                    object-cover
                                    border
                                  "
                              />

                              <div>
                                <p className="font-semibold text-gray-800">
                                  {product.name}
                                </p>

                                <p className="text-xs text-gray-400">
                                  ID: {product._id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SUB CATEGORY */}

                          <td className="px-4 py-4">
                            <span
                              className="
                                  px-3
                                  py-1
                                  bg-lime-100
                                  text-lime-700
                                  rounded-full
                                  text-sm
                                "
                            >
                              {product.category || "No Category"}
                            </span>
                          </td>

                          {/* PRICE */}

                          <td className="px-4 py-4 font-semibold">
                            ৳{product.price}
                          </td>

                          {/* QUANTITY */}

                          <td className="px-4 py-4">{product.quantity}</td>

                          {/* POSITION */}

                          <td className="px-4 py-4">
                            <div
                              className="
                                  flex
                                  justify-center
                                  items-center
                                  gap-2
                                "
                            >
                              {/* UP */}

                              <button
                                type="button"
                                disabled={
                                  index === 0 || movingId === product._id
                                }
                                onClick={() =>
                                  handleMove(product, "up", categoryProducts)
                                }
                                title="Move Up"
                                className="
                                    w-9
                                    h-9
                                    flex
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-gray-100
                                    hover:bg-lime-100
                                    text-gray-700
                                    disabled:opacity-30
                                    disabled:cursor-not-allowed
                                    transition
                                  "
                              >
                                <AiOutlineArrowUp />
                              </button>

                              {/* DOWN */}

                              <button
                                type="button"
                                disabled={
                                  index === categoryProducts.length - 1 ||
                                  movingId === product._id
                                }
                                onClick={() =>
                                  handleMove(product, "down", categoryProducts)
                                }
                                title="Move Down"
                                className="
                                    w-9
                                    h-9
                                    flex
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-gray-100
                                    hover:bg-lime-100
                                    text-gray-700
                                    disabled:opacity-30
                                    disabled:cursor-not-allowed
                                    transition
                                  "
                              >
                                <AiOutlineArrowDown />
                              </button>

                              {/* POSITION NUMBER */}

                              <span
                                className="
                                    min-w-[30px]
                                    text-center
                                    font-semibold
                                    text-gray-600
                                  "
                              >
                                {index + 1}
                              </span>
                            </div>
                          </td>

                          {/* ACTION */}

                          <td className="px-4 py-4">
                            <div
                              className="
                                  flex
                                  justify-center
                                  gap-2
                                "
                            >
                              {/* EDIT */}

                              <Link
                                to={`/dashboard/update-product/${product._id}`}
                                className="
                                    flex
                                    items-center
                                    gap-1
                                    px-4
                                    py-2
                                    rounded-lg
                                    bg-lime-500
                                    hover:bg-lime-600
                                    text-white
                                    text-sm
                                    font-semibold
                                    transition
                                  "
                              >
                                <AiOutlineEdit />
                                Edit
                              </Link>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() => handleDelete(product._id)}
                                className="
                                    px-4
                                    py-2
                                    rounded-lg
                                    bg-red-500
                                    hover:bg-red-600
                                    text-white
                                    text-sm
                                    font-semibold
                                    transition
                                  "
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* =================================
                  MOBILE: PRODUCT CARDS (md এর নিচে)
              ================================= */}

              <div className="md:hidden space-y-3">
                {categoryProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl shadow-sm p-4"
                  >
                    {/* TOP: Image + Name + Category */}

                    <div className="flex items-start gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover border flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {product.name}
                        </p>

                        <p className="text-xs text-gray-400 truncate">
                          ID: {product._id}
                        </p>

                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-lime-100 text-lime-700 rounded-full text-xs">
                          {product.category || "No Category"}
                        </span>
                      </div>
                    </div>

                    {/* PRICE + QUANTITY */}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
                      <span className="text-gray-500">
                        Price:{" "}
                        <span className="font-semibold text-gray-800">
                          ৳{product.price}
                        </span>
                      </span>

                      <span className="text-gray-500">
                        Qty:{" "}
                        <span className="font-semibold text-gray-800">
                          {product.quantity}
                        </span>
                      </span>
                    </div>

                    {/* POSITION CONTROLS */}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="text-sm text-gray-500">Position</span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={index === 0 || movingId === product._id}
                          onClick={() =>
                            handleMove(product, "up", categoryProducts)
                          }
                          title="Move Up"
                          className="
                            w-8
                            h-8
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            bg-gray-100
                            hover:bg-lime-100
                            text-gray-700
                            disabled:opacity-30
                            disabled:cursor-not-allowed
                            transition
                          "
                        >
                          <AiOutlineArrowUp size={14} />
                        </button>

                        <button
                          type="button"
                          disabled={
                            index === categoryProducts.length - 1 ||
                            movingId === product._id
                          }
                          onClick={() =>
                            handleMove(product, "down", categoryProducts)
                          }
                          title="Move Down"
                          className="
                            w-8
                            h-8
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            bg-gray-100
                            hover:bg-lime-100
                            text-gray-700
                            disabled:opacity-30
                            disabled:cursor-not-allowed
                            transition
                          "
                        >
                          <AiOutlineArrowDown size={14} />
                        </button>

                        <span className="min-w-[26px] text-center font-semibold text-gray-600 text-sm">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <Link
                        to={`/dashboard/update-product/${product._id}`}
                        className="
                          flex-1
                          flex
                          items-center
                          justify-center
                          gap-1
                          px-4
                          py-2
                          rounded-lg
                          bg-lime-500
                          hover:bg-lime-600
                          text-white
                          text-sm
                          font-semibold
                          transition
                        "
                      >
                        <AiOutlineEdit />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
                        className="
                          flex-1
                          px-4
                          py-2
                          rounded-lg
                          bg-red-500
                          hover:bg-red-600
                          text-white
                          text-sm
                          font-semibold
                          transition
                        "
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* =====================================
            NO RESULT
        ===================================== */}

        {filteredProducts.length === 0 && (
          <div
            className="
              text-center
              py-16
              bg-white
              rounded-xl
            "
          >
            <p className="text-gray-500">No products found.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default UpdateProduct;
