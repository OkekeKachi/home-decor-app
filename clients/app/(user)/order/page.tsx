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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        className={`w-5 h-5 transition-colors duration-200 ${interactive ? 'cursor-pointer hover:text-amber-400' : ''
          } ${i < rating
            ? "text-amber-400 fill-amber-400"
            : "text-gray-300"
          }`}
        onClick={() => interactive && onStarClick?.(i + 1)}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-amber-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg font-medium">Loading your orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Orders</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-6 py-6">
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
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-amber-600" />
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                {filteredOrders.length > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-sm font-medium px-2 py-1 rounded-full">
                    {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders by ID or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {filteredOrders.length === 0 ? (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {orders.length === 0 ? "No orders yet" : "No orders found"}
              </h2>
              <p className="text-gray-600 mb-8">
                {orders.length === 0
                  ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                  : "No orders match your current search or filter criteria."
                }
              </p>
              <Link
                href="/products"
                className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Start Shopping</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order: any) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">Order #{order._id.slice(-8)}</span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <Link
                        href={`/order/${order._id}`}
                        className="flex items-center space-x-1 text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {item.product.category} • Qty: {item.quantity}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-semibold text-amber-600">
                              ${item.product.price}
                            </span>
                            <span className="text-sm text-gray-500">each</span>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Order Total:</span>
                    <span className="text-2xl font-bold text-amber-600">${order.totalPrice}</span>
                  </div>

                  {/* Review Section for Completed Orders */}
                  {(order.status === "completed" || order.status === "delivered") && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">Leave Reviews</h4>
                      <div className="space-y-3">
                        {order.items.map((item: any) => (
                          <div key={item._id} className="p-4 bg-amber-50 rounded-xl">
                            {reviewingProduct === item.product._id ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900">{item.product.name}</span>
                                  <button
                                    onClick={() => setReviewingProduct(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Rating
                                  </label>
                                  <div className="flex items-center space-x-1">
                                    {renderStars(rating, true, setRating)}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Review
                                  </label>
                                  <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Share your experience with this product..."
                                    rows={3}
                                  />
                                </div>
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => handleSubmitReview(item.product._id)}
                                    disabled={submittingReview}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
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
                                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{item.product.name}</span>
                                <button
                                  onClick={() => setReviewingProduct(item.product._id)}
                                  className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}