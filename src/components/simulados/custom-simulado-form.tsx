"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ToggleGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) return <p className="text-xs text-muted-foreground">Nenhuma opcao disponivel.</p>;
  return (
    <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-md border px-3 py-1.5 text-sm ${isSelected ? "border-accent bg-accent/10" : "border-border"}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function CustomSimuladoForm({
  disciplinas,
  bancas,
  anos,
}: {
  disciplinas: string[];
  bancas: string[];
  anos: number[];
}) {
  const router = useRouter();
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<string[]>([]);
  const [selectedBancas, setSelectedBancas] = useState<string[]>([]);
  const [selectedAnos, setSelectedAnos] = useState<string[]>([]);
  const [quantidade, setQuantidade] = useState("20");
  const [loading, setLoading] = useState(false);

  const misturado = selectedDisciplinas.length === 0 && selectedBancas.length === 0 && selectedAnos.length === 0;

  async function gerar() {
    setLoading(true);
    try {
      const response = await fetch("/api/simulados/custom", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          disciplinas: selectedDisciplinas,
          bancas: selectedBancas,
          anos: selectedAnos.map(Number),
          quantidade: Number(quantidade) || 20,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao gerar simulado");
      if (data.quantidadeEncontrada < Number(quantidade)) {
        toast.warning(`Encontramos so ${data.quantidadeEncontrada} questao(oes) com esses filtros.`);
      }
      router.push(`/simulados/${data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar simulado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Montar simulado personalizado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {misturado
            ? "Sem filtros selecionados: o simulado vai misturar questoes de qualquer banca, ano e disciplina."
            : "Filtros selecionados abaixo. Deixe tudo em branco para misturar de tudo."}
        </p>
        <div className="space-y-1">
          <Label>Disciplinas</Label>
          <ToggleGroup options={disciplinas} selected={selectedDisciplinas} onToggle={(value) => setSelectedDisciplinas((current) => toggleValue(current, value))} />
        </div>
        <div className="space-y-1">
          <Label>Bancas</Label>
          <ToggleGroup options={bancas} selected={selectedBancas} onToggle={(value) => setSelectedBancas((current) => toggleValue(current, value))} />
        </div>
        <div className="space-y-1">
          <Label>Anos</Label>
          <ToggleGroup
            options={anos.map(String)}
            selected={selectedAnos}
            onToggle={(value) => setSelectedAnos((current) => toggleValue(current, value))}
          />
        </div>
        <div className="max-w-[200px] space-y-1">
          <Label>Quantidade de questoes</Label>
          <Input type="number" min={5} max={120} value={quantidade} onChange={(event) => setQuantidade(event.target.value)} />
        </div>
        <Button onClick={gerar} disabled={loading}>{loading ? "Gerando..." : "Gerar simulado"}</Button>
      </CardContent>
    </Card>
  );
}
