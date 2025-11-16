"use client"
import React from 'react'
import { IconBrandLine, IconBuildingStore, IconHome, IconTruckDelivery, IconHeadset, IconShieldCheck, IconPackage } from '@tabler/icons-react';
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const HomePage = () => {
  const router = useRouter();
  const text = "..................................................................";

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  };

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
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ amount: 0.2 }}
        variants={fadeInUp}
        className='bg-gray-100 dark:bg-gray-800 justify-center items-center mx-auto w-full py-16'
      >
        <div className='container flex flex-col md:flex-row justify-center items-center gap-12 text-center md:text-left'>
          <div className='w-full md:w-1/2'>
            <h2 className='text-3xl font-bold mb-4'>ทำไมต้องเลือกเรา?</h2>
            <p className='mb-6 text-gray-600 dark:text-gray-300'>
              เรามุ่งมั่นที่จะมอบประสบการณ์การช็อปปิ้งออนไลน์ที่ดีที่สุดให้กับคุณ ด้วยสินค้าคุณภาพสูง การบริการที่เป็นเลิศ และความน่าเชื่อถือที่คุณวางใจได้
            </p>
            <ul className='space-y-4'>
              <li className='flex items-start gap-3'><IconPackage className='w-6 h-6 text-purple-500 mt-1 shrink-0' /><span><b>สินค้าคุณภาพ:</b> คัดสรรมาเพื่อคุณโดยเฉพาะ จากแบรนด์ชั้นนำ</span></li>
              <li className='flex items-start gap-3'><IconTruckDelivery className='w-6 h-6 text-purple-500 mt-1 shrink-0' /><span><b>จัดส่งรวดเร็ว:</b> บริการจัดส่งที่รวดเร็วและปลอดภัย ถึงมือคุณในเวลาที่กำหนด</span></li>
              <li className='flex items-start gap-3'><IconHeadset className='w-6 h-6 text-purple-500 mt-1 shrink-0' /><span><b>บริการลูกค้า 24/7:</b> ทีมงานพร้อมให้ความช่วยเหลือและตอบทุกข้อสงสัย</span></li>
              <li className='flex items-start gap-3'><IconShieldCheck className='w-6 h-6 text-purple-500 mt-1 shrink-0' /><span><b>รับประกันความพอใจ:</b> สามารถคืนสินค้าได้หากไม่พอใจในคุณภาพ</span></li>
            </ul>
          </div>
          <div className='w-full md:w-1/2 mx-auto'>
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="รูปสำนักงาน" className='rounded-lg shadow-lg' />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ amount: 0.5 }}
        variants={fadeInUp}
        className="w-full py-16"
      >
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">บริการของเรา</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">เรามีบริการครบวงจรเพื่อตอบสนองทุกความต้องการของคุณ ตั้งแต่การเลือกซื้อไปจนถึงบริการหลังการขาย</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <IconTruckDelivery className="w-12 h-12 text-purple-500 mx-auto mb-4" stroke={1.5} />
              <h3 className="text-xl font-semibold mb-2">จัดส่งทั่วประเทศ</h3>
              <p className="text-gray-500 dark:text-gray-400">ไม่ว่าคุณจะอยู่ที่ไหน เราพร้อมจัดส่งสินค้าให้ถึงหน้าบ้านคุณอย่างปลอดภัย</p>
            </div>
            <div className="p-6 border dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <IconHeadset className="w-12 h-12 text-purple-500 mx-auto mb-4" stroke={1.5} />
              <h3 className="text-xl font-semibold mb-2">ให้คำปรึกษา</h3>
              <p className="text-gray-500 dark:text-gray-400">ทีมงานผู้เชี่ยวชาญพร้อมให้คำแนะนำ เพื่อให้คุณได้สินค้าที่ตรงใจที่สุด</p>
            </div>
            <div className="p-6 border dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <IconShieldCheck className="w-12 h-12 text-purple-500 mx-auto mb-4" stroke={1.5} />
              <h3 className="text-xl font-semibold mb-2">รับประกันของแท้</h3>
              <p className="text-gray-500 dark:text-gray-400">มั่นใจได้กับสินค้าทุกชิ้นจากร้านเราว่าเป็นของแท้ 100% พร้อมการรับประกัน</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HomePage
