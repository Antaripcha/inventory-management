import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@inventory/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { ImagePlus } from "lucide-react";

export function ProductFormDialog({ open, onOpenChange, product }) {
  const isEdit = !!product;
  const { data: categoriesRes } = useCategories();
  const categories = categoriesRes?.data || [];
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [preview, setPreview] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      description: "",
      quantity: 0,
      price: 0,
      supplier: "",
      barcode: "",
      lowStockThreshold: 10,
    },
  });

  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          name: product.name,
          sku: product.sku,
          category: product.category?._id || product.category,
          description: product.description || "",
          quantity: product.quantity,
          price: product.price,
          supplier: product.supplier || "",
          barcode: product.barcode || "",
          lowStockThreshold: product.lowStockThreshold ?? 10,
        });
        setPreview(product.image ? `${import.meta.env.VITE_API_URL?.replace("/api", "") || ""}${product.image}` : null);
        setImageFile(null);
      } else {
        reset({
          name: "",
          sku: "",
          category: "",
          description: "",
          quantity: 0,
          price: 0,
          supplier: "",
          barcode: "",
          lowStockThreshold: 10,
        });
        setPreview(null);
        setImageFile(null);
      }
    }
  }, [open, product, reset]);

  const onSubmit = (data) => {
    const handleDone = () => onOpenChange(false);
    const payload = imageFile ? { ...data, image: imageFile } : data;
    if (isEdit) {
      updateProduct.mutate({ id: product._id, payload }, { onSuccess: handleDone });
    } else {
      createProduct.mutate(payload, { onSuccess: handleDone });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the product details below." : "Fill in the details to add a new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="image"
              className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted text-muted-foreground hover:border-primary"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-6 w-6" />
              )}
              <input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            <p className="text-xs text-muted-foreground">
              Upload a JPEG, PNG, WEBP or GIF image. This is optional but helps identify the product at a glance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Product name" htmlFor="name" error={errors.name?.message} required>
              <Input id="name" {...register("name")} />
            </FormField>

            <FormField label="SKU" htmlFor="sku" error={errors.sku?.message} required>
              <Input id="sku" className="font-data uppercase" {...register("sku")} />
            </FormField>

            <FormField label="Category" htmlFor="category" error={errors.category?.message} required>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Supplier" htmlFor="supplier" error={errors.supplier?.message}>
              <Input id="supplier" {...register("supplier")} />
            </FormField>

            <FormField label="Quantity" htmlFor="quantity" error={errors.quantity?.message} required>
              <Input id="quantity" type="number" min="0" step="1" {...register("quantity")} />
            </FormField>

            <FormField label="Price (₹)" htmlFor="price" error={errors.price?.message} required>
              <Input id="price" type="number" min="0.01" step="0.01" {...register("price")} />
            </FormField>

            <FormField label="Low stock threshold" htmlFor="lowStockThreshold" error={errors.lowStockThreshold?.message}>
              <Input id="lowStockThreshold" type="number" min="0" step="1" {...register("lowStockThreshold")} />
            </FormField>

            <FormField label="Barcode" htmlFor="barcode" error={errors.barcode?.message}>
              <Input id="barcode" className="font-data" {...register("barcode")} />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="description" error={errors.description?.message}>
            <Textarea id="description" rows={3} {...register("description")} />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
