"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import api from "@/utils/axios";
import { useCart } from "../../../context/CartContext";
import {
    ArrowLeft,
    Star,
    Heart,
    ShoppingCart,
    Plus,
    Minus,
    Shield,
    Truck,
    RotateCcw,
    Share2,
    Loader2,
    AlertCircle,
    Package,
    User,
    Check
} from "lucide-react";
import Image from "next/image";


type Review = {
    _id: string;
    rating: number;
    comment: string;
    user: {
        username: string;
    };
};

type Product = {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    inStock: boolean;
    imageUrl?: string;
    reviews: Review[];
    averageRating: number;
};

export default function ProductDetail() {
    const { addToCart } = useCart();
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/api/products/${id}`);
                setProduct({
                    ...res.data.data,
                    reviews: res.data.data.reviews || [],
                });
            } catch (err) {
                console.error("Failed to load product", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!product) return;
        setAddingToCart(true);
        try {
            // Preserving existing behavior: addToCart currently accepts only product ID.
            // When CartContext is updated to support quantity, this can be changed to:
            // await addToCart(product._id, quantity);
            await addToCart(product._id);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to add to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    const incrementQuantity = () => {
        if (product && quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const renderStars = (rating: number, size: string = "w-4 h-4") => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`${size} ${i < Math.round(rating)
                        ? "text-[#C9A66B] fill-[#C9A66B]"
                        : "text-[#8B6F47]/30"
                    }`}
            />
        ));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#183C32]" />
                    <span className="text-[#1C1C1C]/60 text-sm tracking-widest uppercase">Loading Collection Piece...</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#8B6F47]/10 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-[#8B6F47]" />
                    </div>
                    <h2 className="text-2xl font-serif text-[#1C1C1C] mb-3">Piece Not Found</h2>
                    <p className="text-[#8B6F47] text-sm leading-relaxed mb-8">
                        The item you are looking for is no longer in our collection or may have been moved.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center space-x-2 bg-[#183C32] text-white px-6 py-3 text-sm font-medium tracking-wide hover:bg-[#183C32]/90 transition-colors duration-300 rounded-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Return to Collection</span>
                    </button>
                </div>
            </div>
        );
    }

    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    return (
        <div className="min-h-screen bg-[#F7F3ED]">
            {/* Breadcrumb & Top Navigation */}
            <div className="bg-[#F7F3ED] border-b border-[#8B6F47]/10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-sm">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center space-x-2 text-[#1C1C1C]/60 hover:text-[#183C32] transition-colors duration-200 group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span className="hidden sm:inline">Back</span>
                            </button>
                            <span className="text-[#8B6F47]/40">/</span>
                            <span className="text-[#1C1C1C]/60 capitalize">{product.category}</span>
                            <span className="text-[#8B6F47]/40">/</span>
                            <span className="text-[#1C1C1C] font-medium truncate max-w-[200px] sm:max-w-md">
                                {product.name}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button
                                className="p-2 text-[#1C1C1C]/60 hover:text-[#183C32] hover:bg-[#8B6F47]/5 transition-all duration-200 rounded-sm"
                                aria-label="Share product"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className="p-2 text-[#1C1C1C]/60 hover:text-[#183C32] hover:bg-[#8B6F47]/5 transition-all duration-200 rounded-sm"
                                aria-label="Add to wishlist"
                            >
                                <Heart className={`w-5 h-5 transition-all duration-200 ${isLiked ? 'text-[#183C32] fill-[#183C32]' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* Product Image Layer: Lighter cream/white surface */}
                    <div className="relative  border border-[#8B6F47]/10 rounded-sm overflow-hidden group">
                        <div className="aspect-[4/3] w-full ">
                            {product.imageUrl && !imageError ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-[#8B6F47]/50">
                                    <Package className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="text-sm tracking-widest uppercase">Image Unavailable</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Information Layer: Main beige surface with internal hierarchy */}
                    <div className="flex flex-col">
                        <span className="text-[#8B6F47] text-[10px] font-semibold tracking-[0.2em] uppercase mb-3">
                            {product.category}
                        </span>

                        <h1 className="text-3xl md:text-4xl font-serif text-[#1C1C1C] mb-4 leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <div className="flex items-center space-x-1">
                                {renderStars(product.averageRating)}
                                <span className="ml-2 text-sm text-[#1C1C1C]/70 font-medium">
                                    {product.averageRating.toFixed(1)}
                                </span>
                            </div>
                            <span className="text-[#8B6F47]/40">•</span>
                            <span className="text-sm text-[#1C1C1C]/60">
                                {product.reviews.length} {product.reviews.length === 1 ? 'Review' : 'Reviews'}
                            </span>
                        </div>

                        {/* Price Section: Separated by subtle border */}
                        <div className="flex items-baseline space-x-4 mb-6 pb-6 border-b border-[#8B6F47]/10">
                            <span className="text-3xl font-medium text-[#1C1C1C]">
                                ₦{product.price.toLocaleString()}
                            </span>
                            <span className="text-lg text-[#1C1C1C]/40 line-through">
                                ₦{Math.round(product.price * 1.2).toLocaleString()}
                            </span>
                            <span className="text-xs font-medium text-[#183C32] bg-[#183C32]/10 px-2 py-1 rounded-sm">
                                17% Off
                            </span>
                        </div>

                        <div className="mb-8">
                            <p className="text-[#1C1C1C]/70 leading-relaxed text-sm md:text-base">
                                {product.description}
                            </p>
                        </div>

                        <div className="mb-8">
                            {isOutOfStock ? (
                                <div className="flex items-center space-x-2 text-[#8B6F47]">
                                    <div className="w-2 h-2 bg-[#8B6F47] rounded-full"></div>
                                    <span className="text-sm font-medium tracking-wide">Currently Unavailable</span>
                                </div>
                            ) : isLowStock ? (
                                <div className="flex items-center space-x-2 text-orange-700">
                                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium tracking-wide">Only {product.stock} pieces remaining</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 text-[#183C32]">
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm font-medium tracking-wide">In Stock & Ready to Ship</span>
                                </div>
                            )}
                        </div>

                        {/* Purchase/Action Area Layer: Subtly contrasting warm neutral */}
                        {!isOutOfStock && (
                            <div className="bg-[#8B6F47]/5 border border-[#8B6F47]/10 rounded-sm p-6 md:p-8 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-semibold text-[#1C1C1C]/60 tracking-[0.15em] uppercase mb-3">
                                        Quantity
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center border border-[#8B6F47]/20 rounded-sm bg-white">
                                            <button
                                                onClick={decrementQuantity}
                                                disabled={quantity <= 1}
                                                className="p-3 text-[#1C1C1C]/60 hover:text-[#183C32] hover:bg-[#F7F3ED] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center text-[#1C1C1C] font-medium">{quantity}</span>
                                            <button
                                                onClick={incrementQuantity}
                                                disabled={quantity >= product.stock}
                                                className="p-3 text-[#1C1C1C]/60 hover:text-[#183C32] hover:bg-[#F7F3ED] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="text-sm text-[#1C1C1C]/50">
                                            {product.stock} available
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className="w-full bg-[#183C32] text-white py-4 px-6 rounded-sm font-medium tracking-wide hover:bg-[#183C32]/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group"
                                >
                                    {addingToCart ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Adding to Cart...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                            <span>Add to Cart — ₦{(product.price * quantity).toLocaleString()}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Trust/Service Features Layer: Lighter cream/white surface */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white border border-[#8B6F47]/10 rounded-sm p-6 mt-8">
                            <div className="flex items-start space-x-3">
                                <Truck className="w-5 h-5 text-[#8B6F47] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-[#1C1C1C]">Complimentary Shipping</p>
                                    <p className="text-xs text-[#1C1C1C]/50 mt-1">On all orders</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <RotateCcw className="w-5 h-5 text-[#8B6F47] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-[#1C1C1C]">30-Day Returns</p>
                                    <p className="text-xs text-[#1C1C1C]/50 mt-1">Hassle-free exchanges</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Shield className="w-5 h-5 text-[#8B6F47] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-[#1C1C1C]">2-Year Warranty</p>
                                    <p className="text-xs text-[#1C1C1C]/50 mt-1">Quality guaranteed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Section: Returns to main beige surface */}
                <div className="mt-16 md:mt-24 border-t border-[#8B6F47]/10 pt-12">
                    <h2 className="text-xl font-serif text-[#1C1C1C] mb-6">Product Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-[#8B6F47] tracking-[0.15em] uppercase">Category</p>
                            <p className="text-sm text-[#1C1C1C]/80 capitalize">{product.category}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-[#8B6F47] tracking-[0.15em] uppercase">Availability</p>
                            <p className="text-sm text-[#1C1C1C]/80">
                                {isOutOfStock ? 'Out of Stock' : `${product.stock} Units Available`}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-[#8B6F47] tracking-[0.15em] uppercase">Product ID</p>
                            <p className="text-sm text-[#1C1C1C]/80 font-mono">{product._id}</p>
                        </div>
                    </div>
                </div>

                {/* Reviews Layer: Slightly lighter white surface to distinguish the section */}
                <div className="mt-16 md:mt-24 bg-white border border-[#8B6F47]/10 rounded-sm p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-10 pb-6 border-b border-[#8B6F47]/10">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-serif text-[#1C1C1C] mb-2">Customer Reviews</h2>
                            <p className="text-[#1C1C1C]/60 text-sm">Hear from those who have curated their spaces with us.</p>
                        </div>
                        <div className="mt-6 md:mt-0 flex items-center space-x-4 bg-[#F7F3ED] px-6 py-4 rounded-sm">
                            <div className="text-center">
                                <span className="block text-3xl font-serif text-[#1C1C1C]">{product.averageRating.toFixed(1)}</span>
                                <div className="flex justify-center mt-1">
                                    {renderStars(product.averageRating, "w-3 h-3")}
                                </div>
                            </div>
                            <div className="w-px h-10 bg-[#8B6F47]/20"></div>
                            <div className="text-sm text-[#1C1C1C]/70">
                                Based on <span className="font-medium text-[#1C1C1C]">{product.reviews.length}</span> {product.reviews.length === 1 ? 'review' : 'reviews'}
                            </div>
                        </div>
                    </div>

                    {product.reviews.length > 0 ? (
                        <div className="space-y-8">
                            {product.reviews.map((review) => (
                                <div key={review._id} className="pb-8 border-b border-[#8B6F47]/10 last:border-0">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-[#F7F3ED] border border-[#8B6F47]/20 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-[#8B6F47]" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                                <span className="font-medium text-[#1C1C1C]">{review.user.username}</span>
                                                <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                                                    {renderStars(review.rating, "w-3.5 h-3.5")}
                                                </div>
                                            </div>
                                            <p className="text-[#1C1C1C]/70 leading-relaxed text-sm md:text-base">
                                                {review.comment}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-[#F7F3ED] rounded-sm">
                            <div className="w-16 h-16 bg-white border border-[#8B6F47]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-[#8B6F47]/40" />
                            </div>
                            <h3 className="text-lg font-serif text-[#1C1C1C] mb-2">No reviews yet</h3>
                            <p className="text-[#1C1C1C]/60 text-sm mb-6 max-w-sm mx-auto">
                                Be the first to share your experience with this piece and help others curate their spaces.
                            </p>
                            <button className="bg-[#183C32] text-white px-6 py-3 text-sm font-medium tracking-wide hover:bg-[#183C32]/90 transition-colors duration-300 rounded-sm">
                                Write a Review
                            </button>
                        </div>
                    )}
                </div>

                {/* Related Products Layer: Returns to main beige background */}
                <div className="mt-16 md:mt-24 border-t border-[#8B6F47]/10 pt-12 pb-8">
                    <h2 className="text-2xl font-serif text-[#1C1C1C] mb-8">Complete the Look</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Placeholder UI for future related products integration */}
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[4/5] bg-white border border-[#8B6F47]/10 rounded-sm flex items-center justify-center">
                                <span className="text-[#8B6F47]/30 text-xs tracking-widest uppercase">Related Piece {i}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-[#1C1C1C]/40 text-xs mt-6 italic">
                        Related products integration pending backend endpoint.
                    </p>
                </div>
            </div>
        </div>
    );
}