"use client"
import React from 'react'
import { IconBrandLine, IconBuildingStore, IconHome } from '@tabler/icons-react';
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();
  const text = "..................................................................";
  return (
    <div>
      <div className='container flex flex-row sm:justify-center mt-10 mb-5'>
        <div className='flex gap-4 justify-center w-full sticky top-0 z-50'>
          <div className='p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-1500 w-32 flex flex-col justify-center gap-1 items-center hover:rotate-y-360' onClick={() => router.push("/")}>
            <IconHome stroke={2} className='w-10 h-10 rounded-full bg-gray-200 p-2' />
            <span>เกี่ยวกับเรา</span>
          </div>
          <div className='p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-1500 w-32 flex flex-col justify-center gap-1 items-center hover:rotate-y-360' onClick={() => router.push("/shop-products")}>
            <IconBuildingStore stroke={2} className='w-10 h-10 rounded-full bg-gray-200 p-2' />
            <span>สินค้าทั้งหมด</span>
          </div>
          <div className='p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-1500 w-32 flex flex-col justify-center gap-1 items-center hover:rotate-y-360' onClick={() => router.push("/contact-us")}>
            <IconBrandLine stroke={2} className='w-10 h-10 rounded-full bg-gray-200 p-2' />
            <span>ติดต่อเรา</span>
          </div>
        </div>
      </div>

      {/* banner */}
      <div className='h-full gap-5 container mt-20 mb-10 flex flex-col justify-center items-center sm:flex-col'>
        <div className='relative w-72 h-72 font-bold text-5xl'>
          <div className='absolute inset-0 rounded-full border-t-red-500 dark:border-t-white border-4 border-transparent dark:border-4 animate-spin transition duration-1500'>
          </div>
          <div className='absolute inset-0 rounded-full border-b-blue-500 dark:border-b-purple-800 border-4 border-transparent dark:border-4 animate-spin'>
          </div>
          <div className='relative w-full h-full flex items-center justify-center text-center'>
            LOGO
          </div>
        </div>
        <div className='text-center text-sm align-middle'>
          ยินดีต้อนรับสู่ Demo Shop
          <br />
          ร้านค้านี้เป็นโครงการที่จัดทำขึ้นเพื่อการสัมภาษณ์งานในตำแหน่ง (Programmer) โดยมีวัตถุประสงค์เพื่อนำเสนอทักษะและความเข้าใจในการพัฒนาเว็บแอปพลิเคชัน
          <br />
          โปรเจกต์นี้แสดงให้เห็นถึงการประยุกต์ใช้เทคโนโลยี (Backend: Node.js Frontend: Next.js) เพื่อสร้างประสบการณ์การใช้งาน E-commerce ที่สมบูรณ์
          <div className='mt-5 flex justify-center items-center gap-1 dark:text-purple-500'>
            {text.split('').map((char, index) => (
              <span
                key={index}
                className='animate-bounce text-center justify-center items-center flex'
                style={{ animationDelay: `${index * 100}ms` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className='bg-gray-500 justify-center items-center mx-auto rounded-s-xl w-full '>
        <div className='container flex flex-row justify-center items-center gap-10 text-center'>
          <div className='w-1/2 text-3xl font-bold'>
            ทำไมต้องเลือกเรา?
          </div>
          <div className='w-1/2 mx-auto my-5 rounded-full'>
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="รูปสำนักงาน" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
