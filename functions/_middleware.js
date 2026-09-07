// Cloudflare Pages global middleware
// Carrega o osiris-fix.js sem alterar o index.html gigante.

export async function onRequest(context) {
  const response = await context.next();

  const url = new URL(context.request.url);

  // Não modifica as rotas da API
  if (url.pathname.startsWith("/api/")) {
    return response;
  }

  const contentType = response.headers.get("content-type") || "";

  // Só modifica páginas HTML
  if (!contentType.toLowerCase().includes("text/html")) {
    return response;
  }

  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(
          '<script src="/osiris-fix.js" defer></script>',
          { html: true }
        );
      },
    })
    .transform(response);
}
