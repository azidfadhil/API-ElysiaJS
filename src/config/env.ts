const requiredEnvVars = [
  "DB_URL",
  "APP_PORT",
  "APP_ENV",
  "APP_NAME",
  "JWT_SECRET"
] as const

type EnvVars = typeof requiredEnvVars[number]

function validateEnv(): Record<EnvVars, string> {
  const missing: string[] = []

  for (const key of requiredEnvVars) {
    if (!Bun.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:")
    missing.forEach(key => console.error(`   - ${key}`))
    process.exit(1)
  }

  return requiredEnvVars.reduce((acc, key) => {
    acc[key] = Bun.env[key] as string
    return acc
  }, {} as Record<EnvVars, string>)
}

export const env = validateEnv()