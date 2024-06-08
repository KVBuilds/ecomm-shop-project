"use server"

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products"
import { db } from "@/db"
import { stripe } from "@/lib/stripe"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { Order } from "@prisma/client"

export const createCheckoutSession = async ({configId}: {configId: string}) => {
    const configuration = await db.configuration.findUnique({
        where: {id: configId},

    })
    if(!configuration) {
        throw new Error("No such configuration found.")
    }

    const {getUser} = getKindeServerSession()
    const user = await getUser()

    //User needs to be logged-in to make the purchase
    if(!user) {
        throw new Error("Please login in order to proceed.")
    }

    const {finish, material} = configuration

    //Creating a payment session from server side
    let price = BASE_PRICE
    if(finish === "textured") price += PRODUCT_PRICES.finish.textured
    if(material === "polycarbonate") price +=  PRODUCT_PRICES.material.polycarbonate

    //Keeping track of existing order
    let order: Order | undefined = undefined

    const existingOrder = await db.order.findFirst({
        where: {
            userId: user.id,
            configurationId: configuration.id,
        },
    })

    if(existingOrder) {
        order = existingOrder
    } else {
        order = await db.order.create({
            data: {
                amount: price / 100,
                userId: user.id,
                configurationId: configuration.id,
            },
        })
    }

    //Utilizing the payment session 
    const product = await stripe.products.create({
        name: "Custom iPhone Case",
        images: [configuration.imageUrl],
        default_price_data: {
            currency: "USD",
            unit_amount: price,
        },
    })

    //Payment session activated
    const stripeSession = await stripe.checkout.sessions.create({
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configuration/preview?id=${configuration.id}`,
        payment_method_types: ["card", "paypal"],
        mode: "payment",
        shipping_address_collection: {allowed_countries: ["US"]},
        metadata: {
            userId: user.id,
            orderId: order.id,
        },
        //What the actual products are to Stripe
        line_items: [{price: product.default_price as string, quantity: 1}],
    })
    return {url: stripeSession.url}
}

