# ManejoTiempo

Una app web ligera y elegante para registrar la jornada diaria de equipos de desarrollo.

> Pensada para uso real del equipo: rápida de completar, clara de leer y enfocada en visibilidad de carga de trabajo.

---

## Demo

- Producción: **https://tiempos-sigma.vercel.app**
- Repositorio: **https://github.com/benosg/ManejoTiempo**

---

## Qué resuelve

`ManejoTiempo` ayuda a registrar en pocos pasos:

- en qué se usó el tiempo cada día,
- cómo se distribuye entre trabajo planificado y no planificado,
- y cómo evoluciona la carga semanal del equipo.

Todo con una experiencia simple, en español y sin fricción innecesaria.

---

## Funcionalidades principales

### Registro diario
- Crear, editar, duplicar y eliminar registros.
- Ajuste rápido de tiempo (`+15m` / `-15m`).
- Categorías base: desarrollo, reunión, soporte, incidente, documentación, análisis, otro.
- Proyecto, tarea, comentario opcional y marca planificado/no planificado.
- Presets de duración rápida: `30 min`, `1 h`, `90 min`, `2 h`.

### Flujo de uso rápido
- Botón para **repetir registros de ayer**.
- Sugerencias rápidas (mock) para registrar con menos clics.
- Atajos de teclado:
  - `Alt + R`: repetir ayer.
  - `Ctrl/Cmd + Enter`: guardar en formulario.

### Resumen y reportes
- Resumen diario: esperado vs registrado vs diferencia.
- Semanal: totales por día y total de semana.
- Reportes: distribución por categoría y por proyecto.
- Indicadores de trabajo planificado/no planificado.

### Experiencia de edición clara
- Modo edición visible con bloque destacado.
- Registro en edición resaltado en la lista.
- Acción explícita para cancelar edición.

---

## Reglas de jornada incorporadas

- Semana inicia en **lunes**.
- Jornada base:
  - Lun–Jue: `08:30–18:00` (con 1h de colación).
  - Vie: `08:30–17:00` (con 1h de colación).
- Turnos posibles:
  - Mañana `08:30–17:00` (con colación).
  - Tarde `14:00–21:00` (sin colación).
- Feriados Chile:
  - Fuente API (`Nager.Date`) con fallback mock.
  - Se permite registrar trabajo en inhábiles.

---

## Stack técnico

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4** (`@tailwindcss/vite`)

Arquitectura actual:

- Frontend SPA, sin backend real.
- Persistencia en memoria mediante servicios mock.
- Contratos listos para reemplazar mocks por API real.

---

## Estructura del proyecto

```txt
src/
  app/                 # shell principal + navegación
  features/
    dashboard/         # vista diaria + formulario + lista
    time-entries/      # vista semanal
    reports/           # reportes básicos
  components/          # UI reutilizable
  hooks/               # estado y coordinación de datos
  services/            # contratos + servicios mock + container
  models/              # tipos y entidades TS
  mocks/               # datos semilla
  utils/               # fechas, reglas, resúmenes
```

---

## Cómo levantar el proyecto

### Requisitos
- Node.js 20+
- npm

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

### Build de validación

```bash
npm run build
```

### Preview local del build

```bash
npm run preview
```

---

## Notas importantes para pruebas

- Los datos están en memoria: al recargar, se reinicia el estado.
- El seed de `timeEntries` parte vacío para facilitar pruebas controladas.
- No hay autenticación real en esta versión (usuario mock).

---

## Despliegue

Proyecto enlazado a Vercel.

```bash
npx vercel --prod --yes
```

---

## Roadmap corto

- Integración real con Outlook (sugerencias desde calendario).
- Integración real con Azure DevOps (work items recientes).
- Persistencia en backend real + permisos por rol.
- Reportes más ricos para capacidad y planificación.

---

Hecho con foco en adopción: que registrar la jornada sea tan simple que no moleste.
