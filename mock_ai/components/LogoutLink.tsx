"use client";
import React from "react";
import { Button } from "./ui";
import { useLogout } from "@/hooks/useLogout";

const LogoutButton = ({
  revalidate,
  className,
}: {
  revalidate: () => void;
  className: string;
}) => {
  const logout = useLogout(revalidate);

  return (
    <Button className={className} onClick={logout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
