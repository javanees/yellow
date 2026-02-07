import { Client, Employee, Task, FinancialRecord, TaxRecord } from "./types";

export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: "emp1",
    name: "Ana Silva",
    role: "Contadora Sênior",
    avatar: "AS",
    clients: ["c1", "c2", "c3"],
    tasksCompleted: 47,
    tasksCompletedLastMonth: 39,
    avgTaskTime: 3.2,
    avgTaskTimeLastMonth: 4.1,
    satisfaction: 92,
  },
  {
    id: "emp2",
    name: "Carlos Mendes",
    role: "Analista Fiscal",
    avatar: "CM",
    clients: ["c2", "c4"],
    tasksCompleted: 38,
    tasksCompletedLastMonth: 35,
    avgTaskTime: 2.8,
    avgTaskTimeLastMonth: 3.0,
    satisfaction: 88,
  },
  {
    id: "emp3",
    name: "Juliana Costa",
    role: "Assistente Contábil",
    avatar: "JC",
    clients: ["c1", "c5"],
    tasksCompleted: 52,
    tasksCompletedLastMonth: 44,
    avgTaskTime: 2.1,
    avgTaskTimeLastMonth: 2.5,
    satisfaction: 95,
  },
  {
    id: "emp4",
    name: "Roberto Almeida",
    role: "Contador Pleno",
    avatar: "RA",
    clients: ["c3", "c4", "c5"],
    tasksCompleted: 41,
    tasksCompletedLastMonth: 43,
    avgTaskTime: 3.5,
    avgTaskTimeLastMonth: 3.3,
    satisfaction: 78,
  },
  {
    id: "emp5",
    name: "Fernanda Lima",
    role: "Analista de DP",
    avatar: "FL",
    clients: ["c1", "c2", "c3", "c4", "c5"],
    tasksCompleted: 61,
    tasksCompletedLastMonth: 55,
    avgTaskTime: 1.8,
    avgTaskTimeLastMonth: 2.0,
    satisfaction: 90,
  },
];

export const DEMO_CLIENTS: Client[] = [
  { id: "c1", name: "Tech Solutions Ltda", cnpj: "12.345.678/0001-90", segment: "Tecnologia", responsible: "emp1", status: "ativo", createdAt: "2024-01-15" },
  { id: "c2", name: "Restaurante Sabor & Arte", cnpj: "23.456.789/0001-01", segment: "Alimentação", responsible: "emp2", status: "ativo", createdAt: "2023-06-20" },
  { id: "c3", name: "Construções ABC S/A", cnpj: "34.567.890/0001-12", segment: "Construção", responsible: "emp1", status: "ativo", createdAt: "2023-03-10" },
  { id: "c4", name: "Clínica Saúde Plena", cnpj: "45.678.901/0001-23", segment: "Saúde", responsible: "emp4", status: "ativo", createdAt: "2024-05-01" },
  { id: "c5", name: "Loja Moda Express", cnpj: "56.789.012/0001-34", segment: "Varejo", responsible: "emp3", status: "inativo", createdAt: "2022-11-08" },
];

const CATEGORIES = [
  "Escrituração Contábil",
  "Obrigações Fiscais",
  "Folha de Pagamento",
  "Conciliação Bancária",
  "Declaração IR",
  "Balancete",
  "DCTF",
  "SPED",
  "Consultoria",
  "Planejamento Tributário",
];

export const DEMO_TASKS: Task[] = [
  { id: "t1", title: "Fechamento mensal - Tech Solutions", clientId: "c1", assigneeId: "emp1", status: "concluida", priority: "alta", dueDate: "2026-01-31", completedAt: "2026-01-29", estimatedHours: 8, actualHours: 6.5, category: "Escrituração Contábil" },
  { id: "t2", title: "DCTF Janeiro - Restaurante", clientId: "c2", assigneeId: "emp2", status: "concluida", priority: "alta", dueDate: "2026-02-15", completedAt: "2026-02-10", estimatedHours: 4, actualHours: 3.5, category: "DCTF" },
  { id: "t3", title: "Folha de pagamento Fev - ABC", clientId: "c3", assigneeId: "emp5", status: "em_progresso", priority: "alta", dueDate: "2026-02-05", estimatedHours: 6, category: "Folha de Pagamento" },
  { id: "t4", title: "Conciliação bancária - Clínica", clientId: "c4", assigneeId: "emp4", status: "pendente", priority: "media", dueDate: "2026-02-10", estimatedHours: 3, category: "Conciliação Bancária" },
  { id: "t5", title: "SPED Fiscal - Tech Solutions", clientId: "c1", assigneeId: "emp2", status: "atrasada", priority: "urgente", dueDate: "2026-01-25", estimatedHours: 5, category: "SPED" },
  { id: "t6", title: "Planejamento tributário - Moda Express", clientId: "c5", assigneeId: "emp3", status: "concluida", priority: "media", dueDate: "2026-01-20", completedAt: "2026-01-18", estimatedHours: 10, actualHours: 8, category: "Planejamento Tributário" },
  { id: "t7", title: "Balancete Dez/25 - Restaurante", clientId: "c2", assigneeId: "emp1", status: "concluida", priority: "alta", dueDate: "2026-01-15", completedAt: "2026-01-14", estimatedHours: 5, actualHours: 4.5, category: "Balancete" },
  { id: "t8", title: "Declaração IR - Construções ABC", clientId: "c3", assigneeId: "emp4", status: "pendente", priority: "alta", dueDate: "2026-03-31", estimatedHours: 12, category: "Declaração IR" },
  { id: "t9", title: "Obrigações fiscais Jan - Clínica", clientId: "c4", assigneeId: "emp2", status: "concluida", priority: "alta", dueDate: "2026-02-01", completedAt: "2026-01-30", estimatedHours: 4, actualHours: 3, category: "Obrigações Fiscais" },
  { id: "t10", title: "Consultoria fiscal - Tech Solutions", clientId: "c1", assigneeId: "emp1", status: "em_progresso", priority: "media", dueDate: "2026-02-20", estimatedHours: 6, category: "Consultoria" },
  { id: "t11", title: "Escrituração contábil Fev - Restaurante", clientId: "c2", assigneeId: "emp3", status: "pendente", priority: "alta", dueDate: "2026-02-28", estimatedHours: 7, category: "Escrituração Contábil" },
  { id: "t12", title: "Folha de pagamento Fev - Clínica", clientId: "c4", assigneeId: "emp5", status: "em_progresso", priority: "alta", dueDate: "2026-02-05", estimatedHours: 5, category: "Folha de Pagamento" },
];

export function generateFinancialData(clientId: string): FinancialRecord[] {
  const months = ["Jan/25", "Fev/25", "Mar/25", "Abr/25", "Mai/25", "Jun/25", "Jul/25", "Ago/25", "Set/25", "Out/25", "Nov/25", "Dez/25"];
  const seed = clientId.charCodeAt(1) * 1000;
  return months.map((month, i) => {
    const base = seed + i * 200;
    const receita = base + Math.round(Math.random() * 5000 + 15000);
    const despesa = Math.round(receita * (0.55 + Math.random() * 0.2));
    const impostos = Math.round(receita * (0.08 + Math.random() * 0.07));
    const folha = Math.round(receita * (0.2 + Math.random() * 0.1));
    return {
      month,
      receita,
      despesa,
      lucro: receita - despesa,
      impostos,
      folhaPagamento: folha,
      investimentos: Math.round(Math.random() * 3000 + 500),
      emprestimos: Math.round(Math.random() * 2000),
      contasReceber: Math.round(receita * (0.1 + Math.random() * 0.15)),
      contasPagar: Math.round(despesa * (0.1 + Math.random() * 0.15)),
    };
  });
}

export function generateTaxData(clientId: string): TaxRecord[] {
  const taxes = [
    { tipo: "IRPJ", base: 3500 },
    { tipo: "CSLL", base: 1800 },
    { tipo: "PIS", base: 900 },
    { tipo: "COFINS", base: 4200 },
    { tipo: "ISS", base: 1500 },
    { tipo: "ICMS", base: 5600 },
    { tipo: "INSS", base: 3200 },
    { tipo: "FGTS", base: 2400 },
  ];
  const statuses: TaxRecord["status"][] = ["pago", "pendente", "atrasado"];
  return taxes.map((t, i) => ({
    tipo: t.tipo,
    valor: t.base + Math.round(Math.random() * 1000),
    vencimento: `2026-02-${String(10 + i * 2).padStart(2, "0")}`,
    status: statuses[i % 3],
  }));
}
