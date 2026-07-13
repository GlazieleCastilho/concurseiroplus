"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CSV_TEMPLATE } from "@/lib/question-import";

type PreviewResponse = {
  draft: unknown;
  valid: boolean;
  errors: string[];
  source: "csv" | "json" | "pdf";
};

type ConfirmResult = { provaId: string; titulo: string; questoesCriadas: number };

function countQuestoes(draft: unknown): { provas: number; questoes: number } {
  const provas = (draft as { provas?: unknown[] })?.provas ?? [];
  const questoes = provas.reduce((sum: number, prova) => sum + (((prova as { questoes?: unknown[] })?.questoes?.length) ?? 0), 0);
  return { provas: provas.length, questoes };
}

function safeCountFromJson(text: string): { provas: number; questoes: number } {
  try {
    return countQuestoes(JSON.parse(text));
  } catch {
    return { provas: 0, questoes: 0 };
  }
}

export function QuestionImportManager() {
  const router = useRouter();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editableJson, setEditableJson] = useState("");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [results, setResults] = useState<ConfirmResult[] | null>(null);
  const [pdfHints, setPdfHints] = useState({ banca: "", orgao: "", cargo: "", ano: "" });
  const csvInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  async function runPreview(file: File, extraFields?: Record<string, string>) {
    setPreviewLoading(true);
    setResults(null);
    try {
      const form = new FormData();
      form.append("file", file);
      if (extraFields) {
        for (const [key, value] of Object.entries(extraFields)) {
          if (value) form.append(key, value);
        }
      }
      const response = await fetch("/api/admin/import/preview", { method: "POST", body: form });
      const data = (await response.json()) as PreviewResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Erro ao analisar arquivo");
      setPreview(data);
      setEditableJson(JSON.stringify(data.draft, null, 2));
      const { provas, questoes } = countQuestoes(data.draft);
      if (!data.valid) {
        toast.warning(`Rascunho gerado com pendencias: revise antes de salvar (${data.errors.length} problema(s)).`);
      } else {
        toast.success(`Rascunho pronto: ${provas} prova(s), ${questoes} questao(oes). Revise e confirme.`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao analisar arquivo");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function confirmImport() {
    setConfirmLoading(true);
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(editableJson);
      } catch {
        throw new Error("O JSON revisado esta invalido. Corrija a formatacao antes de salvar.");
      }
      const response = await fetch("/api/admin/import/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao importar questoes");
      setResults(data.results);
      toast.success(`Importado: ${data.results.length} prova(s) salvas no banco.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao importar questoes");
    } finally {
      setConfirmLoading(false);
    }
  }

  function downloadCsvTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-questoes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pdf">
        <TabsList>
          <TabsTrigger value="pdf">PDF oficial (com IA)</TabsTrigger>
          <TabsTrigger value="csv">CSV</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Envie o PDF oficial da prova (com gabarito, se publicado). A IA extrai o texto e monta um rascunho —
            <strong> nada e salvo automaticamente</strong>. Revise principalmente os gabaritos antes de confirmar.
            Para provas grandes (mais de ~20 a 25 questoes), envie por partes (ex: recorte o PDF em blocos) para nao
            estourar o tempo limite da IA — ou use CSV/JSON, que importam sem IA e sem esse limite.
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            <Input placeholder="Banca (ex: CESPE)" value={pdfHints.banca} onChange={(e) => setPdfHints({ ...pdfHints, banca: e.target.value })} />
            <Input placeholder="Orgao" value={pdfHints.orgao} onChange={(e) => setPdfHints({ ...pdfHints, orgao: e.target.value })} />
            <Input placeholder="Cargo" value={pdfHints.cargo} onChange={(e) => setPdfHints({ ...pdfHints, cargo: e.target.value })} />
            <Input placeholder="Ano" value={pdfHints.ano} onChange={(e) => setPdfHints({ ...pdfHints, ano: e.target.value })} />
          </div>
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) runPreview(file, pdfHints);
              event.target.value = "";
            }}
          />
          <Button variant="outline" onClick={() => pdfInputRef.current?.click()} disabled={previewLoading}>
            {previewLoading ? "Analisando PDF..." : "Selecionar PDF"}
          </Button>
        </TabsContent>

        <TabsContent value="csv" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Uma linha por questao. Baixe o modelo, preencha no Excel/Sheets e envie o .csv.
          </p>
          <Button variant="link" className="h-auto p-0" onClick={downloadCsvTemplate}>Baixar modelo .csv</Button>
          <div>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) runPreview(file);
                event.target.value = "";
              }}
            />
            <Button variant="outline" onClick={() => csvInputRef.current?.click()} disabled={previewLoading}>
              {previewLoading ? "Analisando CSV..." : "Selecionar CSV"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="json" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Envie um .json no formato <code>{"{ provas: [{ titulo, orgao, banca, cargo, ano, nivel, questoes: [...] }] }"}</code>.
          </p>
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) runPreview(file);
              event.target.value = "";
            }}
          />
          <Button variant="outline" onClick={() => jsonInputRef.current?.click()} disabled={previewLoading}>
            {previewLoading ? "Analisando JSON..." : "Selecionar JSON"}
          </Button>
        </TabsContent>
      </Tabs>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>Revisar antes de salvar</CardTitle>
            <CardDescription>
              Fonte: {preview.source.toUpperCase()}. {safeCountFromJson(editableJson).provas} prova(s), {safeCountFromJson(editableJson).questoes} questao(oes) no rascunho atual.
              {!preview.valid && " Ha pendencias de validacao listadas abaixo — corrija o JSON antes de confirmar."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {preview.errors.length > 0 && (
              <ul className="list-inside list-disc rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {preview.errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            )}
            <Label>Rascunho (edite se necessario, especialmente gabaritos)</Label>
            <Textarea
              value={editableJson}
              onChange={(event) => setEditableJson(event.target.value)}
              className="min-h-[360px] font-mono text-xs"
            />
            <Button onClick={confirmImport} disabled={confirmLoading}>
              {confirmLoading ? "Salvando..." : "Confirmar e salvar no banco"}
            </Button>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Importacao concluida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {results.map((result) => (
              <p key={result.provaId}>{result.titulo}: {result.questoesCriadas} questao(oes)</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
