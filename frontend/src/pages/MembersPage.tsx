import React, { useState } from 'react';
import { useUsers, useActivateUser, useDeactivateUser } from '../hooks/useUsers';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User } from '../types';
import { Search } from 'lucide-react';

const MembersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: usersData, isLoading } = useUsers({ search: searchTerm });
  const activate = useActivateUser();
  const deactivate = useDeactivateUser();

  const userList: User[] = Array.isArray(usersData) 
    ? usersData 
    : (usersData as any)?.items || [];

  const handleToggleStatus = (u: User) => {
    if (u.is_active) deactivate.mutate(String(u.id));
    else activate.mutate(String(u.id));
  };

  const columns = [
    {
      key: 'name',
      header: 'Member',
      render: (u: User) => (
        <div>
          <div className="font-medium text-ink">{u.full_name}</div>
          <div className="text-2xs text-ink-muted">{u.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (u: User) => (
        <Badge variant={u.role === 'ADMIN' ? 'warning' : u.role === 'LIBRARIAN' ? 'success' : 'neutral'}>
          {u.role}
        </Badge>
      )
    },
    {
      key: 'student_id',
      header: 'Student / Staff ID',
      render: (u: User) => (
        <span className="font-mono text-2xs text-ink-2">{u.student_id || '—'}</span>
      )
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (u: User) => (
        <Badge variant={u.is_active ? 'success' : 'danger'}>
          {u.is_active ? 'Active' : 'Suspended'}
        </Badge>
      )
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (u: User) => (
        <span className="text-2xs text-ink-muted">
          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u: User) => (
        <Button 
          variant={u.is_active ? 'outline' : 'primary'} 
          size="sm" 
          onClick={() => handleToggleStatus(u)}
          isLoading={activate.isPending || deactivate.isPending}
        >
          {u.is_active ? 'Suspend' : 'Activate'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="heading-page">Member Directory</h1>
        <p className="text-xs text-ink-muted mt-0.5">Manage student privileges, librarian staff accounts, and credentials.</p>
      </div>

      <div className="flex gap-3">
        <div className="w-72">
          <Input 
            placeholder="Search by name, email, or student ID..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            leftIcon={<Search className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <DataTable 
          columns={columns} 
          data={userList} 
          isLoading={isLoading} 
          keyExtractor={u => String(u.id)} 
        />
      </div>
    </div>
  );
};

export default MembersPage;
