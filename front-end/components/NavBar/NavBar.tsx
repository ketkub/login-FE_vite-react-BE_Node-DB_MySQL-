import React from 'react';
import Logo from './Logo';
import Search from './Search';
import { Darkmode } from './Darkmode';
import Avatar from './AvatarUser';
import AvatarUser from './AvatarUser';

const NavBar = () => {
  return (
    <nav>
      <div className='container flex flex-col justify-between py-8 sm:flex-row sm:items-center gap-4'>
        <Logo/>
        <Search/>

        <div className='flex gap-3'>
          <Darkmode></Darkmode>
          <AvatarUser></AvatarUser>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
