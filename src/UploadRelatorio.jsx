import React, { useState } from 'react';

function UploadRelatorio() {
  const [arquivos, setArquivos] = useState([]);
  const [modoIndividual, setModoIndividual] = useState(true);
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    cfop: '',
    tipoNF: '',
    ncm: '',
    codigoProduto: '',
  });
  const [mensagem, setMensagem] = useState('');
  const [usandoZip, setUsandoZip] = useState(false);

  const handleFiles = (event) => {
    const files = Array.from(event.target.files);
    const zip = files.length === 1 && files[0].name.toLowerCase().endsWith('.zip');
    const xmls = files.every(file => file.name.toLowerCase().endsWith('.xml'));
    if (zip) {
      setUsandoZip(true);
      setArquivos(files);
    } else if (xmls) {
      setUsandoZip(false);
      setArquivos(files);
    } else {
      alert("Envie apenas arquivos XML ou um .ZIP com XMLs.");
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

    setMensagem("Status: Processando...");

    const formData = new FormData();
    arquivos.forEach(file => {
      formData.append('xmls', file);
    });

    for (const key in filtros) {
      formData.append(key, filtros[key]);
    }
    formData.append('modo_linha_individual', modoIndividual);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/gerar-relatorio', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const erro = await res.json();
        setMensagem("Erro: " + erro.detail);
        return;
      }

      const json = await res.json();
      setMensagem("Relatório gerado! Clique abaixo para baixar.");
      const link = document.createElement('a');
      link.href = import.meta.env.VITE_API_URL + json.url;
      link.download = "relatorio_nfe.xlsx";
      link.textContent = "Clique aqui para baixar o relatório";
      document.getElementById("link").innerHTML = '';
      document.getElementById("link").appendChild(link);
    } catch (err) {
      setMensagem("Erro ao gerar relatório.");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2>Upload de XMLs ou ZIP</h2>

      <input type="file" multiple onChange={handleFiles} />
      {usandoZip && <p style={{ color: 'green' }}>ZIP detectado: será processado automaticamente.</p>}

      <label>
        <input
          type="checkbox"
          checked={modoIndividual}
          onChange={e => setModoIndividual(e.target.checked)}
        />
        &nbsp;Cada item em uma linha
      </label>

      <div style={{ marginTop: 10 }}>
        <input type="date" name="dataInicio" value={filtros.dataInicio} onChange={handleFiltroChange} /><br />
        <input type="date" name="dataFim" value={filtros.dataFim} onChange={handleFiltroChange} /><br />
        <input type="text" name="cfop" placeholder="CFOP" value={filtros.cfop} onChange={handleFiltroChange} /><br />
        <select name="tipoNF" value={filtros.tipoNF} onChange={handleFiltroChange}>
          <option value="">Tipo NF</option>
          <option value="Entrada">Entrada</option>
          <option value="Saída">Saída</option>
        </select><br />
        <input type="text" name="ncm" placeholder="NCM" value={filtros.ncm} onChange={handleFiltroChange} /><br />
        <input type="text" name="codigoProduto" placeholder="Código Produto" value={filtros.codigoProduto} onChange={handleFiltroChange} />
      </div>

      <button style={{ marginTop: 20 }} onClick={enviarArquivos}>Gerar Relatório</button>

      <div style={{ marginTop: 20 }}>
        <strong>{mensagem}</strong>
        <div id="link" style={{ marginTop: 10 }}></div>
        <div><strong>Total de arquivos selecionados:</strong> {arquivos.length}</div>
      </div>
    </div>
  );
}

export default UploadRelatorio;
