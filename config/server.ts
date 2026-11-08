import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Public URL of this Strapi (admin links, emails). On Render it falls back
  // to the automatic RENDER_EXTERNAL_URL (https://<service>.onrender.com).
  url: env('PUBLIC_URL', env('RENDER_EXTERNAL_URL', '')) || undefined,
  // Behind a TLS-terminating proxy (Render), trust X-Forwarded-* headers so
  // Strapi knows requests are HTTPS and can set secure admin cookies.
  proxy: { koa: env.bool('IS_PROXIED', false) },
  app: {
    keys: env.array('APP_KEYS')!,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

export default config;
