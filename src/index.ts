import type { Core } from '@strapi/strapi';

const READ = ['api::post.post.find', 'api::post.post.findOne'];
const WRITE = ['api::post.post.create', 'api::post.post.update', 'api::post.post.delete'];

/**
 * Visitors (public role) can read posts; logged-in users (authenticated role)
 * can also write them. Idempotent — only adds missing permissions.
 */
async function grant(strapi: Core.Strapi, roleType: string, actions: string[]) {
  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: roleType } });
  if (!role) return;

  for (const action of actions) {
    const exists = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: role.id } });
    if (!exists) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: role.id } });
    }
  }
}

/**
 * Anyone who can log in can publish, so self-sign-up must stay off.
 * Authors are created by hand in the admin panel (Content Manager → User).
 */
async function disablePublicRegistration(strapi: Core.Strapi) {
  const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
  const advanced = ((await store.get({ key: 'advanced' })) ?? {}) as Record<string, unknown>;
  if (advanced.allow_register !== false) {
    await store.set({ key: 'advanced', value: { ...advanced, allow_register: false } });
  }
}

/** Create a single welcome post the very first time the app boots. */
async function seedOnce(strapi: Core.Strapi) {
  const store = strapi.store({ type: 'plugin', name: 'linuxgirl-seed' });
  if (await store.get({ key: 'done' })) return;

  await strapi.documents('api::post.post').create({
    data: {
      title: 'Hello, world',
      slug: 'hello-world',
      date: new Date().toISOString().slice(0, 10),
      excerpt: 'First boot. Everything is green.',
      content: [
        'Welcome to the blog. This post was seeded by Strapi on first boot —',
        'edit or delete it from the admin panel.',
        '',
        '## What to expect',
        '',
        '- Linux tinkering',
        '- dotfiles and tooling',
        '- the occasional rant',
        '',
        '```sh',
        '$ echo "hello, world"',
        'hello, world',
        '```',
      ].join('\n'),
    },
    status: 'published',
  });

  await store.set({ key: 'done', value: true });
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await disablePublicRegistration(strapi);
    await grant(strapi, 'public', READ);
    await grant(strapi, 'authenticated', [...READ, ...WRITE]);
    await seedOnce(strapi);
  },
};
