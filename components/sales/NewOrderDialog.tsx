"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { addOrder } from "@/lib/store/slices/salesSlice";
import { Order } from "@/lib/data/demoData";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: { id: string; name: string }[];
  products: { id: string; name: string; price: number; stock: number }[];
}

export function NewOrderDialog({
  open,
  onOpenChange,
  customers,
  products,
}: NewOrderDialogProps) {
  const dispatch = useAppDispatch();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [orderItems, setOrderItems] = useState<
    Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      total: number;
    }>
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addOrderItem = () => {
    if (products.length > 0) {
      const firstProduct = products[0];
      setOrderItems([
        ...orderItems,
        {
          productId: firstProduct.id,
          productName: firstProduct.name,
          quantity: 1,
          price: firstProduct.price,
          total: firstProduct.price,
        },
      ]);
    }
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedItems = [...orderItems];
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: Math.min(updatedItems[index].quantity, product.stock),
          total: product.price * updatedItems[index].quantity,
        };
      }
    } else if (field === "quantity") {
      const quantity = Math.max(
        1,
        Math.min(Number(value), updatedItems[index].price > 0 ? 100 : 1)
      );
      updatedItems[index] = {
        ...updatedItems[index],
        quantity,
        total: updatedItems[index].price * quantity,
      };
    }
    setOrderItems(updatedItems);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedCustomer) {
      newErrors.customer = "Customer is required";
    }
    if (orderItems.length === 0) {
      newErrors.items = "At least one item is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomer);
    if (!customer) return;

    const total = orderItems.reduce((sum, item) => sum + item.total, 0);
    const orderNumber = `ORD-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

    const newOrder: Order = {
      id: crypto.randomUUID(),
      orderNumber,
      customerId: selectedCustomer,
      customerName: customer.name,
      items: orderItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      total,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addOrder(newOrder));

    // Reset form
    setSelectedCustomer("");
    setOrderItems([]);
    setErrors({});
    onOpenChange(false);
  };

  // Initialize with one item when dialog opens
  useEffect(() => {
    if (open && orderItems.length === 0 && products.length > 0) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        const firstProduct = products[0];
        setOrderItems([
          {
            productId: firstProduct.id,
            productName: firstProduct.name,
            quantity: 1,
            price: firstProduct.price,
            total: firstProduct.price,
          },
        ]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, orderItems.length, products]);

  const orderTotal = orderItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Create a new order for a customer. Add products and quantities.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="space-y-6 py-4 overflow-y-auto flex-1 pr-2">
            <div className="space-y-2">
              <Label htmlFor="customer">
                Customer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedCustomer}
                onValueChange={(value) => {
                  setSelectedCustomer(value);
                  if (errors.customer) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.customer;
                      return newErrors;
                    });
                  }
                }}
              >
                <SelectTrigger
                  className={errors.customer ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customer && (
                <p className="text-sm text-destructive">{errors.customer}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Order Items <span className="text-destructive">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOrderItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              {errors.items && (
                <p className="text-sm text-destructive">{errors.items}</p>
              )}
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Product</TableHead>
                      <TableHead className="min-w-[100px]">Price</TableHead>
                      <TableHead className="min-w-[120px]">Quantity</TableHead>
                      <TableHead className="min-w-[100px]">Total</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          No items added. Click &quot;Add Item&quot; to add
                          products.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={item.productId}
                              onValueChange={(value) =>
                                updateOrderItem(index, "productId", value)
                              }
                            >
                              <SelectTrigger className="w-full max-w-[200px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id}
                                  >
                                    {product.name} (Stock: {product.stock})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            ${item.price.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              max={
                                products.find((p) => p.id === item.productId)
                                  ?.stock || 100
                              }
                              value={item.quantity}
                              onChange={(e) =>
                                updateOrderItem(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-full max-w-[100px]"
                            />
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            ${item.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOrderItem(index)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {orderItems.length > 0 && (
                <div className="flex justify-end">
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-muted-foreground">
                      Subtotal: ${orderTotal.toFixed(2)}
                    </div>
                    <div className="text-lg font-bold">
                      Total: ${orderTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedCustomer("");
                setOrderItems([]);
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
