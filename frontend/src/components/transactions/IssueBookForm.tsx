import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useIssueBook } from '../../hooks/useTransactions';
import apiClient from '../../api/client';

interface IssueBookFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialBook?: any;
}

const IssueBookForm: React.FC<IssueBookFormProps> = ({ isOpen, onClose, initialBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookTerm, setBookTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(initialBook || null);
  const [notes, setNotes] = useState('');
  
  const issueMutation = useIssueBook();

  useEffect(() => {
    if (initialBook) {
      setSelectedBook(initialBook);
    }
  }, [initialBook, isOpen]);

  // Debounced searches
  useEffect(() => {
    if (searchTerm.length > 2) {
      const t = setTimeout(() => {
        apiClient.get(`/users?search=${searchTerm}`).then(r => setUsers(r.data.items || r.data));
      }, 300);
      return () => clearTimeout(t);
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (bookTerm.length > 2) {
      const t = setTimeout(() => {
        apiClient.get(`/books?search=${bookTerm}&available=true`).then(r => setBooks(r.data.items || r.data));
      }, 300);
      return () => clearTimeout(t);
    } else {
      setBooks([]);
    }
  }, [bookTerm]);

  const handleSubmit = () => {
    if (!selectedUser || !selectedBook) return;
    
    // Default due date: +14 days
    const due = new Date();
    due.setDate(due.getDate() + 14);

    issueMutation.mutate({
      book_id: selectedBook.id,
      user_id: selectedUser.id,
      due_date: due.toISOString(),
      notes
    }, {
      onSuccess: () => {
        onClose();
        setSelectedUser(null);
        setSelectedBook(null);
        setSearchTerm('');
        setBookTerm('');
        setNotes('');
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Book" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">Select Member</label>
            {!selectedUser ? (
              <div className="relative">
                <Input placeholder="Search name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                {users.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-surface border border-border mt-1 rounded-md shadow-lg max-h-40 overflow-y-auto z-10">
                    {users.map(u => (
                      <div key={u.id} className="p-2 hover:bg-background cursor-pointer text-sm" onClick={() => setSelectedUser(u)}>
                        <div className="font-medium">{u.full_name}</div>
                        <div className="text-textSecondary text-xs">{u.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 border border-border rounded-md bg-background flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">{selectedUser.full_name}</div>
                  <div className="text-xs text-textSecondary">{selectedUser.email}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>Change</Button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">Select Book</label>
            {!selectedBook ? (
              <div className="relative">
                <Input placeholder="Search book title..." value={bookTerm} onChange={e => setBookTerm(e.target.value)} />
                {books.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-surface border border-border mt-1 rounded-md shadow-lg max-h-40 overflow-y-auto z-10">
                    {books.map(b => (
                      <div key={b.id} className="p-2 hover:bg-background cursor-pointer text-sm" onClick={() => setSelectedBook(b)}>
                        <div className="font-medium truncate">{b.title}</div>
                        <div className="text-textSecondary text-xs">{b.isbn}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 border border-border rounded-md bg-background flex justify-between items-center">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{selectedBook.title}</div>
                  <div className="text-xs text-textSecondary">Available: {selectedBook.available_copies}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedBook(null)}>Change</Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-textPrimary mb-1">Notes (Optional)</label>
          <textarea
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!selectedUser || !selectedBook || issueMutation.isPending} isLoading={issueMutation.isPending}>
            Issue Book
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IssueBookForm;
