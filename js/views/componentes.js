PASO.newView({
    name: 'Componentes',
    icon: 'widgets',

    main(container) {
        container.innerHTML = `
            <div>
                <h1 class="p-title piece-surface text-color-auto-22">Componentes</h1>
                <p class="p-subtitle piece-surface text-color-auto-14" style="margin-top:4px">Galeria do neutral kit</p>
            </div>

            <!-- Menu -->
            <div>
                <span class="p-section-label piece-surface text-color-auto-14">Menu</span>
                <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start">

                    <!-- Básico -->
                    <div class="piece-interactive" style="position:relative;display:inline-flex;">
                        <button class="piece-surface piece-icon-button piece-medium
                            background-color-auto-00
                            background-color-auto-04-hover
                            text-color-auto-20">
                            <span class="piece-ripple"></span>
                            <span class="material-symbols-rounded piece-icon">more_vert</span>
                        </button>
                        <ul class="piece-menu piece-surface piece-border
                            background-color-auto-02 border-color-auto-06 text-color-auto-20">
                            <li class="piece-menu-item piece-surface background-color-auto-00 background-color-auto-04-hover text-color-auto-20">
                                <span class="piece-ripple"></span>
                                <span class="material-symbols-rounded piece-icon">edit</span>
                                <span class="piece-menu-item-label">Editar</span>
                            </li>
                            <li class="piece-menu-item piece-surface background-color-auto-00 background-color-auto-04-hover text-color-auto-20">
                                <span class="piece-ripple"></span>
                                <span class="material-symbols-rounded piece-icon">content_copy</span>
                                <span class="piece-menu-item-label">Duplicar</span>
                            </li>
                            <li class="piece-menu-divider piece-surface border-color-auto-05"></li>
                            <li class="piece-menu-item piece-surface background-color-auto-00 background-color-auto-04-hover text-color-auto-20">
                                <span class="piece-ripple"></span>
                                <span class="material-symbols-rounded piece-icon">delete</span>
                                <span class="piece-menu-item-label">Excluir</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Com trailing -->
                    <div class="piece-interactive" style="position:relative;display:inline-flex;">
                        <button class="piece-surface piece-button piece-medium
                            background-color-auto-04
                            background-color-auto-06-hover
                            text-color-auto-20">
                            <span class="piece-ripple"></span>
                            <span class="material-symbols-rounded piece-icon">tune</span>
                            <span class="piece-label">Opções</span>
                        </button>
                        <ul class="piece-menu piece-surface piece-border
                            background-color-auto-02 border-color-auto-06 text-color-auto-20">
                            <li class="piece-menu-section piece-surface text-color-auto-13">Edição</li>
                            <li class="piece-menu-item piece-surface background-color-auto-00 background-color-auto-04-hover text-color-auto-20">
                                <span class="piece-ripple"></span>
                                <span class="material-symbols-rounded piece-icon">edit</span>
                                <span class="piece-menu-item-label">Editar</span>
                                <span class="piece-menu-item-trailing piece-surface text-color-auto-13">⌘E</span>
                            </li>
                            <li class="piece-menu-item piece-surface background-color-auto-00 background-color-auto-04-hover text-color-auto-20">
                                <span class="piece-ripple"></span>
                                <span class="material-symbols-rounded piece-icon">share</span>
                                <span class="piece-menu-item-label">Compartilhar</span>
                                <span class="piece-menu-item-trailing piece-surface text-color-auto-13">⌘S</span>
                            </li>
                            <li class="piece-menu-divider piece-surface border-color-auto-05"></li>
                            <li class="piece-menu-section piece-surface text-color-auto-13">Perigo</li>
                            <li class="piece-menu-item piece-surface background-color-auto-00 background-color-auto-04-hover text-color-auto-20">
                                <span class="piece-ripple"></span>
                                <span class="material-symbols-rounded piece-icon">delete</span>
                                <span class="piece-menu-item-label">Excluir</span>
                                <span class="piece-menu-item-trailing piece-surface text-color-auto-13">⌫</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        `
    }
})
