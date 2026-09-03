"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";

import {
    Plus,
    Edit,
    Trash,
    RefreshCw,
    Search,
} from "lucide-react";

import api from "@/utils/axios";
import Cookies from "js-cookie";

interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    description?: string;
    image?: string;
}

interface ProductsResponse {
    data: Product[];
}

interface ProductForm {
    name: string;
    price: string;
    category: string;
    stock: string;
    description: string;
    image: File | null;
}

const initialForm: ProductForm = {
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    image: null,
};

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<ProductForm>(initialForm);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get<ProductsResponse>(
                "/api/products",
                {
                    params: {
                        search,
                        category,
                    },
                }
            );

            setProducts(response.data.data);
        } catch (err: unknown) {
            let message = "Failed to load products.";

            if (axios.isAxiosError(err)) {
                message =
                    err.response?.data?.message || message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [search, category]);

    useEffect(() => {
        void fetchProducts();
    }, [fetchProducts]);

    const resetForm = () => {
        setForm(initialForm);
        setEditing(null);
    };

    const openCreateModal = () => {
        resetForm();
        setOpenModal(true);
    };

    const openEditModal = (product: Product) => {
        setEditing(product._id);

        setForm({
            name: product.name,
            price: String(product.price),
            category: product.category,
            stock: String(product.stock),
            description: product.description || "",
            image: null,
        });

        setOpenModal(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
            setDeleting(id);

            const token = Cookies.get("token");

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            await api.delete(`/api/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setProducts((previousProducts) =>
                previousProducts.filter(
                    (product) => product._id !== id
                )
            );
        } catch (err: unknown) {
            let message = "Failed to delete product.";

            if (axios.isAxiosError(err)) {
                message =
                    err.response?.data?.message || message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            window.alert(message);
        } finally {
            setDeleting(null);
        }
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            window.alert("Product name is required.");
            return;
        }

        if (!form.price || Number(form.price) < 0) {
            window.alert("Enter a valid product price.");
            return;
        }

        if (!form.category.trim()) {
            window.alert("Product category is required.");
            return;
        }

        if (!form.stock || Number(form.stock) < 0) {
            window.alert("Enter a valid stock quantity.");
            return;
        }

        try {
            setSaving(true);

            const token = Cookies.get("token");

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const formData = new FormData();

            formData.append("name", form.name.trim());
            formData.append("price", form.price);
            formData.append("category", form.category.trim());
            formData.append("stock", form.stock);
            formData.append(
                "description",
                form.description.trim()
            );

            if (form.image) {
                formData.append("image", form.image);
            }

            if (editing) {
                await api.put(
                    `/api/products/${editing}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else {
                await api.post(
                    "/api/products",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            setOpenModal(false);
            resetForm();

            await fetchProducts();
        } catch (err: unknown) {
            let message = editing
                ? "Failed to update product."
                : "Failed to create product.";

            if (axios.isAxiosError(err)) {
                message =
                    err.response?.data?.message || message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            window.alert(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        Products
                    </h1>

                    <p className="text-sm text-gray-500">
                        Manage your product inventory.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={() => void fetchProducts()}
                        variant="outline"
                        disabled={loading}
                        aria-label="Refresh products"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loading ? "animate-spin" : ""
                                }`}
                        />
                    </Button>

                    <Button onClick={openCreateModal}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                    <Input
                        placeholder="Search products..."
                        className="pl-9"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>

                <Select
                    value={category}
                    onValueChange={setCategory}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="furniture">
                            Furniture
                        </SelectItem>

                        <SelectItem value="Rug">
                            Rug
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void fetchProducts()}
                    >
                        Try again
                    </Button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-8 text-center text-gray-500"
                                >
                                    Loading products...
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-8 text-center text-gray-500"
                                >
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>

                                    <TableCell>
                                        ₦
                                        {Number(
                                            product.price
                                        ).toLocaleString()}
                                    </TableCell>

                                    <TableCell>
                                        {product.category}
                                    </TableCell>

                                    <TableCell>
                                        {product.stock}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    openEditModal(
                                                        product
                                                    )
                                                }
                                                aria-label={`Edit ${product.name}`}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                disabled={
                                                    deleting ===
                                                    product._id
                                                }
                                                onClick={() =>
                                                    void handleDelete(
                                                        product._id
                                                    )
                                                }
                                                aria-label={`Delete ${product.name}`}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Modal */}
            <Dialog
                open={openModal}
                onOpenChange={(open) => {
                    setOpenModal(open);

                    if (!open) {
                        resetForm();
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing
                                ? "Edit Product"
                                : "Add Product"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Input
                            placeholder="Name"
                            value={form.name}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    name: event.target.value,
                                })
                            }
                        />

                        <Input
                            placeholder="Price"
                            type="number"
                            min="0"
                            value={form.price}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    price: event.target.value,
                                })
                            }
                        />

                        <Input
                            placeholder="Category"
                            value={form.category}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    category: event.target.value,
                                })
                            }
                        />

                        <Input
                            placeholder="Stock"
                            type="number"
                            min="0"
                            value={form.stock}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    stock: event.target.value,
                                })
                            }
                        />

                        <Input
                            placeholder="Description"
                            value={form.description}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    description:
                                        event.target.value,
                                })
                            }
                        />

                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    image:
                                        event.target.files?.[0] ||
                                        null,
                                })
                            }
                        />

                        <Button
                            onClick={() => void handleSave()}
                            className="w-full"
                            disabled={saving}
                        >
                            {saving
                                ? editing
                                    ? "Updating..."
                                    : "Creating..."
                                : editing
                                    ? "Update Product"
                                    : "Create Product"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}