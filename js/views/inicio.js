PASO.newView({
    name: 'Início',
    icon: 'home',

    main(container) {
        const stats = [
            { label: 'Contatos',    value: '128',  icon: 'group'          },
            { label: 'Tarefas',     value: '34',   icon: 'task_alt'       },
            { label: 'Pendentes',   value: '7',    icon: 'pending_actions' },
            { label: 'Concluídas',  value: '27',   icon: 'check_circle'   },
        ]

        const recentes = [
            { nome: 'Ana Lima',      acao: 'adicionou um contato',   tempo: '2 min atrás'  },
            { nome: 'Pedro Souza',   acao: 'concluiu uma tarefa',     tempo: '15 min atrás' },
            { nome: 'Julia Ferraz',  acao: 'criou uma nova lista',    tempo: '1 hora atrás' },
            { nome: 'Carlos Mota',   acao: 'atualizou configurações', tempo: '3 horas atrás'},
            { nome: 'Beatriz Alves', acao: 'adicionou um contato',   tempo: 'ontem'        },
        ]

        container.innerHTML = `
            <div>
                <h1 class="p-title piece-surface text-color-auto-22">Início</h1>
                <p class="p-subtitle piece-surface text-color-auto-14" style="margin-top:4px">Visão geral da aplicação</p>
            </div>

            <div>
                <span class="p-section-label piece-surface text-color-auto-14">Resumo</span>
                <div class="p-card-grid" style="margin-top:10px">
                    ${stats.map(s => `
                    <div class="p-card piece-surface
                        background-color-auto-03
                        border-color-auto-05
                        text-color-auto-20">
                        <span class="material-symbols-rounded piece-surface text-color-auto-12" style="font-size:20px">${s.icon}</span>
                        <span class="piece-surface text-color-auto-22" style="font-size:24px;font-weight:700">${s.value}</span>
                        <span class="piece-surface text-color-auto-14" style="font-size:12px">${s.label}</span>
                    </div>`).join('')}
                </div>
            </div>

            <div>
                <span class="p-section-label piece-surface text-color-auto-14">Atividade recente</span>
                <div class="p-list piece-surface border-color-auto-05" style="margin-top:10px">
                    ${recentes.map(r => `
                    <div class="p-list-item piece-surface
                        background-color-auto-00
                        background-color-auto-03-hover
                        border-color-auto-05">
                        <span class="material-symbols-rounded piece-surface text-color-auto-12" style="font-size:18px">person</span>
                        <div class="p-list-item-info">
                            <span class="p-list-item-name piece-surface text-color-auto-20">${r.nome}</span>
                            <span class="p-list-item-sub piece-surface text-color-auto-14">${r.acao}</span>
                        </div>
                        <span class="piece-surface text-color-auto-12" style="font-size:11px;white-space:nowrap">${r.tempo}</span>
                    </div>`).join('')}
                </div>
            </div>
        `
    }
})
