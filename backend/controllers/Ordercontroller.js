const CartModel = require("../models/CartModel")
const OrderModel = require("../models/OrderModel")
const { sendSuccess, sendServerError, sendNotFound } = require("../utils/response")
const Razorpay = require('razorpay');
const crypto = require("crypto");

const instance = new Razorpay({
  key_id: process.env.Test_Key_ID,
  key_secret: process.env.Test_Key_Secret
})

// order create
const orderCreate = async (req,res) => {

    try {
        const userId = req.user._id
        const { paymentMethod, address } = req.body
        const userCart = await CartModel.findOne({userId}).populate({
            path: "items.productId",
            select: "_id final_price"
        })

        if (!userCart || userCart.items.length === 0) {
            return res.status(400).json({
              success: false,
              message: "Cart is empty"
            });
          }
      
        const productDetails = userCart.items.map((item)=>{
            const { _id, final_price } = item.productId
            return{
                product_id: _id,
                qty: item.qty,
                price: final_price,
                total: (final_price * item.qty)
            }
        })
        const total_Amount = productDetails.reduce((sum, item) => sum + item.total, sum = 0);
        
        const order = await OrderModel.create({
            user: userId,
            items: productDetails,
            shippingAddress: address,
            paymentMethod,
            totalAmount: total_Amount,
            paymentStatus: "pending"
        })

        if (paymentMethod === "cod") {
            //COD
           return sendSuccess(res,"Order created successfully",{ orderId: order._id})
        }else if(paymentMethod === "online"){
            let options = {
                amount: total_Amount * 100,
                currency: "INR",
                receipt:order._id
              };
              instance.orders.create(options, function (err, orderRazorpay) {
                if(err){
                    console.log(err)
                 return sendServerError(res,"Something went wrong")

                }
                order.razorpay_order_id = orderRazorpay.id
                 order.save()
                sendSuccess(res,"Payment successfully",{ orderId: order._id,
                    payment_order_Id: orderRazorpay.id})
              });
        }
    } catch (error) {
        console.log(error)
    }
}

// payment verify
const paymentVerify = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;


        const order = await OrderModel.findOne({ razorpay_order_id: razorpay_order_id })

        // STEP 1: Create expected signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.Test_Key_Secret)
            .update(body.toString())
            .digest("hex");

        // STEP 2: Compare signatures
        if (expectedSignature === razorpay_signature) {

            // Payment Verified
            // Yaha DB me order update karo (paid = true)
            order.razorpay_payment_id = razorpay_payment_id;
            order.paymentStatus = "paid";
            await order.save();


            return res.status(200).json({
                success: true,
                message: "Payment Verified Successfully",
                orderId:  order._id

            });


        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Signature",
            });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// getAllOrders
const getAllOrders = async(req,res) => {
    try {
        const orders = await OrderModel.find()
        .populate("user", "name email") // user details
        .populate("items.product_id", "_id name price thumbnail")
        .sort({ createdAt: -1 });
        
        return sendSuccess(res,"Orders fetched successfully",{orders,imageBaseUrl: "http//localhost:5000/public/product/"})
    } catch (error) {
        console.log(error)
        sendServerError(res,)
    }
}

// get singleOrder
const getSingleOrder = async(req,res) => {
    try {
        const {id} = req.params
        const order = await OrderModel.findById(id)
        .populate("user", "name email") // user details
        .populate("items.product_id", "_id name price thumbnail")
        
        if(!order){
            return sendNotFound(res,"order not found")
        }
        
        
        return sendSuccess(res,"Orders fetched successfully",{order,imageBaseUrl: "http://localhost:5000/public/product/"})
    } catch (error) {
        console.log(error)
        sendServerError(res,)
    }
}


module.exports = {orderCreate,paymentVerify,getAllOrders,getSingleOrder}