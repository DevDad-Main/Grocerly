import React, { useEffect, useState } from "react";
import { assets, categories } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UpdateProduct = () => {
  const { id } = useParams(); // product ID from route
  const navigate = useNavigate();
  const { axios } = useAppContext();

  const [isSending, setIsSending] = useState(false);
  const [files, setFiles] = useState([]); // can hold both File objects & URLs
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [points, setProductPoints] = useState("");

  // Load product data on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/v1/admin/product/${id}`);
        if (data.success) {
          const product = data.product;
          setName(product.name);
          setDescription(product.description.join("\n"));
          setCategory(product.category);
          setPrice(product.price);
          setOfferPrice(product.offerPrice);
          setProductPoints(product.points);

          // Preload existing images
          setFiles(product.image); // array of URLs initially
        } else {
          toast.error(data.message);
          navigate("/admin/product-list");
        }
      } catch (error) {
        toast.error(error.message);
        navigate("/admin/product-list");
      }
    };
    fetchProduct();
  }, [id]);

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const updatedFiles = [...files];
    updatedFiles[index] = file; // overwrite at index
    setFiles(updatedFiles);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isSending) return;

    try {
      setIsSending(true);

      // Prepare updated product data
      const productData = {
        name,
        description: description.split("\n"),
        category,
        price,
        offerPrice,
        points,
      };

      const formData = new FormData();

      formData.append("productData", JSON.stringify(productData));
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      // formData.append("productData", JSON.stringify(productData));
      //
      // // Only append new files, keep existing URLs separately
      // files.forEach((file) => {
      //   if (file instanceof File) {
      //     formData.append("images", file);
      //   }
      // });

      // Append existing image URLs (unchanged)
      const existingImages = files.filter((f) => typeof f === "string");
      formData.append("existingImages", JSON.stringify(existingImages));

      const { data } = await axios.put(
        `/api/v1/admin/product-update/${id}`,
        formData,
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/admin/product-list"); // redirect back to products
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col">
      <form
        onSubmit={(e) =>
          toast.promise(onSubmitHandler(e), { loading: "Updating Product..." })
        }
        className="md:p-10 p-4 space-y-5 max-w-lg"
      >
        {/* Images */}
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    onChange={(e) => handleImageChange(e, index)}
                    accept="image/*"
                    type="file"
                    id={`image${index}`}
                    hidden
                  />
                  <img
                    className="max-w-24 cursor-pointer"
                    src={
                      files[index]
                        ? files[index] instanceof File
                          ? URL.createObjectURL(files[index])
                          : files[index]
                        : assets.upload_area
                    }
                    alt="uploadArea"
                    width={100}
                    height={100}
                  />
                </label>
              ))}
          </div>
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Product Description
          </label>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
          />
        </div>

        {/* Category */}
        <div className="w-full flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="category">
            Category
          </label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            id="category"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
          >
            <option value="">Select Category</option>
            {categories.map((item, index) => (
              <option key={index} value={item.path}>
                {item.path}
              </option>
            ))}
          </select>
        </div>

        {/* Prices */}
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price
            </label>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              id="product-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price
            </label>
            <input
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              id="offer-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-points">
              Product Points
            </label>
            <input
              onChange={(e) => setProductPoints(e.target.value)}
              value={points}
              id="product-points"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
        </div>

        <button
          disabled={isSending}
          className={`px-8 py-2.5 bg-primary text-white font-medium rounded-lg hover:-translate-y-0.5 transition duration-200 ${isSending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default UpdateProduct;
