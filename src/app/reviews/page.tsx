import React, { Suspense } from "react";
import ClientReviews from "./ClientReviews";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center py-12">Loading reviews...</p>}>
      <ClientReviews />
    </Suspense>
  );
}
