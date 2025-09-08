'use client';

import { FaBook, FaBookOpen, FaUsers, FaChartLine, FaFacebookF, FaTwitter, FaLinkedinIn, FaGooglePlusG } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome to NJCHODAE Library</h1>
          <p className="text-blue-100 text-lg">Your digital library management system</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">2,847</p>
              <p className="text-orange-100 font-medium">Total Books</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaBook className="text-white text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">156</p>
              <p className="text-blue-100 font-medium">Active Loans</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaBookOpen className="text-white text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">1,805</p>
              <p className="text-green-100 font-medium">Available Books</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaChartLine className="text-white text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">89</p>
              <p className="text-purple-100 font-medium">New Members</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaUsers className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => window.location.href = '/takeout'} 
            className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl text-left transition-all duration-300 transform hover:scale-105 border border-blue-200"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-600 transition-colors">
                <FaBookOpen className="text-white text-xl" />
              </div>
              <div className="text-blue-700 font-semibold text-lg">Borrow Book</div>
            </div>
            <div className="text-blue-600 text-sm">Check out a book from the library</div>
          </button>

          <button 
            onClick={() => window.location.href = '/return'} 
            className="group p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl text-left transition-all duration-300 transform hover:scale-105 border border-green-200"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-600 transition-colors">
                <FaBook className="text-white text-xl" />
              </div>
              <div className="text-green-700 font-semibold text-lg">Return Book</div>
            </div>
            <div className="text-green-600 text-sm">Return a borrowed book</div>
          </button>

          <button 
            onClick={() => window.location.href = '/books'} 
            className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl text-left transition-all duration-300 transform hover:scale-105 border border-purple-200"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-600 transition-colors">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div className="text-purple-700 font-semibold text-lg">Browse Books</div>
            </div>
            <div className="text-purple-600 text-sm">Search and view all books</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <FaBook className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">New book added: "The Great Gatsby"</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <FaUsers className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">New member registered: John Smith</p>
              <p className="text-sm text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
              <FaBookOpen className="text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Book returned: "To Kill a Mockingbird"</p>
              <p className="text-sm text-gray-500">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}