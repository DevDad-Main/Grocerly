import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { ArrowLeft } from "lucide-react";

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setFilteredProducts(
        products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchQuery]);

  return (
    <div className="mt-32 flex flex-col">
      {/* Title */}
      <div className="flex flex-col items-end w-max">
        <p className="text-2xl font-medium uppercase">All Products</p>
        <div className="w-31 h-0.5 bg-primary rounded-full"></div>
      </div>

      {/* Map All Products to display to user */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 lg:grid-cols-5 mt-6">
        {filteredProducts
          .filter((product) => product.inStock)
          .map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center mt-20">
        <div className="flex items-center gap-2 text-gray-500">
          <button
            type="button"
            aria-label="previous"
            class="mr-4 flex items-center gap-1 cursor-pointer hover:-translate-x-0.5"
          >
            <svg
              class="mt-px"
              width="23"
              height="23"
              viewBox="0 0 23 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.75 12.5h11.5m-11.5 0 4.792-4.791M5.75 12.5l4.792 4.792"
                stroke="#6B7280"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            <span>previous</span>
          </button>

          <div class="flex gap-2 text-sm md:text-base">
            <button
              type="button"
              class="flex items-center justify-center w-9 md:w-12 h-9 md:h-12 aspect-square rounded-md hover:bg-gray-300/10 transition-all"
            >
              1
            </button>

            <button
              type="button"
              class="flex items-center justify-center w-9 md:w-12 h-9 md:h-12 aspect-square bg-primary text-white rounded-md transition-all"
            >
              2
            </button>
          </div>

          <button
            type="button"
            aria-label="next"
            class="ml-4 flex items-center gap-1 cursor-pointer hover:translate-x-0.5"
          >
            <span>next</span>

            <svg
              class="mt-px"
              width="23"
              height="23"
              viewBox="0 0 23 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.25 11.5H5.75m11.5 0-4.792-4.79m4.792 4.79-4.792 4.792"
                stroke="#6B7280"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
