import { createClient } from '@supabase/supabase-js';

function parseArgs(argv) {
  const parsed = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith('--')) {
      continue;
    }

    const key = arg.slice(2);
    const next = argv[i + 1];

    if (!next || next.startsWith('--')) {
      parsed[key] = 'true';
      continue;
    }

    parsed[key] = next;
    i += 1;
  }

  return parsed;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  fail('Missing VITE_SUPABASE_URL.');
}

if (!serviceRoleKey) {
  fail('Missing SUPABASE_SERVICE_ROLE_KEY.');
}

const email = args.email;
const password = args.password;
const role = args.role ?? 'waiter';
const fullName = args.name ?? email;
const allowedRoles = new Set(['admin', 'waiter', 'kitchen', 'cashier']);

if (!email) {
  fail('Missing --email argument.');
}

if (!password) {
  fail('Missing --password argument.');
}

if (!allowedRoles.has(role)) {
  fail(`Invalid --role value "${role}". Allowed: ${Array.from(allowedRoles).join(', ')}`);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(targetEmail) {
  let page = 1;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find((entry) => entry.email?.toLowerCase() === targetEmail.toLowerCase());
    if (user) {
      return user;
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function ensureUser() {
  const existing = await findUserByEmail(email);

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata ?? {}),
        full_name: fullName,
        role,
      },
    });

    if (error) {
      throw error;
    }

    return { user: data.user, created: false };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
    },
  });

  if (error) {
    throw error;
  }

  return { user: data.user, created: true };
}

async function ensureProfile(user) {
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: fullName,
    role,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

try {
  const { user, created } = await ensureUser();
  await ensureProfile(user);

  console.log(JSON.stringify({
    ok: true,
    action: created ? 'created' : 'updated',
    id: user.id,
    email: user.email,
    role,
  }, null, 2));
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
