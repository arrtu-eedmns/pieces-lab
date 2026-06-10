PASO.newView({
    name: 'Contatos',
    icon: 'group',

    main(container) {
        const contatos = [
            { nome: 'Ana Lima',       cargo: 'Designer',          inicial: 'A', hue: 340 },
            { nome: 'Pedro Souza',    cargo: 'Desenvolvedor',      inicial: 'P', hue: 210 },
            { nome: 'Julia Ferraz',   cargo: 'Product Manager',    inicial: 'J', hue: 150 },
            { nome: 'Carlos Mota',    cargo: 'DevOps',             inicial: 'C', hue: 30  },
            { nome: 'Beatriz Alves',  cargo: 'QA Engineer',        inicial: 'B', hue: 270 },
            { nome: 'Lucas Pereira',  cargo: 'Designer',           inicial: 'L', hue: 190 },
            { nome: 'Mariana Costa',  cargo: 'Desenvolvedor',      inicial: 'M', hue: 60  },
            { nome: 'Rafael Torres',  cargo: 'Product Manager',    inicial: 'R', hue: 0   },
        ]

        container.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:16px">
                <div>
                    <h1 class="p-title piece-surface text-color-auto-22">Contatos</h1>
                    <p class="p-subtitle piece-surface text-color-auto-14" style="margin-top:4px">${contatos.length} pessoas</p>
                </div>
                <button class="piece-button piece-surface piece-medium piece-primary
                    background-color-auto-11
                    background-color-auto-12-hover
                    text-color-auto-00">
                    <span class="piece-ripple"></span>
                    <span class="material-symbols-rounded piece-icon">person_add</span>
                    <span class="piece-label">Novo</span>
                </button>
            </div>

            <div class="p-list piece-surface border-color-auto-05">
                ${contatos.map(c => `
                <div class="p-list-item piece-surface
                    background-color-auto-00
                    background-color-auto-03-hover
                    border-color-auto-05"
                    onclick="PASO.navigate('contatos', '${PASO.slug(c.nome)}')">
                    <div style="
                        width:36px; height:36px; border-radius:50%;
                        display:grid; place-items:center; flex-shrink:0;
                        font-size:14px; font-weight:700;
                        background: hsl(${c.hue}, 60%, 88%);
                        color: hsl(${c.hue}, 50%, 30%);
                    ">${c.inicial}</div>
                    <div class="p-list-item-info">
                        <span class="p-list-item-name piece-surface text-color-auto-20">${c.nome}</span>
                        <span class="p-list-item-sub piece-surface text-color-auto-14">${c.cargo}</span>
                    </div>
                    <span class="material-symbols-rounded piece-surface text-color-auto-10" style="font-size:18px">chevron_right</span>
                </div>`).join('')}
            </div>
        `
    }
})
