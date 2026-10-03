"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMXN } from "@/src/domain/sales/sale.entity";
import { ModuleHero } from "../components/ModuleHero";
import { PageShell } from "../components/layout/PageShell";
import {
  CheckoutSteps,
  LoadingBlock,
  NoSaleInProgress,
  SaleSummary,
  useSaleDraft,
} from "../components/sales/CheckoutParts";

type MethodId = "paypal" | "mercadopago" | "tarjeta";

const methods: {
  id: MethodId;
  name: string;
  description: string;
  available: boolean;
  icon: React.ReactNode;
}[] = [
  {
    id: "paypal",
    name: "PayPal",
    description: "Paga con tu saldo o tarjetas vinculadas a tu cuenta PayPal.",
    available: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinejoin="round" d="M7 20l2-14h6.5a4 4 0 010 8H10.5L9.5 20H7z" />
        <path strokeLinejoin="round" d="M10 17h1.2l.8-5h3.5" opacity=".5" />
      </svg>
    ),
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Paga con tu cuenta de Mercado Pago, saldo o meses con Mercado Crédito.",
    available: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="12" rx="9" ry="6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12.5l2.5 1.5L12 11l2.5 3L17 12.5" />
      </svg>
    ),
  },
  {
    id: "tarjeta",
    name: "Tarjeta de débito / crédito",
    description: "Visa, Mastercard o American Express. Meses sin intereses con crédito.",
    available: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5.5" width="18" height="13" />
        <path d="M3 10h18" />
        <path strokeLinecap="round" d="M7 15h4" />
      </svg>
    ),
  },
];

export function PaymentMethodPage() {
  const router = useRouter();
  const { loaded, draft } = useSaleDraft();
  const [selected, setSelected] = useState<MethodId | null>(null);

  const selectedMethod = methods.find((m) => m.id === selected);

  function choose(id: MethodId) {
    setSelected(id);
    if (id === "tarjeta") router.push("/ventas/pago/tarjeta");
  }

  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Ventas · Cobro"
          title="Elige el método de pago"
          description="Selecciona cómo se va a liquidar la venta. Esta es una versión de demostración: no se realizan cargos reales."
        >
          <CheckoutSteps current={1} />
        </ModuleHero>

        <section data-tone="alt" className="vt-section">
          <div className="section-shell qt-grid">
            {!loaded ? (
              <LoadingBlock />
            ) : !draft ? (
              <NoSaleInProgress />
            ) : (
              <>
                <div className="qf-card">
                  <div>
                    <span className="qf-group-label">Métodos disponibles</span>
                    <p className="vt-pay-total">
                      Total a pagar <strong>{formatMXN(draft.total)}</strong>
                    </p>
                  </div>

                  <div className="vt-methods" role="list">
                    {methods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        role="listitem"
                        className="vt-method"
                        data-selected={selected === m.id}
                        onClick={() => choose(m.id)}
                      >
                        <span className="vt-method-icon" aria-hidden="true">{m.icon}</span>
                        <span className="vt-method-body">
                          <span className="vt-method-name">
                            {m.name}
                            {!m.available ? <span className="vt-soon">Próximamente</span> : null}
                          </span>
                          <span className="vt-method-desc">{m.description}</span>
                        </span>
                        <span className="vt-method-arrow" aria-hidden="true">→</span>
                      </button>
                    ))}
                  </div>

                  {selectedMethod && !selectedMethod.available ? (
                    <div className="vt-notice" role="status">
                      <strong>{selectedMethod.name} aún no está disponible.</strong> La integración
                      está en desarrollo; por ahora cobra con tarjeta de débito o crédito.
                    </div>
                  ) : null}

                  <Link href="/ventas" className="btn btn-ghost vt-back">
                    <span aria-hidden="true">←</span> Volver a la venta
                  </Link>
                </div>

                <SaleSummary draft={draft} />
              </>
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
