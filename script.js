document.addEventListener("DOMContentLoaded", () => {
    const campoTarefa = document.getElementById("campo-tarefa");
    const botaoAdicionar = document.getElementById("botao-adicionar");
    const listaTarefas = document.getElementById("lista-tarefas");

    const adicionarTarefa = () => {
        const textoTarefa = campoTarefa.value.trim();

        if (textoTarefa === "") {
            campoTarefa.classList.add("invalid");
            alert("Por favor, digite uma tarefa!");
            return;
        }

        if (Array.from(listaTarefas.children).some(li => li.textContent.includes(textoTarefa))) {
            alert("Tarefa já adicionada!");
            return;
        }

        const itemTarefa = document.createElement("li");
        itemTarefa.className = "tarefa";
        itemTarefa.innerHTML = `
            <span>${textoTarefa}</span>
            <button>Remover</button>
        `;

        itemTarefa.querySelector("span").addEventListener("click", () => {
            itemTarefa.classList.toggle("concluida");
        });

        itemTarefa.querySelector("button").addEventListener("click", () => {
            listaTarefas.removeChild(itemTarefa);
        });

        listaTarefas.appendChild(itemTarefa);
        campoTarefa.value = "";
        campoTarefa.classList.remove("invalid");
    };

    botaoAdicionar.addEventListener("click", adicionarTarefa);

    campoTarefa.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            adicionarTarefa();
        }
    });
});
