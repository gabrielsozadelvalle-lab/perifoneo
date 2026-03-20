
# Plataforma de Perifoneo - Plan de Implementación

## Descripción General
Plataforma web para gestionar clientes del servicio de perifoneo y activaciones. Moneda: Córdoba nicaragüense (C$). Se arranca con la ciudad de Matagalpa, con posibilidad de agregar más ciudades.

---

## Módulo 1: Gestión de Clientes
- **Crear, editar y eliminar clientes** con nombre, teléfono, ciudad asignada
- **Asignar monto mensual** en córdobas (C$) que paga cada cliente
- **Asignar fecha de pago** del mes (día del mes en que toca cobrar)
- **Asignar servicios contratados**: tipo (Activación o Perifoneo) y cantidad contratada por mes

## Módulo 2: Control de Servicios Realizados
- **Registrar cada servicio realizado** (activación o perifoneo) con fecha
- Ver el **historial detallado** de servicios prestados por cliente
- Ver **servicios pendientes** (cuántos le quedan a favor al cliente)
- Editar y eliminar registros de servicios

## Módulo 3: Gestión de Ciudades
- Catálogo de ciudades (arrancando con Matagalpa)
- Poder agregar nuevas ciudades conforme se expanda el negocio
- Cada cliente se asigna a una ciudad

## Módulo 4: Dashboard / Resúmenes
- **Vista global**: listado de todos los clientes con el **total de ingresos esperados del mes** (suma de montos mensuales)
- **Vista por ciudad**: filtrar clientes por ciudad y ver el ingreso esperado por ciudad
- Indicadores rápidos: total de clientes, total a cobrar, servicios pendientes

## Diseño y Navegación
- Barra lateral con navegación: Dashboard, Clientes, Ciudades
- Estilo limpio tipo dashboard con tarjetas de resumen
- Tabla de clientes con filtros por ciudad y búsqueda
- Moneda siempre mostrada como **C$**

## Backend (Lovable Cloud + Supabase)
- Base de datos con tablas: clientes, ciudades, servicios_contratados, servicios_realizados
- Login básico para proteger los datos
- Datos persistentes y seguros
