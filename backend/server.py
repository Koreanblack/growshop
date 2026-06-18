"""Growshop Premium - FastAPI Backend
Features: catalog, cart, MercadoPago checkout (test mode + demo fallback),
REPROCANN form, Emergent Google Auth (clients) + JWT (admin)."""
import os
import uuid
import logging
import httpx
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, BackgroundTasks, Depends, Cookie
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
import jwt
import mercadopago

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@growshop.ar")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "growshop2026")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
MP_ACCESS_TOKEN = os.environ.get("MP_ACCESS_TOKEN", "")
MP_DEMO_MODE = os.environ.get("MP_DEMO_MODE", "true").lower() == "true" or "REEMPLAZAR" in MP_ACCESS_TOKEN
FRONTEND_URL = os.environ.get("FRONTEND_URL", "")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

mp_sdk = mercadopago.SDK(MP_ACCESS_TOKEN) if not MP_DEMO_MODE else None

app = FastAPI(title="Growshop Premium API")
api = APIRouter(prefix="/api")


# ============================== MODELS ==============================
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    price: float
    category: str  # category slug
    stock: int = 0
    image: str
    images: List[str] = []
    featured: bool = False
    brand: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    stock: int = 0
    image: str
    images: List[str] = []
    featured: bool = False
    brand: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    featured: Optional[bool] = None
    brand: Optional[str] = None


class Category(BaseModel):
    slug: str
    name: str
    image: str
    description: str


class CartItem(BaseModel):
    product_id: str
    title: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)


class OrderCreate(BaseModel):
    items: List[CartItem]
    payer_email: EmailStr
    payer_name: str
    shipping_address: str
    phone: str


class ReprocannSubmit(BaseModel):
    full_name: str
    dni: str
    email: EmailStr
    phone: str
    reprocann_number: Optional[str] = None
    notes: Optional[str] = None


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


# ============================== HELPERS ==============================
def slugify(text: str) -> str:
    import re
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


async def get_current_user(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    token = session_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    expires_at = sess["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Sesión expirada")
    user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


async def require_admin(authorization: Optional[str] = None, request: Request = None):
    auth = authorization
    if request and not auth:
        auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin token requerido")
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="No autorizado")
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


def map_mp_status(mp_status: Optional[str]) -> str:
    if mp_status == "approved":
        return "paid"
    if mp_status in ("in_process", "pending", "authorized"):
        return "pending"
    if mp_status in ("rejected", "cancelled", "refunded", "charged_back"):
        return "failed"
    return "pending"


# ============================== SEED ==============================
CATEGORIES = [
    {"slug": "iluminacion", "name": "Iluminación LED", "image": "https://images.unsplash.com/photo-1681161528656-5abd54c1eca4?crop=entropy&cs=srgb&fm=jpg&w=800&q=80", "description": "Paneles LED full spectrum de alta eficiencia."},
    {"slug": "fertilizantes", "name": "Fertilizantes Premium", "image": "https://images.pexels.com/photos/18708750/pexels-photo-18708750.jpeg?w=800", "description": "Nutrición orgánica y mineral profesional."},
    {"slug": "sustratos", "name": "Sustratos", "image": "https://images.pexels.com/photos/8743845/pexels-photo-8743845.jpeg?w=800", "description": "Mezclas premium con coco, perlita y humus."},
    {"slug": "macetas", "name": "Macetas", "image": "https://images.pexels.com/photos/18294113/pexels-photo-18294113.jpeg?w=800", "description": "Tela, plástico y aireación inteligente."},
    {"slug": "accesorios", "name": "Accesorios", "image": "https://images.unsplash.com/photo-1611843467160-25afb8df1074?w=800&q=80", "description": "Tijeras, medidores, riego y más."},
    {"slug": "control-plagas", "name": "Control de Plagas", "image": "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deae?w=800&q=80", "description": "Soluciones orgánicas y profesionales."},
    {"slug": "herramientas", "name": "Herramientas", "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80", "description": "Indispensables para todo cultivador."},
]

PRODUCTS_SEED = [
    # Iluminación
    {"name": "Panel LED Quantum Board 240W", "category": "iluminacion", "price": 185000, "stock": 12, "brand": "GrowLight Pro", "featured": True,
     "description": "Panel LED full spectrum con chips Samsung LM301B y driver Mean Well. Ideal para 1.2x1.2m. Eficiencia 2.7 µmol/J.",
     "image": "https://images.unsplash.com/photo-1681161528656-5abd54c1eca4?w=800&q=80"},
    {"name": "Reflector LED 600W Cultivo Indoor", "category": "iluminacion", "price": 95000, "stock": 20, "brand": "FloraTech",
     "description": "Reflector LED de alta penetración con espectro completo. Cobertura 80x80cm.",
     "image": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80"},
    {"name": "Kit LED 320W con timer digital", "category": "iluminacion", "price": 240000, "stock": 6, "brand": "GrowLight Pro", "featured": True,
     "description": "Kit completo: panel LED 320W + timer digital + cables de suspensión. Listo para colgar.",
     "image": "https://images.unsplash.com/photo-1620207418302-439b387441b0?w=800&q=80"},

    # Fertilizantes
    {"name": "Set Tripack Base — Crecimiento, Floración y Bloom", "category": "fertilizantes", "price": 38000, "stock": 30, "brand": "TerraNutri", "featured": True,
     "description": "Línea completa de nutrientes minerales. 3x500ml. Cubre todo el ciclo de cultivo.",
     "image": "https://images.pexels.com/photos/18708750/pexels-photo-18708750.jpeg?w=800"},
    {"name": "Humus Líquido Orgánico 1L", "category": "fertilizantes", "price": 8500, "stock": 50, "brand": "BioGrow",
     "description": "Humus de lombriz líquido. Estimulante radicular natural. 100% orgánico.",
     "image": "https://images.unsplash.com/photo-1620207419336-eee32cf90c6e?w=800&q=80"},
    {"name": "Bloom Booster PK 13-14 — 500ml", "category": "fertilizantes", "price": 14500, "stock": 25, "brand": "TerraNutri",
     "description": "Potenciador de floración con alta concentración de fósforo y potasio.",
     "image": "https://images.unsplash.com/photo-1611843467160-25afb8df1074?w=800&q=80"},

    # Sustratos
    {"name": "Sustrato Premium All-Mix 50L", "category": "sustratos", "price": 22000, "stock": 18, "brand": "TerraNutri", "featured": True,
     "description": "Mezcla profesional: turba, perlita, humus, vermiculita y coco. Listo para usar.",
     "image": "https://images.pexels.com/photos/8743845/pexels-photo-8743845.jpeg?w=800"},
    {"name": "Fibra de Coco Compactada 5kg", "category": "sustratos", "price": 9800, "stock": 40, "brand": "BioGrow",
     "description": "Bloque de fibra de coco. Excelente drenaje y retención de humedad. Hidratable.",
     "image": "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deae?w=800&q=80"},
    {"name": "Perlita Agrícola 10L", "category": "sustratos", "price": 6500, "stock": 60, "brand": "BioGrow",
     "description": "Mejora la aireación y el drenaje del sustrato. Esencial para mezclas premium.",
     "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80"},

    # Macetas
    {"name": "Maceta de Tela Premium 20L", "category": "macetas", "price": 7200, "stock": 35, "brand": "AirPot", "featured": True,
     "description": "Maceta textil con asas reforzadas. Mejora la oxigenación radicular.",
     "image": "https://images.pexels.com/photos/18294113/pexels-photo-18294113.jpeg?w=800"},
    {"name": "Maceta Cuadrada 11L Negra", "category": "macetas", "price": 2400, "stock": 80, "brand": "PlastiGrow",
     "description": "Maceta plástica resistente y reutilizable. Drenaje optimizado.",
     "image": "https://images.unsplash.com/photo-1604762524889-3e2fcc145683?w=800&q=80"},
    {"name": "Maceta de Tela 30L con asas", "category": "macetas", "price": 9500, "stock": 22, "brand": "AirPot",
     "description": "Maceta textil de mayor capacidad para cultivos avanzados.",
     "image": "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80"},

    # Accesorios
    {"name": "Medidor pH/EC Digital", "category": "accesorios", "price": 28000, "stock": 14, "brand": "BlueLab",
     "description": "Medidor de bolsillo profesional. Sonda intercambiable. Calibración automática.",
     "image": "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&q=80"},
    {"name": "Tijera de poda curva acero inoxidable", "category": "accesorios", "price": 5500, "stock": 45, "brand": "ProTrim", "featured": True,
     "description": "Tijera ergonómica con hoja antiadherente. Ideal para manicurado.",
     "image": "https://images.unsplash.com/photo-1620207418302-439b387441b0?w=800&q=80"},
    {"name": "Termo-higrómetro digital con sonda", "category": "accesorios", "price": 9800, "stock": 30, "brand": "ClimaTech",
     "description": "Mide temperatura y humedad en tiempo real con histórico máx/mín.",
     "image": "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deae?w=800&q=80"},

    # Control plagas
    {"name": "Aceite de Neem Puro 250ml", "category": "control-plagas", "price": 7800, "stock": 28, "brand": "BioGrow", "featured": True,
     "description": "Insecticida y fungicida natural. Apto para cultivo orgánico.",
     "image": "https://images.unsplash.com/photo-1611843467160-25afb8df1074?w=800&q=80"},
    {"name": "Jabón Potásico 500ml", "category": "control-plagas", "price": 5200, "stock": 40, "brand": "BioGrow",
     "description": "Control natural de pulgones, cochinillas y ácaros.",
     "image": "https://images.unsplash.com/photo-1620207418302-439b387441b0?w=800&q=80"},

    # Herramientas
    {"name": "Kit Cultivo Pro — 6 piezas", "category": "herramientas", "price": 18500, "stock": 16, "brand": "ProTrim",
     "description": "Set de herramientas completo: tijeras, pala, rastrillo, transplantadora y más.",
     "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80"},
    {"name": "Regadera 5L cuello largo", "category": "herramientas", "price": 4900, "stock": 50, "brand": "PlastiGrow",
     "description": "Regadera resistente con boquilla de precisión. Ideal para plántulas.",
     "image": "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80"},
]


async def seed_db():
    if await db.categories.count_documents({}) == 0:
        await db.categories.insert_many(CATEGORIES)
        logger.info("Seeded %d categories", len(CATEGORIES))
    if await db.products.count_documents({}) == 0:
        docs = []
        for p in PRODUCTS_SEED:
            prod = Product(slug=slugify(p["name"]), images=[p["image"]], **p)
            d = prod.model_dump()
            d["created_at"] = d["created_at"].isoformat()
            docs.append(d)
        await db.products.insert_many(docs)
        logger.info("Seeded %d products", len(docs))


@app.on_event("startup")
async def on_startup():
    await seed_db()
    logger.info("MP_DEMO_MODE=%s", MP_DEMO_MODE)


# ============================== PUBLIC ROUTES ==============================
@api.get("/")
async def root():
    return {"app": "Growshop Premium", "demo_mode": MP_DEMO_MODE}


@api.get("/categories", response_model=List[Category])
async def list_categories():
    cats = await db.categories.find({}, {"_id": 0}).to_list(100)
    return cats


@api.get("/products", response_model=List[Product])
async def list_products(category: Optional[str] = None, q: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"brand": {"$regex": q, "$options": "i"}},
        ]
    items = await db.products.find(query, {"_id": 0}).to_list(500)
    for it in items:
        if isinstance(it.get("created_at"), str):
            try:
                it["created_at"] = datetime.fromisoformat(it["created_at"])
            except Exception:
                pass
    return items


@api.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if isinstance(p.get("created_at"), str):
        try:
            p["created_at"] = datetime.fromisoformat(p["created_at"])
        except Exception:
            pass
    return p


# ============================== ORDERS + MERCADOPAGO ==============================
@api.post("/orders/checkout")
async def create_checkout(order: OrderCreate, request: Request):
    if not order.items:
        raise HTTPException(status_code=400, detail="Carrito vacío")

    order_id = str(uuid.uuid4())
    total = sum(it.unit_price * it.quantity for it in order.items)

    order_doc = {
        "order_id": order_id,
        "items": [it.model_dump() for it in order.items],
        "total": total,
        "payer_email": order.payer_email,
        "payer_name": order.payer_name,
        "shipping_address": order.shipping_address,
        "phone": order.phone,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "mp_preference_id": None,
        "mp_payment_id": None,
        "mp_status": None,
        "demo_mode": MP_DEMO_MODE,
    }

    frontend_base = FRONTEND_URL or str(request.base_url).rstrip("/")
    backend_base = str(request.base_url).rstrip("/")

    if MP_DEMO_MODE:
        # Demo: simulate MP preference + redirect to local success page
        fake_pref = f"DEMO-{order_id[:8]}"
        order_doc["mp_preference_id"] = fake_pref
        order_doc["status"] = "pending"
        order_doc["demo_init_point"] = f"{frontend_base}/payment/success?order_id={order_id}&status=approved&demo=1"
        await db.orders.insert_one(order_doc)
        return {
            "order_id": order_id,
            "preference_id": fake_pref,
            "init_point": order_doc["demo_init_point"],
            "sandbox_init_point": order_doc["demo_init_point"],
            "demo_mode": True,
        }

    # Real MercadoPago
    preference_data = {
        "items": [
            {
                "title": it.title,
                "quantity": it.quantity,
                "unit_price": float(it.unit_price),
                "currency_id": "ARS",
            }
            for it in order.items
        ],
        "payer": {"email": order.payer_email, "name": order.payer_name},
        "back_urls": {
            "success": f"{frontend_base}/payment/success?order_id={order_id}",
            "pending": f"{frontend_base}/payment/pending?order_id={order_id}",
            "failure": f"{frontend_base}/payment/failure?order_id={order_id}",
        },
        "auto_return": "approved",
        "notification_url": f"{backend_base}/api/mercadopago/webhook",
        "external_reference": order_id,
        "statement_descriptor": "GROWSHOP",
    }

    try:
        result = mp_sdk.preference().create(preference_data)
        if result.get("status") not in (200, 201):
            logger.error("MP error: %s", result)
            raise HTTPException(status_code=502, detail="Error creando preferencia en MercadoPago")
        pref = result["response"]
        order_doc["mp_preference_id"] = pref["id"]
        await db.orders.insert_one(order_doc)
        return {
            "order_id": order_id,
            "preference_id": pref["id"],
            "init_point": pref.get("init_point"),
            "sandbox_init_point": pref.get("sandbox_init_point"),
            "demo_mode": False,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("MP creation failed: %s", e)
        raise HTTPException(status_code=502, detail=f"MercadoPago: {str(e)}")


@api.get("/orders/{order_id}")
async def get_order(order_id: str):
    o = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not o:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return o


async def process_payment(payment_id: str):
    if MP_DEMO_MODE or not mp_sdk:
        return
    try:
        resp = mp_sdk.payment().get(payment_id)
        if resp.get("status") not in (200, 201):
            return
        payment = resp["response"]
        ext_ref = payment.get("external_reference")
        if not ext_ref:
            return
        mp_status = payment.get("status")
        await db.orders.update_one(
            {"order_id": ext_ref},
            {"$set": {
                "status": map_mp_status(mp_status),
                "mp_payment_id": str(payment.get("id")),
                "mp_status": mp_status,
                "mp_detail": {k: payment.get(k) for k in ("status", "status_detail", "payment_method_id", "transaction_amount")},
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
    except Exception as e:
        logger.exception("process_payment error: %s", e)


@api.post("/mercadopago/webhook")
async def mp_webhook(request: Request, background_tasks: BackgroundTasks):
    qp = dict(request.query_params)
    try:
        body = await request.json()
    except Exception:
        body = {}
    topic = qp.get("topic") or qp.get("type") or body.get("type")
    payment_id = qp.get("id") or qp.get("data.id") or (body.get("data") or {}).get("id")
    if topic == "payment" and payment_id:
        background_tasks.add_task(process_payment, str(payment_id))
    return Response(status_code=200)


# ============================== REPROCANN ==============================
@api.post("/reprocann")
async def submit_reprocann(data: ReprocannSubmit):
    doc = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reprocann.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, "id": doc["id"]}


# ============================== ADMIN AUTH (JWT) ==============================
@api.post("/admin/login")
async def admin_login(data: AdminLogin):
    if data.email != ADMIN_EMAIL or data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    payload = {
        "sub": data.email,
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return {"token": token, "email": data.email}


@api.get("/admin/me")
async def admin_me(request: Request):
    await require_admin(request=request)
    return {"email": ADMIN_EMAIL, "role": "admin"}


@api.post("/admin/products", response_model=Product)
async def admin_create_product(p: ProductCreate, request: Request):
    await require_admin(request=request)
    data = p.model_dump()
    data["slug"] = slugify(p.name)
    data["images"] = p.images or [p.image]
    prod = Product(**data)
    doc = prod.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.products.insert_one(doc)
    return prod


@api.put("/admin/products/{product_id}", response_model=Product)
async def admin_update_product(product_id: str, p: ProductUpdate, request: Request):
    await require_admin(request=request)
    update_data = {k: v for k, v in p.model_dump().items() if v is not None}
    if "name" in update_data:
        update_data["slug"] = slugify(update_data["name"])
    if not update_data:
        raise HTTPException(status_code=400, detail="Nada para actualizar")
    res = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    p_doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(p_doc.get("created_at"), str):
        p_doc["created_at"] = datetime.fromisoformat(p_doc["created_at"])
    return p_doc


@api.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, request: Request):
    await require_admin(request=request)
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"ok": True}


@api.get("/admin/orders")
async def admin_list_orders(request: Request):
    await require_admin(request=request)
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders


@api.get("/admin/reprocann")
async def admin_list_reprocann(request: Request):
    await require_admin(request=request)
    items = await db.reprocann.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


# ============================== EMERGENT GOOGLE AUTH (CLIENTS) ==============================
@api.post("/auth/session")
async def auth_session(request: Request, response: Response):
    """Exchange session_id from Emergent Auth for our session_token."""
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id requerido")

    async with httpx.AsyncClient(timeout=15) as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
        )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Sesión inválida")
        data = r.json()

    email = data["email"]
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": data.get("name", ""),
            "picture": data.get("picture", ""),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user)
    else:
        await db.users.update_one({"email": email}, {"$set": {
            "name": data.get("name", user.get("name", "")),
            "picture": data.get("picture", user.get("picture", "")),
        }})

    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 60 * 60,
        path="/",
        secure=True,
        httponly=True,
        samesite="none",
    )

    user.pop("_id", None)
    return {"user": user}


@api.get("/auth/me")
async def auth_me(request: Request, session_token: Optional[str] = Cookie(None)):
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    user = await get_current_user(session_token=session_token, authorization=auth)
    user.pop("_id", None)
    return user


@api.post("/auth/logout")
async def auth_logout(response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ============================== MOUNT ==============================
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown():
    client.close()
