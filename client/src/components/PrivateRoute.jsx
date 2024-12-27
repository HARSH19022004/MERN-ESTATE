import React from 'react'
import { use } from 'react'
import { useSelector } from 'react-redux'
import { Outlet,NavLink, Navigate } from 'react-router-dom'

export const PrivateRoute = () => {
    const {currentUser} =useSelector((state)=>state.user)
  return currentUser? <Outlet/>: <Navigate to={'/sing-in'}/>
}
