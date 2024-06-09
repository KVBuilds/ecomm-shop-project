import { buffer } from "stream/consumers";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import sharp from "sharp"; 
import { db } from "@/db";

const f = createUploadthing();
 
 
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .input(z.object({configId: z.string().optional() }))
    .middleware(async ({ input }) => {
     return { input }
    })
    //Passed back to the client - stored into db
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input 
      const res = await fetch(file.url)
      const buffer = await res.arrayBuffer()

      const imgMetadata = await sharp(buffer).metadata()
      const {width, height} = imgMetadata

      if(!configId) {
        const configuration = await db.configuration.create({
          data: {
            imageUrl: file.url,
            height: height || 500, 
            width: width || 500, 
          },
        })
          //Returns db configuration ID
          return { configId: configuration.id}
      } else { 
        const updatedConfiguration = await db.configuration.update({
          where: {
            id: configId,
          }, 
          data: {
            //The file URL is step 1 image
            //If user drags image and crops + continue, moves to new cropped imgURL
            cropImageUrl: file.url,
          },
        })
        return {configId: updatedConfiguration.id}
      }
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter; 