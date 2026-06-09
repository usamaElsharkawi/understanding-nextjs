import React from 'react'

const page = async ({ params }) => {
    const { slug } = await params
    return (
        <div>
            The current docs path is: 
            {slug?.join(' / ')}
            
            
        </div>
    )
}

export default page
