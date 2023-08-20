import Strapi from 'strapi';

await (Strapi({}) as any).load();

export function destroy() {
  (strapi as any).destroy();
}
