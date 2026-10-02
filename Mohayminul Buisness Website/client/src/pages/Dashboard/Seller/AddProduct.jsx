import { Helmet } from "react-helmet-async";
import AddPlantForm from "../../../components/Form/AddPlantForm";
import { imageUpload } from "../../../api/utils";
import { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AddProduct = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [uploadImage, setUploadImage] = useState({
    image: { name: "Upload Button" },
  });

  const [specifications, setSpecifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    data: categories = [],
    isLoading: categoryLoading,
    isError: categoryError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axiosSecure.get("/categories");
      return data;
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;

    try {
      const name = form.name.value;
      const description = form.description.value;
      const mainCategory = form.mainCategory.value;
      const category = form.category.value;
      const price = parseFloat(form.price.value);
      const originalPrice = form.originalPrice.value
        ? parseFloat(form.originalPrice.value)
        : null; // NEW
      const quantity = parseInt(form.quantity.value);
      const keywords = form.keywords.value;
      const authorName = form.authorName.value;
      const authorBio = form.authorBio.value;
      const publisher = form.publisher.value; // NEW
      const previewPdfUrl = form.previewPdfUrl.value; // NEW
      const image = form.image.files[0];

      if (!image) {
        toast.error("Please select a product image");
        setLoading(false);
        return;
      }

      const imageUrl = await imageUpload(image);

      const seller = {
        name: user?.displayName,
        image: user?.photoURL,
        email: user?.email,
      };

      const cleanSpecifications = specifications.filter(
        (spec) => spec.label.trim() && spec.value.trim(),
      );

      const productData = {
        name,
        mainCategory,
        category,
        description,
        price,
        originalPrice,
        quantity,
        keywords,
        image: imageUrl,
        seller,
        specifications: cleanSpecifications,
        authorName,
        authorBio,
        publisher,
        previewPdfUrl,
        createdAt: new Date(),
      };

      await axiosSecure.post("/products", productData);

      toast.success("Product Added Successfully");
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      form.reset();
      setUploadImage({ image: { name: "Upload Button" } });
      setSpecifications([]);
    } catch (error) {
      console.log("Add Product Error:", error);
      toast.error(error?.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Add Product | Dashboard</title>
      </Helmet>

      <div className="p-6">
        {categoryError && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
            Failed to load categories.
          </div>
        )}

        <AddPlantForm
          handleSubmit={handleSubmit}
          uploadImage={uploadImage}
          setUploadImage={setUploadImage}
          loading={loading}
          categories={categories}
          categoryLoading={categoryLoading}
          specifications={specifications}
          setSpecifications={setSpecifications}
        />
      </div>
    </>
  );
};

export default AddProduct;
