// lib/api.ts

const SUPABASE_URL = process.env.SUPABASE_URL

if (!SUPABASE_URL) {
  throw new Error('Supabase environment variables are missing')
}

type Options = {
  token?: string // Optional: Supabase user token
  headers?: Record<string, string>
}

export async function post<T = any>(
  functionName: string,
  body: any,
  options: Options = {}
): Promise<T> {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.token}`,
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
  })

  console.log('res from post request to ', url, res)

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'POST request failed')
  }

  return res.json()
}

export async function get<T = any>(
  functionName: string,
  options: Options = {}
): Promise<T> {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${options.token}`,
      ...(options.headers || {}),
    },
  })

  console.log('res from get request to ', url, res)

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'GET request failed')
  }

  return res.json()
}
