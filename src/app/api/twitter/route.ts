import { NextResponse } from 'next/server';

// Simulate the TwitterApi class
class TwitterApi {
  static readWrite = {
    constructor: class TwitterApiReadWrite {}
  };
}

let TwitterApiReadWrite: any;

export async function GET() {
  try {
    console.log('Accessing TwitterApiReadWrite in API route');
    TwitterApiReadWrite = (TwitterApi as any).readWrite.constructor;
    console.log('TwitterApiReadWrite accessed successfully in API route:', TwitterApiReadWrite);

    // Simulate an API call
    const result = {
      data: {
        id: '12345',
        name: 'Test User',
        username: 'testuser'
      }
    };

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
