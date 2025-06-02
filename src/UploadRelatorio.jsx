import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://relatorio-nfe-backend.onrender.com';

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
  const [progresso, setProgresso] = useState('');

  const handleFiles = (event) => {
    const files = Array.from(event.target.files);
    const isZip = files.length === 1 && files[0].name.toLowerCase().endsWith('.zip');
    const isXml = files.every(file => file.name.toLowerCase().endsWith('.xml'));

    if (isZip || isXml) {
      setArquivos(files);
    } else {
      alert("Selecione apenas arquivos .xml ou um único .zip contendo XMLs.");
      setArquivos([]);
    }
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const verificarStatus = async (taskId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/status/${taskId}`);
        const data = await response.json();

        if (data.status === 'pronto') {
          clearInterval(interval);
          setProgresso('Relatório pronto! Baixando...');
          const a = document.createElement('a');
          a.href = `${API_URL}/download/${taskId}`;
          a.download = 'relatorio_nfe.xlsx';
          a.click();
        } else {
          setProgresso('Processando... aguarde');
        }
      } catch {
        clearInterval(interval);
        setProgresso('Erro ao consultar status. Tente novamente mais tarde.');
      }
    }, 5000);
  };

  const enviarArquivos = async () => {
    if (arquivos.length === 0) {
      alert("Nenhum arquivo selecionado.");
      return;
    }

    setCarregando(true);
    setProgresso('Enviando arquivos...');

    const formData = new FormData();
    arquivos.forEach(file => formData.append('xmls', file));
    formData.append('modo_linha_individual', modoIndividual);
    formData.append('dataInicio', filtros.dataInicio);
    formData.append('dataFim', filtros.dataFim);
    formData.append('cfop', filtros.cfop);
    formData.append('tipoNF', filtros.tipoNF);
    formData.append('ncm', filtros.ncm);
    formData.append('codigoProduto', filtros.codigoProduto);

    try {
      const response = await fetch(`${API_URL}/gerar-relatorio`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      if (response.ok && json.task_id) {
        setProgresso('Processamento iniciado...');
        verificarStatus(json.task_id);
      } else {
        setProgresso('');
        alert("Erro ao iniciar processamento: " + (json.detail || 'Desconhecido'));
      }
    } catch (err) {
      setProgresso('');
      alert("Erro de rede. Verifique sua conexão ou tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Upload de XMLs ou ZIP</h2>

      <input type="file" multiple onChange={handleFiles} />

      <div style={{ marginTop: '20px' }}>
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
          {carregando ? 'Enviando...' : 'Gerar Relatório'}
        </button>
      </div>

      <div style={{ marginTop: '10px', color: 'blue' }}>
        {progresso}
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>Total de arquivos selecionados:</strong> {arquivos.length}
      </div>
    </div>
  );
}

export default UploadRelatorio;
