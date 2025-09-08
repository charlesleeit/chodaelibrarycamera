import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

export default function PeopleModal({ open, onClose, onSelect }: { open: boolean, onClose: () => void, onSelect: (person: { id: string, name: string, mobilenum?: string }) => void }) {
  const [people, setPeople] = useState<{ id: string, name: string, mobilenum?: string }[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<typeof people>([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch('/api/people/list')
        .then(res => res.json())
        .then(data => setPeople(data))
        .finally(() => setLoading(false));
      setFiltered([]);
      setSearch('');
      setCurrentPage(1);
      setTimeout(() => { inputRef.current?.focus(); }, 0);
    }
  }, [open]);
  const handleSearch = () => {
    if (loading) return;
    const s = search.trim().toLowerCase();
    if (!s) {
      window.alert('검색어를 입력하세요');
      return;
    }
    const result = people.filter(person =>
      (s && person.id.toString().toLowerCase() === s) ||
      person.name.toLowerCase().includes(s) ||
      (person.mobilenum || '').toLowerCase().includes(s)
    );
    setFiltered(result);
    setCurrentPage(1);
    if (result.length === 0) {
      window.alert('검색 결과가 없습니다.');
    }
  };
  const dataToShow = filtered;
  const totalPages = Math.ceil(dataToShow.length / itemsPerPage) || 1;
  const pagedData = dataToShow.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 8, minWidth: 500, width: 600, height: 620, minHeight: 620, maxHeight: 620, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <h3 className="text-lg font-bold mb-2">Member List</h3>
        <div className="flex gap-2 mb-2">
          <input
            placeholder="ID, Name & Phone No Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border p-1 rounded w-full"
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            ref={inputRef}
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
            aria-label="검색"
          >
            <FaSearch />
          </button>
        </div>
        <div className="mb-2 flex justify-end">
          <label className="mr-2">Rows per page:</label>
          <select
            value={itemsPerPage}
            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="border rounded p-1"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        {/* Table wrapper for horizontal scroll */}
        <div style={{ flex: 1, overflowX: 'auto', marginBottom: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 1, fontWeight: 'bold', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>No.</th>
                <th style={{ borderBottom: '1px solid #ccc', position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 1, fontWeight: 'bold', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>ID</th>
                <th style={{ borderBottom: '1px solid #ccc', position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 1, fontWeight: 'bold', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Name</th>
                <th style={{ borderBottom: '1px solid #ccc', position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 1, fontWeight: 'bold', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Phone No</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: '32px 0' }}>Loading...</td>
                </tr>
              ) : (
                pagedData.length > 0 ? (
                  pagedData.map((person, index) => (
                    <tr
                      key={person.id}
                      onClick={() => { onSelect(person); onClose(); }}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        background: index % 2 === 0 ? '#fff' : '#f6f8fa',
                        transition: 'background 0.2s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = '#e0e7ff')}
                      onMouseOut={e => (e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#f6f8fa')}
                    >
                      <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.id}</td>
                      <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.name}</td>
                      <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.mobilenum}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: '32px 0' }}>No data</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-center mt-2 gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 flex items-center"
            aria-label="이전"
          >
            <FaChevronLeft />
          </button>
          <span style={{ minWidth: 60, textAlign: 'center', display: 'inline-block' }}>{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 flex items-center"
            aria-label="다음"
          >
            <FaChevronRight />
          </button>
        </div>
        <button
          onClick={onClose}
          style={{ position: 'absolute', bottom: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', color: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
          aria-label="닫기"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
} 