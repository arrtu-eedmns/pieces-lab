PASO.newView({
    name: 'Configurações',
    icon: 'settings',

    main(container) {
        const hues = [
            { label: 'Índigo',   hue: 248, icon: 'circle' },
            { label: 'Roxo',     hue: 280, icon: 'circle' },
            { label: 'Rosa',     hue: 330, icon: 'circle' },
            { label: 'Laranja',  hue: 25,  icon: 'circle' },
            { label: 'Verde',    hue: 150, icon: 'circle' },
            { label: 'Ciano',    hue: 195, icon: 'circle' },
        ]

        const isDark    = PASO.storage.darkMode.get()
        const savedHue  = PASO.storage.hue?.get() ?? 248

        container.innerHTML = `
            <div>
                <h1 class="p-title piece-surface text-color-auto-22">Configurações</h1>
                <p class="p-subtitle piece-surface text-color-auto-14" style="margin-top:4px">Preferências do lab</p>
            </div>

            <!-- Aparência -->
            <div>
                <span class="p-section-label piece-surface text-color-auto-14">Aparência</span>
                <div class="piece-surface background-color-auto-03 border-color-auto-05"
                     style="margin-top:10px; border-radius:14px; border-width:1px; border-style:solid; overflow:hidden">

                    <div class="p-setting-row piece-surface border-color-auto-05">
                        <div class="p-setting-info">
                            <span class="p-setting-name piece-surface text-color-auto-20">Modo escuro</span>
                            <span class="p-setting-desc piece-surface text-color-auto-14">Alterna entre tema claro e escuro</span>
                        </div>
                        <button id="cfg-dark-switch" class="piece-switch piece-surface piece-toggle
                            background-color-auto-02 background-color-auto-11-active
                            border-color-auto-08    border-color-auto-11-active
                            ripple-color-auto-14    ripple-color-auto-02-active
                            ${isDark ? 'piece-actived' : ''}"
                            onclick="PASO.toggleDark()">
                            <span class="piece-ripple"></span>
                            <span class="piece-indicator piece-surface piece-parent
                                background-color-auto-12 background-color-auto-02-active
                                text-color-auto-02       text-color-auto-11-active">
                                <span class="material-symbols-rounded piece-icon piece-false" translate="no">light_mode</span>
                                <span class="material-symbols-rounded piece-icon piece-true"  translate="no">dark_mode</span>
                            </span>
                        </button>
                    </div>

                </div>
            </div>

            <!-- Cor base -->
            <div>
                <span class="p-section-label piece-surface text-color-auto-14">Cor base</span>
                <p class="piece-surface text-color-auto-14" style="font-size:12px;margin-top:4px;margin-bottom:10px">
                    Define o <code>--piece-base-h</code> global da aplicação
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:8px">
                    ${hues.map(h => `
                    <button
                        class="piece-button piece-toggle piece-surface piece-small
                            background-color-auto-04
                            background-color-auto-06-hover
                            background-color-auto-11-active
                            background-color-auto-12-hover-active
                            text-color-auto-18
                            text-color-auto-02-active
                            ${savedHue === h.hue ? 'piece-actived' : ''}"
                        data-hue="${h.hue}"
                        onclick="PASO._setHue(${h.hue})">
                        <span class="piece-ripple"></span>
                        <span style="
                            width:10px; height:10px; border-radius:50%; flex-shrink:0;
                            background: hsl(${h.hue}, 60%, 55%);
                        "></span>
                        <span class="piece-label">${h.label}</span>
                    </button>`).join('')}
                </div>
            </div>

            <!-- Simulador de tela -->
            <div>
                <span class="p-section-label piece-surface text-color-auto-14">Simulador de tela</span>
                <p class="piece-surface text-color-auto-14" style="font-size:12px;margin-top:4px">
                    Também disponível no canto inferior direito da tela.
                </p>
            </div>
        `
    }
})

// ── Extensão do storage para hue ─────────────────────────────────────────────
PASO.storage.hue = {
    get()       { try { return JSON.parse(localStorage.getItem('pieces-lab'))?.hue ?? 248 } catch { return 248 } },
    set(value)  { const d = JSON.parse(localStorage.getItem('pieces-lab') || '{}'); d.hue = value; localStorage.setItem('pieces-lab', JSON.stringify(d)) }
}

// ── Altera cor base globalmente ───────────────────────────────────────────────
PASO._setHue = function(hue) {
    document.documentElement.style.setProperty('--piece-base-h', hue)
    PASO.storage.hue.set(hue)
    PASO.$$('[data-hue]').forEach(btn =>
        btn.classList.toggle('piece-actived', Number(btn.dataset.hue) === hue)
    )
}

// Aplica hue salvo ao carregar
document.addEventListener('DOMContentLoaded', () => {
    const saved = PASO.storage.hue.get()
    if (saved !== 248) document.documentElement.style.setProperty('--piece-base-h', saved)
})
