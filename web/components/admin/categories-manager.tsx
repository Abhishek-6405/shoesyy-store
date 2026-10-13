"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  AlertCircle,
  Package,
} from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
  createdAt: string;
}

interface CategoriesManagerProps {
  initialCategories: CategoryItem[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      image: "",
    },
  });

  const watchedName = watch("name");
  const watchedImage = watch("image");

  const openCreateModal = () => {
    reset({ name: "", slug: "", image: "" });
    setModalMode("create");
    setEditingCategory(null);
  };

  const openEditModal = (cat: CategoryItem) => {
    reset({
      name: cat.name,
      slug: cat.slug,
      image: cat.image || "",
    });
    setEditingCategory(cat);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingCategory(null);
    reset();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val, { shouldValidate: true });
    if (modalMode === "create") {
      setValue("slug", slugify(val), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CategoryInput) => {
    try {
      setIsSubmitting(true);
      const isEdit = modalMode === "edit" && editingCategory;
      const endpoint = isEdit
        ? `/api/admin/categories/${editingCategory.id}`
        : `/api/admin/categories`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to save category");
      }

      if (isEdit) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id
              ? {
                  ...c,
                  name: json.data.name,
                  slug: json.data.slug,
                  image: json.data.image,
                }
              : c
          )
        );
        success(`Category "${json.data.name}" updated successfully!`);
      } else {
        setCategories((prev) => [
          ...prev,
          {
            id: json.data.id,
            name: json.data.name,
            slug: json.data.slug,
            image: json.data.image,
            productCount: 0,
            createdAt: json.data.createdAt,
          },
        ]);
        success(`Category "${json.data.name}" created successfully!`);
      }

      closeModal();
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving category";
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsSubmitting(true);
      setDeleteErrorMessage(null);

      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        setDeleteErrorMessage(json.message || "Failed to delete category");
        return;
      }

      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      success(`Category "${categoryToDelete.name}" deleted successfully!`);
      setCategoryToDelete(null);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting category";
      setDeleteErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-zinc-900 dark:text-white">
            Categories
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Group your sneaker collections by sport, lifestyle, and performance intent.
          </p>
        </div>

        <Button variant="brand" size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-zinc-500">
                    No categories found. Click Create Category to add one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <motion.tr
                    key={cat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Thumbnail & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                          {cat.image ? (
                            <Image
                              src={cat.image}
                              alt={cat.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <FolderTree className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div className="font-bold text-xs text-zinc-900 dark:text-white">
                          {cat.name}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-500">
                      /{cat.slug}
                    </td>

                    {/* Product count */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        <Package className="w-3.5 h-3.5 text-zinc-400" />
                        {cat.productCount} shoe{cat.productCount === 1 ? "" : "s"}
                      </span>
                    </td>

                    {/* Created date */}
                    <td className="py-3.5 px-4 text-xs text-zinc-400 whitespace-nowrap">
                      {new Date(cat.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(cat)}
                          className="h-8 w-8 p-0 text-zinc-600 dark:text-zinc-300 hover:text-brand-500"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteErrorMessage(null);
                            setCategoryToDelete(cat);
                          }}
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal Dialog */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-brand-500" />
                {modalMode === "edit" ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Category Name *
                </label>
                <Input
                  placeholder="e.g. Cross Training"
                  {...register("name")}
                  onChange={handleNameChange}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => setValue("slug", slugify(watchedName || ""))}
                    className="text-[11px] font-bold text-brand-500 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-generate
                  </button>
                </div>
                <Input
                  placeholder="e.g. cross-training"
                  {...register("slug")}
                />
                {errors.slug && (
                  <p className="text-xs text-rose-500 mt-1">{errors.slug.message}</p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Header Image URL (Optional)
                </label>
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  {...register("image")}
                />
                {errors.image && (
                  <p className="text-xs text-rose-500 mt-1">{errors.image.message}</p>
                )}
                {watchedImage && (
                  <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={watchedImage}
                      alt="Category preview"
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : modalMode === "edit"
                    ? "Save Changes"
                    : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
                Delete Category?
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Are you sure you want to delete category{" "}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  &ldquo;{categoryToDelete.name}&rdquo;
                </span>
                ?
              </p>
            </div>

            {/* If there is a delete block message */}
            {deleteErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">
                  {deleteErrorMessage}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCategoryToDelete(null)}
                disabled={isSubmitting}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
