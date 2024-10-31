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
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Função de espera
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para buscar os dados
async function fetchData(retries = 0) {
    try {
        const response = await axios.get(apiUrl);

        // Verifique se a resposta é um JSON válido
        if (response.data && response.data.features) {
            const features = response.data.features;

            if (features.length > 0) {
                const attributes = features[0].attributes;
                const Ult_Dado = attributes.Ult_Dado;
                const Data_ult_dado = attributes.Data_ult_dado;

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
                console.log("Sem dados disponíveis. Tentando novamente...");
                if (retries < 5) {
                    console.log(`Tentativa ${retries + 1} de 5...`);
                    await fetchData(retries + 1); // Tenta novamente
                } else {
                    console.clear();
                    console.log("Número máximo de tentativas atingido. Aguardando 5 minutos...");
                    await delay(5 * 60 * 1000); // Aguarda 5 minutos
                    await fetchData(0); // Reinicia as tentativas após o tempo de espera
                }
            }
        } else {
            throw new Error("Resposta da API não contém dados válidos.");
        }
    } catch (error) {
        console.error("Erro ao buscar os dados:", error.message);
        if (retries < 5) {
            console.log(`Tentativa ${retries + 1} de 5...`);
            await fetchData(retries + 1); // Tenta novamente
        } else {
            console.clear();
            console.log("Número máximo de tentativas atingido. Aguardando 5 minutos...");
            await delay(5 * 60 * 1000); // Aguarda 5 minutos
            await fetchData(0); // Reinicia as tentativas após o tempo de espera
        }
    }
}

// Executa a busca de dados imediatamente
fetchData();
