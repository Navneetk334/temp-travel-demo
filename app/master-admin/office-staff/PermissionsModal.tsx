import React, { useState, useEffect } from "react";
import { X, Check, CheckSquare, Square, ShieldCheck, Loader2 } from "lucide-react";
import Portal from "@/components/shared/portal";

const PERMISSION_MODULES = [
  {
    module: "CRM Leads",
    key: "crm",
    actions: [
      { id: "crm:view", label: "View Leads" },
      { id: "crm:edit", label: "Edit / Assign Leads" },
      { id: "crm:delete", label: "Delete Leads" }
    ]
  },
  {
    module: "Bookings",
    key: "bookings",
    actions: [
      { id: "bookings:view", label: "View Bookings" },
      { id: "bookings:create", label: "Create Bookings" },
      { id: "bookings:edit", label: "Edit Bookings" },
      { id: "bookings:cancel", label: "Cancel Bookings" }
    ]
  },
  {
    module: "Duties & Dispatch",
    key: "duties",
    actions: [
      { id: "duties:view", label: "View Duties" },
      { id: "duties:dispatch", label: "Dispatch Vehicles" },
      { id: "duties:complete", label: "Complete / End Duties" }
    ]
  },
  {
    module: "Fleet & Vehicles",
    key: "fleet",
    actions: [
      { id: "fleet:view", label: "View Fleet Roster" },
      { id: "fleet:add", label: "Add Vehicles" },
      { id: "fleet:edit", label: "Edit / Manage Vehicles" },
      { id: "fleet:delete", label: "Delete Vehicles" }
    ]
  },
  {
    module: "Drivers",
    key: "drivers",
    actions: [
      { id: "drivers:view", label: "View Drivers Roster" },
      { id: "drivers:add", label: "Add Drivers" },
      { id: "drivers:edit", label: "Edit / Manage Drivers" },
      { id: "drivers:delete", label: "Delete Drivers" }
    ]
  },
  {
    module: "Billing & Invoices",
    key: "billing",
    actions: [
      { id: "billing:view", label: "View Invoices" },
      { id: "billing:create", label: "Generate Invoices" },
      { id: "billing:edit", label: "Edit Invoices" },
      { id: "billing:delete", label: "Delete Invoices" }
    ]
  },
  {
    module: "Users & Staff",
    key: "staff",
    actions: [
      { id: "staff:view", label: "View Office Staff" },
      { id: "staff:add", label: "Add Office Staff" },
      { id: "staff:edit", label: "Edit Office Staff" },
      { id: "staff:permissions", label: "Manage Permissions" }
    ]
  }
];

export default function PermissionsModal({
  staff,
  onClose,
  onSave
}: {
  staff: any;
  onClose: () => void;
  onSave: (permissions: string[]) => Promise<void>;
}) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (staff && staff.permissions) {
      setPermissions(staff.permissions);
    } else {
      // MASTER_ADMIN gets everything by default if not set
      if (staff?.role === "MASTER_ADMIN") {
        const allPerms = PERMISSION_MODULES.flatMap(m => m.actions.map(a => a.id));
        setPermissions(allPerms);
      } else {
        setPermissions([]);
      }
    }
  }, [staff]);

  const handleToggle = (permId: string) => {
    setPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleToggleModule = (moduleKey: string) => {
    const mod = PERMISSION_MODULES.find(m => m.key === moduleKey);
    if (!mod) return;
    
    const modPerms = mod.actions.map(a => a.id);
    const hasAll = modPerms.every(p => permissions.includes(p));

    if (hasAll) {
      setPermissions(prev => prev.filter(p => !modPerms.includes(p)));
    } else {
      setPermissions(prev => Array.from(new Set([...prev, ...modPerms])));
    }
  };

  const handleToggleAll = () => {
    const allPerms = PERMISSION_MODULES.flatMap(m => m.actions.map(a => a.id));
    if (permissions.length === allPerms.length) {
      setPermissions([]);
    } else {
      setPermissions(allPerms);
    }
  };

  const save = async () => {
    setIsSaving(true);
    await onSave(permissions);
    setIsSaving(false);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-[95vw] md:w-[70vw] max-w-4xl shadow-2xl flex flex-col h-[90vh] relative text-slate-100">
          {/* Header */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="border-b border-white/10 pb-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Access Control Management
              </span>
              <h3 className="text-2xl font-black text-slate-50">
                Manage Permissions: {staff?.name}
              </h3>
            </div>
            
            <button
              onClick={handleToggleAll}
              className="text-xs font-bold px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Select / Deselect All
            </button>
          </div>

          {/* Permissions List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
            {PERMISSION_MODULES.map(mod => {
              const modPerms = mod.actions.map(a => a.id);
              const hasAll = modPerms.every(p => permissions.includes(p));
              const hasSome = modPerms.some(p => permissions.includes(p)) && !hasAll;

              return (
                <div key={mod.key} className="bg-slate-950/50 border border-white/5 rounded-2xl overflow-hidden">
                  <div 
                    className={`px-5 py-3 border-b border-white/5 flex items-center justify-between cursor-pointer transition-colors ${hasAll ? 'bg-amber-500/10' : 'hover:bg-slate-900'}`}
                    onClick={() => handleToggleModule(mod.key)}
                  >
                    <h4 className="font-bold text-slate-200">{mod.module}</h4>
                    <button className="text-slate-400 hover:text-amber-400 flex items-center gap-2 text-xs font-semibold">
                      {hasAll ? (
                        <><CheckSquare className="w-5 h-5 text-amber-500" /> All Selected</>
                      ) : hasSome ? (
                        <><div className="w-5 h-5 rounded flex items-center justify-center border-2 border-amber-500/50"><div className="w-2.5 h-2.5 bg-amber-500 rounded-sm" /></div> Partial</>
                      ) : (
                        <><Square className="w-5 h-5" /> Select All</>
                      )}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 p-5 gap-y-4 gap-x-6">
                    {mod.actions.map(action => {
                      const isSelected = permissions.includes(action.id);
                      return (
                        <label 
                          key={action.id} 
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={isSelected}
                            onChange={() => handleToggle(action.id)}
                          />
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-600 group-hover:border-amber-500/50'}`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 font-black" />}
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-amber-100' : 'text-slate-400 group-hover:text-slate-300'}`}>
                            {action.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-5 mt-5 border-t border-white/10 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={isSaving}
              className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
