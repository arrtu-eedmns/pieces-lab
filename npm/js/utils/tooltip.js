/* @arrtu/pieces — utils/tooltip
   Posicionamento inteligente de .piece-tooltip (position: fixed).
   Visibilidade via .piece-actived — add no mouseenter, remove no mouseleave/scroll.
   Suporta piece-true / piece-false: busca o primeiro tooltip visível.
   Reavalia tooltip ao click (toggle de estado) via requestAnimationFrame.
*/
;(function () {
    const GAP = 6
    let currentAnchor  = null
    let currentTooltip = null

    function findTooltip(anchor) {
        const all = anchor.querySelectorAll(':scope > .piece-tooltip')
        return [...all].find(t => getComputedStyle(t).display !== 'none') || null
    }

    function positionTooltip(anchor, tooltip) {
        const r  = anchor.getBoundingClientRect()
        const tw = tooltip.offsetWidth
        const th = tooltip.offsetHeight
        const vw = window.innerWidth
        const vh = window.innerHeight

        const spaceBottom = vh - r.bottom
        const spaceTop    = r.top
        const spaceRight  = vw - r.right
        const spaceLeft   = r.left

        const needV = th + GAP
        let top, left

        if (spaceBottom >= needV || spaceTop >= needV) {
            if (spaceBottom >= spaceTop) {
                top  = r.bottom + GAP
                left = r.left + r.width  / 2 - tw / 2
            } else {
                top  = r.top - th - GAP
                left = r.left + r.width  / 2 - tw / 2
            }
        } else {
            if (spaceRight >= spaceLeft) {
                top  = r.top + r.height / 2 - th / 2
                left = r.right + GAP
            } else {
                top  = r.top + r.height / 2 - th / 2
                left = r.left - tw - GAP
            }
        }

        left = Math.max(4, Math.min(left, vw - tw - 4))
        top  = Math.max(4, Math.min(top,  vh - th - 4))

        tooltip.style.top  = top  + 'px'
        tooltip.style.left = left + 'px'
        tooltip.classList.add('piece-actived')
    }

    function hideCurrentTooltip() {
        if (currentTooltip) currentTooltip.classList.remove('piece-actived')
        currentTooltip = null
    }

    document.addEventListener('mouseenter', e => {
        if (e.target.closest('.piece-disabled')) return
        const tooltip = findTooltip(e.target)
        if (!tooltip) return
        currentAnchor  = e.target
        currentTooltip = tooltip
        positionTooltip(e.target, tooltip)
    }, true)

    document.addEventListener('mouseleave', e => {
        const tooltip = findTooltip(e.target)
        if (!tooltip && currentTooltip) {
            // mouse saiu de um elemento sem tooltip — ignora
            return
        }
        if (e.target !== currentAnchor) return
        hideCurrentTooltip()
        currentAnchor = null
    }, true)

    // Reavalia após click — toggle.js pode ter mudado o estado do anchor
    document.addEventListener('click', e => {
        if (!currentAnchor) return
        if (!currentAnchor.contains(e.target) && currentAnchor !== e.target) return
        hideCurrentTooltip()
        // rAF garante que toggle.js já processou .piece-actived antes de reavaliamos
        requestAnimationFrame(() => {
            if (!currentAnchor) return
            const tooltip = findTooltip(currentAnchor)
            if (!tooltip) return
            currentTooltip = tooltip
            positionTooltip(currentAnchor, tooltip)
        })
    }, false)

    window.addEventListener('resize', () => {
        if (currentAnchor && currentTooltip) {
            positionTooltip(currentAnchor, currentTooltip)
        }
    })

    window.addEventListener('scroll', () => {
        if (!currentTooltip) return
        hideCurrentTooltip()
        currentAnchor = null
    }, true)
}())
