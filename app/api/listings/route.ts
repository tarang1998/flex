import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/di';

/**
 * GET /api/listings
 * Fetches all listings using the DI container
 */
export async function GET(request: NextRequest) {
  try {
    const getListingsUseCase = container().getListingsUseCase();
    const listings = await getListingsUseCase.execute();

    return NextResponse.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error('Error in /api/listings:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch listings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
