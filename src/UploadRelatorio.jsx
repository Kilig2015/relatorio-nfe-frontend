import React, { useState } from "react";

export default function UploadRelatorio() {
  const [xmls, setXmls] = useState([]);
  const [modoLinha, setModoLinha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleUpload = (e) => setXmls([...e.target.files]);

  const handleSubmit = async () => {
    if (xmls.length === 0) return alert("Selecione arquivos XML.");

    const formData = new FormData();
    xmls.forEach(file => formData.append("xmls", file));
    formData.append("modo_linha_individual", modoLinha);

    try {
      setCarregando(true);
      setErro(null);
      const res = await fetch("http://localhost:10000/gerar-relatorio", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio.xlsx";
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
      setErro("Erro ao gerar ou baixar o relatório.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div>
      <h1>Relatório de NFe</h1>
      <input type="file" multiple onChange={handleUpload} accept=".xml" />
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
