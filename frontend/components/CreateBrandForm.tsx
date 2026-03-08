"use client";

import { useState } from "react";
import { useBrandStore } from "@/state/brand.store";
import { Shield, Sparkles, Palette, Mic2, Layout, Info, X, Save } from "lucide-react";

interface CreateBrandFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateBrandForm({
  onSuccess,
  onCancel,
}: CreateBrandFormProps) {
  const { createBrand, isCreatingBrand, setActiveBrand } = useBrandStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [brandStyle, setBrandStyle] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [ctaStyle, setCtaStyle] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const newBrand = await createBrand({
        name: name.trim(),
        description: description.trim() || undefined,
        brandVoice: brandVoice.trim() || undefined,
        brandStyle: brandStyle.trim() || undefined,
        brandColors: brandColors
          ? brandColors
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : undefined,
        ctaStyle: ctaStyle.trim() || undefined,
      });

      setActiveBrand(newBrand._id);

      setName("");
      setDescription("");
      setBrandVoice("");
      setBrandStyle("");
      setBrandColors("");
      setCtaStyle("");

      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initialize brand";
      setError(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl transition-all"
    >
      
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-light tracking-tight text-white">Initialize Identity</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">New Brand Registry</p>
        </div>
      </div>

      <div className="space-y-6">
        
        <div className="space-y-4">
          <div className="relative">
            <label className="mb-1.5 ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Info size={12} /> Primary Name
            </label>
            <input
              type="text"
              placeholder="e.g. Loomin Premium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-sky-500/50 transition-all"
            />
          </div>

          <div className="relative">
            <label className="mb-1.5 ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Layout size={12} /> Narrative Description
            </label>
            <textarea
              placeholder="Briefly describe the brand's mission..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-sky-500/50 transition-all resize-none"
            />
          </div>
        </div>

        
        <div className="grid gap-4 md:grid-cols-2">
          <ConfigField 
            icon={<Mic2 size={14} />} 
            label="Brand Voice" 
            placeholder="e.g. Professional, Bold" 
            value={brandVoice} 
            onChange={setBrandVoice} 
          />
          <ConfigField 
            icon={<Sparkles size={14} />} 
            label="Visual Style" 
            placeholder="e.g. Minimalist, Dark" 
            value={brandStyle} 
            onChange={setBrandStyle} 
          />
          <ConfigField 
            icon={<Palette size={14} />} 
            label="Color Hex Codes" 
            placeholder="#000000, #FFFFFF" 
            value={brandColors} 
            onChange={setBrandColors} 
          />
          <ConfigField 
            icon={<Layout size={14} />} 
            label="CTA Strategy" 
            placeholder="e.g. Direct, Conversational" 
            value={ctaStyle} 
            onChange={setCtaStyle} 
          />
        </div>
      </div>

      
      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 animate-in fade-in slide-in-from-top-1">
          <X size={14} />
          {error}
        </div>
      )}

      
      <div className="mt-10 flex items-center justify-end gap-3 border-t border-white/5 pt-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="group flex items-center gap-2 rounded-full px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all hover:text-white"
          >
            Abort
          </button>
        )}
        <button
          type="submit"
          disabled={isCreatingBrand}
          className="flex items-center gap-2 rounded-full bg-white px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          {isCreatingBrand ? (
            "Initializing..."
          ) : (
            <>
              <Save size={14} /> Register Identity
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function ConfigField({ 
  icon, 
  label, 
  placeholder, 
  value, 
  onChange 
}: { 
  icon: React.ReactNode, 
  label: string, 
  placeholder: string, 
  value: string, 
  onChange: (val: string) => void 
}) {
  return (
    <div className="space-y-2">
      <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
        {icon} {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-800 focus:outline-none focus:border-sky-500/30 transition-all"
      />
    </div>
  );
}
