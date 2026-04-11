/** @type {import('next').NextConfig} */
const nextConfig = {
  serverComponentsExternalPackages: ['@stellar/stellar-sdk', 'sodium-native'],
}

module.exports = nextConfig
