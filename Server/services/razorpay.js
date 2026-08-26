import 'dotenv/config'
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykey",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret",
});

export default razorpay;