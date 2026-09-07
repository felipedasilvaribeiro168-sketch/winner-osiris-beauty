// Cloudflare Pages Function: /api/orders
// Substitui a antiga Netlify Function sem mudar a URL usada pelo site.
//
// Requer no Cloudflare Pages:
// 1) KV namespace com binding: ORDERS_KV
// 2) Secret/variable: ADMIN_PASSWORD

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function adminPassword(request, body = null) {
  const header = request.headers.get("authorization") || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return body?.auth || new URL(request.url).searchParams.get("auth") || "";
}

function isAdmin(request, env, body = null) {
  const configured = env.ADMIN_PASSWORD || "";
  const supplied = adminPassword(request, body);
  return Boolean(configured && supplied && supplied === configured);
}

function key(id) {
  return `order:${String(id).slice(0, 40)}`;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (!env.ORDERS_KV) {
    return json(
      {
        error:
          "O armazenamento de pedidos ainda não está conectado no Cloudflare. Configure o binding ORDERS_KV.",
      },
      503
    );
  }

  try {
    const url = new URL(request.url);

    if (request.method === "POST") {
      const order = await request.json();

      if (
        !order?.id ||
        !order?.createdAt ||
        !order?.name ||
        !order?.instagram ||
        !Array.isArray(order?.items)
      ) {
        return json({ error: "Dados do pedido incompletos." }, 400);
      }

      const clean = {
        id: String(order.id).slice(0, 40),
        createdAt: Number(order.createdAt),
        name: String(order.name).slice(0, 120),
        instagram: String(order.instagram).slice(0, 120),
        email: String(order.email || "").slice(0, 160),
        currency: order.currency === "USD" ? "USD" : "BRL",
        totalBRL: Number(order.totalBRL) || 0,
        items: order.items.slice(0, 30).map((item) => ({
          id: Number(item.id),
          name: String(item.name).slice(0, 120),
          priceBRL: Number(item.priceBRL) || 0,
        })),
      };

      await env.ORDERS_KV.put(key(clean.id), JSON.stringify(clean));
      return json({ ok: true, id: clean.id }, 201);
    }

    if (request.method === "GET") {
      const id = url.searchParams.get("id");

      if (id) {
        const order = await env.ORDERS_KV.get(key(id), "json");
        if (!order) return json({ error: "Pedido não encontrado." }, 404);
        return json(order);
      }

      if (!isAdmin(request, env)) {
        return json({ error: "Não autorizado." }, 401);
      }

      const listed = await env.ORDERS_KV.list({ prefix: "order:" });
      const orders = [];

      for (const item of listed.keys) {
        const order = await env.ORDERS_KV.get(item.name, "json");
        if (order) orders.push(order);
      }

      orders.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      return json(orders);
    }

    if (request.method === "PATCH") {
      const body = await request.json();

      if (!isAdmin(request, env, body)) {
        return json({ error: "Não autorizado." }, 401);
      }

      const id = String(body.id || "");
      if (!id) return json({ error: "ID do pedido ausente." }, 400);

      const order = await env.ORDERS_KV.get(key(id), "json");
      if (!order) return json({ error: "Pedido não encontrado." }, 404);

      if (body.status === "delivered") {
        order.manualStatus = "delivered";
      }

      await env.ORDERS_KV.put(key(id), JSON.stringify(order));
      return json({ ok: true, order });
    }

    return json({ error: "Método não permitido." }, 405);
  } catch (error) {
    console.error(error);
    return json({ error: "Erro interno no serviço de pedidos." }, 500);
  }
          }
