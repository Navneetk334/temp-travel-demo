import React from "react";

export default function BlogLoading() {
  return (
    <div className="bg-background min-h-screen text-slate-100 py-12 px-4 sm:px-8 lg:px-12 xl:px-16 animate-pulse">
      <div className="max-w-[1750px] mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="h-10 bg-surface rounded-xl w-3/4 mx-auto" />
          <div className="h-4 bg-surface/60 rounded w-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface/40 border border-border rounded-xl overflow-hidden shadow-lg flex flex-col justify-between h-96">
              <div className="h-48 bg-surface w-full" />
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-surface/80 rounded w-1/3" />
                  <div className="h-6 bg-surface rounded w-3/4" />
                  <div className="h-4 bg-surface/60 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

