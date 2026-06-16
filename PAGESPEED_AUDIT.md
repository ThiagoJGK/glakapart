# Auditoría de PageSpeed Insights - glakapart.com.ar (Móvil)

Este documento detalla los resultados del análisis de rendimiento, accesibilidad, prácticas recomendadas y SEO para la versión móvil de **https://glakapart.com.ar**, realizado el 16 de junio de 2026.

## 📊 Resumen de Puntuaciones de Lighthouse

| Categoría | Puntuación | Estado |
| :--- | :---: | :--- |
| **Rendimiento (Performance)** | **62 / 100** | 🟡 Necesita mejorar |
| **Accesibilidad (Accessibility)** | **93 / 100** | 🟢 Excelente |
| **Prácticas Recomendadas (Best Practices)** | **96 / 100** | 🟢 Excelente |
| **SEO** | **100 / 100** | 🟢 Perfecto |

---

## ⏱️ Métricas Clave de Rendimiento (Lighthouse)

| Métrica | Abreviatura | Valor | Descripción |
| :--- | :---: | :---: | :--- |
| **First Contentful Paint** | FCP | **1.4 s** (1353 ms) | Tiempo en que se renderiza el primer texto o imagen. |
| **Largest Contentful Paint** | LCP | **13.6 s** (13619 ms) | Tiempo que tarda en cargarse el elemento con contenido principal más grande. |
| **Total Blocking Time** | TBT | **290 ms** (291 ms) | Tiempo acumulado de tareas de JS que bloquean el hilo principal. |
| **Speed Index** | SI | **6.9 s** (6861 ms) | Rapidez con la que el contenido visual es visible para el usuario. |
| **Time to Interactive** | TTI | **14.1 s** (14059 ms) | Tiempo total en el que la página es completamente interactiva. |
| **Cumulative Layout Shift** | CLS | **0** | Grado de cambios inesperados de diseño/layout visual. |

*Calculadora oficial de Lighthouse (Mobile v13.3.0):* [Ver en Lighthouse Calculator](https://googlechrome.github.io/lighthouse/scorecalc/#FCP=1353&LCP=13619&TBT=291&CLS=0&SI=6861&TTI=14059&device=mobile&version=13.3.0)

---

## 🚀 Oportunidades de Mejora de Rendimiento (Performance)

### 🔴 Oportunidades Críticas (Errores/Fallos)

#### 1. Solicitudes que bloquean el renderizado (Render-blocking resources)
* **Ahorro Estimado:** ~750 ms
* **Detalles:** Las hojas de estilo y recursos JavaScript están bloqueando la ruta crítica de renderizado inicial de la página.
* **Recursos afectados:**
  - `glakapart.com.ar` (HTML propio): 33.1 KiB (Tiempo de carga: 1560 ms)
  - `chunks/770f9556fd93b54d.css`: 28.6 KiB (780 ms)
  - `chunks/71a213232cb1f2fc.css`: 2.4 KiB (590 ms)
  - `chunks/96a6633ef18386e0.css`: 2.1 KiB (200 ms)

#### 2. Usar tiempos de vida de caché eficientes (Efficient cache policy)
* **Ahorro Estimado:** ~187 KiB
* **Detalles:** Varios recursos estáticos se sirven sin políticas de caché prolongadas o eficientes.
* **Recursos afectados:**
  - `firebaseapp.com` (auth/iframe.js): 90 KiB (Caché de solo 30 min)
  - Recursos multimedia de Instagram (scontent...): ~959 KiB total (Caché de 14 días)
  - `logo.svg` (glakapart.com.ar): 14 KiB (Sin caché especificada)

#### 3. JavaScript antiguo (Legacy JavaScript)
* **Ahorro Estimado:** ~18 KiB
* **Detalles:** Se están cargando polyfills y transformaciones innecesarios para navegadores modernos en el compilado.
* **Recursos afectados:**
  - `chunks/74c57be1ab08346f.js` (17.8 KiB desperdiciados por polyfills como `Array.prototype.at`, `Array.prototype.flat`, `Object.fromEntries`, etc.)

#### 4. Desglose y análisis de LCP (Largest Contentful Paint)
* **Diagnóstico:** El tiempo de LCP de **13.6 s** se distribuye de la siguiente manera:
  - **Retraso de carga de recursos:** 2390 ms
  - **Duración de la carga del recurso:** 400 ms
  - **Retraso de renderizado de elementos:** 180 ms
  - **Time to First Byte (TTFB):** 0 ms (Excelente)
* **Solución:** La mayor parte del tiempo se pierde en el retraso del descubrimiento del recurso LCP. Se debe hacer visible la imagen LCP directamente en el HTML inicial sin depender de JS o carga diferida (`loading="lazy"`).

#### 5. Reducir el tiempo de ejecución de JavaScript
* **Detalles:** El tiempo total de CPU dedicado a evaluar, compilar y parsear JavaScript fue de **1.4 s**.
* **Archivos con mayor impacto de CPU:**
  - `glakapart.com.ar` (HTML propio): 5588 ms CPU (1202 ms eval, 88 ms parse)
  - `chunks/74c57be1ab08346f.js`: 1759 ms CPU
  - `chunks/33d92c6630c260f1.js`: 765 ms CPU
  - `chunks/12ee3e515914b3df.js`: 220 ms CPU

#### 6. Minimizar el trabajo del hilo principal (Main thread work)
* **Detalles:** El hilo principal estuvo ocupado durante **6.1 s**.
* **Distribución de tareas:**
  - Tareas generales (Other): 2402 ms
  - Evaluación de scripts: 1319 ms
  - Estilos y diseño (Style & Layout): 765 ms
  - Renderizado (Rendering): 697 ms
  - Parsear HTML & CSS: 699 ms
  - Parseo y compilación de scripts: 175 ms
  - Recolección de basura (Garbage Collection): 21 ms

#### 7. Reducir el contenido JavaScript que no se use (Unused JavaScript)
* **Ahorro Estimado:** ~274 KiB
* **Detalles:** Bundles JS de Next.js que se cargan inicialmente pero contienen código no ejecutado en la página de inicio.
* **Archivos afectados:**
  - `chunks/12ee3e515914b3df.js`: 201.6 KiB tamaño (124.8 KiB ahorro)
  - `chunks/91d5eafb6fdb9366.js`: 48.6 KiB tamaño (36.7 KiB ahorro)
  - `chunks/74c57be1ab08346f.js`: 90.4 KiB tamaño (31.1 KiB ahorro)
  - `chunks/33d92c6630c260f1.js`: 49.4 KiB tamaño (26.0 KiB ahorro)
  - `firebaseapp.com` (auth/iframe.js): 89.9 KiB tamaño (55.1 KiB ahorro)

---

### 🟡 Oportunidades Medianas y Diagnósticos (Advertencias)

#### 1. Mejorar la entrega de imágenes (Efficiently encode / resize images)
* **Ahorro Estimado:** **~5023 KiB** (¡Mayor oportunidad de optimización de peso!)
* **Detalles:** Gran parte de las imágenes se cargan en formatos no optimizados (JPG en lugar de WebP/AVIF) o con dimensiones excesivas para el espacio donde se muestran.
* **Imágenes a optimizar:**
  - `nhtwkozddmxwuuervhbf.jpg` (Cloudinary): 1320.8 KiB (Ahorro: 1226.8 KiB). Se renderiza a 649x890 pero su tamaño físico es 2332x2068. Debe optimizarse a formato WebP y redimensionarse.
  - `kcwf8npshn6hz5wdc9gu.webp` (Cloudinary): 834.5 KiB (Ahorro: 739.6 KiB). Se renderiza a 662x882 pero es de 1920x2031.
  - `r74r3uahoccc0p5k1cup.webp` (Cloudinary): 736.0 KiB (Ahorro: 641.1 KiB). Se renderiza a 662x882 pero es de 1920x2031.
  - `lamdvun6ydqaoxteetwm.webp` (Cloudinary): 657.7 KiB (Ahorro: 562.8 KiB). Se renderiza a 662x882 pero es de 1920x2031.
  - `g9yyx1rl90xn6kcrob9g.webp` (Cloudinary): 583.7 KiB (Ahorro: 496.4 KiB).
  - `t8t73rjewld6yesbnyn6.webp` (Cloudinary): 582.6 KiB (Ahorro: 495.5 KiB).
  - `ml46p347zphkbw3arnrt.webp` (Cloudinary): 418.2 KiB (Ahorro: 355.6 KiB).

#### 2. Evita cargas útiles de red de gran tamaño (Network payloads)
* **Detalles:** El tamaño total de la transferencia de red fue de **9340 KiB**.
* **Fuentes de mayor tamaño:**
  - Cloudinary (Imágenes): 6722.4 KiB
  - Instagram (Feed/Widgets): 959 KiB

---

### ⚪ Diagnósticos Informativos

* **Optimizar tamaño del DOM:** 1745 elementos (profundidad máxima de 18).
* **Impacto de terceros (Third-party code):**
  - Cloudinary: 7390 KiB
  - Instagram: 959 KiB
  - Firebase: 91 KiB
  - Behold.so: 13 KiB
* **Evita tareas largas del hilo principal:** 13 tareas largas encontradas (la mayor de 1273 ms).
* **Evita las animaciones no compuestas:** 6 elementos animados con transiciones en propiedades como `width` o `background-color` que no se ejecutan de manera compuesta y pueden causar lagunas visuales.

---

## ♿ Accesibilidad (Accessibility)

### Puntuación: 93 / 100

#### 🔴 Errores de Accesibilidad Detectados:
1. **Los elementos `<select>` no tienen elementos `<label>` asociados:**
   - **Elemento afectado:** El selector de prefijo de país (`<select class="bg-gray-50 border-none rounded-xl text-sm text-[#10595a]...">` que contiene los prefijos +54, +55, etc.). Falta una etiqueta `<label>` visible o un atributo `aria-label` para los lectores de pantalla.
2. **Los colores de fondo y de primer plano no tienen una relación de contraste adecuada:**
   - Varios elementos tienen un ratio de contraste de texto inferior al estándar de accesibilidad (WCAG AA):
     - Texto "EXCLUSIVIDAD & RELAX"
     - Texto "AIRE LIBRE"
     - Texto "EXPERIENCIAS REALES"
     - Texto "MOMENTOS QUE SE VIVEN EN GLAK APART"
     - Texto "MÁS DE 70 RESEÑAS"
     - Textos de inputs del formulario ("NOMBRE", "APELLIDO", "EMAIL", "TELÉFONO", etc.)

---

## 🛡️ Prácticas Recomendadas (Best Practices)

### Puntuación: 96 / 100

#### 🔴 Errores Detectados:
1. **Errores del navegador registrados en la consola:**
   - Se registraron múltiples timeouts (`Failed to load resource: net::ERR_TIMED_OUT`) al conectarse a los canales de Firestore:
     - `firestore.googleapis.com/.../Listen/channel`
     - `firestore.googleapis.com/.../Write/channel`

---

## 🔍 SEO

### Puntuación: 100 / 100
* El sitio cumple al 100% con las directrices básicas de SEO auditadas por Lighthouse para dispositivos móviles.
