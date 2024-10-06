'use client';

import React from 'react';
import { UserV2 } from 'twitter-api-v2';

// Simulate the TwitterApi class with lazy initialization
const TwitterApi = {
  readWrite: {
    get constructor() {
      if (typeof TwitterApiReadWrite === 'undefined') {
        TwitterApiReadWrite = class {};
      }
      return TwitterApiReadWrite;
    }
  }
};

let TwitterApiReadWrite: any;

console.log('Accessing TwitterApiReadWrite at module level');
try {
  console.log('TwitterApiReadWrite at module level:', TwitterApi.readWrite.constructor);
} catch (error) {
  console.error('Error accessing TwitterApiReadWrite at module level:', error);
}

async function getTwitterUser() {
  try {
    const response = await fetch('/api/twitter');
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Twitter user:', error);
    throw error;
  }
}

export default function TestTwitterApi() {
  console.log('Accessing TwitterApiReadWrite in component body');
  try {
    console.log('TwitterApiReadWrite in component body:', TwitterApi.readWrite.constructor);
  } catch (error) {
    console.error('Error accessing TwitterApiReadWrite in component body:', error);
  }

  const [user, setUser] = React.useState<UserV2 | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    console.log('Accessing TwitterApiReadWrite in useEffect');
    try {
      console.log('TwitterApiReadWrite in useEffect:', TwitterApi.readWrite.constructor);
    } catch (error) {
      console.error('Error accessing TwitterApiReadWrite in useEffect:', error);
    }

    getTwitterUser()
      .then(setUser)
      .catch((err: Error) => setError(err.message));
  }, []);

  React.useLayoutEffect(() => {
    console.log('Accessing TwitterApiReadWrite in useLayoutEffect');
    try {
      console.log('TwitterApiReadWrite in useLayoutEffect:', TwitterApi.readWrite.constructor);
    } catch (error) {
      console.error('Error accessing TwitterApiReadWrite in useLayoutEffect:', error);
    }
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Twitter API Test</h1>
      {user && <pre>{JSON.stringify(user, null, 2)}</pre>}
    </div>
  );
}
