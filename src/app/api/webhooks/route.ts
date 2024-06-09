import { db } from "@/db"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
    try {
            const body = await req.text()
            const signature = headers().get("stripe-signature")

            if(!signature) {
                return new Response ("Invalid signature", {status: 400})
            }

            //Verify Stripe send
            const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
            if(event.type === "checkout.session.completed"){
                if(!event.data.object.customer_details?.email) {
                    throw new Error ("Missing user email")
                }
                //Gets payment session -- user metadata, etc
                const session = event.data.object as Stripe.Checkout.Session

                const {userId, orderId} = session.metadata || {
                    userId: null,
                    orderId: null,
                }
                if(!userId || !orderId) {
                    throw new Error("Invalid reuqest metadata")
                }
                const billingAddress = session.customer_details!.address
                const shippingAddress = session.customer_details!.address

                await db.order.update({
                    where: {
                        id: orderId,
                    },
                    data: {
                        isPaid: true,
                        shippingAddress: {
                            create: {
                                name: session.customer_details!.name!,
                                city: shippingAddress!.city!,
                                country: shippingAddress!.country!,
                                postalCode: shippingAddress!.postal_code!,
                                street: shippingAddress!.line1!,
                                state: shippingAddress!.state,
                            },
                        },
                        billingAddress: {
                            create: {
                                name: session.customer_details!.name!,
                                city: billingAddress!.city!,
                                country: billingAddress!.country!,
                                postalCode: billingAddress!.postal_code!,
                                street: billingAddress!.line1!,
                                state: billingAddress!.state,
                            },
                        },
                    },
                })
            }

                return NextResponse.json({result: event, ok: true})
    } catch (err) {
            console.error(err)
            return new Response(JSON.stringify({ message: "Something went wrong", ok: false }), {
                status: 500,
                headers: {
                  "Content-Type": "application/json",
                },
    })
}}