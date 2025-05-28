import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function UploadRelatorio() {
  const [xmls, setXmls] = useState([]);
  const [modoLinha, setModoLinha] = useState(false);

  const handleUpload = (e) => {
    setXmls([...e.target.files]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    xmls.forEach(file => formData.append("xmls", file));
    formData.append("modo_linha_individual", modoLinha);

    try {
      const res = await fetch("https://relatorio-nfe-backend.onrender.com/gerar-relatorio", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Erro ao gerar relatório.");
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
      alert("Erro ao gerar ou baixar o relatório.");
      console.error(error);
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

          <Button onClick={handleSubmit}>Gerar Relatório</Button>
        </CardContent>
      </Card>
    </div>
  );
}
