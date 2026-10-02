import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";

import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { imageUpload } from "../../../api/utils";

const ManageBanners = () => {
  const axiosSecure = useAxiosSecure();

  const [uploading, setUploading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // ==========================================
  // GET BANNERS
  // ==========================================

  const {
    data: banners = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["banners"],

    queryFn: async () => {
      const { data } = await axiosSecure.get("/banners");
      return data;
    },
  });

  // ==========================================
  // LEFT BANNERS
  // ==========================================

  const leftBanners = banners
    .filter((banner) => banner.type === "left")
    .sort((a, b) => Number(a.position) - Number(b.position));

  // ==========================================
  // RIGHT BANNER
  // ==========================================

  const rightBanner = banners.find((banner) => banner.type === "right");

  // ==========================================
  // FORM SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;

    const title = form.title.value.trim();
    const link = form.link.value.trim();
    const type = form.type.value;

    const position = type === "left" ? Number(form.position.value) : 1;

    try {
      setUploading(true);

      // ==========================================
      // IMAGE
      // ==========================================

      let imageUrl = editingBanner?.image || "";

      if (imageFile) {
        imageUrl = await imageUpload(imageFile);
      }

      if (!imageUrl) {
        toast.error("Please select a banner image");
        return;
      }

      // ==========================================
      // RIGHT BANNER DUPLICATE CHECK
      // ==========================================

      if (type === "right" && !editingBanner && rightBanner) {
        toast.error(
          "Right banner already exists. Please edit the existing banner.",
        );
        return;
      }

      // ==========================================
      // BANNER DATA
      // ==========================================

      const bannerData = {
        image: imageUrl,
        title,
        link,
        position,
        type,
      };

      // ==========================================
      // UPDATE
      // ==========================================

      if (editingBanner) {
        const { data } = await axiosSecure.patch(
          `/banners/${editingBanner._id}`,
          bannerData,
        );

        if (data.modifiedCount > 0 || data.success || data.matchedCount > 0) {
          toast.success("Banner updated successfully");
        } else {
          toast.error("No changes were made");
        }
      }

      // ==========================================
      // CREATE
      // ==========================================
      else {
        const { data } = await axiosSecure.post("/banners", bannerData);

        if (data.success) {
          toast.success("Banner added successfully");
        } else {
          toast.error("Banner could not be added");
        }
      }

      // ==========================================
      // RESET
      // ==========================================

      form.reset();
      setImageFile(null);
      setEditingBanner(null);

      refetch();
    } catch (error) {
      console.log("Banner save error:", error);

      toast.error(error?.response?.data?.message || "Failed to save banner");
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this banner?",
    );

    if (!confirmDelete) return;

    try {
      const { data } = await axiosSecure.delete(`/banners/${id}`);

      if (data.deletedCount > 0) {
        toast.success("Banner deleted successfully");

        if (editingBanner?._id === id) {
          setEditingBanner(null);
          setImageFile(null);
        }

        refetch();
      } else {
        toast.error("Banner was not deleted");
      }
    } catch (error) {
      console.log("Delete banner error:", error);

      toast.error(error?.response?.data?.message || "Failed to delete banner");
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setImageFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditingBanner(null);
    setImageFile(null);
  };

  return (
    <div className="w-full">
      {/* ==========================================
          TITLE
      ========================================== */}

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Manage Banners
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your homepage left and right banners.
        </p>
      </div>

      {/* ==========================================
          FORM
      ========================================== */}

      <div className="bg-white rounded-lg shadow-md p-5 md:p-6 mb-8">
        <h2 className="text-lg font-semibold mb-5">
          {editingBanner ? "Update Banner" : "Add New Banner"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* ========================================
              TYPE
          ======================================== */}

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Banner Type
            </label>

            <select
              name="type"
              defaultValue={editingBanner?.type || "left"}
              disabled={!!editingBanner}
              className="
                w-full
                h-11
                border
                border-gray-300
                rounded-md
                px-4
                outline-none
                focus:border-lime-500
                disabled:bg-gray-100
              "
            >
              <option value="left">Left Banner (70%)</option>

              <option value="right">Right Banner (30%)</option>
            </select>

            {editingBanner && (
              <p className="text-xs text-gray-400 mt-1">
                Banner type cannot be changed while editing.
              </p>
            )}
          </div>

          {/* ========================================
              POSITION
          ======================================== */}

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Banner Position
            </label>

            <input
              type="number"
              name="position"
              min="1"
              defaultValue={editingBanner?.position || leftBanners.length + 1}
              disabled={editingBanner?.type === "right"}
              className="
                w-full
                h-11
                border
                border-gray-300
                rounded-md
                px-4
                outline-none
                focus:border-lime-500
                disabled:bg-gray-100
              "
            />

            <p className="text-xs text-gray-400 mt-1">
              Left banner-এর জন্য 1, 2, 3 অনুযায়ী order হবে।
            </p>
          </div>

          {/* ========================================
              TITLE
          ======================================== */}

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Banner Title
            </label>

            <input
              type="text"
              name="title"
              defaultValue={editingBanner?.title || ""}
              placeholder="Banner title"
              className="
                w-full
                h-11
                border
                border-gray-300
                rounded-md
                px-4
                outline-none
                focus:border-lime-500
              "
            />
          </div>

          {/* ========================================
              LINK
          ======================================== */}

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Click Link
            </label>

            <input
              type="text"
              name="link"
              defaultValue={editingBanner?.link || ""}
              placeholder="/products"
              className="
                w-full
                h-11
                border
                border-gray-300
                rounded-md
                px-4
                outline-none
                focus:border-lime-500
              "
            />
          </div>

          {/* ========================================
              IMAGE
          ======================================== */}

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-2">
              Banner Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setImageFile(e.target.files?.[0] || null);
              }}
              className="
                w-full
                border
                border-gray-300
                rounded-md
                p-3
                cursor-pointer
              "
            />

            {/* Existing image */}

            {editingBanner?.image && !imageFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Current Image</p>

                <img
                  src={editingBanner.image}
                  alt="Current banner"
                  className="
                      w-full
                      max-w-xl
                      h-40
                      object-cover
                      rounded-lg
                      border
                    "
                />
              </div>
            )}

            {/* New image */}

            {imageFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">New Image</p>

                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="New banner preview"
                  className="
                    w-full
                    max-w-xl
                    h-40
                    object-cover
                    rounded-lg
                    border
                  "
                />
              </div>
            )}
          </div>

          {/* ========================================
              BUTTONS
          ======================================== */}

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="
                bg-lime-500
                hover:bg-lime-600
                text-white
                px-6
                py-3
                rounded-md
                font-semibold
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {uploading
                ? "Uploading..."
                : editingBanner
                  ? "Update Banner"
                  : "Add Banner"}
            </button>

            {editingBanner && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="
                  bg-gray-200
                  hover:bg-gray-300
                  text-gray-700
                  px-6
                  py-3
                  rounded-md
                  font-semibold
                "
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ==========================================
          BANNER LIST
      ========================================== */}

      <div className="bg-white rounded-lg shadow-md p-5 md:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Homepage Banners</h2>

          <p className="text-sm text-gray-500 mt-1">
            Left: {leftBanners.length} banner
            {leftBanners.length !== 1 ? "s" : ""}
            {" | "}
            Right: {rightBanner ? "1 banner" : "0 banner"}
          </p>
        </div>

        {/* ==========================================
            LOADING
        ========================================== */}

        {isLoading ? (
          <div className="py-10 text-center text-gray-500">
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500">No banners found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ========================================
                LEFT BANNERS
            ======================================== */}

            {leftBanners.map((banner, index) => (
              <div
                key={banner._id}
                className="
                  border
                  border-gray-200
                  rounded-lg
                  p-4
                  flex
                  flex-col
                  lg:flex-row
                  gap-4
                  lg:items-center
                  lg:justify-between
                "
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="
                      flex-shrink-0
                      w-10
                      h-10
                      rounded-full
                      bg-lime-100
                      text-lime-700
                      flex
                      items-center
                      justify-center
                      font-bold
                    "
                  >
                    {index + 1}
                  </div>

                  <img
                    src={banner.image}
                    alt={banner.title || "Banner"}
                    className="
                      flex-shrink-0
                      w-32
                      h-20
                      object-cover
                      rounded-md
                      border
                    "
                  />

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {banner.title || "Untitled Banner"}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Left Banner | Position: {banner.position}
                    </p>

                    {banner.link && (
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                        Link: {banner.link}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(banner)}
                    className="
                      p-2
                      bg-blue-50
                      text-blue-600
                      hover:bg-blue-100
                      rounded-md
                    "
                    title="Edit Banner"
                  >
                    <MdEdit size={21} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(banner._id)}
                    className="
                      p-2
                      bg-red-50
                      text-red-600
                      hover:bg-red-100
                      rounded-md
                    "
                    title="Delete Banner"
                  >
                    <MdDelete size={21} />
                  </button>
                </div>
              </div>
            ))}

            {/* ========================================
                RIGHT BANNER
            ======================================== */}

            {rightBanner && (
              <div
                className="
                  border
                  border-orange-200
                  rounded-lg
                  p-4
                  flex
                  flex-col
                  lg:flex-row
                  gap-4
                  lg:items-center
                  lg:justify-between
                  bg-orange-50/30
                "
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="
                      flex-shrink-0
                      w-10
                      h-10
                      rounded-full
                      bg-orange-100
                      text-orange-600
                      flex
                      items-center
                      justify-center
                      font-bold
                    "
                  >
                    R
                  </div>

                  <img
                    src={rightBanner.image}
                    alt={rightBanner.title || "Right Banner"}
                    className="
                      flex-shrink-0
                      w-32
                      h-20
                      object-cover
                      rounded-md
                      border
                    "
                  />

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {rightBanner.title || "Untitled Right Banner"}
                    </p>

                    <p className="text-sm text-orange-600 mt-1">
                      Right Banner | 30%
                    </p>

                    {rightBanner.link && (
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                        Link: {rightBanner.link}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(rightBanner)}
                    className="
                      p-2
                      bg-blue-50
                      text-blue-600
                      hover:bg-blue-100
                      rounded-md
                    "
                    title="Edit Right Banner"
                  >
                    <MdEdit size={21} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(rightBanner._id)}
                    className="
                      p-2
                      bg-red-50
                      text-red-600
                      hover:bg-red-100
                      rounded-md
                    "
                    title="Delete Right Banner"
                  >
                    <MdDelete size={21} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBanners;
