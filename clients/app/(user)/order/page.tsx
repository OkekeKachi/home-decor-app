"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import Cookies from "js-cookie";
import Link from "next/link";
import {
  Package,
  Calendar,
  Star,
  ArrowLeft,
  Eye,
  MessageSquare,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Filter,
  Search,
  X
} from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Review state
  const [reviewingProduct, setReviewingProduct] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = Cookies.get("token");
        const res = await api.get("/api/order/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.orders);
        setFilteredOrders(res.data.orders);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on status and search
  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item: any) =>
          item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery]);

  const handleSubmitReview = async (productId: string) => {
    if (!comment.trim()) {
      alert("Please write a review comment");
      return;
    }

    setSubmittingReview(true);
    try {
      const token = Cookies.get("token");
      await api.post(
        `/api/review/${productId}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Review submitted successfully!");
      setReviewingProduct(null);
      setRating(5);
      setComment("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'delivered':
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onStarClick?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 transition-colors duration-200 ${interactive ? 'cursor-pointer hover:text-[#C9A66B]' : ''
          } ${i < rating
            ? "text-[#C9A66B] fill-[#C9A66B]"
            : "text-[#8B6F47]/30"
          }`}
        onClick={() => interactive && onStarClick?.(i + 1)}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#183C32]" />
          <span className="text-[#1C1C1C]/60 text-sm tracking-widest uppercase">Loading your orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-serif text-[#1C1C1C] mb-3">Failed to Load Orders</h2>
          <p className="text-red-600/80 mb-8 text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-2 bg-[#183C32] hover:bg-[#183C32]/90 text-white px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-300 rounded-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3ED]">
      {/* Header */}
      <div className="bg-[#FAFAF8] border-b border-[#8B6F47]/10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-[#1C1C1C]/60 hover:text-[#183C32] transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-[#8B6F47]/20 hidden sm:block"></div>
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-[#8B6F47]" />
                <div>
                  <h1 className="text-2xl font-serif text-[#1C1C1C]">My Orders</h1>
                  {filteredOrders.length > 0 && (
                    <p className="text-sm text-[#1C1C1C]/60 mt-0.5">
                      {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B6F47]/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#8B6F47]/20 rounded-sm text-sm text-[#1C1C1C] placeholder-[#8B6F47]/50 focus:outline-none focus:border-[#183C32] focus:ring-1 focus:ring-[#183C32] transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B6F47]/50 hover:text-[#1C1C1C] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B6F47]/50 w-4 h-4 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border border-[#8B6F47]/20 rounded-sm text-sm text-[#1C1C1C] focus:outline-none focus:border-[#183C32] focus:ring-1 focus:ring-[#183C32] transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-[#8B6F47]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 md:py-12">
        {filteredOrders.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="bg-white border border-[#8B6F47]/10 rounded-sm p-12">
              <div className="w-20 h-20 bg-[#F7F3ED] border border-[#8B6F47]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-[#8B6F47]" />
              </div>
              <h2 className="text-2xl font-serif text-[#1C1C1C] mb-3">
                {orders.length === 0 ? "No orders yet" : "No orders found"}
              </h2>
              <p className="text-[#1C1C1C]/60 mb-8 leading-relaxed">
                {orders.length === 0
                  ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                  : "No orders match your current search or filter criteria."
                }
              </p>
              <Link
                href="/products"
                className="inline-flex items-center space-x-2 bg-[#183C32] hover:bg-[#183C32]/90 text-white px-8 py-3 rounded-sm font-medium tracking-wide transition-all duration-200"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Start Shopping</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order: any) => (
              <div key={order._id} className="bg-white border border-[#8B6F47]/10 rounded-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-[#8B6F47]/10 bg-[#FAFAF8]/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="font-medium text-[#1C1C1C]">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-sm border text-xs font-medium tracking-wide ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm">
                      <div className="flex items-center space-x-2 text-[#1C1C1C]/60">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <Link
                        href={`/order/${order._id}`}
                        className="flex items-center space-x-1.5 text-[#183C32] hover:text-[#183C32]/80 font-medium transition-colors duration-200 group"
                      >
                        <span>View Details</span>
                        <Eye className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[#F7F3ED] border border-[#8B6F47]/10 rounded-sm">
                      <div className="flex-shrink-0 w-20 h-20 bg-white border border-[#8B6F47]/10 rounded-sm flex items-center justify-center overflow-hidden">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-[#8B6F47]/40" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#1C1C1C] truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-[#1C1C1C]/60 mt-1 capitalize">
                          {item.product.category} • Qty: {item.quantity}
                        </p>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className="text-sm font-medium text-[#8B6F47]">
                            ₦{item.product.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-[#1C1C1C]/40">each</span>
                        </div>
                      </div>

                      <div className="text-right sm:text-right mt-2 sm:mt-0">
                        <p className="text-lg font-medium text-[#1C1C1C]">
                          ₦{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="px-6 pb-6 pt-2">
                  <div className="flex justify-between items-center pt-4 border-t border-[#8B6F47]/10">
                    <span className="text-sm font-medium text-[#1C1C1C]/80">Order Total</span>
                    <span className="text-xl font-serif text-[#183C32]">₦{order.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Review Section for Completed/Delivered Orders */}
                {(order.status === "completed" || order.status === "delivered") && (
                  <div className="p-6 bg-[#F3EDE3] border-t border-[#8B6F47]/10">
                    <h4 className="font-serif text-lg text-[#1C1C1C] mb-4">Leave a Review</h4>
                    <div className="space-y-4">
                      {order.items.map((item: any) => (
                        <div key={item._id} className="bg-white border border-[#8B6F47]/10 rounded-sm p-5">
                          {reviewingProduct === item.product._id ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-[#1C1C1C]">{item.product.name}</span>
                                <button
                                  onClick={() => setReviewingProduct(null)}
                                  className="text-[#1C1C1C]/40 hover:text-[#1C1C1C] transition-colors duration-200"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-[#1C1C1C]/60 tracking-[0.1em] uppercase mb-2">
                                  Your Rating
                                </label>
                                <div className="flex items-center space-x-1">
                                  {renderStars(rating, true, setRating)}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-[#1C1C1C]/60 tracking-[0.1em] uppercase mb-2">
                                  Your Review
                                </label>
                                <textarea
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#8B6F47]/20 rounded-sm text-sm text-[#1C1C1C] placeholder-[#8B6F47]/50 focus:outline-none focus:border-[#183C32] focus:ring-1 focus:ring-[#183C32] transition-all duration-200 resize-none"
                                  placeholder="Share your experience with this product..."
                                  rows={3}
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                  onClick={() => handleSubmitReview(item.product._id)}
                                  disabled={submittingReview}
                                  className="flex-1 sm:flex-none bg-[#183C32] hover:bg-[#183C32]/90 text-white px-6 py-2.5 rounded-sm text-sm font-medium tracking-wide transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                  {submittingReview ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Submitting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Star className="w-4 h-4" />
                                      <span>Submit Review</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setReviewingProduct(null);
                                    setComment("");
                                    setRating(5);
                                  }}
                                  className="flex-1 sm:flex-none border border-[#8B6F47]/20 text-[#1C1C1C]/70 hover:bg-[#F7F3ED] px-6 py-2.5 rounded-sm text-sm font-medium tracking-wide transition-colors duration-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <span className="font-medium text-[#1C1C1C]">{item.product.name}</span>
                              <button
                                onClick={() => setReviewingProduct(item.product._id)}
                                className="flex items-center justify-center space-x-2 text-[#183C32] hover:text-[#183C32]/80 font-medium text-sm transition-colors duration-200 w-full sm:w-auto py-2 sm:py-0"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span>Write Review</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}