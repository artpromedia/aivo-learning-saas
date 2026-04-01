#!/bin/sh
cd /app
echo "=== ENV ==="
echo "NATS_URL=$NATS_URL"
echo "DATABASE_URL=$DATABASE_URL" | sed 's/:[^@]*@/:***@/'
echo "REDIS_URL=$REDIS_URL" | sed 's/:[^@]*@/:***@/'
echo "=== Testing NATS ==="
timeout 3 node -e "import('nats').then(n=>n.connect({servers:process.env.NATS_URL})).then(()=>console.log('NATS OK')).catch(e=>console.error('NATS FAIL:',e.message))" 2>&1
echo "=== Testing DB ==="
timeout 3 node -e "import('postgres').then(m=>{const sql=m.default(process.env.DATABASE_URL);sql\`SELECT 1\`.then(()=>{console.log('DB OK');sql.end()}).catch(e=>console.error('DB FAIL:',e.message))})" 2>&1
echo "=== Testing Redis ==="
timeout 3 node -e "import('ioredis').then(m=>{const r=new m.default(process.env.REDIS_URL);r.ping().then(()=>{console.log('REDIS OK');r.quit()}).catch(e=>console.error('REDIS FAIL:',e.message))})" 2>&1
echo "=== All done ==="
