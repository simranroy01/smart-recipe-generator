// src/app/api/recognize-ingredients/route.ts
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()

    // 1. Get the image file from the request
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
    }

    // 2. Upload the image to Supabase Storage
    const fileName = `${uuidv4()}-${imageFile.name}`
    const { error: uploadError } = await supabase.storage
      .from('ingredient-images')
      .upload(fileName, imageFile)

    if (uploadError) {
      throw new Error(`Storage Error: ${uploadError.message}`)
    }

    // 3. Get the public URL of the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('ingredient-images')
      .getPublicUrl(fileName)

    const imageUrl = publicUrlData.publicUrl

    // 4. Call the REAL Google Cloud Vision API
    const visionClient = new ImageAnnotatorClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
    })

    const [result] = await visionClient.labelDetection(imageUrl)
    const labels = result.labelAnnotations
    console.log('Vision API labels:', labels)

    // 5. Process the labels to get a clean list of ingredients
    const ingredients = labels
      ?.filter(label => label.score && label.score > 0.80 && label.description !== 'Food' && label.description !== 'Ingredient' && label.description !== 'Tableware')
      .map((label) => label.description)
      .filter((desc): desc is string => desc !== null && desc !== undefined)

    return NextResponse.json({ ingredients })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}