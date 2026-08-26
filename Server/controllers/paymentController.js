import razorpay from "../services/razorpay.js";
import Payment from "../models/payment.js";
import User from "../models/user.js";
import crypto from "crypto";

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;

    if (!amount || !credits) {
      return res.status(400).json({ message: "Invalid plan data" });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.userId,
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    res.json(order);
  } catch (error) {
    return res.status(500).json({
      message: `failed to create Razorpay order ${error}`,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const secretKey = process.env.RAZORPAY_KEY_SECRET || process.env.RORAZERPAY_SECERT_KEY;
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "paid") {
      return res.json({ message: "Already processed" });
    }

    // Update payment record
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;

    await payment.save();

    // Add credits to user
    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      {
        $inc: { credits: payment.credits },
      },
      { new: true },
    );

    res.json({
      success: true,
      message: "Payment verified and credits added",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to verify Razorpay order ${error}`,
    });
  }
};