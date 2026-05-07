# 🏠 RoomieMatch

**App de emparejamiento de roomies para universitarios foráneos en Colombia**

RoomieMatch conecta a estudiantes foráneos universitarios mediante un sistema de compatibilidad inteligente — con la mecánica de Tinder pero enfocada en convivencia real.

---

## 🎯 El problema

Cada año, cientos de miles de estudiantes en Colombia se trasladan a una ciudad diferente para estudiar. Llegan solos, sin red social, y deben resolver en semanas una de las decisiones más importantes: **con quién vivir y dónde**.

Los canales actuales (grupos de WhatsApp, Facebook, carteles) son caóticos, inseguros y sin verificación.

## 💡 La solución

Una app mobile-first que empareja a foráneos basándose en **compatibilidad de hábitos de convivencia**, no solo en apariencia. Verificación universitaria, score de compatibilidad, chat solo tras match mutuo.

---

## 📱 Funcionalidades completas

### 🔐 Autenticación y registro

- ✅ Pantalla de bienvenida con acceso a demo, login y registro
- ✅ Registro en 3 pasos con barra de progreso
- ✅ Selección de avatar (12 emojis disponibles)
- ✅ Selección de universidad entre más de 30 instituciones colombianas
- ✅ Validación de dominio de correo según universidad seleccionada (ej. `@uniandes.edu.co`)
- ✅ Contraseñas hasheadas con SHA-256 + salt antes de guardarse
- ✅ Verificación de correo por código de 6 dígitos (modo demo: código visible en pantalla)
- ✅ Persistencia de cuentas en `localStorage`
- ✅ Login con email + contraseña, con mensajes de error contextuales
- ✅ Modo demo: entra sin registro con 3 matches y conversaciones pre-cargadas

### 🧪 Test de compatibilidad (16 preguntas en 7 categorías)

- ✅ **Horarios de sueño:** hora de acostarse, hora de despertar
- ✅ **Limpieza:** nivel de orden (escala 1–5), frecuencia de limpieza de áreas comunes, disposición a contratar servicio de aseo
- ✅ **Ruido y estudio:** nivel de ruido que produce, entorno preferido para estudiar
- ✅ **Visitas:** frecuencia de visitas, aceptación de visitas que duermen
- ✅ **Presupuesto:** rango de arriendo mensual (COP), forma de dividir los gastos
- ✅ **Estilo social:** perfil introvertido / ambivertido / extrovertido, preferencia de espacios compartidos
- ✅ **Mascotas y fumar:** tiene mascotas, acepta mascotas, fuma, acepta que roomie fume

### 🏠 Situación habitacional

- ✅ **Estado A:** Sin cuarto ni roomie — busca ambos
- ✅ **Estado B:** Tiene cuarto disponible — puede publicar barrio, ciudad y precio de arriendo
- ✅ **Estado C:** Ya tiene roomie — juntos buscan cuarto
- ✅ Lógica de emparejamiento diferenciada: B no puede hacer match con B; C solo ve perfiles B

### 🔍 Descubrir perfiles

- ✅ Feed de tarjetas apiladas con efecto de profundidad (carta siguiente visible detrás)
- ✅ Swipe animado: Like (❤️) y Pasar (✕) con animación de salida
- ✅ Score de compatibilidad (0–100%) visible directamente en la tarjeta
- ✅ Filtro de perfiles por ciudad mediante chips scrollables horizontales
- ✅ Información en la tarjeta: avatar, nombre, edad, carrera, semestre, ciudad de origen → ciudad destino, zona preferida, estado habitacional, detalles del cuarto (si Estado B), bio, universidad, calificación de reseñas
- ✅ Modal de **compatibilidad detallada por categoría** con barras de progreso animadas (6 dimensiones)
- ✅ Modal de **"¡Es un Match!"** al producirse like mutuo, con opción de ir al chat o seguir explorando
- ✅ Exclusión automática de perfiles ya swipeados, ya matcheados y usuarios que marcaron "Ya conseguí roomie"
- ✅ Estado vacío amigable cuando no hay más perfiles en la ciudad seleccionada

### 💬 Matches y Chat

- ✅ Lista de matches con avatar, nombre, último mensaje, hora y score de compatibilidad miniatura
- ✅ Chat en tiempo real (en memoria) con burbujas diferenciadas por remitente
- ✅ Mensajes sugeridos para romper el hielo (4 opciones rápidas en chats nuevos)
- ✅ Marcar mensajes como leídos al abrir el chat

### 📄 Acuerdo de convivencia digital

- ✅ Formulario con 6 secciones editables: limpieza, política de visitas, horarios de silencio, división de gastos, zonas comunes, otras reglas
- ✅ Creación del acuerdo desde el chat, asociado al match
- ✅ Vista de solo lectura del acuerdo una vez firmado, con fecha de creación

### ⭐ Sistema de reseñas

- ✅ Calificación general de 1 a 5 estrellas
- ✅ 4 categorías independientes: Limpieza, Ruido, Respeto, Puntualidad en pagos
- ✅ Campo de comentario libre
- ✅ Score promedio actualizado en tiempo real en el perfil del calificado
- ✅ Reseñas visibles en el perfil con desglose por categoría

### 👤 Perfil de usuario

- ✅ Visualización con encabezado degradado y avatar
- ✅ Indicador de verificación con correo universitario
- ✅ Edición inline de bio
- ✅ Cambio de situación habitacional (modal A / B / C)
- ✅ Botón **"Ya conseguí roomie"** — oculta el perfil de la búsqueda de otros usuarios
- ✅ Reactivar búsqueda en cualquier momento
- ✅ Resumen de hábitos de convivencia: hora de sueño, limpieza, ruido, presupuesto mensual, visitas, estilo social, servicio de limpieza
- ✅ Estadísticas: número de matches, reseñas recibidas, score promedio
- ✅ Listado de reseñas recibidas con categorías desglosadas
- ✅ Botón de cerrar sesión

### 🗺️ Guía de zonas universitarias

- ✅ Listado de barrios y sectores recomendados para universitarios
- ✅ Filtro por ciudad mediante chips
- ✅ Tarjeta de zona: nombre, ciudad, precio promedio de arriendo, score de seguridad y transporte (escala de puntos), tags descriptivos
- ✅ Modal de detalle con: precio / seguridad / transporte en tarjetas, descripción completa, universidades cercanas y listado de características

### ⚙️ Sistema y características transversales

- ✅ Algoritmo de compatibilidad ponderado en 6 dimensiones (resultado 0–100%)
- ✅ Labels de compatibilidad: Excelente (≥80) · Buena (≥65) · Regular (≥50) · Baja (<50)
- ✅ Color coding del score: verde / amarillo / naranja / rojo según nivel
- ✅ Navegación inferior (BottomNav) con 4 pestañas: Descubrir, Matches, Zonas, Perfil
- ✅ Animaciones: swipe izquierda/derecha, slide-up en modales, fade-in en modal de match
- ✅ Diseño mobile-first con `height: 100dvh`
- ✅ Más de 30 universidades en 8+ ciudades colombianas
- ✅ 16 perfiles mock con datos realistas
- ✅ 6 zonas universitarias en las principales ciudades del país
- ✅ Reseñas mock pre-cargadas para simular historial

---

### Estados habitacionales
| Estado | Descripción |
|--------|-------------|
| **A** | Sin cuarto ni roomie — busca ambos |
| **B** | Tiene cuarto disponible — busca roomie |
| **C** | Tiene roomie — buscan cuarto juntos |

---

## 🏗️ Stack tecnológico

| Tecnología | Uso |
|-----------|-----|
| React 18 | UI framework |
| TypeScript | Tipado estático |
| Vite | Build tool / dev server |
| React Router DOM | Navegación |
| Lucide React | Iconografía |
| Context API + useReducer | State management |
| CSS Custom Properties | Design system |

---

## 🚀 Instalación y uso

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/RoomieMatch.git
cd RoomieMatch

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# Build de producción
npm run build
```

La app corre en `http://localhost:5173` por defecto.

---

## 📂 Estructura del proyecto

```
src/
├── components/
│   └── BottomNav.tsx         # Navegación inferior
├── context/
│   └── AppContext.tsx         # State global (Context API + useReducer)
├── data/
│   └── mockData.ts           # Perfiles, zonas y universidades de ejemplo
├── screens/
│   ├── AuthScreen.tsx        # Registro / login + test de compatibilidad
│   ├── DiscoverScreen.tsx    # Feed de swipe principal
│   ├── MatchesScreen.tsx     # Lista de matches + chat + acuerdo + reseña
│   ├── ProfileScreen.tsx     # Perfil del usuario
│   └── ZonesScreen.tsx       # Guía de zonas universitarias
├── types/
│   └── index.ts              # Tipos TypeScript globales
├── utils/
│   └── compatibility.ts      # Motor de score de compatibilidad
├── App.tsx
├── main.tsx
└── index.css                 # Design system con CSS variables
```

---

## 🧮 Algoritmo de compatibilidad

El score (0–100) se calcula ponderando 6 dimensiones:

| Dimensión | Peso |
|-----------|------|
| Horarios de sueño y estudio | 20% |
| Limpieza | 20% |
| Ruido | 18% |
| Visitas | 15% |
| Estilo social | 15% |
| Presupuesto | 12% |

**Labels:** Excelente (≥80) · Buena (≥65) · Regular (≥50) · Baja (<50)

---

## 🇨🇴 Universidades y ciudades soportadas (V1)

**Ciudades:** Bogotá · Medellín · Cali · Barranquilla · Manizales · Bucaramanga

**Universidades:** UNAL · Uniandes · Javeriana · U. de Antioquia · EAFIT · ICESI · U. del Norte · U. de Manizales

---

## 🗺️ Roadmap

- [ ] Autenticación real con correo universitario (OAuth / magic link)
- [ ] Backend con API REST (Node.js + PostgreSQL)
- [ ] Chat en tiempo real (WebSockets)
- [ ] Notificaciones push
- [ ] Integración con Metrocuadrado / Fincaraíz
- [ ] Pasarela de pago (Nequi, PSE) para suscripción premium
- [ ] Aplicación nativa (React Native)

---

## 📄 Licencia

MIT © RoomieMatch 2026
