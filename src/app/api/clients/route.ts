import { NextResponse } from 'next/server';
import { 
  createClientLogo, 
  getClientLogos, 
  createMultipleClientLogosOptimized,
  getClientLogosWithPagination,
  getClientLogosCountByLine
} from '@/models/client';
import { 
  ClientLogoFormData, 
  BulkClientLogoFormData,
  ImageSource, 
  LogoLine 
} from '@/types/clientLogo';

// Define types for bulk upload
interface BulkLogoItem {
  line: LogoLine;
  imageSource: ImageSource;
  image?: string;
  imageFile?: never; // Files can't be sent via JSON
}

interface BulkUploadRequest {
  bulk: true;
  logos: BulkLogoItem[];
}

// Type guard for bulk upload with proper typing
function isBulkUploadRequest(body: unknown): body is BulkUploadRequest {
  return (
    typeof body === 'object' && 
    body !== null && 
    'bulk' in body && 
    (body as Record<string, unknown>).bulk === true && 
    'logos' in body && 
    Array.isArray((body as Record<string, unknown>).logos)
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const line = searchParams.get('line');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const paginated = searchParams.get('paginated') === 'true';
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const counts = await getClientLogosCountByLine();
      const totalLogos = Object.values(counts).reduce((sum, count) => sum + count, 0);
      
      return NextResponse.json({
        totalLogos,
        logosByLine: counts
      });
    }

    if (paginated) {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 20;
      const lineFilter = line ? parseInt(line) as LogoLine : undefined;

      const result = await getClientLogosWithPagination(lineFilter, pageNum, limitNum);
      
      return NextResponse.json({
        ...result,
        currentPage: pageNum,
        totalPages: Math.ceil(result.total / limitNum)
      });
    }

    const lineFilter = line ? parseInt(line) as LogoLine : undefined;
    const clientLogos = await getClientLogos(lineFilter);
    
    const serializedClientLogos = clientLogos.map(item => ({
      ...item,
      _id: item._id?.toString(),
    }));
    
    return NextResponse.json(serializedClientLogos);
  } catch (error) {
    console.error('Error fetching client logos:', error);
    return NextResponse.json(
      { message: 'Error fetching client logos', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const body: unknown = await request.json();
      
      if (isBulkUploadRequest(body)) {
        return await handleBulkUpload(body);
      }
      
      return NextResponse.json(
        { message: 'Single logo creation via JSON not supported. Use FormData.' },
        { status: 400 }
      );
    }
    
    if (contentType?.includes('multipart/form-data')) {
      return await handleSingleUpload(request);
    }
    
    return NextResponse.json(
      { message: 'Unsupported content type' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { message: 'Error processing request', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleSingleUpload(request: Request) {
  const formData = await request.formData();
  
  const clientLogoData: ClientLogoFormData = {
    image: formData.get('image') as string || '',
    imageFile: formData.get('imageFile') as File || undefined,
    imageSource: formData.get('imageSource') as ImageSource,
    line: parseInt(formData.get('line') as string) as LogoLine
  };

  if (!clientLogoData.line || (clientLogoData.line < 1 || clientLogoData.line > 4)) {
    return NextResponse.json(
      { message: 'Line number must be between 1 and 4' },
      { status: 400 }
    );
  }

  if (!clientLogoData.imageSource) {
    return NextResponse.json(
      { message: 'Please select an image option (upload or URL)' },
      { status: 400 }
    );
  }

  if (clientLogoData.imageSource === 'upload' && !clientLogoData.imageFile) {
    return NextResponse.json(
      { message: 'Image file is required when choosing upload option' },
      { status: 400 }
    );
  }

  if (clientLogoData.imageSource === 'link' && !clientLogoData.image) {
    return NextResponse.json(
      { message: 'Image URL is required when choosing URL option' },
      { status: 400 }
    );
  }

  const clientLogoId = await createClientLogo(clientLogoData);
  
  return NextResponse.json(
    { _id: clientLogoId.toString() }, 
    { status: 201 }
  );
}

async function handleBulkUpload(body: BulkUploadRequest) {
  // Validate bulk data structure
  if (!body.logos || body.logos.length === 0) {
    return NextResponse.json(
      { message: 'Logos array is required and must not be empty' },
      { status: 400 }
    );
  }

  if (body.logos.length > 50) {
    return NextResponse.json(
      { message: 'Maximum 50 logos can be uploaded at once' },
      { status: 400 }
    );
  }

  // Validate each logo in the array
  const errors: {index: number; message: string}[] = [];
  
  body.logos.forEach((logo, index) => {
    if (!logo.line || logo.line < 1 || logo.line > 4) {
      errors.push({
        index,
        message: 'Line number must be between 1 and 4'
      });
    }

    if (!logo.imageSource) {
      errors.push({
        index,
        message: 'Image source is required'
      });
    }

    if (logo.imageSource === 'link' && !logo.image) {
      errors.push({
        index,
        message: 'Image URL is required when using link source'
      });
    }

    if (logo.imageSource === 'upload') {
      errors.push({
        index,
        message: 'File uploads must use multipart/form-data, not JSON'
      });
    }
  });

  if (errors.length > 0) {
    return NextResponse.json(
      { 
        message: 'Validation failed for some logos',
        errors 
      },
      { status: 400 }
    );
  }

  const bulkData: BulkClientLogoFormData = {
    logos: body.logos.map(logo => ({
      line: logo.line,
      imageSource: logo.imageSource,
      image: logo.imageSource === 'link' ? logo.image : undefined
    }))
  };

  const result = await createMultipleClientLogosOptimized(bulkData);
  
  return NextResponse.json(result, { status: 201 });
}