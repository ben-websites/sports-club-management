import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import { Box, Plus, Pencil, Trash2, X, HandMetal, Undo2 } from "lucide-react";

const inputClass =
  "w-full border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-xs text-white outline-none focus:border-orange-500";

const approvalBadge = (status) => {
  const map = {
    Approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    Rejected: "border-red-500/40 bg-red-500/10 text-red-400",
    Pending: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  };
  return map[status] || "border-zinc-700 bg-zinc-900 text-zinc-400";
};

const emptyItem = {
  itemName: "",
  category: "General",
  totalQuantity: 1,
  condition: "Good",
  storageLocation: "",
};

function CoachEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyItem);

  const [issueOpen, setIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ equipmentId: "", userId: "", quantity: 1, expectedReturnDate: "", remarks: "" });
  const [saving, setSaving] = useState(false);

  const fetchAll = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const [eq, is, st] = await Promise.all([
        api.get("/coach/equipment"),
        api.get("/coach/equipment/issues"),
        api.get("/coach/students"),
      ]);
      setEquipment(eq.data.equipment || []);
      setIssues(is.data.issues || []);
      setStudents(st.data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(true);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyItem);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      itemName: item.ItemName,
      category: item.Category || "General",
      totalQuantity: item.TotalQuantity,
      condition: item.Condition || "Good",
      storageLocation: item.StorageLocation || "",
    });
    setFormOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/coach/equipment/${editing.EquipmentID}`, form);
      else await api.post("/coach/equipment", form);
      setFormOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    const confirm = await Swal.fire({
      title: "Delete equipment?",
      text: item.ItemName,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Delete",
      background: "#18181b",
      color: "#ffffff",
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete(`/coach/equipment/${item.EquipmentID}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const openIssue = (item) => {
    setIssueForm({ equipmentId: item.EquipmentID, userId: "", quantity: 1, expectedReturnDate: "", remarks: "" });
    setIssueOpen(true);
  };

  const submitIssue = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/coach/equipment/issue", issueForm);
      setIssueOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const returnItem = async (issue) => {
    try {
      await api.put(`/coach/equipment/return/${issue.IssueID}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="coach">
        <PageLoader message="Loading equipment register..." />
      </DashboardLayout>
    );
  }

  const approved = equipment.filter((e) => e.ApprovalStatus === "Approved");

  return (
    <DashboardLayout role="coach">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-white">
              <Box size={20} className="text-orange-500" /> Equipment & Gear
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Gear is a coach responsibility — new items are approved by the administration before issuing.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-orange-500 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
          >
            <Plus size={14} /> Add Equipment
          </button>
        </div>

        <div className="border border-zinc-800 bg-[#121215]">
          {equipment.length === 0 ? (
            <div className="p-10 text-center text-xs text-zinc-500">No equipment registered for this sport yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#16161b] text-[9.5px] uppercase tracking-[0.16em] text-zinc-400">
                  <tr>
                    <th className="px-5 py-3">Item</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Stock</th>
                    <th className="px-3 py-3">Condition</th>
                    <th className="px-3 py-3">Location</th>
                    <th className="px-3 py-3">Approval</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {equipment.map((item) => (
                    <tr key={item.EquipmentID} className="hover:bg-zinc-800/20">
                      <td className="px-5 py-3">
                        <div className="font-bold text-zinc-100">{item.ItemName}</div>
                        <div className="text-[10px] text-zinc-500">{item.OpenIssues} item(s) out</div>
                      </td>
                      <td className="px-3 py-3 text-zinc-400">{item.Category}</td>
                      <td className="px-3 py-3 font-mono text-white">
                        {item.AvailableQuantity}/{item.TotalQuantity}
                      </td>
                      <td className="px-3 py-3 text-zinc-400">{item.Condition}</td>
                      <td className="px-3 py-3 text-[10.5px] text-zinc-500">{item.StorageLocation || "-"}</td>
                      <td className="px-3 py-3">
                        <span className={`border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${approvalBadge(item.ApprovalStatus)}`}>
                          {item.ApprovalStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openIssue(item)}
                            disabled={item.ApprovalStatus !== "Approved" || item.AvailableQuantity < 1}
                            title="Issue to member"
                            className="border border-zinc-700 p-1.5 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-30"
                          >
                            <HandMetal size={12} />
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="border border-zinc-700 p-1.5 text-zinc-300 hover:border-orange-500 hover:text-white"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => remove(item)}
                            className="border border-zinc-700 p-1.5 text-zinc-300 hover:border-red-500 hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border border-zinc-800 bg-[#121215]">
          <div className="border-b border-zinc-800 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white">
            Issued Gear Log
          </div>
          {issues.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-zinc-500">Nothing has been issued yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#16161b] text-[9.5px] uppercase tracking-[0.16em] text-zinc-400">
                  <tr>
                    <th className="px-5 py-3">Item</th>
                    <th className="px-3 py-3">Member</th>
                    <th className="px-3 py-3">Qty</th>
                    <th className="px-3 py-3">Issued</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {issues.map((issue) => (
                    <tr key={issue.IssueID} className="hover:bg-zinc-800/20">
                      <td className="px-5 py-2.5 font-bold text-zinc-200">{issue.ItemName}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{issue.MemberName}</td>
                      <td className="px-3 py-2.5 text-zinc-300">{issue.QuantityIssued}</td>
                      <td className="px-3 py-2.5 text-[10.5px] text-zinc-500">
                        {new Date(issue.IssuedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            issue.ReturnDate
                              ? "border-zinc-700 bg-zinc-900 text-zinc-400"
                              : "border-orange-500/40 bg-orange-500/10 text-orange-400"
                          }`}
                        >
                          {issue.ReturnDate ? "Returned" : "Issued"}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        {!issue.ReturnDate && (
                          <button
                            onClick={() => returnItem(issue)}
                            className="inline-flex items-center gap-1 border border-zinc-700 px-2 py-1 text-[10px] font-bold uppercase text-zinc-300 hover:border-emerald-500 hover:text-emerald-400"
                          >
                            <Undo2 size={11} /> Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setFormOpen(false)}>
          <div className="w-full max-w-lg border border-zinc-700 bg-[#121215] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {editing ? "Edit Equipment" : "Add Equipment"}
              </h3>
              <button onClick={() => setFormOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitForm} className="space-y-3">
              <input
                required
                placeholder="Item name"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={form.totalQuantity}
                  onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })}
                  className={inputClass}
                />
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className={inputClass}
                >
                  {["New", "Good", "Fair", "Needs Repair"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  placeholder="Storage location"
                  value={form.storageLocation}
                  onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
                <button type="button" onClick={() => setFormOpen(false)} className="border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-orange-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : editing ? "Update & Resubmit" : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {issueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setIssueOpen(false)}>
          <div className="w-full max-w-md border border-zinc-700 bg-[#121215] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Issue Gear</h3>
              <button onClick={() => setIssueOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitIssue} className="space-y-3">
              <select
                value={issueForm.equipmentId}
                onChange={(e) => setIssueForm({ ...issueForm, equipmentId: e.target.value })}
                className={inputClass}
              >
                {approved.map((item) => (
                  <option key={item.EquipmentID} value={item.EquipmentID}>
                    {item.ItemName} ({item.AvailableQuantity} available)
                  </option>
                ))}
              </select>
              <select
                required
                value={issueForm.userId}
                onChange={(e) => setIssueForm({ ...issueForm, userId: e.target.value })}
                className={inputClass}
              >
                <option value="">Select member</option>
                {students.map((s) => (
                  <option key={s.UserID} value={s.UserID}>
                    {s.FullName}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="1"
                  value={issueForm.quantity}
                  onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="date"
                  value={issueForm.expectedReturnDate}
                  onChange={(e) => setIssueForm({ ...issueForm, expectedReturnDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <input
                placeholder="Remarks"
                value={issueForm.remarks}
                onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
                className={inputClass}
              />
              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
                <button type="button" onClick={() => setIssueOpen(false)} className="border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-orange-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-white disabled:opacity-50"
                >
                  {saving ? "Issuing..." : "Issue Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CoachEquipment;
