const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL da API
const apiUrl = 'https://portal1.snirh.gov.br/server/rest/services/SGH/CotasReferencia2/MapServer/dynamicLayer/query?f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&geometry=%7B"xmin"%3A-5704261.757328038%2C"ymin"%3A-3508025.0787798706%2C"xmax"%3A-5704204.429556822%2C"ymax"%3A-3507967.751008655%2C"spatialReference"%3A%7B"wkid"%3A102100%7D%7D&geometryType=esriGeometryEnvelope&inSR=102100&outFields=Data_ult_dado%2CUlt_Dado&outSR=102100&layer=%7B"source"%3A%7B"type"%3A"mapLayer"%2C"mapLayerId"%3A2%7D%7D';
const outputFilePath = path.join(process.cwd(), 'dados.json'); // Salva na raiz do repositório


// Função para formatar a data
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa do zero
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Função para buscar os dados
async function fetchData() {
    try {
        const response = await axios.get(apiUrl);
        const json = response.data;

        const features = json.features || [];
        if (features.length > 0) {
            const attributes = features[0].attributes;
            const Ult_Dado = attributes.Ult_Dado;
            const Data_ult_dado = parseInt(attributes.Data_ult_dado);

            const dataToSave = {
                Ult_Dado,
                Data_ult_dado,
                ultima_atualizacao: formatDate(new Date()) // Formata a data da última atualização
            };

            // Salva os dados no arquivo
            fs.writeFileSync(outputFilePath, JSON.stringify(dataToSave, null, 2));
            console.clear();
            console.log(`Dados salvos em ${outputFilePath}`);
        } else {
            console.log("Sem dados disponíveis");
        }
    } catch (error) {
        console.error("Erro ao buscar os dados:", error.message);
    }
}

// Função para iniciar o cronômetro e buscar dados
async function startCron() {
    await fetchData(); // Executa imediatamente

    // Cronômetro de 30 minutos (1800000 milissegundos)
    const interval = 1800000; 
    let timeRemaining = interval;

    const timer = setInterval(() => {
        timeRemaining -= 1000; // Decrementa 1 segundo

        // Converte o tempo restante em minutos
        const minutes = Math.floor(timeRemaining / 60000); // Tempo restante em minutos

        // Mostra o tempo restante no terminal a cada 1 minuto
        if (timeRemaining % 60000 === 0) {
            console.clear();
            console.log(`Próxima atualização em: ${minutes}m`);
            
        }

        // Quando o tempo se esgota, busca os dados novamente e reinicia o cronômetro
        if (timeRemaining <= 0) {
            fetchData(); // Busca os dados novamente
            timeRemaining = interval; // Reinicia o cronômetro
            console.log(); // Para nova linha após atualização
        }
    }, 1000);
}

// Inicia o cronômetro
startCron();
