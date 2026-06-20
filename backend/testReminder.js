// testReminder.js - Save this file in your backend root directory
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sendCartReminder } from './utils/sendSMS.js';
import cartModel from './models/cartModel.js';

// ES module में __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const testReminder = async () => {
  try {
    console.log('🚀 Starting reminder test...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    console.log('SMS API Key:', process.env.SMSALERT_API_KEY ? 'Found' : 'Not found');
    console.log('Frontend URL:', process.env.FRONTEND_URL);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Find a test cart
    const cart = await cartModel.findOne({ 
      phoneNumber: { $exists: true, $ne: null },
      email: { $exists: true, $ne: null },
      items: { $exists: true, $not: { $size: 0 } }
    }).sort({ createdAt: -1 }).limit(1);
    
    if (!cart) {
      console.log('❌ No test cart found');
      
      // Try to find any cart with at least phone or email
      const anyCart = await cartModel.findOne({
        $or: [
          { phoneNumber: { $exists: true, $ne: null } },
          { email: { $exists: true, $ne: null } }
        ],
        items: { $exists: true, $not: { $size: 0 } }
      }).sort({ createdAt: -1 }).limit(1);
      
      if (anyCart) {
        console.log('📦 Found cart with limited info:');
        console.log('   Cart ID:', anyCart._id);
        console.log('   Phone:', anyCart.phoneNumber || 'Not available');
        console.log('   Email:', anyCart.email || 'Not available');
        console.log('   Items:', anyCart.items.length);
        
        // Ask if we should proceed
        console.log('\n⚠️  Proceed with this cart? (y/n)');
        // Note: In real terminal, you'd need readline module
        // For now, let's just proceed
        console.log('Proceeding with test...');
        const result = await sendCartReminder(anyCart);
        console.log('📊 Test reminder result:', result ? '✅ Success' : '❌ Failed');
      } else {
        console.log('❌ No suitable cart found at all');
        console.log('\n💡 Create a test cart first by:');
        console.log('1. Add items to cart on frontend');
        console.log('2. Wait for auto-save or call API manually');
        console.log('3. Make sure user has phone/email');
      }
      return;
    }
    
    console.log('✅ Found test cart:');
    console.log('   Cart ID:', cart._id);
    console.log('   Phone:', cart.phoneNumber);
    console.log('   Email:', cart.email);
    console.log('   Items:', cart.items.length);
    console.log('   Reminders sent:', cart.remindersSent);
    console.log('   First reminder sent:', cart.firstReminderSent);
    
    console.log('\n📤 Sending test reminder...');
    
    // Send test reminder
    const result = await sendCartReminder(cart);
    
    console.log('\n📊 Test reminder result:', result ? '✅ Success' : '❌ Failed');
    
    // Fetch updated cart
    const updatedCart = await cartModel.findById(cart._id);
    console.log('\n📝 Cart after reminder:');
    console.log('   Reminders sent:', updatedCart.remindersSent);
    console.log('   First reminder sent:', updatedCart.firstReminderSent);
    console.log('   Last reminder sent:', updatedCart.lastReminderSent);
    console.log('   Restore token:', updatedCart.restoreToken ? 'Generated' : 'Not generated');
    
  } catch (error) {
    console.error('❌ Test error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('🏁 Test completed');
  }
};

// Run the test
testReminder();