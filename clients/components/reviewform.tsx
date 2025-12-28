"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface ReviewFormProps {
    productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
    const [canReview, setCanReview] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchCanReview = async () => {
            try {
                const { data } = await axios.get(`/api/products/${productId}/can-review`);
                setCanReview(data.canReview);
            } catch (error) {
                setCanReview(false);
            } finally {
                setLoading(false);
            }
        };
        fetchCanReview();
    }, [productId]);

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`/api/products/${productId}/reviews`, {
                rating,
                comment,
            });
            setMessage(data.message);
            setComment("");
        } catch (err: any) {
            setMessage(err.response?.data?.message || "Error submitting review");
        }
    };

    if (loading) return <p>Checking review eligibility...</p>;

    if (!canReview) {
        return <p className="text-gray-500 italic">You can only review products you’ve purchased.</p>;
    }

    return (
        <form onSubmit={submitReview} className="mt-6 p-4 border rounded-xl shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-3">Leave a Review</h3>

            <label className="block mb-2 font-medium">Rating</label>
            <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full border p-2 rounded mb-4"
            >
                {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                        {r} Star{r > 1 ? "s" : ""}
                    </option>
                ))}
            </select>

            <label className="block mb-2 font-medium">Comment</label>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border p-2 rounded mb-4"
                rows={3}
                placeholder="Write your thoughts..."
            />

            <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
                Submit Review
            </button>

            {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
            
        </form>
    );
}
