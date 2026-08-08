import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventoryAdjustSchema } from "@inventory/types";
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAdjustStock } from "@/hooks/useInventory";

const TYPE_LABELS = {
  STOCK_IN: "Increase stock (Stock In)",
  STOCK_OUT: "Reduce stock (Stock Out)",
  ADJUSTMENT: "Set exact quantity (Adjustment)",
};

export function StockAdjustDialog({ open, onOpenChange, product }) {
  const adjustStock = useAdjustStock();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventoryAdjustSchema),
    defaultValues: { type: "STOCK_IN", quantity: 1, reason: "" },
  });

  const onSubmit = (data) => {
    adjustStock.mutate(
      { productId: product._id, payload: data },
      {
        onSuccess: () => {
          onOpenChange(false);
          reset({ type: "STOCK_IN", quantity: 1, reason: "" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust stock — {product?.name}</DialogTitle>
          <DialogDescription>
            Current quantity: <span className="font-data font-semibold">{product?.quantity}</span> units
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Transaction type" htmlFor="type" error={errors.type?.message} required>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Quantity" htmlFor="quantity" error={errors.quantity?.message} required>
            <Input id="quantity" type="number" min="1" step="1" {...register("quantity")} />
          </FormField>

          <FormField label="Reason (optional)" htmlFor="reason" error={errors.reason?.message}>
            <Textarea id="reason" rows={2} placeholder="e.g. Order fulfillment, restock, damaged goods" {...register("reason")} />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={adjustStock.isPending}>
              {adjustStock.isPending ? "Saving..." : "Apply change"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
