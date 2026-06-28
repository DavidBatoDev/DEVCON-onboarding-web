import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import DevconLogo from "@/components/DevconLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="flex max-w-md flex-col items-center text-center">
        <DevconLogo />
        <p className="mt-10 text-6xl font-semibold tracking-tight text-foreground">
          404
        </p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
