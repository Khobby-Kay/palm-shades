import { Smartphone, Landmark, Wallet, CreditCard } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import CopyButtonClient from "./CopyButtonClient";

interface Props {
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  currency: string;
  orderNumber: string;
}

export function PaymentInstructions({
  paymentMethod,
  paymentStatus,
  total,
  currency,
  orderNumber,
}: Props) {
  if (paymentMethod === "STRIPE" && paymentStatus === "PAID") {
    return (
      <Block
        Icon={CreditCard}
        title="Payment received"
        body="Thank you — your card payment was successful and your order is being prepared. A receipt has been emailed to you."
      />
    );
  }

  if (paymentMethod === "STRIPE") {
    return (
      <Block
        Icon={CreditCard}
        title="Confirming your payment…"
        body="We're verifying your card payment with Stripe. This usually takes a few seconds — refresh this page or check your email for confirmation."
      />
    );
  }

  if (paymentMethod === "MOOLRE" && paymentStatus === "PAID") {
    return (
      <Block
        Icon={Smartphone}
        title="Payment received"
        body="Thank you — your payment was successful. Your order is being prepared and a receipt has been emailed to you."
      />
    );
  }

  if (paymentMethod === "MOOLRE") {
    return (
      <Block
        Icon={Smartphone}
        title="Confirming your payment…"
        body="If you completed payment, this page will update shortly. You can also refresh in a minute or check your email for confirmation."
      />
    );
  }

  if (paymentMethod === "MOBILE_MONEY") {
    return (
      <Block
        Icon={Smartphone}
        title="How to pay with Mobile Money"
        body={`Dial *170# on your MTN handset (or use your provider's app) and send ${formatPrice(total, { currency })} to:`}
      >
        <DetailList
          rows={[
            { k: "Network", v: "MTN Mobile Money" },
            { k: "Number", v: "024 214 9489", copyable: true },
            { k: "Name", v: "Palm Shades" },
            { k: "Reference", v: orderNumber, copyable: true },
          ]}
        />
        <p className="mt-4 text-xs text-charcoal-light">
          We&rsquo;ll send a confirmation by SMS as soon as we receive payment
          (usually within a few minutes).
        </p>
      </Block>
    );
  }

  if (paymentMethod === "BANK_TRANSFER") {
    return (
      <Block
        Icon={Landmark}
        title="How to pay by bank transfer"
        body={`Please transfer ${formatPrice(total, { currency })} to:`}
      >
        <DetailList
          rows={[
            { k: "Bank", v: "Ecobank Ghana" },
            { k: "Account name", v: "Palm Shades Limited" },
            { k: "Account no.", v: "1441004567890", copyable: true },
            { k: "Branch", v: "Pantang–Abokobi" },
            { k: "Reference", v: orderNumber, copyable: true },
          ]}
        />
        <p className="mt-4 text-xs text-charcoal-light">
          Please include your order number as the transfer reference. We&rsquo;ll
          confirm your order as soon as the funds arrive.
        </p>
      </Block>
    );
  }

  if (paymentMethod === "CASH_ON_DELIVERY") {
    return (
      <Block
        Icon={Wallet}
        title="Pay on delivery"
        body={`Please have ${formatPrice(total, { currency })} ready in cash when our delivery rider arrives.`}
      >
        <p className="text-xs text-charcoal-light">
          A team member will call to confirm a delivery window within the next
          business day.
        </p>
      </Block>
    );
  }

  return null;
}

function Block({
  Icon,
  title,
  body,
  children,
}: {
  Icon: typeof CreditCard;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white p-7 shadow-card ring-1 ring-blush-200/60">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blush-50 text-primary-700">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-xl text-charcoal">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-charcoal-light">{body}</p>
        </div>
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

interface Row {
  k: string;
  v: string;
  copyable?: boolean;
}

function DetailList({ rows }: { rows: Row[] }) {
  return (
    <dl className="overflow-hidden rounded-2xl bg-blush-50/70">
      {rows.map((row, i) => (
        <div
          key={row.k}
          className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
            i !== 0 ? "border-t border-blush-200/60" : ""
          }`}
        >
          <dt className="text-charcoal-light">{row.k}</dt>
          <dd className="flex items-center gap-2 font-medium text-charcoal">
            {row.v}
            {row.copyable ? <CopyButtonClient value={row.v} /> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
