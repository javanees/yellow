"use client";

import { AppProvider, useApp } from "@/lib/context";
import OfficeDashboard from "@/components/office-dashboard";
import ClientDashboard from "@/components/client-dashboard";
import ClientsPage from "@/components/clients-page";
import TasksPage from "@/components/tasks-page";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  ClipboardList,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

function AppContent() {
  const { activeSection, setActiveSection, selectedClientId, setSelectedClientId, clients } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { key: "escritorio" as const, label: "Escritorio", icon: LayoutDashboard },
    { key: "clientes" as const, label: "Clientes", icon: Users },
    { key: "cliente-dashboard" as const, label: "Dashboard Cliente", icon: BarChart3 },
    { key: "tarefas" as const, label: "Tarefas", icon: ClipboardList },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex items-center gap-3 px-4 py-5 border-b">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Building className="h-5 w-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h2 className="font-bold text-sm truncate">ContaGestao</h2>
              <p className="text-xs text-muted-foreground truncate">Escritorio Contabil</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.key;
            const isDisabled = item.key === "cliente-dashboard" && !selectedClientId;
            return (
              <Button
                key={item.key}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  sidebarCollapsed && "justify-center px-2",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isDisabled && setActiveSection(item.key)}
                disabled={isDisabled}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Quick Client Select */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Acesso Rapido</p>
            <div className="space-y-1">
              {clients.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  className={cn(
                    "w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-accent truncate transition-colors",
                    selectedClientId === c.id && "bg-accent font-medium"
                  )}
                  onClick={() => {
                    setSelectedClientId(c.id);
                    setActiveSection("cliente-dashboard");
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 max-w-[1400px] mx-auto">
            {activeSection === "escritorio" && <OfficeDashboard />}
            {activeSection === "clientes" && <ClientsPage />}
            {activeSection === "cliente-dashboard" && <ClientDashboard />}
            {activeSection === "tarefas" && <TasksPage />}
          </div>
        </ScrollArea>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
