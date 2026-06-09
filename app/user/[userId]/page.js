import React from 'react'

const UserDetails = async ({ params }) => {
    const { userId } = await params
    return (
        <div>UserDetails Id: {userId}</div>
    )
}

export default UserDetails 