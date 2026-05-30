import axios from "axios"

const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_URL || "http://localhost:5678"
const N8N_API_KEY = process.env.N8N_API_KEY || ""

export const n8nClient = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    "X-N8N-API-KEY": N8N_API_KEY,
  },
})

export async function sendWebhookEvent(path: string, data: any) {
  try {
    const response = await axios.post(`${N8N_BASE_URL}/webhook${path}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    return { success: true, data: response.data }
  } catch (error: any) {
    console.error(`Webhook error: ${path}`, error.message)
    return { success: false, error: error.message }
  }
}
