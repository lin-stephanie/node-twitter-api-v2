import Image from "next/image";
import { TwitterApi } from 'twitter-api-v2';
import TwitterComponent from "../../components/TwitterComponent";

// Attempt to reproduce the ReferenceError by accessing TwitterApiReadWrite before initialization
let TwitterApiReadWrite;
try {
  TwitterApiReadWrite = TwitterApi.prototype.readWrite.constructor;
} catch (error) {
  console.error('Error accessing TwitterApiReadWrite:', error);
}

let globalTwitterClient: TwitterApi | null = null;

function getTwitterClient() {
  if (!globalTwitterClient) {
    globalTwitterClient = new TwitterApi('YOUR_TWITTER_API_KEY');
  }
  return globalTwitterClient.readWrite;
}

export default function Home() {
  let twitterClient;
  try {
    twitterClient = getTwitterClient();
  } catch (error) {
    console.error('Error in Home component:', error);
    return <div>Error initializing Twitter client</div>;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <TwitterComponent twitterClient={twitterClient} />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="font-mono font-bold">src/app/page.tsx</code>
          </li>
          <li className="mb-2">
            Learn more about Next.js at{" "}
            <a
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-foreground hover:text-foreground/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js Documentation
            </a>
          </li>
        </ol>
      </main>
    </div>
  );
}
