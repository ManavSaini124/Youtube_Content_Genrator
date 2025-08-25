import { SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'

function AppHeader() {
    return (
        <div className="p-4 shadow-sm flex items-center justify-between w-full bg-white dark:bg-gray-900">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                <SidebarTrigger />
                
            </div>

            
        </div>
    )
}

export default AppHeader