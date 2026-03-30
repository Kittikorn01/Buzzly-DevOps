import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from mock-api/.env
const envPath = path.resolve(process.cwd(), 'mock-api', '.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in mock-api/.env');
  process.exit(1);
}

// Create Supabase Admin Client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DEFAULT_USERS = [
  {
    id: '15b96bdd-41dd-4d38-83a4-a6577b57eec3',
    email: 'hachikonoluna@gmail.com',
    password: 'owner123',
    role: 'owner',
    display_name: 'Owner Account'
  },
  {
    id: 'd0000000-0000-0000-0000-000000000000',
    email: 'dev@buzzly.co',
    password: 'dev123',
    role: 'dev',
    display_name: 'Dev User'
  },
  {
    id: 'e0000000-0000-0000-0000-000000000000',
    email: 'support@buzzly.co',
    password: 'support123',
    role: 'support',
    display_name: 'Support User'
  }
];

async function seedCloudUsers() {
  console.log('🚀 Starting Cloud Seeding (Project: %s)', supabaseUrl);

  for (const user of DEFAULT_USERS) {
    console.log(`\n→ Processing user: ${user.email} (${user.role})...`);

    // 1. Create/Update User in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        display_name: user.display_name,
        is_employee_signup: true
      }
    });

    if (authError) {
      // Regardless of the error (already exists or other), we proceed to role assignment
      console.warn(`  ⚠ Auth note for ${user.email}:`, authError.message);
    } else {
      console.log(`  ✓ User created in auth (ID: ${authData.user.id}).`);
    }

    // 2. Assign Role in public.employees
    // Get Role ID
    const { data: roleData, error: roleError } = await supabase
      .from('role_employees')
      .select('id')
      .eq('role_name', user.role)
      .single();

    if (roleError || !roleData) {
      console.error(`  ❌ Role '${user.role}' not found in role_employees table!`);
      continue;
    }

    const { error: empError } = await supabase.from('employees').upsert({
      user_id: user.id,
      email: user.email,
      status: 'active',
      approval_status: 'approved',
      role_employees_id: roleData.id,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (empError) {
      console.error(`  ❌ Error updating employee record:`, empError.message);
    } else {
      console.log(`  ✓ Assigned role: ${user.role} to ${user.email}.`);
    }

    // 3. Special setup for owner: Create Workspace
    if (user.role === 'owner') {
      const { data: bizType } = await supabase.from('business_types').select('id').limit(1).single();
      
      const workspaceId = '00000000-0000-0000-0000-000000000001';
      const { error: wsError } = await supabase.from('workspaces').upsert({
        id: workspaceId,
        name: 'My Awesome Business',
        owner_id: user.id,
        status: 'active',
        business_type_id: bizType?.id
      }, { onConflict: 'id' });

      if (wsError) {
        console.error(`  ❌ Error creating workspace:`, wsError.message);
      } else {
        console.log(`  ✓ Workspace created successfully.`);
        
        // Ensure owner is a workspace member
        await supabase.from('workspace_members').upsert({
          team_id: workspaceId,
          user_id: user.id,
          role: 'owner',
          status: 'active'
        }, { onConflict: 'team_id,user_id' });
      }
    }
  }

  console.log('\n✅✅ SEEDING COMPLETE! You can now login on Supabase Cloud. ✅✅');
}

seedCloudUsers().catch(err => {
  console.error('Fatal Error during seeding:', err);
  process.exit(1);
});
