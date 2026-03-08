export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://aiprzewodnik.pl',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Use POST' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { query } = await request.json();

      if (!query || typeof query !== 'string' || query.length > 500) {
        return new Response(JSON.stringify({ error: 'Podaj pytanie (max 500 znaków)' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // --- RATE LIMIT (5 req/min per IP) ---
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitKey = `rl:${ip}`;
      const now = Math.floor(Date.now() / 1000);
      const rlData = await env.CHATBOT_CACHE.get(rateLimitKey, { type: 'json' });

      if (rlData) {
        // Clean old entries (older than 60s)
        const recent = rlData.filter(ts => now - ts < 60);
        if (recent.length >= 5) {
          return new Response(JSON.stringify({
            error: 'Zbyt wiele zapytań. Spróbuj za chwilę.',
            intro: 'Zbyt wiele zapytań. Spróbuj ponownie za minutę.',
            courses: [], events: [], products: [], roles: []
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        recent.push(now);
        await env.CHATBOT_CACHE.put(rateLimitKey, JSON.stringify(recent), { expirationTtl: 120 });
      } else {
        await env.CHATBOT_CACHE.put(rateLimitKey, JSON.stringify([now]), { expirationTtl: 120 });
      }

      // --- CACHE: normalize query ---
      const normalizedQuery = normalizeQuery(query);
      const cacheKey = `q:${normalizedQuery}`;

      // Check cache
      const cached = await env.CHATBOT_CACHE.get(cacheKey, { type: 'json' });
      if (cached) {
        cached._cached = true;
        return new Response(JSON.stringify(cached), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // --- FETCH DATA ---
      const baseUrl = 'https://aiprzewodnik.pl/data';
      const [courses, events, products, roles] = await Promise.all([
        fetchJSON(`${baseUrl}/courses.json`),
        fetchJSON(`${baseUrl}/events.json`),
        fetchJSON(`${baseUrl}/products.json`),
        fetchJSON(`${baseUrl}/roles.json`),
      ]);

      const compactCourses = courses.map(c => `- ${c.name} [${c.cat}]: ${c.desc}`).join('\n');
      const compactEvents = events.map(e => `- ${e.name} — ${e.city}, ${e.date} (${e.type}${e.free ? ', bezpłatne' : ''})`).join('\n');
      const compactProducts = products.map(p => `- ${p.name}: ${p.desc} [${p.tag}]`).join('\n');
      const compactRoles = roles.map(r => `- ${r.name}: ${r.desc} Zarobki: ${r.salary}`).join('\n');

      const systemPrompt = `You are an assistant for aiprzewodnik.pl. Respond ONLY with a valid JSON object. NO text before or after the JSON. Use ONLY items from the lists below. NEVER invent items.

COURSES:
${compactCourses}

EVENTS:
${compactEvents}

PRODUCTS:
${compactProducts}

ROLES:
${compactRoles}

EXAMPLE — user asks "chcę nauczyć się programowania z AI":
{"intro":"Świetny plan! Oto co dla Ciebie znalazłem.","courses":[{"name":"AI_devs 4","why":"Kurs produkcyjnego LLM z RAG i agentami"},{"name":"Kurs Python Developer – Coders Lab","why":"Bootcamp Python z modułem AI"}],"events":[{"name":"DevAI by Data Science Summit","why":"Konferencja dla developerów AI"}],"products":[],"roles":[{"name":"AI Engineer","salary":"19 500 – 55 000 PLN B2B","why":"Stanowisko, do którego przygotują Cię te kursy"}]}

RULES:
- Respond in Polish
- Return ONLY JSON, nothing else
- Max 3 courses, 2 events, 2 products, max 3 roles
- Use EXACT names from lists
- ALWAYS try to return something from EVERY category. If user asks about courses, also suggest a matching role. If user asks about jobs/roles, also suggest courses that prepare for that role. Cross-reference categories.
- Empty array [] ONLY if absolutely nothing fits
- "why" = 1 short sentence in Polish`;

      const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 500,
        temperature: 0.2,
      });

      // Handle response
      let parsed;
      if (typeof aiResponse.response === 'object' && aiResponse.response !== null) {
        parsed = aiResponse.response;
      } else {
        try {
          let text = String(aiResponse.response).trim();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        } catch (e) {
          parsed = { intro: 'Spróbuj inaczej sformułować pytanie.', courses: [], events: [], products: [], roles: [] };
        }
      }

      // Flatten if model nested everything under "intro"
      if (parsed.intro && typeof parsed.intro === 'object' && Array.isArray(parsed.intro.courses)) {
        const nested = parsed.intro;
        parsed = {
          intro: nested.intro || '',
          courses: nested.courses || [],
          events: nested.events || [],
          products: nested.products || [],
          roles: nested.roles || [],
        };
      }

      // Backward compat: model may still return "role" (singular) — normalize to "roles" array
      if (parsed.role && !parsed.roles) {
        parsed.roles = Array.isArray(parsed.role) ? parsed.role : [parsed.role];
      }
      delete parsed.role;

      // Ensure arrays exist
      if (!Array.isArray(parsed.courses)) parsed.courses = [];
      if (!Array.isArray(parsed.events)) parsed.events = [];
      if (!Array.isArray(parsed.products)) parsed.products = [];
      if (!Array.isArray(parsed.roles)) parsed.roles = [];

      // Enrich with URLs from full data
      if (parsed.courses.length) {
        parsed.courses = parsed.courses.map(c => {
          const found = courses.find(fc => fc.name === c.name || fc.name.startsWith(c.name) || c.name.startsWith(fc.name));
          return { ...c, url: found ? found.url : null };
        });
      }
      if (parsed.events.length) {
        parsed.events = parsed.events.map(e => {
          const found = events.find(fe => fe.name === e.name || fe.name.startsWith(e.name) || e.name.startsWith(fe.name));
          return { ...e, url: found ? found.url : null };
        });
      }
      if (parsed.products.length) {
        parsed.products = parsed.products.map(p => {
          const found = products.find(fp => fp.name === p.name || fp.name.startsWith(p.name) || p.name.startsWith(fp.name));
          return { ...p, url: found ? found.url : null };
        });
      }

      // --- SAVE TO CACHE (7 days) ---
      await env.CHATBOT_CACHE.put(cacheKey, JSON.stringify(parsed), { expirationTtl: 604800 });

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: 'Przepraszam, coś poszło nie tak. Spróbuj ponownie za chwilę.',
        intro: 'Przepraszam, coś poszło nie tak. Spróbuj ponownie za chwilę.',
        courses: [], events: [], products: [], roles: []
      }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': 'https://aiprzewodnik.pl',
          'Content-Type': 'application/json'
        }
      });
    }
  }
};

/**
 * Normalize query for cache key:
 * - lowercase
 * - remove diacritics (ą→a, ć→c, etc.)
 * - remove extra whitespace
 * - remove punctuation
 * - sort words alphabetically (so "kurs AI" == "AI kurs")
 */
function normalizeQuery(q) {
  return q
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // remove diacritics
    .replace(/\u0142/g, 'l')  // ł → l (not covered by NFD)
    .replace(/[^a-z0-9\s]/g, '')  // remove punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .sort()
    .join(' ');
}

async function fetchJSON(url) {
  const res = await fetch(url, { cf: { cacheTtl: 3600 } });
  return res.json();
}
