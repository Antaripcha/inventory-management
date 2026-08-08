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
import { useDeleteCategory } from "@/hooks/useCategories";

export function DeleteCategoryDialog({ open, onOpenChange, category }) {
  const deleteCategory = useDeleteCategory();

  const handleConfirm = () => {
    if (!category) return;
    deleteCategory.mutate(category._id, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{category?.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Categories that still have products assigned cannot be deleted. Reassign or remove those
            products first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={deleteCategory.isPending}>
            {deleteCategory.isPending ? "Deleting..." : "Delete category"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
