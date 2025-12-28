"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { debounce } from "lodash";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import ProductCard from "../../../components/ProductCard"; // Import the ProductCard component
import { Search, Filter, SlidersHorizontal, Grid3X3, List, Loader2 } from "lucide-react";

export default function ProductsPage() {
    const router = useRouter();
    const { addToCart } = useCart();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filters
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000000);

    // Pagination state
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const loader = useRef<HTMLDivElement | null>(null);

    const fetchProducts = async (filters: any = {}, append = false) => {
        try {
            setLoading(true);

            const { keyword, category, minPrice, maxPrice, page } = filters;

            const res = await api.get(`/api/products`, {
                params: {
                    keyword,
                    category,
                    minPrice,
                    maxPrice,
                    page,
                    limit: 6,
                },
            });

            setProducts((prev) =>
                append ? [...prev, ...res.data.data] : res.data.data
            );
            console.log(res.data.pages);
            
            
            
            setPages(res.data.pages);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            fetchProducts({ keyword: query, category, minPrice, maxPrice, page: 1 });
            setPage(1);
        }, 500),
        [category, minPrice, maxPrice]
    );

    useEffect(() => {
        debouncedSearch(search);
    }, [search, debouncedSearch]);

    useEffect(() => {
        fetchProducts({ keyword: search, category, minPrice, maxPrice, page });
    }, [category, minPrice, maxPrice]);

    useEffect(() => {
        fetchProducts({ page: 1 });
    }, []);

    // Infinite scroll observer
    useEffect(() => {
        if (!loader.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && page < pages && !loading) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchProducts(
                        { keyword: search, category, minPrice, maxPrice, page: nextPage },
                        true
                    );
                }
            },
            { threshold: 1.0 }
        );

        observer.observe(loader.current);
        return () => observer.disconnect();
    }, [page, pages, loading, search, category, minPrice, maxPrice]);

    const handleAddToCart = (productId: string) => {
        addToCart(productId);
    };

    const handleViewProduct = (productId: string) => {
        router.push(`/products/${productId}`);
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Title & Results */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                All Products
                            </h1>
                            <p className="text-gray-600">
                                {products.length} product{products.length !== 1 ? 's' : ''} found
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for furniture, decor, lighting..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        {/* View Toggle & Filter Button */}
                        <div className="flex items-center space-x-3">
                            {/* View Mode Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid'
                                            ? 'bg-white shadow-sm text-amber-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list'
                                            ? 'bg-white shadow-sm text-amber-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${showFilters
                                        ? 'bg-amber-50 border-amber-300 text-amber-600'
                                        : 'bg-white border-gray-300 text-gray-600 hover:border-amber-300'
                                    }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="font-medium">Filters</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="decor">Decor</option>
                                        <option value="lighting">Lighting</option>
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Min Price
                                    </label>
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="$0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Price
                                    </label>
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="$100,000"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="container mx-auto px-6 py-8">
                {products.length === 0 && !loading ? (
                    <div className="text-center py-16">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'grid-cols-1'
                        }`}>
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onViewProduct={handleViewProduct}
                            />
                        ))}
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2 text-amber-600">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="font-medium">Loading more products...</span>
                        </div>
                    </div>
                )}

                {/* Infinite Scroll Trigger */}
                <div ref={loader} className="h-10" />
            </div>
        </div>
    );
}