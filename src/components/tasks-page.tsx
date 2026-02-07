"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";

const STATUS_MAP = {
  pendente: { label: "Pendente", icon: Clock, variant: "secondary" as const },
  em_progresso: { label: "Em Progresso", icon: Loader2, variant: "default" as const },
  concluida: { label: "Concluida", icon: CheckCircle2, variant: "default" as const },
  atrasada: { label: "Atrasada", icon: AlertTriangle, variant: "destructive" as const },
};

export default function TasksPage() {
  const { tasks, clients, employees, addTask, updateTask } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("todas");

  const [newTask, setNewTask] = useState({
    title: "",
    clientId: "",
    assigneeId: "",
    priority: "media" as Task["priority"],
    dueDate: "",
    estimatedHours: "",
    category: "",
  });

  const filtered = filter === "todas" ? tasks : tasks.filter((t) => t.status === filter);

  function handleAddTask() {
    if (!newTask.title || !newTask.clientId || !newTask.assigneeId) {
      toast.error("Preencha titulo, cliente e responsavel");
      return;
    }
    const task: Task = {
      id: `t${Date.now()}`,
      title: newTask.title,
      clientId: newTask.clientId,
      assigneeId: newTask.assigneeId,
      status: "pendente",
      priority: newTask.priority,
      dueDate: newTask.dueDate || new Date().toISOString().split("T")[0],
      estimatedHours: Number(newTask.estimatedHours) || 4,
      category: newTask.category || "Geral",
    };
    addTask(task);
    setNewTask({ title: "", clientId: "", assigneeId: "", priority: "media", dueDate: "", estimatedHours: "", category: "" });
    setDialogOpen(false);
    toast.success("Tarefa criada com sucesso");
  }

  function cycleStatus(task: Task) {
    const order: Task["status"][] = ["pendente", "em_progresso", "concluida"];
    const currentIdx = order.indexOf(task.status);
    const nextStatus = order[(currentIdx + 1) % order.length];
    updateTask(task.id, {
      status: nextStatus,
      ...(nextStatus === "concluida" ? { completedAt: new Date().toISOString().split("T")[0], actualHours: task.estimatedHours * 0.9 } : {}),
    });
    toast.success(`Tarefa atualizada para: ${STATUS_MAP[nextStatus].label}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground mt-1">Gerencie as tarefas do escritorio</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Tarefa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Titulo</Label>
                <Input value={newTask.title} onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))} placeholder="Ex: Fechamento mensal" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <Select value={newTask.clientId} onValueChange={(v) => setNewTask((p) => ({ ...p, clientId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Responsavel</Label>
                  <Select value={newTask.assigneeId} onValueChange={(v) => setNewTask((p) => ({ ...p, assigneeId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask((p) => ({ ...p, priority: v as Task["priority"] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prazo</Label>
                  <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask((p) => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Horas Est.</Label>
                  <Input type="number" value={newTask.estimatedHours} onChange={(e) => setNewTask((p) => ({ ...p, estimatedHours: e.target.value }))} placeholder="4" />
                </div>
              </div>
              <div>
                <Label>Categoria</Label>
                <Input value={newTask.category} onChange={(e) => setNewTask((p) => ({ ...p, category: e.target.value }))} placeholder="Ex: Escrituracao Contabil" />
              </div>
              <Button onClick={handleAddTask} className="w-full">Criar Tarefa</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["pendente", "em_progresso", "concluida", "atrasada"] as const).map((status) => {
          const { label, icon: Icon, variant } = STATUS_MAP[status];
          const count = tasks.filter((t) => t.status === status).length;
          return (
            <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter(filter === status ? "todas" : status)}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${status === "concluida" ? "text-green-500" : status === "atrasada" ? "text-red-500" : status === "em_progresso" ? "text-blue-500" : "text-yellow-500"}`} />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="text-2xl font-bold mt-1">{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filter !== "todas" && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Filtrando: {STATUS_MAP[filter as keyof typeof STATUS_MAP]?.label}</Badge>
          <Button variant="ghost" size="sm" onClick={() => setFilter("todas")}>Limpar filtro</Button>
        </div>
      )}

      {/* Tasks Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Responsavel</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acao</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((task) => {
                const client = clients.find((c) => c.id === task.clientId);
                const assignee = employees.find((e) => e.id === task.assigneeId);
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{task.title}</TableCell>
                    <TableCell>{client?.name || "-"}</TableCell>
                    <TableCell>{assignee?.name || "-"}</TableCell>
                    <TableCell className="text-sm">{task.category}</TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>
                      {task.actualHours ? `${task.actualHours}/${task.estimatedHours}h` : `${task.estimatedHours}h`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.priority === "urgente" ? "destructive" : task.priority === "alta" ? "default" : "secondary"}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_MAP[task.status].variant}>
                        {STATUS_MAP[task.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => cycleStatus(task)}>
                        Avancar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">Nenhuma tarefa encontrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
