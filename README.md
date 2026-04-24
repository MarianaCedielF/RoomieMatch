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

## 📱 Funcionalidades MVP

### Núcleo
- ✅ Registro con verificación de correo universitario
- ✅ Test de compatibilidad de 6 dimensiones (horarios, limpieza, ruido, visitas, presupuesto, social)
- ✅ Feed de perfiles con swipe (like / pasar)
- ✅ Score de compatibilidad visible por perfil
- ✅ Match mutuo + chat habilitado

### Secundarias
- ✅ Publicación de cuarto disponible (Estado B)
- ✅ Acuerdo de convivencia digital
- ✅ Sistema de reseñas verificadas por categoría
- ✅ Guía de zonas universitarias por ciudad

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
