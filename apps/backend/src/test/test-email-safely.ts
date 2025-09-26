import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { EmailService } from "../services/EmailService";

interface TestCredentials {
  email: string;
  password: string;
}

// Safe email testing with backup/restore using your existing EmailService
class SafeEmailTester {
  private envPath: string;
  private backupPath: string;

  constructor() {
    this.envPath = path.join(__dirname, "../../../../.env");
    this.backupPath = path.join(__dirname, "../../../../.env.backup");
  }

  // Backup current .env
  backupEnv(): boolean {
    console.log("📥 Backing up current .env file...");
    try {
      fs.copyFileSync(this.envPath, this.backupPath);
      console.log("✅ Backup created at .env.backup\n");
      return true;
    } catch (error) {
      console.log("❌ Failed to backup .env:", (error as Error).message);
      return false;
    }
  }

  // Restore original .env
  restoreEnv(): boolean {
    console.log("♻️  Restoring original .env file...");
    try {
      fs.copyFileSync(this.backupPath, this.envPath);
      fs.unlinkSync(this.backupPath); // Remove backup
      console.log("✅ Original .env restored\n");
      return true;
    } catch (error) {
      console.log("❌ Failed to restore .env:", (error as Error).message);
      return false;
    }
  }

  // Update .env with test credentials
  updateEnvForTesting(testCredentials: TestCredentials): boolean {
    console.log("🔧 Updating .env with test credentials...");
    try {
      let envContent = fs.readFileSync(this.envPath, "utf8");

      // Replace placeholder values
      envContent = envContent.replace(/SMTP_USER=your_email@gmail\.com/, `SMTP_USER=${testCredentials.email}`);
      envContent = envContent.replace(/SMTP_PASS=your_app_password/, `SMTP_PASS=${testCredentials.password}`);

      fs.writeFileSync(this.envPath, envContent);
      console.log("✅ Test credentials updated\n");
      return true;
    } catch (error) {
      console.log("❌ Failed to update .env:", (error as Error).message);
      return false;
    }
  }

  // Test email using your existing EmailService
  async testEmail(toEmail: string): Promise<boolean> {
    // Reload environment variables
    delete require.cache[require.resolve("dotenv")];
    dotenv.config();

    console.log("🧪 Testing email using your EmailService...\n");

    // Show config (safely)
    console.log("📧 Email Configuration:");
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
    console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
    console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
    console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? "[CONFIGURED]" : "[NOT SET]"}\n`);

    try {
      // Create your EmailService instance
      const emailService = new EmailService();

      // Create mock order data for testing
      const testOrder = {
        id: "test-order-id",
        orderNumber: `DEMO${Date.now()}`,
        totalCents: 2999, // $29.99
        guestEmail: toEmail,
        shippingFirstName: "Test",
        shippingLastName: "Customer",
        shippingStreet1: "123 Demo Street",
        shippingStreet2: null,
        shippingCity: "Demo City",
        shippingState: "DC",
        shippingZipCode: "12345",
        requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        deliveryNotes: "Demo order for email testing",
        createdAt: new Date(),
        user: null,
      };

      console.log(`📬 Sending test order confirmation to: ${toEmail}`);
      console.log(`Order: #${testOrder.orderNumber} - $${(testOrder.totalCents / 100).toFixed(2)}\n`);

      // Use your existing EmailService to send the confirmation
      await emailService.sendOrderConfirmation(testOrder);

      console.log("✅ Test email sent successfully using your EmailService!\n");
      return true;
    } catch (error) {
      console.log("❌ Email test failed:");
      console.log((error as Error).message);

      if ((error as Error).message.includes("Invalid login")) {
        console.log("\n💡 Gmail users: Make sure you're using an App Password, not your regular password!");
      }
      return false;
    }
  }

  // Run complete test cycle
  async runSafeTest(testCredentials: TestCredentials, toEmail: string): Promise<void> {
    console.log("🌸 Flora Safe Email Test (Using Your EmailService)\n");
    console.log("This will test your existing EmailService, then restore everything back.\n");

    // Step 1: Backup
    if (!this.backupEnv()) {
      console.log("❌ Cannot proceed without backup. Aborting.");
      return;
    }

    let testPassed = false;

    try {
      // Step 2: Update credentials
      if (this.updateEnvForTesting(testCredentials)) {
        // Step 3: Test email
        testPassed = await this.testEmail(toEmail);
      }
    } catch (error) {
      console.log("❌ Test error:", (error as Error).message);
    } finally {
      // Step 4: Always restore original
      this.restoreEnv();
    }

    // Summary
    console.log("📊 Test Summary:");
    console.log(`Email Test: ${testPassed ? "✅ PASSED" : "❌ FAILED"}`);
    console.log("Environment: ✅ RESTORED TO ORIGINAL\n");

    if (testPassed) {
      console.log("🎉 Your EmailService is ready for the demo!");
      console.log("Users will receive order confirmation emails after payments.");
    } else {
      console.log("❌ EmailService needs fixing before demo.");
      console.log("Check your Gmail App Password setup.");
    }
  }
}

// Usage instructions
function showUsage(): void {
  console.log("🌸 Flora Safe Email Tester (Using Your EmailService)\n");
  console.log("This script will:");
  console.log("1. Backup your current .env");
  console.log("2. Test your existing EmailService with your credentials");
  console.log("3. Restore your original .env automatically\n");

  console.log("❌ ERROR: Missing credentials!\n");
  console.log("Usage:");
  console.log("npm run test:email your-email@gmail.com your-app-password recipient@test.com\n");

  console.log("Example:");
  console.log("npm run test:email john@gmail.com abcd1234efgh recipient@example.com\n");

  console.log("💡 For Gmail:");
  console.log("1. Enable 2-Factor Authentication");
  console.log("2. Generate App Password (not regular password)");
  console.log("3. Use that App Password in the command above");
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    showUsage();
    process.exit(1);
  }

  const [testEmail, testPassword, recipientEmail] = args;

  const tester = new SafeEmailTester();

  await tester.runSafeTest(
    {
      email: testEmail,
      password: testPassword,
    },
    recipientEmail
  );
}

main().catch(console.error);