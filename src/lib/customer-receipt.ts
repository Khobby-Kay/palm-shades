/** Shared shape for customer-facing printable order receipts. */
export type CustomerReceiptData = {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  email?: string;
  phone?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    variant?: string | null;
  }>;
  subtotal: number;
  shipping: number;
  tax?: number;
  discount?: number;
  total: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingLines?: string[];
};
