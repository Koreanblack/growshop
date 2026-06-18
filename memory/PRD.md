# Verdor · Growshop Premium — PRD

## Problem Statement
E-commerce growshop premium para Argentina. Equipamiento, nutrición y herramientas (SIN semillas). Listo para deploy con MercadoPago, REPROCANN, login Google y panel admin.

## Architecture
- **Frontend**: React 19 + React Router + Tailwind + lucide-react
- **Backend**: FastAPI (Python) + Motor (MongoDB async) + MercadoPago SDK + JWT
- **DB**: MongoDB
- **Auth clientes**: Emergent Google Auth
- **Auth admin**: JWT con email/password (hardcoded)
- **Pagos**: MercadoPago Checkout Pro (Argentina, ARS) con modo demo automático si no hay token configurado

## User Personas
1. Cliente cultivador hobbyista — compra equipamiento básico/medio
2. Cliente profesional / paciente REPROCANN — busca calidad premium, asesoría
3. Admin de Verdor — gestiona productos, ve pedidos y altas de REPROCANN

## Core Requirements (DONE)
- [x] Catálogo con 7 categorías (iluminación, fertilizantes, sustratos, macetas, accesorios, control plagas, herramientas)
- [x] ~19 productos seed premium (sin semillas)
- [x] Búsqueda por texto + filtros por categoría (pills)
- [x] Carrito (localStorage) + drawer lateral
- [x] Checkout completo con MercadoPago (modo demo + modo real)
- [x] Formulario REPROCANN con persistencia
- [x] Panel admin: CRUD productos, listado pedidos, listado REPROCANN
- [x] Login clientes con Google (Emergent Auth)
- [x] Login admin (JWT)
- [x] Diseño premium organic-modern (verde forest #1A4331, Outfit + Manrope)
- [x] Footer con info legal Argentina
- [x] Responsive

## What's been implemented — 2026-06-18
- MVP completo + testing 100% (20/20 backend, 100% frontend CRUD admin)
- Bug fix: duplicate kwarg in admin_create_product
- Bug fix: error handling in admin saveProduct

## Backlog / Next steps
### P0 (antes de salir a producción real)
- Conectar Access Token + Public Key real de MercadoPago del usuario
- Cambiar `MP_DEMO_MODE=false` y deployar
- Cambiar `ADMIN_PASSWORD` por algo más fuerte
- Cambiar `JWT_SECRET` por uno aleatorio

### P1 (próximas iteraciones)
- Upload de imágenes (S3/Cloudinary) en lugar de URL
- Subida de constancia REPROCANN (file upload)
- Email transaccional al confirmar orden (Resend/SendGrid)
- Cupones y descuentos REPROCANN automáticos para usuarios verificados
- Página "Mis pedidos" para clientes logueados
- Filtros adicionales (precio, marca)
- Reviews de productos

### P2
- Programa de puntos / fidelización
- Asesoramiento por WhatsApp integrado
- Blog / guía de cultivo
- App mobile

## Endpoints
- Public: /api/categories, /api/products[?q&category&featured], /api/products/{slug}, /api/orders/checkout, /api/orders/{id}, /api/reprocann, /api/mercadopago/webhook
- Client auth: /api/auth/session, /api/auth/me, /api/auth/logout
- Admin: /api/admin/login, /api/admin/products (POST/PUT/DELETE), /api/admin/orders, /api/admin/reprocann
