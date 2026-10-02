import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  MdDelete,
  MdEdit,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdClose,
  MdCheck,
} from "react-icons/md";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ManageCategories = () => {
  const axiosSecure = useAxiosSecure();

  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [loading, setLoading] = useState(false);

  // Rename states
  const [editingMainId, setEditingMainId] = useState(null);
  const [editingSubId, setEditingSubId] = useState(null);
  const [editingParentId, setEditingParentId] = useState(null);
  const [editName, setEditName] = useState("");

  // =========================
  // GET ALL CATEGORIES
  // =========================

  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["categories"],

    queryFn: async () => {
      const { data } = await axiosSecure.get("/categories");

      return data;
    },
  });

  // =========================
  // CREATE CATEGORY
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Category name is required");
    }

    setLoading(true);

    try {
      const categoryData = {
        name: name.trim(),
        parent: parent || null,
      };

      const { data } = await axiosSecure.post("/categories", categoryData);

      if (data.success) {
        toast.success(
          parent
            ? "Subcategory created successfully"
            : "Main category created successfully",
        );

        setName("");
        setParent("");

        refetch();
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to create category",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE MAIN CATEGORY
  // =========================

  const handleDeleteMainCategory = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this main category?",
    );

    if (!confirmDelete) return;

    try {
      const { data } = await axiosSecure.delete(`/categories/${id}`);

      if (data.deletedCount > 0) {
        toast.success("Main category deleted successfully");
        refetch();
      } else {
        toast.error("Main category was not deleted");
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to delete main category",
      );
    }
  };

  // =========================
  // DELETE SUBCATEGORY
  // =========================

  const handleDeleteSubCategory = async (categoryId, subcategoryId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subcategory?",
    );

    if (!confirmDelete) return;

    try {
      const { data } = await axiosSecure.delete(
        `/categories/${categoryId}/subcategories/${subcategoryId}`,
      );

      if (data.modifiedCount > 0) {
        toast.success("Subcategory deleted successfully");
        refetch();
      } else {
        toast.error("Subcategory was not deleted");
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to delete subcategory",
      );
    }
  };

  // =========================
  // START MAIN EDIT
  // =========================

  const startMainEdit = (category) => {
    setEditingMainId(category._id);
    setEditingSubId(null);
    setEditName(category.name);
  };

  // =========================
  // START SUB EDIT
  // =========================

  const startSubEdit = (categoryId, subCategory) => {
    setEditingParentId(categoryId);
    setEditingSubId(subCategory._id);
    setEditingMainId(null);
    setEditName(subCategory.name);
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEdit = () => {
    setEditingMainId(null);
    setEditingSubId(null);
    setEditingParentId(null);
    setEditName("");
  };

  // =========================
  // SAVE MAIN CATEGORY
  // =========================

  const saveMainCategory = async (id) => {
    if (!editName.trim()) {
      return toast.error("Category name is required");
    }

    try {
      const { data } = await axiosSecure.patch(`/categories/${id}`, {
        name: editName.trim(),
      });

      if (data.success) {
        toast.success("Main category renamed successfully");

        cancelEdit();
        refetch();
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to rename category",
      );
    }
  };

  // =========================
  // SAVE SUBCATEGORY
  // =========================

  const saveSubCategory = async (categoryId, subcategoryId) => {
    if (!editName.trim()) {
      return toast.error("Subcategory name is required");
    }

    try {
      const { data } = await axiosSecure.patch(
        `/categories/${categoryId}/subcategories/${subcategoryId}`,
        {
          name: editName.trim(),
        },
      );

      if (data.success) {
        toast.success("Subcategory renamed successfully");

        cancelEdit();
        refetch();
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Failed to rename subcategory",
      );
    }
  };

  // =========================
  // MOVE CATEGORY
  // =========================

  const moveCategory = async (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= categories.length) {
      return;
    }

    const current = categories[index];
    const target = categories[newIndex];

    try {
      await Promise.all([
        axiosSecure.patch(`/categories/${current._id}/order`, {
          order: target.order || newIndex + 1,
        }),

        axiosSecure.patch(`/categories/${target._id}/order`, {
          order: current.order || index + 1,
        }),
      ]);

      toast.success("Category order updated");

      refetch();
    } catch (error) {
      console.log(error);

      toast.error("Failed to change category order");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* =========================
          TITLE
      ========================= */}

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Manage Categories
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Create, rename, delete and arrange your categories.
        </p>
      </div>

      {/* =========================
          CREATE CATEGORY
      ========================= */}

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-5">Create Category</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* NAME */}

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Category Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="w-full h-11 border border-gray-300 rounded-md px-4 outline-none focus:border-lime-500"
            />
          </div>

          {/* PARENT */}

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Parent Category
            </label>

            <select
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-md px-4 outline-none bg-white focus:border-lime-500"
            >
              <option value="">Main Category</option>

              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* BUTTON */}

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-lime-500 hover:bg-lime-600 text-white rounded-md font-semibold disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-500 mt-4">
          Parent Category ফাঁকা রাখলে Main Category হবে। Parent Category
          নির্বাচন করলে Sub Category হবে।
        </p>
      </div>

      {/* =========================
          CATEGORY LIST
      ========================= */}

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">All Categories</h2>

          <span className="text-sm text-gray-500">
            {categories.length} Main Categories
          </span>
        </div>

        {isLoading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">No categories found.</p>
        ) : (
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div
                key={category._id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* =========================
                    MAIN CATEGORY
                ========================= */}

                <div className="flex items-center justify-between gap-3 px-4 py-4 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* NUMBER */}

                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>

                    {/* NAME */}

                    {editingMainId === category._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-9 border border-lime-500 rounded-md px-3 outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => saveMainCategory(category._id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <MdCheck size={22} />
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <MdClose size={22} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-gray-800">
                          {category.name}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Main Category
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* MOVE UP */}

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveCategory(index, "up")}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30"
                      title="Move Up"
                    >
                      <MdKeyboardArrowUp size={22} />
                    </button>

                    {/* MOVE DOWN */}

                    <button
                      type="button"
                      disabled={index === categories.length - 1}
                      onClick={() => moveCategory(index, "down")}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30"
                      title="Move Down"
                    >
                      <MdKeyboardArrowDown size={22} />
                    </button>

                    {/* EDIT */}

                    <button
                      type="button"
                      onClick={() => startMainEdit(category)}
                      className="p-1.5 text-blue-500 hover:text-blue-700"
                      title="Rename"
                    >
                      <MdEdit size={20} />
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() => handleDeleteMainCategory(category._id)}
                      className="p-1.5 text-red-500 hover:text-red-700"
                      title="Delete Main Category"
                    >
                      <MdDelete size={21} />
                    </button>
                  </div>
                </div>

                {/* =========================
                    SUB CATEGORIES
                ========================= */}

                {category.subcategories?.length > 0 && (
                  <div className="bg-gray-50 border-t px-4 py-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Sub Categories
                    </p>

                    <div className="space-y-2">
                      {category.subcategories.map((subCategory) => (
                        <div
                          key={subCategory._id}
                          className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-md px-4 py-3"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 flex-shrink-0 rounded-full bg-lime-500" />

                            {editingSubId === subCategory._id &&
                            editingParentId === category._id ? (
                              <input
                                autoFocus
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-9 border border-lime-500 rounded-md px-3 outline-none"
                              />
                            ) : (
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  {subCategory.name}
                                </p>

                                <p className="text-xs text-gray-400">
                                  Sub Category
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {editingSubId === subCategory._id &&
                            editingParentId === category._id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    saveSubCategory(
                                      category._id,
                                      subCategory._id,
                                    )
                                  }
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <MdCheck size={21} />
                                </button>

                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="text-gray-500 hover:text-red-500"
                                >
                                  <MdClose size={21} />
                                </button>
                              </>
                            ) : (
                              <>
                                {/* EDIT SUB */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    startSubEdit(category._id, subCategory)
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                  title="Rename Subcategory"
                                >
                                  <MdEdit size={19} />
                                </button>

                                {/* DELETE SUB */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteSubCategory(
                                      category._id,
                                      subCategory._id,
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete Subcategory"
                                >
                                  <MdDelete size={20} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!category.subcategories?.length && (
                  <div className="bg-gray-50 border-t px-4 py-3">
                    <p className="text-sm text-gray-400">No subcategories</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;
