import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  Box,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Dumbbell,
  Users,
} from "lucide-react";

function AdminEquipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [sports, setSports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedEqForIssue, setSelectedEqForIssue] = useState(null);

  // Forms
  const [addForm, setAddForm] = useState({
    sportId: "",
    itemName: "",
    category: "Gear",
    totalQuantity: 10,
    condition: "Good",
    storageLocation: "Central Sports Locker",
  });

  const [issueForm, setIssueForm] = useState({
    userId: "",
    quantityIssued: 1,
    expectedReturnDate: "",
    remarks: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eqRes, spRes, usRes] = await Promise.all([
        api.get("/sports-management/equipment"),
        api.get("/sports-management/sports"),
        api.get("/admin/users"),
      ]);

      if (eqRes.data.success) setEquipmentList(eqRes.data.data);
      if (spRes.data.success) setSports(spRes.data.data);
      if (usRes.data.success) setUsers(usRes.data.users || []);
    } catch (err) {
      console.error("Failed to load equipment:", err);
      toast.error("Could not fetch sports equipment data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/sports-management/equipment", addForm);
      if (res.data.success) {
        toast.success("Equipment item registered to inventory.");
        setIsAddModalOpen(false);
        setAddForm({
          sportId: "",
          itemName: "",
          category: "Gear",
          totalQuantity: 10,
          condition: "Good",
          storageLocation: "Central Sports Locker",
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add equipment.");
    }
  };

  const handleOpenIssue = (item) => {
    setSelectedEqForIssue(item);
    setIssueForm({
      userId: "",
      quantityIssued: 1,
      expectedReturnDate: "",
      remarks: "Checked out for practice session",
    });
    setIsIssueModalOpen(true);
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEqForIssue || !issueForm.userId) return;

    try {
      const res = await api.post("/sports-management/equipment/issue", {
        equipmentId: selectedEqForIssue.EquipmentID,
        ...issueForm,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setIsIssueModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue equipment.");
    }
  };

  const filteredEquipment = equipmentList.filter((eq) => {
    const q = search.toLowerCase();
    return (
      eq.ItemName.toLowerCase().includes(q) ||
      eq.SportName.toLowerCase().includes(q) ||
      (eq.Category && eq.Category.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader message="Auditing Sports Equipment & Gear Locker..." />
      </DashboardLayout>
    );
  }

  const totalItems = equipmentList.reduce((acc, eq) => acc + (eq.TotalQuantity || 0), 0);
  const availableItems = equipmentList.reduce((acc, eq) => acc + (eq.AvailableQuantity || 0), 0);
  const issuedItems = totalItems - availableItems;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Box className="text-orange-500" size={24} />
                <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                  Sports Equipment & Gear Management
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Track sports inventory, court gear, condition, and issue items to registered club members.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition self-start md:self-auto"
            >
              <Plus size={16} /> Register New Equipment
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-zinc-800 bg-[#121215] p-4 shadow-lg">
            <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
              Total Club Inventory
            </span>
            <div className="mt-1 text-2xl font-black text-white">{totalItems} units</div>
            <div className="text-[10px] text-zinc-500 mt-1">{equipmentList.length} distinct item types</div>
          </div>
          <div className="border border-zinc-800 bg-[#121215] p-4 shadow-lg">
            <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
              Available in Stock
            </span>
            <div className="mt-1 text-2xl font-black text-emerald-400">{availableItems} units</div>
            <div className="text-[10px] text-zinc-500 mt-1">Ready for court checkout</div>
          </div>
          <div className="border border-zinc-800 bg-[#121215] p-4 shadow-lg">
            <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
              Currently Issued
            </span>
            <div className="mt-1 text-2xl font-black text-orange-400">{issuedItems} units</div>
            <div className="text-[10px] text-zinc-500 mt-1">Checked out to athletes</div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search equipment by item name, sport arena, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121215] border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* INVENTORY TABLE */}
        <div className="border border-zinc-800 bg-[#121215] shadow-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-3.5">Equipment Item</th>
                <th className="p-3.5">Sport Arena</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Condition</th>
                <th className="p-3.5">Stock (Avail / Total)</th>
                <th className="p-3.5">Locker Location</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredEquipment.map((eq) => {
                const isOutOfStock = eq.AvailableQuantity <= 0;

                return (
                  <tr key={eq.EquipmentID} className="hover:bg-zinc-900/40 transition">
                    <td className="p-3.5 font-bold text-white">{eq.ItemName}</td>
                    <td className="p-3.5 text-orange-400 font-semibold">{eq.SportName}</td>
                    <td className="p-3.5 text-zinc-400">{eq.Category || "Gear"}</td>
                    <td className="p-3.5">
                      <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 text-[10px] font-bold uppercase">
                        {eq.Condition}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold">
                      <span className={isOutOfStock ? "text-red-400" : "text-emerald-400"}>
                        {eq.AvailableQuantity}
                      </span>
                      <span className="text-zinc-500"> / {eq.TotalQuantity}</span>
                    </td>
                    <td className="p-3.5 text-zinc-400">{eq.StorageLocation}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenIssue(eq)}
                        disabled={isOutOfStock}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                          isOutOfStock
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            : "bg-orange-600 hover:bg-orange-500 text-black"
                        }`}
                      >
                        <ArrowUpRight size={13} /> Issue to Member
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* REGISTER EQUIPMENT MODAL */}
        {isAddModalOpen && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsAddModalOpen(false)}
          >
            <div
              className="modal-content w-full max-w-md border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Box className="text-orange-500" size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Add Equipment to Inventory
                  </h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddEquipment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wilson US Open Tennis Balls"
                    value={addForm.itemName}
                    onChange={(e) => setAddForm({ ...addForm, itemName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Sport</label>
                    <select
                      required
                      value={addForm.sportId}
                      onChange={(e) => setAddForm({ ...addForm, sportId: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                    >
                      <option value="">Select sport...</option>
                      {sports.map((sp) => (
                        <option key={sp.SportID} value={sp.SportID}>
                          {sp.SportName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Category</label>
                    <select
                      value={addForm.category}
                      onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                    >
                      <option value="Balls">Balls & Shuttles</option>
                      <option value="Bats & Racquets">Bats & Racquets</option>
                      <option value="Protective Gear">Protective Gear</option>
                      <option value="Court Gear">Court Gear</option>
                      <option value="Training Aids">Training Aids</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={addForm.totalQuantity}
                      onChange={(e) => setAddForm({ ...addForm, totalQuantity: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Condition</label>
                    <select
                      value={addForm.condition}
                      onChange={(e) => setAddForm({ ...addForm, condition: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                    >
                      <option value="New">Brand New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Under Repair">Under Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Locker / Storage Location</label>
                  <input
                    type="text"
                    value={addForm.storageLocation}
                    onChange={(e) => setAddForm({ ...addForm, storageLocation: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-zinc-700 uppercase font-bold text-zinc-400 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase tracking-wider"
                  >
                    Register Gear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ISSUE EQUIPMENT MODAL */}
        {isIssueModalOpen && selectedEqForIssue && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsIssueModalOpen(false)}
          >
            <div
              className="modal-content w-full max-w-md border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-orange-500">Equipment Checkout</span>
                  <h3 className="text-sm font-bold uppercase text-white">{selectedEqForIssue.ItemName}</h3>
                </div>
                <button onClick={() => setIsIssueModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">
                    Select Member to Issue To
                  </label>
                  <select
                    required
                    value={issueForm.userId}
                    onChange={(e) => setIssueForm({ ...issueForm, userId: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                  >
                    <option value="">Choose a member athlete...</option>
                    {users.map((u) => (
                      <option key={u.UserID} value={u.UserID}>
                        {u.FullName} ({u.Email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedEqForIssue.AvailableQuantity}
                      value={issueForm.quantityIssued}
                      onChange={(e) => setIssueForm({ ...issueForm, quantityIssued: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Expected Return Date</label>
                    <input
                      type="datetime-local"
                      value={issueForm.expectedReturnDate}
                      onChange={(e) => setIssueForm({ ...issueForm, expectedReturnDate: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Remarks</label>
                  <input
                    type="text"
                    value={issueForm.remarks}
                    onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsIssueModalOpen(false)}
                    className="px-4 py-2 border border-zinc-700 uppercase font-bold text-zinc-400 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase tracking-wider"
                  >
                    Confirm Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminEquipment;

