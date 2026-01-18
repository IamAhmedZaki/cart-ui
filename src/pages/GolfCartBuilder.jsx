import { useParams } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import { Bookmark, Plus, Minus, ArrowRight, ChevronLeft, ChevronRight, BookmarkPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import cardImg from "/assets/cpm_club_car.webp";
import { api } from "../utils/api";

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-xl overflow-hidden border border-gray-300 bg-white shadow-md"
      >
        <div className="w-full flex justify-between items-center px-6 py-5 bg-gray-100">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
          <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

// Full Page Loader for initial brand load
const PageLoader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="relative inline-block">
        <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#f9c821] rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-6 text-lg text-gray-600 font-medium">
        Loading your golf cart builder...
      </p>
    </div>
  </div>
);

export default function GolfCartBuilder() {
  const { brandSlug } = useParams();
  const [brand, setBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loading, setLoading] = useState(true); // Start as true for initial load
  const [brandLogo, setBrandLogo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { addItem } = useCart();
  const navigate = useNavigate();

  const [openSection, setOpenSection] = useState(null);
  const [selections, setSelections] = useState({ items: {} });

  // Fetch brand and default model
  useEffect(() => {
    const fetchBrand = async () => {
      setGroupedProducts({});
      setLoading(true); // Ensure loading state is active
      try {
        const data = await api.get(`/brands/slug/${brandSlug}`);

        setBrand(data);

        if (data.logo) {
          setBrandLogo(`${data.logo}`);
        } else {
          setBrandLogo(null);
        }

        if (data.models?.length > 0) {
          setSelectedModel(data.models[0]);
        }
      } catch (error) {
        console.error("Error fetching brand:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [brandSlug]);

  // Fetch model products
  useEffect(() => {
    if (!selectedModel?.id) {
      setGroupedProducts({});
      setOpenSection(null);
      return;
    }

    setLoading(true); // Show loader when switching models

    api
      .get(`/models/${selectedModel.id}`)
      .then((modelData) => {
        const grouped = modelData.products.reduce((acc, product) => {
          const typeName = product.productType.name;
          if (!acc[typeName]) acc[typeName] = [];
          acc[typeName].push({
            ...product,
            price: parseFloat(product.salePrice || product.regularPrice),
          });
          return acc;
        }, {});

        setGroupedProducts(grouped);
        setSelections({
          model: { name: selectedModel.name, price: selectedModel.price || 0 },
          items: {},
        });

        const firstCategory = Object.keys(grouped)[0];
        if (firstCategory) setOpenSection(firstCategory);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedModel]);

  const allImages = useMemo(() => {
  const images = [];

  // Go through all selected items
  Object.values(selections.items).forEach(item => {
    if (!item) return;

    // Handle both single select and multi-select (array)
    const products = Array.isArray(item) ? item : [item];

    products.forEach(product => {
      if (product.imageOne) images.push(product.imageOne);
      if (product.imageTwo) images.push(product.imageTwo);
      if (product.imageThree) images.push(product.imageThree);
      if (product.imageFour) images.push(product.imageFour);
    });
  });

  // Remove nulls and duplicates
  return images.filter(Boolean).toReversed();;

}, [selections.items]);

const currentImage = allImages[currentIndex];

// Navigation functions
const goToPrev = () => {
  setCurrentIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  console.log(currentImage);
  
};

const goToNext = () => {
  setCurrentIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  console.log(currentImage);
};

// Reset carousel when selections change significantly
useEffect(() => {
  setCurrentIndex(0);
}, [allImages.length]);
  // ... rest of your helpers remain unchanged
  const isMultiSelectCategory = (category) =>
    !["Enclosure", "Color"].includes(category);
  const getSelectedForCategory = (category) =>
    selections.items[category] || (isMultiSelectCategory(category) ? [] : null);
  const isSelected = (category, product) =>
    isMultiSelectCategory(category)
      ? (selections.items[category] || []).some((p) => p.id === product.id)
      : selections.items[category]?.id === product.id;

  const handleSelect = (category, product) => {
    // if (product.stock === 0) return;

    if (isMultiSelectCategory(category)) {
      setSelections((prev) => {
        const current = prev.items[category] || [];
        const exists = current.find((p) => p.id === product.id);
        return {
          ...prev,
          items: {
            ...prev.items,
            [category]: exists
              ? current.filter((p) => p.id !== product.id)
              : [...current, product],
          },
        };
      });
    } else {
      setSelections((prev) => ({
        ...prev,
        items: {
          ...prev.items,
          [category]: prev.items[category]?.id === product.id ? null : product,
        },
      }));
    }

    console.log(currentImage);
    
  };

  const handleSaveBuild = () => {
  const selectedProducts = [];

  // Add the base model (important – most carts expect this)
  if (selections.model) {
    selectedProducts.push({
      ...selections.model,
      qty: 1,
      // Optional: you can add type: 'model' if your cart logic needs it
    });
  }

  // Add all selected options / add-ons
  Object.values(selections.items).forEach((selected) => {
    if (!selected) return;

    if (Array.isArray(selected)) {
      // multi-select categories (accessories, lights, etc.)
      selected.forEach((item) => {
        selectedProducts.push({ ...item, qty: 1 });
      });
    } else {
      // single-select categories (enclosure, color, etc.)
      selectedProducts.push({ ...selected, qty: 1 });
    }
  });

  // Optional safety check
  if (selectedProducts.length === 0) {
    alert("Please select at least a model before proceeding to checkout.");
    return;
  }

  addItem(selectedProducts);
  navigate("/checkout");
};
  
  
  const handleSaveBuildLater = () => {
     const selectedProducts = [];
    Object.values(selections.items).forEach((selected) => {
      if (!selected) return;
      if (Array.isArray(selected)) {
        selected.forEach((item) => selectedProducts.push({ ...item, qty: 1 }));
      } else {
        selectedProducts.push({ ...selected, qty: 1 });
      }
    });

    console.log(selectedProducts);
  };

  const totalPrice = (
    (selections.model?.price || 0) +
    Object.values(selections.items)
      .flat()
      .reduce((sum, item) => sum + (item?.price || 0), 0)
  ).toFixed(2);

  // Show full page loader until brand is loaded
  if (loading && !brand) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans pt-8 pb-20">
      {/* Header */}
      <div className="container mx-auto px-6 mb-8">
        <div className="flex items-center gap-4 text-xs md:text-sm tracking-widest text-gray-500 mb-2">
          <span className="text-[#f9c821]">HOME</span> /{" "}
          {brand?.name?.toUpperCase() || "LOADING..."}
        </div>
        <h1 className="flex items-center justify-between text-3xl md:text-5xl font-serif font-bold">
          <div className="flex items-center gap-2">
            <span className="text-gray-900">Build Your</span>
            <span className="text-[#f9c821]">{brand?.name || "..."}</span>
          </div>
            
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={`${brand?.name} Logo`}
              className="h-6 md:h-10 object-contain"
            />
          ) : (
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          )}
        </h1>
        <span className="text-gray-900 text-md mt-5">Note: Click the arrows to navigate through the images.</span>
      </div>

      <div className="container mx-auto px-6 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left - Image */}
        <div className="lg:w-[65%]">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 h-[400px] lg:h-[700px] group">
            {/* Dynamic Background Image */}
           <div
  className="absolute inset-0 bg-center bg-no-repeat"
  style={{
    backgroundImage:  `url(https://ecou1bc3kziqxgke.public.blob.vercel-storage.com/products/${
      currentImage || "placeholder.jpg"
    })`,
    backgroundSize: "80%", // Zoomed out slightly
    backgroundPosition: "center",
  }}
  role="img"
  aria-label="Selected golf cart configuration preview"
>
  {/* <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" /> */}
</div>


            {/* Navigation Buttons - Only show if multiple images */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg 
                     hover:bg-white hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={goToNext}
                  disabled={currentIndex === allImages.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg 
                     hover:bg-white hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Indicators (Dots) */}
            {allImages.length > 1 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? "bg-black w-8"
                        : "bg-black/50 hover:bg-black/80"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
              <span className="bg-[#f9c821] text-black px-5 py-3 rounded-full text-xs font-extrabold tracking-wider shadow-md uppercase">
                Premium Series
              </span>


              <div className="flex gap-2">

              <button
                onClick={handleSaveBuild}
                className="bg-white/95 backdrop-blur-sm border border-gray-200 px-6 py-3 rounded-full shadow-xl text-xs font-bold tracking-wider flex items-center gap-2 
                   hover:bg-[#f9c821] hover:text-black hover:border-[#f9c821] 
                   transition-all duration-300 transform hover:-translate-y-0.5"
                aria-label="Save this build"
              >
                
                <Bookmark className="w-4 h-4" />
                
                Save Build
              </button>
              {/* <button
                onClick={handleSaveBuildLater}
                className="bg-white/95 backdrop-blur-sm border border-gray-200 px-6 py-3 rounded-full shadow-xl text-xs font-bold tracking-wider flex items-center gap-2 
                   hover:bg-[#f9c821] hover:text-black hover:border-[#f9c821] 
                   transition-all duration-300 transform hover:-translate-y-0.5"
                aria-label="Save this build"
              >
                
                <BookmarkPlus className="w-4 h-4" />
                Save Build For Later
              </button> */}

                  
              </div>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-8 left-8 text-black z-10">
              <p className="text-2xl lg:text-4xl font-bold tracking-tight mb-2">
                {selectedModel?.name || "Select a Model"}
              </p>
              <p className="text-4xl lg:text-6xl font-serif tracking-tight">
                ${totalPrice?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>

        {/* Right - Options */}
        <div className="lg:w-[35%]">
          <div className="sticky top-24">
            {/* Model Selection */}
            <h2 className="text-xs font-bold text-[#f9c821] mb-6 tracking-[0.2em] uppercase border-b border-gray-300 pb-4">
              Select Your Model
            </h2>
            <div className="flex flex-wrap gap-3 mb-12">
              {brand?.models?.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m)}
                  disabled={loading}
                  className={`
                    text-xs font-bold px-4 py-2 rounded-lg transition-all border
                    ${
                      selectedModel?.id === m.id
                        ? "bg-[#f9c821] text-white border-[#f9c821] shadow-lg shadow-[#f9c821]/20"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }
                    ${loading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {m.name}
                </button>
              )) || (
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories */}
            {loading ? (
              <SkeletonLoader />
            ) : Object.keys(groupedProducts).length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                Select a model to see customization options
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedProducts).map(
                  ([categoryName, products], index) => (
                    <motion.div
                      key={categoryName}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="rounded-xl overflow-hidden border border-gray-300 bg-white shadow-md"
                    >
                      <button
                        onClick={() =>
                          setOpenSection(
                            openSection === categoryName ? null : categoryName
                          )
                        }
                        className={`w-full flex justify-between items-center px-6 py-5 transition-all hover:bg-gray-50 ${
                          openSection === categoryName ? "bg-gray-50" : ""
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
                          {categoryName}
                        </span>
                        {openSection === categoryName ? (
                          <Minus className="w-4 h-4 text-[#f9c821]" />
                        ) : (
                          <Plus className="w-4 h-4 text-gray-500" />
                        )}
                      </button>

                      <AnimatePresence>
                        {openSection === categoryName && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-gray-50"
                          >
                            <div className="p-6 space-y-3">
                              {products.map((product) => {
                                const active = isSelected(
                                  categoryName,
                                  product
                                );
                                const isOutOfStock = product.stock === 0;

                                return (
                                  <div
                                    key={product.id}
                                    onClick={() =>
                                     
                                      handleSelect(categoryName, product)
                                    }
                                    className={`
                                    flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border
                                    ${
                                      active
                                        ? "bg-[#f9c821]/10 border-[#f9c821] text-[#f9c821]"
                                        : "bg-white border-gray-200 hover:bg-gray-100"
                                    }
                                   
                                  `}
                                  >
                                    <div>
                                      <span className="text-sm font-medium">
                                        {product.name}
                                      </span>
                                      {product.color && (
                                        <span className="block text-xs text-gray-500">
                                          {product.color}
                                        </span>
                                      )}
                                      {isOutOfStock && (
                                        <span className="block text-xs text-red-600">
                                          Out of stock
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-bold">
                                        ${product.price.toFixed(2)}
                                      </span>
                                      {active && (
                                        <ArrowRight className="w-5 h-5 text-[#f9c821]" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
