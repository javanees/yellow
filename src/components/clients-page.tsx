"use client";

import { useState, useRef } from "react";
import { useApp } from "@/lib/context";
import { Client } from "@/lib/types";
import { parseExcelFile } from "@/lib/excel-parser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Upload, BarChart3, Search, Building2 } from "lucide-react";

export default function ClientsPage() {
  const { clients, employees, addClient, setSelectedClientId, setActiveSection, updateClientFinancials } = useApp();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadClientId, setUploadClientId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newClient, setNewClient] = useState({
    name: "",
    cnpj: "",
    segment: "",
    responsible: "",
  });

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.includes(search) ||
      c.segment.toLowerCase().includes(search.toLowerCase())
  );

  function handleAddClient() {
    if (!newClient.name || !newClient.cnpj) {
      toast.error("Nome e CNPJ sao obrigatorios");
      return;
    }
    const client: Client = {
      id: `c${Date.now()}`,
      name: newClient.name,
      cnpj: newClient.cnpj,
      segment: newClient.segment || "Geral",
      responsible: newClient.responsible || employees[0]?.id || "",
      status: "ativo",
      createdAt: new Date().toISOString().split("T")[0],
    };
    addClient(client);
    setNewClient({ name: "", cnpj: "", segment: "", responsible: "" });
    setDialogOpen(false);
    toast.success(`Cliente "${client.name}" adicionado com sucesso`);
  }

  function openDashboard(clientId: string) {
    setSelectedClientId(clientId);
    setActiveSection("cliente-dashboard");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadClientId) return;

    setUploading(true);
    try {
      const parsed = await parseExcelFile(file);
      updateClientFinancials(uploadClientId, {
        financialData: parsed.financialData,
        taxData: parsed.taxData,
      });

      const client = clients.find((c) => c.id === uploadClientId);
      toast.success(`Dados importados para "${client?.name}": ${parsed.financialData.length} registros financeiros, ${parsed.taxData.length} impostos`);

      if (parsed.rawSheets.length > 0) {
        toast.info(`Planilhas detectadas: ${parsed.rawSheets.map((s) => s.name).join(", ")}`);
      }

      setSelectedClientId(uploadClientId);
      setActiveSection("cliente-dashboard");
    } catch (err) {
      toast.error("Erro ao processar arquivo. Verifique o formato.");
    } finally {
      setUploading(false);
      setUploadClientId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function triggerUpload(clientId: string) {
    setUploadClientId(clientId);
    setTimeout(() => fileInputRef.current?.click(), 100);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus clientes e importe dados financeiros</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Nome da Empresa</Label>
                <Input value={newClient.name} onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Tech Solutions Ltda" />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input value={newClient.cnpj} onChange={(e) => setNewClient((p) => ({ ...p, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
              </div>
              <div>
                <Label>Segmento</Label>
                <Input value={newClient.segment} onChange={(e) => setNewClient((p) => ({ ...p, segment: e.target.value }))} placeholder="Ex: Tecnologia" />
              </div>
              <div>
                <Label>Responsavel</Label>
                <Select value={newClient.responsible} onValueChange={(v) => setNewClient((p) => ({ ...p, responsible: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name} - {e.role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddClient} className="w-full">Adicionar Cliente</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, CNPJ ou segmento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Badge variant="secondary">{filtered.length} cliente(s)</Badge>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((client) => {
          const resp = employees.find((e) => e.id === client.responsible);
          return (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{client.name}</CardTitle>
                      <CardDescription>{client.cnpj}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={client.status === "ativo" ? "default" : "secondary"}>
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex justify-between">
                    <span>Segmento:</span>
                    <span className="font-medium text-foreground">{client.segment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Responsavel:</span>
                    <span className="font-medium text-foreground">{resp?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desde:</span>
                    <span className="font-medium text-foreground">{client.createdAt}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => triggerUpload(client.id)} disabled={uploading}>
                    <Upload className="h-3.5 w-3.5 mr-1" /> Excel
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => openDashboard(client.id)}>
                    <BarChart3 className="h-3.5 w-3.5 mr-1" /> Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum cliente encontrado</p>
        </div>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Como importar dados via Excel</h3>
          <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
            <li>Clique em &quot;Excel&quot; no card do cliente para importar uma planilha</li>
            <li>Formatos aceitos: .xlsx, .xls, .csv</li>
            <li>O sistema detecta automaticamente colunas como: mes, receita, despesa, imposto, folha, etc.</li>
            <li>Para impostos: use colunas como tipo/imposto, valor, vencimento, status</li>
            <li>Dados importados substituem os dados de demonstracao do cliente</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
