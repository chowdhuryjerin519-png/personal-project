import PropTypes from "prop-types";
import { useState } from "react";
import { TbFidgetSpinner } from "react-icons/tb";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const AddPlantForm = ({
  handleSubmit,
  uploadImage,
  setUploadImage,
  loading,
  categories = [],
  categoryLoading,
  specifications,
  setSpecifications,
}) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [productName, setProductName] = useState("");

  const selectedCategory = categories.find(
    (category) => category.name === selectedMainCategory,
  );
  const subCategories = selectedCategory?.subcategories || [];

  // ================= SPECIFICATION ROW HELPERS =================
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

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* ================= NAME ================= */}
          <div className="space-y-1 text-sm">
            <label htmlFor="name" className="block text-gray-600">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Product name"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
            />
          </div>

          {/* ================= CATEGORY ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1 text-sm">
              <label htmlFor="mainCategory" className="block text-gray-600">
                Main Category
              </label>
              <select
                required
                name="mainCategory"
                id="mainCategory"
                disabled={categoryLoading}
                value={selectedMainCategory}
                onChange={(e) => setSelectedMainCategory(e.target.value)}
                className="w-full px-4 py-3 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
              >
                <option value="">
                  {categoryLoading
                    ? "Loading categories..."
                    : "Select Main Category"}
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-sm">
              <label htmlFor="category" className="block text-gray-600">
                Sub Category
              </label>
              <select
                required
                name="category"
                id="category"
                disabled={
                  categoryLoading ||
                  !selectedMainCategory ||
                  subCategories.length === 0
                }
                className="w-full px-4 py-3 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
              >
                <option value="">
                  {!selectedMainCategory
                    ? "First Select Main Category"
                    : subCategories.length === 0
                      ? "No Sub Category"
                      : "Select Sub Category"}
                </option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory._id} value={subCategory.name}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ================= SUMMARY / DESCRIPTION ================= */}
          {/* This shows under the "Summary" tab on the product details page */}
          <div className="space-y-1 text-sm">
            <label htmlFor="description" className="block text-gray-600">
              Summary
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Write product summary here..."
              required
              className="block rounded-md w-full h-32 px-4 py-3 text-gray-800 border border-yellow-300 bg-white focus:outline-yellow-500"
            />
          </div>

          {/* ================= SPECIFICATION (dynamic rows) ================= */}
          {/* Shows under the "Specification" tab as a label : value table */}
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
                No specification added yet. Click &quot;Add Row&quot; (e.g.
                Publisher, Edition, Language, Weight).
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
          {/* Shows under the "Author" tab */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1 text-sm">
              <label htmlFor="authorName" className="block text-gray-600">
                Author Name
              </label>
              <input
                type="text"
                name="authorName"
                id="authorName"
                placeholder="e.g. তামিম শাহরিয়ার সুবিন"
                className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
              />
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <label htmlFor="authorBio" className="block text-gray-600">
              About the Author
            </label>
            <textarea
              id="authorBio"
              name="authorBio"
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
              placeholder="যেমন: ovijatri, obhijatri, adventure book"
              className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
            />
            <p className="text-xs text-gray-400">
              বাংলা প্রোডাক্টের নাম ইংরেজি বানানে (Banglish) সার্চ করতে চাইলে
              এখানে কমা (,) দিয়ে আলাদা করে কয়েকটা spelling লিখে দাও
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
              placeholder="e.g. BookMarket Publishers"
              className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
            />
          </div>

          {/* ================= PREVIEW PDF LINK ================= */}
          <div className="space-y-1 text-sm">
            <label htmlFor="previewPdfUrl" className="block text-gray-600">
              Preview PDF Link — optional
            </label>
            <input
              type="url"
              name="previewPdfUrl"
              id="previewPdfUrl"
              placeholder="https://... (a few pages preview link)"
              className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
            />
            <p className="text-xs text-gray-400">
              এই লিংক দিলে কার্ড এবং ডিটেইলস পেজে &quot;একটু পড়ে দেখুন&quot;
              বাটন দেখাবে
            </p>
          </div>

          {/* ================= PRICE & QUANTITY ================= */}
          {/* ================= ORIGINAL PRICE, PRICE & QUANTITY ================= */}
          <div className="flex flex-col md:flex-row justify-between gap-5">
            <div className="space-y-1 text-sm w-full">
              <label htmlFor="originalPrice" className="block text-gray-600">
                Original Price — optional (discount থাকলে দাও)
              </label>
              <input
                className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
                name="originalPrice"
                id="originalPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 300"
              />
            </div>

            <div className="space-y-1 text-sm w-full">
              <label htmlFor="price" className="block text-gray-600">
                Price (Selling Price)
              </label>
              <input
                className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
                name="price"
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Price per unit"
                required
              />
            </div>

            <div className="space-y-1 text-sm w-full">
              <label htmlFor="quantity" className="block text-gray-600">
                Quantity
              </label>
              <input
                className="w-full px-4 py-3 text-gray-800 border border-yellow-300 focus:outline-yellow-500 rounded-md bg-white"
                name="quantity"
                id="quantity"
                type="number"
                min="1"
                placeholder="Available quantity"
                required
              />
            </div>
          </div>

          {/* ================= IMAGE ================= */}
          <div className="p-4 w-full m-auto rounded-lg">
            <div className="file_upload px-5 py-6 relative border-4 border-dotted border-gray-300 rounded-lg">
              <div className="flex flex-col w-max mx-auto text-center">
                <label>
                  <input
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadImage({
                        image: file,
                        url: URL.createObjectURL(file),
                      });
                    }}
                    className="text-sm cursor-pointer w-36 hidden"
                    type="file"
                    name="image"
                    id="image"
                    accept="image/*"
                    hidden
                  />
                  <div className="bg-yellow-500 text-white border border-gray-300 rounded font-semibold cursor-pointer p-2 px-4 hover:bg-yellow-600">
                    {uploadImage?.image?.name || "Upload Image"}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {uploadImage?.image?.size && (
            <div className="flex gap-5 items-center">
              <img
                className="w-20 h-20 object-cover rounded-md"
                src={uploadImage?.url}
                alt={productName || "Product preview"}
              />
              <p className="text-sm text-gray-600">
                Image Size: {uploadImage?.image?.size} Bytes
              </p>
            </div>
          )}

          {/* ================= SUBMIT ================= */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 mt-5 text-center font-medium text-white transition duration-200 rounded shadow-md bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <TbFidgetSpinner className="animate-spin m-auto text-xl" />
            ) : (
              "Save & Continue"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

AddPlantForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  setUploadImage: PropTypes.func.isRequired,
  uploadImage: PropTypes.object,
  loading: PropTypes.bool,
  categories: PropTypes.array,
  categoryLoading: PropTypes.bool,
  specifications: PropTypes.array.isRequired,
  setSpecifications: PropTypes.func.isRequired,
};

export default AddPlantForm;
