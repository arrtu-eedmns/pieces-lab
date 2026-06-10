/* @arrtu/pieces — core/interactive
   Gerencia .piece-interactive: toggle de .piece-actived no clique.

   - clique dentro         → alterna (abre se fechado, fecha se aberto)
   - clique fora           → fecha
   - .piece-not-interactive → fecha forçado, mesmo sendo filho
*/

document.addEventListener('click', e => {
    const notInteractive = e.target.closest('.piece-not-interactive')
    const container      = e.target.closest('.piece-interactive')

    // fecha todos os que não são o container clicado
    document.querySelectorAll('.piece-interactive.piece-actived').forEach(el => {
        if (el !== container || notInteractive) el.classList.remove('piece-actived')
    })

    if (!container || notInteractive) return

    container.classList.toggle('piece-actived')
})
