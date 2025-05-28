// UploadRelatorio.jsx (Interface completa com filtros e abas)
import React, { useState } from "react";

export default function UploadRelatorio() {
  const [xmls, setXmls] = useState([]);
  const [modoLinha, setModoLinha] = useState(false);
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    cfop: "",
    tipoNF: "",
    ncm: "",
    codigoProduto: "",
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleUpload = (e) => {
    setXmls([...e.target.files]);
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (xmls.length === 0) {
      alert("Por favor, selecione arquivos XML antes de gerar o relatório.");
      return;
    }

    const formData = new FormData();
    xmls.forEach((file) => formData.append("xmls", file));
    formData.append("modo_linha_individual", modoLinha);
    Object.entries(filtros).forEach(([key, value]) => formData.append(key, value));

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
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Relatório de NFe</h1>

      {/* Upload de arquivos */}
      <input type="file" multiple accept=".xml" onChange={handleUpload} className="block" />

      {/* Filtros Avançados */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Data de Início</label>
          <input type="date" name="dataInicio" value={filtros.dataInicio} onChange={handleFiltroChange} />
        </div>
        <div>
          <label>Data de Fim</label>
          <input type="date" name="dataFim" value={filtros.dataFim} onChange={handleFiltroChange} />
        </div>
        <div>
          <label>CFOP</label>
          <input type="text" name="cfop" value={filtros.cfop} onChange={handleFiltroChange} />
        </div>
        <div>
          <label>Tipo NF</label>
          <select name="tipoNF" value={filtros.tipoNF} onChange={handleFiltroChange}>
            <option value="">Todos</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
          </select>
        </div>
        <div>
          <label>NCM</label>
          <input type="text" name="ncm" value={filtros.ncm} onChange={handleFiltroChange} />
        </div>
        <div>
          <label>Código do Produto</label>
          <input type="text" name="codigoProduto" value={filtros.codigoProduto} onChange={handleFiltroChange} />
        </div>
      </div>

      {/* Checkbox modo linha por item */}
      <label className="block mt-4">
        <input type="checkbox" checked={modoLinha} onChange={(e) => setModoLinha(e.target.checked)} /> Linha por item/refNFe
      </label>

      <button onClick={handleSubmit} disabled={carregando} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        {carregando ? "Gerando..." : "Gerar Relatório"}
      </button>

      {erro && <p className="text-red-600 mt-2 font-semibold">{erro}</p>}
    </div>
  );
}
