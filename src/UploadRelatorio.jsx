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
  const [carregando, setCarregando] = useState(false);
  const [linkRelatorio, setLinkRelatorio] = useState('');

  const handleFiles = (e) => {
    setArquivos(Array.from(e.target.files));
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const enviarArquivos = async () => {
    if (arquivos.length === 0) {
      alert("Selecione ao menos um arquivo XML ou ZIP.");
      return;
    }

    setCarregando(true);
    const formData = new FormData();
    arquivos.forEach(file => formData.append('xmls', file));
    formData.append('modo_linha_individual', modoIndividual);
    Object.entries(filtros).forEach(([chave, valor]) => formData.append(chave, valor));

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/gerar-relatorio", {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setLinkRelatorio(import.meta.env.VITE_API_URL + data.url);
      } else {
        alert(data.detail || 'Erro ao gerar relatório.');
      }
    } catch {
      alert('Erro de rede ou conexão com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload de XML ou ZIP</h2>
      <input type="file" multiple onChange={handleFiles} />
      <br />

      <label>
        <input type="checkbox" checked={modoIndividual} onChange={(e) => setModoIndividual(e.target.checked)} />
        Cada item em uma linha
      </label>

      <div>
        <label>Data Início: <input type="date" name="dataInicio" value={filtros.dataInicio} onChange={handleFiltroChange} /></label>
        <label>Data Fim: <input type="date" name="dataFim" value={filtros.dataFim} onChange={handleFiltroChange} /></label>
        <label>CFOP: <input type="text" name="cfop" value={filtros.cfop} onChange={handleFiltroChange} /></label>
        <label>Tipo NF:
          <select name="tipoNF" value={filtros.tipoNF} onChange={handleFiltroChange}>
            <option value="">--</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
          </select>
        </label>
        <label>NCM: <input type="text" name="ncm" value={filtros.ncm} onChange={handleFiltroChange} /></label>
        <label>Código Produto: <input type="text" name="codigoProduto" value={filtros.codigoProduto} onChange={handleFiltroChange} /></label>
      </div>

      <button onClick={enviarArquivos} disabled={carregando}>
        {carregando ? "Gerando..." : "Gerar Relatório"}
      </button>

      {linkRelatorio && (
        <div style={{ marginTop: '20px' }}>
          <a href={linkRelatorio} download target="_blank" rel="noopener noreferrer">
            Baixar Relatório
          </a>
        </div>
      )}
    </div>
  );
}

export default UploadRelatorio;
