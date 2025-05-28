import React, { useState } from "react";

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
      a.download = "relatorio_nfe.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
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
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Relatório de NFe</h1>
      <input type="file" multiple accept=".xml" onChange={handleUpload} />
      <label>
        <input type="checkbox" checked={modoLinha} onChange={(e) => setModoLinha(e.target.checked)} />
        Linha por item/refNFe
      </label>
      <button onClick={handleSubmit} disabled={carregando}>
        {carregando ? "Gerando..." : "Gerar Relatório"}
      </button>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}
