/**
 * About Us page
 * URL: /about — header/scroll region come from (public)/layout.tsx
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">About Novunt</h1>
      <div className="text-muted-foreground space-y-4">
        <p>
          Welcome to Novunt - Your trusted platform for digital asset growth and management.
        </p>
        <p>
          This is a placeholder. Add your about us content here. Content in this area
          will scroll; the back header is fixed by the (public) layout. No element
          will go outside the viewport.
        </p>
      </div>
    </div>
  );
}
