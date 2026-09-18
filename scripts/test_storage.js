const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testStorage() {
  const buckets = await supabaseAdmin.storage.listBuckets();
  console.log('Buckets:', buckets.data?.map(b => ({ name: b.name, public: b.public })));

  // Test upload a small text file
  const testBuffer = Buffer.from('test storage content');
  const { data, error } = await supabaseAdmin.storage
    .from('report-images')
    .upload('test.txt', testBuffer, { upsert: true, contentType: 'text/plain' });

  if (error) {
    console.error('Upload test error:', error);
  } else {
    console.log('Upload test success:', data);
    const { data: pubUrl } = supabaseAdmin.storage.from('report-images').getPublicUrl('test.txt');
    console.log('Public URL:', pubUrl.publicUrl);
  }
}

testStorage();
