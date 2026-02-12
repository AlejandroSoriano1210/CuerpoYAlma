# Cuerpo y Alma — Plataforma web para gestión de gimnasios

Aplicación web orientada a gimnasios que combina **gestión interna del negocio** con una **experiencia para clientes**.

Permite administrar operaciones del centro (personal, clases, pagos, máquinas, notificaciones) y, al mismo tiempo, que los clientes puedan seguir su progreso, reservar clases y consultar su información personal.

---

## ¿Qué resuelve este proyecto?

- **Administración del gimnasio** desde un panel centralizado.
- **Seguimiento del cliente** (mediciones, perfil, progreso).
- **Planificación y reservas de clases** con control de cupos y lista de espera.
- **Gestión operativa** de entrenadores, horarios de trabajo y estado de máquinas.
- **Control financiero básico** con pagos e ingresos.

---

## Funciones principales

### 1) Gestión de usuarios y roles

La plataforma trabaja con roles para separar permisos y flujos de trabajo (por ejemplo: cliente, entrenador, superusuario y jefaturas).

- Acceso y vistas según rol.
- Gestión de perfil de usuario.
- Operaciones administrativas restringidas por permisos.

### 2) Área de cliente

Cada cliente puede gestionar su propia experiencia dentro del gimnasio:

- Ver y actualizar datos de perfil.
- Registrar y consultar mediciones corporales.
- Revisar estadísticas y evolución.
- Reservar/cancelar plazas en clases.
- Consultar notificaciones.

### 3) Gestión de clases y reservas

El sistema de clases cubre tanto la parte pública para clientes como la operativa para entrenadores/administración:

- Alta, edición y eliminación de clases.
- Visualización de detalle de clase.
- Reservas por cliente.
- Cancelaciones de reserva.
- Gestión de **lista de espera** y promoción de alumnos cuando se libera una plaza.

### 4) Guías de entrenamiento y ejercicios

Pensado para organizar rutinas y seguimiento:

- Catálogo de ejercicios.
- Creación y mantenimiento de guías.
- Asignación de guías a clientes.
- Visualización de avance asociado.

### 5) Gestión de entrenadores y horarios

- Alta y mantenimiento de entrenadores.
- Gestión de horarios de trabajo.
- Panel operativo para seguimiento de clases y asistencia.

### 6) Operación del gimnasio

- Configuración de horarios generales del gimnasio.
- Gestión de máquinas (estado operativo, mantenimiento, reportes).
- Notificaciones internas para eventos y acciones pendientes.
- Sistema de notificaciones enlazado con correo electrónico: las alertas que recibe el usuario dentro de la web también se envían por email.
- Notificaciones programadas automáticas.

### 7) Cobros e ingresos

- Registro y marcado de pagos de clientes.
- Consulta de ingresos.
- Descarga de factura PDF asociada al pago.

---

## Stack tecnológico

- **Backend:** Laravel 12 (PHP 8.2+).
- **Frontend:** React + Inertia.js.
- **Build:** Vite.
- **Autenticación/Base:** Laravel Breeze.
- **Permisos/Roles:** Spatie Laravel Permission.
- **PDFs:** barryvdh/laravel-dompdf.
- **Base de datos por defecto en desarrollo:** SQLite (configurable a MySQL u otra soportada por Laravel).

---

## Puesta en marcha local

### Requisitos

- PHP 8.2+
- Composer
- Node.js + npm
- Base de datos (SQLite por defecto)

### Instalación rápida

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
npm run dev
```

En otra terminal, levantar Laravel:

```bash
php artisan serve
```

> También puedes usar el script de Composer `composer run setup` para automatizar gran parte del arranque inicial.

---

## Comandos útiles

```bash
# Ejecutar pruebas
php artisan test

# Compilar frontend para producción
npm run build
```

---

## Tareas programadas (scheduler)

El proyecto incluye tareas automáticas como:

- Envío de notificaciones programadas.
- Reinicio/rotación semanal de progreso de guías.
- Limpieza periódica de clases antiguas.

Para que funcionen en producción, configura el scheduler de Laravel (`php artisan schedule:run`).

---

## Nota de mantenimiento

Si actualizas el repositorio y aparecen errores relacionados con migraciones consolidadas, ejecuta:

```bash
php artisan migrate:fresh --seed
```

Esto reinicia la base de datos local y reaplica todas las migraciones con datos de prueba.

---

## Estado del proyecto

Proyecto en evolución orientado a una gestión integral del gimnasio con foco en:

- experiencia de cliente,
- automatización operativa,
- y control administrativo.
