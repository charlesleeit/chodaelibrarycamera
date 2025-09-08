'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, UserInput } from '@/lib/models/user';
import { FaChevronLeft, FaChevronRight, FaUserPlus, FaEdit, FaTimes, FaTrash, FaSearch } from 'react-icons/fa';
import PeopleModal from '../components/PeopleModal';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

type SortField = 'id' | 'name' | 'email';
type SortOrder = 'asc' | 'desc';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<UserInput>({
    id: '',
    name: '',
    email: '',
    pwd: '',
    status: 1 // int, Active
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [formErrors, setFormErrors] = useState<Partial<UserInput>>({});
  const [showForm, setShowForm] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  // 로그인 안 되어 있으면 로그인 페이지로 이동
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  const validateForm = (): boolean => {
    const errors: Partial<UserInput> = {};
    
    if (!String(formData.id).trim()) {
      errors.id = 'ID is required';
    }
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.pwd.trim()) {
      errors.pwd = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (_error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = useCallback(() => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(user =>
        (user.id?.toString() || '').includes(searchTerm.toLowerCase()) ||
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, searchTerm, sortField, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [filterAndSortUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const url = editingId 
        ? `/api/users`
        : '/api/users';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save user');
      }

      await fetchUsers();
      resetForm();
    } catch (_error) {
      setError('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchUsers();
    } catch (_error) {
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    console.log('handleEdit called with user:', user);
    console.log('user.status type:', typeof user.status, 'value:', user.status);
    
    setEditingId(user.id);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      pwd: '', // Don't show password when editing
      status: Number(user.status) // status를 숫자로 변환
    });
    
    console.log('formData.status after setting:', Number(user.status));
    setFormErrors({});
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      pwd: '',
      status: 1
    });
    setEditingId(null);
    setFormErrors({});
    setShowForm(false);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Fancy pagination logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, '...', 3, 4, 5, 6, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return [...new Set(pages)].filter(p => p === '...' || (typeof p === 'number' && p >= 1 && p <= totalPages));
  };

  // 로그인 안 된 경우 접근 제한
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">사용자 관리</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4 inline-block">
          이 페이지는 로그인한 사용자만 볼 수 있습니다.
        </div>
        <button
          onClick={() => window.location.href = '/login'}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        {!showForm && !editingId && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center"
            title="Add User"
          >
            <FaUserPlus size={18} />
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {(showForm || editingId) && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? 'Edit User' : 'Add New User'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    formErrors.id ? 'border-red-500' : ''
                  }`}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
                  disabled={!!editingId}
                  tabIndex={-1}
                  title="검색"
                >
                  <FaSearch />
                </button>
              </div>
              {formErrors.id && (
                <p className="mt-1 text-sm text-red-600">{formErrors.id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                readOnly
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  formErrors.name ? 'border-red-500' : ''
                }`}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  formErrors.email ? 'border-red-500' : ''
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={formData.pwd}
                onChange={(e) => setFormData({ ...formData, pwd: e.target.value })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  formErrors.pwd ? 'border-red-500' : ''
                }`}
              />
              {formErrors.pwd && (
                <p className="mt-1 text-sm text-red-600">{formErrors.pwd}</p>
              )}
            </div>

            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="status"
                checked={formData.status === 1}
                onChange={e => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="status" className="ml-2 block text-sm text-gray-700">Active</label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
              title={editingId ? 'Update' : 'Add'}
            >
              <FaEdit size={18} />
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                disabled={loading}
                title="Cancel"
              >
                <FaTimes size={18} />
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-2 flex justify-end">
        <label className="mr-2">Rows per page:</label>
        <select
          value={itemsPerPage}
          onChange={e => setItemsPerPage(Number(e.target.value))}
          className="border rounded p-1"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <>
            <div className="max-h-[600px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">No.</th>
                    <th 
                      className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                      onClick={() => handleSort('id')}
                    >
                      ID {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                      onClick={() => handleSort('name')}
                    >
                      Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-500"
                      onClick={() => handleSort('email')}
                    >
                      Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((user, index) => (
                    <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-2 whitespace-nowrap text-sm">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-2 py-2 text-sm">
                        <div className="max-w-[150px] truncate" title={user.id}>{user.id}</div>
                      </td>
                      <td className="px-2 py-2 text-sm">
                        <div className="max-w-[200px] truncate" title={user.name}>{user.name}</div>
                      </td>
                      <td className="px-2 py-2 text-sm">
                        <div className="max-w-[200px] truncate" title={user.email}>{user.email}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm">
                        <span className={Number(user.status) === 1 ? 'text-green-600 font-semibold' : 'text-gray-400 font-semibold'}>
                          {Number(user.status) === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={loading}
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={loading}
                            title="Delete"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-center border-t border-gray-200">
              <nav className="inline-flex items-center space-x-1" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}
                  aria-label="Previous"
                >
                  <FaChevronLeft />
                </button>
                {getPageNumbers().map((page, idx) =>
                  page === '...'
                    ? <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                    : <button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(Number(page))}
                        className={`w-9 h-9 rounded-full border transition-all duration-150 font-semibold ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {page}
                      </button>
                )}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}
                  aria-label="Next"
                >
                  <FaChevronRight />
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
      <PeopleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={person => setFormData(fd => ({ ...fd, id: person.id, name: person.name }))}
      />
    </div>
  );
} 