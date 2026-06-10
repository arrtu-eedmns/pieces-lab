// PASO — Pieces App Shell Operation
// Gerencia o shell da aplicação: roteamento hash, views, storage e simulador de tela.

const PASO = {

    name: 'Pieces Lab',
    views: [],
    currentView: null,

    // ── Utilitários DOM ──────────────────────────────────────────────────────
    $:  (sel, ctx = document) => ctx.querySelector(sel),
    $$: (sel, ctx = document) => [...ctx.querySelectorAll(sel)],

    slug: str => str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'),

    // ── Registro de views ────────────────────────────────────────────────────
    newView(config) {
        this.views.push(config)
    },

    // ── Renderiza view a partir do hash ──────────────────────────────────────
    renderView(hash) {
        const [viewSlug, ...params] = decodeURIComponent(hash)
            .replace(/^#?\/?(.*?)\/?$/, '$1')
            .split('/')
            .filter(Boolean)

        const view = this.views.find(v => this.slug(v.name) === viewSlug)

        if (!view) {
            this.$('#p-main').innerHTML = '<p style="padding:24px">Página não encontrada</p>'
            return
        }

        this.currentView = view
        document.title = `${this.name} — ${view.name}`

        // Atualiza título no header mobile
        const titleEl = this.$('#p-page-title')
        if (titleEl) titleEl.textContent = view.name

        // Cria container da view
        const id = `view-${this.slug(view.name)}`
        this.$('#p-main').innerHTML = `<section id="${id}"></section>`

        // Executa a view passando o container e os params
        view.main(this.$(`#${id}`), params)

        // Atualiza estado ativo na nav
        this.$$('[data-nav]').forEach(btn =>
            btn.classList.toggle('piece-actived', btn.dataset.nav === viewSlug)
        )
    },

    // ── Navegação programática ───────────────────────────────────────────────
    navigate(viewName, ...params) {
        const parts = [this.slug(viewName), ...params].join('/')
        location.hash = parts
    },

    // ── Constrói a nav ───────────────────────────────────────────────────────
    _buildNav() {
        const navAside  = this.$('#p-nav')
        const navHeader = this.$('#p-header-nav')

        const asideBtns = this.views.map(v => {
            const s = this.slug(v.name)
            return `
            <button
                class="p-nav-btn piece-button piece-toggle piece-surface piece-medium
                    background-color-auto-00
                    background-color-auto-04-hover
                    background-color-auto-05-active
                    background-color-auto-06-hover-active
                    text-color-auto-16
                    text-color-auto-22-active
                    piece-primary-active"
                data-nav="${s}"
                onclick="location.hash='${s}'">
                <span class="piece-ripple"></span>
                <span class="material-symbols-rounded piece-icon">${v.icon}</span>
                <span class="piece-label p-nav-label">${v.name}</span>
            </button>`
        }).join('')

        // Header mobile: icon-buttons
        const headerBtns = this.views.map(v => {
            const s = this.slug(v.name)
            return `
            <button
                class="piece-icon-button piece-toggle piece-surface piece-medium
                    background-color-auto-00
                    background-color-auto-04-hover
                    background-color-auto-05-active
                    text-color-auto-16
                    text-color-auto-22-active
                    piece-primary-active"
                data-nav="${s}"
                onclick="location.hash='${s}'">
                <span class="piece-ripple"></span>
                <span class="material-symbols-rounded piece-icon">${v.icon}</span>
            </button>`
        }).join('')

        if (navAside)  navAside.innerHTML  = asideBtns
        if (navHeader) navHeader.innerHTML = headerBtns
    },

    // ── Screen-size simulator ────────────────────────────────────────────────
    _buildSizeBar() {
        const sizes = [
            { label: 'default', cls: 'screen-size-default' },
            { label: 'mobile',  cls: 'screen-size-mobile'  },
            { label: 'svga',    cls: 'screen-size-svga'    },
            { label: 'hd',      cls: 'screen-size-hd'      },
            { label: 'fullhd',  cls: 'screen-size-fullhd'  },
        ]

        const container = this.$('#p-size-btns')
        if (!container) return

        const current = PASO.storage.screenSize.get()

        container.innerHTML = sizes.map(s => `
            <button
                class="piece-button piece-toggle piece-surface piece-extra-small
                    background-color-auto-04
                    background-color-auto-06-hover
                    background-color-auto-11-active
                    background-color-auto-12-hover-active
                    text-color-auto-18
                    text-color-auto-02-active
                    ${s.label === current ? 'piece-actived' : ''}"
                data-size="${s.label}"
                onclick="PASO._setSize('${s.label}')">
                <span class="piece-ripple"></span>
                <span class="piece-label">${s.label}</span>
            </button>
        `).join('')

        this._applySize(current)
    },

    _setSize(label) {
        PASO.storage.screenSize.set(label)
        PASO.$$('[data-size]').forEach(btn =>
            btn.classList.toggle('piece-actived', btn.dataset.size === label)
        )
        PASO._applySize(label)
    },

    _applySize(label) {
        // Sempre aplica a classe correta — html usa :has(body.screen-size-*)
        // para redimensionar junto, fazendo @container reagir ao tamanho simulado.
        // 'default' recebe sua própria classe (width/height: 100%).
        const all = ['screen-size-default','screen-size-mobile','screen-size-svga','screen-size-hd','screen-size-fullhd']
        document.body.classList.remove(...all)
        document.body.classList.add(`screen-size-${label}`)
    },

    // ── Dark mode ────────────────────────────────────────────────────────────
    toggleDark() {
        PASO.storage.darkMode.set()
        const dark = PASO.storage.darkMode.get()
        document.body.classList.toggle('piece-dark',  dark)
        document.body.classList.toggle('piece-light', !dark)
    },

    // ── Init ─────────────────────────────────────────────────────────────────
    init() {
        // Tema inicial
        const dark = this.storage.darkMode.get()
        document.body.classList.toggle('piece-dark',  dark)
        document.body.classList.toggle('piece-light', !dark)

        this._buildNav()
        this._buildSizeBar()

        // Rota inicial
        let initial = location.hash.replace(/^#/, '')
        if (!initial && this.views.length) {
            initial = this.slug(this.views[0].name)
            history.replaceState(null, '', `#${initial}`)
        }

        this.renderView(initial)

        window.addEventListener('hashchange', () =>
            this.renderView(location.hash.replace(/^#/, ''))
        )
    }
}

// ── Storage ───────────────────────────────────────────────────────────────────
PASO.storage = (() => {
    const KEY      = 'pieces-lab'
    const defaults = { dark: false, screenSize: 'default' }

    const read  = ()    => { try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return { ...defaults } } }
    const write = data  => localStorage.setItem(KEY, JSON.stringify(data))

    return {
        darkMode: {
            get()  { return read().dark },
            set()  { const d = read(); d.dark = !d.dark; write(d) }
        },
        screenSize: {
            get()       { return read().screenSize },
            set(value)  { const d = read(); d.screenSize = value; write(d) }
        }
    }
})()
