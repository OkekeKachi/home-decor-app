"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { debounce } from "lodash";
import { useCart } from "../../context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/axios";
import ProductCard from "../../../components/ProductCard"; // Import the ProductCard component
import { Search, SlidersHorizontal, Loader2, X } from "lucide-react";


export default function ProductsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const { addToCart } = useCart();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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

    const activeFilterCount = [category, minPrice > 0, maxPrice < 10000000].filter(Boolean).length;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F7F3ED] px-6">
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
                <div className="container mx-auto px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        {/* Title & Results */}
                        <div>
                            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1C1C]">
                                Explore Our Collection
                            </h1>
                            <p className="mt-2 text-[#1C1C1C]/60 text-sm">
                                {products.length} piece{products.length !== 1 ? "s" : ""}{" "}
                                selected for you
                            </p>
                        </div>

                        {/* Search + Filter */}
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-72">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[#8B6F47] w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search furniture, decor, lighting..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-6 pr-3 py-2.5 bg-transparent border-b border-[#8B6F47]/30 focus:border-[#183C32] outline-none text-sm text-[#1C1C1C] placeholder:text-[#1C1C1C]/40 transition-colors duration-200"
                                />
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2.5 border text-sm font-medium tracking-wide transition-colors duration-200 whitespace-nowrap ${showFilters || activeFilterCount > 0
                                        ? "border-[#183C32] text-[#183C32] bg-[#183C32]/5"
                                        : "border-[#8B6F47]/30 text-[#1C1C1C]/70 hover:border-[#183C32]/50"
                                    }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
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
                        <div className="mt-6 py-6 border-t border-[#8B6F47]/15">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-xs font-medium tracking-wide text-[#1C1C1C]/60 mb-2">
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
                                    <label className="block text-xs font-medium tracking-wide text-[#1C1C1C]/60 mb-2">
                                        Min Price
                                    </label>
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white border border-[#8B6F47]/25 text-sm text-[#1C1C1C] focus:border-[#183C32] outline-none transition-colors duration-200"
                                        placeholder="₦0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium tracking-wide text-[#1C1C1C]/60 mb-2">
                                        Max Price
                                    </label>
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white border border-[#8B6F47]/25 text-sm text-[#1C1C1C] focus:border-[#183C32] outline-none transition-colors duration-200"
                                        placeholder="₦100,000"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="container mx-auto px-6 lg:px-8 py-12">
                {products.length === 0 && !loading ? (
                    <div className="text-center py-24">
                        <div className="mx-auto w-14 h-14 flex items-center justify-center border border-[#8B6F47]/30 mb-6">
                            <Search className="w-5 h-5 text-[#8B6F47]" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-serif text-2xl text-[#1C1C1C] mb-2">
                            No pieces match your search
                        </h3>
                        <p className="text-[#1C1C1C]/60 text-sm">
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
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
                    <div className="flex items-center justify-center py-16">
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