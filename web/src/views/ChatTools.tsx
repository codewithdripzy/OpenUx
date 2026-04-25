"use client";
import React from "react";

export default function ChatTools({ show, onSelect }: any) {
    if (!show) return null;
    return (
        <div className="absolute right-0 top-0 mt-2 mr-2 bg-[#222] border border-white/10 rounded-lg p-1 z-50">
            <button onClick={() => onSelect("branch")} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 rounded text-white/70">Branch</button>
            <button onClick={() => onSelect("delete")} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 rounded text-red-400">Delete</button>
        </div>
    );
}
