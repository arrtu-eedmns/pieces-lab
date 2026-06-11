// PASO — Pieces App Shell Operation
// Gerencia o shell da aplicação: slots independentes, roteamento, views, painéis, storage.

const PASO = {

    name: 'Pieces Lab',
    views: [],
    panels: [],

    // ── Estado ───────────────────────────────────────────────────────────────
    _slots:        [],   // [{ id, viewId, viewParams, panelName, panelParams }]
    _focusedSlot:  'a',
    _navId:        0,
    _initialized:  false,
    _fromPopstate: false,

    // ── Utilitários DOM ──────────────────────────────────────────────────────
    $:  (sel, ctx = document) => ctx.querySelector(sel),
    $$: (sel, ctx = document) => [...ctx.querySelectorAll(sel)],

    // Slug robusto: remove diacríticos (qualquer língua), kebab-case
    slug(str) {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Mn}/gu, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    },

    // Resolve o id de uma view ou panel (campo id explícito ou slug do name)
    _id(v) { return v.id || this.slug(v.name) },

    // ── Registro ─────────────────────────────────────────────────────────────
    newView(config)  { this.views.push(config) },
    newPanel(config) { this.panels.push(config) },

    // ── URL ──────────────────────────────────────────────────────────────────
    // Formato: #a=view-id&a.v.key=viewParam&a.panel=panel-id&a.key=panelParam&b=view
    _parseHash(raw) {
        const clean = decodeURIComponent(raw.replace(/^#/, ''))
        if (!clean || !clean.includes('=')) return []

        const params = new URLSearchParams(clean)
        const slots  = []

        for (const [key, val] of params.entries()) {
            if (key.includes('.') || !val) continue

            const panelName   = params.get(`${key}.panel`) || null
            const viewParams  = {}
            const panelParams = {}

            for (const [pk, pv] of params.entries()) {
                if (!pk.startsWith(`${key}.`) || pk === `${key}.panel`) continue
                const rest = pk.slice(key.length + 1)
                // a.v.key → viewParams; a.key → panelParams
                if (rest.startsWith('v.')) viewParams[rest.slice(2)] = pv
                else panelParams[rest] = pv
            }

            slots.push({ id: key, viewId: val, viewParams, panelName, panelParams })
        }

        return slots
    },

    _buildHash(slots) {
        const params = new URLSearchParams()
        slots.forEach(s => {
            params.set(s.id, s.viewId)
            // View params: a.v.key=val
            Object.entries(s.viewParams || {}).forEach(([k, v]) => params.set(`${s.id}.v.${k}`, v))
            if (s.panelName) {
                params.set(`${s.id}.panel`, s.panelName)
                Object.entries(s.panelParams || {}).forEach(([k, v]) => params.set(`${s.id}.${k}`, v))
            }
        })
        return params.toString()
    },

    // ── Renderização ─────────────────────────────────────────────────────────
    renderAll(slots, isBack = false) {
        if (!slots.length) return
        document.documentElement.dataset.vtDir = isBack ? 'back' : 'forward'

        const doRender = () => {
            this._slots = slots
            this._syncSlotElements()
            slots.forEach(s => this._renderSlot(s))
            this._updateNav()
        }

        if (this._initialized && document.startViewTransition) {
            document.startViewTransition(doRender)
        } else {
            doRender()
        }
    },

    _syncSlotElements() {
        const main    = this.$('#p-main')
        const current = [...main.querySelectorAll('[data-slot]')].map(el => el.dataset.slot)
        const desired = this._slots.map(s => s.id)

        // Remove slots que saíram
        current.filter(id => !desired.includes(id)).forEach(id =>
            main.querySelector(`[data-slot="${id}"]`)?.remove()
        )

        // Cria slots novos na posição correta
        desired.forEach((id, i) => {
            if (!main.querySelector(`[data-slot="${id}"]`)) {
                const el = document.createElement('div')
                el.className = 'p-slot piece-surface piece-border border-color-auto-05'
                el.dataset.slot = id
                el.innerHTML = `
                    <div class="p-slot-header piece-surface background-color-auto-03 piece-border border-color-auto-05">
                        <span class="p-slot-title piece-surface text-color-auto-14"></span>
                        <button
                            class="piece-surface piece-icon-button piece-small
                                background-color-auto-00 background-color-auto-04-hover
                                text-color-auto-16"
                            onclick="PASO.closeSlot('${id}')">
                            <span class="piece-ripple"></span>
                            <span class="material-symbols-rounded piece-icon">close</span>
                        </button>
                    </div>
                    <div class="p-slot-primary piece-surface"></div>
                    <div class="p-slot-secondary piece-surface background-color-auto-02"></div>
                `
                const all = [...main.querySelectorAll('[data-slot]')]
                if (i >= all.length) main.appendChild(el)
                else main.insertBefore(el, all[i])
            }
        })

        // Atualiza CSS var para grid
        main.style.setProperty('--p-slots', desired.length)
        this._updateFocusedClass()
    },

    _updateFocusedClass() {
        this.$$('[data-slot]').forEach(el =>
            el.classList.toggle('p-slot-focused', el.dataset.slot === this._focusedSlot)
        )

        // Atualiza título no header mobile (mostra a view do slot focado)
        const focused = this._slots.find(s => s.id === this._focusedSlot)
        if (focused) {
            const view    = this.views.find(v => this._id(v) === focused.viewId)
            const titleEl = this.$('#p-page-title')
            if (titleEl && view) titleEl.textContent = view.name
        }
    },

    _renderSlot(slotState) {
        const slotEl = this.$(`[data-slot="${slotState.id}"]`)
        if (!slotEl) return

        this._renderSlotView(slotEl, slotState)
        slotState.panelName
            ? this._renderSlotPanel(slotEl, slotState)
            : this._closeSlotPanel(slotEl)
    },

    _renderSlotView(slotEl, { id, viewId, viewParams }) {
        const view    = this.views.find(v => this._id(v) === viewId)
        const primary = slotEl.querySelector('.p-slot-primary')
        const titleEl = slotEl.querySelector('.p-slot-title')

        if (!view) {
            if (titleEl) titleEl.textContent = '—'
            primary.innerHTML = '<p style="padding:24px">Página não encontrada</p>'
            return
        }

        if (titleEl) titleEl.textContent = view.name
        if (id === this._focusedSlot) document.title = `${this.name} — ${view.name}`

        // Guard de permissão
        if (view.guard && !view.guard()) {
            primary.innerHTML = `
                <div style="padding:32px 24px;display:flex;flex-direction:column;gap:12px">
                    <span class="material-symbols-rounded piece-surface text-color-auto-12" style="font-size:32px">lock</span>
                    <div>
                        <p class="piece-surface text-color-auto-20" style="font-size:16px;font-weight:600">Sem permissão</p>
                        <p class="piece-surface text-color-auto-14" style="font-size:13px;margin-top:4px">Você não tem acesso a esta view.</p>
                    </div>
                </div>`
            return
        }

        const sectionId = `view-${id}-${viewId}`
        primary.innerHTML = `<section id="${sectionId}"></section>`
        view.main(this.$(`#${sectionId}`), viewParams || {})
    },

    _renderSlotPanel(slotEl, { id, panelName, panelParams }) {
        const panel     = this.panels.find(p => this._id(p) === panelName)
        const secondary = slotEl.querySelector('.p-slot-secondary')
        if (!panel || !secondary) return

        const sectionId = `panel-${id}-${panelName}`
        secondary.innerHTML = `
            <div class="p-panel-header piece-surface background-color-auto-02 piece-border border-color-auto-05">
                <button
                    class="piece-surface piece-icon-button piece-medium
                        background-color-auto-00 background-color-auto-04-hover
                        text-color-auto-20"
                    onclick="PASO.closePanel('${id}')">
                    <span class="piece-ripple"></span>
                    <span class="material-symbols-rounded piece-icon">arrow_back</span>
                </button>
                <span class="piece-surface text-color-auto-20" style="font-size:16px;font-weight:600">${panel.title || panel.name}</span>
            </div>
            <section id="${sectionId}"></section>
        `

        panel.main(this.$(`#${sectionId}`), panelParams)
        secondary.classList.add('piece-actived')
    },

    _closeSlotPanel(slotEl) {
        const secondary = slotEl?.querySelector('.p-slot-secondary')
        if (!secondary) return
        secondary.classList.remove('piece-actived')
        secondary.innerHTML = ''
    },

    _updateNav() {
        const focused = this._slots.find(s => s.id === this._focusedSlot)
        this.$$('[data-nav]').forEach(btn =>
            btn.classList.toggle('piece-actived', btn.dataset.nav === focused?.viewId)
        )
        this._updateFocusedClass()
    },

    // ── Navegação ─────────────────────────────────────────────────────────────
    navigate(viewId, viewParams = {}, slotId = this._focusedSlot) {
        const view = this.views.find(v => this._id(v) === viewId)
        if (!view) return

        const rid   = this._id(view)
        const slots = this._slots.map(s =>
            s.id === slotId
                ? { id: s.id, viewId: rid, viewParams, panelName: null, panelParams: {} }
                : s
        )

        const hash = this._buildHash(slots)
        if (location.hash === `#${hash}`) return
        this._navId++
        history.pushState({ id: this._navId }, '', `#${hash}`)
        this.renderAll(slots, false)
    },

    // Abre a view num slot novo (ou foca se já estiver aberta)
    openSlot(viewId) {
        const view = this.views.find(v => this._id(v) === viewId)
        if (!view) return

        const rid      = this._id(view)
        const existing = this._slots.find(s => s.viewId === rid)

        if (existing) {
            this._focusedSlot = existing.id
            this._updateFocusedClass()
            this._updateNav()
            return
        }

        const usedIds = this._slots.map(s => s.id)
        const newId   = 'abcdefgh'.split('').find(c => !usedIds.includes(c)) || 'z'
        const slots   = [...this._slots, { id: newId, viewId: rid, viewParams: {}, panelName: null, panelParams: {} }]
        this._focusedSlot = newId

        const hash = this._buildHash(slots)
        history.replaceState({ id: this._navId }, '', `#${hash}`)
        this.renderAll(slots, false)
    },

    closeSlot(slotId) {
        if (this._slots.length <= 1) return
        const slots = this._slots.filter(s => s.id !== slotId)
        if (this._focusedSlot === slotId) this._focusedSlot = slots[0].id

        const hash = this._buildHash(slots)
        history.replaceState({ id: this._navId }, '', `#${hash}`)
        this.renderAll(slots, false)
    },

    openPanel(panelName, params = {}, slotId = this._focusedSlot) {
        const rid   = this.slug(panelName)
        const slots = this._slots.map(s =>
            s.id === slotId
                ? { ...s, panelName: rid, panelParams: params }
                : s
        )

        const hash = this._buildHash(slots)
        this._navId++
        history.pushState({ id: this._navId }, '', `#${hash}`)
        this.renderAll(slots, false)
    },

    closePanel(slotId = this._focusedSlot) {
        if ((history.state?.id ?? 0) > 0) {
            history.back()  // popstate dispara com isBack = true
        } else {
            const slots = this._slots.map(s =>
                s.id === slotId
                    ? { ...s, panelName: null, panelParams: {} }
                    : s
            )
            const hash = this._buildHash(slots)
            this._navId++
            history.pushState({ id: this._navId }, '', `#${hash}`)
            this.renderAll(slots, true)
        }
    },

    // ── Nav ───────────────────────────────────────────────────────────────────
    _buildNav() {
        const navAside  = this.$('#p-nav')
        const navHeader = this.$('#p-header-nav')

        const aside = this.views.map(v => {
            const id = this._id(v)
            return `
            <button
                class="p-nav-btn piece-button piece-toggle piece-surface piece-medium
                    background-color-auto-00 background-color-auto-04-hover
                    background-color-auto-05-active background-color-auto-06-hover-active
                    text-color-auto-16 text-color-auto-22-active piece-primary-active"
                data-nav="${id}"
                onclick="PASO.navigate('${id}')">
                <span class="piece-ripple"></span>
                <span class="material-symbols-rounded piece-icon">${v.icon}</span>
                <span class="piece-label p-nav-label">${v.name}</span>
            </button>`
        }).join('')

        const header = this.views.map(v => {
            const id = this._id(v)
            return `
            <button
                class="piece-icon-button piece-toggle piece-surface piece-medium
                    background-color-auto-00 background-color-auto-04-hover
                    background-color-auto-05-active text-color-auto-16
                    text-color-auto-22-active piece-primary-active"
                data-nav="${id}"
                onclick="PASO.navigate('${id}')">
                <span class="piece-ripple"></span>
                <span class="material-symbols-rounded piece-icon">${v.icon}</span>
            </button>`
        }).join('')

        if (navAside)  navAside.innerHTML  = aside
        if (navHeader) navHeader.innerHTML = header
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
                    background-color-auto-04 background-color-auto-06-hover
                    background-color-auto-11-active background-color-auto-12-hover-active
                    text-color-auto-18 text-color-auto-02-active
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

        // Detecta dispositivo touch para selecionar animação de back correta
        document.documentElement.classList.toggle(
            'p-touch',
            'ontouchstart' in window || navigator.maxTouchPoints > 0
        )

        // Foco no slot ao clicar (event delegation)
        this.$('#p-main').addEventListener('click', e => {
            const slotEl = e.target.closest('[data-slot]')
            if (slotEl && this._focusedSlot !== slotEl.dataset.slot) {
                this._focusedSlot = slotEl.dataset.slot
                this._updateFocusedClass()
                this._updateNav()
            }
        }, { capture: true })

        // Parse da URL inicial
        let slots = this._parseHash(location.hash)

        if (!slots.length && this.views.length) {
            const first = this.views[0]
            slots = [{ id: 'a', viewId: this._id(first), viewParams: {}, panelName: null, panelParams: {} }]
        }

        this._focusedSlot = slots[0]?.id || 'a'
        history.replaceState({ id: 0 }, '', `#${this._buildHash(slots)}`)
        this._navId = 0

        // Render inicial sem animação
        this._slots = slots
        this._syncSlotElements()
        slots.forEach(s => this._renderSlot(s))
        this._updateNav()
        this._initialized = true

        // Back / forward do browser
        window.addEventListener('popstate', e => {
            this._fromPopstate = true
            const newId  = e.state?.id ?? 0
            const isBack = newId < this._navId
            this._navId  = newId
            const parsed = this._parseHash(location.hash)
            if (parsed.length) this._focusedSlot = parsed[0].id
            this.renderAll(parsed, isBack)
        })

        // Hash externo (URL digitada, links antigos)
        window.addEventListener('hashchange', () => {
            if (this._fromPopstate) { this._fromPopstate = false; return }
            this._navId++
            history.replaceState({ id: this._navId }, '')
            this.renderAll(this._parseHash(location.hash), false)
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
