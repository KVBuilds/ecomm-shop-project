import { db } from "@/db"
import { notFound } from "next/navigation"
import DesignPreview from "./DesignPreview"

interface PageProps {
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}

const Page = async ({searchParams}: PageProps) => {
    const {id} = searchParams

    if(!id || typeof id != "string") {
        return notFound()
    }
    // Identifies if the ID is valid and exists in the DB
    const configuration = await db.configuration.findUnique({
        where: {id}, 
    })

    if(!configuration) {
        return notFound()
    }

        //Gives preview of what the user is looking for -- clientside component
        return <DesignPreview configuration={configuration} />

}


export default Page