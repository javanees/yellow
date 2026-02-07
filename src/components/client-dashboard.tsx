"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell, AreaChart, Area, ComposedChart,
} from "recharts";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Receipt, Wallet, Building2 } from "lucide-react";

const COLORS = ["#4a8df8ff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

function fmt(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function ClientDashboard() {
  const { clients, selectedClientId, setSelectedClientId, setActiveSection, getClientFinancials, tasks, employees } = useApp();

  const client = clients.find((c) => c.id === selectedClientId);
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Selecione um cliente para ver o dashboard.</p>
        <Button onClick={() => setActiveSection("clientes")}>Ir para Clientes</Button>
      </div>
    );
  }

  const { financialData, taxData } = getClientFinancials(client.id);
  const clientTasks = tasks.filter((t) => t.clientId === client.id);
  const responsible = employees.find((e) => e.id === client.responsible);

  const totalReceita = financialData.reduce((s, r) => s + r.receita, 0);
  const totalDespesa = financialData.reduce((s, r) => s + r.despesa, 0);
  const totalLucro = totalReceita - totalDespesa;
  const totalImpostos = financialData.reduce((s, r) => s + r.impostos, 0);
  const margemLucro = totalReceita > 0 ? ((totalLucro / totalReceita) * 100).toFixed(1) : "0";

  const lastMonth = financialData[financialData.length - 1];
  const prevMonth = financialData[financialData.length - 2];
  const receitaTrend = prevMonth ? ((lastMonth.receita - prevMonth.receita) / prevMonth.receita * 100).toFixed(1) : "0";

  const taxByType = taxData.reduce((acc, t) => {
    acc.push({ tipo: t.tipo, valor: t.valor, status: t.status });
    return acc;
  }, [] as { tipo: string; valor: number; status: string }[]);

  const taxStatusData = [
    { name: "Pago", value: taxData.filter((t) => t.status === "pago").length, color: "#10b981" },
    { name: "Pendente", value: taxData.filter((t) => t.status === "pendente").length, color: "#f59e0b" },
    { name: "Atrasado", value: taxData.filter((t) => t.status === "atrasado").length, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const dre = financialData.map((r) => ({
    month: r.month,
    receita: r.receita,
    custos: r.despesa,
    lucro: r.lucro,
    margem: r.receita > 0 ? Math.round((r.lucro / r.receita) * 100) : 0,
  }));

  const cashFlow = financialData.map((r) => ({
    month: r.month,
    receber: r.contasReceber,
    pagar: r.contasPagar,
    saldo: r.contasReceber - r.contasPagar,
  }));

  const composicaoCustos = financialData.length > 0
    ? [
        { name: "Impostos", value: totalImpostos },
        { name: "Folha", value: financialData.reduce((s, r) => s + r.folhaPagamento, 0) },
        { name: "Operacional", value: totalDespesa - financialData.reduce((s, r) => s + r.folhaPagamento, 0) },
        { name: "Investimentos", value: financialData.reduce((s, r) => s + r.investimentos, 0) },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedClientId(null); setActiveSection("clientes"); }}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <Badge variant={client.status === "ativo" ? "default" : "secondary"}>{client.status}</Badge>
          </div>
          <p className="text-muted-foreground">{client.cnpj} | {client.segment} | Responsavel: {responsible?.name || "-"}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Anual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{fmt(totalReceita)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {Number(receitaTrend) >= 0 ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
              {receitaTrend}% vs mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{fmt(totalDespesa)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Liquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${totalLucro >= 0 ? "text-green-600" : "text-red-600"}`}>
              {fmt(totalLucro)}
            </div>
            <p className="text-xs text-muted-foreground">Margem: {margemLucro}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impostos</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{fmt(totalImpostos)}</div>
            <p className="text-xs text-muted-foreground">{totalReceita > 0 ? ((totalImpostos / totalReceita) * 100).toFixed(1) : 0}% da receita</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{clientTasks.length}</div>
            <p className="text-xs text-muted-foreground">{clientTasks.filter((t) => t.status === "concluida").length} concluidas</p>
          </CardContent>
        </Card>
      </div>

      {/* DRE Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>DRE Simplificado</CardTitle>
            <CardDescription>Receita, custos e lucro mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dre}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="receita" fill="#3b82f6" name="Receita" radius={[4, 4, 0, 0]} />
                <Bar dataKey="custos" fill="#ef4444" name="Custos" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} name="Lucro" />
                <Legend />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolucao da Margem de Lucro</CardTitle>
            <CardDescription>Percentual mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dre}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Area type="monotone" dataKey="margem" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Margem %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow + Cost Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa</CardTitle>
            <CardDescription>Contas a receber vs pagar</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="receber" fill="#10b981" name="A Receber" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pagar" fill="#ef4444" name="A Pagar" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composicao de Custos</CardTitle>
            <CardDescription>Distribuicao anual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={composicaoCustos} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${fmt(value)}`}>
                  {composicaoCustos.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tax Table + Tax Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Impostos e Tributos</CardTitle>
            <CardDescription>Detalhamento por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxData.map((t, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{t.tipo}</TableCell>
                    <TableCell>{fmt(t.valor)}</TableCell>
                    <TableCell>{t.vencimento}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === "pago" ? "default" : t.status === "atrasado" ? "destructive" : "secondary"}>
                        {t.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Fiscal</CardTitle>
            <CardDescription>Resumo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={taxStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {taxStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total impostos:</span>
                <span className="font-semibold">{fmt(taxData.reduce((s, t) => s + t.valor, 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pago:</span>
                <span className="font-semibold text-green-600">{fmt(taxData.filter((t) => t.status === "pago").reduce((s, t) => s + t.valor, 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pendente/Atrasado:</span>
                <span className="font-semibold text-red-600">{fmt(taxData.filter((t) => t.status !== "pago").reduce((s, t) => s + t.valor, 0))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Folha + Investimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Folha de Pagamento</CardTitle>
            <CardDescription>Evolucao mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="folhaPagamento" stroke="#ec4899" strokeWidth={2} name="Folha" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="impostos" stroke="#f59e0b" strokeWidth={2} name="Impostos" dot={{ r: 4 }} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investimentos vs Emprestimos</CardTitle>
            <CardDescription>Comparativo mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="investimentos" fill="#06b6d4" name="Investimentos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="emprestimos" fill="#f97316" name="Emprestimos" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Client Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tarefas do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          {clientTasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma tarefa registrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarefa</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Responsavel</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientTasks.map((t) => {
                  const assignee = employees.find((e) => e.id === t.assigneeId);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell>{t.category}</TableCell>
                      <TableCell>{assignee?.name || "-"}</TableCell>
                      <TableCell>{t.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={
                          t.status === "concluida" ? "default" :
                          t.status === "atrasada" ? "destructive" :
                          "secondary"
                        }>
                          {t.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          t.priority === "urgente" ? "destructive" :
                          t.priority === "alta" ? "default" :
                          "secondary"
                        }>
                          {t.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
