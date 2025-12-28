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
    Check,
    Package,
    User
} from "lucide-react";

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
    const [selectedImage, setSelectedImage] = useState(0);

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
            await addToCart(product._id);
            // Add success feedback here if needed
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

    const renderStars = (rating: number, size: string = "w-5 h-5") => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`${size} ${i < rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    }`}
            />
        ));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-3 text-amber-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-lg font-medium">Loading product...</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors duration-200"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium">Back</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                            <span className="text-sm text-gray-500 capitalize hidden sm:block">{product.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-600 hover:text-amber-600 hover:bg-gray-100 rounded-full transition-colors duration-200">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-125 w-170">
                            {product.imageUrl && !imageError ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                    <div className="text-center text-gray-400">
                                        <Package className="w-24 h-24 mx-auto mb-4" />
                                        <p className="text-lg font-medium">No Image Available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Title and Rating */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                    {renderStars(Math.round(product.averageRating))}
                                    <span className="ml-2 text-sm text-gray-600">
                                        ({product.averageRating.toFixed(1)})
                                    </span>
                                </div>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-600">
                                    {product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline space-x-3">
                            <span className="text-4xl font-bold text-gray-900">
                                ₦{product.price.toLocaleString()}
                            </span>
                            <span className="text-lg text-gray-500 line-through">
                                ₦{(product.price * 1.2).toLocaleString()}
                            </span>
                            <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                                17% off
                            </span>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center space-x-2">
                            {product.stock > 0 ? (
                                <>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-green-600 font-medium">
                                        {product.stock} items in stock
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-red-600 font-medium">Out of stock</span>
                                </>
                            )}
                        </div>

                        {/* Quantity and Add to Cart */}
                        {product.stock > 0 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quantity
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                onClick={decrementQuantity}
                                                className="p-2 hover:bg-gray-100 transition-colors duration-200"
                                                disabled={quantity <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-4 py-2 font-medium">{quantity}</span>
                                            <button
                                                onClick={incrementQuantity}
                                                className="p-2 hover:bg-gray-100 transition-colors duration-200"
                                                disabled={quantity >= product.stock}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {product.stock} available
                                        </span>
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                                    >
                                        {addingToCart ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-5 h-5" />
                                                <span>Add to Cart</span>
                                            </>
                                        )}
                                    </button>
                                    {/* <button className="px-6 py-3 border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-xl font-semibold transition-colors duration-200">
                                        Buy Now
                                    </button> */}
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Truck className="w-5 h-5 text-amber-500" />
                                <span>Free shipping</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <RotateCcw className="w-5 h-5 text-amber-500" />
                                <span>30-day returns</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Shield className="w-5 h-5 text-amber-500" />
                                <span>2-year warranty</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                    {renderStars(Math.round(product.averageRating))}
                                    <span className="ml-2 font-semibold text-gray-900">
                                        {product.averageRating.toFixed(1)}
                                    </span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600">
                                    {product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {product.reviews.length > 0 ? (
                            <div className="space-y-6">
                                {product.reviews.map((review) => (
                                    <div key={review._id} className="border-b border-gray-100 pb-6 last:border-b-0">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-semibold text-gray-900">
                                                        {review.user.username}
                                                    </span>
                                                    <div className="flex items-center space-x-1">
                                                        {renderStars(review.rating, "w-4 h-4")}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                                <p className="text-gray-600">Be the first to review this product!</p>
                                <button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                                    Write a Review
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}