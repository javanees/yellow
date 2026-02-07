import * as XLSX from "xlsx";
import { FinancialRecord, TaxRecord } from "./types";

export interface ParsedExcelData {
  financialData: FinancialRecord[];
  taxData: TaxRecord[];
  rawSheets: { name: string; data: Record<string, unknown>[] }[];
}

export function parseExcelFile(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const rawSheets = workbook.SheetNames.map((name) => ({
          name,
          data: XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[name]),
        }));

        const financialData = extractFinancialData(rawSheets);
        const taxData = extractTaxData(rawSheets);

        resolve({ financialData, taxData, rawSheets });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function extractFinancialData(sheets: { name: string; data: Record<string, unknown>[] }[]): FinancialRecord[] {
  // Try to find a sheet with financial-like columns
  for (const sheet of sheets) {
    if (sheet.data.length === 0) continue;
    const keys = Object.keys(sheet.data[0]).map((k) => k.toLowerCase());

    const hasMonth = keys.some((k) => k.includes("mes") || k.includes("mês") || k.includes("month") || k.includes("periodo"));
    const hasReceita = keys.some((k) => k.includes("receita") || k.includes("faturamento") || k.includes("revenue"));
    const hasDespesa = keys.some((k) => k.includes("despesa") || k.includes("custo") || k.includes("expense"));

    if (hasMonth && (hasReceita || hasDespesa)) {
      return sheet.data.map((row) => {
        const get = (patterns: string[]) => {
          for (const p of patterns) {
            const key = Object.keys(row).find((k) => k.toLowerCase().includes(p));
            if (key && row[key] != null) return Number(row[key]) || 0;
          }
          return 0;
        };
        const monthKey = Object.keys(row).find((k) => {
          const lk = k.toLowerCase();
          return lk.includes("mes") || lk.includes("mês") || lk.includes("month") || lk.includes("periodo");
        });
        const receita = get(["receita", "faturamento", "revenue"]);
        const despesa = get(["despesa", "custo", "expense"]);
        return {
          month: monthKey ? String(row[monthKey]) : "",
          receita,
          despesa,
          lucro: receita - despesa,
          impostos: get(["imposto", "tax", "tributo"]),
          folhaPagamento: get(["folha", "payroll", "salario"]),
          investimentos: get(["investimento", "investment"]),
          emprestimos: get(["emprestimo", "loan"]),
          contasReceber: get(["receber", "receivable"]),
          contasPagar: get(["pagar", "payable"]),
        };
      });
    }
  }

  // Fallback: try to interpret generic numeric data
  if (sheets.length > 0 && sheets[0].data.length > 0) {
    const sheet = sheets[0];
    const keys = Object.keys(sheet.data[0]);
    return sheet.data.slice(0, 12).map((row, i) => {
      const values = keys.map((k) => Number(row[k]) || 0).filter((v) => v > 0);
      const receita = values[0] || 0;
      const despesa = values[1] || 0;
      return {
        month: String(row[keys[0]] || `Mês ${i + 1}`),
        receita,
        despesa,
        lucro: receita - despesa,
        impostos: values[2] || 0,
        folhaPagamento: values[3] || 0,
        investimentos: values[4] || 0,
        emprestimos: values[5] || 0,
        contasReceber: values[6] || 0,
        contasPagar: values[7] || 0,
      };
    });
  }

  return [];
}

function extractTaxData(sheets: { name: string; data: Record<string, unknown>[] }[]): TaxRecord[] {
  for (const sheet of sheets) {
    if (sheet.data.length === 0) continue;
    const keys = Object.keys(sheet.data[0]).map((k) => k.toLowerCase());
    const hasTipo = keys.some((k) => k.includes("tipo") || k.includes("imposto") || k.includes("tributo") || k.includes("tax"));
    const hasValor = keys.some((k) => k.includes("valor") || k.includes("value") || k.includes("amount"));

    if (hasTipo && hasValor) {
      return sheet.data.map((row) => {
        const tipoKey = Object.keys(row).find((k) => {
          const lk = k.toLowerCase();
          return lk.includes("tipo") || lk.includes("imposto") || lk.includes("tributo") || lk.includes("tax");
        });
        const valorKey = Object.keys(row).find((k) => {
          const lk = k.toLowerCase();
          return lk.includes("valor") || lk.includes("value") || lk.includes("amount");
        });
        const statusKey = Object.keys(row).find((k) => k.toLowerCase().includes("status"));
        const vencKey = Object.keys(row).find((k) => {
          const lk = k.toLowerCase();
          return lk.includes("vencimento") || lk.includes("due") || lk.includes("data");
        });

        let status: TaxRecord["status"] = "pendente";
        if (statusKey) {
          const s = String(row[statusKey]).toLowerCase();
          if (s.includes("pago") || s.includes("paid")) status = "pago";
          else if (s.includes("atras") || s.includes("late")) status = "atrasado";
        }

        return {
          tipo: tipoKey ? String(row[tipoKey]) : "Outro",
          valor: valorKey ? Number(row[valorKey]) || 0 : 0,
          vencimento: vencKey ? String(row[vencKey]) : "",
          status,
        };
      });
    }
  }
  return [];
}
