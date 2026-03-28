import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1) Preencha com os dados do seu projeto no Supabase
// Abra seu projeto no Supabase -> Settings -> API -> Project URL e Anon public key.
const SUPABASE_URL = "https://lptszaqkrxtliupaostb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FO7TTEmF1yZtWz0oVZiBZg_JjEktGl2";

// 2) Nome da tabela (recomendado: public.tarefas)
const TABELA_TAREFAS = "tasks";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const escapeHtml = (str) =>
    String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

document.addEventListener("DOMContentLoaded", () => {
    const campoTarefa = document.getElementById("campo-tarefa");
    const botaoAdicionar = document.getElementById("botao-adicionar");
    const listaTarefas = document.getElementById("lista-tarefas");

    const validarConfigSupabase = () => {
        if (!SUPABASE_URL || SUPABASE_URL.includes("COLE_AQUI")) {
            alert("Configure `SUPABASE_URL` no arquivo `script.js`.");
            return false;
        }
        if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes("COLE_AQUI")) {
            alert("Configure `SUPABASE_ANON_KEY` no arquivo `script.js`.");
            return false;
        }
        return true;
    };

    const renderizarTarefa = (tarefa) => {
        const itemTarefa = document.createElement("li");
        itemTarefa.className = "tarefa" + (tarefa.concluida ? " concluida" : "");
        itemTarefa.dataset.id = tarefa.id;
        itemTarefa.innerHTML = `
            <span>${escapeHtml(tarefa.texto)}</span>
            <button>Remover</button>
        `;

        const span = itemTarefa.querySelector("span");
        const botaoRemover = itemTarefa.querySelector("button");

        span.addEventListener("click", async () => {
            const novaConcluida = !tarefa.concluida;
            const { error } = await supabase
                .from(TABELA_TAREFAS)
                .update({ concluida: novaConcluida })
                .eq("id", tarefa.id);

            if (error) {
                console.error("Erro ao atualizar tarefa:", error);
                alert("Não foi possível atualizar a tarefa.");
                return;
            }

            tarefa.concluida = novaConcluida;
            itemTarefa.classList.toggle("concluida", novaConcluida);
        });

        botaoRemover.addEventListener("click", async () => {
            const ok = confirm("Remover esta tarefa?");
            if (!ok) return;

            const { error } = await supabase
                .from(TABELA_TAREFAS)
                .delete()
                .eq("id", tarefa.id);

            if (error) {
                console.error("Erro ao remover tarefa:", error);
                alert("Não foi possível remover a tarefa.");
                return;
            }

            itemTarefa.remove();
        });

        return itemTarefa;
    };

    const carregarTarefas = async () => {
        const { data, error } = await supabase
            .from(TABELA_TAREFAS)
            .select("id, texto, concluida, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao carregar tarefas:", error);
            alert("Erro ao carregar tarefas do Supabase.");
            return;
        }

        listaTarefas.innerHTML = "";
        (data || []).forEach((tarefa) => listaTarefas.appendChild(renderizarTarefa(tarefa)));
    };

    const adicionarTarefa = async () => {
        const textoTarefa = campoTarefa.value.trim();

        if (textoTarefa === "") {
            campoTarefa.classList.add("invalid");
            alert("Por favor, digite uma tarefa!");
            return;
        }

        // Insere no banco (RLS precisa permitir INSERT para `anon` ou para o usuário logado)
        const { data, error } = await supabase
            .from(TABELA_TAREFAS)
            .insert({ texto: textoTarefa, concluida: false })
            .select("id, texto, concluida, created_at")
            .single();

        if (error) {
            console.error("Erro ao inserir tarefa:", error);
            alert("Não foi possível adicionar a tarefa.");
            return;
        }

        listaTarefas.prepend(renderizarTarefa(data));
        campoTarefa.value = "";
        campoTarefa.classList.remove("invalid");
    };

    if (!validarConfigSupabase()) return;

    botaoAdicionar.addEventListener("click", adicionarTarefa);

    campoTarefa.addEventListener("keyup", (event) => {
        if (event.key === "Enter") adicionarTarefa();
    });

    carregarTarefas();
});
