"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Client, Employee, Task, FinancialRecord, TaxRecord } from "@/lib/types";
import { DEMO_CLIENTS, DEMO_EMPLOYEES, DEMO_TASKS, generateFinancialData, generateTaxData } from "@/lib/demo-data";

interface ClientFinancials {
  financialData: FinancialRecord[];
  taxData: TaxRecord[];
}

interface AppState {
  clients: Client[];
  employees: Employee[];
  tasks: Task[];
  clientFinancials: Record<string, ClientFinancials>;
  selectedClientId: string | null;
  activeSection: "escritorio" | "clientes" | "cliente-dashboard" | "tarefas";
  setSelectedClientId: (id: string | null) => void;
  setActiveSection: (s: AppState["activeSection"]) => void;
  addClient: (c: Client) => void;
  updateClientFinancials: (clientId: string, data: ClientFinancials) => void;
  addTask: (t: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  getClientFinancials: (clientId: string) => ClientFinancials;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(DEMO_CLIENTS);
  const [employees] = useState<Employee[]>(DEMO_EMPLOYEES);
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [clientFinancials, setClientFinancials] = useState<Record<string, ClientFinancials>>({});
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AppState["activeSection"]>("escritorio");

  const addClient = useCallback((c: Client) => {
    setClients((prev) => [...prev, c]);
  }, []);

  const updateClientFinancials = useCallback((clientId: string, data: ClientFinancials) => {
    setClientFinancials((prev) => ({ ...prev, [clientId]: data }));
  }, []);

  const addTask = useCallback((t: Task) => {
    setTasks((prev) => [...prev, t]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const getClientFinancials = useCallback(
    (clientId: string): ClientFinancials => {
      if (clientFinancials[clientId]) return clientFinancials[clientId];
      return {
        financialData: generateFinancialData(clientId),
        taxData: generateTaxData(clientId),
      };
    },
    [clientFinancials]
  );

  return (
    <AppContext.Provider
      value={{
        clients,
        employees,
        tasks,
        clientFinancials,
        selectedClientId,
        activeSection,
        setSelectedClientId,
        setActiveSection,
        addClient,
        updateClientFinancials,
        addTask,
        updateTask,
        getClientFinancials,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
