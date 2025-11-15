"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import Search from './Search';
import { Darkmode } from './Darkmode';
import AvatarUser from './AvatarUser';
import Cart from './Cart';
import LoginAdmin from './LoginAdmin';

const NavBar = () => {
  const pathname = usePathname();
  
  // ซ่อน navbar ถ้าอยู่ใน /for-admin
  if (pathname.startsWith('/for-admin')) {
    return null;
  }

  return (
    <nav>
      <div className='container flex flex-col justify-between py-8 sm:flex-row sm:items-center gap-4'>
        <Logo/>
        <Search/>

        <div className='flex gap-3'>
          <Darkmode></Darkmode>
          <Cart></Cart>
          <AvatarUser></AvatarUser>
          <LoginAdmin/>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
