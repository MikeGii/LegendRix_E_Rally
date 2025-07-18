"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface Product {
  product_id: string;
  product_name: string;
  product_price: number;
  product_description: string;
  category_name?: string;
  main_image_url?: string | null;
}

export function ProductList() {
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["fan-merch-products"],
    queryFn: async (): Promise<Product[]> => {
      console.log("🔄 Fetching fan merch products...");

      const { data, error } = await supabase
        .from("products")
        .select(
          `
        *,
        product_categories(category_name),
        product_images!left(image_url, image_type, display_order)
      `
        )
        // Remove this line: .eq('is_top_product', true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching products:", error);
        throw error;
      }

      // Transform data to get main image and flatten category info
      const transformedData =
        data?.map((product) => ({
          ...product,
          category_name: product.product_categories?.category_name || "Üldine",
          main_image_url:
            product.product_images?.find(
              (img: any) => img.image_type === "main"
            )?.image_url || null,
        })) || [];

      console.log("✅ Fan merch products fetched:", transformedData.length);
      return transformedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="tech-border rounded-2xl bg-black/80 backdrop-blur-xl p-6 animate-pulse"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 bg-slate-700/50 rounded-xl"></div>
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-slate-700/50 rounded-lg w-3/4"></div>
                <div className="h-4 bg-slate-700/50 rounded-lg w-1/4"></div>
                <div className="h-4 bg-slate-700/50 rounded-lg w-full"></div>
                <div className="h-4 bg-slate-700/50 rounded-lg w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="tech-border rounded-2xl bg-black/80 backdrop-blur-xl p-8 text-center">
        <div className="text-red-400 space-y-4">
          <span className="text-4xl">❌</span>
          <h3 className="text-xl font-bold">Toodete laadimine ebaõnnestus</h3>
          <p className="text-gray-400">Palun proovi hiljem uuesti</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="tech-border rounded-2xl bg-black/80 backdrop-blur-xl p-8 text-center">
        <div className="text-gray-400 space-y-4">
          <span className="text-6xl">🛍️</span>
          <h3 className="text-2xl font-bold text-white">
            Tooteid pole veel lisatud
          </h3>
          <p>Varsti lisame siia põnevaid LegendRix tooteid!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {products.map((product) => (
        <div
          key={product.product_id}
          className="tech-border rounded-2xl bg-black/80 backdrop-blur-xl p-6 hover:bg-black/90 
                   transition-all duration-300 group hover:shadow-[0_0_30px_rgba(255,0,64,0.1)]"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Image */}
            <div
              className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-transparent 
              flex items-center justify-center border border-slate-600/50 flex-shrink-0"
            >
              {product.main_image_url ? (
                <Image
                  src={product.main_image_url}
                  alt={`${product.product_name} pilt`}
                  width={192}
                  height={192}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-slate-400 text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-sm">Pilt puudub</div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-4">
              {/* Product Name and Category */}
              <div>
                <h3
                  className="text-2xl font-bold text-white font-['Orbitron'] 
                             group-hover:text-red-400 transition-colors duration-300"
                >
                  {product.product_name}
                </h3>
                <span
                  className="inline-block mt-2 px-3 py-1 bg-red-600/20 text-red-400 
                               rounded-lg text-sm border border-red-500/30"
                >
                  {product.category_name}
                </span>
              </div>

              {/* Product Description */}
              {product.product_description && (
                <p className="text-gray-300 leading-relaxed">
                  {product.product_description}
                </p>
              )}

              {/* Product Price */}
              <div className="pt-4 border-t border-slate-700/50">
                <span className="text-2xl font-bold text-white font-['Orbitron']">
                  €{product.product_price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
