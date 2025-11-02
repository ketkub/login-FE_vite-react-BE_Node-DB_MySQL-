import React from 'react'
import { Input } from '../ui/input'

const Search = () => {
  return (
    <Input
        type='text'
        placeholder='ค้นหาสินค้า...'
        className='max-w-xs'
    />
  )
}

export default Search
