"use client";
import React from 'react'
import { Button } from '../ui/button'
import { IconAssembly } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'

const LoginAdmin = () => {
  const router = useRouter();
  return (
    <div>
      <Button variant="outline" onClick={() => router.push("/for-admin/login-admin")}>
          <IconAssembly stroke={2} className='mr-2 h-4 w-4'/>
            Login as Admin
        </Button>
    </div>
  )
}

export default LoginAdmin
