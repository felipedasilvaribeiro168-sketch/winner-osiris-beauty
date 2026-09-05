import { getStore } from '@netlify/blobs';

const store = getStore('winner-osiris-orders');

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function adminPassword(req, body = null) {
  const header = req.headers.get('authorization') || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return body?.auth || new URL(req.url).searchParams.get('auth') || '';
}

function isAdmin(req, body = null) {
  const configured = process.env.ADMIN_PASSWORD || '';
  const supplied = adminPassword(req, body);
  return Boolean(configured && supplied && supplied === configured);
}

export default async (req) => {
  try {
    const url = new URL(req.url);

    if (req.method === 'POST') {
      const order = await req.json();
      if (!order?.id || !order?.createdAt || !order?.name || !order?.instagram || !Array.isArray(order?.items)) {
        return json({ error: 'Dados do pedido incompletos.' }, 400);
      }
      // Never trust a client-provided status.
      const clean = {
        id: String(order.id).slice(0, 40),
        createdAt: Number(order.createdAt),
        name: String(order.name).slice(0, 120),
        instagram: String(order.instagram).slice(0, 120),
        email: String(order.email || '').slice(0, 160),
        currency: order.currency === 'USD' ? 'USD' : 'BRL',
        totalBRL: Number(order.totalBRL) || 0,
        items: order.items.slice(0, 30).map(i => ({ id: Number(i.id), name: String(i.name).slice(0, 120), priceBRL: Number(i.priceBRL) || 0 }))
      };
      await store.setJSON(clean.id, clean);
      return json({ ok: true, id: clean.id }, 201);
    }

    if (req.method === 'GET') {
      const id = url.searchParams.get('id');
      if (id) {
        const order = await store.get(id, { type: 'json' });
        if (!order) return json({ error: 'Pedido não encontrado.' }, 404);
        // Public tracking only needs order data; do not expose admin-only fields because none are stored.
        return json(order);
      }
      if (!isAdmin(req)) return json({ error: 'Não autorizado.' }, 401);
      const { blobs } = await store.list();
      const orders = [];
      for (const item of blobs) {
        const order = await store.get(item.key, { type: 'json' });
        if (order) orders.push(order);
      }
      orders.sort((a, b) => b.createdAt - a.createdAt);
      return json(orders);
    }

    if (req.method === 'PATCH') {
      const body = await req.json();
      if (!isAdmin(req, body)) return json({ error: 'Não autorizado.' }, 401);
      const id = String(body.id || '');
      const order = await store.get(id, { type: 'json' });
      if (!order) return json({ error: 'Pedido não encontrado.' }, 404);
      if (body.status === 'delivered') order.manualStatus = 'delivered';
      await store.setJSON(id, order);
      return json({ ok: true, order });
    }

    return json({ error: 'Método não permitido.' }, 405);
  } catch (error) {
    console.error(error);
    return json({ error: 'Erro interno no serviço de pedidos.' }, 500);
  }
};

export const config = { path: '/api/orders' };
