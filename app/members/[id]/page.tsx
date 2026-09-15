"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Pencil, RefreshCcw, CreditCard, Trash2, MessageCircle, Receipt, Wallet } from "lucide-react";
import { useGym } from "@/lib/store";
import {
  computeMembershipDuration,
  formatCurrency,
  formatDate,
  getMembershipStatus,
  initials,
} from "@/lib/utils";
import { StatusBadge, ExpiryText } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ReminderSheet } from "@/components/ReminderSheet";
import { JazzCashSheet } from "@/components/JazzCashSheet";
import { sendWhatsApp } from "@/lib/client/messaging";
import { useToast } from "@/components/ui/Toast";
import type { Gender } from "@/lib/types";

export default function MemberDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, deleteMember, updateMemberProfile, recordPayment } = useGym();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [jazzCashOpen, setJazzCashOpen] = useState(false);
  const [sendingReceipt, setSendingReceipt] = useState(false);

  const member = state.members.find((m) => m.id === params.id);

  const { status, daysRemaining } = useMemo(
    () => (member ? getMembershipStatus(member.expiryDate) : { status: "active" as const, daysRemaining: 0 }),
    [member]
  );
  const duration = useMemo(() => (member ? computeMembershipDuration(member) : null), [member]);

  if (!member) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-[var(--gym-text-muted)]">Member not found.</p>
        <Link href="/members" className="mt-3 inline-block text-sm font-semibold text-[var(--gym-accent)]">
          Back to Members
        </Link>
      </div>
    );
  }

  const progressVariant = status === "active" ? "success" : status === "expiring" ? "warning" : "danger";

  /**
   * WhatsApps the member a receipt for their most recent payment.
   *
   * The spec calls the digital receipt the thing that "ends disputes and makes
   * the gym look professional", so it is a first-class action rather than
   * something that only fires automatically after an online payment.
   */
  const sendReceipt = async () => {
    setSendingReceipt(true);
    const result = await sendWhatsApp({
      to: member.phone,
      kind: "payment_receipt",
      reference: member.id,
      params: {
        memberName: member.name,
        gymName: state.settings.gymName,
        amount: formatCurrency(member.lastPaymentAmount),
        paymentDate: formatDate(member.lastPaymentDate),
        paymentMethod: member.lastPaymentMethod,
        plan: member.plan,
        expiryDate: formatDate(member.expiryDate),
        receiptNo: member.paymentHistory[0]?.id ?? member.id,
      },
    });
    setSendingReceipt(false);

    if (result.status === "sent" || result.status === "queued") {
      showToast(`Receipt sent to ${member.name}.`);
      return;
    }
    if (result.waLink) {
      window.open(result.waLink, "_blank", "noopener,noreferrer");
      showToast("WhatsApp opened with the receipt — tap send.");
      return;
    }
    showToast(result.error ?? "Could not send the receipt.", "error");
  };

  return (
    <div className="px-4 pb-10 pt-4 md:px-8 md:pt-6">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-semibold text-[var(--gym-text-muted)]">
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-[var(--gym-border)] bg-[var(--gym-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--gym-text)]"
        >
          <Pencil size={13} />
          Edit
        </button>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--gym-surface-2)] text-xl font-extrabold text-[var(--gym-text)]">
            {initials(member.name)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold text-[var(--gym-text)]">{member.name}</h1>
            <p className="text-sm text-[var(--gym-text-muted)]">{member.phone}</p>
            <p className="mt-0.5 text-xs text-[var(--gym-text-muted)]">Member since {formatDate(member.memberSince)}</p>
          </div>
        </div>

        <section className="mt-5 rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--gym-text-muted)]">Current Membership</h2>
            <StatusBadge status={status} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Plan" value={member.plan} />
            <InfoRow label="Start Date" value={formatDate(member.startDate)} />
            <InfoRow label="Expiry Date" value={formatDate(member.expiryDate)} />
            <InfoRow label="Days Remaining" value={status === "expired" ? "0 days" : `${daysRemaining} days`} />
          </div>
          <div className="mt-4">
            <ProgressBar progress={duration?.progress ?? 0} variant={progressVariant as "success" | "warning" | "danger"} />
            <div className="mt-1.5 flex items-center justify-between">
              <ExpiryText status={status} daysRemaining={daysRemaining} className="text-xs" />
              <span className="text-xs text-[var(--gym-text-muted)]">{formatCurrency(member.fee)}</span>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--gym-text-muted)]">Payment Information</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Last Payment" value={formatCurrency(member.lastPaymentAmount)} />
            <InfoRow label="Payment Date" value={formatDate(member.lastPaymentDate)} />
            <InfoRow label="Payment Method" value={member.lastPaymentMethod} />
            <InfoRow label="Status" value={member.paymentStatus} />
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--gym-text-muted)]">Payment History</h2>
          {member.paymentHistory.length === 0 ? (
            <p className="text-sm text-[var(--gym-text-muted)]">No payments recorded yet.</p>
          ) : (
            <div className="divide-y divide-[var(--gym-border)]">
              {member.paymentHistory.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-[var(--gym-text-muted)]">{formatDate(p.date)}</span>
                  <span className="font-bold text-[var(--gym-text)]">{formatCurrency(p.amount)}</span>
                  <span className="text-xs text-[var(--gym-text-muted)]">{p.method}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {member.notes && (
          <section className="mt-4 rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
            <h2 className="mb-1.5 text-sm font-bold uppercase tracking-wide text-[var(--gym-text-muted)]">Notes</h2>
            <p className="text-sm text-[var(--gym-text)]">{member.notes}</p>
          </section>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href={`/members/${member.id}/renew`}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--gym-accent)] py-3 text-sm font-bold text-black transition active:scale-[0.98]"
          >
            <RefreshCcw size={16} />
            Renew Membership
          </Link>
          <Link
            href={`/payments/new?member=${member.id}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-3 text-sm font-bold text-[var(--gym-text)] transition active:scale-[0.98]"
          >
            <CreditCard size={16} />
            Record Payment
          </Link>
          <button
            onClick={() => setReminderOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-3 text-sm font-bold text-[var(--gym-text)] transition active:scale-[0.98]"
          >
            <MessageCircle size={16} />
            Remind
          </button>
          <button
            onClick={() => setJazzCashOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-3 text-sm font-bold text-[var(--gym-text)] transition active:scale-[0.98]"
          >
            <Wallet size={16} />
            Collect Online
          </button>
          <button
            onClick={sendReceipt}
            disabled={sendingReceipt || member.lastPaymentAmount <= 0}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-3 text-sm font-bold text-[var(--gym-text)] transition active:scale-[0.98] disabled:opacity-40"
          >
            <Receipt size={16} />
            {sendingReceipt ? "Sending…" : "Send Receipt"}
          </button>
          <a
            href={`tel:${member.phone.replace(/\s/g, "")}`}
            onClick={() => showToast(`Calling ${member.name}...`)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-3 text-sm font-bold text-[var(--gym-text)] transition active:scale-[0.98]"
          >
            <Phone size={16} />
            Call Member
          </a>
          <button
            onClick={() => setConfirmDelete(true)}
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-[var(--gym-danger)]/40 bg-[var(--gym-danger)]/10 py-3 text-sm font-bold text-[var(--gym-danger)] transition active:scale-[0.98]"
          >
            <Trash2 size={16} />
            Delete Member
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${member.name}?`}
        description="This will remove the member from your gym records. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteMember(member.id);
          showToast(`${member.name} was removed.`);
          router.push("/members");
        }}
      />

      <EditMemberSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        member={member}
        onSave={(updates) => {
          updateMemberProfile(member.id, updates);
          showToast("Member details updated.");
          setEditOpen(false);
        }}
      />

      <ReminderSheet key={member.id} member={member} open={reminderOpen} onClose={() => setReminderOpen(false)} />

      <JazzCashSheet
        key={`jc-${member.id}`}
        member={member}
        amount={Math.max(member.fee - member.amountPaid, 0) || member.fee}
        open={jazzCashOpen}
        onClose={() => setJazzCashOpen(false)}
        onPaid={(amount, method) => recordPayment(member.id, amount, method)}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--gym-text-muted)]">{label}</p>
      <p className="font-semibold text-[var(--gym-text)]">{value}</p>
    </div>
  );
}

function EditMemberSheet({
  open,
  onClose,
  member,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  member: { name: string; phone: string; gender: Gender; dob?: string; address?: string; notes?: string };
  onSave: (updates: { name: string; phone: string; gender: Gender; dob?: string; address?: string; notes?: string }) => void;
}) {
  const [name, setName] = useState(member.name);
  const [phone, setPhone] = useState(member.phone);
  const [gender, setGender] = useState<Gender>(member.gender);
  const [notes, setNotes] = useState(member.notes ?? "");

  if (!open) return null;

  return (
    <BottomSheet open={open} onClose={onClose} title="Edit Member">
      <div className="space-y-3.5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--gym-text)]">Full Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={editInputClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--gym-text)]">Phone Number</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={editInputClass} />
        </label>
        <div className="flex gap-2">
          {(["Male", "Female", "Other"] as Gender[]).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition ${
                gender === g ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]" : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--gym-text)]">Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${editInputClass} resize-none`} />
        </label>
        <button
          onClick={() => onSave({ name, phone, gender, notes })}
          className="w-full rounded-xl bg-[var(--gym-accent)] py-3 text-sm font-bold text-black transition active:scale-[0.98]"
        >
          Save Changes
        </button>
      </div>
    </BottomSheet>
  );
}

const editInputClass =
  "w-full rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-3.5 py-2.5 text-sm text-[var(--gym-text)] outline-none focus:border-[var(--gym-accent)]";
