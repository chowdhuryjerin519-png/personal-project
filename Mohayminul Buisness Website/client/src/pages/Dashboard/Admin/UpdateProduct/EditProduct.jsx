import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { TbFidgetSpinner } from "react-icons/tb";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { imageUpload } from "../../../../api/utils";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [selectedMainCategory, setSelectedMainCategory] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [specifications, setSpecifications] = useState([]);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // GET PRODUCT
  // ==========================================

  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
  } = useQuery({
    queryKey: ["product", id],

    queryFn: async () => {
      const { data } = await axiosSecure.get(`/products/${id}`);

      return data;
    },

    enabled: !!id,
  });

  // ==========================================
  // GET CATEGORIES
  // ==========================================

  const { data: categories = [], isLoading: categoryLoading } = useQuery({
    queryKey: ["categories"],

    queryFn: async () => {
      const { data } = await axiosSecure.get("/categories");

      return data;
    },
  });

  // ==========================================
  // SET PRODUCT DATA
  // ==========================================

  useEffect(() => {
    if (product) {
      setSelectedMainCategory(product.mainCategory || "");

      setImagePreview(product.image || "");

      setSpecifications(
        Array.isArray(product.specifications) &&
          product.specifications.length > 0
          ? product.specifications
          : [],
      );
    }
  }, [product]);

  // ==========================================
  // SELECTED CATEGORY
  // ==========================================

  const selectedCategory = categories.find(
    (category) => category.name === selectedMainCategory,
  );

  const subCategories = selectedCategory?.subcategories || [];

  // ==========================================
  // IMAGE CHANGE
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    const preview = URL.createObjectURL(file);

    setImagePreview(preview);
  };

  // ==========================================
  // SPECIFICATION ROW HELPERS
  // ==========================================

  const handleSpecChange = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const addSpecRow = () => {
    setSpecifications([...specifications, { label: "", value: "" }]);
  };

  const removeSpecRow = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const form = e.target;

    try {
      const name = form.name.value.trim();
      const description = form.description.value.trim();

      const mainCategory = form.mainCategory.value;

      const category = form.category.value;

      const originalPrice = form.originalPrice.value
        ? Number(form.originalPrice.value)
        : null;

      const price = Number(form.price.value);

      const quantity = Number(form.quantity.value);

      const keywords = form.keywords.value;

      const authorName = form.authorName.value;
      const authorBio = form.authorBio.value;

      const publisher = form.publisher.value;

      const previewPdfUrl = form.previewPdfUrl.value;

      // ========================================
      // IMAGE
      // ========================================

      let imageUrl = product.image;

      if (imageFile) {
        imageUrl = await imageUpload(imageFile);
      }

      // ========================================
      // UPDATED DATA
      // ========================================

      const updatedProduct = {
        name,
        mainCategory,
        category,
        description,
        price,
        originalPrice,
        quantity,
        image: imageUrl,
        keywords,
        specifications,
        authorName,
        authorBio,
        publisher,
        previewPdfUrl,
      };

      // ========================================
      // UPDATE DATABASE
      // ========================================

      const { data } = await axiosSecure.patch(
        `/products/${id}`,
        updatedProduct,
      );

      console.log("Update response:", data);

      toast.success("Product updated successfully");

      // Refresh products
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["product", id],
      });

      // Back to product update list
      navigate("/dashboard/update-products");
    } catch (error) {
      console.log("Update Product Error:", error);

      toast.error(error?.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (productLoading || categoryLoading) {
    return (
      <div className="flex justify-center py-20">
        <TbFidgetSpinner className="animate-spin text-3xl text-yellow-500" />
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (productError || !product) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load product.
      </div>
    );
  }

  // ==========================================
  // FORM
  // ==========================================

  return (
    <>
      <Helmet>
        <title>Edit Product | Dashboard</title>
      </Helmet>

      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Edit Product
            </h1>

            <p className="text-gray-500 mt-1">
              Update your product information.
            </p>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="
              bg-white
              rounded-xl
              shadow-sm
              p-5
              md:p-7
              space-y-5
            "
          >
            {/* =====================================================
                TWO COLUMN LAYOUT (Desktop: lg এ 2 column, Image ডানে sticky)
                Mobile: 1 column, স্বাভাবিক stack
            ===================================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              {/* =============== LEFT COLUMN: MAIN FORM FIELDS =============== */}

              <div className="space-y-5 min-w-0">
                {/* NAME */}

                <div className="space-y-1 text-sm">
                  <label htmlFor="name" className="block text-gray-600">
                    Product Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={product.name}
                    required
                    className="
                      w-full
                      px-4
                      py-3
                      border
                      border-yellow-300
                      rounded-md
                      bg-white
                      focus:outline-yellow-500
                    "
                  />
                </div>

                {/* CATEGORY */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* MAIN CATEGORY */}

                  <div className="space-y-1 text-sm">
                    <label
                      htmlFor="mainCategory"
                      className="block text-gray-600"
                    >
                      Main Category
                    </label>

                    <select
                      name="mainCategory"
                      id="mainCategory"
                      value={selectedMainCategory}
                      onChange={(e) => {
                        setSelectedMainCategory(e.target.value);
                      }}
                      required
                      className="
                        w-full
                        px-4
                        py-3
                        border
                        border-yellow-300
                        rounded-md
                        bg-white
                        focus:outline-yellow-500
                      "
                    >
                      <option value="">Select Main Category</option>

                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SUB CATEGORY */}

                  <div className="space-y-1 text-sm">
                    <label htmlFor="category" className="block text-gray-600">
                      Sub Category
                    </label>

                    <select
                      name="category"
                      id="category"
                      defaultValue={product.category}
                      disabled={
                        !selectedMainCategory || subCategories.length === 0
                      }
                      required
                      className="
                        w-full
                        px-4
                        py-3
                        border
                        border-yellow-300
                        rounded-md
                        bg-white
                        focus:outline-yellow-500
                      "
                    >
                      <option value="">Select Sub Category</option>

                      {subCategories.map((subCategory) => (
                        <option key={subCategory._id} value={subCategory.name}>
                          {subCategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SUMMARY / DESCRIPTION */}

                <div className="space-y-1 text-sm">
                  <label htmlFor="description" className="block text-gray-600">
                    Summary
                  </label>

                  <textarea
                    name="description"
                    id="description"
                    defaultValue={product.description}
                    required
                    className="
                      w-full
                      h-32
                      px-4
                      py-3
                      border
                      border-yellow-300
                      rounded-md
                      bg-white
                      focus:outline-yellow-500
                    "
                  />
                </div>

                {/* ================= SPECIFICATION (dynamic rows) ================= */}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <label className="block text-gray-600">Specification</label>
                    <button
                      type="button"
                      onClick={addSpecRow}
                      className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-xs font-medium"
                    >
                      <FiPlus size={14} /> Add Row
                    </button>
                  </div>

                  {specifications.length === 0 && (
                    <p className="text-xs text-gray-400">
                      No specification added yet. Click &quot;Add Row&quot;
                      (e.g. Publisher, Edition, Language, Weight).
                    </p>
                  )}

                  <div className="space-y-2">
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Label (e.g. Publisher)"
                          value={spec.label}
                          onChange={(e) =>
                            handleSpecChange(index, "label", e.target.value)
                          }
                          className="w-1/3 px-3 py-2 text-sm border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. BookMarket Publishers)"
                          value={spec.value}
                          onChange={(e) =>
                            handleSpecChange(index, "value", e.target.value)
                          }
                          className="flex-1 px-3 py-2 text-sm border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecRow(index)}
                          className="text-red-500 hover:text-red-600 px-2"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================= AUTHOR ================= */}

                <div className="space-y-1 text-sm">
                  <label htmlFor="authorName" className="block text-gray-600">
                    Author Name
                  </label>
                  <input
                    type="text"
                    name="authorName"
                    id="authorName"
                    defaultValue={product.authorName}
                    placeholder="e.g. তামিম শাহরিয়ার সুবিন"
                    className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
                  />
                </div>

                <div className="space-y-1 text-sm">
                  <label htmlFor="authorBio" className="block text-gray-600">
                    About the Author
                  </label>
                  <textarea
                    id="authorBio"
                    name="authorBio"
                    defaultValue={product.authorBio}
                    placeholder="Short author bio..."
                    className="block rounded-md w-full h-24 px-4 py-3 text-gray-800 border border-yellow-300 bg-white focus:outline-yellow-500"
                  />
                </div>

                {/* ================= SEARCH KEYWORDS ================= */}

                <div className="space-y-1 text-sm">
                  <label htmlFor="keywords" className="block text-gray-600">
                    Search Keywords (English spelling) — optional
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    id="keywords"
                    defaultValue={product.keywords}
                    placeholder="যেমন: ovijatri, obhijatri, adventure book"
                    className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
                  />
                  <p className="text-xs text-gray-400">
                    বাংলা প্রোডাক্টের নাম ইংরেজি বানানে (Banglish) সার্চ করতে
                    চাইলে এখানে কমা (,) দিয়ে আলাদা করে কয়েকটা spelling লিখে
                    দাও
                  </p>
                </div>

                {/* ================= PUBLISHER ================= */}

                <div className="space-y-1 text-sm">
                  <label htmlFor="publisher" className="block text-gray-600">
                    Publisher
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    id="publisher"
                    defaultValue={product.publisher}
                    placeholder="e.g. BookMarket Publishers"
                    className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
                  />
                </div>

                {/* ================= PREVIEW PDF LINK ================= */}

                <div className="space-y-1 text-sm">
                  <label
                    htmlFor="previewPdfUrl"
                    className="block text-gray-600"
                  >
                    Preview PDF Link — optional
                  </label>
                  <input
                    type="url"
                    name="previewPdfUrl"
                    id="previewPdfUrl"
                    defaultValue={product.previewPdfUrl}
                    placeholder="https://... (a few pages preview link)"
                    className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
                  />
                  <p className="text-xs text-gray-400">
                    এই লিংক দিলে কার্ড এবং ডিটেইলস পেজে &quot;একটু পড়ে
                    দেখুন&quot; বাটন দেখাবে
                  </p>
                </div>

                {/* PRICE + QUANTITY */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1 text-sm">
                    <label
                      htmlFor="originalPrice"
                      className="block text-gray-600"
                    >
                      Original Price — optional
                    </label>

                    <input
                      type="number"
                      name="originalPrice"
                      id="originalPrice"
                      min="0"
                      step="0.01"
                      defaultValue={product.originalPrice ?? ""}
                      placeholder="e.g. 300"
                      className="
                        w-full
                        px-4
                        py-3
                        border
                        border-yellow-300
                        rounded-md
                        bg-white
                        focus:outline-yellow-500
                      "
                    />
                  </div>

                  <div className="space-y-1 text-sm">
                    <label htmlFor="price" className="block text-gray-600">
                      Price (Selling Price)
                    </label>

                    <input
                      type="number"
                      name="price"
                      id="price"
                      min="0"
                      step="0.01"
                      defaultValue={product.price}
                      required
                      className="
                        w-full
                        px-4
                        py-3
                        border
                        border-yellow-300
                        rounded-md
                        bg-white
                        focus:outline-yellow-500
                      "
                    />
                  </div>

                  <div className="space-y-1 text-sm">
                    <label htmlFor="quantity" className="block text-gray-600">
                      Quantity
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      min="0"
                      defaultValue={product.quantity}
                      required
                      className="
                        w-full
                        px-4
                        py-3
                        border
                        border-yellow-300
                        rounded-md
                        bg-white
                        focus:outline-yellow-500
                      "
                    />
                  </div>
                </div>
              </div>

              {/* =============== RIGHT COLUMN: IMAGE (Desktop এ sticky) =============== */}

              <aside className="lg:sticky lg:top-6 lg:self-start">
                <div className="space-y-3 bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <label className="block text-sm text-gray-600 font-medium">
                    Product Image
                  </label>

                  {/* OLD / NEW IMAGE */}

                  {imagePreview && (
                    <div className="flex justify-center">
                      <img
                        src={imagePreview}
                        alt={product.name}
                        className="
                          w-full
                          max-w-[220px]
                          aspect-square
                          object-cover
                          rounded-lg
                          border
                          bg-white
                        "
                      />
                    </div>
                  )}

                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="
                      block
                      w-full
                      text-sm
                      text-gray-600
                      border
                      border-gray-200
                      rounded-lg
                      p-2
                      bg-white
                    "
                  />

                  <p className="text-xs text-gray-400">
                    Leave image unchanged if you dont want to replace it.
                  </p>
                </div>
              </aside>
            </div>

            {/* =====================================================
                BUTTONS (Grid এর নিচে, full width)
            ===================================================== */}

            <div className="flex flex-col md:flex-row gap-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="
                  flex-1
                  p-3
                  rounded-lg
                  bg-yellow-500
                  hover:bg-yellow-600
                  text-white
                  font-semibold
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {loading ? (
                  <TbFidgetSpinner className="animate-spin m-auto text-xl" />
                ) : (
                  "Update Product"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard/update-products")}
                className="
                  flex-1
                  p-3
                  rounded-lg
                  bg-gray-200
                  hover:bg-gray-300
                  text-gray-700
                  font-semibold
                "
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProduct;
