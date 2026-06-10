;(() => {

const CONTATOS = [
    { nome: 'Ana Lima',      cargo: 'Designer UX',          dept: 'Produto',        email: 'ana@exemplo.com',    telefone: '+55 11 99000-0001', h: 340 },
    { nome: 'Pedro Souza',   cargo: 'Engenheiro Front',     dept: 'Tecnologia',     email: 'pedro@exemplo.com',  telefone: '+55 11 99000-0002', h: 200 },
    { nome: 'Julia Ferraz',  cargo: 'Product Manager',      dept: 'Produto',        email: 'julia@exemplo.com',  telefone: '+55 11 99000-0003', h: 160 },
    { nome: 'Carlos Mota',   cargo: 'Backend Engineer',     dept: 'Tecnologia',     email: 'carlos@exemplo.com', telefone: '+55 11 99000-0004', h: 30  },
    { nome: 'Beatriz Alves', cargo: 'Designer Visual',      dept: 'Marketing',      email: 'bia@exemplo.com',    telefone: '+55 11 99000-0005', h: 280 },
    { nome: 'Rafael Torres', cargo: 'DevOps Engineer',      dept: 'Infraestrutura', email: 'rafael@exemplo.com', telefone: '+55 11 99000-0006', h: 60  },
    { nome: 'Camila Nunes',  cargo: 'Data Scientist',       dept: 'Analytics',      email: 'camila@exemplo.com', telefone: '+55 11 99000-0007', h: 120 },
    { nome: 'Diego Lopes',   cargo: 'Scrum Master',         dept: 'Produto',        email: 'diego@exemplo.com',  telefone: '+55 11 99000-0008', h: 220 },
]

// ── View: lista de contatos ───────────────────────────────
PASO.newView({
    name: 'Contatos',
    icon: 'group',

    main(container) {
        container.innerHTML = `
            <div>
                <h1 class="p-title piece-surface text-color-auto-22">Contatos</h1>
                <p class="p-subtitle piece-surface text-color-auto-14" style="margin-top:4px">${CONTATOS.length} pessoas</p>
            </div>

            <div class="p-list piece-surface border-color-auto-05">
                ${CONTATOS.map((c, i) => `
                <button
                    class="p-list-item piece-surface
                        background-color-auto-00
                        background-color-auto-03-hover
                        border-color-auto-05
                        text-color-auto-20"
                    style="width:100%;text-align:left;cursor:pointer;"
                    onclick="PASO.openPanel('detalhe-contato', { id: '${i}' })">
                    <div style="
                        width:38px;height:38px;border-radius:50%;flex-shrink:0;
                        display:grid;place-content:center;
                        font-size:14px;font-weight:700;color:#fff;
                        background:hsl(${c.h},50%,48%)">${c.nome.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                    <div class="p-list-item-info">
                        <span class="p-list-item-name piece-surface text-color-auto-20">${c.nome}</span>
                        <span class="p-list-item-sub piece-surface text-color-auto-14">${c.cargo}</span>
                    </div>
                    <span class="material-symbols-rounded piece-surface text-color-auto-12" style="font-size:18px">chevron_right</span>
                </button>`).join('')}
            </div>
        `
    }
})

// ── Painel: detalhe de contato ────────────────────────────
PASO.newPanel({
    name: 'detalhe-contato',
    title: 'Contato',

    main(container, params) {
        const c = CONTATOS[parseInt(params.id ?? '0')]
        if (!c) { container.innerHTML = '<p style="padding:24px">Contato não encontrado</p>'; return }

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 0 16px">
                <div style="
                    width:72px;height:72px;border-radius:50%;
                    display:grid;place-content:center;
                    font-size:26px;font-weight:700;color:#fff;
                    background:hsl(${c.h},50%,48%)">
                    ${c.nome.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div style="text-align:center">
                    <div class="piece-surface text-color-auto-22" style="font-size:20px;font-weight:700">${c.nome}</div>
                    <div class="piece-surface text-color-auto-14" style="font-size:13px;margin-top:2px">${c.cargo} · ${c.dept}</div>
                </div>
            </div>

            <div class="p-list piece-surface border-color-auto-05">
                <div class="p-list-item piece-surface background-color-auto-00 border-color-auto-05" style="cursor:default">
                    <span class="material-symbols-rounded piece-surface text-color-auto-12" style="font-size:18px">mail</span>
                    <div class="p-list-item-info">
                        <span class="p-list-item-sub piece-surface text-color-auto-14">Email</span>
                        <span class="p-list-item-name piece-surface text-color-auto-20">${c.email}</span>
                    </div>
                </div>
                <div class="p-list-item piece-surface background-color-auto-00 border-color-auto-05" style="cursor:default">
                    <span class="material-symbols-rounded piece-surface text-color-auto-12" style="font-size:18px">phone</span>
                    <div class="p-list-item-info">
                        <span class="p-list-item-sub piece-surface text-color-auto-14">Telefone</span>
                        <span class="p-list-item-name piece-surface text-color-auto-20">${c.telefone}</span>
                    </div>
                </div>
                <div class="p-list-item piece-surface background-color-auto-00 border-color-auto-05" style="cursor:default">
                    <span class="material-symbols-rounded piece-surface text-color-auto-12" style="font-size:18px">apartment</span>
                    <div class="p-list-item-info">
                        <span class="p-list-item-sub piece-surface text-color-auto-14">Departamento</span>
                        <span class="p-list-item-name piece-surface text-color-auto-20">${c.dept}</span>
                    </div>
                </div>
            </div>
        `
    }
})

})()
