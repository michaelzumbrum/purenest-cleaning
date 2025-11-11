export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok:false, error:"Method not allowed" }), { status:405 });
  }
  try {
    const ct = req.headers.get("content-type") || "";
    let data = {};
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      form.forEach((v,k)=> data[k] = typeof v === "string" ? v.trim() : v);
    } else {
      const body = await req.text();
      new URLSearchParams(body).forEach((v,k)=> data[k] = v.trim());
    }
    const row = {
      full_name: data.full_name || "",
      email: data.email || "",
      phone: data.phone || "",
      city: data.city || "",
      service_type: data.service_type || "",
      frequency: data.frequency || "",
      bedrooms: data.bedrooms || "",
      bathrooms: data.bathrooms || "",
      sqft: data.sqft || "",
      notes: data.notes || "",
      consent: ["on","true","1"].includes((data.consent||"").toLowerCase()),
      consent_text: data.consent_text || "",
      consent_version: data.consent_version || "",
      utm_source: data.utm_source || "",
      utm_medium: data.utm_medium || "",
      utm_campaign: data.utm_campaign || "",
      utm_term: data.utm_term || "",
      utm_content: data.utm_content || "",
      do_not_sell: ["on","true","1"].includes((data.do_not_sell||"").toLowerCase()),
      deletion_requested: false
    };
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !key) {
      return new Response(JSON.stringify({ ok:false, error:"Missing env vars" }), { status:500 });
    }
    const resp = await fetch(`${url}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "Prefer":"return=representation",
        "apikey": key,
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify(row)
    });
    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ ok:false, error:text }), { status:500 });
    }
    const saved = await resp.json();
    return new Response(JSON.stringify({ ok:true, lead: saved?.[0] || null }), { status:200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error:String(e) }), { status:500 });
  }
};
