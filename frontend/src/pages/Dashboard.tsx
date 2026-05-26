import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

// Interface representing the user data returned from /user/bulk
interface BulkUser {
  id: number; // or id, depending on your backend
  username: string; // this is their email
  firstName: string;
  lastName: string;
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<BulkUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filteredUser,setFilteredUser] = useState<BulkUser[]>([])
  const [filter,setFilter] = useState<string>("")
  // const [balance,setBalance] = useState();
  console.log("render");
  
  // Dummy balance data (Ready to be swapped with an API call later)
  const [balance, setBalance] = useState<Number>(0);

  const fetchDashBoard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/user/bulk', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Assuming response.data contains the array of users directly 
      // or inside an object property (e.g., response.data.users)
      const userData = Array.isArray(response.data) ? response.data : response.data.users || [];
      setUsers(userData);
      setFilteredUser(userData)
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get('/account/balance',{
        headers : {
          Authorization : `Bearer ${token}`
        }
      })
      console.log(response);
      setBalance(response.data.balance);
    } catch (error) {
      
    }
  }
  useEffect(()=>{

    const doFilteration = async ()=>{
      setLoading(true)
      try {
      const token = localStorage.getItem('token')
      const response = await api.get(`/user/bulk?filter=${filter}`,{
        headers : {
          Authorization : `Bearer ${token}`
        }
      })
      console.log(response);
      const filteredData = Array.isArray(response.data) ? response.data : response.data.users || [];
      setFilteredUser(filteredData)
    } catch (error) {
      
    }finally{
      setLoading(false)
    }
    }
    // doFilteration()

    const delayfn = setTimeout(()=>{
    doFilteration()
    },900)

    return ()=>clearTimeout(delayfn)
    
  },[filter])
  useEffect(() => {
    console.log("called");
    
    // fetchDashBoard();
    fetchBalance();
  }, []);

  // Filter users based on search query matching firstName, lastName, or email(username)
  // const filteredUsers = users.filter((user) => {
  //   const searchLower = searchQuery.toLowerCase();
  //   return (
  //     user.firstName?.toLowerCase().includes(searchLower) ||
  //     user.lastName?.toLowerCase().includes(searchLower) ||
  //     user.username?.toLowerCase().includes(searchLower)
  //   );
  // });

  const handleSendMoney = (user: BulkUser) => {
    // Action trigger when clicking Send Money
    // console.log(`Initiating transfer to: ${user.firstName} (${user.username})`);
    // alert(`Send money to ${user.firstName} ${user.lastName}?`);
    navigate('/send',{
      state : {
        receiver :user
      }
    })

  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Top Header Card: User Balance */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-indigo-100 uppercase tracking-wider">
                Available Balance
              </p>
              <h1 className="mt-1 text-4xl font-extrabold tracking-tight">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/update')} 
                className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10"
              >
                ⚙️ Update Info
              </button>
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                💳
              </div>
            </div>
          </div>
        </div>

        {/* Core Layout: Users Directory */}
        <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Users Directory</h2>
          
          {/* Search Bar Input */}
          <div className="relative mb-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              🔍
            </div>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Users List Rendering */}
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading directory...</div>
          ) : filteredUser.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">No users found match your search.</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-2">
              {filteredUser.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between py-4 transition-colors hover:bg-gray-50/50 px-2 rounded-lg"
                >
                  {/* Left: User Avatar & Details */}
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                      {user.firstName[0]?.toUpperCase()}{user.lastName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[180px] sm:max-w-none">
                        {user.username}
                      </p>
                    </div>
                  </div>

                  {/* Right: Transfer Button */}
                  <button
                    onClick={() => handleSendMoney(user)}
                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-150"
                  >
                    Send Money
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
export type {BulkUser}
export default Dashboard;