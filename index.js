const axios = require('axios');

// URL da API
const apiUrl = 'https://portal1.snirh.gov.br/server/rest/services/SGH/CotasReferencia2/MapServer/dynamicLayer/query?f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&geometry=%7B"xmin"%3A-5704261.757328038%2C"ymin"%3A-3508025.0787798706%2C"xmax"%3A-5704204.429556822%2C"ymax"%3A-3507967.751008655%2C"spatialReference"%3A%7B"wkid"%3A102100%7D%7D&geometryType=esriGeometryEnvelope&inSR=102100&outFields=Data_ult_dado%2CUlt_Dado&outSR=102100&layer=%7B"source"%3A%7B"type"%3A"mapLayer"%2C"mapLayerId"%3A2%7D%7D';
const githubApiUrl = 'https://api.github.com/repos/kauacodex/rj/contents/dados.json';
const githubToken = process.env.GITHUB_TOKEN; // A chave de API do GitHub

// Função para formatar a data
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Função para buscar os dados
async function fetchData(retries = 0) {
    try {
        const response = await axios.get(apiUrl);
        const json = response.data;

        if (json && json.features && json.features.length > 0) {
            const attributes = json.features[0].attributes;
            const Ult_Dado = attributes.Ult_Dado;
            const Data_ult_dado = parseInt(attributes.Data_ult_dado);

            const dataToSave = {
                Ult_Dado,
                Data_ult_dado,
                ultima_busca_api: formatDate(new Date()),
                ultimo_dado_api: formatDate(new Date(Data_ult_dado))
            };

            // Salva os dados no GitHub
            const jsonString = JSON.stringify(dataToSave, null, 2);
            await saveToGithub(jsonString);
        } else {
            throw new Error("Sem dados disponíveis.");
        }
    } catch (error) {
        console.error("Erro aguardando 5 minutos:", error.message);
        if (retries < 10) {
            await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); // Aguarda 5 minutos
            await fetchData(retries + 1);
        } else {
            console.error("Número máximo de tentativas atingido. Saindo do script.");
            process.exit(1);
        }
    }
}

// Função para salvar o JSON no GitHub
async function saveToGithub(content) {
    const shaResponse = await axios.get(githubApiUrl, {
        headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json'
        }
    }).catch(() => null);

    const sha = shaResponse ? shaResponse.data.sha : null;

    await axios.put(githubApiUrl, {
        message: "Atualização em: " + formatDate(new Date()),
        content: Buffer.from(content).toString('base64'),
        sha: sha
    }, {
        headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });

    console.log("Dados salvos em dados.json no repositório.");
}

// Executa a busca de dados imediatamente
fetchData();
