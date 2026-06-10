// PASO — Pieces App Shell Operation
// Gerencia o shell da aplicação: roteamento hash, views, painéis, storage e simulador de tela.

const PASO = {

    name: 'Pieces Lab',
    views: [],
    panels: [],
    currentView: null,
    currentPanel: null,
    _navId: 0,
    _initialized: false,
    _fromPopstate: false,

    // ── Utilitários DOM ──────────────────────────────────────────────────────
    $:  (sel, ctx = document) => ctx.querySelector(sel),
    $$: (sel, ctx = document) => [...ctx.querySelectorAll(sel)],

    slug: str => str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'),

    // ── Registro ─────────────────────────────────────────────────────────────
    newView(config) {
        this.views.push(config)
    },

    newPanel(config) {
        this.panels.push(config)
    },

    // ── Parse do hash ─────────────────────────────────────────────────────────
    // Formato: #viewSlug[/param1][/param2][?panel=name&key=val]
    _parseHash(raw) {
        const clean = decodeURIComponent(raw.replace(/^#/, ''))
        const [pathPart = '', queryPart = ''] = clean.split('?')
        const segments = pathPart.replace(/^\/?(.*?)\/?$/, '$1').split('/').filter(Boolean)
        const query    = new URLSearchParams(queryPart)
        return {
            viewSlug:   segments[0] || '',
            viewParams: segments.slice(1),
            panelName:  query.get('panel'),
            panelParams: Object.fromEntries(query.entries()),
        }
    },

    // ── Renderiza view + painel ───────────────────────────────────────────────
    renderView(hash, isBack = false) {
        document.documentElement.dataset.vtDir = isBack ? 'back' : 'forward'

        const parsed = this._parseHash(hash)

        const doRender = () => {
            this._doRenderView(parsed)
            parsed.panelName
                ? this._doRenderPanel(parsed.panelName, parsed.panelParams)
                : this._doClosePanel()
        }

        if (this._initialized && document.startViewTransition) {
            document.startViewTransition(doRender)
        } else {
            doRender()
        }
    },

    _doRenderView({ viewSlug, viewParams }) {
        const view    = this.views.find(v => this.slug(v.name) === viewSlug)
        const primary = this.$('#p-main-primary')

        if (!view) {
            primary.innerHTML = '<p style="padding:24px">Página não encontrada</p>'
            return
        }

        this.currentView = view
        document.title = `${this.name} — ${view.name}`

        const titleEl = this.$('#p-page-title')
        if (titleEl) titleEl.textContent = view.name

        const id = `view-${this.slug(view.name)}`
        primary.innerHTML = `<section id="${id}"></section>`
        view.main(this.$(`#${id}`), viewParams)

        this.$$('[data-nav]').forEach(btn =>
            btn.classList.toggle('piece-actived', btn.dataset.nav === viewSlug)
        )
    },

    // ── Painel secundário ─────────────────────────────────────────────────────
    _doRenderPanel(panelName, params) {
        const panel     = this.panels.find(p => this.slug(p.name) === panelName)
        const secondary = this.$('#p-main-secondary')

        if (!panel) return

        this.currentPanel = panel

        const id = `panel-${this.slug(panel.name)}`
        secondary.innerHTML = `
            <div id="p-panel-header" class="piece-surface background-color-auto-02 piece-border border-color-auto-05">
                <button
                    class="piece-surface piece-icon-button piece-medium
                        background-color-auto-00 background-color-auto-04-hover
                        text-color-auto-20"
                    onclick="PASO.closePanel()">
                    <span class="piece-ripple"></span>
                    <span class="material-symbols-rounded piece-icon">arrow_back</span>
                </button>
                <span id="p-panel-title" class="piece-surface text-color-auto-20">${panel.title || panel.name}</span>
            </div>
            <section id="${id}"></section>
        `

        panel.main(this.$(`#${id}`), params)
        secondary.classList.add('piece-actived')
    },

    _doClosePanel() {
        const secondary = this.$('#p-main-secondary')
        if (!secondary) return
        secondary.classList.remove('piece-actived')
        secondary.innerHTML = ''
        this.currentPanel = null
    },

    // ── Navegação ─────────────────────────────────────────────────────────────
    navigate(viewName, ...params) {
        const hash = [this.slug(viewName), ...params].join('/')
        if (location.hash === `#${hash}`) return
        this._navId++
        history.pushState({ id: this._navId }, '', `#${hash}`)
        this.renderView(hash, false)
    },

    openPanel(panelName, params = {}) {
        const basePath = location.hash.replace(/^#/, '').split('?')[0]
        const query    = new URLSearchParams({ panel: this.slug(panelName), ...params })
        const hash     = `${basePath}?${query}`
        this._navId++
        history.pushState({ id: this._navId }, '', `#${hash}`)
        this.renderView(hash, false)
    },

    closePanel() {
        if ((history.state?.id ?? 0) > 0) {
            history.back()  // popstate vai disparar com isBack = true
        } else {
            const hash = location.hash.replace(/^#/, '').split('?')[0]
            this._navId++
            history.pushState({ id: this._navId }, '', `#${hash}`)
            this.renderView(hash, true)
        }
    },

    // ── Nav ───────────────────────────────────────────────────────────────────
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
                onclick="PASO.navigate('${v.name}')">
                <span class="piece-ripple"></span>
                <span class="material-symbols-rounded piece-icon">${v.icon}</span>
                <span class="piece-label p-nav-label">${v.name}</span>
            </button>`
        }).join('')

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
                onclick="PASO.navigate('${v.name}')">
                <span class="piece-ripple"></span>
                <span class="material-symbols-rounded piece-icon">${v.icon}</span>
            </button>`
        }).join('')

        if (navAside)  navAside.innerHTML  = asideBtns
        if (navHeader) navHeader.innerHTML = headerBtns
    },

    // ── Screen-size simulator ─────────────────────────────────────────────────
    _buildSizeBar() {
        const sizes = [
            { label: 'default' },
            { label: 'mobile'  },
            { label: 'svga'    },
            { label: 'hd'      },
            { label: 'fullhd'  },
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
        const all = ['screen-size-default','screen-size-mobile','screen-size-svga','screen-size-hd','screen-size-fullhd']
        document.body.classList.remove(...all)
        document.body.classList.add(`screen-size-${label}`)
    },

    // ── Dark mode ─────────────────────────────────────────────────────────────
    toggleDark() {
        PASO.storage.darkMode.set()
        const dark = PASO.storage.darkMode.get()
        document.body.classList.toggle('piece-dark',  dark)
        document.body.classList.toggle('piece-light', !dark)
    },

    // ── Indicador de swipe ────────────────────────────────────────────────────
    _initSwipeIndicator() {
        const el   = this.$('#p-swipe-indicator')
        const icon = el?.querySelector('.piece-icon')
        if (!el) return

        const EDGE = 28
        let side = null

        const show = (s, y) => {
            el.classList.remove('p-side-left', 'p-side-right', 'p-swipe-active')
            icon.textContent = s === 'left' ? 'arrow_back' : 'arrow_forward'
            el.classList.add(s === 'left' ? 'p-side-left' : 'p-side-right')
            el.style.top = `${y}px`
            requestAnimationFrame(() => el.classList.add('p-swipe-active'))
            side = s
        }

        const hide = () => {
            el.classList.remove('p-swipe-active')
            side = null
        }

        document.addEventListener('touchstart', e => {
            const { clientX, clientY } = e.touches[0]
            if (clientX <= EDGE) show('left', clientY)
            else if (clientX >= window.innerWidth - EDGE) show('right', clientY)
        }, { passive: true })

        document.addEventListener('touchmove', e => {
            if (!side) return
            el.style.top = `${e.touches[0].clientY}px`
        }, { passive: true })

        document.addEventListener('touchend',    hide, { passive: true })
        document.addEventListener('touchcancel', hide, { passive: true })
    },

    // ── Init ──────────────────────────────────────────────────────────────────
    init() {
        const dark = this.storage.darkMode.get()
        document.body.classList.toggle('piece-dark',  dark)
        document.body.classList.toggle('piece-light', !dark)

        this._buildNav()
        this._buildSizeBar()
        this._initSwipeIndicator()

        let initial = location.hash.replace(/^#/, '')
        if (!initial && this.views.length) {
            initial = this.slug(this.views[0].name)
        }

        // Marca estado inicial no history
        history.replaceState({ id: 0 }, '', initial ? `#${initial}` : location.href)
        this._navId = 0

        // Renderiza sem animação na carga inicial
        this.renderView(initial)
        this._initialized = true

        // Back/forward do browser
        window.addEventListener('popstate', e => {
            this._fromPopstate = true
            const newId  = e.state?.id ?? 0
            const isBack = newId < this._navId
            this._navId  = newId
            this.renderView(location.hash.replace(/^#/, ''), isBack)
        })

        // Hash externo (URL digitada diretamente, links etc.)
        window.addEventListener('hashchange', () => {
            if (this._fromPopstate) { this._fromPopstate = false; return }
            this._navId++
            history.replaceState({ id: this._navId }, '')
            this.renderView(location.hash.replace(/^#/, ''), false)
        })
    }
}

// ── Storage ───────────────────────────────────────────────────────────────────
PASO.storage = (() => {
    const KEY      = 'pieces-lab'
    const defaults = { dark: false, screenSize: 'default' }

    const read  = ()       => { try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return { ...defaults } } }
    const write = data     => localStorage.setItem(KEY, JSON.stringify(data))

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
