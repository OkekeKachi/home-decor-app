"use client";

import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        price: number;
        category: string;
        stock: number;
        imageUrl?: string;
        description?: string;
        averageRating?: number;
    };
    onAddToCart: (productId: string) => void;
    onViewProduct?: (productId: string) => void;
}

export default function ProductCard({
    product,
    onAddToCart,
    onViewProduct,
}: ProductCardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isOutOfStock = product.stock <= 0;

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isOutOfStock) {
            onAddToCart(product._id);
        }
    };

    const handleViewProduct = () => {
        onViewProduct?.(product._id);
    };

    return (
        <div className="group flex flex-col bg-white border border-[#8B6F47]/10 hover:border-[#183C32]/30 transition-colors duration-300 rounded-sm overflow-hidden">

            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-[#F7F3ED]">

                <Link
                    href={`/products/${product._id}`}
                    onClick={handleViewProduct}
                    className="absolute inset-0"
                >
                    {product.imageUrl && !imageError ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#F7F3ED]">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8B6F47]/60">
                                Image Unavailable
                            </span>
                        </div>
                    )}
                </Link>

                {/* Wishlist */}
                <button
                    type="button"
                    aria-label={
                        isLiked
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                    }
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsLiked((prev) => !prev);
                    }}
                    className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white transition-colors duration-200 rounded-full"
                >
                    <Heart
                        className={`w-4 h-4 transition-colors ${isLiked
                                ? "fill-[#183C32] text-[#183C32]"
                                : "text-[#1C1C1C]"
                            }`}
                    />
                </button>

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-[#8B6F47]">
                            Unavailable
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-4 sm:p-5">

                {/* Category */}
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#8B6F47]/70 mb-1.5">
                    {product.category}
                </span>

                {/* Product Name */}
                <h3 className="font-serif text-base sm:text-lg text-[#1C1C1C] group-hover:text-[#183C32] transition-colors duration-300 leading-snug">
                    {product.name}
                </h3>

                {/* Description */}
                {product.description && (
                    <p className="hidden sm:block text-sm text-[#8B6F47] line-clamp-2 mt-1.5 mb-3 leading-relaxed">
                        {product.description}
                    </p>
                )}

                <div className="mt-auto pt-3 sm:pt-4 border-t border-[#8B6F47]/10">

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                        <Star
                            className="w-3.5 h-3.5 fill-[#C9A66B] text-[#C9A66B]"
                        />

                        <span className="text-xs text-[#1C1C1C]/60">
                            {product.averageRating && product.averageRating > 0
                                ? product.averageRating.toFixed(1)
                                : "New"}
                        </span>
                    </div>

                    {/* Price + Stock */}
                    <div className="mb-3">
                        <span className="font-serif text-[#183C32] text-lg sm:text-xl">
                            ₦{product.price.toLocaleString()}
                        </span>

                        <div className="mt-1">
                            {isOutOfStock ? (
                                <span className="text-[10px] uppercase tracking-wider text-[#8B6F47]">
                                    Currently unavailable
                                </span>
                            ) : (
                                <span className="text-[10px] sm:text-xs text-[#183C32]/80">
                                    {product.stock}{" "}
                                    {product.stock === 1 ? "piece" : "pieces"} available
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`w-full flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 ${isOutOfStock
                                ? "bg-[#F7F3ED] text-[#8B6F47]/50 cursor-not-allowed border border-[#8B6F47]/10"
                                : "bg-[#183C32] text-white hover:bg-[#183C32]/90"
                            }`}
                    >
                        {isOutOfStock ? (
                            <span>Unavailable</span>
                        ) : (
                            <>
                                <span>Add to Cart</span>
                                <ShoppingCart className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}