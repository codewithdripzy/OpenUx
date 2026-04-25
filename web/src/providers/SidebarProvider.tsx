"use client";
import React, { createContext, useContext } from "react";

const SidebarContext = createContext<any>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const canBranchNode = () => ({ allowed: true, message: "" });
    return (
        <SidebarContext.Provider value={{ canBranchNode }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}
