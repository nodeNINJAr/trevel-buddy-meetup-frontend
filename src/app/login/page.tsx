import React, { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function Page({
  searchParams,
}: {
  searchParams: { registered?: string; redirect?: string };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginClient searchParams={searchParams} />
    </Suspense>
  );
}
