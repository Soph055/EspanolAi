import {Outlet} from 'react-router-dom'
import Sidebar from './Sidebar'

function AppShell () {
    return (
        <div className='flex'>
            <Sidebar />
            <main className="flex-1 min-h-screen">
                <Outlet />
            </main>

        </div>
    );
}

export default AppShell