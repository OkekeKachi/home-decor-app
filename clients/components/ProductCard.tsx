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

    const handleAddToCart = () => {
        onAddToCart(product._id);
    };

    const handleViewProduct = () => {
        onViewProduct(product._id);
    };

    return (
        <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-amber-200">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                {product.imageUrl && !imageError ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center text-gray-400">
                            <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                                🏠
                            </div>
                            <p className="text-sm">No Image</p>
                        </div>
                    </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                        <button
                            onClick={handleViewProduct}
                            className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                        >
                            <Eye className="w-4 h-4 text-gray-700" />
                        </button>
                        {product.stock > 0 && (
                            <button
                                onClick={handleAddToCart}
                                className="bg-amber-500 hover:bg-amber-600 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                            >
                                <ShoppingCart className="w-4 h-4 text-white" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Stock Badge */}
                {product.stock <= 0 && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-full capitalize">
                        {product.category}
                    </span>
                </div>

                {/* Like Button */}
                <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="absolute bottom-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                >
                    <Heart
                        className={`w-4 h-4 transition-colors duration-200 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'
                            }`}
                    />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-amber-600 transition-colors duration-200">
                        {product.name}
                    </h3>
                    {product.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {product.description}
                        </p>
                    )}
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-900">
                            ${product.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${product.stock > 0
                                ? 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow-lg hover:scale-105'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                    </button>
                </div>
            </div>
        </div>
    );
}