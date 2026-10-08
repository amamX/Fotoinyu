import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.11.0"
import { z } from "https://esm.sh/zod@3.21.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const bookingSchema = z.object({
  customerName: z.string().min(2),
  waNumber: z.string().min(10),
  eventType: z.string(),
  eventName: z.string().optional(),
  packageId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  venue: z.string().min(3),
  notes: z.string().optional(),
  turnstileToken: z.string().optional()
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse payload
    const body = await req.json()
    const parsedData = bookingSchema.parse(body)

    // TODO: Verify turnstileToken here
    // TODO: IP Rate Limiting logic here

    // Call RPC
    const { data, error } = await supabaseClient.rpc('create_booking', {
      p_customer_name: parsedData.customerName,
      p_wa_number: parsedData.waNumber,
      p_event_type: parsedData.eventType,
      p_event_name: parsedData.eventName,
      p_package_id: parsedData.packageId,
      p_start_at: parsedData.startAt,
      p_end_at: parsedData.endAt,
      p_venue: parsedData.venue,
      p_notes: parsedData.notes
    })

    if (error) throw error

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
