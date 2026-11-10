import { X, Printer, Trophy, CheckCircle2, AlertCircle } from "lucide-react";

function VoucherModal({ voucher, isOpen, onClose }) {
  if (!isOpen || !voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
      onClick={onClose}
    >
      <div
        className="modal-content keep-dark w-full max-w-2xl rounded-none border border-zinc-700 bg-white text-zinc-900 shadow-2xl overflow-hidden my-6 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL CONTROL HEADER (NO PRINT) */}
        <div className="no-print flex items-center justify-between border-b border-zinc-200 bg-zinc-900 px-6 py-3 text-white">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Fee Voucher Slip Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-none bg-orange-500 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-white"
            >
              <Printer size={13} />
              Print Voucher
            </button>
            <button
              onClick={onClose}
              className="rounded-none p-1.5 text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE VOUCHER CONTENT */}
        <div className="keep-dark p-8 font-sans bg-white text-zinc-900">
          {/* HEADER */}
          <div className="flex items-start justify-between border-b-2 border-black pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-orange-500/40 bg-zinc-900 p-1">
                <img
                  src="/sports-hub-mark.svg"
                  alt="Sports Hub Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight text-black leading-none">
                  Sports Hub
                </h1>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                  Official Membership Fee Deposit Slip
                </p>
                <p className="text-[10px] text-zinc-500">
                  Main Club Boulevard, Sports Enclave · +92 300 1234567
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block border border-black bg-zinc-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-black">
                {voucher.VoucherType === "Advance"
                  ? "ADVANCE VOUCHER"
                  : voucher.VoucherType === "Admission"
                  ? "ADMISSION VOUCHER"
                  : "MONTHLY VOUCHER"}
              </div>
              <div className="mt-2 text-xs font-bold text-zinc-800">
                #{voucher.VoucherNumber}
              </div>
              <div className="text-[10px] text-zinc-500">
                Status: <span className="font-bold text-black">{voucher.VoucherStatus}</span>
              </div>
            </div>
          </div>

          {/* VOUCHER & MEMBER METADATA */}
          <div className="mt-6 grid grid-cols-2 gap-4 border border-zinc-300 p-4 bg-zinc-50 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                Member Information
              </span>
              <div className="mt-1 font-bold text-sm text-black">
                {voucher.FullName}
              </div>
              <div className="text-zinc-600">
                Member ID: <span className="font-semibold text-black">{voucher.MembershipNumber || "N/A"}</span>
              </div>
              <div className="text-zinc-600">
                Package: <span className="font-semibold text-black">{voucher.PlanName}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                Billing Cycle
              </span>
              <div className="mt-1 font-bold text-sm text-black">
                {voucher.VoucherType === "Advance" ? (
                  <span>
                    Advance Payment (
                    {voucher.advanceMonths && voucher.advanceMonths.length > 0
                      ? voucher.advanceMonths.map((m) => `${m.BillingMonth}/${m.BillingYear}`).join(", ")
                      : "Multiple Months"}
                    )
                  </span>
                ) : voucher.VoucherType === "Admission" ? (
                  <span>One-time Admission Fee</span>
                ) : (
                  <span>
                    Month {voucher.BillingMonth} / {voucher.BillingYear}
                  </span>
                )}
              </div>
              <div className="text-zinc-600">
                Due Date:{" "}
                <span className="font-bold text-red-600">
                  {new Date(voucher.DueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* FEE BREAKDOWN TABLE */}
          <table className="mt-6 w-full border-collapse border border-zinc-300 text-xs">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-300 font-bold uppercase tracking-wider text-zinc-700">
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center">Period</th>
                <th className="p-3 text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-200">
                <td className="p-3 font-semibold text-zinc-800">
                  {voucher.VoucherType === "Advance"
                    ? `Prepaid Club Membership Fee (${voucher.advanceMonths?.length || 1} Months)`
                    : voucher.VoucherType === "Admission"
                    ? "One-time Membership Admission Fee"
                    : `Monthly Sports Club Membership Fee - ${voucher.PlanName}`}
                </td>
                <td className="p-3 text-center text-zinc-600">
                  {voucher.VoucherType === "Advance"
                    ? `${voucher.advanceMonths?.length || 1} Mos`
                    : voucher.VoucherType === "Admission"
                    ? "One-time"
                    : `${voucher.BillingMonth}/${voucher.BillingYear}`}
                </td>
                <td className="p-3 text-right font-mono font-bold text-black">
                  Rs. {Number(voucher.BaseAmount).toLocaleString()}
                </td>
              </tr>

              {/* LATE FINE ROW IF OVERDUE */}
              {(voucher.daysLate > 0 || Number(voucher.FineAmount) > 0) && (
                <tr className="border-b border-zinc-200 bg-red-50 text-red-700">
                  <td className="p-3 font-semibold">
                    Late Payment Penalty ({voucher.daysLate} day{voucher.daysLate > 1 ? "s" : ""} overdue)
                  </td>
                  <td className="p-3 text-center text-xs">Overdue Fine</td>
                  <td className="p-3 text-right font-mono font-bold">
                    + Rs. {Number(voucher.calculatedFine || voucher.FineAmount).toLocaleString()}
                  </td>
                </tr>
              )}

              {/* TOTAL PAYABLE */}
              <tr className="bg-zinc-900 text-white font-bold text-sm">
                <td colSpan="2" className="p-3 text-right uppercase tracking-wider text-zinc-300">
                  Total Payable Amount:
                </td>
                <td className="p-3 text-right font-mono text-orange-400 font-extrabold text-base">
                  Rs. {Number(voucher.totalPayable || (Number(voucher.BaseAmount) + Number(voucher.FineAmount))).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* BANK DEPOSIT DETAILS */}
          <div className="mt-6 border border-zinc-300 p-4 bg-zinc-50">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 mb-2">
              Payment Instructions & Bank Account
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-500">Bank Name:</span>{" "}
                <span className="font-bold text-black">Habib Bank Limited (HBL)</span>
              </div>
              <div>
                <span className="text-zinc-500">Account Number:</span>{" "}
                <span className="font-mono font-bold text-black">0123-45678901-03</span>
              </div>
              <div>
                <span className="text-zinc-500">Account Title:</span>{" "}
                <span className="font-bold text-black">Sports Hub Management</span>
              </div>
              <div>
                <span className="text-zinc-500">Deposit Reference:</span>{" "}
                <span className="font-mono font-bold text-black">{voucher.VoucherNumber}</span>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-zinc-500 italic">
              * Note: Please make deposit via online transfer, JazzCash, EasyPaisa, or bank branch. Upload the receipt screenshot/photo in your Member Dashboard under "Upload Receipt" for instant admin approval.
            </p>
          </div>

          {/* BARCODE & SIGNATURE STAMP */}
          <div className="mt-6 pt-4 border-t border-zinc-200 flex items-center justify-between">
            <div className="font-mono text-xs tracking-widest text-zinc-400">
              ||| ||||| || ||||||| ||| |||| |||||| |||||
              <div className="text-[9px] text-zinc-500 mt-0.5">{voucher.VoucherNumber}</div>
            </div>

            <div className="text-right">
              <div className="h-10 w-28 border-b border-zinc-400" />
              <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mt-1">
                Authorized Officer
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoucherModal;
