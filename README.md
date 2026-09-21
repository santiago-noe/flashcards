# 🗂️ Flashcards - Plataforma de Estudio

Aplicación web interactiva para el aprendizaje y repaso mediante **tarjetas de memoria (flashcards)**, diseñada para asignaturas universitarias (con enfoque principal en **Redes de Datos**, además de Derecho Informático, Gestión de Datos, Seguridad TI y más).

---

## ✨ Características

- 🧠 **Estudio Interactivo**: Modo de estudio con animaciones 3D de volteo de tarjetas y calificación de dificultad/acierto.
- 📊 **Seguimiento de Progreso**: Registro de porcentaje de dominio (*mastery*), tarjetas estudiadas y sesiones completadas.
- ⚙️ **Panel de Administración**: Creación, edición y eliminación de mazos y tarjetas organizadas por curso y categoría.
- 🌱 **Datos de Prueba (Seed)**: Carga inicial automatizada de mazos con contenidos de redes (Modelo OSI, TCP/IP, etc.).
- 🐳 **Contenerizado**: Configuración lista para despliegue con Docker y Docker Compose.

---

## 🛠️ Tecnologías

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Framer Motion |
| **Backend** | Node.js, Express.js, Mongoose, Multer, CORS |
| **Base de Datos** | MongoDB |
| **DevOps** | Docker, Docker Compose |

---

## 📁 Estructura del Proyecto

```text
flashcards/
├── backend/             # API REST en Node.js + Express
│   ├── src/
│   │   ├── controllers/ # Lógica de controladores (mazos, tarjetas)
│   │   ├── models/      # Modelos de Mongoose (Deck, Card)
│   │   ├── routes/      # Endpoints (/api/decks, /api/cards, /api/admin)
│   │   └── services/    # Configuración del servidor y conexión DB
│   └── package.json
├── frontend/            # Aplicación Next.js
│   ├── app/
│   │   ├── admin/       # Panel de administración de mazos
│   │   ├── study/[id]/  # Interfaz interactiva de estudio
│   │   └── page.tsx     # Vista principal y selector de cursos
│   └── package.json
├── docker-compose.yml   # Orquestación de servicios (Mongo + API + Web)
└── README.md
```

---

## 🚀 Puesta en Marcha

### Opción 1: Con Docker Compose (Recomendado)

Requiere tener instalado **Docker** y **Docker Compose**:

```bash
# Levantar MongoDB, Backend y Frontend
docker-compose up -d --build

# Para detener los servicios
docker-compose down
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **MongoDB:** `localhost:27017`

---

### Opción 2: Ejecución Local (Desarrollo)

#### Requisitos Previos:
- Node.js (v18 o superior)
- Instancia de MongoDB corriendo localmente (`mongodb://localhost:27017`)

#### 1. Iniciar Backend:
```bash
cd backend
npm install
npm run dev
# Servidor disponible en http://localhost:5000
```

#### 2. Iniciar Frontend:
```bash
cd frontend
npm install
npm run dev
# Aplicación disponible en http://localhost:3000
```

> **Nota:** Para producción en el frontend, primero compila con `npm run build` antes de ejecutar `npm start`.

---

## 🌐 Variables de Entorno

### Backend (`backend/.env` opcional)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flashcards-redes
```

### Frontend (`frontend/.env.local` opcional)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📡 Endpoints Principales de la API

- `GET /api/decks` - Lista resumen de todos los mazos publicados.
- `GET /api/decks/:id` - Obtiene un mazo completo con sus tarjetas.
- `POST /api/decks` - Crea un nuevo mazo.
- `POST /api/decks/seed` - Inserta datos iniciales de prueba.
- `POST /api/decks/:id/study` - Guarda resultados de una sesión de estudio.
- `POST /api/cards/:deckId` - Agrega una tarjeta a un mazo.
- `PUT /api/cards/:deckId/:cardId` - Actualiza una tarjeta.
- `DELETE /api/cards/:deckId/:cardId` - Elimina una tarjeta.
- `GET /api/admin/stats` - Estadísticas generales (total mazos, tarjetas, dominio promedio).
