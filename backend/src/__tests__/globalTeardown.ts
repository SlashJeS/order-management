import { cleanup } from './setup';

export default async (): Promise<void> => {
  try {
    await cleanup();
  } catch (error) {
    console.error('Error during global teardown:', error);
    process.exit(1); // Exit with error code if cleanup fails
  }
}; 