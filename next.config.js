require('dotenv').config({path: './.env'})
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SAFEADDRESS: process.env.SAFEADDRESS,
    SIGNER: process.env.SIGNER,
    PRIVATEKEY: process.env.PRIVATEKEY
  }
}

module.exports = nextConfig
