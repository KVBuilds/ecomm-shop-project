"use client"

import { CaseColor } from "@prisma/client"
import { useEffect, useRef, useState } from "react"
import { AspectRatio } from "./ui/aspect-ratio"
import { cn } from "@/lib/utils"

const PhonePreview = ({croppedImageUrl, color}: {
    croppedImageUrl: string
    color: CaseColor
}) => {
    const ref = useRef<HTMLDivElement>(null)

    //Defines the state
    const [RenderedDimensions, setRenderedDimensions] = useState({
        height: 0, 
        width: 0,
    })

    const handleResize = () => {
        if(!ref.current) return
        const {width, height} = ref.current.getBoundingClientRect()
        setRenderedDimensions({width, height})
    }

    useEffect(() => {
        handleResize()

        window.addEventListener("resize", handleResize)

        return () => window.removeEventListener("resize", handleResize)
    }, [ref.current])

    let caseBackgroundColor = "bg-zinc-950"
    if(color === "blue") caseBackgroundColor = "bg-blue-950"
    if (color === "rose") caseBackgroundColor = "bg-rose-950"

        //Measures how long width and length the stock image is in order to place dynamic image.
    return <AspectRatio ref={ref} ratio={3000 / 2001} className="relative">
        <div className="absolute z-20 scale-[1.0352]" style={{
            left:RenderedDimensions.width / 2 - RenderedDimensions.width / (1216 / 121),
            top: RenderedDimensions.height / 6.22,
        }}>
            <img width={RenderedDimensions.width / (3000 / 637)}
            className={cn("phone-skew relative z-20 rounded-t-[15px] rounded-b-[10px] md:rounded-t-[30px] md:rounded-b-[20px]",
                caseBackgroundColor)}
            src={croppedImageUrl} />
        </div>

        <div className="relative h-full w-full z-40">
            <img alt="Phone" src="/clearphone.png" className="pointer-events-none h-full w-full antialiased rounded-md" />
        </div>
    </AspectRatio>
}

export default PhonePreview