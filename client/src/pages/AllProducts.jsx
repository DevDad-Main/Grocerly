import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { ArrowLeft } from "lucide-react";

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts
    .filter((product) => product.inStock)
    .slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(
    filteredProducts.filter((product) => product.inStock).length /
      productsPerPage,
  );

  const goToPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
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
        {currentProducts.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center mt-20">
        <div className="flex items-center gap-2 text-gray-500">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="mr-4 flex items-center gap-1 cursor-pointer hover:-translate-x-0.5 disabled:opacity-50"
          >
            <span>previous</span>
          </button>

          <div className="flex gap-2 text-sm md:text-base">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`flex items-center justify-center w-9 md:w-12 h-9 md:h-12 aspect-square rounded-md transition-all ${
                  currentPage === i + 1
                    ? "bg-primary text-white"
                    : "hover:bg-gray-300/10"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-4 flex items-center gap-1 cursor-pointer hover:translate-x-0.5 disabled:opacity-50"
          >
            <span>next</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
