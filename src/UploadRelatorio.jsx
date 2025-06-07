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
  const [usandoZip, setUsandoZip] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [status, setStatus] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

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

  const consultarStatus = async (jobId) => {
    try {
      const interval = setInterval(async () => {
        const resp = await fetch(`${API_URL}/status/${jobId}`);
        const data = await resp.json();
        if (data.status === 'concluido') {
          clearInterval(interval);
          setStatus('concluido');
          setDownloadUrl(API_URL + data.url);
          setCarregando(false);
        } else if (data.status === 'nao_encontrado') {
          clearInterval(interval);
          setStatus('erro');
          setCarregando(false);
          alert("Erro ao consultar status. Tente novamente mais tarde.");
        }
      }, 5000);
    } catch (e) {
      console.error(e);
      alert("Erro ao consultar status.");
    }
  };

  const enviarArquivos = async () => {
    if (arquivos.length === 0) {
      alert("Nenhum arquivo selecionado.");
      return;
    }

    setCarregando(true);
    setStatus("processando");
    setDownloadUrl(null);

    const formData = new FormData();
    arquivos.forEach((file) => {
      formData.append('xmls', file);
    });

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

      const data = await response.json();

      if (!response.ok) {
        alert("Erro ao iniciar geração: " + (data.detail || "desconhecido"));
        setCarregando(false);
        return;
      }

      consultarStatus(data.id);

    } catch (error) {
      console.error(error);
      alert("Erro de rede. Verifique sua conexão ou o backend.");
      setCarregando(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Upload de XMLs ou ZIP</h2>

      <input type="file" multiple onChange={handleFiles} />

      {usandoZip && (
        <div style={{ marginTop: '10px', color: 'green' }}>
          Arquivo ZIP detectado — será extraído automaticamente.
        </div>
      )}

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
          {carregando ? 'Gerando...' : 'Gerar Relatório'}
        </button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>Total de arquivos selecionados:</strong> {arquivos.length}
      </div>

      {status === 'processando' && (
        <div style={{ marginTop: '20px', color: 'blue' }}>
          Processando... Aguarde.
        </div>
      )}

      {status === 'concluido' && downloadUrl && (
        <div style={{ marginTop: '20px', color: 'green' }}>
          <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
            Clique aqui para baixar o relatório
          </a>
        </div>
      )}
    </div>
  );
}

export default UploadRelatorio;
