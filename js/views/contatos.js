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

if (!document.getElementById('ct-style')) {
    const s = document.createElement('style')
    s.id = 'ct-style'
    s.textContent = `
        .ct-wrap {
            display: flex;
            height: 100%;
            overflow: hidden;
        }
        .ct-list-panel {
            flex: 1;
            min-width: 0;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }
        .ct-list-header {
            padding: 24px 24px 12px;
            flex-shrink: 0;
        }
        .ct-list-items {
            padding: 0 24px 24px;
        }
        .ct-detail-panel {
            display: none;
            flex-direction: column;
            width: 300px;
            flex-shrink: 0;
            overflow-y: auto;
            border-left-width: 1px;
            border-left-style: solid;
        }
        @container slot (min-width: 500px) {
            .ct-detail-panel { display: flex; }
        }
        .ct-detail-empty {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            opacity: .45;
            padding: 32px;
        }
        .ct-detail-content {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .ct-item-selected {
            background-color: hsl(var(--piece-base-h), calc(var(--piece-s) * 1.2), 90%) !important;
        }
        html:has(body.piece-dark) .ct-item-selected {
            background-color: hsl(var(--piece-base-h), calc(var(--piece-s) * 1.2), 16%) !important;
        }
    `
    document.head.appendChild(s)
}

// Seleção por slot — sobrevive entre re-renders (openPanel re-chama main)
const selectedBySlot = new Map()
// Um único ResizeObserver por slot — evita acúmulo de observers obsoletos
const slotObservers  = new Map()

// ── View: lista de contatos ───────────────────────────────
PASO.newView({
    name: 'Contatos',
    icon: 'group',

    main(container, viewParams = {}) {
        container.style.cssText = 'padding:0;height:100%;overflow:hidden;min-height:0;gap:0;'

        // slotEl/slotId capturados agora — container está no DOM neste momento
        const slotEl = container.closest('[data-slot]')
        const slotId = slotEl?.dataset.slot

        // Semente vinda da URL (link compartilhado ou reload)
        if (viewParams.id !== undefined) {
            const pid = parseInt(viewParams.id)
            if (!isNaN(pid)) selectedBySlot.set(slotId, pid)
        }

        const renderDetailContent = (id, targetSlotEl) => {
            const c     = CONTATOS[id]
            const panel = slotEl?.querySelector('.ct-detail-panel')
            if (!panel) return
            panel.innerHTML = `
                <div class="ct-detail-content">
                    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:8px">
                        <div style="
                            width:72px;height:72px;border-radius:50%;
                            display:grid;place-content:center;
                            font-size:26px;font-weight:700;color:#fff;
                            flex-shrink:0;
                            background:hsl(${c.h},50%,48%)">
                            ${c.nome.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div style="text-align:center">
                            <div class="piece-surface text-color-auto-22" style="font-size:18px;font-weight:700">${c.nome}</div>
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
                </div>
            `
        }

        const selectContact = (id, btn) => {
            const btnSlotEl = btn.closest('[data-slot]')
            const btnSlotId = btnSlotEl?.dataset.slot
            const wide      = btnSlotEl ? btnSlotEl.offsetWidth >= 500 : false

            // Persiste seleção — sobrevive a re-renders e vai para a URL
            selectedBySlot.set(btnSlotId, id)
            PASO.setViewParams({ id: String(id) }, btnSlotId)

            btnSlotEl?.querySelectorAll('.ct-item').forEach((el, i) =>
                el.classList.toggle('ct-item-selected', i === id)
            )

            if (wide) {
                renderDetailContent(id, btnSlotEl)
            } else {
                PASO.openPanel('detalhe-contato', { id: String(id) })
            }
        }

        container.innerHTML = `
            <div class="ct-wrap">
                <div class="ct-list-panel">
                    <div class="ct-list-header">
                        <h1 class="p-title piece-surface text-color-auto-22">Contatos</h1>
                        <p class="p-subtitle piece-surface text-color-auto-14" style="margin-top:4px">${CONTATOS.length} pessoas</p>
                    </div>
                    <div class="ct-list-items">
                        <div class="p-list piece-surface border-color-auto-05">
                            ${CONTATOS.map((c, i) => `
                            <button
                                class="ct-item p-list-item piece-surface
                                    background-color-auto-00
                                    background-color-auto-03-hover
                                    border-color-auto-05
                                    text-color-auto-20"
                                style="width:100%;text-align:left;cursor:pointer;"
                                data-i="${i}">
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
                    </div>
                </div>

                <div class="ct-detail-panel piece-surface background-color-auto-01 piece-border border-color-auto-05">
                    <div class="ct-detail-empty">
                        <span class="material-symbols-rounded piece-surface text-color-auto-12" style="font-size:36px">person</span>
                        <span class="piece-surface text-color-auto-14" style="font-size:13px;text-align:center">Selecione um contato</span>
                    </div>
                </div>
            </div>
        `

        container.querySelectorAll('.ct-item').forEach((el, i) =>
            el.addEventListener('click', (e) => selectContact(i, e.currentTarget))
        )

        // Restaura seleção anterior (re-render após openPanel, navegação, etc.)
        const prevId = selectedBySlot.get(slotId)
        if (prevId !== null && prevId !== undefined && slotEl) {
            const wide = slotEl.offsetWidth >= 500
            if (wide) {
                PASO.setViewParams({ id: String(prevId) }, slotId)
                renderDetailContent(prevId, slotEl)
                slotEl.querySelectorAll('.ct-item').forEach((el, i) =>
                    el.classList.toggle('ct-item-selected', i === prevId)
                )
            }
        }

        // Um observer por slot — desconecta o anterior antes de criar novo
        slotObservers.get(slotId)?.disconnect()

        if (slotEl) {
            let wasWide = null  // inicializado no primeiro fire (usa contentRect, evita mismatch com offsetWidth)
            const obs = new ResizeObserver(entries => {
                const w      = entries[0]?.contentRect.width ?? 0
                const isWide = w >= 500
                if (wasWide === null) { wasWide = isWide; return }  // primeira observação: apenas inicializa
                if (isWide === wasWide) return
                wasWide = isWide

                if (!isWide) {
                    // Largo → estreito: abre painel overlay
                    const sel = selectedBySlot.get(slotId)
                    if (sel === undefined) return
                    if (PASO._slots.find(s => s.id === slotId)?.panelName) return
                    obs.disconnect()
                    slotObservers.delete(slotId)
                    PASO.openPanel('detalhe-contato', { id: String(sel) }, slotId, { silent: true })
                } else {
                    // Estreito → largo: fecha painel e/ou restaura detalhe inline
                    const slotState = PASO._slots.find(s => s.id === slotId)
                    const sel       = selectedBySlot.get(slotId)
                    const hasPanel  = slotState?.panelName === 'detalhe-contato'
                    if (!hasPanel && sel === undefined) return
                    obs.disconnect()
                    slotObservers.delete(slotId)
                    const slots = PASO._slots.map(s =>
                        s.id === slotId ? { ...s, panelName: null, panelParams: {} } : s
                    )
                    history.replaceState({ id: PASO._navId }, '', `#${PASO._buildHash(slots)}`)
                    PASO.renderAll(slots, false, true)
                }
            })
            obs.observe(slotEl)
            slotObservers.set(slotId, obs)
        }
    }
})

// ── Painel: detalhe de contato (modo estreito) ────────────
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
