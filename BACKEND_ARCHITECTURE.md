# 📋 Documentación del Backend - CuerpoYAlma

## Índice
1. [Estructura General](#estructura-general)
2. [Base de Datos (Models)](#base-de-datos-models)
3. [Controladores (Controllers)](#controladores-controllers)
4. [Rutas (Routes)](#rutas-routes)
5. [Flujos Principales](#flujos-principales)
6. [Roles y Permisos](#roles-y-permisos)

---

## Estructura General

El backend está construido con **Laravel 12** + **Inertia.js** + **Vue 3 (frontend)**.

```
app/
├── Http/Controllers/     # Lógica de negocio
├── Models/              # Modelos de datos (Eloquent)
├── Notifications/       # Notificaciones por email/UI
└── Providers/           # Configuración de servicios

database/
├── migrations/          # Esquema de BD (versionado)
├── factories/           # Fabricadores para tests
└── seeders/             # Datos iniciales

routes/
├── web.php              # Rutas web autenticadas
└── auth.php             # Rutas de autenticación (login, register)

tests/
├── Feature/             # Tests de integración (Pest)
└── Unit/                # Tests unitarios
```

---

## Base de Datos (Models)

### 1. **User** (`app/Models/User.php`)
Modelo de usuario con autenticación y roles (Spatie Laravel Permission).
- **Relaciones principales:**
  - `roles()` → Roles asignados (cliente, entrenador, superusuario)
  - `notificaciones()` → Notificaciones enviadas
  - `horariosTrabajoEntrenador()` → Si es entrenador, sus horarios de trabajo

**Campos:**
- id, name, email, telefono, password, email_verified_at, created_at, updated_at

**Roles disponibles:**
- `cliente` → Usuario que reserva clases
- `entrenador` → Crea/edita clases, asigna guías
- `superusuario` → Gestiona entrenadores, clientes, máquinas, ejercicios

---

### 2. **HorarioClase** (`app/Models/HorarioClase.php`)
Instancia de una clase (fecha, hora, entrenador, capacidad).
- **Relaciones:**
  - `user()` → Entrenador que imparte la clase (FK: user_id)
  - `clase()` → Referencia a la clase base (FK: clase_id, puede ser NULL)
  - `clientes()` → BelongsToMany con pivot `horario_clase_users` (estado: pendiente/confirmado/cancelado)
  - `listaEspera()` → Usuarios en lista de espera (HasMany → ListaEsperaClase)

**Campos:**
- id, user_id, clase_id, nombre, capacidad, fecha, hora_inicio, hora_fin, descripcion, created_at, updated_at

**Estados de clientes:**
- `pendiente` → Reserva inicial
- `confirmado` → Confirmada por entrenador
- `cancelado` → Usuario canceló su asistencia

---

### 3. **HorarioClaseUser** (`app/Models/HorarioClaseUser.php`)
Tabla pivot: relación Many-to-Many entre usuarios y horarios de clase.
- **Campos:**
  - id, horario_clase_id (FK), user_id (FK), estado, created_at, updated_at

---

### 4. **ListaEsperaClase** (`app/Models/ListaEsperaClase.php`)
Gestiona la cola de espera cuando una clase está completa.
- **Métodos estáticos útiles:**
  - `agregarALista($horarioId, $userId)` → Agrega user a la lista
  - `reordenarPosiciones($horarioId)` → Reordena posiciones (1, 2, 3...)

**Campos:**
- id, horario_clase_id (FK), user_id (FK), posicion, created_at, updated_at

---

### 5. **Clase** (`app/Models/Clase.php`)
Plantilla de clase (yoga, pilates, cardio, etc.). OPCIONAL; HorarioClase puede usar `nombre` directo.
- **Relaciones:**
  - `user()` → Creador de la clase (FK: user_id)
  - `horarios()` → HasMany de HorarioClase

**Campos:**
- id, user_id (creador), nombre, descripcion, nivel, created_at, updated_at

---

### 6. **Guia** (`app/Models/Guia.php`)
Plan de ejercicios asignado a clientes.
- **Relaciones:**
  - `guiaEjercicio()` → BelongsToMany con pivot `guia_ejercicios` (campos: series, repeticiones, instrucciones, orden)
  - `vistaGuias()` → Registro de asignaciones a usuarios (HasMany → GuiaView)

**Campos:**
- id, titulo, nivel, contenido, created_at, updated_at

**Campos del pivot (guia_ejercicios):**
- id, guia_id, ejercicio_id, series, repeticiones, instrucciones, orden, created_at, updated_at

---

### 7. **GuiaView** (`app/Models/GuiaView.php`)
Registro: "usuario X tiene la guía Y asignada desde fecha Z".
- **Relaciones:**
  - `user()` → Usuario que tiene asignada la guía
  - `guia()` → La guía asignada

**Campos:**
- id, user_id (FK), guia_id (FK), created_at, updated_at

---

### 8. **Ejercicio** (`app/Models/Ejercicio.php`)
Ejercicio individual (sentadilla, flexión, etc.).
- **Relaciones:**
  - `guias()` → BelongsToMany (está en múltiples guías)
  - `claseEjercicios()` → Puede estar en ejercicios de clase

**Campos:**
- id, nombre, descripcion, nivel_dificultad, video_url, imagen_url, created_at, updated_at

---

### 9. **Maquina** (`app/Models/Maquina.php`)
Máquina del gimnasio (estado: operativa, mantenimiento, fuera_de_servicio).
- **Campos:**
  - id, nombre, marca, modelo, estado (default: operativa), ubicacion, created_at, updated_at

---

### 10. **GimnasioHorario** (`app/Models/GimnasioHorario.php`)
Horario de apertura del gimnasio (ej: lunes 06:00-22:00).
- **Campos:**
  - id, dia_semana (1-7), hora_apertura, hora_cierre, created_at, updated_at

---

### 11. **HorarioTrabajo** (`app/Models/HorarioTrabajo.php`)
Horario de disponibilidad de un entrenador (ej: lunes 09:00-14:00, 16:00-20:00).
- **Campos:**
  - id, user_id (FK, entrenador), dia_semana (1-7), hora_inicio, hora_fin, created_at, updated_at

---

### 12. **ClaseEjercicio** (`app/Models/ClaseEjercicio.php`)
OBSOLETO/OPCIONAL: Relación many-to-many entre Clase y Ejercicio (similar a guia_ejercicios).

---

### 13. **Notificaciones** (`database/migrations/2026_01_07_120000_create_notifications_table.php`)
Tabla de notificaciones (Laravel built-in).
- **Campos:** id, notifiable_id, notifiable_type, type, data, read_at, created_at

---

## Controladores (Controllers)

### 1. **ClienteDashboardController**
**Propósito:** Dashboard principal del cliente (rol: cliente).
**Métodos:**
- `index()` → GET `/dashboard`
  - Retorna: próximas clases (7 días), historial de clases (últimas 10), guía actual, estadísticas (total tomadas, reservadas, en lista espera), clases por mes.

---

### 2. **HorarioClaseController**
**Propósito:** Gestión completa de horarios de clase.
**Métodos:**
- `index()` → GET `/clases` (con parámetros `mes`, `ano`)
  - Retorna lista de clases del mes con estado de reserva del usuario autenticado (JSON o Inertia).
- `create()` → GET `/clases/crear` (solo entrenador/superusuario)
  - Muestra formulario de crear clase.
- `store()` → POST `/clases` (solo entrenador/superusuario)
  - Valida y crea nueva HorarioClase.
- `show()` → GET `/clases/{horarioClase}`
  - Muestra detalles de una clase (clientes inscritos, lista de espera, si el user está inscrito, etc.).
- `edit()` → GET `/clases/{horarioClase}/editar` (solo dueño o superusuario)
  - Muestra formulario de edición.
- `update()` → PATCH `/clases/{horarioClase}` (solo dueño o superusuario)
  - Actualiza datos de la clase.
- `destroy()` → DELETE `/clases/{horarioClase}` (solo dueño o superusuario)
  - Elimina clase y sus reservas asociadas.

---

### 3. **ReservaClaseController**
**Propósito:** Reservas y lista de espera.
**Métodos:**
- `store()` → POST `/reservas`
  - Si clase no completa: crea HorarioClaseUser (estado: pendiente).
  - Si clase completa: agrega a ListaEsperaClase.
- `cancelar()` → PATCH `/reservas/{reserva}/cancelar` (solo dueño de la reserva)
  - Marca reserva como cancelada.
  - Si la clase estaba completa, promueve el primero de la lista de espera (automáticamente).
  - Envía notificación al usuario promovido.
- `cancelarListaEspera()` → PATCH `/lista-espera/{listaEspera}/cancelar` (solo dueño)
  - Elimina de lista de espera y reordena posiciones.
- `promoverDelListaEspera()` → PATCH `/lista-espera/{listaEspera}/promover` (solo entrenador/superusuario)
  - Promueve manualmente un usuario a reserva (si hay espacio).

---

### 4. **GuiaController**
**Propósito:** CRUD de guías de ejercicios.
**Métodos:**
- `index()` → GET `/guias`
  - Todas las guías (o solo del user si es entrenador).
- `create()` → GET `/guias/crear` (solo entrenador/superusuario)
  - Formulario para crear guía con lista de ejercicios.
- `store()` → POST `/guias` (solo entrenador/superusuario)
  - Crea Guia y asocia ejercicios en `guia_ejercicios` con series, repeticiones, instrucciones.
- `show()` → GET `/guias/{guia}`
  - Detalles de la guía.
- `edit()` → GET `/guias/{guia}/editar` (solo dueño o superusuario)
  - Formulario de edición.
- `update()` → PATCH `/guias/{guia}` (solo dueño o superusuario)
  - Actualiza guía y sus ejercicios.
- `destroy()` → DELETE `/guias/{guia}` (solo dueño o superusuario)
  - Elimina guía.

---

### 5. **EjercicioController**
**Propósito:** CRUD de ejercicios.
**Métodos:**
- `index()` → GET `/ejercicios` (solo entrenador/superusuario)
  - Lista de ejercicios disponibles.
- `create()` → GET `/ejercicios/crear` (solo entrenador/superusuario)
  - Formulario para crear ejercicio.
- `store()` → POST `/ejercicios` (solo entrenador/superusuario)
  - Crea Ejercicio.
- `show()` → GET `/ejercicios/{ejercicio}`
  - Detalles de ejercicio (descripción, nivel, video, imagen).
- `edit()` → GET `/ejercicios/{ejercicio}/editar` (solo entrenador/superusuario)
  - Formulario de edición.
- `update()` → PATCH `/ejercicios/{ejercicio}` (solo entrenador/superusuario)
  - Actualiza ejercicio.
- `destroy()` → DELETE `/ejercicios/{ejercicio}` (solo entrenador/superusuario)
  - Elimina ejercicio (no elimina de guías existentes si hay integridad referencial).

---

### 6. **MaquinaController**
**Propósito:** CRUD de máquinas.
**Métodos:**
- `index()` → GET `/maquinas`
  - Lista de todas las máquinas.
- `create()` → GET `/maquinas/crear` (solo entrenador/superusuario)
  - Formulario para crear máquina.
- `store()` → POST `/maquinas` (solo entrenador/superusuario)
  - Crea Maquina (estado: operativa).
- `show()` → GET `/maquinas/{maquina}`
  - Detalles de máquina.
- `edit()` → GET `/maquinas/{maquina}/editar` (solo entrenador/superusuario)
  - Formulario de edición.
- `update()` → PATCH `/maquinas/{maquina}` (solo entrenador/superusuario)
  - Actualiza datos de máquina.
- `cambiarEstado()` → PATCH `/maquinas/{maquina}/estado` (solo entrenador/superusuario)
  - Cambia estado a: operativa, mantenimiento, fuera_de_servicio.
- `destroy()` → DELETE `/maquinas/{maquina}` (solo entrenador/superusuario)
  - Elimina máquina.

---

### 7. **EntrenadorController**
**Propósito:** Gestión de entrenadores (superusuario only).
**Métodos:**
- `index()` → GET `/entrenadores` (solo superusuario)
  - Lista de todos los entrenadores.
- `create()` → GET `/entrenadores/crear` (solo superusuario)
  - Formulario para crear entrenador.
- `store()` → POST `/entrenadores` (solo superusuario)
  - Crea User con rol entrenador.
- `show()` → GET `/entrenadores/{entrenador}` (solo superusuario)
  - Detalles de entrenador.
- `edit()` → GET `/entrenadores/{entrenador}/editar` (solo superusuario)
  - Formulario de edición.
- `update()` → PATCH `/entrenadores/{entrenador}` (solo superusuario)
  - Actualiza datos de entrenador.
- `destroy()` → DELETE `/entrenadores/{entrenador}` (solo superusuario)
  - Elimina entrenador (soft delete o cascada según configuración).
- `clasesEntrenador()` → GET `/entrenadores/clases` (solo entrenador autenticado)
  - Retorna JSON con clases del entrenador actual.

---

### 8. **ClienteController**
**Propósito:** Gestión de clientes (superusuario only).
**Métodos:**
- `index()` → GET `/clientes` (solo superusuario)
  - Lista de clientes.
- `store()` → POST `/clientes` (solo superusuario)
  - Crea User con rol cliente.
- `show()` → GET `/clientes/{cliente}` (solo superusuario)
  - Detalles de cliente (name, email, teléfono, etc.).
- `edit()` → GET `/clientes/{cliente}/editar` (solo superusuario)
  - Formulario de edición.
- `update()` → PATCH `/clientes/{cliente}` (solo superusuario)
  - Actualiza datos de cliente.
- `destroy()` → DELETE `/clientes/{cliente}` (solo superusuario)
  - Elimina cliente.

---

### 9. **EntrenadorPanelController**
**Propósito:** Panel de control para entrenador (ver sus clases, gestionar lista de espera).
**Métodos:**
- `index()` → GET `/panel/clases` (solo entrenador/superusuario)
  - Lista de clases del entrenador actual (solo sus clases).
- `show()` → GET `/panel/clases/{horarioClase}` (solo entrenador/superusuario)
  - Detalles de clase: clientes inscritos, lista de espera.
- `promover()` → PATCH `/panel/clases/{horarioClase}/promover/{listaEspera}` (solo entrenador/superusuario)
  - Promueve manualmente un usuario de la lista de espera.
- `removerDelista()` → DELETE `/panel/clases/{horarioClase}/lista/{listaEspera}` (solo entrenador/superusuario)
  - Elimina un usuario de la lista de espera.

---

### 10. **HorarioTrabajoController**
**Propósito:** Horarios de disponibilidad de entrenadores.
**Métodos:**
- `index()` → GET `/entrenador/horario-trabajo` (solo superusuario)
  - Formulario para gestionar horarios de trabajos.
- `show()` → GET `/entrenadores/{entrenador}/horario-trabajo` (solo entrenador)
  - Retorna horarios de trabajo del entrenador (JSON).
- `store()` → POST `/entrenadores/{entrenador}/horario-trabajo` (solo superusuario)
  - Crea/actualiza horarios semanales de un entrenador.

---

### 11. **ProfileController**
**Propósito:** Gestión de perfil del usuario autenticado.
**Métodos:**
- `show()` → GET `/profile`
  - Muestra datos del perfil.
- `edit()` → GET `/profile/editar`
  - Formulario de edición.
- `update()` → PATCH `/profile`
  - Actualiza name, email, teléfono.
- `destroy()` → DELETE `/profile`
  - Elimina cuenta del usuario (con confirmación de contraseña).

---

### 12. **NotificationController**
**Propósito:** Gestión de notificaciones del usuario.
**Métodos:**
- `index()` → GET `/notifications`
  - Lista de notificaciones del usuario autenticado.
- `markAsRead()` → POST `/notifications/{id}/read`
  - Marca notificación como leída.

---

## Rutas (Routes)

### Middleware aplicado:
- `auth` → Usuario debe estar autenticado
- `role:cliente|entrenador|superusuario` → Usuario debe tener uno de estos roles
- `verified` → Email debe estar verificado

### Rutas públicas:
```
GET  /                    → Welcome page
GET  /login              → Login form (Breeze)
GET  /register           → Register form (Breeze)
```

### Rutas autenticadas (todos):
```
GET  /profile                                 → Ver perfil
GET  /profile/editar                          → Editar perfil
PATCH /profile                                → Actualizar perfil
DELETE /profile                               → Eliminar cuenta
GET  /notifications                           → Ver notificaciones
POST /notifications/{id}/read                 → Marcar como leída
GET  /clases                                  → Listar clases (con filtro mes/año)
GET  /clases/{horarioClase}                   → Ver detalles de clase
POST /reservas                                → Crear reserva
PATCH /reservas/{reserva}/cancelar            → Cancelar reserva
PATCH /lista-espera/{listaEspera}/cancelar    → Cancelar lugar en lista
GET  /guias                                   → Listar guías
GET  /guias/{guia}                            → Ver guía
GET  /ejercicios                              → Listar ejercicios
GET  /ejercicios/{ejercicio}                  → Ver ejercicio
GET  /maquinas                                → Listar máquinas
GET  /maquinas/{maquina}                      → Ver máquina
```

### Rutas solo para ENTRENADOR/SUPERUSUARIO:
```
GET  /clases/crear                            → Formulario crear clase
POST /clases                                  → Crear clase
GET  /clases/{horarioClase}/editar            → Editar clase
PATCH /clases/{horarioClase}                  → Actualizar clase
DELETE /clases/{horarioClase}                 → Eliminar clase
GET  /guias/crear                             → Formulario crear guía
POST /guias                                   → Crear guía
GET  /guias/{guia}/editar                     → Editar guía
PATCH /guias/{guia}                           → Actualizar guía
DELETE /guias/{guia}                          → Eliminar guía
GET  /ejercicios/crear                        → Formulario crear ejercicio
POST /ejercicios                              → Crear ejercicio
GET  /ejercicios/{ejercicio}/editar           → Editar ejercicio
PATCH /ejercicios/{ejercicio}                 → Actualizar ejercicio
DELETE /ejercicios/{ejercicio}                → Eliminar ejercicio
GET  /maquinas/crear                          → Formulario crear máquina
POST /maquinas                                → Crear máquina
GET  /maquinas/{maquina}/editar               → Editar máquina
PATCH /maquinas/{maquina}                     → Actualizar máquina
PATCH /maquinas/{maquina}/estado              → Cambiar estado máquina
DELETE /maquinas/{maquina}                    → Eliminar máquina
PATCH /lista-espera/{listaEspera}/promover    → Promover de lista de espera
DELETE /panel/clases/{horarioClase}/lista/{listaEspera} → Remover de lista
GET  /panel/clases                            → Panel de entrenador (sus clases)
GET  /panel/clases/{horarioClase}             → Detalles de clase (panel)
PATCH /panel/clases/{horarioClase}/promover/{listaEspera} → Promover (panel)
```

### Rutas solo para CLIENTE:
```
GET  /dashboard                               → Dashboard del cliente
```

### Rutas solo para SUPERUSUARIO:
```
GET  /entrenadores                            → Listar entrenadores
GET  /entrenadores/crear                      → Formulario crear entrenador
POST /entrenadores                            → Crear entrenador
GET  /entrenadores/{entrenador}               → Ver entrenador
GET  /entrenadores/{entrenador}/editar        → Editar entrenador
PATCH /entrenadores/{entrenador}              → Actualizar entrenador
DELETE /entrenadores/{entrenador}             → Eliminar entrenador
GET  /entrenador/horario-trabajo              → Gestionar horarios de trabajo
POST /entrenadores/{entrenador}/horario-trabajo → Guardar horarios
GET  /clientes                                → Listar clientes
POST /clientes                                → Crear cliente
GET  /clientes/{cliente}                      → Ver cliente
GET  /clientes/{cliente}/editar               → Editar cliente
PATCH /clientes/{cliente}                     → Actualizar cliente
DELETE /clientes/{cliente}                    → Eliminar cliente
```

---

## Flujos Principales

### 1. Flujo de Reserva de Clase (Cliente)

```
Cliente accede a GET /clases
  ↓
HorarioClaseController::index()
  - Obtiene clases del mes/año
  - Para cada clase, calcula:
    * Inscritos no cancelados
    * Si el user está inscrito (reserva_id)
    * Si el user está en lista de espera (lista_espera_id, posicion)
  ↓
Cliente hace POST /reservas { horario_clase_id }
  ↓
ReservaClaseController::store()
  - Valida que horario exista
  - Verifica: ¿user ya está inscrito? ¿en lista espera?
  - Si CLASE TIENE ESPACIO:
    • Crea HorarioClaseUser (estado: pendiente)
    • Retorna { success: true }
  - Si CLASE ESTÁ COMPLETA:
    • Llama ListaEsperaClase::agregarALista($horario_id, $user_id)
    • Retorna { success: true, mensaje: "Añadido a lista de espera" }
```

### 2. Flujo de Cancelación y Promoción Automática

```
Cliente hace PATCH /reservas/{reserva}/cancelar
  ↓
ReservaClaseController::cancelar()
  - Verifica que sea el dueño de la reserva
  - Conta inscritos NO cancelados ANTES de cancelar
  - Marca reserva como cancelado
  - Si clase ESTABA COMPLETA (era 10/10, ahora 9/10):
    • Llama procesarPromocionesDeLista($horario)
      ↓
      ListaEsperaClase::orderBy('posicion')->first()
        ↓
        Crea HorarioClaseUser (estado: pendiente)
        ↓
        Envía notificación: "¡Hay un lugar disponible!"
        ↓
        Elimina de ListaEsperaClase
        ↓
        Reordena posiciones (1, 2, 3...)
```

### 3. Flujo de Creación de Clase (Entrenador)

```
Entrenador accede a GET /clases/crear
  ↓
HorarioClaseController::create()
  - Si es superusuario: carga lista de entrenadores
  ↓
Entrenador POST /clases con datos
  ↓
HorarioClaseController::store()
  - Valida: nombre, capacidad, fecha (> hoy), hora_inicio < hora_fin, descripcion, user_id (si superusuario)
  - Si es superusuario + user_id: asigna ese entrenador
  - Si es entrenador: user_id = auth()->id()
  - Crea HorarioClase
  - Retorna redirect a /clases con success
```

### 4. Flujo de Asignación de Guía (Entrenador → Cliente)

```
Entrenador accede a GET /guias/crear
  ↓
GuiaController::create()
  - Retorna lista de ejercicios disponibles
  ↓
Entrenador POST /guias con:
  {
    titulo: "Plan Principiante",
    nivel: "principiante",
    contenido: "...",
    ejercicios: [
      { id: 1, series: 3, repeticiones: 10, instrucciones: "..." },
      { id: 2, series: 4, repeticiones: 8, instrucciones: "..." }
    ]
  }
  ↓
GuiaController::store()
  - Crea Guia
  - Para cada ejercicio: inserta en guia_ejercicios (con series, repeticiones, instrucciones, orden)
  - Nota: NO asigna a cliente automáticamente, es manual desde admin panel
  ↓
Superusuario asigna guía a cliente (manual en DB o admin panel)
  - INSERT INTO guia_views (user_id, guia_id) VALUES (...)
  ↓
Cliente ve su guía en GET /guias → retorna la con GuiaView::where('user_id', $user->id)
```

### 5. Flujo de Cambio de Estado de Máquina

```
Entrenador accede a GET /maquinas/{maquina}
  ↓
Entrenador POST /maquinas/{maquina}/estado con { estado: "mantenimiento" }
  ↓
MaquinaController::cambiarEstado()
  - Valida estado ∈ [operativa, mantenimiento, fuera_de_servicio]
  - Actualiza maquina.estado
  - Retorna redirect con success
```

---

## Roles y Permisos

### Mediante Spatie Laravel Permission:

#### 1. **CLIENTE**
- Ver dashboard (/dashboard)
- Listar/ver clases (/clases, /clases/{id})
- Reservar clase (POST /reservas)
- Cancelar su reserva (PATCH /reservas/{id}/cancelar)
- Ver su guía actual (GET /guias → filtra por GuiaView)
- Ver ejercicios y máquinas (read-only)

#### 2. **ENTRENADOR**
- Todo de CLIENTE +
- Crear/editar/eliminar sus clases
- Crear/editar/eliminar guías
- Crear/editar/eliminar ejercicios
- Crear/editar/eliminar máquinas
- Cambiar estado de máquinas
- Ver panel de sus clases (/panel/clases)
- Promover/remover usuarios de lista de espera
- Ver su horario de trabajo

#### 3. **SUPERUSUARIO**
- Todo de ENTRENADOR +
- CRUD completo de entrenadores
- CRUD completo de clientes
- Gestionar horarios de trabajo de entrenadores (HorarioTrabajo)
- Ver/gestionar todos los recursos

### Middleware de roles:

```php
Route::middleware('role:cliente')->group(fn () => [
    // Solo cliente
]);

Route::middleware('role:entrenador|superusuario')->group(fn () => [
    // Entrenador o superusuario
]);

Route::middleware('role:superusuario')->group(fn () => [
    // Solo superusuario
]);
```

---

## Validaciones Comunes

### En Controladores (Request validation):
- `required|string|max:255` → Campos de texto
- `required|date|after:today` → Fechas futuras (clases)
- `required|integer|min:1|max:50` → Capacidad de clase
- `required|exists:users,id` → FK válida
- `unique:users,email` → Email único
- `nullable|string|max:50` → Campo opcional

### Políticas (Model Policies):
- **Actualizar/Eliminar clase:** Solo dueño (user_id) o superusuario
- **Actualizar/Eliminar guía:** Solo dueño o superusuario
- **Cancelar reserva:** Solo el usuario propietario de la reserva
- **Promover de lista:** Solo entrenador de la clase o superusuario

---

## Notificaciones

**Ubicación:** `app/Notifications/SimpleNotification.php`

**Tipos:**
- Promovido de lista de espera (cuando hay espacio y se promociona automáticamente)
- Aviso general (enviado mediante SimpleNotification)

**Cómo se envía:**
```php
Notification::send(
    $user,
    new SimpleNotification("Mensaje", "url_redireccion")
);
```

**Almacenamiento:** Tabla `notifications` (Laravel's built-in).

---

## Migraciones Importantes

1. **0001_01_01_000000_create_users_table.php**
   - Crea tabla users con roles (Spatie Permission)

2. **2025_11_24_162437_create_permission_tables.php**
   - Tablas de Spatie: roles, permissions, model_has_roles, etc.

3. **2025_11_24_164101_create_horario_clases_table.php**
   - Horarios de clase con user_id (entrenador), clase_id (ref), nombre, capacidad, fecha, horas

4. **2025_11_25_081940_create_horario_clase_user_table.php**
   - Tabla pivot de reservas (relación M:M)

5. **2026_01_15_000000_create_lista_espera_clases_table.php**
   - Lista de espera con posición ordenada

6. **Otras:** guias, guia_ejercicios, ejercicios, maquinas, horario_trabajos, etc.

---

## Testing (Pest)

**Ubicación:** `tests/Feature/`

**Ejemplos:**
- `ClienteDashboardTest.php` → Tests del dashboard
- `ReservaClaseTest.php` → Tests de reservas
- `ListaEsperaClaseTest.php` → Tests de promoción automática
- `EntrenadorPanelTest.php` → Tests del panel de entrenador

**Ejecución:**
```bash
composer test                # Todos los tests
composer test tests/Feature/ReservaClaseTest.php  # Test específico
```

---

## Configuración de Entorno (.env)

```
DB_CONNECTION=sqlite  (o mysql)
DB_DATABASE=database.sqlite (o nombre BD)
MAIL_DRIVER=log       (para testing)
MAIL_FROM_ADDRESS=noreply@cuerpoalma.test
```

---

## Flujo Completo Ejemplo: Cliente Reserva Clase

```
1. User inicia sesión (POST /login)
   → Obtiene rol "cliente"

2. User accede a GET /dashboard
   → Ve próximas clases, historial, estadísticas, guía actual

3. User accede a GET /clases?mes=1&ano=2026
   → Ve lista de clases del mes (JSON)
   → Para cada clase: si está completa, si user está inscrito, posición en lista

4. User clica en clase y ve GET /clases/{horarioClase}
   → Detalles: entrenador, hora, clientes inscritos, capacidad

5. User hace POST /reservas { horario_clase_id: 5 }
   → Backend valida, verifica espacio
   → Si hay espacio: crea HorarioClaseUser (pendiente)
   → Si no hay: agrega a ListaEsperaClase (posicion: 1)

6. Si hay espacio y reserva es pendiente:
   → Entrenador ve en GET /panel/clases/{horarioClase}
   → Puede confirmar o cancelar la reserva del cliente

7. Si otro cliente cancela y quedan espacios:
   → Sistema automáticamente promueve al primero de lista
   → Se envía notificación
   → Cliente ve su reserva confirmada en next refresh
```

---

## Resumen de Endpoints por Función

| Función | Endpoint | Método | Auth | Rol |
|---------|----------|--------|------|-----|
| Ver clases | `/clases` | GET | ✓ | all |
| Reservar | `/reservas` | POST | ✓ | all |
| Cancelar reserva | `/reservas/{id}/cancelar` | PATCH | ✓ | owner |
| Ver guía | `/guias/{id}` | GET | ✓ | all |
| Crear guía | `/guias` | POST | ✓ | entrenador, superusuario |
| Ver ejercicios | `/ejercicios` | GET | ✓ | all |
| Crear ejercicio | `/ejercicios` | POST | ✓ | entrenador, superusuario |
| Crear clase | `/clases` | POST | ✓ | entrenador, superusuario |
| Panel entrenador | `/panel/clases` | GET | ✓ | entrenador, superusuario |
| Gestionar entrenadores | `/entrenadores` | * | ✓ | superusuario |
| Gestionar clientes | `/clientes` | * | ✓ | superusuario |

---

**Última actualización:** 19 de enero de 2026
**Versión:** Laravel 12 + Inertia.js + Vue 3
