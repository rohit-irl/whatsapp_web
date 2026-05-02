import { useMemo, useState } from "react";
import api from "../api/axios";
import { getAvatarGradient } from "../utils/mockData";

const Avatar = ({ username, photoUrl, size = 36 }) => {
  if (photoUrl) {
    return (
      <img src={photoUrl} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
    );
  }
  const [a, b] = getAvatarGradient(username);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${a}, ${b})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.35,
      }}
    >
      {username?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
};

const CreateGroupModal = ({ open, onClose, currentUser, users, onCreated }) => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const candidates = useMemo(
    () => users.filter((u) => u._id !== currentUser?._id && !u.isMock && !u.isGroup && u.username),
    [users, currentUser?._id]
  );

  const reset = () => {
    setStep(1);
    setSelected(new Set());
    setName("");
    setIcon("");
    setErr("");
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setErr("Enter a group name");
      return;
    }
    try {
      setSaving(true);
      setErr("");
      const { data } = await api.post("/groups/create", {
        name: name.trim(),
        memberIds: [...selected],
        avatar: icon || "",
        createdBy: currentUser._id,
      });
      onCreated?.(data);
      handleClose();
    } catch (e) {
      setErr(e.response?.data?.message || "Could not create group");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-xl shadow-xl"
        style={{ background: "var(--bg-sidebar)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {step === 1 ? "New group" : "Group details"}
          </span>
          <button type="button" onClick={handleClose} style={{ color: "var(--text-secondary)" }}>
            ✕
          </button>
        </div>

        {step === 1 ? (
          <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-4">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Select contacts
            </p>
            {candidates.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No contacts available
              </p>
            ) : (
              candidates.map((u) => (
                <label
                  key={u._id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2"
                  style={{ background: selected.has(u._id) ? "var(--bg-hover)" : "transparent" }}
                >
                  <input type="checkbox" checked={selected.has(u._id)} onChange={() => toggle(u._id)} />
                  <Avatar username={u.username} photoUrl={u.avatar} size={40} />
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{u.username}</span>
                </label>
              ))
            )}
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={() => setStep(2)}
              className="mt-2 rounded-lg py-2.5 font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              Next
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex flex-col items-center gap-2">
              <label className="cursor-pointer text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const r = new FileReader();
                    r.onload = () => setIcon(r.result);
                    r.readAsDataURL(f);
                    e.target.value = "";
                  }}
                />
                {icon ? (
                  <img src={icon} alt="" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div
                    className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-2xl"
                    style={{ background: "var(--bg-input)" }}
                  >
                    +
                  </div>
                )}
                <div className="mt-1 text-xs" style={{ color: "var(--accent)" }}>
                  Add icon
                </div>
              </label>
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group subject"
              className="rounded-lg border px-3 py-2 outline-none"
              style={{
                borderColor: "var(--border-subtle)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
              }}
            />
            {err ? <p className="text-sm text-red-500">{err}</p> : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border py-2 font-medium"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              >
                Back
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleCreate}
                className="flex-1 rounded-lg py-2 font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                {saving ? "…" : "Create"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateGroupModal;
