"use client";

import { BsArrowLeft } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

type HeaderProps = {
  name: string;
  children?: ReactNode;
};

const Header: React.FC<HeaderProps> = ({ children, name }) => {
  const router = useRouter();
  return (
    <nav className=" fixed top-0 left-0 w-full p-4 bg-accent flex items-center justify-between z-[100]">
      <BsArrowLeft size={20} cursor="pointer" onClick={() => router.back()} />
      <h2 className="text-[16px]">{name}</h2>
      <span>{children}</span>
    </nav>
  );
};

export default Header;
