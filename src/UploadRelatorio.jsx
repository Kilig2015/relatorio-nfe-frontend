import React, { useState, useEffect } from 'react';

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
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState('');
  const [usandoZip, setUsandoZip] = useState(false);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const isZip = files.length === 1 && files[0].name.endsWith('.zip');
    const isXml = files.every(f => f.name.endsWith('.xml'));

    if (!isZip && !isXml) {
      alert('Selecione apenas arquivos .xml ou um único .zip contendo XMLs.');
      return;
    }

    setArquivos(files);
    setUsandoZip(isZip);
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const enviarArquivos = async () => {
    if (arquivos.length === 0) {
      alert('Nenhum arquivo selecionado.');
      return;
    }

    setStatus('Enviando...');

    const formData = new FormData();
    arquivos.forEach(file => formData.append('xmls', file));

    formData.append('modo_linha_individual', modoIndividual);
    Object.entries(filtros).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const res = await fetch(`${API_URL}/gerar-relatorio`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setTaskId(data.task_id);
      setStatus('Processando...');
    } catch (error) {
      alert('Erro de rede. Verifique o backend.');
      setStatus('');
    }
  };

  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`${API_URL}/status/${taskId}`);
      const data = await res.json();

      if (data.status === 'pronto') {
        clearInterval(interval);
        window.location.href = `${API_URL}/download/${taskId}`;
        setStatus('Download iniciado');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [taskId]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Upload de XMLs ou ZIP</h2>

      <input type="file" multiple onChange={handleFiles} />
      {usandoZip && <p style={{ color: 'green' }}>ZIP detectado: será processado automaticamente.</p>}

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
        <button onClick={enviarArquivos}>
          Gerar Relatório
        </button>
        <div style={{ marginTop: '10px' }}>
          {status && <strong>Status: {status}</strong>}
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>Total de arquivos selecionados:</strong> {arquivos.length}
      </div>
    </div>
  );
}

export default UploadRelatorio;
