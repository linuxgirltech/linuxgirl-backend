import { factories } from '@strapi/strapi';

/**
 * Strapi 5 lets any caller with `find` permission request `?status=draft`,
 * which would expose unpublished posts to the public. Anonymous requests are
 * therefore pinned to published content; logged-in authors can see drafts.
 */
export default factories.createCoreController('api::post.post', () => ({
  async find(ctx) {
    if (!ctx.state.user) ctx.query = { ...ctx.query, status: 'published' };
    return super.find(ctx);
  },

  async findOne(ctx) {
    if (!ctx.state.user) ctx.query = { ...ctx.query, status: 'published' };
    return super.findOne(ctx);
  },
}));
