
export type StoreOrderItem = {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
};

export type StoreOrderDraft = {
  items: StoreOrderItem[];
  subtotal: number;
  iva: number;
  total: number;
};
