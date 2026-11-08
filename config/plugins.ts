import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      // One long-lived JWT per login (Strapi's default). The SSR frontend is
      // the only client: it keeps this token server-side in its own signed,
      // httpOnly session cookie, so the browser never sees it.
      //
      // Don't use 'refresh' mode here: access tokens then expire after 10
      // minutes and the refresh token is set as a cookie on the SSR server's
      // request, where it's discarded — authors get logged out mid-edit.
      jwtManagement: 'legacy-support',
      jwt: {
        expiresIn: '30d', // matches the frontend's session cookie lifetime
      },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});

export default config;
