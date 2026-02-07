"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown, Users, FileText, Target } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function OfficeDashboard() {
  const { employees, tasks, clients } = useApp();

  const completedTasks = tasks.filter((t) => t.status === "concluida");
  const pendingTasks = tasks.filter((t) => t.status === "pendente");
  const inProgressTasks = tasks.filter((t) => t.status === "em_progresso");
  const overdueTasks = tasks.filter((t) => t.status === "atrasada");

  const totalTasks = tasks.length;
  const completionRate = Math.round((completedTasks.length / totalTasks) * 100);

  const avgActualHours = completedTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0) / (completedTasks.length || 1);
  const avgEstimatedHours = completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0) / (completedTasks.length || 1);
  const efficiency = Math.round((avgEstimatedHours / avgActualHours) * 100);

  const statusData = [
    { name: "Concluídas", value: completedTasks.length, color: "#10b981" },
    { name: "Em Progresso", value: inProgressTasks.length, color: "#3b82f6" },
    { name: "Pendentes", value: pendingTasks.length, color: "#f59e0b" },
    { name: "Atrasadas", value: overdueTasks.length, color: "#ef4444" },
  ];

  const employeePerformance = employees.map((emp) => {
    const empTasks = tasks.filter((t) => t.assigneeId === emp.id);
    const empCompleted = empTasks.filter((t) => t.status === "concluida");
    const tasksDelta = emp.tasksCompleted - emp.tasksCompletedLastMonth;
    const timeDelta = emp.avgTaskTimeLastMonth - emp.avgTaskTime;
    return {
      ...emp,
      currentTasks: empTasks.length,
      completedNow: empCompleted.length,
      tasksDelta,
      timeDelta,
      productivityScore: Math.round(
        (emp.tasksCompleted / (emp.avgTaskTime || 1)) * 10
      ),
    };
  }).sort((a, b) => b.productivityScore - a.productivityScore);

  const categoryData = tasks.reduce((acc, t) => {
    const existing = acc.find((c) => c.category === t.category);
    if (existing) {
      existing.total++;
      if (t.status === "concluida") existing.completed++;
    } else {
      acc.push({ category: t.category, total: 1, completed: t.status === "concluida" ? 1 : 0 });
    }
    return acc;
  }, [] as { category: string; total: number; completed: number }[]);

  const priorityData = [
    { name: "Urgente", value: tasks.filter((t) => t.priority === "urgente").length, color: "#ef4444" },
    { name: "Alta", value: tasks.filter((t) => t.priority === "alta").length, color: "#f59e0b" },
    { name: "Média", value: tasks.filter((t) => t.priority === "media").length, color: "#3b82f6" },
    { name: "Baixa", value: tasks.filter((t) => t.priority === "baixa").length, color: "#10b981" },
  ];

  const radarData = employees.map((emp) => ({
    name: emp.name.split(" ")[0],
    produtividade: Math.round((emp.tasksCompleted / (emp.avgTaskTime || 1)) * 10),
    velocidade: Math.round(100 - emp.avgTaskTime * 15),
    qualidade: emp.satisfaction,
    volume: Math.min(100, Math.round(emp.tasksCompleted * 1.5)),
    clientes: Math.min(100, emp.clients.length * 25),
  }));

  const monthlyTrend = [
    { month: "Set", tarefas: 32, concluidas: 28 },
    { month: "Out", tarefas: 38, concluidas: 33 },
    { month: "Nov", tarefas: 41, concluidas: 36 },
    { month: "Dez", tarefas: 45, concluidas: 40 },
    { month: "Jan", tarefas: 48, concluidas: completedTasks.length + 38 },
    { month: "Fev", tarefas: totalTasks, concluidas: completedTasks.length },
  ];

  const workloadDistribution = employees.map((emp) => ({
    name: emp.name.split(" ")[0],
    clientes: emp.clients.length,
    tarefasMes: emp.tasksCompleted,
    horasMedias: emp.avgTaskTime,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard do Escritorio</h1>
        <p className="text-muted-foreground mt-1">Visao geral de performance, equipe e produtividade</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">{completedTasks.length} concluidas este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusao</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{efficiency}%</div>
            <p className="text-xs text-muted-foreground">Estimado vs. Realizado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.filter((c) => c.status === "ativo").length}</div>
            <p className="text-xs text-muted-foreground">de {clients.length} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-red-700 dark:text-red-400">
                {overdueTasks.length} tarefa(s) atrasada(s)
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {overdueTasks.map((t) => (
                <p key={t.id} className="text-sm text-red-600 dark:text-red-400">
                  - {t.title} (vencimento: {t.dueDate})
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status das Tarefas</CardTitle>
            <CardDescription>Distribuicao atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensal</CardTitle>
            <CardDescription>Tarefas criadas vs concluidas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="tarefas" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Criadas" />
                <Area type="monotone" dataKey="concluidas" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Concluidas" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tarefas por Categoria</CardTitle>
            <CardDescription>Total e concluidas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[0, 4, 4, 0]} />
                <Bar dataKey="completed" fill="#10b981" name="Concluidas" radius={[0, 4, 4, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prioridade das Tarefas</CardTitle>
            <CardDescription>Distribuicao por nivel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Employee Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance da Equipe</CardTitle>
          <CardDescription>Ranking por produtividade com comparativo ao mes anterior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employeePerformance.map((emp, index) => (
              <div key={emp.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-sm font-semibold">
                    {emp.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{emp.name}</p>
                    <Badge variant="secondary" className="text-xs">{emp.role}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      {emp.tasksCompleted} tarefas
                      {emp.tasksDelta > 0 ? (
                        <span className="text-green-600 flex items-center"><TrendingUp className="h-3 w-3" />+{emp.tasksDelta}</span>
                      ) : emp.tasksDelta < 0 ? (
                        <span className="text-red-600 flex items-center"><TrendingDown className="h-3 w-3" />{emp.tasksDelta}</span>
                      ) : null}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {emp.avgTaskTime}h/tarefa
                      {emp.timeDelta > 0 ? (
                        <span className="text-green-600 text-xs">(-{emp.timeDelta.toFixed(1)}h)</span>
                      ) : emp.timeDelta < 0 ? (
                        <span className="text-red-600 text-xs">(+{Math.abs(emp.timeDelta).toFixed(1)}h)</span>
                      ) : null}
                    </span>
                    <span>{emp.clients.length} clientes</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{emp.productivityScore}</div>
                  <div className="text-xs text-muted-foreground">pontos</div>
                </div>
                <div className="w-24">
                  <div className="text-xs text-muted-foreground mb-1">Satisfacao</div>
                  <Progress value={emp.satisfaction} className="h-2" />
                  <div className="text-xs text-right mt-0.5">{emp.satisfaction}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Radar + Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Radar de Competencias</CardTitle>
            <CardDescription>Analise multidimensional por colaborador</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Produtividade" dataKey="produtividade" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Radar name="Velocidade" dataKey="velocidade" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Radar name="Qualidade" dataKey="qualidade" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuicao de Carga</CardTitle>
            <CardDescription>Clientes e tarefas por colaborador</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={workloadDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clientes" fill="#8b5cf6" name="Clientes" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tarefasMes" fill="#3b82f6" name="Tarefas/Mes" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
