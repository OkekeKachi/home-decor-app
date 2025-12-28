"use client";

import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash, RefreshCw, Search } from "lucide-react";
import api from "@/utils/axios";
import Cookies from "js-cookie";

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [token, setToken] = useState<string | undefined>(undefined);
    const [openModal, setOpenModal] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        price: "",
        category: "",
        stock: "",
        description: "",
        image: null as File | null,
    });

    /** Fetch all products with optional filters */
    const fetchProducts = async () => {
        setLoading(true);
        const res = await api.get("/api/products", {
            params: { search, category },
        });
        setProducts(res.data.data);
        setLoading(false);
    };

    useEffect(() => {
        const token = Cookies.get("token");
        setToken(token);
        fetchProducts();
    }, [search, category]);

    /** Delete product */
    const handleDelete = async (id: string) => {
        if (!confirm("Delete this product?")) return;
        await api.delete(`/api/products/${id}`);
        fetchProducts();
    };

    /** Create or update product */
    const handleSave = async () => {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("price", form.price);
        fd.append("category", form.category);
        fd.append("stock", form.stock);
        fd.append("description", form.description);
        if (form.image) fd.append("image", form.image);

        if (editing) {
            
            const id = editing;
            
            
            // ✅ PUT to /api/products/:id (your backend update route)
            await api.put(`/api/products/${id}`, fd, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(id);
        } else {
            await api.post("/api/products", fd, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }

        // reset & refresh
        setOpenModal(false);
        setEditing(null);
        setForm({
            name: "",
            price: "",
            category: "",
            stock: "",
            description: "",
            image: null,
        });
        fetchProducts();
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Products</h1>
                <div className="flex gap-3">
                    <Button onClick={fetchProducts} variant="outline">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setForm({
                                name: "",
                                price: "",
                                category: "",
                                stock: "",
                                description: "",
                                image: null,
                            });
                            setOpenModal(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Product
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="Rug">Rug</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
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
                    {products.map((p: any) => (
                        <TableRow key={p._id}>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>${p.price}</TableCell>
                            <TableCell>{p.category}</TableCell>
                            <TableCell>{p.stock}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setEditing(p._id);
                                        setForm({
                                            name: p.name,
                                            price: p.price,
                                            category: p.category,
                                            stock: p.stock,
                                            description: p.description || "",
                                            image: null,
                                        });
                                        setOpenModal(true);
                                    }}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(p._id)}
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Add/Edit Modal */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Input
                            placeholder="Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <Input
                            placeholder="Price"
                            type="number"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                        />
                        <Input
                            placeholder="Category"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        />
                        <Input
                            placeholder="Stock"
                            type="number"
                            value={form.stock}
                            onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        />
                        <Input
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <Input
                            type="file"
                            onChange={(e) =>
                                setForm({ ...form, image: e.target.files?.[0] || null })
                            }
                        />

                        <Button onClick={handleSave} className="w-full">
                            {editing ? "Update" : "Create"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
