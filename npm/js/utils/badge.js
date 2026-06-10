/* @arrtu/pieces — utils/badge
   Posiciona .piece-badge com position: fixed para escapar de overflow: hidden.
   Recalcula no scroll, resize e quando novos badges são adicionados ao DOM.
*/
;(function () {
    function positionBadge(badge) {
        const anchor = badge.parentElement
        if (!anchor) return
        const r = anchor.getBoundingClientRect()
        badge.style.position = 'fixed'
        badge.style.top      = (r.top  - 4) + 'px'
        badge.style.right    = (window.innerWidth - r.right - 4) + 'px'
        badge.style.left     = 'auto'
        badge.style.bottom   = 'auto'
    }

    function positionAll() {
        document.querySelectorAll('.piece-badge:not(.piece-inline)').forEach(positionBadge)
    }

    positionAll()

    window.addEventListener('scroll', positionAll, { passive: true, capture: true })
    window.addEventListener('resize', positionAll)

    new MutationObserver(positionAll).observe(document.body, {
        childList: true,
        subtree: true
    })
}())
