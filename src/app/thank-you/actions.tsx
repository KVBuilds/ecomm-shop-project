"use server"

import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export const getPaymentStatus = async ({orderId}: {orderId: string}) => {
    const {getUser} = getKindeServerSession()
    const user = await getUser()

    if(!user?.id || !user.email) {
        throw new Error ("You need to login in order to view this page.")
    }

    //query database to get order
    const order = await db.order.findFirst({
        where: {id: orderId, userId: user.id},
        include: {
            billingAddress: true,
            configuration: true,
            shippingAddress: true, 
            user: true,
        },
    })
    if(!order) throw new Error ("This order does not exists.")
        if (order.isPaid){
            return order
        } else {
            return false
        }
    }



