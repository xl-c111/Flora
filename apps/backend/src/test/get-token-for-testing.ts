import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getToken(): Promise<void> {
  console.log("🔐 Getting Supabase Token for Postman Testing...\n");

  // Try to sign in with a test user
  const testEmail = "test@flora-postman.com";
  const testPassword = "PostmanTest123!";

  try {
    console.log("📧 Attempting to sign in with:", testEmail);

    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    // If user doesn't exist, create them first
    if (signInError && signInError.message.includes("Invalid login credentials")) {
      console.log("👤 User not found, creating new user...");

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (signUpError) {
        console.error("❌ Sign up failed:", signUpError.message);
        return;
      }

      if (signUpData.session) {
        signInData = signUpData;
        console.log("✅ User created successfully!");
      } else {
        console.log("⚠️  User created but email confirmation may be required");
        console.log("💡 Try signing in with the credentials in a few seconds...");

        // Wait and try to sign in again
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });

        if (!retryError && retryData.session) {
          signInData = retryData;
        }
      }
    } else if (signInError) {
      console.error("❌ Sign in failed:", signInError.message);
      return;
    }

    if (signInData && signInData.session) {
      console.log("✅ Authentication successful!\n");

      console.log("📋 COPY THIS TOKEN FOR POSTMAN:");
      console.log("─".repeat(50));
      console.log(signInData.session.access_token);
      console.log("─".repeat(50));

      console.log("\n📝 How to use in Postman:");
      console.log("1. Open Postman");
      console.log("2. Go to Headers tab");
      console.log("3. Add a new header:");
      console.log("   Key: Authorization");
      console.log("   Value: Bearer " + signInData.session.access_token);

      console.log("\n🧪 Test URLs:");
      console.log("• http://localhost:3001/api/auth-test/protected");
      console.log("• http://localhost:3001/api/orders/user");
      console.log("• http://localhost:3001/api/payments/methods?customerId=test123");

      console.log("\n👤 User Info:");
      console.log("• User ID:", signInData.user.id);
      console.log("• Email:", signInData.user.email);
      console.log("• Token expires in ~1 hour");
    } else {
      console.log("❌ Could not obtain session token");
    }
  } catch (error) {
    console.error("❌ Error:", (error as Error).message);
  }
}

getToken().then(() => process.exit(0));

// pnpm test:token
