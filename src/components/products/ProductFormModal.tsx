"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";
import { CategoryCreateModal } from "./CategoryCreateModal";
import { useProductCategories } from "@/hooks/useProductCategories";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { Product } from "./ProductsTable";

interface ProductFormData {
  product_name: string;
  product_price: number;
  category_id: string;
  product_description: string;
  is_top_product: boolean;
  display_order: number;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: Product | null;
}

export function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
}: ProductFormModalProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const { data: categories = [] } = useProductCategories();
  const queryClient = useQueryClient();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      product_name: "",
      product_price: 0,
      category_id: "",
      product_description: "",
      is_top_product: false,
      display_order: 0,
    },
  });

  useEffect(() => {
    const loadProductData = async () => {
      if (editingProduct) {
        // Load basic product data
        setValue("product_name", editingProduct.product_name);
        setValue("product_price", editingProduct.product_price);
        setValue("category_id", editingProduct.category_id);
        setValue(
          "product_description",
          editingProduct.product_description || ""
        );
        setValue("is_top_product", editingProduct.is_top_product);
        setValue("display_order", editingProduct.display_order);

        // Load existing product image
        console.log("🖼️ Loading existing product image...");
        try {
          const { data: imageData, error: imageError } = await supabase
            .from("product_images")
            .select("image_url, alt_text")
            .eq("product_id", editingProduct.product_id)
            .eq("image_type", "main")
            .order("display_order", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (imageError) {
            console.error("⚠️ Error loading product image:", imageError);
          } else if (imageData) {
            console.log("✅ Existing image loaded:", imageData.image_url);
            setExistingImageUrl(imageData.image_url);
          } else {
            console.log("ℹ️ No existing image found for product");
            setExistingImageUrl(null);
          }
        } catch (error) {
          console.error("❌ Failed to load product image:", error);
          setExistingImageUrl(null);
        }
      } else {
        // Reset form for new product
        reset();
        setExistingImageUrl(null);
        setSelectedImage(null);
        setImagePreview(null);
        setImageError(null);
      }
    };

    loadProductData();
  }, [editingProduct, setValue, reset]);

  const handleClose = () => {
    reset();
    setShowSuccessMessage(false);
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    setExistingImageUrl(null);
    onClose();
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log(
        editingProduct ? "🔄 Updating product:" : "🔄 Creating product:",
        data
      );

      let imageUrl = existingImageUrl; // Keep existing image by default

      // Handle image upload if new image is selected
      if (selectedImage) {
        console.log("📤 Uploading new product image...");

        const formData = new FormData();
        formData.append("file", selectedImage);

        const uploadResponse = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResponse.ok) {
          imageUrl = uploadResult.url;
          console.log("✅ Image uploaded successfully:", imageUrl);
        } else {
          console.error("❌ Image upload failed:", uploadResult.error);
          setImageError(
            `Pildi üleslaadimine ebaõnnestus: ${uploadResult.error}`
          );
          return; // Stop form submission if image upload fails
        }
      }

      let productResult;

      if (editingProduct) {
        // Update existing product
        productResult = await updateProductMutation.mutateAsync({
          product_id: editingProduct.product_id,
          ...data,
        });
      } else {
        // Create new product
        productResult = await createProductMutation.mutateAsync(data);
      }

      // Handle product image in database
      const productId = editingProduct
        ? editingProduct.product_id
        : productResult.product_id;

      // Check if we need to delete existing image (X button was clicked)
      if (editingProduct && !existingImageUrl && !selectedImage) {
        console.log("🗑️ Deleting existing image (removed by user)...");

        try {
          // First get the old image record to extract the file path for storage deletion
          const { data: oldImageData, error: fetchError } = await supabase
            .from("product_images")
            .select("image_url")
            .eq("product_id", productId)
            .eq("image_type", "main")
            .single();

          if (!fetchError && oldImageData?.image_url) {
            // Extract file path from URL for storage deletion
            const oldImageUrl = oldImageData.image_url;
            let filePath = null;

            // Handle Supabase storage URLs
            if (oldImageUrl.includes("supabase")) {
              const urlParts = oldImageUrl.split(
                "/storage/v1/object/public/images/"
              );
              if (urlParts.length === 2) {
                filePath = urlParts[1];
              }
            }

            // Delete from Supabase storage if it's a storage file
            if (filePath && oldImageUrl.includes("supabase")) {
              console.log(
                "🗑️ Deleting removed image file from storage:",
                filePath
              );
              const { error: storageError } = await supabase.storage
                .from("images")
                .remove([filePath]);

              if (storageError) {
                console.warn(
                  "⚠️ Failed to delete image file from storage:",
                  storageError
                );
              } else {
                console.log("✅ Removed image file deleted from storage");
              }
            }
          }

          // Delete image record from database
          const { error: deleteError } = await supabase
            .from("product_images")
            .delete()
            .eq("product_id", productId)
            .eq("image_type", "main");

          if (deleteError) {
            console.error("⚠️ Failed to delete image record:", deleteError);
          } else {
            console.log("✅ Image record deleted from database");
          }
        } catch (cleanupError) {
          console.error("⚠️ Error during image deletion:", cleanupError);
        }
      }
      // Handle image replacement (new image selected)
      else if (editingProduct && existingImageUrl && selectedImage) {
        // Delete old image record and file from storage
        console.log("🗑️ Cleaning up old image...");

        try {
          // ... keep your existing cleanup code here ...
        } catch (cleanupError) {
          console.error("⚠️ Error during image cleanup:", cleanupError);
        }
      }

      // Insert new image record (only if we have a new image)
      if (imageUrl) {
        console.log("📝 Inserting new image record...");
        const { error: imageError } = await supabase
          .from("product_images")
          .insert({
            product_id: productId,
            image_url: imageUrl,
            image_type: "main",
            display_order: 0,
            alt_text: `${data.product_name} pilt`,
          });

        if (imageError) {
          console.error("⚠️ Failed to save image record:", imageError);
        } else {
          console.log("✅ Image record saved successfully");
        }
      }

      console.log(
        editingProduct
          ? "✅ Product updated successfully"
          : "✅ Product created successfully"
      );

      // Show success message
      setShowSuccessMessage(true);

      // Close modal after a short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error(
        editingProduct
          ? "❌ Product update error:"
          : "❌ Product creation error:",
        error
      );
      setImageError("Toote salvestamine ebaõnnestus. Palun proovi uuesti.");
    }
  };

  const handleCategoryCreated = () => {
    // Refresh categories list
    queryClient.invalidateQueries({ queryKey: ["product_categories"] });
    setIsCategoryModalOpen(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (!file) {
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    // Validate file type
    if (!file.type.match(/^image\/(png|jpg|jpeg|webp)$/)) {
      setImageError("Palun vali PNG, JPG, JPEG või WebP faili");
      return;
    }

    // Validate file size (max 150KB)
    if (file.size > 150 * 1024) {
      setImageError("Pildi suurus ei tohi olla suurem kui 150KB");
      return;
    }

    // Create image to check dimensions
    const img = new Image();
    img.onload = () => {
      if (img.width > 401 || img.height > 401) {
        setImageError(
          "Pildi mõõtmed ei tohi olla suuremad kui 300x300 pikslit"
        );
        return;
      }

      // All validations passed
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    };
    img.src = URL.createObjectURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingProduct ? "Muuda Toodet" : "Lisa Uus Toode"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {showSuccessMessage && (
            <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center space-x-2">
              <span className="text-lg">✅</span>
              <span>Toode edukalt lisatud!</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Toote nimi <span className="text-red-400">*</span>
            </label>
            <input
              {...register("product_name", {
                required: "Toote nimi on kohustuslik",
                minLength: {
                  value: 2,
                  message: "Toote nimi peab olema vähemalt 2 tähemärki",
                },
              })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
                     text-white placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                     transition-all duration-200"
              placeholder="Sisesta toote nimi..."
            />
            {errors.product_name && (
              <p className="text-red-400 text-sm mt-1">
                {errors.product_name.message}
              </p>
            )}
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Price */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hind (€) <span className="text-red-400">*</span>
              </label>
              <input
                {...register("product_price", {
                  required: "Hind on kohustuslik",
                  min: { value: 0.01, message: "Hind peab olema positiivne" },
                  valueAsNumber: true,
                })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
                       text-white placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       transition-all duration-200"
                placeholder="0.00"
              />
              {errors.product_price && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.product_price.message}
                </p>
              )}
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Toote pilt
              </label>
              <div className="text-xs text-slate-400 mb-3">
                Maksimaalne failisuurus: 150KB | Maksimaalne pildi suurus:
                300x300 pikslit | Soovitatud: ruudukujuline pilt
              </div>

              <div className="flex flex-col items-center space-y-4">
                {/* Image Preview */}
                {(imagePreview || existingImageUrl) && (
                  <div className="relative">
                    <img
                      src={imagePreview || existingImageUrl}
                      alt="Toote pilt"
                      className="w-32 h-32 object-cover rounded-xl border-2 border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 
                            text-white rounded-full text-xs flex items-center justify-center
                            transition-colors duration-200"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                {!imagePreview && !existingImageUrl && (
                  <div
                    className="w-32 h-32 border-2 border-dashed border-slate-600 rounded-xl 
                                flex flex-col items-center justify-center cursor-pointer
                                hover:border-slate-500 transition-colors duration-200"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-slate-400 text-center">
                      <div className="text-2xl mb-1">📷</div>
                      <div className="text-xs">Lisa pilt</div>
                    </div>
                  </div>
                )}

                {/* Replace Button */}
                {(imagePreview || existingImageUrl) && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 
                            rounded-lg text-sm transition-colors duration-200"
                  >
                    Vaheta pilt
                  </button>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Error Message */}
                {imageError && (
                  <p className="text-red-400 text-sm text-center">
                    {imageError}
                  </p>
                )}
              </div>
            </div>

            {/* Category with Add New Button */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Kategooria <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                <select
                  {...register("category_id", {
                    required: "Kategooria on kohustuslik",
                  })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
                         text-white
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                         transition-all duration-200"
                >
                  <option value="">Vali kategooria</option>
                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300
                         rounded-xl transition-all duration-200 backdrop-blur-sm border border-red-500/30 
                         hover:border-red-400/50 text-sm font-medium"
                >
                  ➕ Lisa uus kategooria
                </button>
              </div>
              {errors.category_id && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.category_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Kirjeldus
            </label>
            <textarea
              {...register("product_description")}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
                     text-white placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                     transition-all duration-200 resize-vertical"
              placeholder="Sisesta toote kirjeldus..."
            />
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display Order */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Järjekord
              </label>
              <input
                {...register("display_order", { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl
                       text-white placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       transition-all duration-200"
                placeholder="0"
              />
            </div>

            {/* Top Product */}
            <div className="flex items-center justify-center">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  {...register("is_top_product")}
                  type="checkbox"
                  className="w-5 h-5 text-red-600 bg-slate-700 border-slate-600 rounded
                         focus:ring-red-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-slate-300">
                  Esiletõstetud toode
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700/50">
            <button
              type="button"
              onClick={handleClose}
              disabled={
                createProductMutation.isPending ||
                updateProductMutation.isPending
              }
              className="px-6 py-3 text-slate-400 hover:text-white transition-colors duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tühista
            </button>
            <button
              type="submit"
              disabled={
                createProductMutation.isPending ||
                updateProductMutation.isPending
              }
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl
                        transition-all duration-200 transform hover:scale-105
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            >
              {createProductMutation.isPending ||
              updateProductMutation.isPending ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Salvestamine...</span>
                </span>
              ) : editingProduct ? (
                "Salvesta Muudatused"
              ) : (
                "Lisa Toode"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Creation Modal */}
      <CategoryCreateModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </>
  );
}
