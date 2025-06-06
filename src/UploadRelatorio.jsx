import React, { useState } from 'react';

const API_URL = 'https://relatorio-nfe-backend.onrender.com';

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
  const [status, setStatus] = useState(null);
  const [usandoZip, setUsandoZip] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleFiles = (event) => {
    const files = Array.from(event.target.files);
    const isZip = files.length === 1 && files[0].name.toLowerCase().endsWith('.zip');
    const isXml = files.every(file => file.name.toLowerCase().endsWith('.xml'));

    if (isZip) {
      setUsandoZip(true);
      setArquivos(files);
    } else if (isXml) {
      setUsandoZip(false);
      setArquivos(files);
    } else {
      alert("Selecione apenas arquivos .xml ou um único .zip contendo XMLs.");
      setArquivos([]);
    }
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const enviarArquivos = async () => {
    if (arquivos.length === 0) {
      alert("Nenhum arquivo selecionado.");
      return;
    }

    setCarregando(true);
    setStatus("Enviando arquivos...");

    const formData = new FormData();
    arquivos.forEach((file) => formData.append('xmls', file));

    formData.append('modo_linha_individual', modoIndividual);
    formData.append('dataInicio', filtros.dataInicio);
    formData.append('dataFim', filtros.dataFim);
    formData.append('cfop', filtros.cfop);
    formData.append('tipoNF', filtros.tipoNF);
    formData.append('ncm', filtros.ncm);
    formData.append('codigoProduto', filtros.codigoProduto);

    try {
      const res = await fetch(`${API_URL}/gerar-relatorio`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        alert("Erro: " + (json.detail || "Erro desconhecido"));
        setCarregando(false);
        return;
      }

      const { id } = json;
      setStatus("Processando...");

      // Polling
      const interval = setInterval(async () => {
        const resp = await fetch(`${API_URL}/status/${id}`);
        const data = await resp.json();

        if (data.status === 'concluido') {
          clearInterval(interval);
          setStatus("Concluído. Baixando arquivo...");

          const link = document.createElement('a');
          link.href = `${API_URL}/download/relatorio_${id}.xlsx`;
          link.download = 'relatorio_nfe.xlsx';
          link.click();

          setCarregando(false);
          setStatus("Relatório baixado.");
        }

        if (data.status === 'erro') {
          clearInterval(interval);
          setCarregando(false);
          alert("Erro ao gerar relatório: " + data.erro);
          setStatus("Erro no processamento.");
        }
      }, 3000);

    } catch (err) {
      alert("Erro ao enviar arquivos. Verifique a conexão ou o backend.");
      setCarregando(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Upload de XMLs ou ZIP</h2>

      <input type="file" multiple onChange={handleFiles} />
      {usandoZip && <p style={{ color: 'green' }}>Arquivo ZIP detectado — será processado.</p>}

      <div style={{ marginTop: '15px' }}>
        <label>
          <input
            type="checkbox"
            checked={modoIndividual}
            onChange={(e) => setModoIndividual(e.target.checked)}
          />
          &nbsp;Cada item em uma linha
        </label>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Data Início: <input type="date" name="dataInicio" value={filtros.dataInicio} onChange={handleFiltroChange} /></label><br />
        <label>Data Fim: <input type="date" name="dataFim" value={filtros.dataFim} onChange={handleFiltroChange} /></label><br />
        <label>CFOP: <input type="text" name="cfop" value={filtros.cfop} onChange={handleFiltroChange} /></label><br />
        <label>Tipo NF:
          <select name="tipoNF" value={filtros.tipoNF} onChange={handleFiltroChange}>
            <option value="">--</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
          </select>
        </label><br />
        <label>NCM: <input type="text" name="ncm" value={filtros.ncm} onChange={handleFiltroChange} /></label><br />
        <label>Código Produto: <input type="text" name="codigoProduto" value={filtros.codigoProduto} onChange={handleFiltroChange} /></label><br />
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={enviarArquivos} disabled={carregando}>
          {carregando ? 'Processando...' : 'Gerar Relatório'}
        </button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>Total de arquivos selecionados:</strong> {arquivos.length}
      </div>

      {status && (
        <div style={{ marginTop: '15px', fontWeight: 'bold', color: '#005' }}>
          {status}
        </div>
      )}
    </div>
  );
}

export default UploadRelatorio;
