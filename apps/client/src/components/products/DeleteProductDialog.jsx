import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useDeleteProduct } from "@/hooks/useProducts";

export function DeleteProductDialog({ open, onOpenChange, product }) {
  const deleteProduct = useDeleteProduct();

  const handleConfirm = () => {
    if (!product) return;
    deleteProduct.mutate(product._id, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{product?.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the product and its image. Inventory transaction history for this
            product will be preserved. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={deleteProduct.isPending}>
            {deleteProduct.isPending ? "Deleting..." : "Delete product"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
