import type { NextConfig } from 'next';
const config: NextConfig = { outputFileTracingExcludes: { '*': ['./.data/**/*'] } };
export default config;
