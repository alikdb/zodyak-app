"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sword,
  RotateCcw,
  LogOut,
  Plus,
  Save,
  TrendingUp,
  Clock,
  Hash,
  ChevronUp,
  Trash2,
} from "lucide-react";

interface Combination {
  id: number;
  sequence: string;
  count: number;
  lastSeen: string;
  createdAt: string;
}

function SequenceBadge({ seq }: { seq: string }) {
  return (
    <span className="font-mono tracking-widest text-base font-bold">
      {seq.split("").map((ch, i) => (
        <span
          key={i}
          className={ch === "M" ? "text-amber-400" : "text-blue-400"}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [input, setInput] = useState<string[]>([]);
  const [allCombinations, setAllCombinations] = useState<Combination[]>([]);
  const [filteredCombinations, setFilteredCombinations] = useState<
    Combination[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const sequence = input.join("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/combinations");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setAllCombinations(data);
    } catch {
      showMessage("error", "Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (sequence.length === 0) {
      setFilteredCombinations(allCombinations);
    } else {
      setFilteredCombinations(
        allCombinations.filter((c) => c.sequence.startsWith(sequence)),
      );
    }
  }, [sequence, allCombinations]);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  function addChar(ch: "M" | "K") {
    if (input.length < 5) setInput((prev) => [...prev, ch]);
  }

  function reset() {
    setInput([]);
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === "m") addChar("M");
      else if (key === "k") addChar("K");
      else if (key === "backspace") setInput((prev) => prev.slice(0, -1));
      else if (key === "escape") setInput([]);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [input.length]);

  const exactMatch =
    sequence.length === 5
      ? allCombinations.find((c) => c.sequence === sequence)
      : null;

  async function handleIncrement() {
    if (!exactMatch) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/combinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence, action: "increment" }),
      });
      if (res.ok) {
        showMessage("success", `"${sequence}" turu +1 eklendi.`);
        await fetchAll();
        reset();
      } else {
        const d = await res.json();
        showMessage("error", d.error ?? "Hata oluştu.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreate() {
    if (sequence.length !== 5) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/combinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence, action: "create" }),
      });
      if (res.ok) {
        showMessage("success", `"${sequence}" yeni kombinasyon kaydedildi.`);
        await fetchAll();
        reset();
      } else {
        const d = await res.json();
        showMessage("error", d.error ?? "Hata oluştu.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id: number, seq: string) {
    if (!confirm(`"${seq}" kombinasyonunu silmek istiyor musunuz?`)) return;
    try {
      const res = await fetch(`/api/combinations/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMessage("success", `"${seq}" silindi.`);
        await fetchAll();
      }
    } catch {
      showMessage("error", "Silme başarısız.");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const totalRuns = allCombinations.reduce((s, c) => s + c.count, 0);
  const topCombo = allCombinations[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Sword className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h1 className="text-amber-400 font-bold text-sm tracking-wide leading-none">
                ZODYAK TAPINAĞI
              </h1>
              <p className="text-slate-500 text-xs">Kombinasyon Takip</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Hash className="w-3.5 h-3.5" />
              Kombinasyon
            </div>
            <p className="text-2xl font-bold text-amber-400">
              {allCombinations.length}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Toplam Tur
            </div>
            <p className="text-2xl font-bold text-amber-400">{totalRuns}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <ChevronUp className="w-3.5 h-3.5" />
              En Çok Görülen
            </div>
            {topCombo ? (
              <SequenceBadge seq={topCombo.sequence} />
            ) : (
              <p className="text-slate-500 text-sm">—</p>
            )}
          </div>
        </div>

        {/* Input Panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
            Hızlı Giriş Paneli
          </h2>

          {/* Sequence Display */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 min-h-[52px] flex items-center gap-1.5">
              {input.length === 0 ? (
                <span className="text-slate-600 text-sm">
                  M ve K butonlarına basın...
                </span>
              ) : (
                input.map((ch, i) => (
                  <span
                    key={i}
                    className={`text-2xl font-bold font-mono leading-none ${
                      ch === "M" ? "text-amber-400" : "text-blue-400"
                    }`}
                  >
                    {ch}
                  </span>
                ))
              )}
              {Array.from({ length: 5 - input.length }).map((_, i) => (
                <span
                  key={i}
                  className="w-6 h-6 rounded border border-slate-700 border-dashed inline-block"
                />
              ))}
            </div>
            <button
              onClick={reset}
              title="Sıfırla"
              className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* M & K Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => addChar("M")}
              disabled={input.length >= 5}
              className="py-5 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 hover:bg-amber-500/20 hover:border-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
            >
              <span className="text-4xl font-black text-amber-400 font-mono group-hover:scale-110 inline-block transition-transform">
                M
              </span>
              <p className="text-xs text-slate-500 mt-1">Maymun</p>
              <p className="text-xs text-slate-600 mt-0.5 font-mono">[ M ]</p>
            </button>
            <button
              onClick={() => addChar("K")}
              disabled={input.length >= 5}
              className="py-5 rounded-xl bg-blue-500/10 border-2 border-blue-500/40 hover:bg-blue-500/20 hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
            >
              <span className="text-4xl font-black text-blue-400 font-mono group-hover:scale-110 inline-block transition-transform">
                K
              </span>
              <p className="text-xs text-slate-500 mt-1">Köpek</p>
              <p className="text-xs text-slate-600 mt-0.5 font-mono">[ K ]</p>
            </button>
          </div>
          <p className="text-xs text-slate-600 text-center mb-2">
            Klavye: <kbd className="bg-slate-700 text-slate-400 rounded px-1.5 py-0.5 font-mono text-xs">M</kbd> · <kbd className="bg-slate-700 text-slate-400 rounded px-1.5 py-0.5 font-mono text-xs">K</kbd> · <kbd className="bg-slate-700 text-slate-400 rounded px-1.5 py-0.5 font-mono text-xs">⌫</kbd> geri al · <kbd className="bg-slate-700 text-slate-400 rounded px-1.5 py-0.5 font-mono text-xs">Esc</kbd> sıfırla
          </p>

          {/* Action Buttons */}
          {sequence.length === 5 && (
            <div className="mt-2">
              {exactMatch ? (
                <button
                  onClick={handleIncrement}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600/20 border border-green-600/50 hover:bg-green-600/30 hover:border-green-500 text-green-400 font-semibold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {actionLoading
                    ? "Ekleniyor..."
                    : `Tur Ekle  (${exactMatch.count} → ${exactMatch.count + 1})`}
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 hover:border-amber-500 text-amber-400 font-semibold transition-all"
                >
                  <Save className="w-4 h-4" />
                  {actionLoading
                    ? "Kaydediliyor..."
                    : "Yeni Kombinasyon Olarak Kaydet"}
                </button>
              )}
            </div>
          )}

          {message && (
            <div
              className={`mt-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-900/40 border border-green-700/50 text-green-400"
                  : "bg-red-900/40 border border-red-700/50 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Live Filter Results */}
        {sequence.length > 0 && sequence.length < 5 && (
          <div className="bg-slate-800 border border-amber-500/20 rounded-xl p-4">
            <h2 className="text-xs font-medium text-amber-500/70 uppercase tracking-wider mb-3">
              &quot;{sequence}...&quot; ile başlayan kombinasyonlar (
              {filteredCombinations.length})
            </h2>
            {filteredCombinations.length === 0 ? (
              <p className="text-slate-500 text-sm">Eşleşen kombinasyon yok.</p>
            ) : (
              <div className="space-y-2">
                {filteredCombinations.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between bg-slate-900 rounded-lg px-4 py-2.5"
                  >
                    <SequenceBadge seq={c.sequence} />
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-bold text-sm">
                        {c.count}×
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Combinations Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Tüm Kombinasyonlar
            </h2>
            <span className="text-xs text-slate-500">
              {allCombinations.length} kayıt
            </span>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-center text-slate-500 text-sm">
              Yükleniyor...
            </div>
          ) : allCombinations.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-500 text-sm">
              Henüz kayıt yok. Yukarıdan kombinasyon girin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">
                      Kombinasyon
                    </th>
                    <th className="text-center px-5 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">
                      Görülme
                    </th>
                    <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">
                      Son Görülme
                    </th>
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {allCombinations.map((c, idx) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-600 text-xs w-4">
                            {idx + 1}
                          </span>
                          <SequenceBadge seq={c.sequence} />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold rounded-full px-3 py-0.5 text-xs">
                          <TrendingUp className="w-3 h-3" />
                          {c.count}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-600" />
                          {formatDate(c.lastSeen)}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          onClick={() => handleDelete(c.id, c.sequence)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
