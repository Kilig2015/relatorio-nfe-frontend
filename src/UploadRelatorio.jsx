import React, { useRef, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function UploadRelatorio() {
  const inputRef = useRef(null);
  const [modoIndividual, setModoIndividual] = useState(false);
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    cfop: '',
    tipoNF: '',
    ncm: '',
    codigoProduto: '',
  });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute('webkitdirectory', '');
    }
  }, []);

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleFiles = async (event) => {
    const arquivos = Array.from(event.target.files).filter(file =>
      file.name.toLowerCase().endsWith('.xml')
    );

    if (arquivos.length === 0) {
      alert("Nenhum arquivo XML selecionado.");
      return;
    }

    const formData = new FormData();
    arquivos.forEach((file) => {
      formData.append('xmls', file);
    });

    formData.append('modo_linha_individual', modoIndividual);

    Object.entries(filtros).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    setEnviando(true);

    try {
      const response = await fetch(`${API_URL}/gerar-relatorio`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 400) {
        const msg = await response.text();
        alert("Nenhum dado encontrado após aplicar os filtros.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = errorData?.detail || await response.text();
        throw new Error(msg || "Erro desconhecido.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio_nfe.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Selecionar pasta com XMLs</h2>

      <input
        type="file"
        multiple
        ref={inputRef}
        onChange={handleFiles}
        accept=".xml"
      />

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
        {enviando ? (
          <strong>Processando arquivos, por favor aguarde...</strong>
        ) : (
          <button onClick={() => inputRef.current?.click()}>Gerar Relatório</button>
        )}
      </div>
    </div>
  );
}

export default UploadRelatorio;
