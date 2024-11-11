document.addEventListener("DOMContentLoaded", function() {
  const jsonUrl = 'https://api.github.com/repos/kauacodex/rj/contents/dados.json';

  // Função para obter um cookie pelo nome
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null; // Retorna null se o cookie não existir
  }

  // Função para definir um cookie
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000)); // Expira em dias
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`; // Define o cookie
  }

  // Função para mostrar a notificação
  function showNotification() {
    // Criar o elemento da notificação
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.top = "-100px"; // Começa fora da tela
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
    notification.style.backdropFilter = "blur(10px)";
    notification.style.padding = window.innerWidth <= 449 ? "12px 20px" : "15px 25px";
    notification.style.borderRadius = "15px";
    notification.style.boxShadow = "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
    notification.style.border = "1px solid rgba(255, 255, 255, 0.18)";
    notification.style.color = "#fff";
    notification.style.zIndex = "9999";
    notification.style.width = window.innerWidth <= 449 ? "85%" : "90%";
    notification.style.maxWidth = window.innerWidth <= 449 ? "350px" : "400px";
    notification.style.textAlign = "center";
    notification.style.transition = "top 0.5s ease-out";

    // Adicionar o texto
    const text = document.createElement("div");
    text.textContent = "Buscando novos dados no nível do Rio Jacuí...";
    text.style.marginBottom = "10px";
    text.style.fontSize = window.innerWidth <= 449 ? "14px" : "16px";
    notification.appendChild(text);

    // Adicionar o contêiner da barra de progresso
    const progressContainer = document.createElement("div");
    progressContainer.style.position = "relative";
    progressContainer.style.width = "100%";
    progressContainer.style.height = window.innerWidth <= 449 ? "3px" : "4px";
    progressContainer.style.marginTop = "10px";

    // Adicionar a barra de progresso
    const progressBar = document.createElement("div");
    progressBar.style.width = "100%";
    progressBar.style.height = "100%";
    progressBar.style.backgroundColor = "rgba(75, 207, 250, 0.3)";
    progressBar.style.borderRadius = "2px";
    progressBar.style.overflow = "hidden";

    const progress = document.createElement("div");
    progress.style.width = "100%";
    progress.style.height = "100%";
    progress.style.backgroundColor = "#4bcffa";
    progress.style.transition = "width 5s linear";

    progressBar.appendChild(progress);
    progressContainer.appendChild(progressBar);
    notification.appendChild(progressContainer);

    // Adicionar ao corpo
    document.body.appendChild(notification);

    // Animar a entrada da notificação
    requestAnimationFrame(() => {
      notification.style.top = "20px";
    });

    // Iniciar a animação da barra de progresso
    setTimeout(() => {
      progress.style.width = "0"; // Reduz a largura para 0 durante 5 segundos
    }, 100);

    // Remover a notificação após 5 segundos
    setTimeout(() => {
      notification.style.top = "-100px"; // Animar a saída
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 5000);
  }

  // Função para buscar e exibir dados
  function fetchAndDisplayData() {
    // Recuperar o horário da última verificação (cookie)
    const lastFetchTime = getCookie('ultima_busca_api');
    const currentTime = new Date().getTime();

    // Se não tiver horário de última busca ou se passaram mais de 60 segundos
    if (!lastFetchTime || currentTime - lastFetchTime >= 60000) {
      // Fazer a requisição para verificar se há atualizações
      fetch(jsonUrl, {
        headers: { Accept: "application/vnd.github.v3+json" },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Erro ao carregar os dados do arquivo.");
          return response.json();
        })
        .then((data) => {
          // Decodificar o conteúdo JSON do Base64
          const jsonData = JSON.parse(atob(data.content));
          const Ult_Dado = jsonData.Ult_Dado;
          const Data_ult_dado = jsonData.Data_ult_dado;
          const ultima_busca_api = jsonData.ultima_busca_api;

          // Comparar os dados do JSON com os dados armazenados nos cookies
          const lastDado = getCookie('ult_dado');
          const lastDataDado = getCookie('data_ult_dado');
          
          // Verificar se os dados são diferentes dos anteriores
          if (Ult_Dado !== lastDado || Data_ult_dado !== lastDataDado) {
            // Atualizar os cookies com a hora da última busca
            setCookie('ultima_busca_api', currentTime, 1); // Salva o horário atual
            setCookie('ult_dado', Ult_Dado, 1);
            setCookie('data_ult_dado', Data_ult_dado, 1);

            // Atualizar os dados exibidos
            const formattedDado = formatUltDado(Ult_Dado);
            const formattedDate = formatDate(Data_ult_dado);

            document.getElementById("Ult_Dado_Numero").innerText = formattedDado;
            document.getElementById("Data_ult_dado").innerHTML = `<i class="far fa-clock" style="animation: shake 3s infinite;"></i> Em: <span style="color: white;">${formattedDate}</span>`;
            showNotification();
            console.clear();
            console.log("Informações atualizadas com sucesso!");
          } else {
            // Caso os dados não tenham mudado
            console.clear();
            console.log("Dados não atualizados, nada mudou.");
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar os dados:", error);
        });
    } else {
      // Se não passou 60 segundos, exibe a informação do cookie
      const lastDado = getCookie('ult_dado');
      const lastDataDado = getCookie('data_ult_dado');
      const formattedDado = formatUltDado(lastDado);
      const formattedDate = formatDate(lastDataDado);

      document.getElementById("Ult_Dado_Numero").innerText = formattedDado;
      document.getElementById("Data_ult_dado").innerHTML = `<i class="far fa-clock" style="animation: shake 3s infinite;"></i> Em: <span style="color: white;">${formattedDate}</span>`;
      console.clear();
      console.log("Dados não atualizados, tempo de requisição ainda não passou.");
    }
  }

  // Função para formatar o dado
  function formatUltDado(dado) {
    const dadoStr = dado.toString();
    const numeroComZeros = dadoStr.padStart(3, '0');
    const parteInteira = numeroComZeros.slice(0, -2);
    const parteDecimal = numeroComZeros.slice(-2);
    return `${parteInteira},${parteDecimal}`;
  }

  // Função para formatar a data
  function formatDate(timestamp) {
    const date = new Date(parseInt(timestamp)); // Garantir que o timestamp seja tratado como número
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }

  // Chamar a função imediatamente ao carregar a página
  fetchAndDisplayData();

  // Iniciar a verificação a cada 60 segundos
  setInterval(fetchAndDisplayData, 60000); // 60000 milissegundos = 60 segundos
});
