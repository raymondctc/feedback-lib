import { Hono } from 'hono';

const app = new Hono();

// CORS headers for development
app.use('*', async (c, next) => {
  await next();
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');
});

app.options('*', (c) => new Response(null, { status: 204 }));

app.post('/api/v1/feedback', async (c) => {
  const formData = await c.req.formData();

  const metadata = formData.get('metadata');
  const screenshot = formData.get('screenshot');
  const domSnapshot = formData.get('dom-snapshot');

  if (!metadata) {
    return c.json({ error: 'metadata is required' }, 400);
  }

  const id = crypto.randomUUID();

  console.log('[MockWorker] Feedback received:', {
    id,
    metadata: JSON.parse(metadata as string),
    screenshotSize: screenshot instanceof Blob ? screenshot.size : 0,
    domSnapshotSize: domSnapshot instanceof Blob ? domSnapshot.size : 0,
  });

  return c.json({ id, status: 'created' }, 201);
});

app.get('/api/v1/feedback', async (c) => {
  return c.json({ items: [], cursor: null });
});

export default app;