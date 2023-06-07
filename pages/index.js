import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [counter, setCounter] = useState(2);

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      // Redirect when counter reaches 0
      if (counter === 0) {
        router.push("/login");
      } else {
        setCounter(counter - 1);
      }
    }, 1000);

    return () => clearTimeout(redirectTimeout);
  }, [counter, router]);

  return (
    <div className="container p-5">
      <h1>Home</h1>
      <p>Welcome to Home page</p>
      <div className="position-absolute top-50 start-50 translate-middle">
        <h1>
          Redirecting to Login Page in {counter}...
          <div className="spinner-grow text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </h1>
      </div>
    </div>
  );
}
