import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useReturnBook } from '../../hooks/useTransactions';

interface ReturnBookFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any;
}

const ReturnBookForm: React.FC<ReturnBookFormProps> = ({ isOpen, onClose, transaction }) => {
  const returnMutation = useReturnBook();
  
  if (!transaction) return null;

  const dueDate = new Date(transaction.due_date);
  const now = new Date();
  const isOverdue = now > dueDate;
  const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24)) : 0;
  const fineAmount = daysOverdue * 2; // Assuming ₹2 per day

  const handleReturn = () => {
    returnMutation.mutate(transaction.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Return Book" size="md">
      <div className="space-y-4">
        <div className="p-4 bg-background rounded-lg border border-border">
          <h4 className="font-medium text-textPrimary mb-1">{transaction.book?.title}</h4>
          <p className="text-sm text-textSecondary mb-4">Borrowed by: {transaction.user?.full_name}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-textMuted">Issue Date:</span>
              <div className="font-medium">{new Date(transaction.issue_date).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-textMuted">Due Date:</span>
              <div className="font-medium">{dueDate.toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {isOverdue && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-danger text-sm">
            <div className="font-medium mb-1">Overdue by {daysOverdue} days</div>
            <div>Fine to be collected: <span className="font-bold">₹{fineAmount}</span></div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleReturn} isLoading={returnMutation.isPending}>
            Confirm Return
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReturnBookForm;
