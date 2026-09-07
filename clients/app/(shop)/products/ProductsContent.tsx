"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { debounce } from "lodash";
import { useCart } from "../../context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/axios";
import ProductCard from "../../../components/ProductCard";
import { Search, SlidersHorizontal, Loader2, X } from "lucide-react";

export default function ProductsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { addToCart } = useCart();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loadMoreError, setLoadMoreError] = useState(false); // NEW: Separate state for pagination errors
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const category = searchParams.get("category") || "";
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000000);

    // Pagination state
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const loader = useRef<HTMLDivElement | null>(null);

    const fetchProducts = async (filters: any = {}, append = false) => {
        // Prevent duplicate requests if a fetch is already in progress
        if (append && loading) return;

        setLoading(true);

        // Clear load-more error when starting a fresh initial fetch
        if (!append) {
            setLoadMoreError(false);
        }

        const { keyword, category, minPrice, maxPrice, page } = filters;

        try {
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
            setPages(res.data.pages);
            setLoadMoreError(false); // Clear error on successful fetch
        } catch (err: any) {
            // Differentiate between initial fetch failure and load-more failure
            if (!append) {
                setError(err.response?.data?.message || "Failed to fetch products");
            } else {
                setLoadMoreError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            setPage(1);
            fetchProducts({ keyword: query, category, minPrice, maxPrice, page: 1 });
        }, 500),
        [category, minPrice, maxPrice]
    );

    useEffect(() => {
        setPage(1);
        fetchProducts({
            keyword: search,
            category,
            minPrice,
            maxPrice,
            page: 1,
        });
    }, [category, minPrice, maxPrice]);

    useEffect(() => {
        debouncedSearch(search);
    }, [search, debouncedSearch]);

    // Infinite scroll observer
    useEffect(() => {
        if (!loader.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                // Only trigger if we haven't reached the end, aren't already loading, and don't have a pending error
                if (entries[0].isIntersecting && page < pages && !loading && !loadMoreError) {
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
    }, [page, pages, loading, search, category, minPrice, maxPrice, loadMoreError]);

    const handleAddToCart = (productId: string) => {
        addToCart(productId);
    };

    const handleViewProduct = (productId: string) => {
        router.push(`/products/${productId}`);
    };

    const activeFilterCount = [category, minPrice > 0, maxPrice < 10000000].filter(Boolean).length;

    // Full-page error only triggers if the INITIAL fetch fails (products array is empty)
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F7F3ED] px-4 sm:px-6">
                <div className="text-center max-w-sm">
                    <div className="mx-auto w-14 h-14 flex items-center justify-center border border-[#8B6F47]/30 mb-6">
                        <X className="w-6 h-6 text-[#8B6F47]" strokeWidth={1.5} />
                    </div>
                    <h2 className="font-serif text-2xl text-[#1C1C1C] mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-[#1C1C1C]/60 text-sm leading-relaxed">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F3ED]">
            {/* Header */}
            <div className="bg-[#F7F3ED] border-b border-[#8B6F47]/20 sticky top-[88px] z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
                        {/* Title & Results */}
                                  
                        <div>
                            <br />                            
                            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1C1C1C]">
                                <span className="sm:hidden">Collection</span>
                                <span className="hidden sm:inline">Explore Our Collection</span>
                            </h1>
                            <p className="mt-1 sm:mt-2 text-[#1C1C1C]/60 text-xs sm:text-sm">
                                {products.length} piece{products.length !== 1 ? "s" : ""}{" "}
                                selected for you
                            </p>
                        </div>

                        {/* Search + Filter */}
                        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-72">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#8B6F47] w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search furniture, decor, lighting..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-6 pr-3 py-2 sm:py-2.5 bg-transparent border-b border-[#8B6F47]/30 focus:border-[#183C32] outline-none text-xs sm:text-sm text-[#1C1C1C] placeholder:text-[#1C1C1C]/40 transition-colors duration-200"
                                />
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border text-xs sm:text-sm font-medium tracking-wide transition-colors duration-200 whitespace-nowrap ${showFilters || activeFilterCount > 0
                                        ? "border-[#183C32] text-[#183C32] bg-[#183C32]/5"
                                        : "border-[#8B6F47]/30 text-[#1C1C1C]/70 hover:border-[#183C32]/50"
                                    }`}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Filter</span>
                                {activeFilterCount > 0 && (
                                    <span className="w-4 h-4 flex items-center justify-center bg-[#183C32] text-white text-[10px] leading-none">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 sm:mt-6 py-4 sm:py-6 border-t border-[#8B6F47]/15">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-xs font-medium tracking-wide text-[#1C1C1C]/60 mb-1.5 sm:mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value) {
                                                router.push(`/products?category=${value}`);
                                            } else {
                                                router.push("/products");
                                            }
                                        }}
                                        className="w-full px-3 py-2 bg-white border border-[#8B6F47]/25 text-sm text-[#1C1C1C] focus:border-[#183C32] outline-none transition-colors duration-200 rounded-sm"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="decor">Decor</option>
                                        <option value="lighting">Lighting</option>
                                        <option value="textiles">Textiles</option>
                                        <option value="storage">Storage</option>
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-xs font-medium tracking-wide text-[#1C1C1C]/60 mb-1.5 sm:mb-2">
                                        Min Price
                                    </label>
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white border border-[#8B6F47]/25 text-sm text-[#1C1C1C] focus:border-[#183C32] outline-none transition-colors duration-200 rounded-sm"
                                        placeholder="₦0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium tracking-wide text-[#1C1C1C]/60 mb-1.5 sm:mb-2">
                                        Max Price
                                    </label>
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white border border-[#8B6F47]/25 text-sm text-[#1C1C1C] focus:border-[#183C32] outline-none transition-colors duration-200 rounded-sm"
                                        placeholder="₦100,000"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
                {products.length === 0 && !loading ? (
                    <div className="text-center py-16 sm:py-24">
                        <div className="mx-auto w-14 h-14 flex items-center justify-center border border-[#8B6F47]/30 mb-6">
                            <Search className="w-5 h-5 text-[#8B6F47]" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-serif text-xl sm:text-2xl text-[#1C1C1C] mb-2">
                            No pieces match your search
                        </h3>
                        <p className="text-[#1C1C1C]/60 text-sm">
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-6 sm:gap-y-10 lg:gap-y-12">
                        {products.map((product) => (
                            <div key={product._id} className="min-w-0">
                                <ProductCard
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    onViewProduct={handleViewProduct}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Load More Error Indicator */}
                {loadMoreError && (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                        <p className="text-[#1C1C1C]/60 text-sm mb-4 text-center">
                            Unable to load more products.
                        </p>
                        <button
                            onClick={() => {
                                setLoadMoreError(false);
                                fetchProducts(
                                    { keyword: search, category, minPrice, maxPrice, page },
                                    true
                                );
                            }}
                            className="px-5 py-2.5 bg-[#183C32] text-white text-sm font-medium tracking-wide rounded-sm hover:bg-[#183C32]/90 transition-colors duration-200"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="flex items-center justify-center py-12 sm:py-16">
                        <div className="flex items-center gap-3 text-[#8B6F47]">
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                            <span className="text-xs font-medium tracking-[0.1em] uppercase">
                                Curating more pieces
                            </span>
                        </div>
                    </div>
                )}

                {/* Infinite Scroll Trigger */}
                <div ref={loader} className="h-10" />
            </div>
        </div>
    );
}