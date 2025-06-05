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
  const [status, setStatus] = useState('');

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setArquivos(files);
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const verificarStatus = async (id) => {
    let tentativas = 0;
    const intervalo = setInterval(async () => {
      tentativas++;
      const res = await fetch(`https://relatorio-nfe-backend.onrender.com/status/${id}`);
      const data = await res.json();

      if (data.status === "pronto") {
        clearInterval(intervalo);
        setStatus("Relatório pronto. Baixando...");
        window.location.href = data.url;
      } else if (tentativas > 100) {
        clearInterval(intervalo);
        setStatus("Tempo excedido. Tente novamente mais tarde.");
      }
    }, 5000);
  };

  const enviarArquivos = async () => {
    if (!arquivos.length) {
      alert("Selecione arquivos.");
      return;
    }

    setStatus("Processando...");
    const formData = new FormData();
    arquivos.forEach(file => formData.append("xmls", file));
    formData.append("modo_linha_individual", modoIndividual);
    Object.entries(filtros).forEach(([k, v]) => formData.append(k, v));

    try {
      const res = await fetch("https://relatorio-nfe-backend.onrender.com/gerar-relatorio", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.id) {
        verificarStatus(data.id);
      } else {
        setStatus("Erro ao iniciar geração.");
      }
    } catch (err) {
      setStatus("Erro de rede.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload de XMLs ou ZIP</h2>
      <input type="file" multiple onChange={handleFiles} />
      <br /><br />
      <label>
        <input type="checkbox" checked={modoIndividual} onChange={(e) => setModoIndividual(e.target.checked)} />
        Cada item em uma linha
      </label>
      <br />
      <input name="dataInicio" type="date" onChange={handleFiltroChange} />
      <input name="dataFim" type="date" onChange={handleFiltroChange} /><br />
      <input name="cfop" placeholder="CFOP" onChange={handleFiltroChange} />
      <select name="tipoNF" onChange={handleFiltroChange}>
        <option value="">Tipo NF</option>
        <option value="Entrada">Entrada</option>
        <option value="Saída">Saída</option>
      </select><br />
      <input name="ncm" placeholder="NCM" onChange={handleFiltroChange} />
      <input name="codigoProduto" placeholder="Código Produto" onChange={handleFiltroChange} /><br /><br />
      <button onClick={enviarArquivos}>Gerar Relatório</button>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Total de arquivos selecionados:</strong> {arquivos.length}</p>
    </div>
  );
}

export default UploadRelatorio;
