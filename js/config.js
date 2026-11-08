/* =========================================================
   LABORATORIO VIRTUAL · Física Mecánica UAO — configuración
   ========================================================= */
window.LAB_CONFIG = {
  // Recorrido controlado por scroll.
  // Recomendado (más fluido): secuencia de imágenes generada con FFmpeg (ver LEEME.txt)
  //   frames: { count: 240, path: "assets/recorrido/f_####.webp" }
  // Alternativa: video con todos los cuadros clave → video: "assets/recorrido.mp4"
  // Si ambos están vacíos se muestra el recorrido ilustrado provisional.
  recorrido: { frames: { count: 517, path: "assets/recorrido/f_####.webp" }, video: "", alto: 1100 },

  // Imagen 360 equirectangular (2:1). yaw/pitch = ubicación del botón de cada mesa.
  // Abre la página con ?pos=1 para ver yaw/pitch mientras miras el 360.
  lab360: {
    imagen: "assets/lab360.jpg",
    yawInicial: 20,
    techoMax: 52,   // hasta dónde se puede mirar hacia arriba (grados); el cenit no tiene foto
    mesas: [ { id: "m1", yaw: 90, pitch: -11 }, { id: "m2", yaw: -85, pitch: -14 }, { id: "m3", yaw: 142, pitch: -10 } ]
  }
};

/* Mesas — POR CONFIRMAR: la opción correcta (c).
   Cada opción: [nombre, ilustración provisional, imagen del modelado 3D (PNG transparente en assets/modelos/)] */
window.MESAS = {
  m1: { nombre: "Mesa 1", exp: "Caída libre", tipo: "montaje",
        desc: "Arma paso a paso el montaje con el que se estudia la caída libre en el laboratorio UAO.",
        versiones: [
          { id: "fotopuerta", titulo: "Con fotopuerta y lámina obturadora", portada: "assets/caida/paso_lamina.jpg",
            resumen: "Una lámina con franjas cae a través de la fotopuerta, que registra los tiempos de paso.",
            // Video de la prueba: se muestra después del montaje y antes de la pregunta (si está vacío, se omite)
            video: "assets/caida/prueba_lamina.mp4", poster: "assets/caida/prueba_lamina.jpg",
            videoTxt: "Observa cómo la lámina cae a través de la fotopuerta: cada franja negra corta el haz y Capstone registra el tiempo.",
            pasos: [
              { obj: "Computador", ico: "laptop", img: "assets/caida/paso_computador.jpg", para: "Ejecuta Capstone, donde se registran y grafican los datos." },
              { obj: "Interfaz 850 Universal", ico: "interfaz", img: "assets/caida/paso_interfaz.jpg", para: "Conecta los sensores con el computador y convierte sus señales en datos." },
              { obj: "Sensor de fotopuerta", ico: "fotopuerta", img: "assets/caida/paso_fotopuerta.jpg", para: "Se fija en la varilla. Su haz infrarrojo detecta cada vez que algo lo interrumpe." },
              { obj: "Lámina obturadora", ico: "lamina", img: "assets/caida/paso_lamina.jpg", para: "Placa con franjas negras: al caer, cada franja corta el haz y se registra un tiempo." }
            ],
            pregunta: "¿Qué sensor registra los tiempos de paso de la lámina en este montaje?", correcta: "fotopuerta",
            bien: "La fotopuerta mide el instante en que cada franja de la lámina corta el haz. Con esos tiempos se calcula la velocidad y la aceleración de caída." },
          { id: "pelotas", titulo: "Con pelotas y sensor de movimiento", portada: "assets/caida/paso_pelotas.jpg",
            resumen: "Se dejan caer pelotas sobre un sensor de movimiento que mide su posición en el tiempo.",
            video: "", poster: "", // pendiente: cuando graben la prueba con pelotas, poner aquí la ruta del video
            videoTxt: "Observa cómo cae la pelota sobre el sensor de movimiento.",
            pasos: [
              { obj: "Computador", ico: "laptop", img: "assets/caida/paso_computador.jpg", para: "Ejecuta Capstone, donde se registran y grafican los datos." },
              { obj: "Interfaz 850 Universal", ico: "interfaz", img: "assets/caida/paso_interfaz.jpg", para: "Conecta los sensores con el computador y convierte sus señales en datos." },
              { obj: "Sensor de movimiento 2", ico: "movimiento", img: "assets/caida/paso_sensor_mov.jpg", para: "Emite ultrasonido y mide la distancia al objeto muchas veces por segundo." },
              { obj: "Pelotas", ico: "pelotas", img: "assets/caida/paso_pelotas.jpg", para: "Son los objetos que se dejan caer para estudiar su movimiento." },
              { obj: "Ubicar el sensor en el piso", ico: "piso", img: "assets/caida/sensor_en_piso.jpg", para: "El sensor va en el piso, mirando hacia arriba, justo debajo de donde caen las pelotas." }
            ],
            pregunta: "¿Qué sensor registra la posición de la pelota mientras cae?", correcta: "movimiento",
            bien: "El sensor de movimiento mide la distancia a la pelota muchas veces por segundo; así se obtienen las gráficas de posición, velocidad y aceleración." }
        ],
        // Modelados 3D (GLB). Provisionales: reemplazar por los modelados reales con el mismo nombre de archivo.
        modelos: [["fotopuerta", "Sensor de fotopuerta", "assets/modelos/fotopuerta.glb"], ["movimiento", "Sensor de movimiento", "assets/modelos/sensor_movimiento.glb"],
                  ["rotacional", "Sensor de movimiento rotacional", "assets/modelos/sensor_rotacional.glb"], ["fuerza", "Sensor de fuerza", "assets/modelos/sensor_fuerza.glb"]] },
  m2: { nombre: "Mesa 2", exp: "Carril de aire", tipo: "carril",
        desc: "Un planeador se desliza casi sin fricción sobre un colchón de aire.",
        vacia: "assets/carril/mesa_vacia.jpg",
        versiones: [
          { id: "carril", titulo: "Carril de aire con sensor de polea inteligente", portada: "assets/carril/paso_planeador.jpg",
            pasos: [
              { obj: "Computador", ico: "laptop", img: "assets/carril/paso_computador.jpg", para: "Ejecuta Capstone, donde se registran y grafican los datos." },
              { obj: "Interfaz 850 Universal", ico: "interfaz", img: "assets/carril/paso_interfaz.jpg", para: "Conecta el sensor con el computador y convierte su señal en datos." },
              { obj: "Balanza", ico: "balanza", img: "assets/carril/paso_balanza.jpg", para: "Sirve para medir la masa del planeador y de las pesas antes de la prueba." },
              { obj: "Varilla", ico: "varilla", img: "assets/carril/paso_varilla.jpg", para: "Se fija al borde de la mesa, al final del carril. Sostiene el sensor de polea." },
              { obj: "Sensor de polea inteligente", ico: "polea", img: "assets/carril/paso_polea.jpg", para: "Va en la varilla. Mide cuánto gira la polea y así registra la posición del planeador en el tiempo." },
              { obj: "Planeador", ico: "planeador", img: "assets/carril/paso_planeador.jpg", para: "Es el objeto que se mueve sobre el carril. El aire lo levanta y casi no tiene fricción." }
            ] }
        ],
        /* Prueba con video. Para cada posición: video de alistar (se pausa al final y aparece el switch)
           y video de movimiento. ini/fin = segundos donde empieza y termina cada tramo (0 = desde el inicio / hasta el final).
           x, y = ubicación del botón sobre la imagen fija, en % del ancho y alto. sw = ubicación del switch (si no, usa x, y). */
        carril: {
          fija: "assets/carril/prueba_fija.jpg",
          instruccion: "Elige desde qué posición quieres soltar el planeador.",
          txtAlistar: "El planeador se lleva hasta el punto de salida…",
          txtSwitch: "Enciende el carril de aire para soltar el planeador.",
          txtMovimiento: "Observa cómo se mueve el planeador sobre el carril.",
          obs: "El planeador se mueve casi sin fricción y su velocidad aumenta de forma uniforme mientras avanza hacia la polea.",
          conclusion: "En las tres posiciones el planeador acelera de la misma manera: la aceleración no depende del punto de salida. Lo que cambia es la distancia que recorre y, por eso, la velocidad con la que llega al final del carril.",
          posiciones: [
            { nombre: "Posición cercana", x: 48.4, y: 20, alistar: { src: "assets/carril/v19.mp4", ini: 0, fin: 0 }, mov: { src: "assets/carril/v20.mp4", ini: 0, fin: 0 } },
            { nombre: "Posición media",   x: 41, y: 19, alistar: { src: "assets/carril/v21.mp4", ini: 0, fin: 0 }, mov: { src: "assets/carril/v22.mp4", ini: 0, fin: 0 } },
            { nombre: "Posición lejana",  x: 35, y: 18, alistar: { src: "assets/carril/v23.mp4", ini: 0, fin: 0 }, mov: { src: "assets/carril/v24.mp4", ini: 0, fin: 0 } }
          ]
        } },
  m3: { nombre: "Mesa 3", exp: "Movimiento parabólico", tipo: "parabolico",
        desc: "El balín baja por el carril, sale del tablero y describe una parábola.",
        pregunta: "¿En cuál de los dos casos crees que el balín sale con mayor velocidad y llega más lejos?",
        instruccion: "Elige un caso para ver la prueba en el laboratorio.",
        correcta: "alta",
        casos: [
          { id: "alta", letra: "A", titulo: "Desde más arriba", alto: true,  video: "assets/parabolico/parabola_alta.mp4", poster: "assets/parabolico/parabola_alta.jpg" },
          { id: "baja", letra: "B", titulo: "Desde más abajo",  alto: false, video: "assets/parabolico/parabola_baja.mp4", poster: "assets/parabolico/parabola_baja.jpg" }
        ],
        mientras: "Observa dónde sale el balín del carril y hasta dónde llega su trayectoria.",
        bien: "Cuanto más alto se suelta el balín en el carril, más velocidad gana al bajar. Sale del tablero con mayor velocidad horizontal y, como la altura de caída es la misma, tarda lo mismo en caer: por eso recorre más distancia y su parábola es más abierta.",
        mal: "Desde más abajo el balín gana menos velocidad en el carril: sale más lento y su parábola es más cerrada. Compara con el otro caso.",
        resumen: "Altura de salida mayor → mayor velocidad de salida → mayor alcance horizontal." }
};
