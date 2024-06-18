import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Set isMounted to true after component mounts
  }, []);

  useEffect(() => {
    if (isMounted) {
      router.replace('/(auth)/signin'); // Navigate to the sign-in screen if the user is not authenticated
    }
  }, [isMounted, router]); // Add router to dependency array to avoid potential issues

  return null; // or a loading screen, if necessary
}
