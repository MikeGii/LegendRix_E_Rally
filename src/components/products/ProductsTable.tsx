"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { ProductFormModal } from "./ProductFormModal";

export interface Product {
  product_id: string;
  product_name: string;
  product_price: number;
  category_id: string;
  product_description: string;
  is_top_product: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
  main_image_url?: string | null;
}

export function ProductsTable() {
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", "list"], // Changed to match productKeys pattern
    queryFn: async (): Promise<Product[]> => {
      console.log("🔄 Fetching products with images...");

      const { data, error } = await supabase
        .from("products")
        .select(
          `
      *,
      product_categories(category_name),
      product_images!left(image_url, image_type, display_order)
    `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching products:", error);
        throw error;
      }

      // Transform the data to flatten category info and get main image
      const transformedData =
        data?.map((product) => ({
          ...product,
          category_name:
            product.product_categories?.category_name || "Kategooria puudub",
          main_image_url:
            product.product_images?.find(
              (img: any) => img.image_type === "main"
            )?.image_url || null,
        })) || [];

      console.log("✅ Products with images fetched:", transformedData.length);
      return transformedData;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.1)] bg-black/80 backdrop-blur-xl p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
          <span className="text-gray-400">Laadib tooteid...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.1)] bg-black/80 backdrop-blur-xl p-8">
        <div className="text-center text-red-400">
          <span className="text-xl mb-2 block">❌</span>
          Toodete laadimine ebaõnnestus
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.1)] bg-black/80 backdrop-blur-xl p-8">
        <div className="text-center text-gray-400">
          <span className="text-4xl mb-4 block">🛍️</span>
          <h3 className="text-lg font-medium mb-2">Tooted puuduvad</h3>
          <p>Lisa esimene toode, et alustada</p>
        </div>
      </div>
    );
  }

  const handleDelete = async (productId: string, productName: string) => {
    if (
      !confirm(`Kas oled kindel, et soovid kustutada toote "${productName}"?`)
    ) {
      return;
    }

    setDeletingProductId(productId);

    try {
      console.log("🔄 Deleting product and its images:", productId);

      // First, get all images for this product to delete from storage
      const { data: productImages, error: fetchError } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", productId);

      if (fetchError) {
        console.warn("⚠️ Could not fetch product images:", fetchError);
      } else if (productImages && productImages.length > 0) {
        console.log(`🗑️ Found ${productImages.length} image(s) to delete`);

        // Delete each image file from storage
        for (const imageRecord of productImages) {
          const imageUrl = imageRecord.image_url;
          let filePath = null;

          // Extract file path from URL
          if (imageUrl.includes("supabase")) {
            const urlParts = imageUrl.split(
              "/storage/v1/object/public/images/"
            );
            if (urlParts.length === 2) {
              filePath = urlParts[1];
            }
          }

          // Delete from Supabase storage if it's a storage file
          if (filePath && imageUrl.includes("supabase")) {
            console.log("🗑️ Deleting image file from storage:", filePath);
            const { error: storageError } = await supabase.storage
              .from("images")
              .remove([filePath]);

            if (storageError) {
              console.warn("⚠️ Failed to delete image file:", storageError);
            } else {
              console.log("✅ Image file deleted from storage");
            }
          }
        }
      }

      // Delete the product (this will cascade delete product_images due to foreign key constraint)
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("product_id", productId);

      if (error) {
        console.error("❌ Error deleting product:", error);
        alert("Toote kustutamine ebaõnnestus");
        return;
      }

      console.log("✅ Product and all associated images deleted successfully");

      // Refresh the table
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      alert("Ootamatu viga toote kustutamisel");
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <>
      <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.1)] bg-black/80 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-sm font-medium text-gray-300 font-['Orbitron']">
                  PILT
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300 font-['Orbitron']">
                  TOODE
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300 font-['Orbitron']">
                  KATEGOORIA
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300 font-['Orbitron']">
                  HIND
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300 font-['Orbitron']">
                  JÄRJEKORD
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300 font-['Orbitron']">
                  LISATUD
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-300 font-['Orbitron']">
                  TEGEVUSED
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.product_id}
                  className="border-b border-gray-800/50 hover:bg-red-500/5 transition-colors duration-200"
                >
                  {/* Product Image */}
                  <td className="p-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-700/50 flex items-center justify-center">
                      {product.main_image_url ? (
                        <img
                          src={product.main_image_url}
                          alt={`${product.product_name} pilt`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">📷</span>
                      )}
                    </div>
                  </td>

                  {/* Keep all existing <td> elements exactly as they are */}
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-white">
                        {product.product_name}
                      </div>
                      {product.product_description && (
                        <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {product.product_description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-sm">
                      {product.category_name}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-white">
                      €{product.product_price.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">
                      {product.display_order}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {new Date(product.created_at).toLocaleDateString("et-EE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300
                            rounded-lg transition-all duration-200 text-sm border border-blue-500/30 
                            hover:border-blue-400/50"
                        title="Muuda toodet"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(product.product_id, product.product_name)
                        }
                        disabled={deletingProductId === product.product_id}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300
                            rounded-lg transition-all duration-200 text-sm border border-red-500/30 
                            hover:border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Kustuta toode"
                      >
                        {deletingProductId === product.product_id ? "⏳" : "🗑️"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      <ProductFormModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        editingProduct={editingProduct}
      />
    </>
  );
}
