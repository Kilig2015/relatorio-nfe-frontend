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
  const [usandoZip, setUsandoZip] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://relatorio-nfe-backend.onrender.com';

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

  const consultarStatus = async (taskId) => {
    try {
      for (let i = 0; i < 300; i++) {
        const res = await fetch(`${API_URL}/status/${taskId}`);
        const json = await res.json();
        if (json.status === 'pronto') {
          return json.url;
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      throw new Error('Tempo de espera excedido.');
    } catch (err) {
      throw new Error("Erro ao consultar status. Tente novamente mais tarde.");
    }
  };

  const enviarArquivos = async () => {
    if (arquivos.length === 0) {
      alert("Nenhum arquivo selecionado.");
      return;
    }

    setCarregando(true);
    setMensagem("Enviando arquivos...");

    const formData = new FormData();
    arquivos.forEach(file => formData.append('xmls', file));

    formData.append('modo_linha_individual', modoIndividual);
    Object.entries(filtros).forEach(([chave, valor]) => formData.append(chave, valor));

    try {
      const response = await fetch(`${API_URL}/gerar-relatorio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.detail || "Erro ao iniciar geração.");
      }

      const { id } = await response.json();
      setMensagem("Relatório em processamento...");

      const urlRelatorio = await consultarStatus(id);
      const link = document.createElement('a');
      link.href = `${API_URL}${urlRelatorio}`;
      link.download = 'relatorio_nfe.xlsx';
      link.click();
      setMensagem("Relatório pronto!");
    } catch (error) {
      setMensagem(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
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

      {mensagem && (
        <div style={{ marginTop: '20px', color: carregando ? 'blue' : 'green' }}>
          {mensagem}
        </div>
      )}
    </div>
  );
}

export default UploadRelatorio;
