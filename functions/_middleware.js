// Cloudflare Pages Middleware
// Mantém as páginas e arquivos do site intactos.
// O antigo osiris-fix.js NÃO deve mais ser injetado.

export async function onRequest(context) {
  return context.next();
}
