
import React, { useState } from "react";

export default function UploadRelatorio() {
  const [xmls, setXmls] = useState([]);
  const [modoLinha, setModoLinha] = useState(false);
  const [erro, setErro] = useState(null);

  const handleUpload = (e) => {
    setXmls([...e.target.files]);
  };

  const handleSubmit = async () => {
    if (xmls.length === 0) {
      alert("Selecione arquivos XML.");
      return;
    }
    const formData = new FormData();
    xmls.forEach((file) => formData.append("xmls", file));
    formData.append("modo_linha_individual", modoLinha);

    try {
      const res = await fetch("http://localhost:10000/gerar-relatorio", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro ao gerar o relatório.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio.xlsx";
      a.click();
      a.remove();
    } catch (e) {
      setErro("Erro ao gerar ou baixar o relatório.");
    }
  };

  return (
    <div>
      <h1>Relatório de NFe</h1>
      <input type="file" multiple accept=".xml" onChange={handleUpload} />
      <label>
        <input
          type="checkbox"
          checked={modoLinha}
          onChange={(e) => setModoLinha(e.target.checked)}
        />
        Linha por item/refNFe
      </label>
      <button onClick={handleSubmit}>Gerar Relatório</button>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}
