import { NextRequest, NextResponse } from 'next/server';
import { HostawayClient } from '@/infrastructure/api/HostawayClient';

/**
 * GET /api/listings/hostaway
 * Fetches all listings from Hostaway API
 */
export async function GET(request: NextRequest) {
  try {
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
    const clientSecret = process.env.HOSTAWAY_CLIENT_SECRET;

    if (!accountId || !clientSecret) {
      return NextResponse.json(
        { 
          error: 'Hostaway credentials not configured',
          message: 'Please set HOSTAWAY_ACCOUNT_ID and HOSTAWAY_CLIENT_SECRET in .env.local'
        },
        { status: 500 }
      );
    }

    const hostawayClient = new HostawayClient(accountId, clientSecret);
    const listings = await hostawayClient.fetchListings();

    return NextResponse.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error('Error in /api/listings/hostaway:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch listings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
