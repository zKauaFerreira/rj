document.addEventListener("DOMContentLoaded", function() {
  const jsonUrl = 'https://api.github.com/repos/kauacodex/rj/contents/dados.json';

  // Function to get a cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null; // Return null if cookie doesn't exist
  }

  // Function to set a cookie
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000)); // Expires in days
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`; // Set the cookie
  }

  // Function to show the notification with progress bar
  function showNotification() {
    // Create the notification element
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.top = "-100px"; // Start outside the screen
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

    // Add the text
    const text = document.createElement("div");
    text.textContent = "Uma nova versão foi detectada! Atualizando...";
    text.style.marginBottom = "10px";
    text.style.fontSize = window.innerWidth <= 449 ? "14px" : "16px";
    notification.appendChild(text);

    // Add the progress bar container
    const progressContainer = document.createElement("div");
    progressContainer.style.position = "relative";
    progressContainer.style.width = "100%";
    progressContainer.style.height = window.innerWidth <= 449 ? "3px" : "4px";
    progressContainer.style.marginTop = "10px";

    // Add the progress bar
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

    // Add to the body
    document.body.appendChild(notification);

    // Animate the notification entry
    requestAnimationFrame(() => {
      notification.style.top = "20px";
    });

    // Start the progress bar animation
    setTimeout(() => {
      progress.style.width = "0"; // Reduce the width to 0 over 5 seconds
    }, 100);

    // Remove the notification after 5 seconds
    setTimeout(() => {
      notification.style.top = "-100px"; // Animate the exit
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 5000);
  }

  // Function to fetch and display data
  function fetchAndDisplayData() {
    // Retrieve the last API fetch timestamp stored in cookies
    const lastFetchTime = getCookie('ultima_busca_api');

    // Retrieve the last data values from cookies
    const lastDado = getCookie('ult_dado');
    const lastDataDado = parseInt(getCookie('data_ult_dado')); // Convert timestamp string to number

    fetch(jsonUrl, {
      headers: { Accept: "application/vnd.github.v3+json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao carregar os dados do arquivo.");
        return response.json();
      })
      .then((data) => {
        // Decode the JSON content from Base64 to a string
        const jsonData = JSON.parse(atob(data.content));
        const Ult_Dado = jsonData.Ult_Dado;
        const Data_ult_dado = jsonData.Data_ult_dado;
        const ultima_busca_api = jsonData.ultima_busca_api;

        // Se não existir nenhum cookie (primeira visita)
        if (!lastFetchTime && !lastDado && !lastDataDado) {
          // Atualiza os cookies
          setCookie('ultima_busca_api', ultima_busca_api, 1);
          setCookie('ult_dado', Ult_Dado, 1);
          setCookie('data_ult_dado', Data_ult_dado, 1);

          // Atualiza os dados imediatamente sem notificação
          const formattedDado = formatUltDado(Ult_Dado);
          const formattedDate = formatDate(Data_ult_dado);

          document.getElementById("Ult_Dado_Numero").innerText = formattedDado;
          document.getElementById("Data_ult_dado").innerHTML = `<i class="far fa-clock" style="animation: shake 3s infinite;"></i> Em: <span style="color: white;">${formattedDate}</span>`;
          
          console.clear();
          console.log("Primeira visita - dados carregados com sucesso!");
        }
        // Se já existir cookie e houver nova versão
        else if (lastFetchTime !== ultima_busca_api) {
          // Atualiza os cookies
          setCookie('ultima_busca_api', ultima_busca_api, 1);
          setCookie('ult_dado', Ult_Dado, 1);
          setCookie('data_ult_dado', Data_ult_dado, 1);

          // Mostra notificação
          showNotification();

          // Atualiza os dados após 5 segundos
          setTimeout(() => {
            const formattedDado = formatUltDado(Ult_Dado);
            const formattedDate = formatDate(Data_ult_dado);

            document.getElementById("Ult_Dado_Numero").innerText = formattedDado;
            document.getElementById("Data_ult_dado").innerHTML = `<i class="far fa-clock" style="animation: shake 3s infinite;"></i> Em: <span style="color: white;">${formattedDate}</span>`;

            console.clear();
            console.log("Informações atualizadas com sucesso!");
          }, 5000);
        } else if (lastDado && lastDataDado) {
          // Usa os valores dos cookies se não houver nova versão
          const formattedDado = formatUltDado(lastDado);
          const formattedDate = formatDate(lastDataDado);

          document.getElementById("Ult_Dado_Numero").innerText = formattedDado;
          document.getElementById("Data_ult_dado").innerHTML = `<i class="far fa-clock" style="animation: shake 3s infinite;"></i> Em: <span style="color: white;">${formattedDate}</span>`;
          console.clear()
          console.log('Sem nova versão, pulando atualização.');
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados:", error);
      });
  }

  function formatUltDado(dado) {
    const dadoStr = dado.toString();
    const numeroComZeros = dadoStr.padStart(3, '0');
    const parteInteira = numeroComZeros.slice(0, -2);
    const parteDecimal = numeroComZeros.slice(-2);
    return `${parteInteira},${parteDecimal}`;
  }

  function formatDate(timestamp) {
    const date = new Date(parseInt(timestamp)); // Ensure timestamp is treated as a number
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }

  // Call the function immediately when the page loads
  fetchAndDisplayData();

  // Start the check every 60 seconds
  setInterval(fetchAndDisplayData, 60000); // 60000 milliseconds = 60 seconds


});