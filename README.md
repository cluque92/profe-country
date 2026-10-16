# 🤠 Profe Country

Clases de **line dance country** guiadas por un profe vaquero/a animado. Elige un baile, colócate delante de la pantalla y sigue sus pasos al ritmo de la canción.

## Cómo ejecutarlo

Es una web estática: no hay que instalar nada ni compilar.

**Opción 1 — servidor local (recomendado):**

```bash
cd country
npx serve .
# abre la URL que te muestre (p. ej. http://localhost:3000)
```

**Opción 2 — Python:**

```bash
cd country
python3 -m http.server 8080
# abre http://localhost:8080
```

**Opción 3 — doble clic** en `index.html`: la app funciona, pero **YouTube bloquea el audio de los embebidos en `file://`**, así que las canciones reales no sonarán (oirás el ritmo de respaldo). Para tener el sonido original, usa un servidor local (opciones 1 o 2).

> La música se reproduce con el reproductor oficial de YouTube, así que hace falta conexión a internet. Si YouTube está bloqueado, la web genera automáticamente un **ritmo country de respaldo** para que la clase siga en pie.

## Qué incluye

- **8 bailes**: Coyote Dax 🌟, Cupid Shuffle, Cha Cha Slide, Electric Slide, Cotton Eye Joe, Achy Breaky Heart, Payaso de Rodeo y Watermelon Crawl.
- **Modo aprender** 🎓: desglose sección a sección a 0.75×, con consejos por paso y bucle de sección.
- **Modo bailar** 💃: canción entera con contador 1-8, nombre del paso, flechas en el suelo y muros.
- **Modo fiesta** 🎉: encadena bailes al azar sin parar.
- **Modo espejo** 🪞, velocidad 0.5/0.75/1×, bucle de sección, ajuste fino del compás (− / +), pantalla completa y atajos de teclado.
- **Progreso** guardado en el navegador: bailes aprendidos, sesiones, racha de días y diploma final.
- **Profe personalizable**: vaquero o vaquera, color de sombrero y de camisa.

## Atajos de teclado (en clase)

| Tecla | Acción |
|---|---|
| `Espacio` | Reproducir / pausar |
| `M` | Modo espejo |
| `F` | Pantalla completa |
| `←` / `→` | Sección anterior / siguiente |
| `Esc` | Salir al inicio |

## Estructura

```
country/
├── index.html        · pantallas (inicio + clase) y modales
├── styles.css        · tema saloon
└── js/
    ├── moves.js      · biblioteca de movimientos (keyframes + interpolación)
    ├── dancer.js     · profe SVG articulado
    ├── dances.js     · canciones y coreografías (datos)
    ├── music.js      · YouTube IFrame API + respaldo Web Audio
    ├── progress.js   · localStorage: rachas, aprendizaje, ajustes
    ├── ui.js         · motor de la clase (reloj, sincronía, overlays)
    ├── learn.js      · modo aprender
    ├── party.js      · modo fiesta
    └── main.js       · inicio, ajustes y atajos
```

## Añadir un baile nuevo

1. Añade su objeto a `PC.DANCES` en `js/dances.js` (BPM, vídeo de YouTube y secciones de 8 tiempos con movimientos de `js/moves.js`).
2. Si falta algún movimiento, defínelo en `js/moves.js` (la variante izquierda se genera sola).
