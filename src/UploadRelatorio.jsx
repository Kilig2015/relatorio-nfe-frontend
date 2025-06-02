import React, { useState } from 'react';

function UploadRelatorio() {
  const [arquivos, setArquivos] = useState([]);
  const [modoIndividual, setModoIndividual] = useState(false);
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    cfop: '',
    tipoNF: '',
    ncm: '',
    codigoProduto: '',
  });
  const [linkDownload, setLinkDownload] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const isZip = files.length === 1 && files[0].name.endsWith('.zip');
    const isXml = files.every(f => f.name.endsWith('.xml'));
    if (isZip || isXml) {
      setArquivos(files);
    } else {
      alert("Selecione apenas arquivos .xml ou um arquivo .zip.");
      setArquivos([]);
    }
  };

  const enviarArquivos = async () => {
    if (arquivos.length === 0) {
      alert("Nenhum arquivo selecionado.");
      return;
    }

    setCarregando(true);
    setLinkDownload(null);

    const formData = new FormData();
    arquivos.forEach(f => formData.append('xmls', f));
    formData.append('modo_linha_individual', modoIndividual);
    Object.entries(filtros).forEach(([k, v]) => formData.append(k, v));

    try {
      const res = await fetch("https://relatorio-nfe-backend.onrender.com/gerar-relatorio", {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Erro ao gerar relatório: " + err.detail);
        return;
      }

      const json = await res.json();
      setLinkDownload(json.link);
    } catch (err) {
      alert("Erro de rede.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Gerar Relatório NFe</h2>
      <input type="file" multiple onChange={handleFiles} />
      <br />
      <label>
        <input type="checkbox" checked={modoIndividual} onChange={e => setModoIndividual(e.target.checked)} />
        &nbsp;Cada item em uma linha
      </label>
      <br />
      {["dataInicio", "dataFim", "cfop", "tipoNF", "ncm", "codigoProduto"].map((campo, idx) => (
        <div key={idx}>
          <label>{campo}: </label>
          <input
            type={campo.includes("data") ? "date" : "text"}
            name={campo}
            value={filtros[campo]}
            onChange={e => setFiltros({ ...filtros, [campo]: e.target.value })}
          />
        </div>
      ))}
      <br />
      <button onClick={enviarArquivos} disabled={carregando}>
        {carregando ? "Processando..." : "Gerar Relatório"}
      </button>
      {linkDownload && (
        <div style={{ marginTop: 10 }}>
          ✅ <a href={linkDownload} target="_blank" rel="noopener noreferrer">Clique para baixar</a>
        </div>
      )}
    </div>
  );
}

export default UploadRelatorio;
