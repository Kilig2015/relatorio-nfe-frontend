// UploadRelatorio.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function UploadRelatorio() {
  const [xmls, setXmls] = useState([]);
  const [modoLinha, setModoLinha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleUpload = (e) => {
    setXmls([...e.target.files]);
  };

  const handleSubmit = async () => {
    if (xmls.length === 0) {
      alert("Por favor, selecione arquivos XML antes de gerar o relatório.");
      return;
    }

    const formData = new FormData();
    xmls.forEach((file) => formData.append("xmls", file));
    formData.append("modo_linha_individual", modoLinha);

    try {
      setCarregando(true);
      setErro(null);

      const res = await fetch("https://relatorio-nfe-backend.onrender.com/gerar-relatorio", {
        method: "POST",
        body: formData,
        mode: "cors",
        headers: {
          Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao gerar o relatório. Código: " + res.status);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);

      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setErro("Erro de rede: não foi possível acessar o backend. Verifique a conexão ou se o backend está online.");
      } else {
        setErro("Erro ao gerar ou baixar o relatório: " + error.message);
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Relatório de NFe</h1>
      <Card>
        <CardContent className="space-y-4 p-4">
          <Input type="file" multiple onChange={handleUpload} accept=".xml" />

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={modoLinha}
              onChange={(e) => setModoLinha(e.target.checked)}
            />
            <span>Linha por item/refNFe</span>
          </label>

          <Button onClick={handleSubmit} disabled={carregando}>
            {carregando ? "Gerando..." : "Gerar Relatório"}
          </Button>

          {erro && <p className="text-red-600 font-semibold">{erro}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
