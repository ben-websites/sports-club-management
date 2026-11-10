import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Swal from "sweetalert2";
import { X, ShieldCheck, ArrowRight, Lock, CheckCircle2, UserPlus } from "lucide-react";

function EnrollmentModal({ plan, isOpen, onClose }) {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !plan) return null;

  // IF VISITOR IS NOT LOGGED IN
  if (!isAuthenticated) {
    return (
      <div
        className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
        onClick={onClose}
      >
        <div
          className="modal-content w-full max-w-md rounded-none border border-zinc-800 bg-[#121215] p-7 text-center shadow-2xl cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-none bg-orange-500/10 text-orange-500 border border-orange-500/30">
            <Lock size={26} />
          </div>

          <h3 className="mt-4 text-xl font-black text-white">
            Authentication Required
          </h3>

          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            Please login or register to purchase a membership.
          </p>

          <div className="mt-4 border border-zinc-800 bg-zinc-900/60 p-3 text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
              Selected Package
            </div>
            <div className="text-base font-extrabold text-white">
              {plan.PlanName}
            </div>
            <div className="text-xs text-zinc-400">
              Rs. {Number(plan.MonthlyFee).toLocaleString()} / month · {plan.DurationMonths} Months
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                onClose();
                navigate("/login", { state: { returnToPlan: plan.PlanID } });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-none border border-zinc-700 bg-zinc-800 px-4 py-3 text-xs font-bold text-white transition hover:bg-zinc-700"
            >
              Login
            </button>

            <button
              onClick={() => {
                onClose();
                navigate("/register");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-orange-500 px-4 py-3 text-xs font-bold text-black transition hover:bg-white"
            >
              Sign Up
              <ArrowRight size={14} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-4 text-[11px] font-semibold text-zinc-400 hover:text-white"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    );
  }

  // IF LOGGED IN: COMPLETE ENROLLMENT APPLICATION FORM
  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "Submit Membership Application?",
      text: `Are you sure you want to apply for the ${plan.PlanName} plan at Rs. ${Number(plan.MonthlyFee).toLocaleString()} / month?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Submit Application",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    setError("");
    setSubmitting(true);

    try {
      const response = await api.post("/membership/apply", {
        planId: plan.PlanID,
        address: formData.address,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
      });

      if (response.data.success) {
        await refreshUser();
        onClose();

        await Swal.fire({
          icon: "success",
          title: "Application Submitted!",
          text: "Your membership enrollment application has been received. Your Member Dashboard is now activated while under admin review.",
          confirmButtonColor: "#f97316",
          background: "#18181b",
          color: "#ffffff",
          allowOutsideClick: true,
        });

        navigate("/user/membership");
      }
    } catch (err) {
      console.error("Application error:", err);
      setError(err.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
      onClick={onClose}
    >
      <div
        className="modal-content w-full max-w-lg rounded-none border border-zinc-800 bg-[#121215] shadow-2xl overflow-hidden my-8 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-[#16161b]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-orange-500 text-black">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-tight text-white">
                Membership Enrollment
              </h3>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Sports Hub
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-none p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* PLAN SUMMARY */}
        <div className="border-b border-zinc-800 bg-orange-500/5 px-6 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
              Selected Package
            </div>
            <div className="text-base font-black text-white">
              {plan.PlanName}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-orange-500">
              Rs. {Number(plan.MonthlyFee).toLocaleString()}
              <span className="text-xs text-zinc-400 font-normal"> / mo</span>
            </div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
              {plan.DurationMonths} Months Duration
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mx-6 mt-4 border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Applicant Name
              </label>
              <input
                type="text"
                disabled
                value={user?.fullName || ""}
                className="mt-1 w-full rounded-none border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Email Address
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ""}
                className="mt-1 w-full rounded-none border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-300 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
              Residential Address *
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your complete street address, city"
              className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                Emergency Contact Name *
              </label>
              <input
                type="text"
                required
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Full name of contact"
                className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="0300-1234567"
                className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <div className="flex items-center gap-2 text-zinc-200 font-bold">
              <CheckCircle2 size={13} className="text-orange-500" />
              Application Protocol
            </div>
            <p>
              Submitting this application immediately grants you access to your personal Member Dashboard. Official membership card and monthly vouchers will be activated following admin approval.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-none border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-6 py-2.5 text-xs font-extrabold text-black transition hover:bg-white disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Application"}
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EnrollmentModal;
