import { Heart, ShoppingCart, Eye } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        price: number;
        category: string;
        stock: number;
        imageUrl?: string;
        description?: string;
    };
    onAddToCart: (productId: string) => void;
    onViewProduct: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart, onViewProduct }: ProductCardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart(product._id);
    };

    const handleViewProduct = () => {
        onViewProduct(product._id);
    };

    const isOutOfStock = product.stock <= 0;

    return (
        <div
            className="group flex flex-col bg-white border border-[#8B6F47]/10 hover:border-[#183C32]/30 transition-colors duration-300 cursor-pointer rounded-sm"
            onClick={handleViewProduct}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-[#F7F3ED] rounded-t-sm">
                {product.imageUrl && !imageError ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F7F3ED]">
                        <div className="text-center text-[#8B6F47]/60">
                            <span className="text-[10px] uppercase tracking-[0.2em]">Image Unavailable</span>
                        </div>
                    </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                    {/* Category Label */}
                    <span className="bg-white/90 backdrop-blur-sm text-[#1C1C1C] text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 pointer-events-auto border border-[#8B6F47]/10">
                        {product.category}
                    </span>

                    {/* Out of Stock Label */}
                    {isOutOfStock && (
                        <span className="bg-[#1C1C1C]/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-[0.15em] px-2.5 py-1">
                            Unavailable
                        </span>
                    )}
                </div>

                {/* Desktop Hover Action */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto bg-[#F7F3ED]/10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewProduct();
                        }}
                        className="bg-white text-[#1C1C1C] px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-[#183C32] hover:text-white transition-colors duration-300 flex items-center space-x-2 shadow-sm"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                    </button>
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsLiked(!isLiked);
                    }}
                    className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm hover:bg-white border border-[#8B6F47]/10 transition-all duration-200 pointer-events-auto"
                    aria-label="Add to wishlist"
                >
                    <Heart
                        className={`w-4 h-4 transition-colors duration-200 ${isLiked ? 'text-[#183C32] fill-[#183C32]' : 'text-[#8B6F47]'
                            }`}
                    />
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-5">
                {/* 1. Product Name */}
                <h3 className="font-serif text-lg text-[#1C1C1C] group-hover:text-[#183C32] transition-colors duration-300 mb-1">
                    {product.name}
                </h3>

                {/* 2. Short Description */}
                {product.description && (
                    <p className="text-sm text-[#8B6F47] line-clamp-2 mb-3 leading-relaxed">
                        {product.description}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-[#8B6F47]/10">
                    {/* 3. Price */}
                    <div className="mb-2">
                        <span className="text-xl font-medium text-[#1C1C1C]">
                            ₦{product.price.toLocaleString()}
                        </span>
                    </div>

                    {/* 4. Stock Availability */}
                    <div className="mb-4">
                        {isOutOfStock ? (
                            <span className="text-xs text-[#8B6F47] uppercase tracking-wider">Currently Unavailable</span>
                        ) : (
                            <span className="text-xs text-[#183C32] font-medium">
                                {product.stock} {product.stock === 1 ? 'piece' : 'pieces'} available
                            </span>
                        )}
                    </div>

                    {/* 5. Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`w-full flex items-center justify-center space-x-2 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 ${isOutOfStock
                                ? 'bg-[#F7F3ED] text-[#8B6F47]/50 cursor-not-allowed border border-[#8B6F47]/10'
                                : 'bg-[#183C32] text-white hover:bg-[#183C32]/90 group/btn'
                            }`}
                    >
                        {isOutOfStock ? (
                            <span>Unavailable</span>
                        ) : (
                            <>
                                <span>Add to Cart</span>
                                <ShoppingCart className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}