document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    'https://portal1.snirh.gov.br/server/rest/services/SGH/CotasReferencia2/MapServer/dynamicLayer/query?f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&geometry=%7B"xmin"%3A-5704261.757328038%2C"ymin"%3A-3508025.0787798706%2C"xmax"%3A-5704204.429556822%2C"ymax"%3A-3507967.751008655%2C"spatialReference"%3A%7B"wkid"%3A102100%7D%7D&geometryType=esriGeometryEnvelope&inSR=102100&outFields=Data_ult_dado%2CUlt_Dado&outSR=102100&layer=%7B"source"%3A%7B"type"%3A"mapLayer"%2C"mapLayerId"%3A2%7D%7D';
  const proxyUrl =
    "https://api.allorigins.win/get?url=" + encodeURIComponent(apiUrl);

  fetch(proxyUrl)
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error("Erro na resposta da rede.");
    })
    .then((data) => {
      const json = JSON.parse(data.contents);
      const features = json.features || [];
      if (features.length > 0) {
        const attributes = features[0].attributes;
        const Ult_Dado = attributes.Ult_Dado;
        const Data_ult_dado = parseInt(attributes.Data_ult_dado); // Certifique-se de que Data_ult_dado é um número inteiro
        const formattedDado = formatUltDado(Ult_Dado);
        const formattedDate = formatDate(Data_ult_dado);
        document.getElementById("Ult_Dado_Numero").innerText = formattedDado;
        document.getElementById("Data_ult_dado").innerText = `Em: ${formattedDate}`;
      } else {
        document.getElementById("Ult_Dado_Numero").innerText = "Sem dados disponíveis";
        document.getElementById("Data_ult_dado").innerText = "Sem dados disponíveis";
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar os dados:", error);
      document.getElementById("Ult_Dado_Numero").innerText = "Erro ao carregar dados";
      document.getElementById("Data_ult_dado").innerText = "Erro ao carregar dados";
    });

  function formatUltDado(dado) {
    const dadoStr = dado.toString();
    // Se o número tiver menos de dois dígitos, adiciona zero à esquerda
    const numeroComZeros = dadoStr.padStart(3, '0');
    // Divide a string em parte inteira e parte decimal
    const parteInteira = numeroComZeros.slice(0, -2);
    const parteDecimal = numeroComZeros.slice(-2);
    // Retorna a string formatada com ponto decimal
    return `${parteInteira},${parteDecimal}`;
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    // Formatação da data e hora
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }

  // Recarregar a página a cada 30 segundos
  setInterval(function () {
    location.reload();
  }, 30000);
});
