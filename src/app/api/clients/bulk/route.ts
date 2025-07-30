import { NextResponse, NextRequest } from 'next/server';
import { 
  createMultipleClientLogosOptimized,
  deleteMultipleClientLogos
} from '@/models/client';
import { 
  BulkClientLogoFormData,
  ClientLogoFormData,
  ImageSource,
  LogoLine
} from '@/types/clientLogo';

// Bulk create logos
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Handle JSON bulk upload (for URLs only)
    if (contentType?.includes('application/json')) {
      return await handleJSONBulkUpload(request);
    }
    
    // Handle FormData bulk upload (for files)
    if (contentType?.includes('multipart/form-data')) {
      return await handleFormDataBulkUpload(request);
    }
    
    return NextResponse.json(
      { message: 'Unsupported content type. Use application/json or multipart/form-data' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error in bulk POST handler:', error);
    return NextResponse.json(
      { message: 'Error processing bulk upload', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Bulk delete logos
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { message: 'IDs array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (body.ids.length > 100) { // Reasonable limit
      return NextResponse.json(
        { message: 'Maximum 100 logos can be deleted at once' },
        { status: 400 }
      );
    }

    const result = await deleteMultipleClientLogos(body.ids);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('Error in bulk DELETE handler:', error);
    return NextResponse.json(
      { message: 'Error processing bulk delete', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle JSON bulk upload (for image URLs)
async function handleJSONBulkUpload(request: NextRequest) {
  const body = await request.json();
  
  // Validate bulk data structure
  if (!Array.isArray(body.logos) || body.logos.length === 0) {
    return NextResponse.json(
      { message: 'Logos array is required and must not be empty' },
      { status: 400 }
    );
  }

  if (body.logos.length > 50) { // Reasonable limit
    return NextResponse.json(
      { message: 'Maximum 50 logos can be uploaded at once' },
      { status: 400 }
    );
  }

  // Validate each logo in the array
  for (let i = 0; i < body.logos.length; i++) {
    const logo = body.logos[i];
    
    if (!logo.line || logo.line < 1 || logo.line > 4) {
      return NextResponse.json(
        { message: `Logo at index ${i}: Line number must be between 1 and 4` },
        { status: 400 }
      );
    }

    if (!logo.imageSource) {
      return NextResponse.json(
        { message: `Logo at index ${i}: Image source is required` },
        { status: 400 }
      );
    }

    if (logo.imageSource === 'link' && !logo.image) {
      return NextResponse.json(
        { message: `Logo at index ${i}: Image URL is required when using link source` },
        { status: 400 }
      );
    }

    // For JSON uploads, only allow 'link' source
    if (logo.imageSource !== 'link') {
      return NextResponse.json(
        { message: `Logo at index ${i}: Only 'link' image source is supported for JSON uploads. Use FormData for file uploads.` },
        { status: 400 }
      );
    }
  }

  const bulkData: BulkClientLogoFormData = {
    logos: body.logos
  };

  const result = await createMultipleClientLogosOptimized(bulkData);
  
  return NextResponse.json(result, { status: 201 });
}

// Handle FormData bulk upload (for files and mixed content)
async function handleFormDataBulkUpload(request: NextRequest) {
  const formData = await request.formData();
  
  // Get the number of logos
  const logoCount = parseInt(formData.get('logoCount') as string);
  
  if (!logoCount || logoCount < 1) {
    return NextResponse.json(
      { message: 'logoCount is required and must be greater than 0' },
      { status: 400 }
    );
  }

  if (logoCount > 50) {
    return NextResponse.json(
      { message: 'Maximum 50 logos can be uploaded at once' },
      { status: 400 }
    );
  }

  const logos: ClientLogoFormData[] = [];
  
  // Process each logo
  for (let i = 0; i < logoCount; i++) {
    const line = parseInt(formData.get(`logos[${i}][line]`) as string);
    const imageSource = formData.get(`logos[${i}][imageSource]`) as ImageSource;
    const image = formData.get(`logos[${i}][image]`) as string;
    const imageFile = formData.get(`logos[${i}][imageFile]`) as File;
    
    // Validate each logo
    if (!line || line < 1 || line > 4) {
      return NextResponse.json(
        { message: `Logo at index ${i}: Line number must be between 1 and 4` },
        { status: 400 }
      );
    }

    if (!imageSource) {
      return NextResponse.json(
        { message: `Logo at index ${i}: Image source is required` },
        { status: 400 }
      );
    }

    if (imageSource === 'upload' && (!imageFile || imageFile.size === 0)) {
      return NextResponse.json(
        { message: `Logo at index ${i}: Image file is required when choosing upload option` },
        { status: 400 }
      );
    }

    if (imageSource === 'link' && !image) {
      return NextResponse.json(
        { message: `Logo at index ${i}: Image URL is required when choosing URL option` },
        { status: 400 }
      );
    }

    const logoData: ClientLogoFormData = {
      line: line as LogoLine,
      imageSource,
      image: image || '',
      imageFile: (imageFile && imageFile.size > 0) ? imageFile : undefined
    };

    logos.push(logoData);
  }

  const bulkData: BulkClientLogoFormData = { logos };
  const result = await createMultipleClientLogosOptimized(bulkData);
  
  return NextResponse.json(result, { status: 201 });
}