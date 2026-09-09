import React, { useState } from 'react';
import ManageScheduleTab from '../../components/admin/ManageScheduleTab';
import { authService } from '../../services/authService';

export default function AdminSchedulePage() {
  const [currentUser] = useState(() => authService.getCurrentUser());

  return (
    <div className="space-y-6 animate-in fade-in">
      <ManageScheduleTab
        isAdmin={true}
        currentUser={currentUser}
      />
    </div>
  );
}
