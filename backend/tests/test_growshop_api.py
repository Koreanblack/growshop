"""Growshop Premium - backend API tests (pytest)
Covers: categories, products, orders+MP demo, REPROCANN, admin JWT+CRUD, auth/me."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://info-extractor-21.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@growshop.ar"
ADMIN_PASSWORD = "growshop2026"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    tok = r.json()["token"]
    assert isinstance(tok, str) and len(tok) > 10
    return tok


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------------- HEALTH / CATEGORIES ----------------
class TestHealth:
    def test_root(self, s):
        r = s.get(f"{API}/")
        assert r.status_code == 200
        d = r.json()
        assert d.get("demo_mode") is True

    def test_categories_returns_7(self, s):
        r = s.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert len(cats) == 7
        slugs = {c["slug"] for c in cats}
        assert {"iluminacion", "fertilizantes", "sustratos", "macetas", "accesorios", "control-plagas", "herramientas"} <= slugs
        for c in cats:
            for k in ("slug", "name", "image", "description"):
                assert k in c and c[k]


# ---------------- PRODUCTS ----------------
class TestProducts:
    def test_list_all(self, s):
        r = s.get(f"{API}/products")
        assert r.status_code == 200
        items = r.json()
        # ~20 products seeded
        assert 15 <= len(items) <= 30
        first = items[0]
        for k in ("id", "name", "slug", "price", "category", "image"):
            assert k in first

    def test_filter_by_category(self, s):
        r = s.get(f"{API}/products", params={"category": "iluminacion"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        assert all(p["category"] == "iluminacion" for p in items)

    def test_search_q(self, s):
        r = s.get(f"{API}/products", params={"q": "panel"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        joined = " ".join(p["name"].lower() + " " + p.get("description","" ).lower() for p in items)
        assert "panel" in joined

    def test_featured_filter(self, s):
        r = s.get(f"{API}/products", params={"featured": "true"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        assert all(p.get("featured") is True for p in items)

    def test_get_by_slug(self, s):
        # get a known slug from list
        all_items = s.get(f"{API}/products").json()
        slug = all_items[0]["slug"]
        r = s.get(f"{API}/products/{slug}")
        assert r.status_code == 200
        assert r.json()["slug"] == slug

    def test_get_unknown_slug_404(self, s):
        r = s.get(f"{API}/products/this-does-not-exist-xyz")
        assert r.status_code == 404


# ---------------- ORDERS / CHECKOUT (DEMO) ----------------
class TestOrders:
    def test_checkout_demo_creates_order(self, s):
        payload = {
            "items": [
                {"product_id": "p1", "title": "Panel LED 240W TEST", "quantity": 2, "unit_price": 185000}
            ],
            "payer_email": "TEST_buyer@example.com",
            "payer_name": "Test Buyer",
            "shipping_address": "Av. Siempreviva 742",
            "phone": "+5491111111111",
        }
        r = s.post(f"{API}/orders/checkout", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["demo_mode"] is True
        assert "order_id" in d and uuid.UUID(d["order_id"])
        assert "/payment/success" in d["init_point"]
        assert "demo=1" in d["init_point"]

        # GET order persists
        oid = d["order_id"]
        r2 = s.get(f"{API}/orders/{oid}")
        assert r2.status_code == 200
        order = r2.json()
        assert order["order_id"] == oid
        assert order["total"] == 185000 * 2
        assert order["payer_email"] == "TEST_buyer@example.com"
        assert order["status"] == "pending"

    def test_checkout_empty_cart_400(self, s):
        r = s.post(f"{API}/orders/checkout", json={
            "items": [],
            "payer_email": "TEST_x@example.com",
            "payer_name": "X",
            "shipping_address": "Y",
            "phone": "1",
        })
        # Empty cart should be 400 (or 422 if pydantic rejects)
        assert r.status_code in (400, 422)

    def test_get_unknown_order_404(self, s):
        r = s.get(f"{API}/orders/nope-{uuid.uuid4()}")
        assert r.status_code == 404


# ---------------- REPROCANN ----------------
class TestReprocann:
    def test_submit_ok(self, s):
        payload = {
            "full_name": "TEST Juan Perez",
            "dni": "30123456",
            "email": "TEST_juan@example.com",
            "phone": "+5491122334455",
            "reprocann_number": "RP-2026-001",
            "notes": "Auto-test"
        }
        r = s.post(f"{API}/reprocann", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["ok"] is True
        assert isinstance(d["id"], str) and len(d["id"]) > 0

    def test_submit_missing_fields_422(self, s):
        r = s.post(f"{API}/reprocann", json={"full_name": "X"})
        assert r.status_code == 422


# ---------------- ADMIN AUTH + CRUD ----------------
class TestAdmin:
    def test_login_invalid(self, s):
        r = s.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_orders_requires_token(self, s):
        r = s.get(f"{API}/admin/orders")
        assert r.status_code == 401

    def test_orders_with_token(self, s, admin_headers):
        r = s.get(f"{API}/admin/orders", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_reprocann_list_with_token(self, s, admin_headers):
        r = s.get(f"{API}/admin/reprocann", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_product_crud_lifecycle(self, s, admin_headers):
        # CREATE
        payload = {
            "name": "TEST Producto Auto",
            "description": "Producto creado por test",
            "price": 12345,
            "category": "accesorios",
            "stock": 5,
            "image": "https://images.unsplash.com/photo-1",
            "images": ["https://images.unsplash.com/photo-1"],
            "featured": False,
            "brand": "TestBrand",
        }
        r = s.post(f"{API}/admin/products", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        prod = r.json()
        pid = prod["id"]
        assert prod["name"] == payload["name"]
        assert prod["slug"] == "test-producto-auto"

        # Verify in catalog
        r2 = s.get(f"{API}/products/test-producto-auto")
        assert r2.status_code == 200

        # UPDATE
        r3 = s.put(f"{API}/admin/products/{pid}", json={"price": 99999, "name": "TEST Producto Auto v2"}, headers=admin_headers)
        assert r3.status_code == 200
        assert r3.json()["price"] == 99999
        assert r3.json()["slug"] == "test-producto-auto-v2"

        # DELETE
        r4 = s.delete(f"{API}/admin/products/{pid}", headers=admin_headers)
        assert r4.status_code == 200
        assert r4.json()["ok"] is True

        # Verify gone
        r5 = s.get(f"{API}/products/test-producto-auto-v2")
        assert r5.status_code == 404

    def test_create_product_without_token_401(self, s):
        r = s.post(f"{API}/admin/products", json={
            "name": "x", "description": "x", "price": 1, "category": "accesorios", "image": "x"
        })
        assert r.status_code == 401


# ---------------- AUTH (Emergent) ----------------
class TestAuth:
    def test_me_no_cookie_returns_401(self, s):
        # Use a fresh session to avoid carrying cookies from other tests
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401
