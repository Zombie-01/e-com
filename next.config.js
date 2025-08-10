const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,

    QPAY_USERNAME: process.env.QPAY_USERNAME,
    QPAY_PASSWORD: process.env.QPAY_PASSWORD,
    QPAY_INVOICE_CODE: process.env.QPAY_INVOICE_CODE,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

    SENDER_EMAIL: process.env.SENDER_EMAIL,

    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,

    CLIENT_REDIRECT_URL: process.env.CLIENT_REDIRECT_URL,

    ELASTICMAIL_API_KEY: process.env.ELASTICMAIL_API_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ["images.pexels.com"],
  },
};

module.exports = withNextIntl(nextConfig);
