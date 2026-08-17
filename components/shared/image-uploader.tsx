"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Link2, CheckCircle2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = "Vehicle / Media Image",
  placeholder = "https://... or upload file from device"
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-300 block">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] font-bold text-red-400 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Main Controls Box */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
            className="hidden"
          />

          {/* Upload Button */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-lg text-xs font-extrabold transition-colors disabled:opacity-50 shrink-0"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Uploading Image...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Upload From Device</span>
              </>
            )}
          </button>

          {/* Or Paste URL Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
              <Link2 className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-slate-950 border border-white/10 rounded-lg pl-8 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
            {error}
          </div>
        )}

        {/* Image Preview Box */}
        {value && (
          <div className="flex items-center gap-3 p-2 bg-slate-950/80 border border-white/10 rounded-lg">
            <div className="w-12 h-12 relative rounded bg-slate-900 overflow-hidden border border-white/10 shrink-0 flex items-center justify-center">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <ImageIcon className="w-5 h-5 text-slate-600 absolute" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Image Active & Ready</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate">{value}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
