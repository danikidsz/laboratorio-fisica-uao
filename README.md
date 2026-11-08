# Laboratorio virtual · Física Mecánica UAO

Recorrido por el laboratorio de Física de la Universidad Autónoma de Occidente: un trayecto controlado por scroll hasta la sala, una vista 360° y tres mesas interactivas para armar los montajes y ver las pruebas reales.

**Sitio publicado:** https://laboratorio-fisica-uao.vercel.app  

Proyecto *Física en movimiento* · Digitatón · Reto 37 · Equipo 2  
Miguel Ángel Mosquera · Juan Esteban Suárez · Juan Daniel Cárdenas  
Docente: Monica Diana Didyme

## Qué incluye

| Mesa | Experiencia |
|---|---|
| **1 · Caída libre** | Dos versiones (fotopuerta con lámina obturadora, o pelotas con sensor de movimiento). Se arma el montaje paso a paso, se ve la prueba y se elige el sensor correcto entre modelos 3D. |
| **2 · Carril de aire** | Montaje en 6 pasos y prueba en tres posiciones: se alista el planeador, se enciende el aire con el interruptor ON/OFF y se ve el movimiento. |
| **3 · Movimiento parabólico** | Pregunta de predicción con dos casos (balín desde más arriba o más abajo) y el video real de cada uno. |

- Funciona en computador y celular.
- Se puede abrir con el enlace directo o incrustado (`?embed=1`) en el Módulo 1 (SCORM) y en la página *Física en movimiento*. Cuando está incrustado, avisa por `postMessage` qué mesas se completaron.
- Sitio estático: HTML, CSS y JavaScript sin compilación. Usa Pannellum para el 360° y model-viewer para los modelos 3D (incluidos en `lib/`).

## Estructura

```
index.html
css/lab.css         estilos (identidad UAO, DM Sans)
js/config.js        textos, mesas, pasos, videos y posiciones
js/lab.js           lógica del recorrido, el 360° y las mesas
assets/             fotos, videos, panorama 360° y modelos GLB
fonts/  lib/        DM Sans, Pannellum y model-viewer
LEEME.txt           guía detallada para cambiar contenidos
```

## Ejecutar en local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

Agrega `?pos=1` a la URL para ver las coordenadas yaw/pitch al ubicar los puntos del 360°.

## Publicar cambios

```bash
npx vercel --prod
```

Si conectas este repositorio a su proyecto en Vercel, cada `git push` publica automáticamente.
