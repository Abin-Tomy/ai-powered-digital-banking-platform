import React from "react";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>Role Layout</header>
      <main>{children}</main>
    </div>
  );
}
