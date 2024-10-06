'use client';

import { TwitterApi, TwitterApiReadWrite } from 'twitter-api-v2';
import { useState } from 'react';

interface TwitterComponentProps {
  twitterClient: TwitterApiReadWrite;
}

const TwitterComponent: React.FC<TwitterComponentProps> = ({ twitterClient }) => {
  const [userInfo, setUserInfo] = useState<any | null>(null);

  const fetchUserInfo = async () => {
    try {
      const response = await twitterClient.v2.me();
      setUserInfo(response.data);
      console.log('User info:', response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  return (
    <div>
      <h2>Twitter Component</h2>
      <p>Twitter client initialized</p>
      <button onClick={fetchUserInfo}>
        Fetch User Info
      </button>
      {userInfo && (
        <p>User info: {JSON.stringify(userInfo)}</p>
      )}
    </div>
  );
};

export default TwitterComponent;
