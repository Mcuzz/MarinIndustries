"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  computeSaleTotals,
  formatMXN,
  nextSaleFolio,
  validateSaleInput,
  type OrderStatus,
  type SaleInputErrors,
  type SaleItemType,
  type SalesOrder,
} from "@/src/domain/sales/sale.entity";
import {
  baseKpis,
  branches,
  catalog,
  clients,
  seedOrders,
} from "@/src/infrastructure/sales/static-sales.data";
import {
  loadCompletedOrders,
  saveSaleDraft,
} from "@/src/infrastructure/sales/sale-session.storage";
import { ModuleHero } from "../components/ModuleHero";
import { PageShell } from "../components/layout/PageShell";

const kindTone: Record<SalesOrder["kind"], string> = {
  Producto: "vt-badge--amber",
  Servicio: "vt-badge--blue",
  Mixto: "vt-badge--purple",
};

const statusTone: Record<OrderStatus, string> = {
  Completado: "vt-badge--green",
  Pendiente: "vt-badge--amber",
  Anulado: "vt-badge--red",
};

export function SalesPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [branchId, setBranchId] = useState(branches[0].id);
  const [orders, setOrders] = useState<SalesOrder[]>(seedOrders);
  const [sessionOrders, setSessionOrders] = useState<SalesOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState<string[]>([]);

  // Formulario de nueva venta
  const [clientId, setClientId] = useState("");
  const [itemType, setItemType] = useState<SaleItemType>("producto");
  const [itemId, setItemId] = useState(catalog.find((c) => c.type === "producto")!.id);
  const [quantity, setQuantity] = useState("1");
  const [errors, setErrors] = useState<SaleInputErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Ventas pagadas en esta sesión (vuelven del flujo de pago)
  useEffect(() => {
    const done = loadCompletedOrders();
    if (done.length) {
      setSessionOrders(done);
      setOrders((prev) => [...done, ...prev.filter((o) => !done.some((d) => d.id === o.id))]);
    }
  }, []);

  const branch = branches.find((b) => b.id === branchId)!;
  const itemsOfType = catalog.filter((c) => c.type === itemType);
  const item = catalog.find((c) => c.id === itemId);
  const qtyNumber = /^\d+$/.test(quantity) ? Number(quantity) : 0;
  const totals = computeSaleTotals(item?.unitPrice ?? 0, qtyNumber);

  const kpis = useMemo(() => {
    const paid = sessionOrders.filter((o) => o.status === "Completado");
    return {
      salesToday: baseKpis.salesToday + paid.reduce((s, o) => s + o.total, 0),
      finishedOrders: baseKpis.finishedOrders + paid.length,
    };
  }, [sessionOrders]);

  const visibleOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .map((o) => (cancelled.includes(o.id) ? { ...o, status: "Anulado" as const } : o))
      .filter((o) => {
      const matchesText =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.clientName.toLowerCase().includes(q) ||
        o.rfc.toLowerCase().includes(q);
      return matchesText && (!statusFilter || o.status === statusFilter);
    });
  }, [orders, cancelled, search, statusFilter]);

  function revalidate(next: { clientId?: string; itemId?: string; quantity?: string }) {
    if (!submitted) return;
    const input = { clientId, itemId, quantity, ...next };
    setErrors(validateSaleInput(input, catalog.find((c) => c.id === input.itemId)));
  }

  function changeType(type: SaleItemType) {
    setItemType(type);
    const first = catalog.find((c) => c.type === type)!;
    setItemId(first.id);
    revalidate({ itemId: first.id });
  }

  function toggleCancel(id: string) {
    setCancelled((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function exportCsv() {
    const header = ["ID", "Cliente", "RFC", "Tipo", "Total", "Estado"];
    const rows = visibleOrders.map((o) => [o.id, o.clientName, o.rfc, o.kind, o.total.toFixed(2), o.status]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-ventas-${branch.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function startNewSale() {
    setClientId("");
    setQuantity("1");
    setErrors({});
    setSubmitted(false);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    formRef.current?.querySelector<HTMLSelectElement>("#vt-client")?.focus({ preventScroll: true });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const found = validateSaleInput({ clientId, itemId, quantity }, item);
    setErrors(found);

    const firstError = (["clientId", "itemId", "quantity"] as const).find((k) => found[k]);
    if (firstError) {
      const ids = { clientId: "vt-client", itemId: "vt-item", quantity: "vt-qty" };
      document.getElementById(ids[firstError])?.focus();
      return;
    }

    const client = clients.find((c) => c.id === clientId)!;
    saveSaleDraft({
      folio: nextSaleFolio(orders),
      branch,
      client,
      item: item!,
      quantity: qtyNumber,
      ...totals,
      createdAt: new Date().toISOString(),
    });
    router.push("/ventas/pago");
  }

  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Módulo de ventas"
          title="Gestión de ventas de productos y servicios"
          description="Registra operaciones, asigna servicios o productos y gestiona la salida de inventario automática."
        >
          <div className="vt-hero-actions">
            <label className="vt-branch">
              <span>Sucursal</span>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
            <button type="button" className="btn btn-ghost" onClick={exportCsv}>
              Exportar reporte
            </button>
            <button type="button" className="btn btn-primary" onClick={startNewSale}>
              + Nueva venta
            </button>
          </div>
        </ModuleHero>

        <section data-tone="alt" className="vt-section">
          <div className="section-shell vt-stack">
            {/* KPIs */}
            <div className="vt-kpis">
              <Kpi label="Ventas de hoy" value={`${formatMXN(kpis.salesToday)}`} note="+12% respecto a ayer" tone="green" />
              <Kpi label="Órdenes finalizadas" value={String(kpis.finishedOrders)} note={`En ${branch.name}`} />
              <Kpi label="Productos despachados" value={`${baseKpis.dispatchedPieces} pzs`} note="Recetas descontadas" tone="amber" />
              <Kpi label="Servicios / proyectos" value={`${baseKpis.activeServices} activos`} note="Cotizaciones convertidas" tone="blue" />
            </div>

            <div className="vt-grid">
              {/* Tabla de órdenes */}
              <div className="qf-card vt-orders">
                <div className="vt-orders-head">
                  <h2 className="vt-h2">Registro de órdenes</h2>
                  <div className="vt-filters">
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por cliente, RFC o ID…"
                      aria-label="Buscar órdenes"
                      className="qf-input"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as "" | OrderStatus)}
                      aria-label="Filtrar por estado"
                      className="qf-input"
                    >
                      <option value="">Todos los estados</option>
                      <option value="Completado">Completado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Anulado">Anulado</option>
                    </select>
                  </div>
                </div>

                <div className="vt-table-wrap">
                  <table className="vt-table">
                    <thead>
                      <tr>
                        <th>ID venta</th>
                        <th>Cliente / empresa</th>
                        <th>Tipo</th>
                        <th className="vt-num">Total</th>
                        <th>Estado</th>
                        <th className="vt-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="vt-table-empty">
                            No hay órdenes que coincidan con la búsqueda.
                          </td>
                        </tr>
                      ) : (
                        visibleOrders.map((o) => (
                          <OrderRow
                            key={o.id}
                            order={o}
                            open={openOrder === o.id}
                            isNew={sessionOrders.some((s) => s.id === o.id)}
                            onToggle={() => setOpenOrder(openOrder === o.id ? null : o.id)}
                            onCancel={() => toggleCancel(o.id)}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Nueva venta */}
              <form ref={formRef} className="qf-card vt-form" onSubmit={handleSubmit} noValidate>
                <span className="qf-group-label">Registrar operación</span>

                <div>
                  <label htmlFor="vt-client" className="qf-label">Empresa / cliente</label>
                  <select
                    id="vt-client"
                    className="qf-input"
                    value={clientId}
                    aria-invalid={!!errors.clientId}
                    aria-describedby={errors.clientId ? "vt-client-error" : undefined}
                    onChange={(e) => {
                      setClientId(e.target.value);
                      revalidate({ clientId: e.target.value });
                    }}
                  >
                    <option value="">Seleccionar empresa registrada…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <FieldError id="vt-client-error" message={errors.clientId} />
                </div>

                <div>
                  <span className="qf-label">Tipo de ítem</span>
                  <div className="vt-toggle" role="radiogroup" aria-label="Tipo de ítem">
                    {(
                      [
                        ["producto", "Producto terminado"],
                        ["servicio", "Servicio / consultoría"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={itemType === value}
                        data-active={itemType === value}
                        onClick={() => changeType(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="vt-item" className="qf-label">Seleccionar del catálogo</label>
                  <select
                    id="vt-item"
                    className="qf-input"
                    value={itemId}
                    aria-invalid={!!errors.itemId}
                    onChange={(e) => {
                      setItemId(e.target.value);
                      revalidate({ itemId: e.target.value });
                    }}
                  >
                    {itemsOfType.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.stock !== null ? ` (Stock: ${c.stock})` : ""}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.itemId} />
                </div>

                <div className="vt-two">
                  <div>
                    <label htmlFor="vt-qty" className="qf-label">Cantidad</label>
                    <input
                      id="vt-qty"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={item?.stock ?? undefined}
                      className="qf-input"
                      value={quantity}
                      aria-invalid={!!errors.quantity}
                      aria-describedby={errors.quantity ? "vt-qty-error" : undefined}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        revalidate({ quantity: e.target.value });
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="vt-price" className="qf-label">Precio unitario</label>
                    <input
                      id="vt-price"
                      className="qf-input vt-readonly"
                      value={item ? formatMXN(item.unitPrice) : "—"}
                      readOnly
                      tabIndex={-1}
                    />
                  </div>
                </div>
                <FieldError id="vt-qty-error" message={errors.quantity} />

                <div className="vt-breakdown vt-breakdown--boxed">
                  <div><span>Subtotal</span><span>{formatMXN(totals.subtotal)}</span></div>
                  <div><span>IVA (16%)</span><span>{formatMXN(totals.tax)}</span></div>
                  <div className="vt-breakdown-total">
                    <span>Total a cobrar</span>
                    <span>{formatMXN(totals.total)}</span>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary qf-submit">
                  Confirmar venta
                  <span aria-hidden="true">→</span>
                </button>
                <p className="vt-hint">Al confirmar elegirás el método de pago. El stock se descuenta al aprobarse el cobro.</p>
              </form>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function Kpi({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "green" | "amber" | "blue";
}) {
  return (
    <div className="qf-card vt-kpi">
      <span className="vt-kpi-label">{label}</span>
      <p className="vt-kpi-value">{value}</p>
      <span className={`vt-kpi-note ${tone ? `vt-tone-${tone}` : ""}`}>{note}</span>
    </div>
  );
}

function OrderRow({
  order,
  open,
  isNew,
  onToggle,
  onCancel,
}: {
  order: SalesOrder;
  open: boolean;
  isNew: boolean;
  onToggle: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <tr data-cancelled={order.status === "Anulado"}>
        <td className="vt-id">
          #{order.id}
          {isNew ? <span className="vt-new">Nueva</span> : null}
        </td>
        <td>
          <div className="vt-client-name">{order.clientName}</div>
          <div className="vt-client-rfc">RFC: {order.rfc}</div>
        </td>
        <td><span className={`vt-badge ${kindTone[order.kind]}`}>{order.kind}</span></td>
        <td className="vt-num vt-strong">{formatMXN(order.total)}</td>
        <td><span className={`vt-badge ${statusTone[order.status]}`}>{order.status}</span></td>
        <td className="vt-center vt-actions">
          <button type="button" onClick={onToggle} aria-expanded={open}>
            {open ? "Ocultar" : "Ver"}
          </button>
          <button type="button" className="vt-danger" onClick={onCancel}>
            {order.status === "Anulado" ? "Restaurar" : "Anular"}
          </button>
        </td>
      </tr>
      {open ? (
        <tr className="vt-detail">
          <td colSpan={6}>
            <dl>
              <div><dt>Folio</dt><dd>#{order.id}</dd></div>
              <div><dt>Cliente</dt><dd>{order.clientName}</dd></div>
              <div><dt>Subtotal</dt><dd>{formatMXN(order.total / 1.16)}</dd></div>
              <div><dt>Pago</dt><dd>{order.paymentMethod ?? "Registrado en caja"}</dd></div>
            </dl>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="vt-error" role="alert">
      {message}
    </p>
  );
}
