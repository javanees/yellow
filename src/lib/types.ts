export interface Client {
  id: string;
  name: string;
  cnpj: string;
  segment: string;
  responsible: string;
  status: "ativo" | "inativo";
  createdAt: string;
}

export interface FinancialRecord {
  month: string;
  receita: number;
  despesa: number;
  lucro: number;
  impostos: number;
  folhaPagamento: number;
  investimentos: number;
  emprestimos: number;
  contasReceber: number;
  contasPagar: number;
}

export interface TaxRecord {
  tipo: string;
  valor: number;
  vencimento: string;
  status: "pago" | "pendente" | "atrasado";
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  clients: string[];
  tasksCompleted: number;
  tasksCompletedLastMonth: number;
  avgTaskTime: number; // hours
  avgTaskTimeLastMonth: number;
  satisfaction: number; // 0-100
}

export interface Task {
  id: string;
  title: string;
  clientId: string;
  assigneeId: string;
  status: "pendente" | "em_progresso" | "concluida" | "atrasada";
  priority: "baixa" | "media" | "alta" | "urgente";
  dueDate: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours?: number;
  category: string;
}

export interface ClientUploadData {
  clientId: string;
  financialData: FinancialRecord[];
  taxData: TaxRecord[];
}
